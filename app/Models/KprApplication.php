<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class KprApplication extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'booking_id',
        'bank_name',
        'application_number',
        'submitted_amount',
        'approved_amount',
        'interest_rate',
        'tenor_years',
        'current_stage',
        'sp3k_number',
        'sp3k_date',
        'sp3k_document',
        'akad_date',
        'notary_name',
        'notes',
    ];

    protected $casts = [
        'submitted_amount' => 'decimal:2',
        'approved_amount' => 'decimal:2',
        'interest_rate' => 'decimal:2',
        'tenor_years' => 'integer',
        'sp3k_date' => 'date:Y-m-d',
        'akad_date' => 'date:Y-m-d',
    ];

    protected $appends = [
        'formatted_submitted_amount',
        'formatted_approved_amount',
        'sp3k_document_url',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }

    public function getFormattedSubmittedAmountAttribute(): string
    {
        return 'Rp '.number_format((float) $this->submitted_amount, 0, ',', '.');
    }

    public function getFormattedApprovedAmountAttribute(): string
    {
        return 'Rp '.number_format((float) $this->approved_amount, 0, ',', '.');
    }

    public function getSp3kDocumentUrlAttribute(): ?string
    {
        if (! $this->sp3k_document) {
            return null;
        }

        if (filter_var($this->sp3k_document, FILTER_VALIDATE_URL)) {
            return $this->sp3k_document;
        }

        return Storage::disk('public')->url($this->sp3k_document);
    }
}
