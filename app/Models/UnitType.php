<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class UnitType extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'housing_project_id',
        'cluster_id',
        'name',
        'surface_area',
        'building_area',
        'bedrooms',
        'bathrooms',
        'electricity',
        'brochure_file',
        'description',
    ];

    protected $appends = [
        'brochure_url',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(HousingProject::class, 'housing_project_id');
    }

    public function cluster(): BelongsTo
    {
        return $this->belongsTo(Cluster::class, 'cluster_id');
    }

    public function units(): HasMany
    {
        return $this->hasMany(HousingUnit::class, 'unit_type_id');
    }

    public function getBrochureUrlAttribute(): ?string
    {
        if (! $this->brochure_file) {
            return null;
        }

        if (filter_var($this->brochure_file, FILTER_VALIDATE_URL)) {
            return $this->brochure_file;
        }

        return Storage::disk('public')->url($this->brochure_file);
    }
}
