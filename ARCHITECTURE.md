# 🏗️ System Architecture & Engineering Blueprint
**Project:** CASANUMA CRM & Centralized Housing Database  
**Stack:** Laravel 12 + Inertia.js v2 + React 18 + TypeScript + shadcn/ui + Tailwind CSS v4 + PostgreSQL  
**Target Environment:** VPS (Linux Ubuntu 24.04 LTS / Windows Dev Environment) -> Staging -> Cloud Scale-ready

---

## 1. High-Level Architecture Overview
The application follows a modern **Monolithic-hybrid SPA (Single Page Application)** paradigm powered by Inertia.js. Unlike traditional decoupled SPAs that require a separate REST/GraphQL API layer with client-side JWT handling, this architecture utilizes server-driven routing and controller logic while rendering dynamic, component-driven client views via React and shadcn/ui.

```
+-----------------------------------------------------------------------+
|                           Client Browser                              |
|   React 18 + TypeScript + shadcn/ui + Radix Primitives + Lucide Icons |
+------------------------------------+----------------------------------+
                                     |
                         JSON Payload over HTTP
                         (Inertia Engine + XHR)
                                     |
+------------------------------------v----------------------------------+
|                    Inertia.js Bridge Middleware                       |
|   - Session Validation & CSRF Protection                             |
|   - Partial Reload & Deferred Prop Serialization                      |
|   - Shared Auth State: auth.user.roles & auth.user.permissions        |
+------------------------------------+----------------------------------+
                                     |
+------------------------------------v----------------------------------+
|                      Laravel 12 Application Core                      |
|   - Form Request Validation & Policy Authorization (Spatie RBAC)      |
|   - Action/Service Layer (Domain Driven Logic)                        |
|   - Eloquent ORM + Query Scopes                                      |
|   - Event Dispatchers & Async Queues                                  |
+-------------------+-------------------------------+-------------------+
                    |                               |
          +---------v---------+           +---------v---------+
          |  Database Layer   |           |  Storage & Files  |
          |  PostgreSQL 16+   |           |  Local NVMe / S3  |
          |  (casanuma_crm)   |           |                   |
          +-------------------+           +-------------------+
```

---

## 2. Directory & Domain Modular Structure

```
crm-perumahan/
├── app/
│   ├── Actions/                  # Single Responsibility Business Actions
│   │   ├── Property/
│   │   │   ├── CreatePropertyUnitAction.php
│   │   │   ├── UpdateUnitStatusAction.php
│   │   │   └── ImportUnitsBulkAction.php
│   │   ├── Lead/
│   │   │   ├── AssignLeadToSalesAction.php
│   │   │   └── TransitionLeadStageAction.php
│   │   └── Transaction/
│   │       ├── CreateBookingOrderAction.php
│   │       └── VerifyPaymentDocumentAction.php
│   ├── Enums/                    # Strict State Enums (PHP 8.2+)
│   │   ├── UnitStatus.php        # Available, Booked, Sold, Blocked, Reserved
│   │   ├── LeadStatus.php        # New, Contacted, Survey, Negotiation, Deal, Lost
│   │   └── PaymentStatus.php     # Pending, DP_Paid, KPR_Processing, Lunas, Cancelled
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── PropertyController.php
│   │   │   ├── LeadController.php
│   │   │   ├── TransactionController.php
│   │   │   └── DashboardController.php
│   │   ├── Requests/             # Form Requests & Request Ingestion Validation
│   │   └── Resources/            # Inertia Data Transformation DTOs
│   └── Models/                   # Eloquent Entities
├── database/
│   ├── migrations/               # Database Schemas & Foreign Keys
│   └── seeders/                  # Initial Roles, Permissions, Master Data
└── resources/
    └── js/
        ├── Components/           # Reusable UI Atoms & Molecules
        │   ├── ui/               # shadcn/ui Core Components (Radix UI)
        │   ├── Forms/            # Custom Input Wrappers & Multi-step Forms
        │   └── Tables/           # TanStack Table implementations
        ├── Layouts/              # AuthenticatedLayout, GuestLayout, MinimalLayout
        ├── Pages/                # Inertia Route Views
        │   ├── Dashboard/
        │   ├── Properties/
        │   ├── Leads/
        │   ├── Transactions/
        │   └── Settings/
        ├── Hooks/                # Custom React Hooks (useDebounce, useFilter, etc.)
        └── types/                # TypeScript Interface Declarations
```

---

## 3. Data Flow & Transaction Lifecycle

1. **Client Action:** User triggers an action (e.g. reserving a unit, creating a booking fee, or viewing customer details) via standard shadcn `Dialog`.
2. **Inertia Payload:** React dispatches form data with typed parameters via `router.post()` or `useForm()`.
3. **Form Request & Policy:** Laravel validates request body (MIME type, unit availability lock) and verifies user permissions via Spatie RBAC (`superadmin`, `sales_manager`, `sales_agent`, `finance`).
4. **Action Invocation:** `CreateBookingOrderAction` executes inside a DB transaction:
   - Locks the property row (`SELECT ... FOR UPDATE`).
   - Updates `units.status` from `AVAILABLE` to `BOOKED`.
   - Creates a new record in `transactions` and logs KYC file path.
   - Triggers `UnitStatusChangedEvent`.
5. **Inertia Response:** Controller redirects back with flash status and updated model state without full page refresh.

---

## 4. Security & Role-Based Authorization Strategy
- **Authentication & RBAC:** `spatie/laravel-permission` layered on top of Laravel Breeze.
  - **4 Active Roles:**
    - `superadmin`: Total system authority, permission bypass.
    - `sales_manager`: Supervision of sales pipeline, lead assignments, and booking approvals.
    - `sales_agent`: Individual lead prospect handling, customer follow-up, and booking creation.
    - `finance`: Payment validation, document issuance (SPR), and bank KPR monitoring.
- **Frontend Authorization Contract:**
  - Roles & permissions automatically serialized via `HandleInertiaRequests.php` (`auth.user.roles`, `auth.user.permissions`).
  - React components consume the reactive `@/hooks/useAuthorization` hook (`can()`, `isSuperAdmin`, `isSalesManager`, `isSalesAgent`, `isFinance`).
- **UI Interaction & Dialog Standardization:**
  - Native browser popups (`alert`, `confirm`, `prompt`) and legacy modals are strictly prohibited.
  - All interactive dialogs, alerts, and forms utilize standard shadcn `Dialog` (`@/Components/ui/dialog`).
- **CSRF & Session Security:** SameSite cookie security, HTTPS enforcement, encrypted sessions on PostgreSQL.
- **Query Optimization:** Eager loading with indexed foreign keys (`property_cluster_id`, `assigned_sales_id`, `status`).
- **File Assets:** Direct temporary uploads or local storage with symlinks, prepared for S3 adapter switch.
