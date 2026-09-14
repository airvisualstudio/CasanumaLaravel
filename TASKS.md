# 🎯 Engineering Tasks & Sprint Roadmap
**Sprint Cadence:** 4 Phases (Milestone Delivery)  
**Task Management:** Git Feature Branches (`feature/phase-X-...`)

---

## Phase 1: Database Foundation, Auth, & Roles (COMPLETED ✅)
- [x] **DB-01:** Setup Laravel 12 with Breeze + React 18 + TypeScript + Bun stack.
- [x] **DB-02:** Install Spatie Laravel-Permission and establish 4 core roles (`superadmin`, `sales_manager`, `sales_agent`, `finance`).
- [x] **DB-03:** Create Database Seeders (`RolePermissionSeeder`, `UserSeeder`) with granular permissions and dummy accounts.
- [x] **FE-AUTH:** Implement client-side role authorization via `HandleInertiaRequests` sharing and `useAuthorization` React hook.
- [x] **QA-01:** Automated testing baseline established (27 feature & unit tests passing).

---

## Phase 2: Design System, Layout, & Inventory UI (IN PROGRESS 🚀)
- [x] **UI-01:** Configure shadcn/ui and Tailwind CSS v4 design system tokens (zinc/neutral, emerald deals, amber warnings, rose destructive).
- [x] **UI-02:** Install and verify core shadcn primitives (`button`, `card`, `dialog`, `dropdown-menu`, `input`, `label`, `checkbox`).
- [x] **UI-03:** Standardize all modals/popups/alerts to shadcn `Dialog` (ban `window.alert()`, migrate `DeleteUserForm.tsx` & module actions).
- [x] **FE-01:** Sticky Full-Height Sidebar (`lg:sticky lg:top-0 lg:h-screen`) with independent scrolling ("bisa di-roll") & desktop single toggle.
- [x] **FE-02:** Collapsible Icon-Only Sidebar (`w-64` to `w-[72px]`) with perfect 36px vertical center symmetry and hidden scrollbar layout track.
- [x] **FE-03:** Fluid Responsive Dashboard (`max-w-[1550px]`) with vertical-centered Welcome Card and role-tailored quick action modules.
- [x] **USER-01:** User Management CRUD Controller ([`UserController.php`](file:///d:/90_ARCHIVE/nama-projek-lo/app/Http/Controllers/UserController.php)) with validation, avatar storage, Spatie role sync, toggle status, and self-deletion prevention.
- [x] **USER-02:** Strict Spatie Middleware Lock (`role:superadmin` throwing HTTP 403 for sales_agent, sales_manager, finance).
- [x] **USER-03:** Data Table shadcn UI ([`table.tsx`](file:///d:/90_ARCHIVE/nama-projek-lo/resources/js/Components/ui/table.tsx)) & User List ([`Users/Index.tsx`](file:///d:/90_ARCHIVE/nama-projek-lo/resources/js/Pages/Users/Index.tsx)) with live search, role filters, active status filter, and quick WhatsApp link.
- [x] **USER-04:** Tabbed Add/Edit User Dialog (Account, Personal Info, Work Info, Bank Account) & Dossier Detail Dialog strictly using shadcn `Dialog`.
- [x] **USER-05:** Database migration & seeder for extended user fields (avatar, phone, address, emergency contact, employee_id, position, join_date, is_active, bank info) with client-side image cropping & auto-compression < 200KB.
- [x] **USER-06:** Force Reset Password oleh Superadmin di tabel User Management & Dossier modal dengan generator password acak, copy button, dan dialog shadcn `Dialog`.
- [x] **USER-07:** Self-service Ganti Password dan Settings/Profile di dropdown profil topbar & sidebar footer dengan anchor navigation (`Profile/Edit.tsx`).
- [x] **USER-08:** Standardisasi Dropdown shadcn `Select` & Date Picker `Calendar` + `Popover` (tanpa native HTML `<select>` / `<input type="date">`).
- [x] **USER-09:** Form Pengaturan Profil Mandiri ([`UpdateProfileInformationForm.tsx`](file:///d:/90_ARCHIVE/nama-projek-lo/resources/js/Pages/Profile/Partials/UpdateProfileInformationForm.tsx)): User dapat melengkapi Foto Profil (crop & kompresi), No WA, Alamat, Kontak Darurat, dan Rekening Bank secara mandiri, dengan proteksi ketat field NIK, Jabatan, Role, Tanggal Join, dan Status Akun terkunci (read-only) di frontend dan controller backend ([`ProfileController.php`](file:///d:/90_ARCHIVE/nama-projek-lo/app/Http/Controllers/ProfileController.php) & [`ProfileUpdateRequest.php`](file:///d:/90_ARCHIVE/nama-projek-lo/app/Http/Requests/ProfileUpdateRequest.php)).
- [x] **QA-USER:** Automated Feature Test Suite ([`UserManagementTest.php`](file:///d:/90_ARCHIVE/nama-projek-lo/tests/Feature/UserManagementTest.php)) passing dengan 14 test cases & 44 assertions.
- [x] **QA-PROFILE:** Automated Feature Test Suite ([`ProfileTest.php`](file:///d:/90_ARCHIVE/nama-projek-lo/tests/Feature/ProfileTest.php)) passing dengan 7 test cases & 39 assertions (Total aplikasi: 43 passed, 148 assertions).
- [ ] **DB-04:** Migrations & Seeders for Housing Inventory:
  - Table `clusters` (nama, deskripsi, lokasi, total_unit).
  - Table `unit_types` (tipe_nama, lb, lt, spesifikasi_bangunan, denah_url).
  - Table `units` (cluster_id, unit_type_id, block_number, price, status, locking_timestamp).
- [ ] **FE-04:** Property Inventory Table (TanStack Table dengan sorting, filter cluster, search no blok, badge status).
- [ ] **FE-05:** Create/Edit Unit Modal with image upload and validation schema.
- [ ] **BE-01:** Implement concurrency-safe unit reservation endpoint (`DB::transaction` with row locking).

---

## Phase 3: CRM Leads Pipeline & Follow-up Board
- [ ] **DB-05:** Migration for CRM & Pipeline:
  - Table `leads` (nama, no_hp, email, budget, source, status, assigned_to).
  - Table `lead_activities` (lead_id, user_id, type, note, follow_up_date).
- [ ] **FE-06:** Interactive Kanban Board for Leads (New Lead -> Kontak Pertama -> Jadwal Survei -> Survei Lokasi -> Negosiasi -> Booking).
- [ ] **FE-07:** Lead Detail Drawer (Sheet) showing customer profile, history log, and quick follow-up action buttons.
- [ ] **BE-02:** Lead status transition controller with automated activity logging.
- [ ] **BE-03:** Sales lead assignment logic (Manager view).
- [ ] **FE-08:** Reminder widget for pending follow-ups today.

---

## Phase 4: Transactions, KPR Vault, & Reports
- [ ] **DB-06:** Migration for `transactions`, `kpr_applications`, and `document_attachments`.
- [ ] **BE-04:** Automated PDF generation for Surat Pesanan Rumah (SPR).
- [ ] **FE-09:** Document Upload & Verification UI (File dropzone, status verifikasi berkas KPR).
- [ ] **FE-10:** Analytics Dashboard Cards (KPI stats, charts via Recharts or Lucide indicators).
- [ ] **QA-02:** Unit testing (Unit status race conditions, role permission gates).
- [ ] **OPS-01:** CI/CD script setup for VPS deployment (Git pull, migrate, npm build, optimize).
