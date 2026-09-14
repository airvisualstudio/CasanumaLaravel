# 🎨 Frontend Architecture & shadcn/ui Guidelines
**Framework:** React 18 + TypeScript + Inertia.js v2  
**UI Engine:** shadcn/ui (`radix-luma` style, `mist` base color, OKLCH palette) + Tailwind CSS v4  
**Icon Engine:** Lucide React + Phosphor Icons  
**Bundler:** Vite 8 + Bun

---

## 1. Design Principles for CASANUMA CRM
1. **High Information Density with Modern Elegance:** Tampilan data kavling, status booking, dan leads disajikan rapi, terstruktur, dengan tipografi modern dan minim distraksi.
2. **Accessible & Keyboard-Friendly:** Semua komponen interaktif (input, dialog, dropdown) mematuhi standar WAI-ARIA dan keyboard navigation (Tab trap, ESC close).
3. **Harmonious Color Palette (OKLCH):**
   - **Primary / Crimson Brand:** `oklch(0.514 0.222 16.935)` (Modern Red/Crimson CASANUMA identity).
   - **Base Palette:** `mist` (Netral sejuk modern untuk background, card, border, dan popover).
   - **Status "Available" / "Deal":** Emerald (`text-emerald-500` / `bg-emerald-500/15`).
   - **Status "Reserved" / "Pending":** Amber (`text-amber-500` / `bg-amber-500/15`).
   - **Status "Destructive" / "Lost":** Rose/Red (`text-destructive`).

---

## 2. shadcn/ui Setup & Configuration

### `components.json` (Active Specification)
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "radix-luma",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "resources/css/app.css",
    "baseColor": "mist",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "phosphor",
  "rtl": false,
  "aliases": {
    "components": "@/Components",
    "utils": "@/lib/utils",
    "ui": "@/Components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "menuColor": "default-translucent",
  "menuAccent": "subtle",
  "registries": {}
}
```

---

## 3. Directory Layout (Frontend)

```
resources/
├── css/
│   └── app.css                   # Tailwind v4 import, custom variants, OKLCH color tokens
└── js/
    ├── Components/
    │   └── ui/                   # shadcn/ui atomic components (Radix UI)
    │       ├── button.tsx
    │       ├── card.tsx
    │       ├── checkbox.tsx
    │       ├── dialog.tsx        # Standard modal & alert component
    │       ├── dropdown-menu.tsx
    │       ├── input.tsx
    │       └── label.tsx
    ├── hooks/
    │   └── useAuthorization.ts   # Client-side Spatie RBAC hook (can, roles)
    ├── Layouts/
    │   ├── AuthenticatedLayout.tsx # Sticky full-height + collapsible icon-only sidebar
    │   └── GuestLayout.tsx       # Auth wrapper (Login/Register)
    ├── lib/
    │   └── utils.ts              # cn() class merging utility
    ├── Pages/
    │   ├── Auth/                 # Login, Register, ForgotPassword, ResetPassword, etc.
    │   ├── Profile/              # Edit profile, password update, DeleteUserForm (Dialog)
    │   ├── Dashboard.tsx         # Core CRM multi-role interactive dashboard
    │   ├── DashboardLegacy.tsx   # Server & dev status legacy backup
    │   └── Welcome.tsx           # Public landing page
    ├── types/
    │   ├── index.d.ts            # Global Inertia user, auth, roles, & permissions types
    │   └── vite-env.d.ts
    ├── app.tsx                   # Inertia App entry point
    └── bootstrap.ts              # Axios configuration
