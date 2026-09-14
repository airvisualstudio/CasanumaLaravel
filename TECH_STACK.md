# 💻 Technology Stack & Infrastructure Specification

---

## 1. Backend Core
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **PHP** | 8.3+ | Server-side runtime (typed properties, readonly classes, enums) |
| **Laravel** | 13.x | Robust web framework, Eloquent ORM, migration engine, job queues |
| **Inertia.js Laravel** | 2.x | Server-side adapter bridging Laravel controllers directly to React |
| **Laravel Breeze** | 2.x | Scaffolding for authentication, sessions, and password resets |
| **Laravel Sanctum** | 4.x | Lightweight authentication system for SPAs and token APIs |
| **Spatie Permission** | 6.x (Planned) | Role-Based Access Control (RBAC) & granular permission gates |

### Installed Composer Packages
| Package | Version | Type | Description |
| :--- | :--- | :--- | :--- |
| `fakerphp/faker` | 1.24.1 | `require-dev` | Faker is a PHP library that generates fake data for you. |
| `inertiajs/inertia-laravel` | 2.0.27 | `require` | The Laravel adapter for Inertia.js. |
| `laravel/boost` | 2.8.1 | `require-dev` | Laravel Boost accelerates AI-assisted development by providing the essential context and structure that AI needs to generate high-quality, Laravel-specific code. |
| `laravel/breeze` | 2.4.2 | `require-dev` | Minimal Laravel authentication scaffolding with Blade and Tailwind. |
| `laravel/framework` | 13.31.0 | `require` | The Laravel Framework. |
| `laravel/pail` | 1.2.7 | `require-dev` | Easily delve into your Laravel application's log files directly from the command line. |
| `laravel/pao` | 1.1.5 | `require-dev` | Agent-optimized output for PHP testing tools |
| `laravel/pint` | 1.32.1 | `require-dev` | An opinionated code formatter for PHP. |
| `laravel/sanctum` | 4.3.3 | `require` | Laravel Sanctum provides a featherweight authentication system for SPAs and simple APIs. |
| `laravel/tinker` | 3.0.2 | `require` | Powerful REPL for the Laravel framework. |
| `mockery/mockery` | 1.6.15 | `require-dev` | Mockery is a simple yet flexible PHP mock object framework |
| `nunomaduro/collision` | 8.9.5 | `require-dev` | Cli error handling for console/command-line PHP applications. |
| `phpunit/phpunit` | 12.5.35 | `require-dev` | The PHP Unit Testing framework. |
| `tightenco/ziggy` | 2.6.4 | `require` | Use your Laravel named routes in JavaScript. |

---

## 2. Frontend Ecosystem
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **React** | 18.x | Component-based UI library |
| **TypeScript** | 5.x | Strict type-safety, interface contracts between backend & frontend |
| **Vite** | 8.x | Fast HMR dev server and optimized production assets bundler |
| **shadcn/ui** | 4.x | Unstyled, accessible component system built on Radix UI primitives |
| **Tailwind CSS** | 4.x | Utility-first CSS engine configured with custom design tokens |
| **Lucide React** | 1.x | Consistent, lightweight vector icon library |
| **TanStack Table v8** | 8.x (Planned) | High-performance headless tables (sorting, pagination, filtering) |
| **Zod & React Hook Form** | Planned | Robust schema-first form validation |

### Installed NPM Packages
| Package | Version | Type | Description |
| :--- | :--- | :--- | :--- |
| `@fontsource-variable/inter` | 5.3.0 | `dependency` | Self-host the Inter font in a neatly bundled NPM package. |
| `@fontsource-variable/public-sans` | 5.3.0 | `dependency` | Self-host the Public Sans font in a neatly bundled NPM package. |
| `@headlessui/react` | 2.2.10 | `devDependency` | A set of completely unstyled, fully accessible UI components for React, designed to integrate beautifully with Tailwind CSS. |
| `@inertiajs/react` | 2.3.28 | `devDependency` | The React adapter for Inertia.js |
| `@laravel/multiplex` | 0.4.3 | `optionalDependency` | Optional dependency |
| `@phosphor-icons/react` | 2.1.10 | `dependency` | A clean and friendly icon family for React |
| `@tailwindcss/vite` | 4.3.3 | `devDependency` | A utility-first CSS framework for rapidly building custom user interfaces. |
| `@types/node` | 18.19.130 | `devDependency` | TypeScript definitions for node |
| `@types/react` | 18.3.31 | `devDependency` | TypeScript definitions for react |
| `@types/react-dom` | 18.3.7 | `devDependency` | TypeScript definitions for react-dom |
| `@vitejs/plugin-react` | 4.7.0 | `devDependency` | The default Vite plugin for React projects |
| `autoprefixer` | 10.6.0 | `devDependency` | Parse CSS and add vendor prefixes to CSS rules using values from the Can I Use website |
| `class-variance-authority` | 0.7.1 | `dependency` | Class Variance Authority 🧬 |
| `cn` | 0.3.0 | `dependency` | Fast, small, compiled class-name merging for Tailwind CSS. Drop-in replacement for clsx + tailwind-merge. |
| `concurrently` | 10.0.5 | `devDependency` | Run commands concurrently |
| `laravel-vite-plugin` | 3.2.0 | `devDependency` | Laravel plugin for Vite. |
| `lucide-react` | 1.45.0 | `dependency` | A Lucide icon library package for React applications. |
| `postcss` | 8.5.28 | `devDependency` | Tool for transforming styles with JS plugins |
| `radix-ui` | 1.6.7 | `dependency` | Frontend dependency |
| `react` | 18.3.1 | `devDependency` | React is a JavaScript library for building user interfaces. |
| `react-dom` | 18.3.1 | `devDependency` | React package for working with the DOM. |
| `shadcn` | 4.21.0 | `dependency` | Add components to your apps. |
| `tailwindcss` | 4.3.3 | `devDependency` | A utility-first CSS framework for rapidly building custom user interfaces. |
| `tw-animate-css` | 1.4.0 | `dependency` | TailwindCSS v4.0 compatible replacement for `tailwindcss-animate`. |
| `typescript` | 5.9.3 | `devDependency` | TypeScript is a language for application scale JavaScript development |
| `vite` | 8.3.0 | `devDependency` | Native-ESM powered web dev build tool |

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
