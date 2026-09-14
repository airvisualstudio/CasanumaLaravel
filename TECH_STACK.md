# 💻 Technology Stack & Infrastructure Specification

---

## 1. Backend Core
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **PHP** | 8.2+ | Server-side runtime (typed properties, readonly classes, enums) |
| **Laravel** | 11.x | Robust web framework, Eloquent ORM, migration engine, job queues |
| **Inertia.js Laravel** | 2.x | Server-side adapter bridging Laravel controllers directly to React |
| **Spatie Permission** | 6.x | Role-Based Access Control (RBAC) & granular permission gates |
| **Laravel Breeze** | Current | Scaffolding for authentication, sessions, and password resets |

---

## 2. Frontend Ecosystem
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **React** | 18.x | Component-based UI library |
| **TypeScript** | 5.x | Strict type-safety, interface contracts between backend & frontend |
| **Vite** | 5.x | Fast HMR dev server and optimized production assets bundler |
| **shadcn/ui** | Latest | Unstyled, accessible component system built on Radix UI primitives |
| **Tailwind CSS** | 3.4+ | Utility-first CSS engine configured with custom design tokens |
| **Lucide React** | Latest | Consistent, lightweight vector icon library |
| **TanStack Table v8**| 8.x | High-performance headless tables (sorting, pagination, filtering) |
| **Zod & React Hook Form** | Latest | Robust schema-first form validation |

---

## 3. Database & Storage
- **Relational Database:** MySQL 8.0+ / MariaDB 10.11+
  - InnoDB storage engine with strict foreign key constraints.
  - Indexes on searching fields: `units(block_number, status)`, `leads(phone, email, status)`.
- **Cache & Session:** Redis or optimized database driver.
- **File System:** Local NVMe disk with public storage symlink; architecture built over Laravel Storage facade for transparent S3/GCS compatibility.

---

## 4. Server & Infrastructure Target
- **Current Runtime:** VPS (Ubuntu 24.04 LTS, Nginx, PHP-FPM, Supervisor).
- **Process Manager:** Supervisor for running queue workers and scheduled tasks.
- **Production Strategy:** Git workflow -> Automated Deploy Script -> Zero-downtime symlink releases.
