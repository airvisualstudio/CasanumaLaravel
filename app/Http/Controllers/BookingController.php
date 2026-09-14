<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\HousingProject;
use App\Models\HousingUnit;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function index(Request $request): Response
    {
        $projects = HousingProject::orderBy('name')->get(['id', 'name']);

        $query = Booking::with([
            'lead:id,name,whatsapp,email,housing_project_id',
            'unit.cluster.project:id,name',
            'unit.unitType:id,name,surface_area,building_area',
            'sales:id,name,email',
        ]);

        if ($request->filled('project_id') && $request->project_id !== 'all') {
            $query->whereHas('unit.cluster', function ($q) use ($request) {
                $q->where('housing_project_id', $request->project_id);
            });
        }

        if ($request->filled('payment_scheme') && $request->payment_scheme !== 'all') {
            $query->where('payment_scheme', $request->payment_scheme);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('booking_code', 'ilike', "%{$search}%")
                  ->orWhereHas('lead', function ($ql) use ($search) {
                      $ql->where('name', 'ilike', "%{$search}%")
                         ->orWhere('whatsapp', 'ilike', "%{$search}%");
                  })
                  ->orWhereHas('unit', function ($qu) use ($search) {
                      $qu->where('unit_code', 'ilike', "%{$search}%");
                  });
            });
        }

        $bookings = $query->orderBy('id', 'desc')->paginate(15)->withQueryString();

        // Summary Stats
        $stats = [
            'total' => Booking::where('status', 'confirmed')->count(),
            'total_fee' => Booking::where('status', 'confirmed')->sum('booking_fee'),
            'kpr_count' => Booking::where('status', 'confirmed')->where('payment_scheme', 'kpr')->count(),
            'cash_count' => Booking::where('status', 'confirmed')->where('payment_scheme', 'cash')->count(),
            'cash_bertahap_count' => Booking::where('status', 'confirmed')->where('payment_scheme', 'cash_bertahap')->count(),
        ];

        // Available units for modal booking creation
        $availableUnits = HousingUnit::where('status', 'available')
            ->with(['cluster.project:id,name', 'unitType:id,name'])
            ->orderBy('block')
            ->orderBy('unit_number')
            ->get(['id', 'cluster_id', 'unit_type_id', 'block', 'unit_number', 'unit_code', 'base_price', 'svg_element_id']);

        // Active leads eligible for booking
        $leads = Lead::orderBy('name')->get(['id', 'name', 'whatsapp', 'housing_project_id']);

        $salesUsers = User::role(['sales_agent', 'sales_manager', 'superadmin'])
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('Bookings/Index', [
            'bookings' => $bookings,
            'projects' => $projects,
            'availableUnits' => $availableUnits,
            'leads' => $leads,
            'salesUsers' => $salesUsers,
            'stats' => $stats,
            'filters' => $request->only(['search', 'project_id', 'payment_scheme', 'status']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'lead_id' => 'required|exists:leads,id',
            'housing_unit_id' => 'required|exists:housing_units,id',
            'sales_id' => 'nullable|exists:users,id',
            'payment_scheme' => 'required|in:cash,kpr,cash_bertahap',
            'booking_fee' => 'required|numeric|min:100000',
            'transaction_date' => 'required|date',
            'transfer_proof' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'notes' => 'nullable|string',
        ]);

        $unit = HousingUnit::findOrFail($validated['housing_unit_id']);
        if ($unit->status !== 'available') {
            return redirect()->back()->with('error', "Unit {$unit->unit_code} tidak tersedia (status saat ini: {$unit->status}).");
        }

        DB::transaction(function () use ($request, $validated, $unit) {
            // Generate unique booking code
            $code = 'BK-' . date('Ym') . '-' . str_pad((string) (Booking::count() + 1), 4, '0', STR_PAD_LEFT);
            $validated['booking_code'] = $code;

            if ($request->hasFile('transfer_proof')) {
                $path = $request->file('transfer_proof')->store('transfer_proofs', 'public');
                $validated['transfer_proof'] = $path;
            }

            if (empty($validated['sales_id']) && $request->user()->hasRole('sales_agent')) {
                $validated['sales_id'] = $request->user()->id;
            }

            $validated['status'] = 'confirmed';

            $booking = Booking::create($validated);

            // 1. Update Unit status to 'booked'
            $unit->update(['status' => 'booked']);

            // 2. Update Lead pipeline stage to 'booking'
            Lead::where('id', $validated['lead_id'])->update(['status' => 'booking']);
        });

        return redirect()->back()->with('success', "Transaksi Booking berhasil dicatat! Status unit {$unit->unit_code} kini telah menjadi BOOKED.");
    }

    public function cancel(Booking $booking): RedirectResponse
    {
        DB::transaction(function () use ($booking) {
            $booking->update(['status' => 'cancelled']);

            // Restore unit to available
            if ($booking->unit) {
                $booking->unit->update(['status' => 'available']);
            }
        });

        return redirect()->back()->with('success', "Booking {$booking->booking_code} telah dibatalkan, unit telah dikembalikan menjadi Available.");
    }
}
