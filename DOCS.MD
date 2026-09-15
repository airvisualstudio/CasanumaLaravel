# 📚 CASANUMA CRM - Dokumentasi Sistem Terpadu

Dokumen ini merupakan indeks dokumentasi dan referensi arsitektur, modul bisnis, dan konvensi teknis yang berlaku di **CASANUMA CRM & Centralized Housing Database**.

---

## 🗂️ Indeks Dokumentasi Repositori

| File Dokumentasi | Deskripsi & Ruang Lingkup |
| :--- | :--- |
| **[`AGENTS.md`](file:///d:/90_ARCHIVE/nama-projek-lo/AGENTS.md)** | Pedoman baku dan aturan wajib pengembangan (UI shadcn, RBAC Spatie, Card View default, pembersihan efek hover statis). |
| **[`README.md`](file:///d:/90_ARCHIVE/nama-projek-lo/README.md)** | Gambaran umum proyek, setup environment, akun pengujian standar, dan panduan instalasi. |
| **[`PRD.md`](file:///d:/90_ARCHIVE/nama-projek-lo/PRD.md)** | Product Requirement Document (PRD v1.2.0) mencakup seluruh fitur CRM, modul inventory, transaksi, dan NFR. |
| **[`ARCHITECTURE.md`](file:///d:/90_ARCHIVE/nama-projek-lo/ARCHITECTURE.md)** | Cetak biru arsitektur sistem (Laravel 12, Inertia v2, PostgreSQL 16+, Spatie RBAC, dan Card-First Multi-View Pattern). |
| **[`FRONTEND.MD`](file:///d:/90_ARCHIVE/nama-projek-lo/FRONTEND.MD)** | Standar antarmuka pengguna: komponen shadcn/ui, sidebar simetris 36px, Card View default, dan aturan interaksi. |
| **[`TECH_STACK.md`](file:///d:/90_ARCHIVE/nama-projek-lo/TECH_STACK.md)** | Daftar dependensi resmi backend (Composer) dan frontend (Bun/NPM) yang tersinkronisasi otomatis. |
| **[`TASKS.md`](file:///d:/90_ARCHIVE/nama-projek-lo/TASKS.md)** | Roadmap implementasi, status sprint, checklist fitur terselesaikan, dan backlog mendatang. |
| **[`CLAUDE.md`](file:///d:/90_ARCHIVE/nama-projek-lo/CLAUDE.md)** | Panduan cepat konvensi koding dan perintah esensial bagi AI assistant / developer. |
| **[`walkthrough.md`](file:///d:/90_ARCHIVE/nama-projek-lo/walkthrough.md)** | Log rekam jejak teknis dan walkthrough implementasi fitur secara mendalam. |

---

## 🏢 Modul Bisnis Utama & Fungsionalitas

### 1. Manajemen Prospek Konsumen (`/leads`)
- **First-Principle Lead Engine:**
  - **Lead Temperature:** Prioritas prospek (🔥 Hot / Siap Closing, ⚡ Warm / Menimbang, ❄️ Cold / Dingin).
  - **SLA & Auto-Revoke:** Indikator batas waktu 7 hari tanpa interaksi untuk mencegah prospek terabaikan di satu sales.
  - **Internal Notes & Supervisor Thread:** Superadmin & Manager dapat meninggalkan arahan dan evaluasi langsung di tiap riwayat follow-up.
  - **Proteksi Anti-Duplikasi:** Validasi nomor WhatsApp dan NIK unik per proyek perumahan mencegah sengketa leads.
  - **Auto-Assign & Re-Assign:** Penugasan otomatis saat input leads oleh sales agent; kewenangan alih sales (*re-assign*) oleh Manager/Superadmin.
  - **Audit Log Perubahan Sensitif:** Pencatatan otomatis ke `activity_logs` dan timeline interaksi saat terjadi perubahan kontak WhatsApp, status tahapan, NIK, atau Sales PIC.
  - **Workspace Segregation:** Pemisahan ruang kerja antara **🟢 Workspace Prospek Aktif** dan **🗄️ Archive & Blacklist Pool** (batal/lost atau SLIK OJK Blacklist).
  - **Customer Document Vault:** Penyimpanan dokumen identitas dan persyaratan KPR (KTP, KK, NPWP, Slip Gaji, Rekening Koran).

### 2. Katalog Perumahan & Kavling Unit (`/properties`, `/properties/units`)
- **Struktur Hierarki Kawasan:** Developer ➔ Proyek Kawasan ➔ Cluster ➔ Tipe Rumah ➔ Kavling Unit.
- **Siteplan Master Integration:** Pemetaan unit kavling ke denah visual SVG melalui atribut `svg_element_id`.
- **Status Unit Realtime:** `Available`, `Reserved`, `Booked`, `Sold`, `Blocked`.
- **Interaksi Kartu:** Klik langsung pada kode unit untuk membuka form edit, filter cluster/tipe, dan cek transaksi aktif unit.

### 3. Transaksi Tanda Jadi & Dokumen SPR (`/bookings`)
- **Registrasi Booking Fee (UTJ):** Penguncian kavling unit saat tanda jadi dibayarkan.
- **Skema Pembayaran:** Cash Keras, Cash Bertahap (In-house), dan KPR Bank.
- **Digital SPR Generator:** Pembuatan Surat Pemesanan Rumah (SPR) otomatis siap cetak dengan layout presisi.
- **Transaction Dossier 360°:** Modal komprehensif menampilkan data pemesan, unit properti, riwayat validasi pembayaran tanda jadi, dan status berkas KPR.

### 4. Direktori Staf & RBAC Manajemen (`/users`)
- **4 Peran Baku Spatie:** `superadmin`, `sales_manager`, `sales_agent`, `finance`.
- **Manajemen Akun:** Form registrasi staf, alokasi peran, nomor NIP, kontak WhatsApp, rekening bank komisi, dan foto profil dengan cropper interaktif.
- **Keamanan Akun:** Fitur Force Reset Password oleh Superadmin dan status aktif/nonaktif akun.

### 5. Audit Trail & Integrasi Bot Telegram (`/settings/activity-logs`)
- **Pencatatan Aktivitas Otomatis:** Setiap mutasi akun, data sensitif konsumen, transaksi, dan setting terekam lengkap dengan IP address, perangkat, dan diff perubahan.
- **Bot Telegram Dispatcher:** Notifikasi HTML real-time otomatis terkirim ke grup/chat Telegram manajerial saat aktivitas audit tercatat.

### 6. Card-First Multi-View Standard
- **Default ke Card View:** Seluruh halaman master data menampilkan Card View secara default pada kunjungan pertama.
- **Navigasi Data Interaktif:** Titik-titik data (nama konsumen, kode booking, nomor unit, cluster, proyek, email, role) dapat diklik langsung untuk membuka modal, filter, berkas, atau email.
- **Pembersihan Efek Hover:** Label status murni (Badge statis) tidak memiliki efek hover palsu, menjaga kenyamanan visual.

---

## 🧪 Metrik Verifikasi Kualitas Sistem

- **Automated Test Suite (`php artisan test`):** **162 tests passed, 780 assertions (100% Green)**.
- **Frontend Compilation (`bun run build`):** Sukses tanpa error tipe TypeScript (`exit code 0`).
