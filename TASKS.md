# 🎯 Engineering Tasks & Sprint Roadmap
**Project:** CASANUMA CRM & Centralized Housing Database  
**Sprint Cadence:** 4 Phases (Milestone Delivery)  
**Current Test Suite Status:** **162 tests passed, 780 assertions (100% Green)**  

---

## Phase 1: Database Foundation, Auth, & Roles (COMPLETED ✅)
- [x] **DB-01:** Setup Laravel 12 with Breeze + React 18 + TypeScript + Bun stack.
- [x] **DB-02:** Install Spatie Laravel-Permission and establish 4 core roles (`superadmin`, `sales_manager`, `sales_agent`, `finance`).
- [x] **DB-03:** Create Database Seeders (`RolePermissionSeeder`, `UserSeeder`) with granular permissions and dummy accounts.
- [x] **FE-AUTH:** Implement client-side role authorization via `HandleInertiaRequests` sharing and `useAuthorization` React hook.
- [x] **QA-01:** Automated testing baseline established (27 feature & unit tests passing).

---

## Phase 2: Design System, Layout, & User Management (COMPLETED ✅)
- [x] **UI-01:** Configure shadcn/ui and Tailwind CSS v4 design system tokens (zinc/neutral, emerald deals, amber warnings, rose destructive).
- [x] **UI-02:** Install and verify core shadcn primitives (`button`, `card`, `dialog`, `dropdown-menu`, `input`, `label`, `checkbox`, `select`, `calendar`, `popover`, `badge`).
- [x] **UI-03:** Standardize all modals/popups/alerts to shadcn `Dialog` (ban `window.alert()`, migrate `DeleteUserForm.tsx` & module actions).
- [x] **FE-01:** Sticky Full-Height Sidebar (`lg:sticky lg:top-0 lg:h-screen`) with independent scrolling ("bisa di-roll") & desktop single toggle.
- [x] **FE-02:** Collapsible Icon-Only Sidebar (`w-64` to `w-[72px]`) with perfect 36px vertical center symmetry and hidden scrollbar layout track.
- [x] **FE-03:** Fluid Responsive Dashboard (`max-w-[1550px]`) with role-tailored KPI widgets and quick action modules.
- [x] **USER-01:** User Management CRUD Controller ([`UserController.php`](file:///d:/90_ARCHIVE/nama-projek-lo/app/Http/Controllers/UserController.php)) with validation, avatar storage, Spatie role sync, toggle status, and self-deletion prevention.
- [x] **USER-02:** Strict Spatie Middleware Lock (`role:superadmin` throwing HTTP 403 for unauthorized users).
- [x] **USER-03:** User List ([`Users/Index.tsx`](file:///d:/90_ARCHIVE/nama-projek-lo/resources/js/Pages/Users/Index.tsx)) with Card View default, Table View toggle, live search, role/status filters, and direct WhatsApp links.
- [x] **USER-04:** Tabbed Add/Edit User Dialog (Account, Personal Info, Work Info, Bank Account) & Dossier Detail Dialog strictly using shadcn `Dialog`.
- [x] **USER-05:** Database migration & seeder for extended user fields (avatar, phone, address, emergency contact, employee_id, position, join_date, is_active, bank info) with client-side image cropping & auto-compression < 200KB.
- [x] **USER-06:** Force Reset Password oleh Superadmin di tabel User Management & Dossier modal dengan generator password acak, copy button, dan dialog shadcn `Dialog`.
- [x] **USER-07:** Self-service Ganti Password dan Settings/Profile di dropdown profil topbar & sidebar footer dengan anchor navigation (`Profile/Edit.tsx`).
- [x] **USER-08:** Standardisasi Dropdown shadcn `Select` & Date Picker `Calendar` + `Popover` (tanpa native HTML `<select>` / `<input type="date">`).
- [x] **ADMIN-01:** Activity Logs & Audit Trail:
  - Migrasi `activity_logs` table (`user_id`, `action`, `description`, `subject_type`, `subject_id`, `properties`, `ip_address`, `user_agent`).
  - Helper Eloquent [`ActivityLog::record(...)`](file:///d:/90_ARCHIVE/nama-projek-lo/app/Models/ActivityLog.php) terpasang di seluruh CRUD user, status toggle, force reset password, self profile update, dan password update.
  - Data table shadcn di `/settings/activity-logs` dengan filter aksi, live search, dan dialog inspeksi JSON properties.
- [x] **ADMIN-02:** Integrasi Telegram Bot Dinamis & Real-Time Notification:
  - Migrasi `system_settings` table (`key`, `value`, `type`, `group`) dengan caching untuk penyimpanan kredensial bot Telegram di database.
  - Form input Bot Token (toggle show/hide), Chat ID, dan toggle notifikasi real-time di UI Superadmin.
  - Tombol "Test Connection" dengan verifikasi pesan langsung ke API Telegram.
  - Layanan [`TelegramService.php`](file:///d:/90_ARCHIVE/nama-projek-lo/app/Services/TelegramService.php) dengan bypass SSL otomatis pada mode local development.
  - Auto-dispatch notifikasi real-time saat log aktivitas baru dicatat (non-blocking).

---

## Phase 3: Housing Database & Inventory Unit Management (COMPLETED ✅)
- [x] **DB-04:** Migrations & Seeders for Housing Inventory:
  - Table `housing_projects` (nama kawasan, deskripsi, lokasi, developer).
  - Table `housing_clusters` (nama cluster, siteplan, total unit).
  - Table `housing_unit_types` (nama tipe, luas tanah, luas bangunan, spesifikasi).
  - Table `housing_units` (kode kavling, blok, nomor, harga dasar, status unit, `svg_element_id`).
- [x] **PROP-01:** Property Project & Cluster Management ([`Properties/Index.tsx`](file:///d:/90_ARCHIVE/nama-projek-lo/resources/js/Pages/Properties/Index.tsx)).
- [x] **PROP-02:** Inventory Unit Management ([`Properties/Units/Index.tsx`](file:///d:/90_ARCHIVE/nama-projek-lo/resources/js/Pages/Properties/Units/Index.tsx)):
  - Multi-View Switcher dengan **Card View sebagai default**.
  - Interactive clickable points: klik kode unit untuk edit, klik cluster/tipe untuk quick filter, klik active booking box untuk membuka berkas booking.
  - Quick Status Change Modal untuk update ketersediaan unit.
  - SVG Element ID integration untuk pemetaan siteplan master.

---

## Phase 4: Leads Engine & First-Principle Conversion (COMPLETED ✅)
- [x] **DB-05:** Migrations for Leads & Interaction History:
  - Table `leads` (nama, wa, email, nik, sumber, sub-sumber, budget, preferensi, suhu, sla, pool arsip, sales in charge).
  - Table `lead_interactions` (lead_id, user_id, channel, notes, scheduled_at, completed_at, internal_notes).
- [x] **LEAD-01:** First-Principle Conversion Features:
  - **Lead Temperature:** Indikator prioritas (🔥 Hot, ⚡ Warm, ❄️ Cold).
  - **SLA & Auto-Revoke Indicator:** Monitoring batas waktu 7 hari tanpa follow-up.
  - **Internal Notes Thread:** Diskusi internal antara Manager/Superadmin & Sales PIC langsung di setiap log riwayat.
  - **Proteksi Anti-Duplikasi:** Validasi WhatsApp & NIK unik per proyek perumahan.
  - **Auto-Assign & Re-Assign:** Sales auto-assigned saat input; re-assign dialog khusus Manager/Superadmin.
  - **Audit Log Data Sensitif:** Otomatis tercatat ke Activity Log & Timeline jika WA, Status, NIK, atau Sales PIC dimutasi.
  - **Workspace Segregation:** Dual pool (**🟢 Workspace Prospek Aktif** vs **🗄️ Archive & Blacklist Pool**).
- [x] **LEAD-02:** Multi-View Layout & Interactive Cards ([`Leads/Index.tsx`](file:///d:/90_ARCHIVE/nama-projek-lo/resources/js/Pages/Leads/Index.tsx)):
  - **Card View sebagai default** dengan persistensi `localStorage`.
  - Clickable points: Nama konsumen membuka Timeline, email membuka mailto, proyek memicu filter, kotak kavling membuka transaksi booking.
- [x] **LEAD-03:** Kanban Board Pipeline ([`Leads/Pipeline.tsx`](file:///d:/90_ARCHIVE/nama-projek-lo/resources/js/Pages/Leads/Pipeline.tsx)) untuk visualisasi tahapan konversi.
- [x] **LEAD-04:** KYC Document Vault ([`CustomerDocumentVaultDialog.tsx`](file:///d:/90_ARCHIVE/nama-projek-lo/resources/js/Components/CRM/CustomerDocumentVaultDialog.tsx)) untuk pengarsipan KTP, KK, NPWP, Slip Gaji, dan Rekening Koran.

---

## Phase 5: Transactions, Bookings & Dokumen SPR (COMPLETED ✅)
- [x] **DB-06:** Migration for `bookings` & Transaction Tracking:
  - Table `bookings` (booking_code, spr_number, lead_id, housing_unit_id, sales_id, booking_fee, total_price, payment_scheme, status).
- [x] **BOOK-01:** Booking & Tanda Jadi Dashboard ([`Bookings/Index.tsx`](file:///d:/90_ARCHIVE/nama-projek-lo/resources/js/Pages/Bookings/Index.tsx)):
  - Multi-View Switcher dengan **Card View sebagai default**.
  - Clickable points: Nama konsumen ke leads, unit badge ke daftar unit, kode booking ke Dossier 360°, nama proyek ke filter transaksi.
- [x] **BOOK-02:** Transaction Dossier 360° ([`TransactionDossierDialog.tsx`](file:///d:/90_ARCHIVE/nama-projek-lo/resources/js/Components/CRM/TransactionDossierDialog.tsx)):
  - Rincian lengkap pemesan, spesifikasi kavling, riwayat pembayaran UTJ, dan tracking KPR bank.
- [x] **BOOK-03:** Surat Pemesanan Rumah (SPR) Generator ([`SprPrintModal.tsx`](file:///d:/90_ARCHIVE/nama-projek-lo/resources/js/Components/CRM/SprPrintModal.tsx)) siap cetak dan ekspor format resmi.

---

## 🔮 Next Milestones & Future Enhancements (Backlog)
- [ ] **ADV-01:** Interactive Interactive SVG Siteplan Zoom & Pan Viewer (menggunakan `react-zoom-pan-pinch`).
- [ ] **ADV-02:** Automated WhatsApp Notification Gateway via Webhook / Baileys.
- [ ] **ADV-03:** Executive Analytics Charting (Recharts) untuk visualisasi perbandingan closing rate bulanan per marketing campaign.
- [ ] **ADV-04:** Export/Import Excel (Maatwebsite Excel) untuk database kavling dan rekonsiliasi finance.
