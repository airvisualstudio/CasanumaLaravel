<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeadInteractionNote extends Model
{
    use HasFactory;

    protected $fillable = [
        'lead_interaction_id',
        'user_id',
        'content',
    ];

    protected $appends = [
        'formatted_created_at',
        'author_role_badge',
    ];

    public function interaction(): BelongsTo
    {
        return $this->belongsTo(LeadInteraction::class, 'lead_interaction_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function getFormattedCreatedAtAttribute(): ?string
    {
        return $this->created_at ? $this->created_at->translatedFormat('d M Y, H:i') : null;
    }

    public function getAuthorRoleBadgeAttribute(): string
    {
        $user = $this->user;
        if (! $user) {
            return 'Pengguna';
        }

        if ($user->hasRole('superadmin')) {
            return 'Superadmin';
        }

        if ($user->hasRole('sales_manager')) {
            return 'Sales Manager';
        }

        $lead = $this->interaction?->lead;
        if ($lead && (int) $lead->sales_id === (int) $user->id) {
            return 'Sales PIC';
        }

        if ($user->hasRole('sales_agent')) {
            return 'Sales Agent';
        }

        return 'Internal Staff';
    }
}
