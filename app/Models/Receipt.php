<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Receipt extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'receipt_number',
        'booking_id',
        'lead_id',
        'payment_type',
        'amount',
        'payment_method',
        'bank_name',
        'transfer_proof',
        'payment_date',
        'notes',
        'status',
        'submitted_by',
        'submitted_at',
        'reviewed_by_finance_id',
        'reviewed_by_finance_at',
        'finance_receipt_number',
        'finance_notes',
        'approved_by_manager_id',
        'approved_by_manager_at',
        'rejection_reason',
        'rejected_by',
        'rejected_at',
        'voided_by',
        'voided_at',
        'void_reason',
        'qr_code_token',
        'qr_code_url',
        'pdf_path',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'date:Y-m-d',
        'submitted_at' => 'datetime',
        'reviewed_by_finance_at' => 'datetime',
        'approved_by_manager_at' => 'datetime',
        'rejected_at' => 'datetime',
        'voided_at' => 'datetime',
    ];

    protected $appends = [
        'formatted_amount',
        'transfer_proof_url',
        'pdf_url',
        'status_label',
        'status_color',
    ];

    /**
     * Status flow constants.
     */
    public const STATUS_SUBMITTED = 'submitted';

    public const STATUS_FINANCE_REVIEW = 'finance_review';

    public const STATUS_FINANCE_APPROVED = 'finance_approved';

    public const STATUS_MANAGER_APPROVED = 'manager_approved';

    public const STATUS_REJECTED = 'rejected';

    public const STATUS_VOID = 'void';

    /**
     * Payment type constants.
     */
    public const PAYMENT_TYPE_BOOKING_FEE = 'booking_fee';

    public const PAYMENT_TYPE_DP = 'dp';

    public const PAYMENT_TYPE_INSTALLMENT = 'installment';

    public const PAYMENT_TYPE_PELUNASAN = 'pelunasan';

    /**
     * Auto-generate QR code token on creating.
     */
    protected static function booted(): void
    {
        static::creating(function (Receipt $receipt) {
            if (empty($receipt->qr_code_token)) {
                $receipt->qr_code_token = Str::uuid()->toString();
            }
            if (empty($receipt->submitted_at)) {
                $receipt->submitted_at = now();
            }
        });
    }

    // ──────────────────────────────
    // Relationships
    // ──────────────────────────────

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class, 'lead_id');
    }

    public function submitter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function financeReviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by_finance_id');
    }

    public function managerApprover(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by_manager_id');
    }

    public function rejectedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }

    public function statusLogs(): HasMany
    {
        return $this->hasMany(ReceiptStatusLog::class, 'receipt_id')->orderBy('created_at');
    }

    // ──────────────────────────────
    // Accessors
    // ──────────────────────────────

    public function getFormattedAmountAttribute(): string
    {
        return 'Rp '.number_format((float) $this->amount, 0, ',', '.');
    }

    public function getTransferProofUrlAttribute(): ?string
    {
        if (! $this->transfer_proof) {
            return null;
        }

        if (filter_var($this->transfer_proof, FILTER_VALIDATE_URL)) {
            return $this->transfer_proof;
        }

        return Storage::disk('public')->url($this->transfer_proof);
    }

    public function getPdfUrlAttribute(): ?string
    {
        if (! $this->pdf_path) {
            return null;
        }

        return Storage::disk('public')->url($this->pdf_path);
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            self::STATUS_SUBMITTED => 'Menunggu Review Finance',
            self::STATUS_FINANCE_REVIEW => 'Sedang Direview Finance',
            self::STATUS_FINANCE_APPROVED => 'Menunggu Approval Manager',
            self::STATUS_MANAGER_APPROVED => 'Disetujui',
            self::STATUS_REJECTED => 'Ditolak',
            default => ucfirst($this->status),
        };
    }

    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            self::STATUS_SUBMITTED => 'yellow',
            self::STATUS_FINANCE_REVIEW => 'blue',
            self::STATUS_FINANCE_APPROVED => 'indigo',
            self::STATUS_MANAGER_APPROVED => 'green',
            self::STATUS_REJECTED => 'red',
            default => 'gray',
        };
    }

    // ──────────────────────────────
    // Helpers
    // ──────────────────────────────

    /**
     * Get the payment type label in Indonesian.
     */
    public function getPaymentTypeLabelAttribute(): string
    {
        return match ($this->payment_type) {
            self::PAYMENT_TYPE_BOOKING_FEE => 'Booking Fee',
            self::PAYMENT_TYPE_DP => 'Uang Muka (DP)',
            self::PAYMENT_TYPE_INSTALLMENT => 'Cicilan',
            self::PAYMENT_TYPE_PELUNASAN => 'Pelunasan',
            default => ucfirst(str_replace('_', ' ', $this->payment_type)),
        };
    }

    /**
     * Generate receipt number based on configured format.
     */
    public static function generateReceiptNumber(): string
    {
        $format = AppSetting::get('receipt_number_format', 'KW/{YEAR}/{MONTH}/{ID}');
        $year = now()->format('Y');
        $month = now()->format('m');

        // Get the next sequential ID for this month
        $lastReceipt = static::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->whereNotNull('receipt_number')
            ->orderByDesc('id')
            ->first();

        $nextId = 1;
        if ($lastReceipt && preg_match('/(\d+)$/', $lastReceipt->receipt_number, $matches)) {
            $nextId = (int) $matches[1] + 1;
        }

        $paddedId = str_pad($nextId, 4, '0', STR_PAD_LEFT);

        return str_replace(
            ['{YEAR}', '{MONTH}', '{ID}'],
            [$year, $month, $paddedId],
            $format
        );
    }

    /**
     * Log a status change.
     */
    public function logStatusChange(?string $fromStatus, string $toStatus, int $changedBy, ?string $notes = null): ReceiptStatusLog
    {
        return $this->statusLogs()->create([
            'from_status' => $fromStatus,
            'to_status' => $toStatus,
            'changed_by' => $changedBy,
            'notes' => $notes,
        ]);
    }
}
