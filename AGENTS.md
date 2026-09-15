<laravel-boost-guidelines>
# Laravel Application

This repository contains a Laravel application. Complete the following setup before working on the user's request.

## Prerequisites

Verify that PHP and Composer are available:

```sh
php -v
composer -V
```

If either command is unavailable, detect the user's operating system and install the prerequisites with the appropriate command:

macOS:

```sh
/bin/bash -c "$(curl -fsSL https://php.new/install/mac/8.5)"
```

Windows PowerShell:

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://php.new/install/windows/8.5'))
```

Linux:

```sh
/bin/bash -c "$(curl -fsSL https://php.new/install/linux/8.5)"
```

After installation, ask the user to restart their terminal. If the agent needs the restarted shell to continue, ask the user to reopen their terminal and rerun their original prompt.

## Agent Setup

Install Laravel Boost from the application root before making application changes:

```sh
composer require laravel/boost --dev
php artisan boost:install
```

Boost replaces these bootstrap instructions with guidelines tailored to the application. After installation, read `AGENTS.md` again and continue with the user's original request using the generated guidelines.
</laravel-boost-guidelines>

# UI & Architecture Standardization Rules (MANDATORY)

## 1. Alert, Popup, & Modal Standards
- **DILARANG KERAS** menggunakan dialog native bawaan browser (`window.alert()`, `window.confirm()`, atau `window.prompt()`).
- **WAJIB** menggunakan komponen standar dari **shadcn/ui**:
  - Semua popup modal, konfirmasi tindakan, dan dialog info wajib menggunakan `Dialog` dari `@/Components/ui/dialog` (berbasis Radix UI).
  - Struktur dialog wajib teratur menggunakan `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, dan `DialogFooter`.
- **DILARANG** membuat modal/popup custom sendiri (misal dengan `div fixed/absolute` manual) atau memakai komponen modal legacy.
- **Konsistensi UI/UX**: Seluruh dialog harus mematuhi tema warna CRM (Dark/Light mode), animasi halus (`zoom-in-95`, backdrop blur), dan accessibility (keyboard focus trap, ESC to close).

## 2. Sidebar & Navigasi Standards
- **Sticky Viewport:** Sidebar wajib berada dalam posisi sticky setinggi layar (`lg:sticky lg:top-0 lg:h-screen`).
- **Collapsible Mode:** Mendukung minimize ke icon-only (`w-64` ke `w-[72px]`) dengan state tersimpan di `localStorage` (`sidebar_collapsed`).
- **Presisi Simetri 36px:** Pada mode minimize, semua elemen icon (Logo, Role Badge, Menu Buttons) **wajib seragam** berukuran `size-10 rounded-xl` (40×40px) dan berada tepat pada sumbu tengah vertikal 36px (`justify-center mx-auto`).
- **Hidden Scrollbar Layout:** Track scrollbar pada mode minimize disembunyikan menggunakan `[scrollbar-width:none] [&::-webkit-scrollbar]:hidden` agar tidak memotong ruang layout dan tidak mendorong icon ke kiri (fitur scroll mousewheel tetap aktif).
- **Single Toggle Control:** Tombol toggle minimize hanya ada satu di desktop topbar (hindari duplikasi tombol toggle di header sidebar).

## 3. Role-Based Access Control (RBAC) Standards
- **Spatie Laravel-Permission:** Seluruh otorisasi role dan permissions menggunakan `spatie/laravel-permission`.
- **4 Role Baku:**
  1. `superadmin` (Bypass all permissions - Akses penuh sistem)
  2. `sales_manager` (Supervisi pipeline leads, sales, dan approval booking)
  3. `sales_agent` (Manajemen prospek leads pribadi dan input tanda jadi unit)
  4. `finance` (Validasi pembayaran, dokumen SPR, dan tracking KPR bank)
- **Frontend Authorization:** Wajib menggunakan hook `useAuthorization` dari `@/hooks/useAuthorization` (`can()`, `isSuperAdmin`, `isSalesManager`, `isSalesAgent`, `isFinance`).
- **Inertia Props:** Data roles dan permissions dioper secara global via `HandleInertiaRequests.php` (`auth.user.roles`, `auth.user.permissions`).

## 4. Database Standards
- **DBMS:** PostgreSQL 16+ (`DB_CONNECTION=pgsql`, basis data `casanuma_crm`).
- **Seeders:** `RolePermissionSeeder` dan `UserSeeder` sebagai acuan akun pengujian standar.

## 5. Input, Dropdown & Date Picker Standards
- **DILARANG KERAS** menggunakan dropdown native browser (`<select>`) dan date input native (`<input type="date">`).
- **WAJIB** menggunakan komponen standar dari **shadcn/ui**:
  - **Dropdown / Selection:** Wajib menggunakan `Select` (`SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`) dari `@/Components/ui/select`.
  - **Calendar / Date Picker:** Wajib menggunakan `Calendar` dari `@/Components/ui/calendar` yang dibungkus `Popover` (`@/Components/ui/popover`) dipadukan dengan formatting `date-fns`.

## 6. View Mode (Card vs Table) & Badge Standards
- **Multi-View Parity:** Seluruh halaman daftar data utama (Leads, Properties/Units, Bookings, Users) wajib menyediakan switcher tampilan **Tabel View** dan **Card View**.
- **Default ke Card View:** Secara baku (default), tampilan wajib disetel ke **Card View (`'card'`)** dengan persistensi `localStorage` (`*_view_mode_v2`).
- **Interactive Card Data Points:** Elemen data pada kartu wajib dapat diklik (*clickable*) sesuai konteks datanya:
  - Nama konsumen ➔ Membuka Timeline & Follow-up dossier
  - Unit/Booking box ➔ Navigasi ke halaman detail booking terkait
  - Email ➔ Tautan `mailto:`
  - Kode unit ➔ Membuka form edit/spesifikasi unit
  - Cluster/Proyek/Role ➔ Melakukan quick filter data terkait
- **Static Label Hygiene:** Komponen badge statis murni yang tidak dapat diedit dilarang memiliki efek hover palsu (`hover:bg-*` pada base variant badge dihilangkan). Efek hover hanya disematkan pada elemen yang benar-benar interaktif / dapat diklik.

