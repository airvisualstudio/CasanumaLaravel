<?php

namespace App\Services;

use App\Models\AppSetting;
use App\Models\Booking;
use App\Models\DocumentTemplate;
use App\Models\Lead;
use App\Models\Receipt;
use App\Models\User;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class DocumentTemplateRenderer
{
    /**
     * Get list of all available dynamic tokens grouped by category.
     *
     * @return array<string, array{label: string, tokens: array<int, array{token: string, label: string, example: string}>}>
     */
    public static function getAvailableTokens(): array
    {
        return [
            'konsumen' => [
                'label' => 'Konsumen',
                'tokens' => [
                    ['token' => '{{nama_konsumen}}', 'label' => 'Nama Lengkap Konsumen', 'example' => 'Budi Santoso'],
                    ['token' => '{{nik_konsumen}}', 'label' => 'Nomor KTP / NIK', 'example' => '3273201509900001'],
                    ['token' => '{{whatsapp_konsumen}}', 'label' => 'Nomor WhatsApp / HP', 'example' => '081234567890'],
                    ['token' => '{{email_konsumen}}', 'label' => 'Alamat Email', 'example' => 'budi.santoso@email.com'],
                    ['token' => '{{alamat_konsumen}}', 'label' => 'Alamat Lengkap', 'example' => 'Jl. Boulevard No. 10, Bandung'],
                    ['token' => '{{pekerjaan_konsumen}}', 'label' => 'Pekerjaan / Profesi', 'example' => 'Karyawan Swasta'],
                ],
            ],
            'properti_kavling' => [
                'label' => 'Properti & Kavling',
                'tokens' => [
                    ['token' => '{{nomor_kavling}}', 'label' => 'Nomor / Kode Kavling', 'example' => 'A-01'],
                    ['token' => '{{nama_proyek}}', 'label' => 'Nama Proyek Perumahan', 'example' => 'Casanuma Grand Hills'],
                    ['token' => '{{nama_cluster}}', 'label' => 'Nama Cluster', 'example' => 'Cluster Sakura'],
                    ['token' => '{{kode_unit}}', 'label' => 'Kode Unit Properti', 'example' => 'A-01'],
                    ['token' => '{{tipe_unit}}', 'label' => 'Tipe Bangunan / Rumah', 'example' => 'Tipe 45/90'],
                    ['token' => '{{luas_tanah}}', 'label' => 'Luas Tanah (m²)', 'example' => '90 m²'],
                    ['token' => '{{luas_bangunan}}', 'label' => 'Luas Bangunan (m²)', 'example' => '45 m²'],
                    ['token' => '{{blok_unit}}', 'label' => 'Blok Kavling', 'example' => 'Blok A'],
                    ['token' => '{{nomor_unit}}', 'label' => 'Nomor Kavling', 'example' => '01'],
                ],
            ],
            'transaksi_booking' => [
                'label' => 'Transaksi Booking & SPR',
                'tokens' => [
                    ['token' => '{{tanggal_transaksi}}', 'label' => 'Tanggal Transaksi', 'example' => '15 September 2026'],
                    ['token' => '{{nomor_booking}}', 'label' => 'Kode Transaksi Booking', 'example' => 'BK-2026-001'],
                    ['token' => '{{nomor_spr}}', 'label' => 'Nomor Resmi SPR', 'example' => 'SPR/2026/09/001'],
                    ['token' => '{{tanggal_booking}}', 'label' => 'Tanggal Booking', 'example' => '15 September 2026'],
                    ['token' => '{{skema_pembayaran}}', 'label' => 'Skema Pembayaran', 'example' => 'KPR Bank'],
                    ['token' => '{{harga_dasar}}', 'label' => 'Harga Dasar Unit (Rp)', 'example' => 'Rp 750.000.000'],
                    ['token' => '{{harga_total}}', 'label' => 'Total Harga Transaksi (Rp)', 'example' => 'Rp 750.000.000'],
                    ['token' => '{{terbilang_harga_total}}', 'label' => 'Terbilang Total Harga', 'example' => 'Tujuh Ratus Lima Puluh Juta Rupiah'],
                    ['token' => '{{booking_fee}}', 'label' => 'Nominal Tanda Jadi (Rp)', 'example' => 'Rp 10.000.000'],
                    ['token' => '{{terbilang_booking_fee}}', 'label' => 'Terbilang Booking Fee', 'example' => 'Sepuluh Juta Rupiah'],
                ],
            ],
            'kwitansi_bayar' => [
                'label' => 'Kwitansi & Pembayaran',
                'tokens' => [
                    ['token' => '{{nominal_terbilang}}', 'label' => 'Nominal Terbilang (Ejaan)', 'example' => 'Lima Puluh Juta Rupiah'],
                    ['token' => '{{nomor_kwitansi}}', 'label' => 'Nomor Kwitansi Resmi', 'example' => 'KW/2026/09/0001'],
                    ['token' => '{{jenis_pembayaran}}', 'label' => 'Jenis Pembayaran', 'example' => 'Uang Muka (DP)'],
                    ['token' => '{{nominal_bayar}}', 'label' => 'Nominal Kwitansi (Rp)', 'example' => 'Rp 50.000.000'],
                    ['token' => '{{terbilang_nominal}}', 'label' => 'Terbilang Nominal Bayar', 'example' => 'Lima Puluh Juta Rupiah'],
                    ['token' => '{{metode_bayar}}', 'label' => 'Metode Pembayaran', 'example' => 'Transfer Bank'],
                    ['token' => '{{bank_pembayaran}}', 'label' => 'Bank Rekening Tujuan', 'example' => 'BCA (0123456789)'],
                    ['token' => '{{tanggal_bayar}}', 'label' => 'Tanggal Pembayaran', 'example' => '15 September 2026'],
                ],
            ],
            'validasi_approval' => [
                'label' => 'Validasi & Approval Manager',
                'tokens' => [
                    ['token' => '{{qr_manager}}', 'label' => 'QR Code Approval Manager', 'example' => '[QR Digital Signature]'],
                    ['token' => '{{nama_manager}}', 'label' => 'Nama Sales Manager', 'example' => 'Bambang Wijaya'],
                    ['token' => '{{nama_finance}}', 'label' => 'Nama Petugas Finance', 'example' => 'Sari Handayani'],
                    ['token' => '{{nama_sales}}', 'label' => 'Nama Petugas Sales', 'example' => 'Rian Pratama'],
                ],
            ],
            'perusahaan_staff' => [
                'label' => 'Identitas Perusahaan & Staff',
                'tokens' => [
                    ['token' => '{{nama_perusahaan}}', 'label' => 'Nama PT / Developer', 'example' => 'PT Casanuma Modern Living'],
                    ['token' => '{{nama_aplikasi}}', 'label' => 'Nama Brand / CRM', 'example' => 'CASANUMA CRM'],
                    ['token' => '{{tanggal_hari_ini}}', 'label' => 'Tanggal Cetak Hari Ini', 'example' => now()->translatedFormat('d F Y')],
                    ['token' => '{{tahun_ini}}', 'label' => 'Tahun Sekarang', 'example' => now()->format('Y')],
                    ['token' => '{{kota_kantor}}', 'label' => 'Kota Domisili Kantor', 'example' => 'Bandung'],
                ],
            ],
        ];
    }

    /**
     * Generate inline QR code SVG stamp for manager approval verification.
     */
    public static function generateManagerQrCode(?string $approverName = null, ?string $timestamp = null, ?string $code = null): string
    {
        $approver = $approverName ?: 'Ir. Bambang Wijaya, M.M. (Sales Manager)';
        $time = $timestamp ?: now()->format('Y-m-d H:i:s');
        $verificationCode = $code ?: 'CSN-APPR-'.strtoupper(substr(md5($approver.$time), 0, 10));

        $qrData = "CASANUMA VERIFIED DOCUMENT\nApprover: {$approver}\nDate: {$time}\nRef: {$verificationCode}\nStatus: DIGITALLY APPROVED";

        try {
            $svg = QrCode::format('svg')->size(75)->margin(1)->generate($qrData);
            $base64 = base64_encode($svg);

            return '<span style="display: inline-block; text-align: center; vertical-align: middle; margin: 4px; padding: 4px; border: 1px dashed #cbd5e1; border-radius: 6px; background-color: #f8fafc;">'.
                   '<img src="data:image/svg+xml;base64,'.$base64.'" style="width: 65px; height: 65px; display: block; margin: 0 auto;" alt="QR Approval Manager" />'.
                   '<span style="display: block; font-size: 8px; color: #16a34a; font-weight: bold; margin-top: 2px; font-family: sans-serif;">✓ APPROVED BY MANAGER</span>'.
                   '</span>';
        } catch (\Throwable $e) {
            return '<span style="display: inline-block; border: 1.5px solid #16a34a; color: #16a34a; padding: 4px 8px; font-weight: bold; font-size: 9px; text-transform: uppercase; border-radius: 4px; font-family: sans-serif;">[✓ DIGITALLY APPROVED BY MANAGER]</span>';
        }
    }

    /**
     * Get sample dictionary for previewing in the editor.
     *
     * @return array<string, string>
     */
    public static function getSampleDictionary(): array
    {
        return [
            '{{nama_konsumen}}' => 'H. Achmad Syarifudin',
            '{{nik_konsumen}}' => '3273011408850003',
            '{{whatsapp_konsumen}}' => '0812-3456-7890',
            '{{email_konsumen}}' => 'achmad.syarif@example.com',
            '{{alamat_konsumen}}' => 'Jl. Dago Asri Raya No. 45, Coblong, Kota Bandung',
            '{{pekerjaan_konsumen}}' => 'Wiraswasta / Direktur PT',
            '{{nama_proyek}}' => 'Casanuma Grand Hills',
            '{{nama_cluster}}' => 'Cluster Sakura Premiere',
            '{{nomor_kavling}}' => 'A1-08',
            '{{kode_unit}}' => 'A1-08',
            '{{tipe_unit}}' => 'Tipe 54/105 (2 Lantai)',
            '{{luas_tanah}}' => '105 m²',
            '{{luas_bangunan}}' => '54 m²',
            '{{blok_unit}}' => 'Blok A1',
            '{{nomor_unit}}' => '08',
            '{{nomor_booking}}' => 'BK-2026-089',
            '{{nomor_spr}}' => 'SPR/CGH/2026/09/0089',
            '{{tanggal_booking}}' => now()->translatedFormat('d F Y'),
            '{{tanggal_transaksi}}' => now()->translatedFormat('d F Y'),
            '{{skema_pembayaran}}' => 'KPR Bank Syariah',
            '{{harga_dasar}}' => 'Rp 850.000.000',
            '{{harga_total}}' => 'Rp 850.000.000',
            '{{terbilang_harga_total}}' => 'Delapan Ratus Lima Puluh Juta Rupiah',
            '{{booking_fee}}' => 'Rp 10.000.000',
            '{{terbilang_booking_fee}}' => 'Sepuluh Juta Rupiah',
            '{{nomor_kwitansi}}' => 'KW/2026/09/0128',
            '{{jenis_pembayaran}}' => 'Uang Muka (DP)',
            '{{nominal_bayar}}' => 'Rp 50.000.000',
            '{{nominal_terbilang}}' => 'Lima Puluh Juta Rupiah',
            '{{terbilang_nominal}}' => 'Lima Puluh Juta Rupiah',
            '{{metode_bayar}}' => 'Transfer Bank',
            '{{bank_pembayaran}}' => 'BCA Rekening 123-456-7890 a.n PT Casanuma Modern Living',
            '{{tanggal_bayar}}' => now()->translatedFormat('d F Y'),
            '{{nama_perusahaan}}' => AppSetting::get('company_name', 'PT Casanuma Modern Living'),
            '{{nama_aplikasi}}' => AppSetting::get('app_name', 'CASANUMA CRM'),
            '{{nama_sales}}' => 'Rian Pratama (Sales Executive)',
            '{{nama_finance}}' => 'Sari Handayani, S.Ak',
            '{{nama_manager}}' => 'Ir. Bambang Wijaya, M.M.',
            '{{qr_manager}}' => self::generateManagerQrCode(),
            '{{tanggal_hari_ini}}' => now()->translatedFormat('d F Y'),
            '{{tahun_ini}}' => now()->format('Y'),
            '{{kota_kantor}}' => 'Bandung',
        ];
    }

    /**
     * Build token replacement dictionary from actual models.
     *
     * @return array<string, string>
     */
    public static function buildDictionary(
        ?Booking $booking = null,
        ?Receipt $receipt = null,
        ?Lead $lead = null,
        ?User $currentUser = null
    ): array {
        $dict = self::getSampleDictionary();

        // Overwrite company & app info from AppSetting
        $dict['{{nama_perusahaan}}'] = AppSetting::get('company_name', 'PT Casanuma Modern Living');
        $dict['{{nama_aplikasi}}'] = AppSetting::get('app_name', 'CASANUMA CRM');
        $dict['{{tanggal_hari_ini}}'] = now()->translatedFormat('d F Y');
        $dict['{{tahun_ini}}'] = now()->format('Y');

        if ($lead) {
            $dict['{{nama_konsumen}}'] = $lead->name ?? '-';
            $dict['{{nik_konsumen}}'] = $lead->nik ?? '-';
            $dict['{{whatsapp_konsumen}}'] = $lead->whatsapp ?? '-';
            $dict['{{email_konsumen}}'] = $lead->email ?? '-';
            $dict['{{alamat_konsumen}}'] = $lead->address ?? '-';
            $dict['{{pekerjaan_konsumen}}'] = $lead->job_type ?? '-';
        }

        if ($booking) {
            $bLead = $booking->lead ?? $lead;
            if ($bLead) {
                $dict['{{nama_konsumen}}'] = $bLead->name ?? '-';
                $dict['{{nik_konsumen}}'] = $bLead->nik ?? '-';
                $dict['{{whatsapp_konsumen}}'] = $bLead->whatsapp ?? '-';
                $dict['{{email_konsumen}}'] = $bLead->email ?? '-';
                $dict['{{alamat_konsumen}}'] = $bLead->address ?? '-';
                $dict['{{pekerjaan_konsumen}}'] = $bLead->job_type ?? '-';
            }

            $unit = $booking->unit;
            if ($unit) {
                $dict['{{kode_unit}}'] = $unit->unit_code ?? '-';
                $dict['{{nomor_kavling}}'] = $unit->unit_number ?? $unit->unit_code ?? '-';
                $dict['{{blok_unit}}'] = $unit->block ? "Blok {$unit->block}" : '-';
                $dict['{{nomor_unit}}'] = $unit->unit_number ?? '-';
                $dict['{{tipe_unit}}'] = $unit->unitType?->name ?? '-';
                $dict['{{luas_tanah}}'] = $unit->unitType?->surface_area ? "{$unit->unitType->surface_area} m²" : '-';
                $dict['{{luas_bangunan}}'] = $unit->unitType?->building_area ? "{$unit->unitType->building_area} m²" : '-';
                $dict['{{nama_cluster}}'] = $unit->cluster?->name ?? '-';
                $dict['{{nama_proyek}}'] = $unit->cluster?->project?->name ?? '-';
            }

            $dict['{{nomor_booking}}'] = $booking->booking_code ?? '-';
            $dict['{{nomor_spr}}'] = $booking->spr_number ?? "SPR/{$booking->booking_code}";
            $dict['{{tanggal_booking}}'] = $booking->booking_date ? \Carbon\Carbon::parse($booking->booking_date)->translatedFormat('d F Y') : '-';
            $dict['{{tanggal_transaksi}}'] = $dict['{{tanggal_booking}}'];
            $dict['{{skema_pembayaran}}'] = ucfirst(str_replace('_', ' ', $booking->payment_scheme ?? '-'));

            $totalPrice = (float) ($booking->total_price ?? $booking->base_price ?? 0);
            $dict['{{harga_dasar}}'] = 'Rp '.number_format((float) ($booking->base_price ?? 0), 0, ',', '.');
            $dict['{{harga_total}}'] = 'Rp '.number_format($totalPrice, 0, ',', '.');
            $dict['{{terbilang_harga_total}}'] = self::terbilang($totalPrice).' Rupiah';
            $dict['{{nominal_terbilang}}'] = $dict['{{terbilang_harga_total}}'];

            $bf = (float) ($booking->booking_fee ?? 0);
            $dict['{{booking_fee}}'] = 'Rp '.number_format($bf, 0, ',', '.');
            $dict['{{terbilang_booking_fee}}'] = self::terbilang($bf).' Rupiah';

            if ($booking->sales) {
                $dict['{{nama_sales}}'] = $booking->sales->name;
            }
        }

        if ($receipt) {
            $dict['{{nomor_kwitansi}}'] = $receipt->receipt_number ?? $receipt->finance_receipt_number ?? "KW/#RC-{$receipt->id}";
            $dict['{{jenis_pembayaran}}'] = $receipt->payment_type_label ?? ucfirst($receipt->payment_type);
            $amount = (float) $receipt->amount;
            $dict['{{nominal_bayar}}'] = 'Rp '.number_format($amount, 0, ',', '.');
            $dict['{{terbilang_nominal}}'] = self::terbilang($amount).' Rupiah';
            $dict['{{nominal_terbilang}}'] = $dict['{{terbilang_nominal}}'];
            $dict['{{metode_bayar}}'] = ucfirst(str_replace('_', ' ', $receipt->payment_method ?? '-'));
            $dict['{{bank_pembayaran}}'] = $receipt->bank_name ?? '-';
            $dict['{{tanggal_bayar}}'] = $receipt->payment_date ? \Carbon\Carbon::parse($receipt->payment_date)->translatedFormat('d F Y') : '-';
            $dict['{{tanggal_transaksi}}'] = $dict['{{tanggal_bayar}}'];

            if ($receipt->submitter) {
                $dict['{{nama_sales}}'] = $receipt->submitter->name;
            }
            if ($receipt->financeReviewer) {
                $dict['{{nama_finance}}'] = $receipt->financeReviewer->name;
            }
            if ($receipt->managerApprover) {
                $dict['{{nama_manager}}'] = $receipt->managerApprover->name;
            }
        }

        // Manager Digital QR Code verification
        $approverName = $receipt?->managerApprover?->name
            ?? $booking?->approvedByManager?->name
            ?? ($receipt?->approved_by_manager_id ? 'Sales Manager' : null)
            ?? ($booking?->approved_by_manager_id ? 'Sales Manager' : null);

        $approverTime = $receipt?->approved_by_manager_at
            ?? $booking?->approved_by_manager_at;

        $approverCode = $receipt?->receipt_number
            ?? $booking?->booking_code
            ?? 'DOC-'.\Illuminate\Support\Str::random(8);

        if ($approverName) {
            $dict['{{qr_manager}}'] = self::generateManagerQrCode(
                $approverName,
                $approverTime ? \Carbon\Carbon::parse($approverTime)->format('Y-m-d H:i:s') : now()->format('Y-m-d H:i:s'),
                $approverCode
            );
        } else {
            $dict['{{qr_manager}}'] = self::generateManagerQrCode();
        }

        if ($currentUser) {
            $dict['{{nama_user_login}}'] = $currentUser->name;
        }

        return $dict;
    }

    /**
     * Render template HTML string by replacing placeholders with data.
     */
    public static function renderHtml(string $templateHtml, array $dictionary): string
    {
        // Strip interactive editor placeholder-token wrappers so printed & rendered documents are clean typography
        $cleaned = preg_replace('/<span[^>]*data-type="placeholder-token"[^>]*>(.*?)<\/span>/is', '$1', $templateHtml);
        return str_replace(array_keys($dictionary), array_values($dictionary), $cleaned ?? $templateHtml);
    }

    /**
     * Helper: Convert number to Indonesian words (Terbilang).
     */
    public static function terbilang(float $number): string
    {
        $number = abs($number);
        $huruf = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
        $temp = '';

        if ($number < 12) {
            $temp = ' '.$huruf[(int) $number];
        } elseif ($number < 20) {
            $temp = self::terbilang($number - 10).' Belas';
        } elseif ($number < 100) {
            $temp = self::terbilang((int) ($number / 10)).' Puluh'.self::terbilang($number % 10);
        } elseif ($number < 200) {
            $temp = ' Seratus'.self::terbilang($number - 100);
        } elseif ($number < 1000) {
            $temp = self::terbilang((int) ($number / 100)).' Ratus'.self::terbilang($number % 100);
        } elseif ($number < 2000) {
            $temp = ' Seribu'.self::terbilang($number - 1000);
        } elseif ($number < 1000000) {
            $temp = self::terbilang((int) ($number / 1000)).' Ribu'.self::terbilang($number % 1000);
        } elseif ($number < 1000000000) {
            $temp = self::terbilang((int) ($number / 1000000)).' Juta'.self::terbilang($number % 1000000);
        } elseif ($number < 1000000000000) {
            $temp = self::terbilang((int) ($number / 1000000000)).' Milyar'.self::terbilang(fmod($number, 1000000000));
        } elseif ($number < 1000000000000000) {
            $temp = self::terbilang((int) ($number / 1000000000000)).' Triliun'.self::terbilang(fmod($number, 1000000000000));
        }

        return trim($temp);
    }
}
