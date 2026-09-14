<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class HousingProject extends Model
{
    use HasFactory;

    protected $fillable = [
        'developer_id',
        'name',
        'city',
        'address',
        'area_size',
        'area_unit',
        'banner_image',
        'description',
        'status',
    ];

    protected $casts = [
        'area_size' => 'decimal:2',
    ];

    protected $appends = [
        'banner_image_url',
        'formatted_area',
    ];

    /**
     * Get the developer that owns the housing project.
     */
    public function developer(): BelongsTo
    {
        return $this->belongsTo(Developer::class, 'developer_id');
    }

    /**
     * Accessor for full banner image URL.
     */
    public function getBannerImageUrlAttribute(): ?string
    {
        if (! $this->banner_image) {
            return null;
        }

        return Storage::disk('public')->url($this->banner_image);
    }

    /**
     * Accessor for formatted area display.
     */
    public function getFormattedAreaAttribute(): string
    {
        if ($this->area_size === null) {
            return '-';
        }

        $formatted = number_format((float) $this->area_size, 0, ',', '.');

        return $formatted . ' ' . ($this->area_unit ?: 'm²');
    }
}
