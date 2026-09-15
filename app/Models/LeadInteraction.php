<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LeadInteraction extends Model
{
    use HasFactory;

    protected $fillable = [
        'lead_id',
        'user_id',
        'channel',
        'stage_at_interaction',
        'notes',
        'interaction_date',
        'next_follow_up_date',
        'next_follow_up_note',
        'is_reminder_completed',
    ];

    protected $casts = [
        'interaction_date' => 'datetime',
        'next_follow_up_date' => 'datetime',
        'is_reminder_completed' => 'boolean',
    ];

    protected $appends = [
        'channel_label',
        'formatted_interaction_date',
    ];

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class, 'lead_id');
    }

    public function salesUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function internalNotes(): HasMany
    {
        return $this->hasMany(LeadInteractionNote::class, 'lead_interaction_id')->orderBy('created_at', 'asc');
    }

    public function getChannelLabelAttribute(): string
    {
        return match ($this->channel) {
            'whatsapp' => 'WhatsApp Chat',
            'phone' => 'Telepon / Voice Call',
            'meeting' => 'Janji Temu / Kunjungan Lapangan',
            'email' => 'Email Korespondensi',
            default => 'Lainnya',
        };
    }

    public function getFormattedInteractionDateAttribute(): string
    {
        return $this->interaction_date ? $this->interaction_date->translatedFormat('d M Y, H:i') : '-';
    }
}
