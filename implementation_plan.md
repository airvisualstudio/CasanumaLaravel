# Modul Kwitansi & Finansial — Receipt & Financial Management

Modul baru untuk alur pengajuan kwitansi multi-step approval (Sales → Finance → Manager), PDF generator dengan template custom, QR code verifikasi keaslian dokumen, dan live notification ke semua stakeholder.

## User Review Required

> [!IMPORTANT]
> **PDF Library:** Gw pilih `barryvdh/laravel-dompdf` karena lebih ringan, support HTML/CSS template, dan udah proven di production. Atau mau `spatie/laravel-pdf` (lebih modern, pake Chromium)?

> [!IMPORTANT]
> **Live Notification Channel:** Request-nya disebut Reverb / Pusher. Gw recommend mulai dari **Database Notification** dulu (simpel, reliable) + **Telegram** (sudah ada TelegramService). Baru nanti bisa di-upgrade ke Reverb/Pusher buat real-time WebSocket. Setuju?

> [!WARNING]
> **Kwitansi vs BookingPayment:** Sistem udah punya `booking_payments` buat tracking DP/cicilan. Modul kwitansi ini adalah **layer approval di atas `booking_payments`** — bukan duplikasi. Kwitansi = dokumen resmi yang di-generate setelah pembayaran diverifikasi dan di-approve. Receipt request bisa di-link ke satu atau lebih `booking_payments`.

## Open Questions

> [!IMPORTANT]
> **Format Nomor Kwitansi Default:** Contoh di request: `KW/{TAHUN}/{BULAN}/{ID}`. Mau pake format ini langsung, atau mau customizable di Settings admin? Gw plan bikin keduanya — default format + editable di Settings.

> [!IMPORTANT]
> **Tanda Tangan Digital:** Cukup upload gambar tanda tangan (PNG) di settings admin yang kemudian ditempel ke PDF, atau butuh e-signature flow (pihak approver sign per kwitansi)?

## Proposed Changes

### Phase 1: Backend Foundation (Composer Packages + Migration + Models)

---

#### [NEW] Composer Dependencies

Install 2 package baru:

```bash
composer require barryvdh/laravel-dompdf
composer require simplesoftwareio/simple-qrcode
```

---

#### [NEW] `database/migrations/2026_09_15_200000_create_receipts_module_tables.php`

Tabel baru:

**`receipts`** — Master kwitansi:
| Column | Type | Notes |
|---|---|---|
| `id` | bigIncrements | PK |
| `receipt_number` | string(80) | Nomor kwitansi resmi, unique, nullable (diisi Finance) |
| `booking_id` | foreignId | FK → bookings |
| `lead_id` | foreignId | FK → leads (denormalized for quick access) |
| `payment_type` | string(30) | `booking_fee`, `dp`, `installment`, `pelunasan` |
| `amount` | decimal(15,2) | Nominal yang dibayar |
| `payment_method` | string(30) | `transfer_bank`, `cash`, `cheque` |
| `bank_name` | string(80) | nullable |
| `transfer_proof` | string | Path file bukti transfer |
| `payment_date` | date | Tanggal bayar |
| `notes` | text | nullable |
| `status` | string(30) | `draft` → `submitted` → `finance_review` → `finance_approved` → `manager_approved` → `rejected` |
| `submitted_by` | foreignId → users | Sales yang submit |
| `submitted_at` | timestamp | |
| `reviewed_by_finance_id` | foreignId → users | Finance reviewer |
| `reviewed_by_finance_at` | timestamp | |
| `finance_receipt_number` | string(80) | Nomor kwitansi resmi dari Finance |
| `finance_notes` | text | Catatan Finance |
| `approved_by_manager_id` | foreignId → users | Manager approver |
| `approved_by_manager_at` | timestamp | |
| `rejection_reason` | text | nullable |
| `rejected_by` | foreignId → users | nullable |
| `rejected_at` | timestamp | nullable |
| `qr_code_token` | string(64) | UUID unik untuk verifikasi |
| `qr_code_url` | string | Full URL verifikasi |
| `pdf_path` | string | Path PDF yang di-generate |
| `timestamps` | | |
| `softDeletes` | | |

**`receipt_status_logs`** — Audit trail per kwitansi:
| Column | Type | Notes |
|---|---|---|
| `id` | bigIncrements | PK |
| `receipt_id` | foreignId → receipts | |
| `from_status` | string(30) | |
| `to_status` | string(30) | |
| `changed_by` | foreignId → users | |
| `notes` | text | nullable |
| `timestamps` | | |

