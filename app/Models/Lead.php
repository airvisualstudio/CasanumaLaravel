<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

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
        'address',
        'source',
        'status',
        'notes',
    ];

    protected $appends = [
        'whatsapp_url',
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
            $cleanNumber = '62' . substr($cleanNumber, 1);
        } elseif (!str_starts_with($cleanNumber, '62')) {
            $cleanNumber = '62' . $cleanNumber;
        }

        $text = rawurlencode("Halo Bapak/Ibu {$this->name}, salam hangat dari tim Casanuma.");
        return "https://wa.me/{$cleanNumber}?text={$text}";
    }
}
