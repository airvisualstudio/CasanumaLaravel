<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Booking extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'booking_code',
        'lead_id',
        'housing_unit_id',
        'sales_id',
        'payment_scheme',
        'booking_fee',
        'transfer_proof',
        'transaction_date',
        'status',
        'notes',
    ];

    protected $casts = [
        'booking_fee' => 'decimal:2',
        'transaction_date' => 'date:Y-m-d',
    ];

    protected $appends = [
        'formatted_booking_fee',
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

    public function getFormattedBookingFeeAttribute(): string
    {
        return 'Rp ' . number_format((float) $this->booking_fee, 0, ',', '.');
    }

    public function getTransferProofUrlAttribute(): ?string
    {
        if (!$this->transfer_proof) {
            return null;
        }

        if (filter_var($this->transfer_proof, FILTER_VALIDATE_URL)) {
            return $this->transfer_proof;
        }

        return Storage::disk('public')->url($this->transfer_proof);
    }
}
