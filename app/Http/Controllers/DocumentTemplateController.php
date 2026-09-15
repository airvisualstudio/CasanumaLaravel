<?php

namespace App\Http\Controllers;

use App\Models\AppSetting;
use App\Models\Booking;
use App\Models\DocumentTemplate;
use App\Models\HousingUnit;
use App\Models\Lead;
use App\Models\Receipt;
use App\Services\DocumentTemplateRenderer;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class DocumentTemplateController extends Controller
{
    protected DocumentTemplateRenderer $renderer;

    public function __construct(DocumentTemplateRenderer $renderer)
    {
        $this->renderer = $renderer;
    }

    /**
     * Display a listing of document templates.
     */
    public function index(Request $request): Response
    {
        $query = DocumentTemplate::with(['creator:id,name', 'updater:id,name']);

        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('description', 'ilike', "%{$search}%");
            });
        }

        $templates = $query->orderBy('category')
            ->orderBy('name')
            ->get();

        $stats = [
            'total' => DocumentTemplate::count(),
            'receipt' => DocumentTemplate::where('category', 'receipt')->count(),
            'spr' => DocumentTemplate::where('category', 'spr')->count(),
            'ppjb' => DocumentTemplate::where('category', 'ppjb')->count(),
            'bast' => DocumentTemplate::where('category', 'bast')->count(),
            'official_letter' => DocumentTemplate::where('category', 'official_letter')->count(),
            'custom' => DocumentTemplate::where('category', 'custom')->count(),
        ];

        return Inertia::render('Documents/Index', [
            'templates' => $templates,
            'filters' => [
                'category' => $request->input('category', 'all'),
                'search' => $request->input('search', ''),
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Show the form for creating a new document template.
     */
    public function create(Request $request): Response
    {
        $initialTemplate = null;

        if ($request->filled('from_id')) {
            $source = DocumentTemplate::find($request->from_id);
            if ($source) {
                $initialTemplate = $source->toArray();
                unset($initialTemplate['id'], $initialTemplate['created_at'], $initialTemplate['updated_at']);
                $initialTemplate['name'] = $source->name . ' (Salinan)';
                $initialTemplate['is_default'] = false;
            }
        }

        return Inertia::render('Documents/Editor', [
            'template' => $initialTemplate,
            'availableTokens' => $this->renderer->getAvailableTokens(),
            'sampleDictionary' => $this->renderer->getSampleDictionary(),
            'paperSizes' => DocumentTemplate::SIZES_MM,
            'recentBookings' => Booking::with([
                'lead:id,name,phone,whatsapp,email,city,nik',
                'unit:id,unit_code,cluster_id,surface_area,building_area,base_price',
                'unit.cluster:id,name,housing_project_id',
                'unit.cluster.project:id,name,city,address',
                'salesAgent:id,name,email,phone',
            ])->latest()->take(10)->get(),
        ]);
    }

    /**
     * Store a newly created document template in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateTemplate($request);

        if ($request->hasFile('letterhead_logo')) {
            $path = $request->file('letterhead_logo')->store('document_templates/logos', 'public');
            $validated['letterhead_logo'] = $path;
        }

        if ($request->hasFile('letterhead_image')) {
            $path = $request->file('letterhead_image')->store('document_templates/headers', 'public');
            $validated['letterhead_image'] = $path;
        }

        $validated['created_by'] = Auth::id();
        $validated['updated_by'] = Auth::id();

        // If marked as default for this category, unmark other defaults in the same category
        if (! empty($validated['is_default'])) {
            DocumentTemplate::where('category', $validated['category'])
                ->update(['is_default' => false]);
        }

        $template = DocumentTemplate::create($validated);

        return redirect()->route('document-templates.index')
            ->with('success', "Template \"{$template->name}\" berhasil disimpan!");
    }

    /**
     * Show the form for editing the specified document template.
     */
    public function edit(DocumentTemplate $documentTemplate): Response
    {
        return Inertia::render('Documents/Editor', [
            'template' => $documentTemplate,
            'availableTokens' => $this->renderer->getAvailableTokens(),
            'sampleDictionary' => $this->renderer->getSampleDictionary(),
            'paperSizes' => DocumentTemplate::SIZES_MM,
            'recentBookings' => Booking::with([
                'lead:id,name,phone,whatsapp,email,city,nik',
                'unit:id,unit_code,cluster_id,surface_area,building_area,base_price',
                'unit.cluster:id,name,housing_project_id',
                'unit.cluster.project:id,name,city,address',
                'salesAgent:id,name,email,phone',
            ])->latest()->take(10)->get(),
        ]);
    }

    /**
     * Update the specified document template in storage.
     */
    public function update(Request $request, DocumentTemplate $documentTemplate): RedirectResponse
    {
        $validated = $this->validateTemplate($request, $documentTemplate->id);

        if ($request->hasFile('letterhead_logo')) {
            if ($documentTemplate->letterhead_logo) {
                Storage::disk('public')->delete($documentTemplate->letterhead_logo);
            }
            $path = $request->file('letterhead_logo')->store('document_templates/logos', 'public');
            $validated['letterhead_logo'] = $path;
        } elseif ($request->boolean('remove_letterhead_logo')) {
            if ($documentTemplate->letterhead_logo) {
                Storage::disk('public')->delete($documentTemplate->letterhead_logo);
            }
            $validated['letterhead_logo'] = null;
        }

        if ($request->hasFile('letterhead_image')) {
            if ($documentTemplate->letterhead_image) {
                Storage::disk('public')->delete($documentTemplate->letterhead_image);
            }
            $path = $request->file('letterhead_image')->store('document_templates/headers', 'public');
            $validated['letterhead_image'] = $path;
        } elseif ($request->boolean('remove_letterhead_image')) {
            if ($documentTemplate->letterhead_image) {
                Storage::disk('public')->delete($documentTemplate->letterhead_image);
            }
            $validated['letterhead_image'] = null;
        }

        $validated['updated_by'] = Auth::id();

        if (! empty($validated['is_default'])) {
            DocumentTemplate::where('category', $validated['category'])
                ->where('id', '!=', $documentTemplate->id)
                ->update(['is_default' => false]);
        }

        $documentTemplate->update($validated);

        return redirect()->route('document-templates.index')
            ->with('success', "Template \"{$documentTemplate->name}\" berhasil diperbarui!");
    }

    /**
     * Remove the specified document template from storage.
     */
    public function destroy(DocumentTemplate $documentTemplate): RedirectResponse
    {
        $name = $documentTemplate->name;
        $documentTemplate->delete();

        return redirect()->route('document-templates.index')
            ->with('success', "Template \"{$name}\" berhasil dihapus.");
    }

    /**
     * Render live preview with real or sample data.
     */
    public function preview(Request $request): JsonResponse
    {
        $request->validate([
            'content_html' => 'required|string',
            'booking_id' => 'nullable|exists:bookings,id',
            'receipt_id' => 'nullable|exists:receipts,id',
            'lead_id' => 'nullable|exists:leads,id',
        ]);

        $booking = $request->filled('booking_id')
            ? Booking::with(['lead', 'unit.cluster.project', 'salesAgent'])->find($request->booking_id)
            : null;

        $receipt = $request->filled('receipt_id')
            ? Receipt::find($request->receipt_id)
            : null;

        $lead = $request->filled('lead_id')
            ? Lead::find($request->lead_id)
            : ($booking?->lead);

        $dictionary = $this->renderer->buildDictionary($booking, $receipt, $lead, Auth::user());
        $renderedHtml = $this->renderer->renderHtml($request->content_html, $dictionary);

        return response()->json([
            'rendered_html' => $renderedHtml,
            'dictionary' => $dictionary,
        ]);
    }

    /**
     * Export template as PDF with dynamic dimensions and letterhead.
     */
    public function exportPdf(Request $request, DocumentTemplate $documentTemplate): HttpResponse
    {
        $booking = $request->filled('booking_id')
            ? Booking::with(['lead', 'unit.cluster.project', 'salesAgent'])->find($request->booking_id)
            : null;

        $receipt = $request->filled('receipt_id')
            ? Receipt::find($request->receipt_id)
            : null;

        $lead = $request->filled('lead_id')
            ? Lead::find($request->lead_id)
            : ($booking?->lead);

        $dictionary = $this->renderer->buildDictionary($booking, $receipt, $lead, Auth::user());
        $renderedBody = $this->renderer->renderHtml($documentTemplate->content_html, $dictionary);

        $settings = [
            'company_name' => AppSetting::get('company_name', 'PT Casanuma Modern Living'),
            'company_address' => AppSetting::get('company_address', 'Kawasan Residensial & Komersial Terpadu Bandung, Jawa Barat'),
            'company_phone' => AppSetting::get('company_phone', '(022) 8765-4321'),
            'company_email' => AppSetting::get('company_email', 'info@casanuma.com'),
            'app_name' => AppSetting::get('app_name', 'CASANUMA CRM'),
        ];

        // Prepare Base64 Logo for DomPDF
        $logoBase64 = null;
        if ($documentTemplate->letterhead_mode === 'default_company') {
            $logoPath = AppSetting::get('receipt_letterhead_logo') ?? AppSetting::get('logo_light');
            if ($logoPath && Storage::disk('public')->exists($logoPath)) {
                $logoContent = Storage::disk('public')->get($logoPath);
                $mimeType = Storage::disk('public')->mimeType($logoPath);
                $logoBase64 = 'data:'.$mimeType.';base64,'.base64_encode($logoContent);
            }
        } elseif ($documentTemplate->letterhead_mode === 'custom_builder' && $documentTemplate->letterhead_logo) {
            if (Storage::disk('public')->exists($documentTemplate->letterhead_logo)) {
                $logoContent = Storage::disk('public')->get($documentTemplate->letterhead_logo);
                $mimeType = Storage::disk('public')->mimeType($documentTemplate->letterhead_logo);
                $logoBase64 = 'data:'.$mimeType.';base64,'.base64_encode($logoContent);
            }
        }

        // Prepare Base64 Image Banner for DomPDF
        $letterheadImageBase64 = null;
        if ($documentTemplate->letterhead_mode === 'custom_image' && $documentTemplate->letterhead_image) {
            if (Storage::disk('public')->exists($documentTemplate->letterhead_image)) {
                $imgContent = Storage::disk('public')->get($documentTemplate->letterhead_image);
                $mimeType = Storage::disk('public')->mimeType($documentTemplate->letterhead_image);
                $letterheadImageBase64 = 'data:'.$mimeType.';base64,'.base64_encode($imgContent);
            }
        }

        $pdf = Pdf::loadView('pdf.custom_document', [
            'template' => $documentTemplate,
            'renderedHtml' => $renderedBody,
            'renderedBody' => $renderedBody,
            'settings' => $settings,
            'logoBase64' => $logoBase64,
            'letterheadImageBase64' => $letterheadImageBase64,
            'dictionary' => $dictionary,
            'dimensionsMm' => $documentTemplate->dimensions_mm,
        ]);

        // Configure paper size in points (1 mm = 2.83465 pt)
        $wPt = $documentTemplate->dimensions_mm['width'] * 2.83465;
        $hPt = $documentTemplate->dimensions_mm['height'] * 2.83465;
        $pdf->setPaper([0, 0, $wPt, $hPt], $documentTemplate->orientation);

        $filename = Str::slug($documentTemplate->name) . '-' . date('Ymd-His') . '.pdf';

        return $pdf->stream($filename);
    }

    /**
     * Validate template input fields.
     */
    protected function validateTemplate(Request $request, ?int $templateId = null): array
    {
        return $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|in:receipt,spr,ppjb,bast,official_letter,custom',
            'description' => 'nullable|string|max:1000',
            'paper_size' => 'required|string|in:a4,f4,letter,legal,custom',
            'custom_width_mm' => 'nullable|required_if:paper_size,custom|integer|min:50|max:500',
            'custom_height_mm' => 'nullable|required_if:paper_size,custom|integer|min:50|max:500',
            'orientation' => 'required|string|in:portrait,landscape',
            'margin_top_mm' => 'required|integer|min:0|max:100',
            'margin_bottom_mm' => 'required|integer|min:0|max:100',
            'margin_left_mm' => 'required|integer|min:0|max:100',
            'margin_right_mm' => 'required|integer|min:0|max:100',
            'letterhead_mode' => 'required|string|in:default_company,custom_builder,custom_image,none',
            'letterhead_logo' => 'nullable|image|max:2048',
            'letterhead_title' => 'nullable|string|max:255',
            'letterhead_subtitle' => 'nullable|string|max:255',
            'letterhead_address' => 'nullable|string|max:500',
            'letterhead_contact' => 'nullable|string|max:255',
            'letterhead_image' => 'nullable|image|max:3072',
            'content_html' => 'required|string',
            'footer_text' => 'nullable|string|max:500',
            'is_default' => 'nullable|boolean',
        ]);
    }
}
