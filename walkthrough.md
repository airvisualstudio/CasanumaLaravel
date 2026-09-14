# Walkthrough: Core Housing CRM Dashboard & Legacy Backup

Telah berhasil dibuat dashboard baru khusus sistem **CASANUMA CRM** (Database Perumahan Terpadu) yang siap multi-user (Super Admin vs Sales Agent), dilengkapi statistik unit, visual progress ketersediaan kavling, funnel status leads, tracking booking fee, serta backup dashboard lama.

---

## 1. Perubahan File

### 1.1 Backup Dashboard Lama
- **Path:** [`resources/js/Pages/DashboardLegacy.tsx`](file:///d:/90_ARCHIVE/nama-projek-lo/resources/js/Pages/DashboardLegacy.tsx)
- **Route:** `/dashboard-legacy` ([routes/web.php](file:///d:/90_ARCHIVE/nama-projek-lo/routes/web.php#L17))
- Seluruh tampilan dashboard lama (overview server, stack teknologi, log aktivitas sistem) disimpan utuh dan dilengkapi tombol navigasi cepat kembali ke Dashboard CRM utama.

### 1.2 Layout Terintegrasi CRM
- **Path:** [`resources/js/Layouts/AuthenticatedLayout.tsx`](file:///d:/90_ARCHIVE/nama-projek-lo/resources/js/Layouts/AuthenticatedLayout.tsx)
- Logo branding **CASANUMA CRM** dengan icon `Building2`.
- Navigasi khusus CRM: *Dashboard*, *Unit & Kavling*, *Leads & CRM*, *Booking & KPR*.
- Tombol akses cepat *Legacy View* di navbar atas.
- Badge peran pengguna (*Super Admin* vs *Sales Agent*) pada dropdown akun.

### 1.3 Dashboard CRM Perumahan Baru
- **Path:** [`resources/js/Pages/Dashboard.tsx`](file:///d:/90_ARCHIVE/nama-projek-lo/resources/js/Pages/Dashboard.tsx)
- **Fitur Utama:**
  1. **Mode Switcher (Admin vs Sales View):**
     - Switcher interaktif client-side untuk mensimulasikan perspektif *Super Admin* (omzet global, performa tim) dan *Sales Agent* (target prospek pribadi, follow up hari ini).
  2. **4 KPI Statistics Cards:**
     - **Stok Kavling Unit:** 48 / 142 Unit Available dengan visual progress bar (Available, Booked, Sold, Reserved).
     - **Pipeline Leads:** 328 Prospek Aktif (+18.4% konversi).
     - **Booking Fee Bulan Ini:** Rp 345 Juta (23 Unit terbooking dari target Rp 450 Jt).
     - **Berkas KPR & Bank:** 14 Berkas dalam proses (Estimasi pencairan Rp 9.2 Milyar).
  3. **Visualizer Stok Kavling Per Cluster:**
     - Filter cluster (*Semua*, *Larasati*, *Cilame*).
     - Legend warna standar: *Available* (Hijau Emerald), *Reserved* (Kuning Amber), *Booked* (Biru Sky), *Sold/Akad* (Abu-abu Slate).
     - Breakdown per cluster (Cluster Larasati Residence, Cluster Cilame Hill, Cluster Grand Emerald).
  4. **Funnel Konversi Leads:**
     - Tahapan konversi: *1. Leads Baru (120)* ➔ *2. Kontak WA (84)* ➔ *3. Survei Lokasi (46)* ➔ *4. Booking Fee (23)* ➔ *5. Akad Kredit (18)*.
  5. **Tabel Aktivitas Leads Cepat:**
     - 5 prospek terbaru dengan status prioritas (HOT / WARM / COLD) dan tombol langsung buka WhatsApp.
  6. **Tabel Transaksi Booking Fee:**
     - 5 tanda jadi kavling terbaru lengkap dengan data pembeli, unit kavling, sales pengampu, nominal, dan status pembayaran (*Lunas* / *Verifikasi*).
  7. **Pintasan Cepat Operasional:**
     - Tombol cepat untuk *Simulasi KPR*, *Katalog & Pricelist*, *Agenda Survei*, dan *SLIK & SP3K Bank*.

---

## 2. Hasil Verifikasi

1. **Build Frontend:**
   ```bash
   bun run build
   ```
   *Output:* Sukses dikompilasi 100% tanpa error TypeScript.
2. **Testing Otomasi:**
   ```bash
   php artisan test
   ```
   *Output:* 27 tes lolos (`27 passed, 85 assertions`), mencakup unit/feature authentication dan Spatie roles.
3. **Database:**
   - PostgreSQL terhubung stabil, user `admin@casanuma.com` siap login.

---

## 3. Sistem Role & Permission (spatie/laravel-permission)

Telah terpasang dan terkonfigurasi paket [`spatie/laravel-permission`](https://spatie.be/docs/laravel-permission):

### 3.1 Role Dasar yang Dikonfigurasi
1. `superadmin` - Akses penuh seluruh sistem, konfigurasi, user, dan omzet global.
2. `sales_manager` - Supervisi pipeline leads, approval diskon/booking, monitor target tim sales.
3. `sales_agent` - Input leads, update status follow up, dan booking unit kavling pribadi.
4. `finance` - Verifikasi pembayaran booking fee, rekonsiliasi bank, monitoring pencairan KPR.

### 3.2 Modular Seeders & Akun Pengujian
- **Seeder File:**
  - [`database/seeders/RolePermissionSeeder.php`](file:///d:/90_ARCHIVE/nama-projek-lo/database/seeders/RolePermissionSeeder.php): Mendaftarkan 19 permissions spesifik CRM (kavling, leads, booking, finance) dan menautkannya ke masing-masing role.
  - [`database/seeders/UserSeeder.php`](file:///d:/90_ARCHIVE/nama-projek-lo/database/seeders/UserSeeder.php): Mendaftarkan dummy user tiap role.

Semua akun menggunakan password bawaan: `password`
| Role | Nama Lengkap | Email Login | Hak Akses Utama |
| :--- | :--- | :--- | :--- |
| `superadmin` | Super Admin | `admin@casanuma.com` | Bypass all permissions, akses total |
| `sales_manager` | Budi Santoso (Manager) | `manager@casanuma.com` | View/manage units, assign leads, approve bookings |
| `sales_agent` | Rian Pratama (Sales) | `sales@casanuma.com` | Input leads, update follow-up, submit booking |
| `sales_agent` | Siti Rahma (Sales 2) | `sales2@casanuma.com` | Input leads, update follow-up, submit booking |
| `finance` | Dewi Lestari (Finance) | `finance@casanuma.com` | View financial summary, verifikasi pembayaran booking & kas |

### 3.3 Integrasi Frontend & Middleware
- **Model:** [`app/Models/User.php`](file:///d:/90_ARCHIVE/nama-projek-lo/app/Models/User.php) menggunakan trait `Spatie\Permission\Traits\HasRoles`.
- **Inertia Share:** [`app/Http/Middleware/HandleInertiaRequests.php`](file:///d:/90_ARCHIVE/nama-projek-lo/app/Http/Middleware/HandleInertiaRequests.php) membagikan `roles` dan `permissions` ke props frontend:
  ```php
  'auth' => [
      'user' => $user ? array_merge($user->toArray(), [
          'roles' => $user->getRoleNames()->values()->all(),
          'permissions' => $user->getAllPermissions()->pluck('name')->values()->all(),
      ]) : null,
  ],
  ```
- **React Hook (`useAuthorization`):** [`resources/js/hooks/useAuthorization.ts`](file:///d:/90_ARCHIVE/nama-projek-lo/resources/js/hooks/useAuthorization.ts)
  - `const { can, hasRole, isSuperAdmin, isSalesManager, isSalesAgent, isFinance } = useAuthorization();`
  - Mempermudah filtering komponen shadcn di frontend (misal: `{can('view-leads') && <Button>Leads</Button>}`).
- **Quick Login Buttons:** [`resources/js/Pages/Auth/Login.tsx`](file:///d:/90_ARCHIVE/nama-projek-lo/resources/js/Pages/Auth/Login.tsx) dilengkapi tombol 1-klik untuk autofill akun Admin, Manager, Sales, dan Finance saat pengujian.
- **TypeScript Interface:** [`resources/js/types/index.d.ts`](file:///d:/90_ARCHIVE/nama-projek-lo/resources/js/types/index.d.ts) diperbarui dengan array `roles` dan `permissions`.
- **Layout:** [`resources/js/Layouts/AuthenticatedLayout.tsx`](file:///d:/90_ARCHIVE/nama-projek-lo/resources/js/Layouts/AuthenticatedLayout.tsx) otomatis memfilter menu navbar (Unit, Leads, Booking, Keuangan) berdasarkan permission pengguna.
- **Tech Stack Specification:** [`TECH_STACK.md`](file:///d:/90_ARCHIVE/nama-projek-lo/TECH_STACK.md) otomatis tersinkronisasi menampilkan `spatie/laravel-permission: 8.3.0`.

---

## 4. User Module Final Polish (100% Tuntas)

### 4.1 Upload Avatar Preview, Batas 2MB & Revert ke Inisial
- **Batas Ukuran & Format:** Divalidasi ketat di sisi klien (`handleFileSelect`) dan sisi backend (`max:2048`, `mimes:jpeg,png,jpg`). File > 2MB atau format selain JPG/PNG ditolak dengan pesan error yang jelas.
- **Crop & Preview:** Pengguna dapat melihat preview hasil potongan foto sebelum menyimpan via `AvatarCropperModal`.
- **Hapus Foto (Revert ke Inisial):** Disediakan tombol khusus "Hapus Foto (Gunakan Inisial)" serta tombol badge silang `X`. Ketika dihapus, sistem otomatis menampilkan avatar inisial nama dengan gradien warna brand CASANUMA CRM.

### 4.2 Sanitasi Format Nomor WhatsApp (Backend Mutator)
- Diterapkan Eloquent mutator di [`app/Models/User.php`](file:///d:/90_ARCHIVE/nama-projek-lo/app/Models/User.php) via method `sanitizePhoneNumber()`.
- Setiap input nomor telepon maupun kontak darurat (misal `0812...`, `+62 812...`, `812...`) otomatis dibersihkan dan distandarisasi ke format internasional `628xx` secara konsisten di seluruh aplikasi.

### 4.3 Toolbar List User di Atas Tabel (Search & Filters)
- **Search:** Input pencarian responsif untuk mencari berdasarkan nama, email, NIK, jabatan, dan no. WhatsApp.
- **Filter Role:** Dropdown shadcn `Select` ("Semua Role", "Super Administrator", "Sales Manager", "Sales Agent", "Finance") dipadukan dengan pill buttons pintasan 1-klik.
- **Filter Status:** Dropdown shadcn `Select` ("Semua Status", "Hanya Aktif", "Hanya Nonaktif").
- **Tombol Reset:** Tombol "Reset" dinamis yang muncul otomatis saat filter atau pencarian aktif.

### 4.4 Sistem Notifikasi Toast (shadcn Sonner)
- Dipasang komponen [`sonner.tsx`](file:///d:/90_ARCHIVE/nama-projek-lo/resources/js/Components/ui/sonner.tsx) dan dipasang di root layout [`AuthenticatedLayout.tsx`](file:///d:/90_ARCHIVE/nama-projek-lo/resources/js/Layouts/AuthenticatedLayout.tsx) menggunakan `<Toaster richColors position="top-right" closeButton />`.
- Otomatis bereaksi menangkap `flash.success` & `flash.error` dari Inertia controller, serta diintegrasikan ke seluruh event interaktif (tambah pengguna, perbarui data, hapus user, ganti status aktif, salin password, dan reset password).

### 4.5 Hasil Pengujian & Build
- **Frontend Build (`bun run build`):** Sukses dalam 1.56s tanpa error TypeScript.
- **PHP Test Suite (`php artisan test`):** 48 test cases lolos (160 assertions).

---

## 5. Activity Logs & Integrasi Telegram (Settings Menu Superadmin)

### 5.1 Penyimpanan Konfigurasi Dinamis di Database (`system_settings`)
- Tabel `system_settings` menyimpan kredensial `telegram_bot_token`, `telegram_chat_id`, dan `telegram_notifications_enabled` secara dinamis tanpa perlu edit file `.env` manual di server.
- Helper model [`SystemSetting.php`](file:///d:/90_ARCHIVE/nama-projek-lo/app/Models/SystemSetting.php) dengan caching otomatis: `SystemSetting::get('telegram_bot_token')` dan `SystemSetting::set(...)`.

### 5.2 Rekam Jejak Audit Otomatis (`activity_logs`)
- Tabel `activity_logs` mencatat setiap aksi operasional pengguna:
  - `user_create`: Saat superadmin menambah pengguna baru
  - `user_update`: Saat data pengguna diperbarui
  - `status_toggle`: Saat akun staf diaktifkan/dinonaktifkan
  - `password_reset`: Saat superadmin mereset password
  - `user_delete`: Saat akun staf dihapus
  - `profile_update`: Saat staf mengupdate profil mandiri
  - `telegram_config`: Saat konfigurasi bot Telegram diperbarui
  - `telegram_test`: Riwayat uji coba koneksi bot Telegram
- Helper statis [`ActivityLog::record(...)`](file:///d:/90_ARCHIVE/nama-projek-lo/app/Models/ActivityLog.php) otomatis mencatat `user_id`, IP Address, User Agent, dan metadata JSON.

### 5.3 Antarmuka Settings & Activity Logs ([`ActivityLogs.tsx`](file:///d:/90_ARCHIVE/nama-projek-lo/resources/js/Pages/Settings/ActivityLogs.tsx))
- **Khusus Superadmin:** Dilindungi Spatie RBAC `role:superadmin` di route [`web.php`](file:///d:/90_ARCHIVE/nama-projek-lo/routes/web.php) (sales & finance otomatis di-block HTTP 403 Forbidden).
- **Tab 1 - Activity Logs (Audit Trail):**
  - KPI Cards: Total Log, Log Hari Ini, Staf Aktif Hari Ini, Status Bot Telegram.
  - Toolbar Pencarian & Dropdown Kategori Aksi.
  - Tabel interaktif lengkap dengan avatar aktor, badge aksi berwarna, deskripsi, IP address, waktu relatif, dan modal dialog shadcn untuk inspeksi metadata JSON.
- **Tab 2 - Integrasi Telegram:**
  - Status banner koneksi: *Terkoneksi* vs *Belum Dikonfigurasi*.
  - Input Bot Token (dengan tombol toggle Show/Hide) & Chat ID tujuan.
  - Tombol **"Test Connection"**: Mengirimkan pesan verifikasi langsung via [`TelegramService.php`](file:///d:/90_ARCHIVE/nama-projek-lo/app/Services/TelegramService.php) ke Telegram dan memberikan umpan balik toast instan.
  - Tombol **"Simpan Pengaturan"**: Menyimpan konfigurasi ke database.
  - Panduan interaktif cara membuat bot via `@BotFather` dan mencari Chat ID via `@userinfobot`.

### 5.4 Hasil Pengujian & Build
- **Frontend Build (`bun run build`):** Berhasil 100% tanpa error TypeScript (`ActivityLogs-BJeMEH_F.js` ter-bundle dalam 1.97s).
- **PHP Feature Tests (`php artisan test`):** **54 passed, 193 assertions** (termasuk 6 test cases di `ActivityLogTest.php` mencakup RBAC protection, DB saving, `Http::fake` success & failure handling, serta audit trail logging).



