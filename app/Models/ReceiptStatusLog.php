<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReceiptStatusLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'receipt_id',
        'from_status',
        'to_status',
        'changed_by',
        'notes',
    ];

    protected $appends = [
        'created_at_formatted',
        'status_label',
    ];

    public function receipt(): BelongsTo
    {
        return $this->belongsTo(Receipt::class, 'receipt_id');
    }

    public function changedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }

    public function getCreatedAtFormattedAttribute(): string
    {
        return $this->created_at?->format('d M Y, H:i') ?? '-';
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->to_status) {
            Receipt::STATUS_SUBMITTED => 'Diajukan oleh Sales',
            Receipt::STATUS_FINANCE_REVIEW => 'Direview Finance',
            Receipt::STATUS_FINANCE_APPROVED => 'Disetujui Finance',
            Receipt::STATUS_MANAGER_APPROVED => 'Disetujui Manager',
            Receipt::STATUS_REJECTED => 'Ditolak',
            default => ucfirst($this->to_status),
        };
    }
}
