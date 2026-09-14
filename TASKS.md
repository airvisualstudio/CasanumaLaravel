# 🎯 Engineering Tasks & Sprint Roadmap
**Sprint Cadence:** 4 Phases (Milestone Delivery)  
**Task Management:** Git Feature Branches (`feature/phase-X-...`)

---

## Phase 1: Database Foundation, Auth, & Roles (Week 1)
- [ ] **DB-01:** Setup Laravel 11 with Breeze + React + TypeScript stack.
- [ ] **DB-02:** Install Spatie Permission and create roles (`superadmin`, `sales_manager`, `sales_agent`, `finance_kpr`).
- [ ] **DB-03:** Migration & Seeders for Housing Inventory:
  - Table `clusters` (nama, deskripsi, lokasi, total_unit).
  - Table `unit_types` (tipe_nama, lb, lt, spesifikasi_bangunan, denah_url).
  - Table `units` (cluster_id, unit_type_id, block_number, price, status, locking_timestamp).
- [ ] **DB-04:** Migration for CRM & Pipeline:
  - Table `leads` (nama, no_hp, email, budget, source, status, assigned_to).
  - Table `lead_activities` (lead_id, user_id, type, note, follow_up_date).

---

## Phase 2: Design System & Inventory Management (Week 2)
- [ ] **UI-01:** Initialize shadcn/ui CLI, configure `components.json`, Tailwind theme tokens (primary zinc/neutral + emerald accent).
- [ ] **UI-02:** Install essential shadcn primitives:
  - `button`, `dialog`, `dropdown-menu`, `input`, `badge`, `sheet`, `table`, `tabs`, `avatar`.
- [ ] **FE-01:** Layout Builder (Sidebar navigasi, breadcrumb, header user profile, dark/light theme toggle).
- [ ] **FE-02:** Property Inventory Table (TanStack Table dengan sorting, filter cluster, search no blok, badge status).
- [ ] **FE-03:** Create/Edit Unit Modal with image upload and validation schema (Zod).
- [ ] **BE-01:** Implement concurrency-safe unit reservation endpoint (`DB::transaction` with row locking).

---

## Phase 3: CRM Leads Pipeline & Follow-up Board (Week 3)
- [ ] **FE-04:** Interactive Kanban Board for Leads (`@hello-pangea/dnd` or HTML5 drag-and-drop).
- [ ] **FE-05:** Lead Detail Drawer (Sheet) showing customer profile, history log, and quick follow-up action buttons.
- [ ] **BE-02:** Lead status transition controller with automated activity logging.
- [ ] **BE-03:** Sales lead assignment logic (Manager view).
- [ ] **FE-06:** Reminder widget for pending follow-ups today.

---

## Phase 4: Transactions, KPR Vault, & Reports (Week 4)
- [ ] **DB-05:** Migration for `transactions`, `kpr_applications`, and `document_attachments`.
- [ ] **BE-04:** Automated PDF generation for Surat Pesanan Rumah (SPR) using DomPDF/Browsershot.
- [ ] **FE-07:** Document Upload & Verification UI (File dropzone, status verifikasi berkas KPR).
- [ ] **FE-08:** Analytics Dashboard Cards (KPI stats, charts via Recharts or Lucide indicators).
- [ ] **QA-01:** Unit testing (Unit status race conditions, role permission gates).
- [ ] **OPS-01:** CI/CD script setup for VPS deployment (Git pull, migrate, npm build, optimize).
