<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class HousingUnit extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'cluster_id',
        'unit_type_id',
        'block',
        'unit_number',
        'unit_code',
        'base_price',
        'status',
        'svg_element_id',
        'notes',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
    ];

    protected $appends = [
        'formatted_price',
    ];

    public function cluster(): BelongsTo
    {
        return $this->belongsTo(Cluster::class, 'cluster_id');
    }

    public function unitType(): BelongsTo
    {
        return $this->belongsTo(UnitType::class, 'unit_type_id');
    }

    public function getFormattedPriceAttribute(): string
    {
        return 'Rp ' . number_format((float) $this->base_price, 0, ',', '.');
    }
}
