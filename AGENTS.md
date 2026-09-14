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

# UI & Frontend Standardization Rules (MANDATORY)

## 1. Alert, Popup, & Modal Standards
- **DILARANG KERAS** menggunakan dialog native bawaan browser (`window.alert()`, `window.confirm()`, atau `window.prompt()`).
- **WAJIB** menggunakan komponen standar dari **shadcn/ui**:
  - Semua popup modal, konfirmasi tindakan, dan dialog info wajib menggunakan `Dialog` dari `@/Components/ui/dialog` (berbasis Radix UI).
  - Struktur dialog wajib teratur menggunakan `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, dan `DialogFooter`.
- **DILARANG** membuat modal/popup custom sendiri (misal dengan `div fixed/absolute` manual) atau memakai komponen modal legacy.
- **Konsistensi UI/UX**: Seluruh dialog harus mematuhi tema warna CRM (Dark/Light mode), animasi halus (`zoom-in-95`, backdrop blur), dan accessibility (keyboard focus trap, ESC to close).
