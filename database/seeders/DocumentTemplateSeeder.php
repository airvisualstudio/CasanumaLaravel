<?php

namespace Database\Seeders;

use App\Models\DocumentTemplate;
use App\Models\User;
use Illuminate\Database\Seeder;

class DocumentTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $creator = User::role('superadmin')->first() ?? User::first();
        $creatorId = $creator?->id;

        // 1. Kwitansi Pembayaran Standar
        DocumentTemplate::firstOrCreate(
            ['name' => 'Kwitansi Pembayaran Standar'],
            [
                'category' => 'receipt',
                'description' => 'Template kwitansi resmi untuk tanda jadi, uang muka (DP), dan cicilan pembayaran kavling.',
                'paper_size' => 'a4',
                'orientation' => 'portrait',
                'margin_top_mm' => 15,
                'margin_bottom_mm' => 15,
                'margin_left_mm' => 20,
                'margin_right_mm' => 20,
                'letterhead_mode' => 'default_company',
                'content_html' => '
<div style="text-align: center; margin-bottom: 20px;">
    <h2 style="margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 1px; color: #1e293b;">KWITANSI PEMBAYARAN</h2>
    <p style="margin: 4px 0 0; font-size: 12px; color: #64748b; font-family: monospace;">Nomor: <strong>{{nomor_kwitansi}}</strong></p>
</div>

<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px;">
    <tr>
        <td style="width: 32%; padding: 6px 0; color: #475569;">Telah Diterima Dari</td>
        <td style="width: 3%;">:</td>
        <td style="width: 65%; font-weight: bold; color: #0f172a;">{{nama_konsumen}} (NIK: {{nik_konsumen}})</td>
    </tr>
    <tr>
        <td style="padding: 6px 0; color: #475569;">Uang Sejumlah</td>
        <td>:</td>
        <td style="font-weight: bold; color: #059669; font-style: italic; background-color: #f0fdf4; padding: 6px 8px; border-radius: 4px;">
            # {{terbilang_nominal}} #
        </td>
    </tr>
    <tr>
        <td style="padding: 6px 0; color: #475569;">Untuk Pembayaran</td>
        <td>:</td>
        <td style="color: #0f172a;">
            <strong>{{jenis_pembayaran}}</strong> Unit Kavling <strong>{{kode_unit}}</strong> ({{tipe_unit}}), {{nama_cluster}} &ndash; {{nama_proyek}}
        </td>
    </tr>
    <tr>
        <td style="padding: 6px 0; color: #475569;">Kode Transaksi Booking</td>
        <td>:</td>
        <td style="font-family: monospace; font-weight: bold;">{{nomor_booking}}</td>
    </tr>
    <tr>
        <td style="padding: 6px 0; color: #475569;">Metode Pembayaran</td>
        <td>:</td>
        <td>{{metode_bayar}} ({{bank_pembayaran}})</td>
    </tr>
    <tr>
        <td style="padding: 6px 0; color: #475569;">Tanggal Pembayaran</td>
        <td>:</td>
        <td>{{tanggal_bayar}}</td>
    </tr>
</table>

<div style="margin: 25px 0; padding: 12px 18px; border: 2px dashed #059669; background-color: #f0fdf4; border-radius: 6px; display: inline-block;">
    <span style="font-size: 11px; color: #065f46; font-weight: bold; text-transform: uppercase;">Total Pembayaran:</span>
    <div style="font-size: 20px; font-weight: 800; color: #059669; font-family: monospace; margin-top: 2px;">
        {{nominal_bayar}}
    </div>
</div>

<div style="margin-top: 40px; width: 100%;">
    <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: center;">
        <tr>
            <td style="width: 33%;">
                <p style="margin: 0; color: #64748b;">Penyetor / Konsumen,</p>
                <div style="height: 60px;"></div>
                <p style="margin: 0; font-weight: bold; text-decoration: underline;">{{nama_konsumen}}</p>
            </td>
            <td style="width: 33%;">
                <p style="margin: 0; color: #64748b;">Diverifikasi Finance,</p>
                <div style="height: 60px;"></div>
                <p style="margin: 0; font-weight: bold; text-decoration: underline;">{{nama_finance}}</p>
            </td>
            <td style="width: 34%;">
                <p style="margin: 0; color: #64748b;">{{kota_kantor}}, {{tanggal_hari_ini}}<br>Disetujui Manager,</p>
                <div style="height: 60px;"></div>
                <p style="margin: 0; font-weight: bold; text-decoration: underline;">{{nama_manager}}</p>
            </td>
        </tr>
    </table>
</div>
',
                'footer_text' => 'Kwitansi ini sah dan diterbitkan secara digital oleh sistem CRM. Pembayaran via cek/bilyet giro dianggap sah setelah dana efektif masuk di rekening developer.',
                'is_default' => true,
                'created_by' => $creatorId,
            ]
        );

        // 2. Surat Pesanan Rumah (SPR) Resmi
        DocumentTemplate::firstOrCreate(
            ['name' => 'Surat Pesanan Rumah (SPR) Resmi'],
            [
                'category' => 'spr',
                'description' => 'Dokumen perikatan pemesanan unit kavling rumah antara pihak developer dan konsumen pembeli.',
                'paper_size' => 'a4',
                'orientation' => 'portrait',
                'margin_top_mm' => 20,
                'margin_bottom_mm' => 20,
                'margin_left_mm' => 25,
                'margin_right_mm' => 20,
                'letterhead_mode' => 'default_company',
                'content_html' => '
<div style="text-align: center; margin-bottom: 20px;">
    <h2 style="margin: 0; font-size: 16px; font-weight: bold; text-transform: uppercase;">SURAT PESANAN RUMAH (SPR)</h2>
    <p style="margin: 3px 0 0; font-size: 11px; color: #475569; font-family: monospace;">Nomor: {{nomor_spr}}</p>
</div>

<p style="font-size: 11px; line-height: 1.6; text-align: justify;">
    Pada hari ini, tanggal <strong>{{tanggal_booking}}</strong>, telah disepakati pemesanan unit kavling hunian pada proyek <strong>{{nama_proyek}}</strong> dengan rincian data pemesan dan spesifikasi objek pesanan sebagai berikut:
</p>

<h4 style="font-size: 12px; margin: 12px 0 6px; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px;">I. DATA IDENTITAS PEMESAN (KONSUMEN)</h4>
<table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 12px;">
    <tr><td style="width: 30%; padding: 4px 0;">Nama Lengkap</td><td style="width: 3%;">:</td><td style="width: 67%; font-weight: bold;">{{nama_konsumen}}</td></tr>
    <tr><td style="padding: 4px 0;">NIK / No. KTP</td><td>:</td><td>{{nik_konsumen}}</td></tr>
    <tr><td style="padding: 4px 0;">No. WhatsApp / HP</td><td>:</td><td>{{whatsapp_konsumen}}</td></tr>
    <tr><td style="padding: 4px 0;">Alamat Email</td><td>:</td><td>{{email_konsumen}}</td></tr>
    <tr><td style="padding: 4px 0;">Pekerjaan / Instansi</td><td>:</td><td>{{pekerjaan_konsumen}}</td></tr>
    <tr><td style="padding: 4px 0;">Alamat Domisili</td><td>:</td><td>{{alamat_konsumen}}</td></tr>
</table>

<h4 style="font-size: 12px; margin: 12px 0 6px; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px;">II. SPESIFIKASI UNIT & KAVLING PROPERTI</h4>
<table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 12px;">
    <tr><td style="width: 30%; padding: 4px 0;">Proyek & Cluster</td><td style="width: 3%;">:</td><td style="width: 67%; font-weight: bold;">{{nama_proyek}} &ndash; {{nama_cluster}}</td></tr>
    <tr><td style="padding: 4px 0;">Nomor Kavling / Unit</td><td>:</td><td style="font-weight: bold; font-family: monospace;">{{kode_unit}} ({{blok_unit}} No. {{nomor_unit}})</td></tr>
    <tr><td style="padding: 4px 0;">Tipe Bangunan</td><td>:</td><td>{{tipe_unit}}</td></tr>
    <tr><td style="padding: 4px 0;">Luas Tanah / Bangunan</td><td>:</td><td>{{luas_tanah}} / {{luas_bangunan}}</td></tr>
</table>

<h4 style="font-size: 12px; margin: 12px 0 6px; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px;">III. NILAI TRANSAKSI & SKEMA PEMBAYARAN</h4>
<table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 15px;">
    <tr><td style="width: 30%; padding: 4px 0;">Total Harga Transaksi</td><td style="width: 3%;">:</td><td style="width: 67%; font-weight: bold; font-size: 12px; color: #059669;">{{harga_total}}</td></tr>
    <tr><td style="padding: 4px 0;">Terbilang</td><td>:</td><td style="font-style: italic;">{{terbilang_harga_total}}</td></tr>
    <tr><td style="padding: 4px 0;">Skema Pembayaran</td><td>:</td><td style="font-weight: bold;">{{skema_pembayaran}}</td></tr>
    <tr><td style="padding: 4px 0;">Tanda Jadi (Booking Fee)</td><td>:</td><td style="font-weight: bold;">{{booking_fee}} (Lunas)</td></tr>
</table>

<p style="font-size: 10px; color: #64748b; line-height: 1.5; margin-bottom: 25px;">
    <strong>Catatan & Ketentuan:</strong> Uang tanda jadi (booking fee) mengikat kavling selama 14 hari kalender terhitung sejak tanggal diterbitkannya SPR ini. Konsumen wajib melengkapi berkas persyaratan dan administrasi sebelum batas waktu yang ditentukan.
</p>

<table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: center;">
    <tr>
        <td style="width: 50%;">
            <p style="margin: 0; color: #64748b;">Pemesan / Konsumen,</p>
            <div style="height: 60px;"></div>
            <p style="margin: 0; font-weight: bold; text-decoration: underline;">{{nama_konsumen}}</p>
        </td>
        <td style="width: 50%;">
            <p style="margin: 0; color: #64748b;">{{nama_perusahaan}},</p>
            <div style="height: 60px;"></div>
            <p style="margin: 0; font-weight: bold; text-decoration: underline;">{{nama_manager}}</p>
            <span style="font-size: 10px; color: #64748b;">Sales Manager</span>
        </td>
    </tr>
</table>
',
                'footer_text' => 'Dokumen ini dicetak otomatis dari CASANUMA CRM dan merupakan bukti pemesanan unit kavling yang sah.',
                'is_default' => true,
                'created_by' => $creatorId,
            ]
        );

        // 3. Perjanjian Pengikatan Jual Beli (PPJB / PJB) - Preset Kertas F4 / Folio!
        DocumentTemplate::firstOrCreate(
            ['name' => 'Perjanjian Pengikatan Jual Beli (PPJB)'],
            [
                'category' => 'ppjb',
                'description' => 'Draft naskah perjanjian hukum pengikatan jual beli properti dengan format ukuran kertas resmi notaris F4 / Folio (215 x 330 mm).',
                'paper_size' => 'f4', // Standar Notaris & Properti Indonesia!
                'orientation' => 'portrait',
                'margin_top_mm' => 25,
                'margin_bottom_mm' => 20,
                'margin_left_mm' => 30,
                'margin_right_mm' => 20,
                'letterhead_mode' => 'custom_builder',
                'letterhead_title' => 'PT CASANUMA MODERN LIVING',
                'letterhead_subtitle' => 'PENGEMBANG PERUMAHAN & PROPERTY DEVELOPER TERPADU',
                'letterhead_address' => 'Jl. Ir. H. Juanda No. 128, Dago, Coblong, Kota Bandung, Jawa Barat 40135',
                'letterhead_contact' => 'Telp: (022) 8765-4321 | Email: legal@casanuma.com',
                'content_html' => '
<div style="text-align: center; margin-bottom: 25px;">
    <h3 style="margin: 0; font-size: 15px; font-weight: bold; text-transform: uppercase;">PERJANJIAN PENGIKATAN JUAL BELI (PPJB)</h3>
    <p style="margin: 4px 0 0; font-size: 11px; color: #475569; font-family: monospace;">Nomor: PPJB/{{nomor_booking}}/{{tahun_ini}}</p>
</div>

<p style="font-size: 11px; line-height: 1.7; text-align: justify;">
    Pada hari ini, <strong>{{tanggal_hari_ini}}</strong>, bertempat di kantor {{nama_perusahaan}} di {{kota_kantor}}, telah diadakan kesepakatan Perjanjian Pengikatan Jual Beli antara pihak-pihak:
</p>

<table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 12px;">
    <tr>
        <td style="width: 5%; vertical-align: top; font-weight: bold;">1.</td>
        <td style="width: 95%; text-align: justify;">
            <strong>{{nama_perusahaan}}</strong>, berkedudukan di {{kota_kantor}}, dalam hal ini diwakili secara sah oleh <strong>{{nama_manager}}</strong>, selanjutnya disebut sebagai <strong>PIHAK PERTAMA (PENJUAL)</strong>.
        </td>
    </tr>
    <tr>
        <td style="vertical-align: top; font-weight: bold; padding-top: 8px;">2.</td>
        <td style="text-align: justify; padding-top: 8px;">
            <strong>{{nama_konsumen}}</strong>, pemegang NIK: {{nik_konsumen}}, beralamat di {{alamat_konsumen}}, telepon: {{whatsapp_konsumen}}, selanjutnya disebut sebagai <strong>PIHAK KEDUA (PEMBELI)</strong>.
        </td>
    </tr>
</table>

<p style="font-size: 11px; line-height: 1.7; text-align: justify;">
    Kedua belah pihak sepakat mengikatkan diri dalam perjanjian jual beli unit kavling pada proyek <strong>{{nama_proyek}}</strong>, cluster <strong>{{nama_cluster}}</strong>, kode unit <strong>{{kode_unit}}</strong> seluas tanah {{luas_tanah}} dan luas bangunan {{luas_bangunan}} dengan nilai transaksi sebesar <strong>{{harga_total}}</strong> (<em>{{terbilang_harga_total}}</em>) melalui skema <strong>{{skema_pembayaran}}</strong>.
</p>

<div style="margin-top: 30px; text-align: center;">
    <table style="width: 100%; font-size: 11px;">
        <tr>
            <td style="width: 50%;">
                <p style="margin: 0;">PIHAK KEDUA (PEMBELI),</p>
                <div style="height: 60px;"></div>
                <p style="margin: 0; font-weight: bold; text-decoration: underline;">{{nama_konsumen}}</p>
            </td>
            <td style="width: 50%;">
                <p style="margin: 0;">PIHAK PERTAMA (PENJUAL),</p>
                <div style="height: 60px;"></div>
                <p style="margin: 0; font-weight: bold; text-decoration: underline;">{{nama_manager}}</p>
                <span style="font-size: 10px; color: #64748b;">{{nama_perusahaan}}</span>
            </td>
        </tr>
    </table>
</div>
',
                'footer_text' => 'Perjanjian Pengikatan Jual Beli (PPJB) Sah & Mengikat Para Pihak.',
                'is_default' => true,
                'created_by' => $creatorId,
            ]
        );

        // 4. Berita Acara Serah Terima (BAST) Kunci Unit
        DocumentTemplate::firstOrCreate(
            ['name' => 'Berita Acara Serah Terima (BAST) Fisik & Kunci'],
            [
                'category' => 'bast',
                'description' => 'Dokumen serah terima fisik bangunan, kelengkapan fasilitas, dan kunci rumah kepada konsumen.',
                'paper_size' => 'a4',
                'orientation' => 'portrait',
                'margin_top_mm' => 20,
                'margin_bottom_mm' => 20,
                'margin_left_mm' => 25,
                'margin_right_mm' => 20,
                'letterhead_mode' => 'default_company',
                'content_html' => '
<div style="text-align: center; margin-bottom: 20px;">
    <h3 style="margin: 0; font-size: 15px; font-weight: bold; text-transform: uppercase;">BERITA ACARA SERAH TERIMA (BAST)</h3>
    <h4 style="margin: 2px 0 0; font-size: 13px; font-weight: normal; color: #334155;">FISIK BANGUNAN DAN KUNCI RUMAH</h4>
    <p style="margin: 4px 0 0; font-size: 11px; color: #64748b; font-family: monospace;">Nomor: BAST/{{kode_unit}}/{{nomor_booking}}</p>
</div>

<p style="font-size: 11px; line-height: 1.6; text-align: justify;">
    Pada hari ini, tanggal <strong>{{tanggal_hari_ini}}</strong>, kami yang bertanda tangan di bawah ini telah melakukan serah terima fisik bangunan dan kunci unit rumah:
</p>

<table style="width: 100%; border-collapse: collapse; font-size: 11px; margin: 10px 0;">
    <tr><td style="width: 30%; padding: 4px 0;">Nama Konsumen</td><td style="width: 3%;">:</td><td style="width: 67%; font-weight: bold;">{{nama_konsumen}}</td></tr>
    <tr><td style="padding: 4px 0;">Unit Kavling</td><td>:</td><td style="font-weight: bold;">{{kode_unit}} &ndash; {{nama_cluster}}</td></tr>
    <tr><td style="padding: 4px 0;">Tipe Rumah</td><td>:</td><td>{{tipe_unit}} (LT: {{luas_tanah}} / LB: {{luas_bangunan}})</td></tr>
    <tr><td style="padding: 4px 0;">Proyek Perumahan</td><td>:</td><td>{{nama_proyek}}</td></tr>
</table>

<p style="font-size: 11px; line-height: 1.6; text-align: justify;">
    Pihak Konsumen telah memeriksa kondisi fisik bangunan, kelistrikan, dan sanitasi serta menyatakan menerima penyerahan kunci unit dalam keadaan baik dan sesuai dengan spesifikasi teknis yang disepakati.
</p>

<div style="margin-top: 40px;">
    <table style="width: 100%; font-size: 11px; text-align: center;">
        <tr>
            <td style="width: 50%;">
                <p style="margin: 0;">Yang Menerima (Konsumen),</p>
                <div style="height: 60px;"></div>
                <p style="margin: 0; font-weight: bold; text-decoration: underline;">{{nama_konsumen}}</p>
            </td>
            <td style="width: 50%;">
                <p style="margin: 0;">Yang Menyerahkan (Developer),</p>
                <div style="height: 60px;"></div>
                <p style="margin: 0; font-weight: bold; text-decoration: underline;">{{nama_manager}}</p>
                <span style="font-size: 10px; color: #64748b;">Project / Estate Manager</span>
            </td>
        </tr>
    </table>
</div>
',
                'footer_text' => 'Masa retensi dan garansi pemeliharaan berlaku selama 100 hari terhitung sejak tanggal penandatanganan BAST.',
                'is_default' => true,
                'created_by' => $creatorId,
            ]
        );
    }
}
