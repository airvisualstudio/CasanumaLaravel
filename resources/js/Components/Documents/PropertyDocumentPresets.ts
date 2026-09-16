export interface PropertyPresetTemplate {
    id: string;
    title: string;
    category: 'spr' | 'receipt' | 'bast' | 'official_letter' | 'ppjb' | 'custom';
    categoryLabel: string;
    badgeColor: string;
    description: string;
    paperSize: 'a4' | 'f4';
    orientation: 'portrait' | 'landscape';
    watermarkPreset?: string;
    contentHtml: string;
}

export const PROPERTY_DOCUMENT_PRESETS: PropertyPresetTemplate[] = [
    {
        id: 'spr_standard',
        title: 'Surat Pesanan Rumah (SPR) Resmi',
        category: 'spr',
        categoryLabel: 'SPR Properti',
        badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
        description: 'Format baku pemesanan unit properti lengkap dengan spesifikasi kavling, rincian harga transaksi, 4 klausul pembatalan, dan blok tanda tangan bermaterai Rp 10.000.',
        paperSize: 'a4',
        orientation: 'portrait',
        contentHtml: `
<h2>SURAT PESANAN RUMAH (SPR)</h2>
<p>Nomor: <strong>{{nomor_spr}}</strong> &nbsp;&nbsp;|&nbsp;&nbsp; Tanggal: <strong>{{tanggal_transaksi}}</strong></p>
<p>Pada hari ini telah disepakati pemesanan unit hunian properti antara Konsumen dan Pengembang dengan ketentuan sebagai berikut:</p>

<table style="width: 100%; border-collapse: collapse; margin: 14px 0;">
    <thead>
        <tr style="background-color: #f1f5f9;">
            <th colspan="2" style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left; font-size: 11px; font-weight: bold; text-transform: uppercase;">A. DATA PEMESAN (KONSUMEN)</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; width: 35%;">Nama Lengkap</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; font-weight: bold;">{{nama_konsumen}}</td>
        </tr>
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px;">Nomor KTP / NIK</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; font-mono;">{{nik_konsumen}}</td>
        </tr>
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px;">Nomor Telepon / WhatsApp</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px;">{{telepon_konsumen}}</td>
        </tr>
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px;">Alamat Domisili</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px;">{{alamat_konsumen}}</td>
        </tr>
    </tbody>
</table>

<table style="width: 100%; border-collapse: collapse; margin: 14px 0;">
    <thead>
        <tr style="background-color: #f1f5f9;">
            <th colspan="2" style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left; font-size: 11px; font-weight: bold; text-transform: uppercase;">B. DATA UNIT & SPESIFIKASI KAVLING</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; width: 35%;">Kawasan Proyek & Cluster</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; font-weight: bold;">{{nama_proyek}} (Cluster {{nama_cluster}})</td>
        </tr>
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px;">Blok / Nomor Kavling</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; font-weight: bold; color: #0284c7;">Blok {{nomor_kavling}}</td>
        </tr>
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px;">Tipe Bangunan / Luas</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px;">{{tipe_unit}} (LT {{luas_tanah}} m² / LB {{luas_bangunan}} m²)</td>
        </tr>
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px;">Total Nilai Transaksi</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; font-weight: bold;">{{harga_total}}</td>
        </tr>
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px;">Terbilang</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; font-style: italic;">{{nominal_terbilang}}</td>
        </tr>
    </tbody>
</table>

<p style="font-size: 10.5px; font-weight: bold; margin-top: 10px;">C. KETENTUAN DAN KESEPAKATAN PEMESANAN:</p>
<ol style="font-size: 10px; line-height: 1.5; color: #334155; margin-left: 16px;">
    <li>Uang tanda jadi (booking fee) sebesar <strong>{{booking_fee}}</strong> mengikat kavling dan tidak dapat ditarik kembali apabila pemohon mengundurkan diri sepihak.</li>
    <li>Pelunasan Uang Muka (DP) wajib dibayarkan sesuai jadwal tahapan yang disepakati selambat-lambatnya 14 (empat belas) hari kerja setelah SPR ini ditandatangani.</li>
    <li>Apabila proses pengajuan KPR bank ditolak bukan karena kelalaian dokumen konsumen, pengembalian dana mengikuti kebijakan retensi operasional yang berlaku.</li>
    <li>Harga jual sudah termasuk penyambungan listrik PLN, instalasi air bersih, dan pemecahan sertifikat induk ke SHM / HGB.</li>
</ol>

<table style="width: 100%; border-collapse: collapse; margin-top: 28px; border: none;">
    <tbody>
        <tr>
            <td style="width: 50%; border: none; text-align: center; vertical-align: top; padding: 8px;">
                <p style="font-size: 11px; margin-bottom: 6px; font-weight: 600;">Pihak Pemesan (Konsumen),</p>
                <div style="width: 110px; height: 65px; border: 1.5px dashed #94a3b8; background-color: #f8fafc; margin: 0 auto; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 6px;">
                    <span style="font-size: 7.5px; font-weight: bold; color: #64748b;">MATERAI</span>
                    <span style="font-size: 10px; font-weight: 800; color: #0284c7;">Rp 10.000</span>
                </div>
                <div style="height: 10px;"></div>
                <p style="font-weight: bold; font-size: 11px; text-decoration: underline;">{{nama_konsumen}}</p>
                <p style="font-size: 10px; color: #64748b;">NIK: {{nik_konsumen}}</p>
            </td>
            <td style="width: 50%; border: none; text-align: center; vertical-align: top; padding: 8px;">
                <p style="font-size: 11px; margin-bottom: 6px; font-weight: 600;">Disetujui Oleh (Pengembang),</p>
                <div style="margin: 4px auto; height: 65px; display: flex; align-items: center; justify-content: center;">{{qr_manager}}</div>
                <div style="height: 10px;"></div>
                <p style="font-weight: bold; font-size: 11px; text-decoration: underline;">{{nama_manager}}</p>
                <p style="font-size: 10px; color: #64748b;">Sales & Operational Manager</p>
            </td>
        </tr>
    </tbody>
</table>
<p></p>
`,
    },
    {
        id: 'receipt_standard',
        title: 'Kwitansi Tanda Jadi / Pembayaran Resmi',
        category: 'receipt',
        categoryLabel: 'Kwitansi Keuangan',
        badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
        description: 'Tanda terima pembayaran sah kasir/finance dengan nominal terbilang otomatis, rincian nomor kavling, stempel digital, dan QR verification code.',
        paperSize: 'a4',
        orientation: 'portrait',
        contentHtml: `
<div style="text-align: center; margin-bottom: 16px;">
    <h2 style="letter-spacing: 1px; font-size: 18px; margin-bottom: 4px;">BUKTI PENERIMAAN DANA (KWITANSI)</h2>
    <p style="font-size: 11px; font-mono; color: #64748b;">NO. TRANSAKSI: <strong>{{nomor_kwitansi}}</strong></p>
</div>

<table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
    <tbody>
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 11px; width: 30%;">Telah Diterima Dari</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 11px; font-weight: bold;">{{nama_konsumen}} (NIK: {{nik_konsumen}})</td>
        </tr>
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 11px;">Sejumlah Uang</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 13px; font-weight: 800; color: #0f766e;">{{nominal_bayar}}</td>
        </tr>
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 11px;">Terbilang</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 11px; font-style: italic; background-color: #f8fafc;"># {{nominal_terbilang}} #</td>
        </tr>
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 11px;">Untuk Pembayaran</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 11px;">
                <strong>{{jenis_pembayaran}}</strong> unit properti Blok <strong>{{nomor_kavling}}</strong>, Cluster {{nama_cluster}} pada kawasan <strong>{{nama_proyek}}</strong>.
            </td>
        </tr>
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 11px;">Metode Pembayaran</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 11px;">Transfer Rekening Resmi PT CASANUMA MODERN LIVING</td>
        </tr>
    </tbody>
</table>

<table style="width: 100%; border-collapse: collapse; margin-top: 36px; border: none;">
    <tbody>
        <tr>
            <td style="width: 50%; border: none; text-align: left; vertical-align: top; padding: 8px;">
                <p style="font-size: 10px; color: #64748b; line-height: 1.4;">
                    * Pembayaran sah apabila dana efektif masuk ke rekening koran perusahaan.<br/>
                    * Simpan bukti kwitansi asli ini sebagai kelengkapan verifikasi saat penandatanganan PPJB / BAST.
                </p>
            </td>
            <td style="width: 50%; border: none; text-align: center; vertical-align: top; padding: 8px;">
                <p style="font-size: 11px; margin-bottom: 6px;">Bandung, {{tanggal_transaksi}}</p>
                <p style="font-size: 11px; font-weight: 600; margin-bottom: 6px;">Bagian Keuangan (Finance),</p>
                <div style="margin: 4px auto; height: 60px; display: flex; align-items: center; justify-content: center;">{{qr_manager}}</div>
                <p style="font-weight: bold; font-size: 11px; text-decoration: underline;">{{nama_manager}}</p>
                <p style="font-size: 10px; color: #64748b;">Finance & Treasury Dept.</p>
            </td>
        </tr>
    </tbody>
</table>
<p></p>
`,
    },
    {
        id: 'bast_standard',
        title: 'Berita Acara Serah Terima Fisik (BAST)',
        category: 'bast',
        categoryLabel: 'Serah Terima Unit',
        badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
        description: 'Legalitas serah terima fisik kunci rumah, meteran PLN & air, klausul retensi garansi bangunan 100 hari kalender, dan tanda tangan 3 pihak bersama pengawas lapangan.',
        paperSize: 'a4',
        orientation: 'portrait',
        contentHtml: `
<div style="text-align: center; margin-bottom: 16px;">
    <h2 style="letter-spacing: 0.5px; font-size: 16px; margin-bottom: 2px;">BERITA ACARA SERAH TERIMA FISIK BANGUNAN (BAST)</h2>
    <p style="font-size: 11px; color: #64748b;">Nomor: BAST/{{nomor_kavling}}/{{tanggal_transaksi}}</p>
</div>

<p style="font-size: 11px;">Pada hari ini, <strong>{{tanggal_transaksi}}</strong>, bertempat di lokasi proyek <strong>{{nama_proyek}}</strong>, telah dilaksanakan serah terima fisik bangunan antara:</p>

<ol style="font-size: 11px; line-height: 1.5; margin-left: 18px;">
    <li><strong>PT CASANUMA MODERN LIVING</strong>, berkedudukan sebagai Developer / Pengembang, selanjutnya disebut <strong>PIHAK PERTAMA</strong>.</li>
    <li><strong>{{nama_konsumen}}</strong>, pemegang NIK <strong>{{nik_konsumen}}</strong>, bertindak selaku Pemilik / Pembeli, selanjutnya disebut <strong>PIHAK KEDUA</strong>.</li>
</ol>

<p style="font-size: 11px; margin-top: 10px;">Kedua belah pihak sepakat melakukan serah terima fisik atas obyek bangunan rumah tinggal dengan rincian:</p>

<table style="width: 100%; border-collapse: collapse; margin: 12px 0;">
    <tbody>
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 10.5px; width: 35%;">Alamat / Blok Unit</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 10.5px; font-weight: bold;">Blok {{nomor_kavling}}, Cluster {{nama_cluster}}, {{nama_proyek}}</td>
        </tr>
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 10.5px;">Tipe Bangunan</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 10.5px;">{{tipe_unit}} (Luas Tanah {{luas_tanah}} m² / Luas Bangunan {{luas_bangunan}} m²)</td>
        </tr>
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 10.5px;">Daya Listrik PLN</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 10.5px;">2.200 VA (Prabayar / Token) - Berfungsi Normal</td>
        </tr>
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 10.5px;">Suplai Air Bersih</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 10.5px;">PDAM / Sumur Bor Artesis Terintegrasi - Berfungsi Normal</td>
        </tr>
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 10.5px;">Kunci Fisik Diserahkan</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 10.5px;">3 Set Kunci Pintu Utama, 2 Set Kunci Kamar, 1 Set Kunci Belakang</td>
        </tr>
    </tbody>
</table>

<p style="font-size: 10.5px; line-height: 1.5; color: #334155;">
    <strong>KLAUSUL MASA PEMELIHARAAN (RETENSI):</strong><br/>
    PIHAK PERTAMA memberikan jaminan pemeliharaan kebocoran atap dan keretakan dinding non-struktural selama <strong>100 (seratus) hari kalender</strong> terhitung sejak tanggal BAST ini ditandatangani. Perubahan denah atau renovasi oleh PIHAK KEDUA dalam masa garansi menggugurkan tanggung jawab retensi pengembang.
</p>

<table style="width: 100%; border-collapse: collapse; margin-top: 30px; border: none;">
    <tbody>
        <tr>
            <td style="width: 33.33%; border: none; text-align: center; vertical-align: top; padding: 6px;">
                <p style="font-size: 11px; margin-bottom: 6px; font-weight: 600;">PIHAK KEDUA (Konsumen),</p>
                <div style="width: 95px; height: 60px; border: 1.5px dashed #94a3b8; background-color: #f8fafc; margin: 0 auto; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 4px;">
                    <span style="font-size: 7px; font-weight: bold; color: #64748b;">MATERAI</span>
                    <span style="font-size: 9px; font-weight: 800; color: #0284c7;">10.000</span>
                </div>
                <div style="height: 8px;"></div>
                <p style="font-weight: bold; font-size: 11px; text-decoration: underline;">{{nama_konsumen}}</p>
                <p style="font-size: 9.5px; color: #64748b;">Pemilik Unit</p>
            </td>
            <td style="width: 33.33%; border: none; text-align: center; vertical-align: top; padding: 6px;">
                <p style="font-size: 11px; margin-bottom: 6px; font-weight: 600;">PIHAK PERTAMA (Developer),</p>
                <div style="margin: 2px auto; height: 60px; display: flex; align-items: center; justify-content: center;">{{qr_manager}}</div>
                <div style="height: 8px;"></div>
                <p style="font-weight: bold; font-size: 11px; text-decoration: underline;">{{nama_manager}}</p>
                <p style="font-size: 9.5px; color: #64748b;">Project Director</p>
            </td>
            <td style="width: 33.33%; border: none; text-align: center; vertical-align: top; padding: 6px;">
                <p style="font-size: 11px; margin-bottom: 6px; font-weight: 600;">Pengawas Lapangan (QC),</p>
                <div style="height: 68px;"></div>
                <p style="font-weight: bold; font-size: 11px; text-decoration: underline;">( ......................................... )</p>
                <p style="font-size: 9.5px; color: #64748b;">Site Civil Engineer</p>
            </td>
        </tr>
    </tbody>
</table>
<p></p>
`,
    },
    {
        id: 'kpr_invitation',
        title: 'Surat Undangan Akad Kredit (KPR Bank)',
        category: 'official_letter',
        categoryLabel: 'Surat Resmi KPR',
        badgeColor: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30',
        description: 'Pemberitahuan resmi jadwal akad kredit bank pelaksana KPR pasca terbit SP3K, rincian biaya pra-akad, dan daftar checklist berkas dokumen fisik yang wajib dibawa.',
        paperSize: 'a4',
        orientation: 'portrait',
        contentHtml: `
<p style="font-size: 11px;">Nomor: <strong>UND-AKAD/{{nomor_kavling}}/2026</strong><br/>Lampiran: 1 (satu) Berkas<br/>Perihal: <strong>Undangan Pelaksanaan Wawancara & Penandatanganan Akad Kredit KPR</strong></p>

<p style="font-size: 11px; margin-top: 14px;">Kepada Yth.<br/>Bapak/Ibu <strong>{{nama_konsumen}}</strong><br/>Di Tempat</p>

<p style="font-size: 11px; margin-top: 14px; text-align: justify; line-height: 1.5;">
    Dengan hormat,<br/>
    Sehubungan dengan telah diterbitkannya Surat Penegasan Persetujuan Penyediaan Kredit (SP3K) dari Bank rekanan kami untuk pembelian unit properti pada kawasan <strong>{{nama_proyek}}</strong> Blok <strong>{{nomor_kavling}}</strong>, maka bersama surat ini kami mengundang Bapak/Ibu untuk hadir pada prosesi Akad Kredit yang akan diselenggarakan pada:
</p>

<table style="width: 100%; border-collapse: collapse; margin: 12px 0; border: none;">
    <tbody>
        <tr>
            <td style="width: 25%; font-size: 11px; padding: 4px 0; font-weight: 600;">Hari / Tanggal</td>
            <td style="font-size: 11px; padding: 4px 0;">: Sesuai Konfirmasi Jadwal Bank</td>
        </tr>
        <tr>
            <td style="width: 25%; font-size: 11px; padding: 4px 0; font-weight: 600;">Waktu</td>
            <td style="font-size: 11px; padding: 4px 0;">: 09.30 WIB s/d Selesai</td>
        </tr>
        <tr>
            <td style="width: 25%; font-size: 11px; padding: 4px 0; font-weight: 600;">Tempat</td>
            <td style="font-size: 11px; padding: 4px 0;">: Kantor Cabang Bank Pelaksana KPR / Kantor Notaris Rekanan</td>
        </tr>
        <tr>
            <td style="width: 25%; font-size: 11px; padding: 4px 0; font-weight: 600;">Obyek Unit</td>
            <td style="font-size: 11px; padding: 4px 0;">: Blok {{nomor_kavling}} - Cluster {{nama_cluster}}</td>
        </tr>
    </tbody>
</table>

<p style="font-size: 11px; font-weight: bold; margin-top: 10px;">BERKAS DOKUMEN FISIK YANG WAJIB DIBAWA (ASLI & 2 RANGKAP FOTOCOPY):</p>
<ul style="font-size: 10.5px; line-height: 1.5; color: #334155; margin-left: 16px;">
    <li>E-KTP Asli Pemohon & Pasangan (Bagi yang telah menikah).</li>
    <li>Kartu Keluarga (KK) Asli terbaru & Buku / Akta Nikah Asli.</li>
    <li>NPWP Pribadi Pemohon Asli.</li>
    <li>Buku Tabungan Rekening Bank Pelaksana dengan saldo biaya pra-akad mencukupi.</li>
    <li>Materai Tempel Rp 10.000 sebanyak 6 (enam) lembar.</li>
</ul>

<p style="font-size: 11px; line-height: 1.5; margin-top: 12px;">
    Mengingat pentingnya proses legalitas ini, kehadiran pemohon dan pasangan tidak dapat diwakilkan. Atas perhatian dan kerjasama Bapak/Ibu, kami ucapkan terima kasih.
</p>

<table style="width: 100%; border-collapse: collapse; margin-top: 28px; border: none;">
    <tbody>
        <tr>
            <td style="width: 60%; border: none;"></td>
            <td style="width: 40%; border: none; text-align: center;">
                <p style="font-size: 11px; margin-bottom: 6px;">Hormat Kami,</p>
                <p style="font-size: 11px; font-weight: bold;">PT CASANUMA MODERN LIVING</p>
                <div style="margin: 6px auto; height: 60px; display: flex; align-items: center; justify-content: center;">{{qr_manager}}</div>
                <p style="font-weight: bold; font-size: 11px; text-decoration: underline;">{{nama_manager}}</p>
                <p style="font-size: 10px; color: #64748b;">Legal & KPR Coordinator</p>
            </td>
        </tr>
    </tbody>
</table>
<p></p>
`,
    },
    {
        id: 'sp1_billing',
        title: 'Surat Peringatan Tagihan Angsuran (SP-1)',
        category: 'official_letter',
        categoryLabel: 'Pemberitahuan Tagihan',
        badgeColor: 'bg-rose-500/10 text-rose-600 border-rose-500/30',
        description: 'Surat penagihan resmi angsuran/DP tahap berikutnya yang telah melampaui tanggal jatuh tempo, lengkap dengan nomor rekening transfer developer.',
        paperSize: 'a4',
        orientation: 'portrait',
        watermarkPreset: 'SURAT PERINGATAN',
        contentHtml: `
<p style="font-size: 11px;">Nomor: <strong>SP1/FIN/{{nomor_kavling}}/2026</strong><br/>Perihal: <strong>Pemberitahuan Jatuh Tempo Pembayaran Angsuran (SP-1)</strong></p>

<p style="font-size: 11px; margin-top: 14px;">Kepada Yth.<br/>Bapak/Ibu <strong>{{nama_konsumen}}</strong><br/>Pemesan Unit Blok <strong>{{nomor_kavling}}</strong> - {{nama_proyek}}<br/>Di Tempat</p>

<p style="font-size: 11px; margin-top: 14px; text-align: justify; line-height: 1.5;">
    Dengan hormat,<br/>
    Berdasarkan catatan pembukuan administrasi keuangan kami terkait transaksi pemesanan unit rumah tinggal pada kawasan <strong>{{nama_proyek}}</strong> Blok <strong>{{nomor_kavling}}</strong>, bersama ini kami sampaikan bahwa terdapat kewajiban angsuran yang telah melampaui tanggal jatuh tempo:
</p>

<table style="width: 100%; border-collapse: collapse; margin: 12px 0;">
    <thead>
        <tr style="background-color: #f1f5f9;">
            <th style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left; font-size: 10.5px;">Keterangan Kewajiban</th>
            <th style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: right; font-size: 10.5px;">Jumlah Tunggakan</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 10.5px;">Kewajiban Uang Muka / Angsuran Pokok</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 10.5px; font-weight: bold; text-align: right; color: #dc2626;">{{nominal_bayar}}</td>
        </tr>
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 10.5px;">Nomor Rekening Tujuan Transfer</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 10.5px; font-mono; text-align: right;">BCA 7720991823 a/n PT Casanuma Modern Living</td>
        </tr>
    </tbody>
</table>

<p style="font-size: 11px; line-height: 1.5; text-align: justify;">
    Kami memohon kesediaan Bapak/Ibu untuk melakukan penyelesaian kewajiban di atas dalam kurun waktu <strong>7 (tujuh) hari kalender</strong> sejak diterbitkannya surat ini. Apabila Bapak/Ibu telah melakukan pembayaran sebelum surat ini sampai, mohon abaikan surat ini dan kirimkan bukti setor ke WhatsApp Finance kami.
</p>

<table style="width: 100%; border-collapse: collapse; margin-top: 28px; border: none;">
    <tbody>
        <tr>
            <td style="width: 60%; border: none;"></td>
            <td style="width: 40%; border: none; text-align: center;">
                <p style="font-size: 11px; margin-bottom: 6px;">Bandung, {{tanggal_transaksi}}</p>
                <p style="font-size: 11px; font-weight: bold;">Departemen Finance & Treasury,</p>
                <div style="margin: 6px auto; height: 60px; display: flex; align-items: center; justify-content: center;">{{qr_manager}}</div>
                <p style="font-weight: bold; font-size: 11px; text-decoration: underline;">{{nama_manager}}</p>
                <p style="font-size: 10px; color: #64748b;">Finance Collection Manager</p>
            </td>
        </tr>
    </tbody>
</table>
<p></p>
`,
    },
];