**`notifications`** — Laravel standard notifications table:
```bash
php artisan make:notifications-table
```

---

#### [MODIFY] `database/seeders/RolePermissionSeeder.php`

Tambah permissions baru:
```php
// Receipt Management
'create-receipts',   // Sales: buat pengajuan
'review-receipts',   // Finance: review & input nomor resmi
'approve-receipts',  // Manager: final approval
'view-receipts',     // View list kwitansi
```

Role mapping:
- `sales_agent`: `create-receipts`, `view-receipts`
- `sales_manager`: `approve-receipts`, `view-receipts`
- `finance`: `review-receipts`, `view-receipts`
- `superadmin`: all

---

#### [NEW] `app/Models/Receipt.php`

Model dengan relationships:
- `belongsTo` → Booking, Lead, submittedBy (User), reviewedByFinance (User), approvedByManager (User)
- `hasMany` → ReceiptStatusLog
- Accessors: `formatted_amount`, `transfer_proof_url`, `qr_verification_url`, `pdf_url`
- Auto-generate `qr_code_token` via UUID on creating

#### [NEW] `app/Models/ReceiptStatusLog.php`

Model audit trail per receipt.

---

### Phase 2: Receipt Controller + PDF + QR Code

---

#### [NEW] `app/Http/Controllers/ReceiptController.php`

Methods:

| Method | Role | Description |
|---|---|---|
| `index()` | All (scoped) | List kwitansi + filter + stats |
| `store()` | Sales | Buat pengajuan baru (upload bukti, pilih booking/konsumen) |
| `reviewByFinance()` | Finance | Input nomor kwitansi resmi + catatan + submit ke Manager |
| `approveByManager()` | Manager | Final approval → auto-generate QR code + PDF |
| `reject()` | Finance/Manager | Reject + alasan |
| `downloadPdf()` | All (authorized) | Download PDF kwitansi |
| `verify()` | Public (no auth) | Halaman verifikasi QR code (cek keaslian dokumen) |

---

#### [NEW] `app/Services/ReceiptPdfService.php`

Service class untuk generate PDF kwitansi:
- Load template Blade view
- Inject data: logo/kop surat dari `AppSetting`, nomor kwitansi, detail pembayaran, QR code
- Generate QR code inline (base64 SVG) via `simplesoftwareio/simple-qrcode`
- Simpan ke `storage/app/receipts/{year}/{month}/KW-{id}.pdf`

---

#### [NEW] `resources/views/pdf/receipt.blade.php`

Template PDF HTML/CSS:
- Kop surat/logo (dari Settings)
- Nomor kwitansi auto-format: `KW/{TAHUN}/{BULAN}/{ID}`
- Detail: konsumen, kavling, jenis pembayaran, nominal
- Tanda tangan digital (dari Settings)
- QR Code verifikasi di pojok kanan bawah
- Footer catatan (dari Settings)

---

#### [MODIFY] `app/Models/AppSetting.php` (or via Settings page)

Tambah keys baru di Settings untuk template kwitansi:
- `receipt_letterhead_logo` — Upload kop surat/logo
- `receipt_number_format` — Format nomor (default: `KW/{YEAR}/{MONTH}/{ID}`)
- `receipt_signature_image` — Upload gambar tanda tangan
- `receipt_footer_notes` — Footer catatan

---

### Phase 3: Notifications

---

#### [NEW] `app/Notifications/ReceiptStatusNotification.php`

Laravel Notification class:
- Channel: `database` + `TelegramService` (existing)
- Payload: receipt_id, status, message, action_url
- Triggered on setiap status change:
  - Sales submit → notify Finance
  - Finance approve → notify Manager
  - Manager approve → notify Sales + Finance
  - Reject → notify submitter

---

#### [MODIFY] `app/Http/Middleware/HandleInertiaRequests.php`

Tambah shared props:
```php
'unread_notifications_count' => fn () => $user ? $user->unreadNotifications()->count() : 0,
```

---

#### [NEW] `app/Http/Controllers/NotificationController.php`

Simple controller:
- `index()` — List notifications (dropdown di topbar)
- `markAsRead()` — Mark single notification
- `markAllAsRead()` — Mark all

---

### Phase 4: Frontend (React/Inertia Pages)

---

#### [NEW] `resources/js/Pages/Receipts/Index.tsx`

