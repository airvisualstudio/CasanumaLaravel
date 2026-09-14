# 🏡 CASANUMA CRM & Centralized Housing Database

Sistem CRM (Customer Relationship Management) dan Database Perumahan Terpadu berbasis **Laravel 12**, **Inertia.js v2**, **React 18**, **TypeScript**, **PostgreSQL**, dan **shadcn/ui**.

---

## 🚀 Teknologi Utama

- **Backend:** PHP 8.5, Laravel 12, Spatie Laravel-Permission 8.x
- **Frontend:** React 18, TypeScript, Inertia.js v2, Tailwind CSS v4, Lucide Icons
- **UI Engine:** shadcn/ui (Radix UI Primitives)
- **Database:** PostgreSQL 16+ (`casanuma_crm`)
- **Package Manager & Bundler:** Bun, Composer, Vite 8

---

## 👥 Struktur Peran Pengguna (RBAC)

Sistem menggunakan `spatie/laravel-permission` dengan 4 peran baku:

| Peran | Email Default | Password | Deskripsi Kewenangan |
| :--- | :--- | :--- | :--- |
| **Super Administrator** | `admin@casanuma.com` | `password` | Akses penuh ke seluruh konfigurasi sistem, database perumahan, pengelolaan role, dan bypass semua permission. |
| **Sales Manager** | `manager@casanuma.com` | `password` | Supervisi pipeline penjualan, alokasi leads ke sales agent, dan persetujuan tanda jadi booking. |
| **Sales Agent** | `sales@casanuma.com` | `password` | Pengelolaan prospek leads pribadi, update progres follow-up, dan pembuatan booking fee kavling. |
| **Finance & KPR** | `finance@casanuma.com` | `password` | Validasi pembayaran booking/DP, penerbitan tanda terima SPR, dan pemantauan berkas KPR bank. |

---

## 📐 Standar Antarmuka (UI & Frontend Standards)

1. **Modal, Alert, & Popup (MANDATORY):**
   - **Dilarang Keras:** Memakai dialog bawaan browser (`window.alert()`, `window.confirm()`, `window.prompt()`).
   - **Wajib:** Menggunakan komponen resmi `Dialog` dari `@/Components/ui/dialog` (berbasis Radix UI) lengkap dengan `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, dan `DialogFooter`.
2. **Navigasi & Sidebar Desktop:**
   - Sidebar sticky terkunci di layar (`lg:sticky lg:top-0 lg:h-screen`).
   - Mendukung mode minimize (`w-64` ke `w-[72px]`) dengan icon-only yang **simetris presisi pada sumbu 36px**.
   - Dimensi seluruh icon di mode minimize seragam `size-10 rounded-xl` (40×40px).
   - Menu independen yang dapat di-scroll ("bisa di-roll") tanpa merusak layout.
3. **Tema Dark & Light Mode:**
   - Terintegrasi penuh di seluruh komponen dengan transisi halus dan persistensi preferensi user.

---

## 🛠️ Instalasi & Menjalankan Lokal

### 1. Klon Repositori & Pasang Dependensi
```bash
# Dependensi PHP
composer install

# Dependensi Frontend (Bun)
bun install
```

### 2. Konfigurasi Environment (`.env`)
Pastikan konfigurasi database PostgreSQL telah sesuai:
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=casanuma_crm
DB_USERNAME=postgres
DB_PASSWORD=secret
```

### 3. Migrasi & Database Seeder
Jalankan migrasi dan seeder akun dummy:
```bash
php artisan migrate --seed
```

### 4. Build atau Jalankan Server Dev
```bash
# Build production bundle
bun run build

# Atau jalankan dev server
bun run dev
```

Jalankan aplikasi Laravel:
```bash
php artisan serve
```

---

## 🧪 Pengujian Otomasi (Test Suite)

Jalankan pengujian unit dan fitur:
```bash
php artisan test
```
*Status Terkini:* **27 passed, 86 assertions** (100% lulus).
