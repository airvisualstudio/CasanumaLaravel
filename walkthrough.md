# Walkthrough: CASANUMA CRM - Implementasi Fitur & Arsitektur Terpadu

Rangkuman implementasi fitur, standarisasi antarmuka, pengujian, dan arsitektur terkini dari **CASANUMA CRM & Centralized Housing Database**:

---

## 1. Leads Management & First-Principle Conversion Engine
1. **Audit Log Perubahan Data Sensitif:** Mencatat riwayat perubahan data sensitif konsumen (No. WhatsApp, Status Tahapan Pipeline, Sales PIC, NIK, Nama Konsumen) untuk mencegah kecurangan, pencurian prospek, atau sengketa antar sales.
2. **Archive / Blacklist Pool:** Pemisahan database prospek menjadi dua ruang kerja (`Workspace Prospek Aktif` vs `Archive & Blacklist Pool`), menjaga workspace utama tetap bersih dari prospek yang sudah batal, mati, atau berstatus Blacklist SLIK/BI Checking.
3. **Internal Notes & Supervisor Thread:** Superadmin & Sales Manager dapat meninggalkan arahan atau evaluasi langsung di tiap riwayat follow-up.
4. **Proteksi Anti-Duplikasi & Auto-Assign:** Validasi unik nomor WhatsApp & NIK per proyek perumahan; auto-assign ke sales yang menginput dengan fitur re-assign bagi manager.
5. **Lead Temperature & SLA Indicator:** Prioritas prospek (🔥 Hot, ⚡ Warm, ❄️ Cold) dan pemantauan batas SLA 7 hari tanpa follow-up.

---

## 2. Table View vs Card View Switcher (Multi-View Layout)

Sesuai kebutuhan operasional visual CRM, fitur view toggle interaktif telah diterapkan di semua modul data utama:

