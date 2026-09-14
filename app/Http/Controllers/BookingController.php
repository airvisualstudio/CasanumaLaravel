<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Booking;
use App\Models\BookingPayment;
use App\Models\HousingProject;
use App\Models\HousingUnit;
use App\Models\KprApplication;
use App\Models\Lead;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function index(Request $request): Response
    {
        $projects = HousingProject::orderBy('name')->get(['id', 'name']);

        $query = Booking::with([
            'lead',
            'unit.cluster.project:id,name',
            'unit.unitType:id,name,surface_area,building_area',
            'sales:id,name,email',
            'approvedByManager:id,name',
            'approvedByFinance:id,name',
            'payments.verifier:id,name',
            'kprApplication',
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
                    ->orWhere('spr_number', 'ilike', "%{$search}%")
                    ->orWhereHas('lead', function ($ql) use ($search) {
                        $ql->where('name', 'ilike', "%{$search}%")
                            ->orWhere('whatsapp', 'ilike', "%{$search}%")
                            ->orWhere('nik', 'ilike', "%{$search}%");
                    })
                    ->orWhereHas('unit', function ($qu) use ($search) {
                        $qu->where('unit_code', 'ilike', "%{$search}%");
                    });
            });
        }

        $bookings = $query->orderBy('id', 'desc')->paginate(15)->withQueryString();

        // Summary Stats
        $stats = [
            'total' => Booking::whereNotIn('status', ['cancelled'])->count(),
            'pending_approval' => Booking::where('status', 'pending_approval')->count(),
            'total_fee' => (float) Booking::whereNotIn('status', ['cancelled'])->sum('booking_fee'),
            'total_turnover' => (float) Booking::whereIn('status', ['approved', 'in_payment', 'kpr_process', 'ready_for_akad', 'completed'])->sum('total_price'),
            'kpr_count' => Booking::whereNotIn('status', ['cancelled'])->where('payment_scheme', 'kpr')->count(),
            'cash_count' => Booking::whereNotIn('status', ['cancelled'])->where('payment_scheme', 'cash')->count(),
            'cash_bertahap_count' => Booking::whereNotIn('status', ['cancelled'])->where('payment_scheme', 'cash_bertahap')->count(),
            'pending_payments_count' => BookingPayment::where('status', 'pending_verification')->count(),
        ];

        // Available units for modal booking creation
        $availableUnits = HousingUnit::where('status', 'available')
            ->with(['cluster.project:id,name', 'unitType:id,name,surface_area,building_area'])
            ->orderBy('block')
            ->orderBy('unit_number')
            ->get(['id', 'cluster_id', 'unit_type_id', 'block', 'unit_number', 'unit_code', 'base_price']);

        // Active leads eligible for booking
        $leads = Lead::orderBy('name')->get([
            'id', 'name', 'whatsapp', 'email', 'housing_project_id', 'nik', 'npwp', 'job_type', 'monthly_income',
        ]);

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
            'base_price' => 'required|numeric|min:0',
            'additional_price' => 'nullable|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'legal_fees' => 'nullable|numeric|min:0',
            'booking_fee' => 'required|numeric|min:100000',
            'dp_amount' => 'nullable|numeric|min:0',
            'dp_installments_count' => 'nullable|integer|min:1|max:36',
            'transaction_date' => 'required|date',
            'transfer_proof' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'notes' => 'nullable|string',
        ]);

        $unit = HousingUnit::findOrFail($validated['housing_unit_id']);
        if ($unit->status !== 'available') {
            return redirect()->back()->with('error', "Unit {$unit->unit_code} tidak tersedia (status saat ini: {$unit->status}).");
        }

        DB::transaction(function () use ($request, $validated, $unit) {
            $user = $request->user();

            $basePrice = (float) $validated['base_price'];
            $additionalPrice = (float) ($validated['additional_price'] ?? 0);
            $discountAmount = (float) ($validated['discount_amount'] ?? 0);
            $legalFees = (float) ($validated['legal_fees'] ?? 0);
            $totalPrice = $basePrice + $additionalPrice - $discountAmount + $legalFees;

            $bookingFee = (float) $validated['booking_fee'];
            $dpAmount = (float) ($validated['dp_amount'] ?? 0);
            $dpInstallmentsCount = (int) ($validated['dp_installments_count'] ?? 1);
            $remainingAmount = $totalPrice - ($dpAmount > 0 ? $dpAmount : $bookingFee);

            // Generate unique booking code
            $code = 'BK-'.date('Ym').'-'.str_pad((string) (Booking::count() + 1), 4, '0', STR_PAD_LEFT);
            $validated['booking_code'] = $code;
            $validated['base_price'] = $basePrice;
            $validated['additional_price'] = $additionalPrice;
            $validated['discount_amount'] = $discountAmount;
            $validated['legal_fees'] = $legalFees;
            $validated['total_price'] = $totalPrice;
            $validated['dp_amount'] = $dpAmount;
            $validated['dp_installments_count'] = $dpInstallmentsCount;
            $validated['remaining_amount'] = max(0, $remainingAmount);

            if ($request->hasFile('transfer_proof')) {
                $path = $request->file('transfer_proof')->store('transfer_proofs', 'public');
                $validated['transfer_proof'] = $path;
            }

            if (empty($validated['sales_id'])) {
                $validated['sales_id'] = $user->id;
            }

            // If created by manager or superadmin with approve permission, can auto approve; otherwise pending_approval
            $isManagerOrSuper = $user->hasRole(['sales_manager', 'superadmin']);
            $validated['status'] = $isManagerOrSuper ? 'approved' : 'pending_approval';

            if ($isManagerOrSuper) {
                $validated['approved_by_manager_id'] = $user->id;
                $validated['approved_by_manager_at'] = Carbon::now();
                $validated['spr_number'] = 'SPR/CSN/'.date('Y/m').'/'.str_pad((string) (Booking::count() + 1), 4, '0', STR_PAD_LEFT);
                $validated['spr_date'] = Carbon::now()->format('Y-m-d');
            }

            $booking = Booking::create($validated);

            // Create initial payment record for booking fee
            BookingPayment::create([
                'booking_id' => $booking->id,
                'payment_number' => 'KW-'.date('Ym').'-'.str_pad((string) (BookingPayment::count() + 1), 4, '0', STR_PAD_LEFT),
                'payment_type' => 'booking_fee',
                'term_name' => 'Uang Tanda Jadi (Booking Fee)',
                'amount_due' => $bookingFee,
                'due_date' => $validated['transaction_date'],
                'amount_paid' => $bookingFee,
                'payment_date' => $validated['transaction_date'],
                'payment_method' => 'transfer_bank',
                'bank_name' => 'BCA',
                'payment_proof' => $validated['transfer_proof'] ?? null,
                'status' => $isManagerOrSuper ? 'verified' : 'pending_verification',
                'verified_by' => $isManagerOrSuper ? $user->id : null,
                'verified_at' => $isManagerOrSuper ? Carbon::now() : null,
                'notes' => 'Pembayaran Uang Tanda Jadi saat pengajuan booking.',
            ]);

            // If auto-approved with KPR, create initial KPR application record
            if ($isManagerOrSuper && $validated['payment_scheme'] === 'kpr') {
                KprApplication::create([
                    'booking_id' => $booking->id,
                    'bank_name' => 'Bank Rekanan Developer',
                    'submitted_amount' => $booking->remaining_amount,
                    'current_stage' => 'document_collection',
                    'notes' => 'Pengajuan berkas awal KPR.',
                ]);
            }

            // Lock unit status to 'booked'
            $unit->update(['status' => 'booked']);

            // Update lead pipeline stage to 'booking'
            Lead::where('id', $validated['lead_id'])->update(['status' => 'booking']);

            // Record activity log
            ActivityLog::record(
                'create_booking',
                "Mencatat transaksi tanda jadi unit {$unit->unit_code} dengan kode {$booking->booking_code} (Status: {$booking->status}).",
                $booking,
                [
                    'unit_code' => $unit->unit_code,
                    'booking_fee' => $bookingFee,
                    'total_price' => $totalPrice,
                    'payment_scheme' => $validated['payment_scheme'],
                ]
            );
        });

        $msg = $request->user()->hasRole(['sales_manager', 'superadmin'])
            ? "Transaksi Booking unit {$unit->unit_code} berhasil dibuat dan otomatis disetujui (Status: BOOKED)."
            : "Pengajuan Booking unit {$unit->unit_code} berhasil dibuat! Menunggu verifikasi Sales Manager & Finance.";

        return redirect()->back()->with('success', $msg);
    }

    public function approve(Request $request, Booking $booking): RedirectResponse
    {
        $user = $request->user();

        if (! $user->can('approve-bookings') && ! $user->hasRole(['sales_manager', 'finance', 'superadmin'])) {
            return redirect()->back()->with('error', 'Anda tidak memiliki hak akses untuk menyetujui transaksi ini.');
        }

        DB::transaction(function () use ($user, $booking) {
            $updates = [];

            if ($user->hasRole(['sales_manager', 'superadmin'])) {
                $updates['approved_by_manager_id'] = $user->id;
                $updates['approved_by_manager_at'] = Carbon::now();
            }

            if ($user->hasRole(['finance', 'superadmin'])) {
                $updates['approved_by_finance_id'] = $user->id;
                $updates['approved_by_finance_at'] = Carbon::now();

                // Auto-verify booking fee payment if pending
                $feePayment = $booking->payments()->where('payment_type', 'booking_fee')->first();
                if ($feePayment && $feePayment->status !== 'verified') {
                    $feePayment->update([
                        'status' => 'verified',
                        'verified_by' => $user->id,
                        'verified_at' => Carbon::now(),
                    ]);
                }
            }

            if (empty($booking->spr_number)) {
                $updates['spr_number'] = 'SPR/CSN/'.date('Y/m').'/'.str_pad((string) $booking->id, 4, '0', STR_PAD_LEFT);
                $updates['spr_date'] = Carbon::now()->format('Y-m-d');
            }

            // Determine status based on payment scheme
            if ($booking->payment_scheme === 'kpr') {
                $updates['status'] = 'kpr_process';

                // Ensure KPR application exists
                if (! $booking->kprApplication) {
                    KprApplication::create([
                        'booking_id' => $booking->id,
                        'bank_name' => 'Bank BTN',
                        'submitted_amount' => $booking->remaining_amount > 0 ? $booking->remaining_amount : $booking->total_price,
                        'current_stage' => 'document_collection',
                        'notes' => 'Pemberkasan KPR dimulai.',
                    ]);
                }
            } elseif ($booking->payment_scheme === 'cash_bertahap') {
                $updates['status'] = 'in_payment';
            } else {
                $updates['status'] = 'approved';
            }

            $booking->update($updates);

            // Generate initial DP payment schedules if defined and not already generated
            if ($booking->dp_amount > 0 && $booking->payments()->where('payment_type', 'down_payment')->count() === 0) {
                $dpNet = (float) $booking->dp_amount - (float) $booking->booking_fee;
                $installmentCount = max(1, (int) $booking->dp_installments_count);
                $amountPerTerm = max(0, $dpNet / $installmentCount);

                for ($i = 1; $i <= $installmentCount; $i++) {
                    $dueDate = Carbon::now()->addDays($i * 14)->format('Y-m-d');
                    BookingPayment::create([
                        'booking_id' => $booking->id,
                        'payment_number' => 'KW-'.date('Ym').'-'.str_pad((string) (BookingPayment::count() + 1), 4, '0', STR_PAD_LEFT),
                        'payment_type' => 'down_payment',
                        'term_name' => "Uang Muka (DP) Termin {$i}",
                        'amount_due' => $amountPerTerm,
                        'due_date' => $dueDate,
                        'amount_paid' => 0,
                        'status' => 'unpaid',
                        'notes' => "Jadwal tagihan DP Termin {$i} dari {$installmentCount}.",
                    ]);
                }
            }

            ActivityLog::record(
                'approve_booking',
                "Menyetujui transaksi booking {$booking->booking_code} dan menerbitkan nomor SPR {$booking->spr_number}.",
                $booking,
                ['status' => $updates['status'], 'spr_number' => $booking->spr_number]
            );
        });

        return redirect()->back()->with('success', "Transaksi Booking {$booking->booking_code} telah disetujui! Nomor SPR {$booking->spr_number} resmi diterbitkan.");
    }

    public function cancel(Request $request, Booking $booking): RedirectResponse
    {
        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($booking, $validated) {
            $booking->update([
                'status' => 'cancelled',
                'rejection_reason' => $validated['reason'] ?? 'Dibatalkan oleh manajemen.',
            ]);

            // Restore unit to available
            if ($booking->unit) {
                $booking->unit->update(['status' => 'available']);
            }

            ActivityLog::record(
                'cancel_booking',
                "Membatalkan transaksi {$booking->booking_code} unit {$booking->unit?->unit_code}. Kavling dikembalikan ke status Available.",
                $booking,
                ['reason' => $validated['reason'] ?? null]
            );
        });

        return redirect()->back()->with('success', "Booking {$booking->booking_code} telah dibatalkan, status unit telah dikembalikan menjadi Available.");
    }

    public function addPayment(Request $request, Booking $booking): RedirectResponse
    {
        $validated = $request->validate([
            'payment_type' => 'required|in:booking_fee,down_payment,installment,bank_disbursement,pelunasan',
            'term_name' => 'required|string|max:100',
            'amount_due' => 'required|numeric|min:0',
            'due_date' => 'required|date',
            'amount_paid' => 'nullable|numeric|min:0',
            'payment_date' => 'nullable|date',
            'payment_method' => 'nullable|string|max:30',
            'bank_name' => 'nullable|string|max:60',
            'payment_proof' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'notes' => 'nullable|string',
        ]);

        DB::transaction(function () use ($request, $booking, $validated) {
            $paymentNumber = 'KW-'.date('Ym').'-'.str_pad((string) (BookingPayment::count() + 1), 4, '0', STR_PAD_LEFT);
            $validated['booking_id'] = $booking->id;
            $validated['payment_number'] = $paymentNumber;

            if ($request->hasFile('payment_proof')) {
                $path = $request->file('payment_proof')->store('payment_proofs', 'public');
                $validated['payment_proof'] = $path;
            }

            $user = $request->user();
            $isFinance = $user->can('verify-payments') || $user->hasRole(['finance', 'superadmin']);

            if (! empty($validated['amount_paid']) && (float) $validated['amount_paid'] > 0) {
                $validated['status'] = $isFinance ? 'verified' : 'pending_verification';
                if ($isFinance) {
                    $validated['verified_by'] = $user->id;
                    $validated['verified_at'] = Carbon::now();
                }
            } else {
                $validated['status'] = 'unpaid';
            }

            $payment = BookingPayment::create($validated);

            ActivityLog::record(
                'create_payment_term',
                "Menambahkan termin pembayaran {$payment->term_name} untuk transaksi {$booking->booking_code} senilai Rp ".number_format((float) $payment->amount_due, 0, ',', '.'),
                $payment
            );
        });

        return redirect()->back()->with('success', 'Jadwal / Bukti pembayaran termin berhasil ditambahkan.');
    }

    public function verifyPayment(Request $request, BookingPayment $payment): RedirectResponse
    {
        $user = $request->user();
        if (! $user->can('verify-payments') && ! $user->hasRole(['finance', 'superadmin'])) {
            return redirect()->back()->with('error', 'Hanya Finance atau Superadmin yang dapat memverifikasi pembayaran.');
        }

        DB::transaction(function () use ($user, $payment) {
            $payment->update([
                'status' => 'verified',
                'amount_paid' => $payment->amount_paid > 0 ? $payment->amount_paid : $payment->amount_due,
                'payment_date' => $payment->payment_date ?? Carbon::now()->format('Y-m-d'),
                'verified_by' => $user->id,
                'verified_at' => Carbon::now(),
            ]);

            ActivityLog::record(
                'verify_payment',
                "Memverifikasi pembayaran {$payment->term_name} ({$payment->payment_number}) senilai {$payment->formatted_amount_paid}.",
                $payment
            );
        });

        return redirect()->back()->with('success', "Pembayaran {$payment->payment_number} berhasil diverifikasi!");
    }

    public function updateKpr(Request $request, Booking $booking): RedirectResponse
    {
        $user = $request->user();
        if (! $user->can('manage-kpr') && ! $user->hasRole(['finance', 'sales_manager', 'superadmin'])) {
            return redirect()->back()->with('error', 'Anda tidak memiliki hak akses untuk memperbarui berkas KPR.');
        }

        $validated = $request->validate([
            'bank_name' => 'required|string|max:80',
            'application_number' => 'nullable|string|max:80',
            'submitted_amount' => 'nullable|numeric|min:0',
            'approved_amount' => 'nullable|numeric|min:0',
            'interest_rate' => 'nullable|numeric|min:0|max:100',
            'tenor_years' => 'nullable|integer|min:1|max:35',
            'current_stage' => 'required|string|in:document_collection,submitted_to_bank,slik_checking,appraisal,sp3k_issued,pre_akad,akad_scheduled,disbursed,rejected',
            'sp3k_number' => 'nullable|string|max:80',
            'sp3k_date' => 'nullable|date',
            'sp3k_document' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'akad_date' => 'nullable|date',
            'notary_name' => 'nullable|string|max:150',
            'notes' => 'nullable|string',
        ]);

        DB::transaction(function () use ($request, $booking, $validated) {
            if ($request->hasFile('sp3k_document')) {
                $path = $request->file('sp3k_document')->store('sp3k_documents', 'public');
                $validated['sp3k_document'] = $path;
            }

            $kpr = KprApplication::updateOrCreate(
                ['booking_id' => $booking->id],
                $validated
            );

            // Update booking status conditionally
            if ($validated['current_stage'] === 'disbursed') {
                $booking->update(['status' => 'completed']);
                if ($booking->unit) {
                    $booking->unit->update(['status' => 'sold']);
                }
            } elseif ($validated['current_stage'] === 'sp3k_issued' || $validated['current_stage'] === 'akad_scheduled') {
                $booking->update(['status' => 'ready_for_akad']);
            } elseif ($validated['current_stage'] === 'rejected') {
                $booking->update(['status' => 'pending_approval']);
            }

            ActivityLog::record(
                'update_kpr_pipeline',
                "Memperbarui tahapan KPR {$kpr->bank_name} menjadi: {$validated['current_stage']} untuk transaksi {$booking->booking_code}.",
                $kpr
            );
        });

        return redirect()->back()->with('success', 'Data progres KPR bank berhasil diperbarui.');
    }

    public function completeTransaction(Booking $booking): RedirectResponse
    {
        DB::transaction(function () use ($booking) {
            $booking->update(['status' => 'completed']);

            if ($booking->unit) {
                $booking->unit->update(['status' => 'sold']);
            }

            ActivityLog::record(
                'complete_transaction',
                "Menandai transaksi {$booking->booking_code} SELESAI (Completed). Status unit kavling {$booking->unit?->unit_code} kini telah menjadi SOLD.",
                $booking
            );
        });

        return redirect()->back()->with('success', "Transaksi {$booking->booking_code} telah selesai! Status unit kini SOLD.");
    }
}
