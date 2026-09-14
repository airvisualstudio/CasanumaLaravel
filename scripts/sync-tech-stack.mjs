#!/usr/bin/env node

/**
 * scripts/sync-tech-stack.mjs
 * 
 * Automatically parses composer.json, composer.lock, package.json, and bun.lock
 * to synchronize and update TECH_STACK.md with accurate versions, core technology mappings,
 * and complete installed package tables.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const TECH_STACK_PATH = path.join(ROOT_DIR, 'TECH_STACK.md');
const COMPOSER_JSON_PATH = path.join(ROOT_DIR, 'composer.json');
const COMPOSER_LOCK_PATH = path.join(ROOT_DIR, 'composer.lock');
const PACKAGE_JSON_PATH = path.join(ROOT_DIR, 'package.json');
const BUN_LOCK_PATH = path.join(ROOT_DIR, 'bun.lock');
const NODE_MODULES_PATH = path.join(ROOT_DIR, 'node_modules');

// Helper to safely read and parse JSON
function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.warn(`[sync-tech-stack] Warning: Failed to parse JSON at ${filePath}:`, err.message);
    return null;
  }
}

// Clean markdown cell contents to avoid table formatting breakage
function sanitizeMarkdown(str) {
  if (!str) return '';
  return String(str).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ').trim();
}

// Extract major version or friendly version string
function formatMajorVersion(versionStr) {
  if (!versionStr) return 'Latest';
  const clean = versionStr.replace(/^[v^~>=<\s]+/, '');
  const match = clean.match(/^(\d+)/);
  if (match) {
    return `${match[1]}.x`;
  }
  return versionStr;
}

// Extract clean semver from composer / npm constraint
function formatPhpVersion(constraint) {
  if (!constraint) return '8.2+';
  const match = constraint.match(/\^?(\d+\.\d+)/);
  if (match) {
    return `${match[1]}+`;
  }
  return constraint.replace(/^\^/, '') + '+';
}

// Parse Bun lockfile (handles Bun's JSON-like v2 format safely)
function parseBunLock(content) {
  const versions = new Map();
  if (!content) return versions;

  const regex = /"(@?[a-z0-9_.-]+(?:\/[a-z0-9_.-]+)?)"\s*:\s*\[\s*"@?[^"@\s]+@([0-9][^"@\s]*)"/gi;
  let match;
  while ((match = regex.exec(content)) !== null) {
    versions.set(match[1], match[2]);
  }
  return versions;
}

// Parse installed node_modules metadata
function getNpmPackageInfo(pkgName, bunVersions) {
  let version = bunVersions.get(pkgName) || null;
  let description = '';

  const pkgJsonPath = path.join(NODE_MODULES_PATH, pkgName, 'package.json');
  if (fs.existsSync(pkgJsonPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
      if (!version && data.version) {
        version = data.version;
      }
      if (data.description) {
        description = data.description;
      }
    } catch {
      // Ignore read errors
    }
  }

  return { version, description };
}

// Core technology definitions and metadata
const CORE_BACKEND_DEFS = [
  {
    key: 'php',
    name: '**PHP**',
    defaultPurpose: 'Server-side runtime (typed properties, readonly classes, enums)',
    getPackage: (composer) => ({
      version: formatPhpVersion(composer?.require?.php),
      installed: !!composer?.require?.php
    })
  },
  {
    key: 'laravel/framework',
    name: '**Laravel**',
    defaultPurpose: 'Robust web framework, Eloquent ORM, migration engine, job queues',
    getPackage: (composer, lockMap) => {
      const locked = lockMap.get('laravel/framework');
      const req = composer?.require?.['laravel/framework'];
      const version = locked ? formatMajorVersion(locked.version) : formatMajorVersion(req);
      return { version: version || '11.x', installed: !!(locked || req) };
    }
  },
  {
    key: 'inertiajs/inertia-laravel',
    name: '**Inertia.js Laravel**',
    defaultPurpose: 'Server-side adapter bridging Laravel controllers directly to React',
    getPackage: (composer, lockMap) => {
      const locked = lockMap.get('inertiajs/inertia-laravel');
      const req = composer?.require?.['inertiajs/inertia-laravel'];
      const version = locked ? formatMajorVersion(locked.version) : formatMajorVersion(req);
      return { version: version || '2.x', installed: !!(locked || req) };
    }
  },
  {
    key: 'laravel/breeze',
    name: '**Laravel Breeze**',
    defaultPurpose: 'Scaffolding for authentication, sessions, and password resets',
    getPackage: (composer, lockMap) => {
      const locked = lockMap.get('laravel/breeze');
      const req = composer?.['require-dev']?.['laravel/breeze'] || composer?.require?.['laravel/breeze'];
      const version = locked ? formatMajorVersion(locked.version) : (req ? formatMajorVersion(req) : null);
      return { version: version || 'Current', installed: !!(locked || req) };
    }
  },
  {
    key: 'laravel/sanctum',
    name: '**Laravel Sanctum**',
    defaultPurpose: 'Lightweight authentication system for SPAs and token APIs',
    getPackage: (composer, lockMap) => {
      const locked = lockMap.get('laravel/sanctum');
      const req = composer?.require?.['laravel/sanctum'];
      const version = locked ? formatMajorVersion(locked.version) : (req ? formatMajorVersion(req) : null);
      return { version: version || '4.x', installed: !!(locked || req) };
    }
  },
  {
    key: 'spatie/laravel-permission',
    name: '**Spatie Permission**',
    defaultPurpose: 'Role-Based Access Control (RBAC) & granular permission gates',
    getPackage: (composer, lockMap) => {
      const locked = lockMap.get('spatie/laravel-permission');
      const req = composer?.require?.['spatie/laravel-permission'];
      const version = locked ? formatMajorVersion(locked.version) : (req ? formatMajorVersion(req) : '6.x (Planned)');
      return { version, installed: !!(locked || req) };
    }
  }
];

const CORE_FRONTEND_DEFS = [
  {
    key: 'react',
    name: '**React**',
    defaultPurpose: 'Component-based UI library',
    getPackage: (pkgJson, bunVersions) => {
      const info = getNpmPackageInfo('react', bunVersions);
      const req = pkgJson?.dependencies?.react || pkgJson?.devDependencies?.react;
      const ver = info.version ? formatMajorVersion(info.version) : formatMajorVersion(req);
      return { version: ver || '18.x', installed: !!(info.version || req) };
    }
  },
  {
    key: 'typescript',
    name: '**TypeScript**',
    defaultPurpose: 'Strict type-safety, interface contracts between backend & frontend',
    getPackage: (pkgJson, bunVersions) => {
      const info = getNpmPackageInfo('typescript', bunVersions);
      const req = pkgJson?.dependencies?.typescript || pkgJson?.devDependencies?.typescript;
      const ver = info.version ? formatMajorVersion(info.version) : formatMajorVersion(req);
      return { version: ver || '5.x', installed: !!(info.version || req) };
    }
  },
  {
    key: 'vite',
    name: '**Vite**',
    defaultPurpose: 'Fast HMR dev server and optimized production assets bundler',
    getPackage: (pkgJson, bunVersions) => {
      const info = getNpmPackageInfo('vite', bunVersions);
      const req = pkgJson?.dependencies?.vite || pkgJson?.devDependencies?.vite;
      const ver = info.version ? formatMajorVersion(info.version) : formatMajorVersion(req);
      return { version: ver || 'Latest', installed: !!(info.version || req) };
    }
  },
  {
    key: 'shadcn',
    name: '**shadcn/ui**',
    defaultPurpose: 'Unstyled, accessible component system built on Radix UI primitives',
    getPackage: (pkgJson, bunVersions) => {
      const info = getNpmPackageInfo('shadcn', bunVersions);
      const req = pkgJson?.dependencies?.shadcn || pkgJson?.devDependencies?.shadcn;
      const ver = info.version ? formatMajorVersion(info.version) : (req ? formatMajorVersion(req) : 'Latest');
      return { version: ver || 'Latest', installed: !!(info.version || req) };
    }
  },
  {
    key: 'tailwindcss',
    name: '**Tailwind CSS**',
    defaultPurpose: 'Utility-first CSS engine configured with custom design tokens',
    getPackage: (pkgJson, bunVersions) => {
      const info = getNpmPackageInfo('tailwindcss', bunVersions);
      const req = pkgJson?.dependencies?.tailwindcss || pkgJson?.devDependencies?.tailwindcss;
      const ver = info.version ? formatMajorVersion(info.version) : formatMajorVersion(req);
      return { version: ver || '4.x', installed: !!(info.version || req) };
    }
  },
  {
    key: 'lucide-react',
    name: '**Lucide React**',
    defaultPurpose: 'Consistent, lightweight vector icon library',
    getPackage: (pkgJson, bunVersions) => {
      const info = getNpmPackageInfo('lucide-react', bunVersions);
      const req = pkgJson?.dependencies?.['lucide-react'] || pkgJson?.devDependencies?.['lucide-react'];
      const ver = info.version ? formatMajorVersion(info.version) : formatMajorVersion(req);
      return { version: ver || 'Latest', installed: !!(info.version || req) };
    }
  },
  {
    key: '@tanstack/react-table',
    name: '**TanStack Table v8**',
    defaultPurpose: 'High-performance headless tables (sorting, pagination, filtering)',
    getPackage: (pkgJson, bunVersions) => {
      const info = getNpmPackageInfo('@tanstack/react-table', bunVersions);
      const req = pkgJson?.dependencies?.['@tanstack/react-table'] || pkgJson?.devDependencies?.['@tanstack/react-table'];
      const ver = info.version ? formatMajorVersion(info.version) : (req ? formatMajorVersion(req) : '8.x (Planned)');
      return { version: ver, installed: !!(info.version || req) };
    }
  },
  {
    key: 'zod',
    name: '**Zod & React Hook Form**',
    defaultPurpose: 'Robust schema-first form validation',
    getPackage: (pkgJson, bunVersions) => {
      const zodInfo = getNpmPackageInfo('zod', bunVersions);
      const rhfInfo = getNpmPackageInfo('react-hook-form', bunVersions);
      const hasZod = zodInfo.version || pkgJson?.dependencies?.zod || pkgJson?.devDependencies?.zod;
      const hasRhf = rhfInfo.version || pkgJson?.dependencies?.['react-hook-form'] || pkgJson?.devDependencies?.['react-hook-form'];
      if (hasZod && hasRhf) return { version: 'Latest', installed: true };
      return { version: 'Planned', installed: false };
    }
  }
];

function generateMarkdown() {
  console.log('[sync-tech-stack] 🔍 Reading configuration files...');

  const composerJson = readJson(COMPOSER_JSON_PATH);
  const composerLock = readJson(COMPOSER_LOCK_PATH);
  const packageJson = readJson(PACKAGE_JSON_PATH);
  const bunLockRaw = fs.existsSync(BUN_LOCK_PATH) ? fs.readFileSync(BUN_LOCK_PATH, 'utf8') : null;
  const bunVersions = parseBunLock(bunLockRaw);

  if (!composerJson || !packageJson) {
    console.error('[sync-tech-stack] ❌ Error: composer.json or package.json not found!');
    process.exit(1);
  }

  // Build lock maps for Composer
  const composerLockMap = new Map();
  if (composerLock) {
    const allPkgs = [...(composerLock.packages || []), ...(composerLock['packages-dev'] || [])];
    for (const pkg of allPkgs) {
      composerLockMap.set(pkg.name, pkg);
    }
  }

  // --- 1. BACKEND CORE TABLE ---
  const backendRows = CORE_BACKEND_DEFS.map((def) => {
    const data = def.getPackage(composerJson, composerLockMap);
    return `| ${def.name} | ${sanitizeMarkdown(data.version)} | ${sanitizeMarkdown(def.defaultPurpose)} |`;
  });

  // --- 1.1 INSTALLED COMPOSER PACKAGES ---
  const composerPackages = [];
  const req = composerJson.require || {};
  const reqDev = composerJson['require-dev'] || {};

  for (const [pkg, constraint] of Object.entries(req)) {
    if (pkg === 'php') continue;
    const lockInfo = composerLockMap.get(pkg);
    composerPackages.push({
      name: pkg,
      version: lockInfo?.version ? lockInfo.version.replace(/^v/, '') : constraint,
      type: 'require',
      description: lockInfo?.description || 'PHP dependency'
    });
  }

  for (const [pkg, constraint] of Object.entries(reqDev)) {
    const lockInfo = composerLockMap.get(pkg);
    composerPackages.push({
      name: pkg,
      version: lockInfo?.version ? lockInfo.version.replace(/^v/, '') : constraint,
      type: 'require-dev',
      description: lockInfo?.description || 'Development dependency'
    });
  }

  composerPackages.sort((a, b) => a.name.localeCompare(b.name));

  const composerTableRows = composerPackages.map(
    (p) => `| \`${p.name}\` | ${sanitizeMarkdown(p.version)} | \`${p.type}\` | ${sanitizeMarkdown(p.description)} |`
  );

  // --- 2. FRONTEND ECOSYSTEM TABLE ---
  const frontendRows = CORE_FRONTEND_DEFS.map((def) => {
    const data = def.getPackage(packageJson, bunVersions);
    return `| ${def.name} | ${sanitizeMarkdown(data.version)} | ${sanitizeMarkdown(def.defaultPurpose)} |`;
  });

  // --- 2.1 INSTALLED NPM PACKAGES ---
  const npmPackages = [];
  const npmDeps = packageJson.dependencies || {};
  const npmDevDeps = packageJson.devDependencies || {};
  const npmOptional = packageJson.optionalDependencies || {};

  for (const [pkg, constraint] of Object.entries(npmDeps)) {
    const info = getNpmPackageInfo(pkg, bunVersions);
    npmPackages.push({
      name: pkg,
      version: info.version || constraint,
      type: 'dependency',
      description: info.description || 'Frontend dependency'
    });
  }

  for (const [pkg, constraint] of Object.entries(npmDevDeps)) {
    const info = getNpmPackageInfo(pkg, bunVersions);
    npmPackages.push({
      name: pkg,
      version: info.version || constraint,
      type: 'devDependency',
      description: info.description || 'Build & developer tooling'
    });
  }

  for (const [pkg, constraint] of Object.entries(npmOptional)) {
    const info = getNpmPackageInfo(pkg, bunVersions);
    npmPackages.push({
      name: pkg,
      version: info.version || constraint,
      type: 'optionalDependency',
      description: info.description || 'Optional dependency'
    });
  }

  npmPackages.sort((a, b) => a.name.localeCompare(b.name));

  const npmTableRows = npmPackages.map(
    (p) => `| \`${p.name}\` | ${sanitizeMarkdown(p.version)} | \`${p.type}\` | ${sanitizeMarkdown(p.description)} |`
  );

  // Read existing TECH_STACK.md to preserve Section 3 and 4
  let preservedSections = `## 3. Database & Storage
- **Relational Database:** MySQL 8.0+ / MariaDB 10.11+
  - InnoDB storage engine with strict foreign key constraints.
  - Indexes on searching fields: \`units(block_number, status)\`, \`leads(phone, email, status)\`.
- **Cache & Session:** Redis or optimized database driver.
- **File System:** Local NVMe disk with public storage symlink; architecture built over Laravel Storage facade for transparent S3/GCS compatibility.

---

## 4. Server & Infrastructure Target
- **Current Runtime:** VPS (Ubuntu 24.04 LTS, Nginx, PHP-FPM, Supervisor).
- **Process Manager:** Supervisor for running queue workers and scheduled tasks.
- **Production Strategy:** Git workflow -> Automated Deploy Script -> Zero-downtime symlink releases.
`;

  if (fs.existsSync(TECH_STACK_PATH)) {
    const currentContent = fs.readFileSync(TECH_STACK_PATH, 'utf8');
    const dbSectionIndex = currentContent.indexOf('## 3. Database & Storage');
    if (dbSectionIndex !== -1) {
      preservedSections = currentContent.slice(dbSectionIndex).trim() + '\n';
    }
  }

  // Assemble full markdown
  const newMarkdown = `# 💻 Technology Stack & Infrastructure Specification

---

## 1. Backend Core
| Technology | Version | Purpose |
| :--- | :--- | :--- |
${backendRows.join('\n')}

### Installed Composer Packages
| Package | Version | Type | Description |
| :--- | :--- | :--- | :--- |
${composerTableRows.join('\n')}

---

## 2. Frontend Ecosystem
| Technology | Version | Purpose |
| :--- | :--- | :--- |
${frontendRows.join('\n')}

### Installed NPM Packages
| Package | Version | Type | Description |
| :--- | :--- | :--- | :--- |
${npmTableRows.join('\n')}

---

${preservedSections}`;

  const currentContent = fs.existsSync(TECH_STACK_PATH) ? fs.readFileSync(TECH_STACK_PATH, 'utf8') : '';

  if (currentContent.trim() === newMarkdown.trim()) {
    console.log('[sync-tech-stack] ✨ TECH_STACK.md is already up to date. No changes needed.');
  } else {
    fs.writeFileSync(TECH_STACK_PATH, newMarkdown, 'utf8');
    console.log('[sync-tech-stack] 🚀 Successfully updated TECH_STACK.md!');
  }
}

generateMarkdown();
