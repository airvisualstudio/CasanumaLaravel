<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Lead extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'developer_id',
        'housing_project_id',
        'sales_id',
        'name',
        'whatsapp',
        'email',
        'nik',
        'npwp',
        'kk_number',
        'job_type',
        'company_name',
        'monthly_income',
        'slik_status',
        'marital_status',
        'spouse_name',
        'spouse_nik',
        'max_budget',
        'preferred_unit_type',
        'emergency_contact_name',
        'emergency_contact_relation',
        'emergency_contact_phone',
        'id_card_file',
        'npwp_file',
        'kk_file',
        'address',
        'source',
        'lead_temperature',
        'source_detail',
        'status',
        'is_archived',
        'archived_at',
        'archive_reason',
        'notes',
        'next_follow_up_date',
        'last_interaction_at',
        'sla_revoked_at',
    ];

    protected $casts = [
        'monthly_income' => 'decimal:2',
        'max_budget' => 'decimal:2',
        'is_archived' => 'boolean',
        'archived_at' => 'datetime',
        'next_follow_up_date' => 'datetime',
        'last_interaction_at' => 'datetime',
        'sla_revoked_at' => 'datetime',
    ];

    protected $appends = [
        'whatsapp_url',
        'formatted_monthly_income',
        'formatted_max_budget',
        'slik_status_badge',
        'lead_temperature_badge',
        'sla_status',
        'id_card_file_url',
        'npwp_file_url',
        'kk_file_url',
        'next_follow_up_status',
        'formatted_next_follow_up',
    ];

    public function developer(): BelongsTo
    {
        return $this->belongsTo(Developer::class, 'developer_id');
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(HousingProject::class, 'housing_project_id');
    }

    public function sales(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sales_id');
    }

    public function customerDocuments(): HasMany
    {
        return $this->hasMany(CustomerDocument::class, 'lead_id');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'lead_id');
    }

    public function activeBooking(): HasOne
    {
        return $this->hasOne(Booking::class, 'lead_id')->whereNotIn('status', ['cancelled'])->latestOfMany();
    }

    public function interactions(): HasMany
    {
        return $this->hasMany(LeadInteraction::class, 'lead_id')->orderBy('interaction_date', 'desc');
    }

    public function latestInteraction(): HasOne
    {
        return $this->hasOne(LeadInteraction::class, 'lead_id')->latestOfMany('interaction_date');
    }

    public function getNextFollowUpStatusAttribute(): ?string
    {
        if (! $this->next_follow_up_date) {
            return null;
        }

        if ($this->next_follow_up_date->isPast() && ! $this->next_follow_up_date->isToday()) {
            return 'overdue';
        }

        if ($this->next_follow_up_date->isToday()) {
            return 'today';
        }

        return 'upcoming';
    }

    public function getFormattedNextFollowUpAttribute(): ?string
    {
        if (! $this->next_follow_up_date) {
            return null;
        }

        return $this->next_follow_up_date->translatedFormat('d M Y, H:i');
    }

    public function getFormattedMonthlyIncomeAttribute(): ?string
    {
        if (! $this->monthly_income) {
            return null;
        }

        return 'Rp '.number_format((float) $this->monthly_income, 0, ',', '.');
    }

    public function getFormattedMaxBudgetAttribute(): ?string
    {
        if (! $this->max_budget) {
            return null;
        }

        return 'Rp '.number_format((float) $this->max_budget, 0, ',', '.');
    }

    public function getSlikStatusBadgeAttribute(): array
    {
        return match ($this->slik_status) {
            'ragu' => [
                'label' => 'Perlu Cek (Kol 2)',
                'color' => 'bg-amber-500/10 text-amber-600 border-amber-500/30',
                'status' => 'ragu',
            ],
            'blacklist' => [
                'label' => 'Blacklist (Kol 3-5)',
                'color' => 'bg-rose-500/10 text-rose-600 border-rose-500/30',
                'status' => 'blacklist',
            ],
            default => [
                'label' => 'Clear (Kol 1)',
                'color' => 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
                'status' => 'clear',
            ],
        };
    }

    public function getIdCardFileUrlAttribute(): ?string
    {
        if (! $this->id_card_file) {
            return null;
        }

        if (filter_var($this->id_card_file, FILTER_VALIDATE_URL)) {
            return $this->id_card_file;
        }

        return Storage::disk('public')->url($this->id_card_file);
    }

    public function getNpwpFileUrlAttribute(): ?string
    {
        if (! $this->npwp_file) {
            return null;
        }

        if (filter_var($this->npwp_file, FILTER_VALIDATE_URL)) {
            return $this->npwp_file;
        }

        return Storage::disk('public')->url($this->npwp_file);
    }

    public function getKkFileUrlAttribute(): ?string
    {
        if (! $this->kk_file) {
            return null;
        }

        if (filter_var($this->kk_file, FILTER_VALIDATE_URL)) {
            return $this->kk_file;
        }

        return Storage::disk('public')->url($this->kk_file);
    }

    /**
     * Direct WhatsApp chat link
     */
    public function getWhatsappUrlAttribute(): ?string
    {
        if (empty($this->whatsapp)) {
            return null;
        }

        $cleanNumber = preg_replace('/[^0-9]/', '', $this->whatsapp);

        if (str_starts_with($cleanNumber, '0')) {
            $cleanNumber = '62'.substr($cleanNumber, 1);
        } elseif (! str_starts_with($cleanNumber, '62')) {
            $cleanNumber = '62'.$cleanNumber;
        }

        $projectName = $this->project?->name ? " mengenai proyek {$this->project->name}" : '';
        $text = rawurlencode("Halo Bapak/Ibu {$this->name}, salam hangat dari tim Casanuma. Menindaklanjuti ketertarikan Anda{$projectName}, apakah ada informasi tipe kavling atau simulasi angsuran yang bisa kami bantu?");

        return "https://wa.me/{$cleanNumber}?text={$text}";
    }

    /**
     * Visual badge representation for lead priority temperature.
     */
    public function getLeadTemperatureBadgeAttribute(): array
    {
        return match ($this->lead_temperature) {
            'hot' => [
                'label' => 'HOT',
                'full_label' => '🔥 Hot (Prioritas Tinggi)',
                'color' => 'bg-rose-500/10 text-rose-600 border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
                'status' => 'hot',
            ],
            'cold' => [
                'label' => 'COLD',
                'full_label' => '❄️ Cold (Prospek Dingin)',
                'color' => 'bg-sky-500/10 text-sky-600 border-sky-500/30 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800',
                'status' => 'cold',
            ],
            default => [
                'label' => 'WARM',
                'full_label' => '⚡ Warm (Menimbang)',
                'color' => 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
                'status' => 'warm',
            ],
        };
    }

    /**
     * SLA follow-up countdown status for new assigned leads.
     */
    public function getSlaStatusAttribute(): ?array
    {
        if ($this->status !== 'new' || empty($this->sales_id)) {
            return null;
        }

        $slaLimitDays = 7;
        $benchmarkDate = $this->last_interaction_at ?? $this->created_at;
        if (! $benchmarkDate) {
            return null;
        }

        $daysPassed = (int) $benchmarkDate->diffInDays(now());
        $daysRemaining = max(0, $slaLimitDays - $daysPassed);
        $isOverdue = $daysPassed >= $slaLimitDays;

        return [
            'is_overdue' => $isOverdue,
            'days_passed' => $daysPassed,
            'days_remaining' => $daysRemaining,
            'label' => $isOverdue
                ? 'SLA Terlewat (Siap Revoke)'
                : ($daysRemaining === 0 ? 'SLA Hari Terakhir' : "SLA: {$daysRemaining} hari lagi"),
            'color' => $isOverdue
                ? 'bg-rose-500/10 text-rose-600 border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800'
                : ($daysRemaining <= 2
                    ? 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
                    : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'),
        ];
    }

    /**
     * Scope query to only include active workspace leads.
     */
    public function scopeActive($query)
    {
        return $query->where('is_archived', false)
            ->whereNotIn('status', ['lost', 'rejected']);
    }

    /**
     * Scope query to include leads in the archive & blacklist pool.
     */
    public function scopeArchivedPool($query)
    {
        return $query->where(function ($q) {
            $q->where('is_archived', true)
                ->orWhereIn('status', ['lost', 'rejected'])
                ->orWhere('slik_status', 'blacklist');
        });
    }
}