Halaman utama kwitansi:
- **Card View** (default) + **Table View** switcher
- Filter: status, payment_type, search
- Stats dashboard: jumlah per status (draft/submitted/approved/rejected)
- Card interaktif: klik konsumen → detail, klik booking → TransactionDossier
- Role-based actions: Sales lihat miliknya, Finance lihat yang perlu review, Manager lihat yang perlu approve

#### [NEW] `resources/js/Pages/Receipts/Partials/CreateReceiptDialog.tsx`

Dialog pengajuan kwitansi (Sales):
- Select booking (auto-fill konsumen & kavling)
- Input jenis pembayaran, nominal, metode bayar, bank
- Upload bukti transfer
- Textarea catatan

#### [NEW] `resources/js/Pages/Receipts/Partials/FinanceReviewDialog.tsx`

Dialog review Finance:
- Preview bukti transfer
- Input nomor kwitansi resmi
- Input rincian pelunasan / catatan
- Approve → submit ke Manager, atau Reject

#### [NEW] `resources/js/Pages/Receipts/Partials/ManagerApprovalDialog.tsx`

Dialog approval Manager:
- Preview semua detail + catatan Finance
- Approve → system generate QR + PDF
- Reject + alasan

#### [NEW] `resources/js/Pages/Receipts/Partials/ReceiptDetailDialog.tsx`

Dialog detail kwitansi:
- Timeline status (audit trail)
- Detail pembayaran
- Preview PDF (download link)
- QR code display

---

#### [MODIFY] `resources/js/Layouts/AuthenticatedLayout.tsx`

Tambah:
- Menu item "Kwitansi" di sidebar (icon: `Receipt`)
- Notification bell di topbar (dropdown list, unread count badge)

---

#### [NEW] `resources/js/Pages/Receipts/Verify.tsx`

Halaman publik (tanpa login) untuk verifikasi QR:
- Scan QR → redirect ke `/receipts/verify/{token}`
- Tampilkan status: VALID ✅ / TIDAK DITEMUKAN ❌
- Info: nomor kwitansi, tanggal, nominal, status

---

### Phase 5: Routes & Permissions

---

#### [MODIFY] `routes/web.php`

```php
// Receipt Management
Route::middleware(['auth', 'can:view-receipts'])->group(function () {
    Route::get('/receipts', [ReceiptController::class, 'index'])->name('receipts.index');

    Route::middleware('can:create-receipts')->group(function () {
        Route::post('/receipts', [ReceiptController::class, 'store'])->name('receipts.store');
    });

    Route::middleware('can:review-receipts')->group(function () {
        Route::post('/receipts/{receipt}/finance-review', [ReceiptController::class, 'reviewByFinance'])->name('receipts.finance-review');
    });

    Route::middleware('can:approve-receipts')->group(function () {
        Route::post('/receipts/{receipt}/approve', [ReceiptController::class, 'approveByManager'])->name('receipts.approve');
    });

    Route::post('/receipts/{receipt}/reject', [ReceiptController::class, 'reject'])->name('receipts.reject');
    Route::get('/receipts/{receipt}/download-pdf', [ReceiptController::class, 'downloadPdf'])->name('receipts.download-pdf');
});

// Public QR verification (no auth)
Route::get('/receipts/verify/{token}', [ReceiptController::class, 'verify'])->name('receipts.verify');

// Notifications
Route::middleware('auth')->group(function () {
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.mark-read');
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
});
```

---

### Phase 6: Receipt Settings UI

---

#### [MODIFY] `resources/js/Pages/Settings/` & `GeneralSettingController.php`

Tambah tab/section baru "Template Kwitansi" di Settings admin:
- Upload kop surat/logo
- Format nomor kwitansi (editable)
- Upload tanda tangan digital
- Textarea footer catatan
- Preview template

---

## Verification Plan

### Automated Tests

```bash
# Migration & model test
php artisan migrate --force

# Feature test: Receipt approval workflow
php artisan test --filter=ReceiptApprovalWorkflowTest
```

#### [NEW] `tests/Feature/ReceiptApprovalWorkflowTest.php`

Test cases:
1. Sales bisa submit pengajuan kwitansi
2. Finance bisa review & input nomor resmi
3. Manager bisa approve → auto-generate QR token
4. PDF download berfungsi
5. Public QR verification endpoint valid
6. Reject flow + alasan tercatat
7. RBAC: Sales gabisa approve, Finance gabisa create, dll
8. Notification terkirim ke role yang tepat

### Manual Verification

- Build frontend: `bun run build`
- Login sebagai tiap role, test full flow
- Scan QR code di PDF → verify halaman publik
- Cek notification bell di topbar
