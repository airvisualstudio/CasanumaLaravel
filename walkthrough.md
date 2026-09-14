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

