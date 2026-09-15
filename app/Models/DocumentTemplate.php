<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class DocumentTemplate extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'category',
        'description',
        'paper_size',
        'custom_width_mm',
        'custom_height_mm',
        'orientation',
        'margin_top_mm',
        'margin_bottom_mm',
        'margin_left_mm',
        'margin_right_mm',
        'letterhead_mode',
        'letterhead_logo',
        'letterhead_title',
        'letterhead_subtitle',
        'letterhead_address',
        'letterhead_contact',
        'letterhead_image',
        'content_html',
        'footer_text',
        'is_default',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'custom_width_mm' => 'integer',
        'custom_height_mm' => 'integer',
        'margin_top_mm' => 'integer',
        'margin_bottom_mm' => 'integer',
        'margin_left_mm' => 'integer',
        'margin_right_mm' => 'integer',
        'is_default' => 'boolean',
    ];

    protected $appends = [
        'category_label',
        'paper_size_label',
        'dimensions_mm',
        'letterhead_logo_url',
        'letterhead_image_url',
    ];

    // Standard Paper Sizes in mm
    public const SIZES_MM = [
        'a4' => ['width' => 210, 'height' => 297, 'label' => 'A4 (210 × 297 mm)'],
        'f4' => ['width' => 215, 'height' => 330, 'label' => 'F4 / Folio (215 × 330 mm)'],
        'letter' => ['width' => 216, 'height' => 279, 'label' => 'Letter (216 × 279 mm)'],
        'legal' => ['width' => 216, 'height' => 356, 'label' => 'Legal (216 × 356 mm)'],
        'custom' => ['width' => 210, 'height' => 297, 'label' => 'Kustom (Ukuran Bebas)'],
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function generatedDocuments(): HasMany
    {
        return $this->hasMany(GeneratedDocument::class, 'document_template_id');
    }

    // ──────────────────────────────
    // Accessors
    // ──────────────────────────────

    public function getCategoryLabelAttribute(): string
    {
        return match ($this->category) {
            'receipt' => 'Kwitansi Pembayaran',
            'spr' => 'Surat Pesanan Rumah (SPR)',
            'ppjb' => 'Perjanjian Jual Beli (PPJB)',
            'bast' => 'Berita Acara Serah Terima (BAST)',
            'invitation' => 'Surat Undangan Akad / Bank',
            'notification' => 'Surat Pemberitahuan / Tagihan',
            default => 'Dokumen Kustom',
        };
    }

    public function getPaperSizeLabelAttribute(): string
    {
        if ($this->paper_size === 'custom') {
            return "Kustom ({$this->custom_width_mm} × {$this->custom_height_mm} mm)";
        }

        return self::SIZES_MM[$this->paper_size]['label'] ?? strtoupper($this->paper_size);
    }

    /**
     * Get paper dimensions in mm taking orientation into account.
     *
     * @return array{width: int, height: int}
     */
    public function getDimensionsMmAttribute(): array
    {
        if ($this->paper_size === 'custom' && $this->custom_width_mm && $this->custom_height_mm) {
            $w = $this->custom_width_mm;
            $h = $this->custom_height_mm;
        } else {
            $preset = self::SIZES_MM[$this->paper_size] ?? self::SIZES_MM['a4'];
            $w = $preset['width'];
            $h = $preset['height'];
        }

        if ($this->orientation === 'landscape') {
            return ['width' => max($w, $h), 'height' => min($w, $h)];
        }

        return ['width' => min($w, $h), 'height' => max($w, $h)];
    }

    public function getLetterheadLogoUrlAttribute(): ?string
    {
        if (! $this->letterhead_logo) {
            return null;
        }

        if (filter_var($this->letterhead_logo, FILTER_VALIDATE_URL)) {
            return $this->letterhead_logo;
        }

        return Storage::disk('public')->url($this->letterhead_logo);
    }

    public function getLetterheadImageUrlAttribute(): ?string
    {
        if (! $this->letterhead_image) {
            return null;
        }

        if (filter_var($this->letterhead_image, FILTER_VALIDATE_URL)) {
            return $this->letterhead_image;
        }

        return Storage::disk('public')->url($this->letterhead_image);
    }
}
