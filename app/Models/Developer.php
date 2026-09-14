<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Developer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'npwp',
        'office_address',
        'phone',
        'logo',
        'bank_name',
        'bank_account_number',
        'bank_account_holder',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected $appends = [
        'logo_url',
    ];

    /**
     * Get all housing projects associated with this developer.
     */
    public function projects(): HasMany
    {
        return $this->hasMany(HousingProject::class, 'developer_id');
    }

    /**
     * Accessor for full logo URL.
     */
    public function getLogoUrlAttribute(): ?string
    {
        if (! $this->logo) {
            return null;
        }

        return Storage::disk('public')->url($this->logo);
    }
}
