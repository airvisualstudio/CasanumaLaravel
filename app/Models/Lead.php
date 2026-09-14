<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
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
        'marital_status',
        'spouse_name',
        'emergency_contact_name',
        'emergency_contact_relation',
        'emergency_contact_phone',
        'id_card_file',
        'npwp_file',
        'kk_file',
        'address',
        'source',
        'status',
        'notes',
    ];

    protected $casts = [
        'monthly_income' => 'decimal:2',
    ];

    protected $appends = [
        'whatsapp_url',
        'formatted_monthly_income',
        'id_card_file_url',
        'npwp_file_url',
        'kk_file_url',
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

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'lead_id');
    }

    public function getFormattedMonthlyIncomeAttribute(): ?string
    {
        if (! $this->monthly_income) {
            return null;
        }

        return 'Rp '.number_format((float) $this->monthly_income, 0, ',', '.');
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

        $text = rawurlencode("Halo Bapak/Ibu {$this->name}, salam hangat dari tim Casanuma.");

        return "https://wa.me/{$cleanNumber}?text={$text}";
    }
}
