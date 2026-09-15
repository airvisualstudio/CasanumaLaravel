<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\CustomerDocument;
use App\Models\Lead;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CustomerDocumentController extends Controller
{
    /**
     * Get all documents for a specific lead.
     */
    public function index(Request $request, Lead $lead): JsonResponse
    {
        $user = $request->user();
        $isAgentOnly = $user->hasRole('sales_agent') && ! $user->hasRole(['superadmin', 'sales_manager', 'finance']);

        if ($isAgentOnly && $lead->sales_id !== $user->id) {
            return response()->json(['message' => 'Anda tidak memiliki hak akses ke dokumen konsumen ini.'], 403);
        }

        $documents = $lead->customerDocuments()
            ->with([
                'uploader:id,name,email',
                'verifier:id,name,email',
            ])
            ->orderBy('id', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'lead' => [
                'id' => $lead->id,
                'name' => $lead->name,
                'whatsapp' => $lead->whatsapp,
                'project_name' => $lead->project?->name,
            ],
            'slots' => CustomerDocument::getDocumentTypeLabels(),
            'documents' => $documents,
        ]);
    }

    /**
     * Upload or replace a customer document in private storage.
     */
    public function store(Request $request, Lead $lead): JsonResponse|RedirectResponse
    {
        $user = $request->user();
        $isAgentOnly = $user->hasRole('sales_agent') && ! $user->hasRole(['superadmin', 'sales_manager', 'finance']);

        if ($isAgentOnly && $lead->sales_id !== $user->id) {
            abort(403, 'Anda tidak memiliki izin mengunggah berkas untuk konsumen ini.');
        }

        $validated = $request->validate([
            'document_type' => 'required|string|in:ktp,kk,npwp,buku_nikah,slip_gaji,rek_koran',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png,webp|max:10240', // Max 10MB
            'booking_id' => 'nullable|exists:bookings,id',
        ]);

        $uploadedFile = $request->file('file');
        $originalFileName = $uploadedFile->getClientOriginalName();
        $mimeType = $uploadedFile->getMimeType() ?: 'application/octet-stream';
        $fileSize = $uploadedFile->getSize();

        // Store file securely in local disk (storage/app/private/customer_documents/{lead_id})
        $storageDir = 'customer_documents/'.$lead->id;
        $filePath = $uploadedFile->store($storageDir, 'local');

        // Check if a document already exists for this slot
        $existing = $lead->customerDocuments()
            ->where('document_type', $validated['document_type'])
            ->first();

        if ($existing) {
            // Delete previous private file if present
            if ($existing->file_path && Storage::disk('local')->exists($existing->file_path)) {
                Storage::disk('local')->delete($existing->file_path);
            }

            $existing->update([
                'file_path' => $filePath,
                'file_name' => $originalFileName,
                'file_size' => $fileSize,
                'mime_type' => $mimeType,
                'status' => 'pending',
                'rejection_reason' => null,
                'booking_id' => $validated['booking_id'] ?? $existing->booking_id,
                'uploaded_by' => $user->id,
                'verified_by' => null,
                'verified_at' => null,
            ]);

            $document = $existing;
        } else {
            $document = CustomerDocument::create([
                'lead_id' => $lead->id,
                'booking_id' => $validated['booking_id'] ?? null,
                'document_type' => $validated['document_type'],
                'file_path' => $filePath,
                'file_name' => $originalFileName,
                'file_size' => $fileSize,
                'mime_type' => $mimeType,
                'status' => 'pending',
                'uploaded_by' => $user->id,
            ]);
        }

        $document->load(['uploader:id,name', 'verifier:id,name']);

        // Record Audit Trail
        ActivityLog::record(
            'upload_customer_document',
            "Mengunggah berkas {$document->document_type_label} ({$originalFileName}) untuk konsumen {$lead->name}.",
            $document,
            [
                'lead_id' => $lead->id,
                'document_type' => $document->document_type,
                'file_name' => $originalFileName,
                'file_size' => $fileSize,
            ]
        );

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => "Berkas {$document->document_type_label} berhasil diunggah.",
                'document' => $document,
            ]);
        }

        return back()->with('success', "Berkas {$document->document_type_label} berhasil diunggah.");
    }

    /**
     * Stream private document inline for modal preview.
     */
    public function preview(Request $request, CustomerDocument $customerDocument): BinaryFileResponse
    {
        $this->authorizeDocumentAccess($request->user(), $customerDocument);

        if (! Storage::disk('local')->exists($customerDocument->file_path)) {
            abort(404, 'File dokumen tidak ditemukan pada private storage.');
        }

        $fullPath = Storage::disk('local')->path($customerDocument->file_path);

        return response()->file($fullPath, [
            'Content-Type' => $customerDocument->mime_type,
            'Content-Disposition' => 'inline; filename="'.addslashes($customerDocument->file_name).'"',
            'X-Content-Type-Options' => 'nosniff',
            'Cache-Control' => 'private, no-cache, no-store, must-revalidate',
        ]);
    }

    /**
     * Download document from private storage.
     */
    public function download(Request $request, CustomerDocument $customerDocument): StreamedResponse
    {
        $this->authorizeDocumentAccess($request->user(), $customerDocument);

        if (! Storage::disk('local')->exists($customerDocument->file_path)) {
            abort(404, 'File dokumen tidak ditemukan pada private storage.');
        }

        return Storage::disk('local')->download($customerDocument->file_path, $customerDocument->file_name);
    }

    /**
     * Update validation status (Pending, Verified, Rejected).
     */
    public function updateStatus(Request $request, CustomerDocument $customerDocument): JsonResponse|RedirectResponse
    {
        $user = $request->user();

        // RBAC validation: Only superadmin, sales_manager, and finance
        if (! $user->hasAnyRole(['superadmin', 'sales_manager', 'finance'])) {
            abort(403, 'Hanya Finance, Sales Manager, atau Superadmin yang memiliki otoritas memvalidasi berkas konsumen.');
        }

        $validated = $request->validate([
            'status' => 'required|string|in:pending,verified,rejected',
            'rejection_reason' => 'nullable|required_if:status,rejected|string|max:500',
        ]);

        $newStatus = $validated['status'];
        $rejectionReason = $newStatus === 'rejected' ? $validated['rejection_reason'] : null;

        $customerDocument->update([
            'status' => $newStatus,
            'rejection_reason' => $rejectionReason,
            'verified_by' => $newStatus !== 'pending' ? $user->id : null,
            'verified_at' => $newStatus !== 'pending' ? now() : null,
        ]);

        $customerDocument->load(['uploader:id,name', 'verifier:id,name']);

        $statusText = match ($newStatus) {
            'verified' => 'Diverifikasi (Valid)',
            'rejected' => 'Ditolak',
            default => 'Pending (Menunggu Verifikasi)',
        };

        // Record Audit Trail
        ActivityLog::record(
            'verify_customer_document',
            "Validasi berkas {$customerDocument->document_type_label} milik {$customerDocument->lead->name} diubah menjadi {$statusText} oleh {$user->name}.".($rejectionReason ? " Alasan: {$rejectionReason}" : ''),
            $customerDocument,
            [
                'lead_id' => $customerDocument->lead_id,
                'document_type' => $customerDocument->document_type,
                'status' => $newStatus,
                'rejection_reason' => $rejectionReason,
            ]
        );

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => "Status berkas {$customerDocument->document_type_label} berhasil diubah menjadi {$statusText}.",
                'document' => $customerDocument,
            ]);
        }

        return back()->with('success', "Status berkas {$customerDocument->document_type_label} berhasil diubah.");
    }

    /**
     * Delete document from private storage & database.
     */
    public function destroy(Request $request, CustomerDocument $customerDocument): JsonResponse|RedirectResponse
    {
        $this->authorizeDocumentAccess($request->user(), $customerDocument);

        // Delete file from local private disk
        if ($customerDocument->file_path && Storage::disk('local')->exists($customerDocument->file_path)) {
            Storage::disk('local')->delete($customerDocument->file_path);
        }

        $docLabel = $customerDocument->document_type_label;
        $leadName = $customerDocument->lead->name;

        // Record Audit Log
        ActivityLog::record(
            'delete_customer_document',
            "Menghapus berkas {$docLabel} milik konsumen {$leadName}.",
            null,
            [
                'lead_id' => $customerDocument->lead_id,
                'document_type' => $customerDocument->document_type,
                'file_name' => $customerDocument->file_name,
            ]
        );

        $customerDocument->delete();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => "Berkas {$docLabel} berhasil dihapus.",
            ]);
        }

        return back()->with('success', "Berkas {$docLabel} berhasil dihapus.");
    }

    /**
     * Authorize user access to document.
     */
    private function authorizeDocumentAccess($user, CustomerDocument $customerDocument): void
    {
        $isAgentOnly = $user->hasRole('sales_agent') && ! $user->hasRole(['superadmin', 'sales_manager', 'finance']);

        if ($isAgentOnly && $customerDocument->lead->sales_id !== $user->id) {
            abort(403, 'Akses berkas konsumen ditolak.');
        }
    }
}
