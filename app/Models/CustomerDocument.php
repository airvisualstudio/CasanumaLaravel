<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CustomerDocument extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'lead_id',
        'booking_id',
        'document_type',
        'file_path',
        'file_name',
        'file_size',
        'mime_type',
        'status',
        'rejection_reason',
        'verified_by',
        'verified_at',
        'uploaded_by',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'verified_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = [
        'formatted_file_size',
        'document_type_label',
        'preview_url',
        'download_url',
    ];

    public static function getDocumentTypeLabels(): array
    {
        return [
            'ktp' => 'KTP (Kartu Tanda Penduduk)',
            'kk' => 'KK (Kartu Keluarga)',
            'npwp' => 'NPWP (Nomor Pokok Wajib Pajak)',
            'buku_nikah' => 'Buku Nikah / Surat Ket. Belum Menikah',
            'slip_gaji' => 'Slip Gaji (3 Bulan Terakhir)',
            'rek_koran' => 'Rekening Koran (3 Bulan Terakhir)',
        ];
    }

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class, 'lead_id');
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function getDocumentTypeLabelAttribute(): string
    {
        $labels = self::getDocumentTypeLabels();

        return $labels[$this->document_type] ?? ucfirst(str_replace('_', ' ', $this->document_type));
    }

    public function getFormattedFileSizeAttribute(): string
    {
        $bytes = $this->file_size ?: 0;
        if ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 1).' MB';
        }
        if ($bytes >= 1024) {
            return number_format($bytes / 1024, 0).' KB';
        }

        return $bytes.' B';
    }

    public function getPreviewUrlAttribute(): string
    {
        return route('customer-documents.preview', $this->id);
    }

    public function getDownloadUrlAttribute(): string
    {
        return route('customer-documents.download', $this->id);
    }
}
