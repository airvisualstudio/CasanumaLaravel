Searched for "#"
Viewed AGENTS.md:1-58
Viewed ARCHITECTURE.md:1-113
Viewed CLAUDE.md:1-60
Viewed FRONTEND.MD:1-145
Viewed PRD.md:1-62
Viewed README.md:1-59
Viewed TASKS.md:1-47
Viewed TECH_STACK.md:1-93
Edited AGENTS.md
Edited ARCHITECTURE.md
Viewed ARCHITECTURE.md:90-114
Edited ARCHITECTURE.md
Viewed FRONTEND.MD:150-200
Edited FRONTEND.MD
Viewed PRD.md:15-35
Edited PRD.md
Viewed TASKS.md:1-47
Edited TASKS.md
Viewed TECH_STACK.md:1-35
Viewed TECH_STACK.md:75-93
Edited TECH_STACK.md
Created README.md
Viewed CLAUDE.md:20-45
Edited CLAUDE.md
Viewed walkthrough.md:1-75
Ran command: `bun run build`
Ran command: `php artisan test`

Seluruh file dokumentasi Markdown (`.md`) dalam repositori telah **diperiksa, disinkronkan, dan dijadikan standar baku** sesuai keadaan kode saat ini sebelum pengembangan dilanjutkan:

---

### Ringkasan Pembaruan Setiap File `.md`

| File Markdown | Status & Standarisasi yang Ditetapkan |
| :--- | :--- |
| **[`AGENTS.md`](file:///d:/90_ARCHIVE/nama-projek-lo/AGENTS.md)** | **Aturan Baku AI & Developer:**<br>• Larangan mutlak browser dialog `alert()`, `confirm()`, `prompt()`.<br>• Kewajiban memakai shadcn `Dialog` (`@/Components/ui/dialog`).<br>• Standar sidebar sticky dan **presisi simetri 36px** pada mode minimize (`size-10 rounded-xl`, hidden scrollbar track).<br>• Standar 4 role baku Spatie (`superadmin`, `sales_manager`, `sales_agent`, `finance`).<br>• **Bagian 5:** Larangan native `<select>` dan `<input type="date">`, wajib memakai shadcn `Select` dan `Calendar` + `Popover`. |
| **[`FRONTEND.MD`](file:///d:/90_ARCHIVE/nama-projek-lo/FRONTEND.MD)** | **Pedoman Teknis UI CRM:**<br>• **Sub-bab 4.3:** Hirarki wajib shadcn `Dialog` (`DialogContent`, `DialogHeader`, `DialogFooter`).<br>• **Sub-bab 4.4:** Arsitektur sidebar collapsible simetris & scroll mandiri.<br>• **Sub-bab 4.5:** Standardisasi Dropdown shadcn `Select` & Date Picker `Calendar` + `Popover`. |
| **[`CLAUDE.md`](file:///d:/90_ARCHIVE/nama-projek-lo/CLAUDE.md)** | **Konvensi Pengembangan:**<br>• Aturan standarisasi UI Dialog shadcn, larangan custom popup.<br>• Aturan standarisasi Dropdown & Date Picker shadcn (`Select`, `Calendar`).<br>• Standar sticky sidebar + sumbu tengah simetris 36px.<br>• Aturan otorisasi role Spatie dan hook client-side. |
| **[`ARCHITECTURE.md`](file:///d:/90_ARCHIVE/nama-projek-lo/ARCHITECTURE.md)** | **Cetak Biru Arsitektur:**<br>• Diperbarui ke **Laravel 12**, **PHP 8.5**, dan **PostgreSQL 16+** (`casanuma_crm`).<br>• Diagram aliran data otorisasi Spatie RBAC via Inertia Middleware.<br>• Kontrak otorisasi frontend dengan hook `useAuthorization`. |
| **[`PRD.md`](file:///d:/90_ARCHIVE/nama-projek-lo/PRD.md)** | **Kebutuhan Produk & Persona:**<br>• Target persona diselaraskan dengan 4 role Spatie aktif.<br>• Bagian NFR (Non-Functional Requirements) diperbarui mencakup standarisasi UI shadcn Dialog, Select, Calendar, dan layout responsif simetris. |
| **[`README.md`](file:///d:/90_ARCHIVE/nama-projek-lo/README.md)** | **Dokumentasi Proyek Utama:**<br>• Dirombak total dari skeleton default Laravel menjadi dokumentasi **CASANUMA CRM**.<br>• Kredensial akun uji untuk 4 role (`admin@casanuma.com`, `manager@...`, `sales@...`, `finance@...`).<br>• Panduan setup PostgreSQL, Bun, migrasi, dan pengujian otomasi. |
| **[`TASKS.md`](file:///d:/90_ARCHIVE/nama-projek-lo/TASKS.md)** | **Roadmap & Pelacakan Sprint:**<br>• **Phase 1 (Database, Auth, Roles, Seeders):** Ditandai `COMPLETED [x]`.<br>• **Phase 2 (Design System, User Management Full CRUD, Cropping, Select/Calendar):** Ditandai berjalan sesuai kemajuan kode saat ini. |
| **[`TECH_STACK.md`](file:///d:/90_ARCHIVE/nama-projek-lo/TECH_STACK.md)** | **Spesifikasi Stack Teknologi:**<br>• Diperbarui ke **PostgreSQL 16+** (menggantikan keterangan lama MySQL).<br>• Dicatat Bun sebagai pengelola dependensi dan bundler production. |
| **[`walkthrough.md`](file:///d:/90_ARCHIVE/nama-projek-lo/walkthrough.md)** | **Log Rekam Jejak:**<br>• Mencatat seluruh riwayat migrasi dialog, pembersihan alert, penyetelan sidebar, cropping avatar, hingga migrasi ke shadcn Select & Calendar. |

---

### Hasil Verifikasi Sistem

- **Build Frontend (`bun run build`):** Berhasil 100% tanpa error TypeScript (kompilasi chunk `Index-mOYf4ZQR.js`, `app-CIb6IhC3.js`).
- **Pengujian Backend (`php artisan test`):** 39 test lolos (127 assertions).
- **Integritas Kode:** Semua berkas dokumentasi telah mencerminkan keadaan codebase terkini secara presisi.

