<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\AppSetting;
use App\Models\Booking;
use App\Models\HousingProject;
use App\Models\Receipt;
use App\Models\User;
use App\Notifications\ReceiptStatusNotification;
use App\Services\ReceiptPdfService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Response;

class ReceiptController extends Controller
{
    /**
     * Display listing of receipts with role-based scoping.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isAgentOnly = $user->hasRole('sales_agent') && ! $user->hasRole(['superadmin', 'sales_manager', 'finance']);

        $query = Receipt::with([
            'booking:id,booking_code,housing_unit_id',
            'booking.unit:id,unit_code,cluster_id',
            'booking.unit.cluster:id,name,housing_project_id',
            'booking.unit.cluster.project:id,name',
            'lead:id,name,whatsapp,email',
            'submitter:id,name,email',
            'financeReviewer:id,name',
            'managerApprover:id,name',
        ]);

        $statsBase = Receipt::query();

        // RBAC: Sales Agent sees only their own receipts
        if ($isAgentOnly) {
            $query->where('submitted_by', $user->id);
            $statsBase->where('submitted_by', $user->id);
        }

        // Filters
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('payment_type') && $request->payment_type !== 'all') {
            $query->where('payment_type', $request->payment_type);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('receipt_number', 'ilike', "%{$search}%")
                    ->orWhere('finance_receipt_number', 'ilike', "%{$search}%")
                    ->orWhereHas('lead', function ($ql) use ($search) {
                        $ql->where('name', 'ilike', "%{$search}%")
                            ->orWhere('whatsapp', 'ilike', "%{$search}%");
                    })
                    ->orWhereHas('booking', function ($qb) use ($search) {
                        $qb->where('booking_code', 'ilike', "%{$search}%");
                    });
            });
        }

        // Stats
        $stats = [
            'total' => (clone $statsBase)->count(),
            'submitted' => (clone $statsBase)->where('status', Receipt::STATUS_SUBMITTED)->count(),
            'finance_review' => (clone $statsBase)->where('status', Receipt::STATUS_FINANCE_REVIEW)->count(),
            'finance_approved' => (clone $statsBase)->where('status', Receipt::STATUS_FINANCE_APPROVED)->count(),
            'manager_approved' => (clone $statsBase)->where('status', Receipt::STATUS_MANAGER_APPROVED)->count(),
            'rejected' => (clone $statsBase)->where('status', Receipt::STATUS_REJECTED)->count(),
        ];

        $receipts = $query->orderByDesc('created_at')->paginate(15)->withQueryString();

        // Bookings for dropdown (when creating receipt)
        $bookingsQuery = Booking::with([
            'lead:id,name,whatsapp',
            'unit:id,unit_code,cluster_id',
            'unit.cluster:id,name,housing_project_id',
            'unit.cluster.project:id,name',
        ])->whereIn('status', ['confirmed', 'completed']);

        if ($isAgentOnly) {
            $bookingsQuery->where('sales_id', $user->id);
        }

        $bookings = $bookingsQuery->orderByDesc('created_at')->get();

        return Inertia::render('Receipts/Index', [
            'receipts' => $receipts,
            'bookings' => $bookings,
            'stats' => $stats,
            'filters' => $request->only(['status', 'payment_type', 'search']),
        ]);
    }

    /**
     * Sales: Submit new receipt request.
     */
    public function store(Request $request): RedirectResponse
    {
        Gate::authorize('create-receipts');

        $validated = $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'payment_type' => 'required|in:booking_fee,dp,installment,pelunasan',
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'required|in:transfer_bank,cash,cheque',
            'bank_name' => 'nullable|string|max:80',
            'payment_date' => 'required|date',
            'transfer_proof' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'notes' => 'nullable|string|max:1000',
        ]);

        $booking = Booking::with('lead')->findOrFail($validated['booking_id']);

        // Upload transfer proof
        $proofPath = null;
        if ($request->hasFile('transfer_proof')) {
            $proofPath = $request->file('transfer_proof')->store('receipts/proofs', 'public');
        }

        $receipt = DB::transaction(function () use ($validated, $booking, $proofPath, $request) {
            $receipt = Receipt::create([
                'booking_id' => $booking->id,
                'lead_id' => $booking->lead_id,
                'payment_type' => $validated['payment_type'],
                'amount' => $validated['amount'],
                'payment_method' => $validated['payment_method'],
                'bank_name' => $validated['bank_name'] ?? null,
                'transfer_proof' => $proofPath,
                'payment_date' => $validated['payment_date'],
                'notes' => $validated['notes'] ?? null,
                'status' => Receipt::STATUS_SUBMITTED,
                'submitted_by' => $request->user()->id,
                'submitted_at' => now(),
            ]);

            // Log initial status
            $receipt->logStatusChange(null, Receipt::STATUS_SUBMITTED, $request->user()->id, 'Pengajuan kwitansi baru');

            // Activity log
            ActivityLog::record(
                'receipt_submitted',
                "Pengajuan kwitansi untuk booking {$booking->booking_code} - {$receipt->formatted_amount}",
                $receipt,
                ['booking_code' => $booking->booking_code, 'amount' => $receipt->amount]
            );

            return $receipt;
        });

        // Notify Finance users
        $this->notifyRole('finance', $receipt, 'submitted', 'Pengajuan kwitansi baru menunggu review');

        return redirect()->route('receipts.index')
            ->with('success', 'Pengajuan kwitansi berhasil disubmit! Menunggu review Finance.');
    }

    /**
     * Finance: Review receipt and add official receipt number.
     */
    public function reviewByFinance(Request $request, Receipt $receipt): RedirectResponse
    {
        Gate::authorize('review-receipts');

        if (! in_array($receipt->status, [Receipt::STATUS_SUBMITTED, Receipt::STATUS_FINANCE_REVIEW])) {
            return back()->with('error', 'Kwitansi ini tidak dalam status yang bisa di-review.');
        }

        $validated = $request->validate([
            'finance_receipt_number' => 'required|string|max:80|unique:receipts,finance_receipt_number,'.$receipt->id,
            'finance_notes' => 'nullable|string|max:1000',
        ]);

        DB::transaction(function () use ($receipt, $validated, $request) {
            $oldStatus = $receipt->status;

            $receipt->update([
                'finance_receipt_number' => $validated['finance_receipt_number'],
                'finance_notes' => $validated['finance_notes'] ?? null,
                'reviewed_by_finance_id' => $request->user()->id,
                'reviewed_by_finance_at' => now(),
                'status' => Receipt::STATUS_FINANCE_APPROVED,
            ]);

            $receipt->logStatusChange(
                $oldStatus,
                Receipt::STATUS_FINANCE_APPROVED,
                $request->user()->id,
                'Disetujui Finance. Nomor kwitansi: '.$validated['finance_receipt_number']
            );

            ActivityLog::record(
                'receipt_finance_approved',
                "Kwitansi {$validated['finance_receipt_number']} disetujui oleh Finance",
                $receipt,
                ['finance_receipt_number' => $validated['finance_receipt_number']]
            );
        });

        // Notify Manager (sales_manager role)
        $this->notifyRole('sales_manager', $receipt, 'finance_approved', 'Kwitansi menunggu approval Manager');

        return back()->with('success', 'Kwitansi berhasil di-review! Menunggu approval Manager.');
    }

    /**
     * Manager: Final approval → auto-generate QR code + PDF.
     */
    public function approveByManager(Request $request, Receipt $receipt): RedirectResponse
    {
        Gate::authorize('approve-receipts');

        if ($receipt->status !== Receipt::STATUS_FINANCE_APPROVED) {
            return back()->with('error', 'Kwitansi belum di-review Finance.');
        }

        DB::transaction(function () use ($receipt, $request) {
            $oldStatus = $receipt->status;

            // Generate receipt number if not set by finance
            $receiptNumber = $receipt->finance_receipt_number ?? Receipt::generateReceiptNumber();

            // Generate QR code URL
            $verifyUrl = route('receipts.verify', $receipt->qr_code_token);

            $receipt->update([
                'receipt_number' => $receiptNumber,
                'approved_by_manager_id' => $request->user()->id,
                'approved_by_manager_at' => now(),
                'status' => Receipt::STATUS_MANAGER_APPROVED,
                'qr_code_url' => $verifyUrl,
            ]);

            // Generate PDF
            try {
                $pdfService = app(ReceiptPdfService::class);
                $pdfPath = $pdfService->generate($receipt->fresh([
                    'booking.lead',
                    'booking.unit.cluster.project',
                    'submitter',
                    'financeReviewer',
                    'managerApprover',
                ]));

                $receipt->update(['pdf_path' => $pdfPath]);
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::error('Receipt PDF generation failed: '.$e->getMessage());
            }

            $receipt->logStatusChange(
                $oldStatus,
                Receipt::STATUS_MANAGER_APPROVED,
                $request->user()->id,
                'Disetujui Manager. PDF & QR Code telah di-generate.'
            );

            ActivityLog::record(
                'receipt_manager_approved',
                "Kwitansi {$receiptNumber} disetujui final oleh Manager",
                $receipt,
                ['receipt_number' => $receiptNumber]
            );
        });

        // Notify submitter (Sales) and Finance
        $this->notifyUser($receipt->submitted_by, $receipt, 'manager_approved', 'Kwitansi Anda telah disetujui Manager!');
        $this->notifyRole('finance', $receipt, 'manager_approved', 'Kwitansi telah mendapat approval Manager');

        return back()->with('success', 'Kwitansi disetujui! PDF & QR Code berhasil di-generate.');
    }

    /**
     * Finance/Manager: Reject receipt with reason.
     */
    public function reject(Request $request, Receipt $receipt): RedirectResponse
    {
        $user = $request->user();

        if (! $user->hasRole(['superadmin', 'sales_manager', 'finance'])) {
            abort(403, 'Unauthorized');
        }

        if (in_array($receipt->status, [Receipt::STATUS_MANAGER_APPROVED, Receipt::STATUS_REJECTED])) {
            return back()->with('error', 'Kwitansi ini tidak bisa ditolak.');
        }

        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:1000',
        ]);

        DB::transaction(function () use ($receipt, $validated, $user) {
            $oldStatus = $receipt->status;

            $receipt->update([
                'status' => Receipt::STATUS_REJECTED,
                'rejection_reason' => $validated['rejection_reason'],
                'rejected_by' => $user->id,
                'rejected_at' => now(),
            ]);

            $receipt->logStatusChange(
                $oldStatus,
                Receipt::STATUS_REJECTED,
                $user->id,
                'Ditolak: '.$validated['rejection_reason']
            );

            ActivityLog::record(
                'receipt_rejected',
                "Kwitansi ditolak. Alasan: {$validated['rejection_reason']}",
                $receipt,
                ['rejection_reason' => $validated['rejection_reason']]
            );
        });

        // Notify submitter
        $this->notifyUser($receipt->submitted_by, $receipt, 'rejected', 'Kwitansi Anda ditolak: '.$validated['rejection_reason']);

        return back()->with('success', 'Kwitansi berhasil ditolak.');
    }

    /**
     * Download generated receipt PDF.
     */
    public function downloadPdf(Receipt $receipt)
    {
        if (! $receipt->pdf_path || ! \Illuminate\Support\Facades\Storage::disk('public')->exists($receipt->pdf_path)) {
            return back()->with('error', 'PDF belum tersedia untuk kwitansi ini.');
        }

        $safeReceiptNumber = str_replace(['/', '\\'], '-', $receipt->receipt_number ?? 'receipt-'.$receipt->id);
        $filename = "Kwitansi-{$safeReceiptNumber}.pdf";

        return \Illuminate\Support\Facades\Storage::disk('public')->download($receipt->pdf_path, $filename);
    }

    /**
     * Public: Verify receipt QR code (no authentication required).
     */
    public function verify(string $token): Response
    {
        $receipt = Receipt::with([
            'booking:id,booking_code',
            'lead:id,name',
            'submitter:id,name',
            'financeReviewer:id,name',
            'managerApprover:id,name',
        ])->where('qr_code_token', $token)->first();

        return Inertia::render('Receipts/Verify', [
            'receipt' => $receipt,
            'is_valid' => $receipt && $receipt->status === Receipt::STATUS_MANAGER_APPROVED,
            'token' => $token,
        ]);
    }

    /**
     * Get receipt detail with status logs for dialog.
     */
    public function show(Receipt $receipt)
    {
        $receipt->load([
            'booking.lead',
            'booking.unit.cluster.project',
            'submitter:id,name,email',
            'financeReviewer:id,name',
            'managerApprover:id,name',
            'rejectedByUser:id,name',
            'statusLogs.changedByUser:id,name',
        ]);

        return response()->json($receipt);
    }

    // ──────────────────────────────
    // Private Helpers
    // ──────────────────────────────

    /**
     * Send notification to all users with a specific role.
     */
    private function notifyRole(string $role, Receipt $receipt, string $status, string $message): void
    {
        try {
            $users = User::role($role)->where('is_active', true)->get();
            Notification::send($users, new ReceiptStatusNotification($receipt, $status, $message));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Receipt notification error: '.$e->getMessage());
        }
    }

    /**
     * Send notification to a specific user.
     */
    private function notifyUser(int $userId, Receipt $receipt, string $status, string $message): void
    {
        try {
            $user = User::find($userId);
            if ($user) {
                $user->notify(new ReceiptStatusNotification($receipt, $status, $message));
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Receipt notification error: '.$e->getMessage());
        }
    }
}
