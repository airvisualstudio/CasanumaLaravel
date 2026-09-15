# 📋 Product Requirement Document (PRD)
**Project Title:** CRM & Centralized Housing Database (CRM & Database Perumahan)  
**Version:** 1.2.0 (First-Principle Sales Conversion & Multi-View Architecture)  
**Author:** Lead Dev / System Architect

---

## 1. Problem Statement
Developer perumahan dan tim agency sales menghadapi kendala operasional harian:
- Data ketersediaan unit (*stock unit*) sering bentrok (double booking) antara sales in-house dan broker luar.
- Riwayat follow-up calon pembeli (*leads*) tercecer di WhatsApp pribadi sales agent tanpa evaluasi terpusat dari manager.
- Rebutan database prospek dan manipulasi nomor kontak/identitas pembeli oleh sales agent.
- Prospek dingin/batal mengotori workspace utama, mengurangi fokus tim penjualan pada calon pembeli potensial.
- Pengarsipan berkas KPR (KTP, NPWP, Slip Gaji, Rekening Koran) tidak terpusat dan rawan hilang.
- Manajemen kesulitan memantau pipeline konversi dari status "Survei Lapangan" ke "Booking Fee".

---

## 2. Target Users & Personas
1. **Super Administrator (`superadmin`):**
   - Akses penuh seluruh konfigurasi sistem, database perumahan, pengelolaan role pengguna, bypass semua izin sistem, dan analitik bisnis global.
2. **Sales Manager (`sales_manager`):**
   - Supervisi pipeline penjualan, monitoring kinerja sales agent, distribusi dan re-assign alokasi leads baru, serta persetujuan pengajuan booking kavling.
3. **Sales Agent (`sales_agent`):**
   - Pengelolaan prospek leads pribadi, update progres follow-up konsumen, cek ketersediaan kavling unit, dan pembuatan tanda jadi (booking fee).
4. **Finance & KPR (`finance`):**
   - Validasi bukti pembayaran booking & DP, penerbitan tanda terima SPR, pemantauan berkas KPR bank, dan rekonsiliasi arus kas perumahan.

---

## 3. Core Features & Scope

### 3.1. Database Perumahan & Inventory Unit
- **Cluster & Site Plan Management:** Pengelompokan kavling berdasarkan Cluster, Blok, Tipe Rumah (LB/LT), dan Arah Hadap.
- **Unit Status Realtime Tracker:**
  - `Available` (Bisa dipesan)
  - `Reserved` (Tahan sementara 1x24 jam)
  - `Booked` (Sudah bayar tanda jadi)
  - `Sold` (Akad kredit / pelunasan selesai)
  - `Blocked` (Kendala legalitas / fasilitas umum)
- **Interactive Siteplan Integration:** Mapping SVG Element ID untuk visualisasi denah perumahan.
- **Pricelist & Skema Pembayaran:** Cash Keras, Cash Bertahap (12x/24x), dan Simulasi KPR Pokok.

### 3.2. Leads & CRM First-Principle Conversion Engine
- **Lead Temperature:** Indikator suhu prospek (🔥 Hot / Prioritas, ⚡ Warm / Menimbang, ❄️ Cold / Dingin) agar sales fokus pada pembeli siap closing.
- **SLA & Auto-Revoke Tracking:** Indikator batas waktu 7 hari tanpa tindak lanjut untuk mencegah prospek terbengkalai.
- **Internal Notes & Supervisor Thread:** Superadmin dan Manager dapat memberikan arahan langsung di bawah setiap log riwayat follow-up.
- **Proteksi Anti-Duplikasi & Auto-Assign:** Validasi unik nomor WhatsApp & NIK per proyek perumahan; auto-assign ke sales yang menginput dengan fitur re-assign bagi manager.
- **Audit Log Data Sensitif:** Pencatatan otomatis ke `activity_logs` dan timeline saat nomor WA, status, NIK, atau Sales PIC diubah.
- **Workspace Segregation (Archive & Blacklist Pool):** Pemisahan database antara Workspace Aktif dan Archive/Blacklist Pool (SLIK OJK Blacklist / Batal).
- **Kanban Board Prospek:** Pipeline visual (New Lead -> Kontak Pertama -> Jadwal Survei -> Survei Lokasi -> Negosiasi -> Booking).
- **Document Vault (KYC):** Upload file identitas pembeli (KTP, KK, NPWP, Slip Gaji, Rekening Koran) dengan secure viewer.

### 3.3. Transaksi Tanda Jadi & Pemberkasan KPR
- **Digital Booking & SPR Generator:** Registrasi booking unit dan pembuatan Surat Pemesanan Rumah (SPR) otomatis siap cetak.
- **Transaction Dossier 360°:** Rekam jejak utuh pembayaran tanda jadi, verifikasi finance, dan pelacakan akad KPR.
- **KPR Tracking Status:** SLIK OJK -> Analisa Berkas -> Surat Keputusan Kredit (SP3K) -> Jadwal Akad Kredit.

### 3.4. Multi-View Architecture (Card View Default)
- **Card View sebagai Default:** Seluruh tabel data (Leads, Units, Bookings, Users) secara default tampil dalam mode Card View.
- **Clickable Data Points:** Navigasi interaktif langsung dari kartu (klik nama untuk timeline, klik unit/booking untuk berkas, klik cluster/role/proyek untuk filter instan, klik email untuk mailto).
- **Paritas Tampilan:** Tombol switch Tabel View vs Card View tersedia dengan persistensi preferensi user di `localStorage`.

### 3.5. Analytics & Executive Dashboard
- Rasio konversi leads per channel (Meta Ads, Walk-In, Referral).
- Progress penjualan unit per cluster (persentase sold vs available).
- Leaderboard performa sales per bulan.

---

## 4. Non-Functional Requirements (NFR)
- **Responsiveness & Layout:** Tampilan dashboard ultra-responsif (`max-w-[1550px]`) dengan sticky collapsible sidebar (`w-64` ke `w-[72px]`) yang simetris presisi.
- **UI & Interaction Standardization:** Seluruh dialog interaksi, alert, dan konfirmasi modal wajib menggunakan standar shadcn `Dialog` (Radix UI) dengan larangan mutlak terhadap browser popup `alert()`.
- **Label & Badge Styling:** Badge statis murni bebas dari efek hover palsu (`hover:bg-*`). Efek hover hanya disematkan pada data points yang benar-benar interaktif.
- **Concurrency & Locking:** Mencegah double-booking kavling yang sama pada detik yang bersamaan via database row-locking.
- **Data Retention & Audit:** Perubahan status unit, nominal uang, dan data sensitif konsumen wajib memiliki audit trail (*who changed what and when*).
- **Role-Based Access Control:** Strict RBAC via `spatie/laravel-permission` pada PostgreSQL.

