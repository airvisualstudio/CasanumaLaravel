<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class BookingPayment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'booking_id',
        'payment_number',
        'payment_type',
        'term_name',
        'amount_due',
        'due_date',
        'amount_paid',
        'payment_date',
        'payment_method',
        'bank_name',
        'payment_proof',
        'status',
        'verified_by',
        'verified_at',
        'notes',
    ];

    protected $casts = [
        'amount_due' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'due_date' => 'date:Y-m-d',
        'payment_date' => 'date:Y-m-d',
        'verified_at' => 'datetime',
    ];

    protected $appends = [
        'formatted_amount_due',
        'formatted_amount_paid',
        'payment_proof_url',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function getFormattedAmountDueAttribute(): string
    {
        return 'Rp '.number_format((float) $this->amount_due, 0, ',', '.');
    }

    public function getFormattedAmountPaidAttribute(): string
    {
        return 'Rp '.number_format((float) $this->amount_paid, 0, ',', '.');
    }

    public function getPaymentProofUrlAttribute(): ?string
    {
        if (! $this->payment_proof) {
            return null;
        }

        if (filter_var($this->payment_proof, FILTER_VALIDATE_URL)) {
            return $this->payment_proof;
        }

        return Storage::disk('public')->url($this->payment_proof);
    }
}