```

---

## 4. Code Standards & UI Patterns

### 4.1. Strongly Typed Inertia Pages & Authorization
Setiap halaman menerima data props ter-type dari Laravel Controller:
```tsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useAuthorization } from '@/hooks/useAuthorization';
import { Card, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';

export default function Dashboard() {
  const { user, can, isSuperAdmin, isSalesManager, isSalesAgent, isFinance } = useAuthorization();

  return (
    <AuthenticatedLayout>
      <Head title="Dashboard CRM" />
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Halo, {user.name}!</CardTitle>
            <CardDescription>
              Role Aktif: {user.roles?.join(', ')}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
```

### 4.2. Standardisasi Modal, Alert, & Popup (MANDATORY shadcn `Dialog`)
> **PENTING / MANDATORY:** Seluruh popup, konfirmasi tindakan, dialog pesan, dan modal form di seluruh CRM **WAJIB** menggunakan komponen `Dialog` dari shadcn/ui (`@/Components/ui/dialog`).

**Aturan Ketat:**
- ❌ **DILARANG KERAS** menggunakan popup bawaan browser (`window.alert()`, `window.confirm()`, atau `window.prompt()`).
- ❌ **DILARANG** membuat modal custom ad-hoc (misal dengan `div fixed/absolute` manual) atau memakai komponen modal legacy bawaan kit lama.
- ❌ **DILARANG** mengimpor library popup pihak ketiga baru tanpa standarisasi.
- ✅ **WAJIB** menggunakan komponen resmi:
  - `Dialog`: Root container dengan state `open` dan `onOpenChange`.
  - `DialogTrigger`: Pembungkus trigger button (jika menggunakan un-controlled flow).
  - `DialogContent`: Kontainer modal (otomatis dilengkapi overlay backdrop blur, animasi masuk/keluar, dan tombol close `X`).
  - `DialogHeader`, `DialogTitle`, `DialogDescription`: Struktur judul & deskripsi yang accessible (otomatis ARIA labeledby/describedby).
  - `DialogFooter`: Kontainer tombol aksi (otomatis responsive alignment di mobile/desktop).

**Contoh Implementasi Standar:**
```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';

export function ActionDialog({ 
  open, 
  onOpenChange, 
  title, 
  description 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Mengerti
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### 4.3. Standardisasi Sidebar & Navigasi CRM
- **Sticky Desktop Viewport:**
  Sidebar wajib menggunakan `lg:sticky lg:top-0 lg:h-screen` agar tetap terkunci di posisi pandang saat konten halaman di-scroll ke bawah.
- **Scroll Mandiri Menu ("Bisa di-roll"):**
  Daftar menu diapit container independen `flex-1 min-h-0 overflow-y-auto overscroll-contain py-2 space-y-3` sehingga menu dapat di-scroll terpisah tanpa menggeser header brand maupun profil user di footer.
- **Presisi Simetri Mode Minimize (`w-[72px]`):**
  - Seluruh icon di mode collapsed (Logo Brand, Role Badge, Menu Action Buttons) **wajib seragam** berukuran `size-10 rounded-xl` (40×40px).
  - Track scrollbar fisik disembunyikan menggunakan `[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden` saat mode collapsed agar tidak memakan ruang layout kanan dan tidak menggeser icon ke kiri. Fitur scroll mousewheel/trackpad tetap bekerja 100%.
  - Seluruh elemen berpusat persis pada sumbu tengah vertikal 36px (`justify-center mx-auto`).
  - Garis pembatas grup menu menggunakan `mx-4` (lebar 40px, simetris dengan icon).
- **Single Toggle Control:**
  Hanya ada 1 tombol toggle minimize di desktop topbar navbar untuk mengontrol buka-tutup sidebar (hindari duplikasi tombol toggle).

### 4.4. Client-Side Role & Permission Authorization (`useAuthorization`)
Komponen frontend memanfaatkan custom hook `@/hooks/useAuthorization`:
```tsx
import { useAuthorization } from '@/hooks/useAuthorization';

export default function LeadActions() {
  const { user, can, isSuperAdmin, isSalesManager, isSalesAgent, isFinance } = useAuthorization();

  return (
    <div className="flex gap-2">
      {can('create-leads') && <Button>Tambah Prospek</Button>}
      {isSalesManager && <Button variant="secondary">Distribusi Leads</Button>}
      {isFinance && <Button variant="outline">Verifikasi SPR</Button>}
    </div>
  );
}
```
