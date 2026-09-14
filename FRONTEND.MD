# 🎨 Frontend Architecture & shadcn/ui Guidelines
**Framework:** React 18 + TypeScript + Inertia.js  
**UI Engine:** shadcn/ui (Radix UI) + Tailwind CSS

---

## 1. Design Principles for Real Estate CRM
1. **High Information Density with Clean Layouts:** Tampilan data properti dan leads harus rapi, terbaca jelas, dan minim distraksi visual berlebih.
2. **Accessible & Keyboard Navigation:** Menjamin form input cepat bagi sales agent saat merekam data prospek di lapangan.
3. **Cohesive Color Palette:**
   - **Primary / Neutral:** Zinc / Slate (Modern, formal, professional).
   - **Accent / Success:** Emerald (`#10b981`) untuk status "Available" dan "Deal/Sold".
   - **Warning / Pending:** Amber (`#f59e0b`) untuk status "Reserved" dan "Follow Up".
   - **Destructive:** Rose / Red (`#f43f5e`) untuk status "Blocked" atau "Lost".

---

## 2. shadcn/ui Setup & Configuration

### `components.json`
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "resources/css/app.css",
    "baseColor": "zinc",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/Components",
    "utils": "@/lib/utils"
  }
}
```

---

## 3. Directory Layout (Frontend)

```
resources/js/
├── Components/
│   ├── ui/                       # shadcn/ui atomic components
│   │   ├── button.tsx
│   │   ├── badge.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── sheet.tsx
│   │   ├── table.tsx
│   │   └── tabs.tsx
│   ├── Inventory/                # Domain-specific components
│   │   ├── UnitStatusBadge.tsx
│   │   ├── UnitCard.tsx
│   │   └── ClusterFilter.tsx
│   ├── CRM/
│   │   ├── KanbanColumn.tsx
│   │   ├── LeadCard.tsx
│   │   └── ActivityTimeline.tsx
│   └── Navigation/
│       ├── Sidebar.tsx
│       ├── Navbar.tsx
│       └── Breadcrumbs.tsx
├── Layouts/
│   ├── AuthenticatedLayout.tsx   # Dashboard wrapper with Sidebar
│   └── GuestLayout.tsx           # Login/Register wrapper
├── Pages/
│   ├── Dashboard/Index.tsx
│   ├── Properties/
│   │   ├── Index.tsx             # Unit listing & table
│   │   └── Show.tsx              # Unit detail & transaction history
│   ├── Leads/
│   │   ├── Index.tsx             # Pipeline Kanban view
│   │   └── Show.tsx              # Lead follow-up profile
│   └── Transactions/
│       └── Index.tsx             # Booking & KPR tracker
└── types/
    ├── property.ts
    ├── lead.ts
    └── index.d.ts
```

---

## 4. Code Standards & Patterns

### 4.1. Strongly Typed Inertia Pages
Setiap halaman menerima typed props dari Laravel Controller:
```tsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Unit } from '@/types/property';
import { columns } from './columns';
import { DataTable } from '@/Components/ui/data-table';

interface Props {
  units: Unit[];
  clusterNames: string[];
}

export default function PropertyIndex({ units, clusterNames }: Props) {
  return (
    <AuthenticatedLayout title="Database Unit Perumahan">
      <Head title="Katalog Unit" />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold tracking-tight">Kavling & Unit</h1>
        </div>
        <DataTable columns={columns} data={units} />
      </div>
    </AuthenticatedLayout>
  );
}
```

### 4.2. Status Badge Standard Component
```tsx
import { Badge } from '@/Components/ui/badge';

type UnitStatus = 'AVAILABLE' | 'RESERVED' | 'BOOKED' | 'SOLD' | 'BLOCKED';

export function UnitStatusBadge({ status }: { status: UnitStatus }) {
  const styles: Record<UnitStatus, { label: string; className: string }> = {
    AVAILABLE: { label: 'Tersedia', className: 'bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25' },
    RESERVED: { label: 'Reserved', className: 'bg-amber-500/15 text-amber-700 hover:bg-amber-500/25' },
    BOOKED: { label: 'Booked', className: 'bg-blue-500/15 text-blue-700 hover:bg-blue-500/25' },
    SOLD: { label: 'Terjual', className: 'bg-zinc-500/15 text-zinc-700 hover:bg-zinc-500/25' },
    BLOCKED: { label: 'Blocked', className: 'bg-rose-500/15 text-rose-700 hover:bg-rose-500/25' },
  };

  const item = styles[status] || styles.BLOCKED;
  return <Badge variant="outline" className={item.className}>{item.label}</Badge>;
}
```

### 4.3. Standardisasi Modal & Popup (Wajib shadcn `Dialog`)
> **PENTING / MANDATORY:** Semua popup, konfirmasi, dialog form, atau modal di seluruh sistem CRM **WAJIB** menggunakan komponen `Dialog` dari shadcn/ui (`@/Components/ui/dialog`).

**Aturan Ketat:**
- ❌ **DILARANG KERAS** menggunakan popup dialog bawaan browser (`window.alert()`, `window.confirm()`, atau `window.prompt()`).
- ❌ **DILARANG** membuat modal custom sendiri (misal dengan `div` absolute/fixed manual) atau memakai modal legacy bawaan kit lama.
- ❌ **DILARANG** memasang library popup pihak ketiga baru tanpa standarisasi.
- ✅ **WAJIB** menggunakan komponen resmi:
  - `Dialog`: Root container dengan state `open` dan `onOpenChange`.
  - `DialogTrigger`: Pembungkus trigger button (jika menggunakan un-controlled flow).
  - `DialogContent`: Kontainer modal (otomatis dilengkapi overlay backdrop blur, animasi masuk/keluar, dan tombol close `X`).
  - `DialogHeader`, `DialogTitle`, `DialogDescription`: Struktur judul & deskripsi yang accessible (otomatis ARIA labeledby/describedby).
  - `DialogFooter`: Kontainer tombol aksi (otomatis responsive alignment di mobile/desktop).

**Manfaat Standarisasi:**
1. **Accessibility (A11y):** Otomatis menangani keyboard trap (Tab / Shift+Tab), tombol ESC untuk close, dan pengembalian focus.
2. **Animasi & Feel Konsisten:** Transisi `zoom-in-95`, `fade-in-0`, backdrop blur, dan tema Dark/Light terintegrasi sempurna.
3. **Maintainability:** Desain modal di seluruh CRM (mulai dari hapus akun, form input booking, detail unit, hingga filter leads) memiliki radius, shadow, dan padding yang seragam.

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

export function BookingModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Konfirmasi Booking Unit</DialogTitle>
          <DialogDescription>
            Masukkan data tanda jadi konsumen untuk memblokir kavling pilihan.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Form content */}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button type="submit">
            Simpan Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