### Modul yang Didukung:
1. **Daftar Unit Properti** ([Units/Index.tsx](file:///D:/90_ARCHIVE/nama-projek-lo/resources/js/Pages/Properties/Units/Index.tsx))
   - **Tabel View:** Tampilan tabular dengan kolom Kode & Blok, Cluster, Tipe Rumah, Harga Dasar, Status Unit, PIC Konsumen/Sales, dan Aksi.
   - **Card View:** Grid kartu responsif (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`) dengan badge status unit warna-warni, spesifikasi LT/LB, harga berformat Rupiah, info booking terikat, serta tombol aksi cepat (Quick Status, Edit, Delete).
   - **Penyimpanan State:** Tersimpan di `localStorage` (`units_view_mode_v2`).

2. **Daftar Prospek Konsumen** ([Leads/Index.tsx](file:///D:/90_ARCHIVE/nama-projek-lo/resources/js/Pages/Leads/Index.tsx))
   - **Tabel View:** Kolom No, Konsumen & Kontak, Proyek Peminatan, Kavling/Arsip, Sales PIC, Sumber Prospek, Status Pipeline, Catatan, dan Aksi.
   - **Card View:** Grid kartu terperinci dengan badge prioritas (Hot/Warm/Cold), status SLA & SLIK, kontak click-to-chat WA, preferensi unit/budget, status pipeline interaktif, info booking, serta action toolbar (Timeline, Dokumen KYC, Re-assign, Archive/Restore, Edit, Delete).
   - **Penyimpanan State:** Tersimpan di `localStorage` (`leads_view_mode_v2`).

3. **Transaksi Booking & Dokumen SPR** ([Bookings/Index.tsx](file:///D:/90_ARCHIVE/nama-projek-lo/resources/js/Pages/Bookings/Index.tsx))
   - **Tabel View:** Kolom No. Booking & SPR, Konsumen, Unit Kavling, Skema & Nilai Transaksi, Status Progres, Sales PIC, dan Aksi.
   - **Card View:** Grid kartu transaksional dengan kode booking terhubung ke Dossier 360°, status transaksi, rincian konsumen & WhatsApp, objek kavling, rincian harga dasar & UTJ, skema pembayaran, tombol cetak SPR/Dossier, dan batalkan booking.
   - **Penyimpanan State:** Tersimpan di `localStorage` (`bookings_view_mode_v2`).

4. **Direktori Staf & Pengguna CRM** ([Users/Index.tsx](file:///D:/90_ARCHIVE/nama-projek-lo/resources/js/Pages/Users/Index.tsx))
   - **Tabel View:** Profil Pengguna, Peran & Jabatan, Kontak & Domisili, Rekening Komisi, Status, dan Aksi.
   - **Card View:** Grid kartu profil pengguna dengan Avatar foto/inisial, NIP, badge peran Spatie, toggle status aktif/nonaktif, kontak WA, info rekening bank, tombol Detail Profil, Reset Password, Edit, dan Hapus.
   - **Penyimpanan State:** Tersimpan di `localStorage` (`users_view_mode_v2`).

---

## 3. Card View Default & Navigasi Interaktif Sesuai Data (Clickable Data Points)

Sesuai permintaan: *"jadikan view card di semua tabel itu default nya, lalu bisa di klik sesuai datanya"*:

### A. Default View Card di Semua Tabel
- Seluruh modul data utama ([Units](file:///D:/90_ARCHIVE/nama-projek-lo/resources/js/Pages/Properties/Units/Index.tsx), [Leads](file:///D:/90_ARCHIVE/nama-projek-lo/resources/js/Pages/Leads/Index.tsx), [Bookings](file:///D:/90_ARCHIVE/nama-projek-lo/resources/js/Pages/Bookings/Index.tsx), dan [Users](file:///D:/90_ARCHIVE/nama-projek-lo/resources/js/Pages/Users/Index.tsx)) kini **otomatis default ke Card View (`'card'`)**.
- Menggunakan skema kunci penyimpanan versi baru (`*_view_mode_v2`) di `localStorage`, memastikan pengguna lama maupun baru langsung disuguhkan tampilan Card View secara default saat membuka aplikasi.
- Tombol toggle Tabel View vs Card View tetap aktif untuk fleksibilitas pengguna jika sewaktu-waktu ingin beralih ke tabel tabular.

### B. Titik Data Interaktif (Clickable Sesuai Konteks)
Elemen data pada setiap kartu kini responsif terhadap klik sesuai konteks data:

1. **Kartu Prospek Konsumen ([Leads/Index.tsx](file:///D:/90_ARCHIVE/nama-projek-lo/resources/js/Pages/Leads/Index.tsx)):**
   - **Nama Konsumen:** Klik nama langsung membuka riwayat follow-up & timeline interaksi konsumen (`handleOpenTimeline(lead)`).
   - **Email:** Terhubung ke tautan `mailto:`, siap mengirim email langsung dari client mail pengguna.
   - **Proyek Peminatan:** Klik nama proyek untuk langsung menyaring (filter) daftar prospek sesuai proyek perumahan tersebut.
   - **Kotak Unit / Booking:** Klik kontainer booking (`A1/02`, `BK-202609-0002`) untuk langsung membuka transaksi terkait di halaman **Transaksi Booking**.
   - **Preferensi Unit:** Klik tipe unit untuk mencari unit yang relevan di daftar unit.
   - **Sales PIC & Status Pipeline:** Mempertahankan aksi klik cepat (modal re-assign dan modal ganti status pipeline).

2. **Kartu Unit Properti ([Units/Index.tsx](file:///D:/90_ARCHIVE/nama-projek-lo/resources/js/Pages/Properties/Units/Index.tsx)):**
   - **Kode Unit (`unit_code`):** Klik kode unit untuk langsung membuka modal edit unit.
   - **Cluster & Tipe Rumah:** Klik nama cluster atau tipe unit untuk memfilter unit yang sejenis.
   - **Kotak Booking Terikat:** Klik untuk langsung diarahkan ke halaman transaksi booking dengan nomor tanda jadi unit tersebut.
   - **WhatsApp Konsumen:** Memiliki `e.stopPropagation()` sehingga klik kontak WA langsung membuka obrolan tanpa memicu navigasi kartu.

3. **Kartu Transaksi Booking ([Bookings/Index.tsx](file:///D:/90_ARCHIVE/nama-projek-lo/resources/js/Pages/Bookings/Index.tsx)):**
   - **Nama Konsumen:** Klik nama konsumen untuk langsung membuka prospek terkait di halaman Prospek Konsumen.
   - **Badge Blok Unit:** Klik blok unit untuk langsung mencari dan melihat spesifikasi unit di Daftar Unit.
   - **Kode Transaksi (`booking_code`):** Klik kode transaksi untuk membuka **Dossier 360° Transaksi & Riwayat Pembayaran**.
   - **Nama Proyek:** Klik untuk menyaring daftar transaksi berdasarkan proyek perumahan.

4. **Kartu Direktori Pengguna ([Users/Index.tsx](file:///D:/90_ARCHIVE/nama-projek-lo/resources/js/Pages/Users/Index.tsx)):**
   - **Avatar & Nama Pengguna:** Klik avatar atau nama untuk membuka modal profil detail staf.
   - **Email:** Terhubung ke tautan `mailto:`.
   - **Badge Peran (Roles):** Klik badge peran untuk menyaring daftar staf berdasarkan peran tersebut.

### C. Pembersihan Efek Hover pada Label Non-Editable
- Komponen `Badge` ([badge.tsx](file:///D:/90_ARCHIVE/nama-projek-lo/resources/js/Components/ui/badge.tsx)) telah dibersihkan dari efek hover default (`hover:bg-primary/80`, dll.) sehingga label statis murni tidak berkedip atau berubah warna saat disentuh kursor. Efek interaksi hover hanya diberikan pada elemen yang benar-benar dapat diklik.

---

## 4. Hasil Verifikasi & Testing

### Automated Test Suite (`php artisan test`)
- **162 tests passed, 0 failures, 780 assertions (100% Green)**.
- Seluruh skenario pengujian unit dan fitur (Auth, Roles & Permissions, User Management, Activity Logs & Telegram Service, Properties & Units, Leads Conversion Engine, dan Transactions/Bookings) lulus sepenuhnya.

### Frontend Compilation (`bun run build`)
- TypeScript compiler (`tsc`) dan Vite bundler berhasil membangun seluruh aset frontend dengan status `exit code 0`.
