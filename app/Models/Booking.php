<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Booking extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'booking_code',
        'spr_number',
        'spr_date',
        'lead_id',
        'housing_unit_id',
        'sales_id',
        'payment_scheme',
        'base_price',
        'additional_price',
        'discount_amount',
        'legal_fees',
        'total_price',
        'booking_fee',
        'dp_amount',
        'dp_installments_count',
        'remaining_amount',
        'transfer_proof',
        'transaction_date',
        'status',
        'approved_by_manager_id',
        'approved_by_manager_at',
        'approved_by_finance_id',
        'approved_by_finance_at',
        'rejection_reason',
        'notes',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'additional_price' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'legal_fees' => 'decimal:2',
        'total_price' => 'decimal:2',
        'booking_fee' => 'decimal:2',
        'dp_amount' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
        'dp_installments_count' => 'integer',
        'transaction_date' => 'date:Y-m-d',
        'spr_date' => 'date:Y-m-d',
        'approved_by_manager_at' => 'datetime',
        'approved_by_finance_at' => 'datetime',
    ];

    protected $appends = [
        'formatted_booking_fee',
        'formatted_base_price',
        'formatted_total_price',
        'formatted_dp_amount',
        'formatted_remaining_amount',
        'total_paid',
        'formatted_total_paid',
        'transfer_proof_url',
    ];

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class, 'lead_id');
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(HousingUnit::class, 'housing_unit_id');
    }

    public function sales(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sales_id');
    }

    public function salesAgent(): BelongsTo
    {
        return $this->sales();
    }

    public function approvedByManager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by_manager_id');
    }

    public function approvedByFinance(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by_finance_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(BookingPayment::class, 'booking_id')->orderBy('due_date');
    }

    public function kprApplication(): HasOne
    {
        return $this->hasOne(KprApplication::class, 'booking_id');
    }

    public function getFormattedBookingFeeAttribute(): string
    {
        return 'Rp '.number_format((float) $this->booking_fee, 0, ',', '.');
    }

    public function getFormattedBasePriceAttribute(): string
    {
        return 'Rp '.number_format((float) ($this->base_price ?? 0), 0, ',', '.');
    }

    public function getFormattedTotalPriceAttribute(): string
    {
        return 'Rp '.number_format((float) ($this->total_price ?? 0), 0, ',', '.');
    }

    public function getFormattedDpAmountAttribute(): string
    {
        return 'Rp '.number_format((float) ($this->dp_amount ?? 0), 0, ',', '.');
    }

    public function getFormattedRemainingAmountAttribute(): string
    {
        return 'Rp '.number_format((float) ($this->remaining_amount ?? 0), 0, ',', '.');
    }

    public function getTotalPaidAttribute(): float
    {
        // Verified payments sum + booking fee if confirmed/verified
        $paymentsSum = (float) $this->payments()->where('status', 'verified')->sum('amount_paid');

        return $paymentsSum;
    }

    public function getFormattedTotalPaidAttribute(): string
    {
        return 'Rp '.number_format((float) $this->total_paid, 0, ',', '.');
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
}
