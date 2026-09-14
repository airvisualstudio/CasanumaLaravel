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
