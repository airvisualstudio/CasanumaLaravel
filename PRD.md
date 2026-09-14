# 📋 Product Requirement Document (PRD)
**Project Title:** CRM & Centralized Housing Database (CRM & Database Perumahan)  
**Version:** 1.0.0 (MVP Phase)  
**Author:** Lead Dev / System Architect

---

## 1. Problem Statement
Developer perumahan dan tim agency sales menghadapi kendala operasional harian:
- Data ketersediaan unit (*stock unit*) sering bentrok (double booking) antara sales in-house dan broker luar.
- Riwayat follow-up calon pembeli (*leads*) tercecer di WhatsApp pribadi sales agent.
- Pengarsipan berkas KPR (KTP, NPWP, Slip Gaji, Rekening Koran) tidak terpusat dan rawan hilang.
- Manajemen kesulitan memantau pipeline konversi dari status "Survei Lapangan" ke "Booking Fee".

---

## 2. Target Users & Personas
1. **Super Admin / Business Owner (Developer):**
   - Melihat dashboard aggregate: omzet penjualan, stok unit tersisa per cluster, performa sales.
2. **Sales Manager:**
   - Mendistribusikan leads ke sales agent, memantau funnel follow-up, approval diskon atau booking fee.
3. **Sales Agent:**
   - Menginput prospek baru, mencatat log aktivitas follow-up, mengecek site plan / ketersediaan kavling realtime.
4. **Admin Legal & KPR:**
   - Memvalidasi berkas customer, tracking status pengajuan bank rekanan (BI Checking/SLIK -> SP3K -> Akad).

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
- **Pricelist & Skema Pembayaran:** Cash Keras, Cash Bertahap (12x/24x), dan Simulasi KPR Pokok.

### 3.2. Leads & CRM Pipeline
- **Kanban Board Prospek:** Pipeline visual (New Lead -> Kontak Pertama -> Jadwal Survei -> Survei Lokasi -> Negosiasi -> Booking).
- **Activity Log & Notes:** Rekam jejak komunikasi (chat, telepon, meeting) dengan tanggal & rencana follow-up berikutnya.
- **Lead Assignment:** Penugasan manual oleh manager atau round-robin distribution.

### 3.3. Transaksi & Pemberkasan KPR
- **Digital Booking Form:** Pembuatan Surat Pesanan Rumah (SPR) otomatis dalam format PDF.
- **Document Vault (KYC):** Upload file identitas pembeli dengan secure viewer.
- **KPR Tracking Status:** SLIK OJK -> Analisa Berkas -> Surat Keputusan Kredit (SP3K) -> Jadwal Akad Kredit.

### 3.4. Analytics & Executive Dashboard
- Rasio konversi leads per channel (Meta Ads, Walk-In, Referral).
- Progress penjualan unit per cluster (persentase sold vs available).
- Leaderboard performa sales per bulan.

---

## 4. Non-Functional Requirements (NFR)
- **Responsiveness:** Tampilan dashboard desktop ultra-responsif; tampilan mobile-friendly untuk sales di lapangan.
- **Concurrency & Locking:** Mencegah double-booking kavling yang sama pada detik yang bersamaan.
- **Data Retention & Audit:** Perubahan status unit dan nominal uang wajib memiliki audit trail (*who changed what and when*).
