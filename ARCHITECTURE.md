# 🏗️ System Architecture & Engineering Blueprint
**Project:** Real Estate CRM & Property Database  
**Stack:** Laravel 11 + Inertia.js v2 + React 18 + TypeScript + shadcn/ui + Tailwind CSS  
**Target Environment:** VPS (Linux Ubuntu 24.04 LTS) -> Staging -> Cloud Scale-ready (AWS/GCP)

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
|   - Shared Flash & Auth State Propagation                             |
+------------------------------------+----------------------------------+
                                     |
+------------------------------------v----------------------------------+
|                      Laravel 11 Application Core                      |
|   - Form Request Validation & Policy Authorization                    |
|   - Action/Service Layer (Domain Driven Logic)                        |
|   - Eloquent ORM + Query Scopes                                      |
|   - Event Dispatchers & Async Queues (Redis/Database)                 |
+-------------------+-------------------------------+-------------------+
                    |                               |
          +---------v---------+           +---------v---------+
          |  Database Layer   |           |  Storage & Files  |
          |  MySQL 8 / MariaDB|           |  Local NVMe / S3  |
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

1. **Client Action:** Sales rep updates a unit status to `BOOKED` and attaches customer KYC docs via shadcn modal.
2. **Inertia Payload:** React dispatches form data with typed parameters via `router.post()` or `useForm()`.
3. **Form Request & Policy:** Laravel validates request body (MIME type, unit availability lock) and verifies user permissions (Role: `admin`, `sales_agent`).
4. **Action Invocation:** `CreateBookingOrderAction` executes inside a DB transaction:
   - Locks the property row (`SELECT ... FOR UPDATE`).
   - Updates `units.status` from `AVAILABLE` to `BOOKED`.
   - Creates a new record in `transactions` and logs KYC file path.
   - Triggers `UnitStatusChangedEvent`.
5. **Inertia Response:** Controller redirects back with flash status and updated model state without full page refresh.

---

## 4. Security & Performance Strategy
- **Authentication & Roles:** Spatie Laravel-Permission with Breeze authentication scaffolding.
- **CSRF & Session Security:** SameSite cookie security, HTTPS enforcement, encrypted sessions.
- **Query Optimization:** Eager loading with indexed foreign keys (`property_cluster_id`, `assigned_sales_id`, `status`).
- **File Assets:** Direct temporary uploads or local NVMe storage with symlinks, prepared for S3 adapter switch.
