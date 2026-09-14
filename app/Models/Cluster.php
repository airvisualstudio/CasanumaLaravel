<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Cluster extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'housing_project_id',
        'name',
        'code',
        'description',
        'siteplan_image',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(HousingProject::class, 'housing_project_id');
    }

    public function unitTypes(): HasMany
    {
        return $this->hasMany(UnitType::class, 'cluster_id');
    }

    public function units(): HasMany
    {
        return $this->hasMany(HousingUnit::class, 'cluster_id');
    }
}
