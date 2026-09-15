<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Define all granular CRM permissions
        $permissions = [
            // Dashboard
            'view-dashboard',
            'view-financial-summary',

            // Unit & Kavling
            'view-units',
            'create-units',
            'edit-units',
            'delete-units',

            // Leads & CRM Pipeline
            'view-leads',
            'create-leads',
            'edit-leads',
            'delete-leads',
            'assign-leads',
            'export-leads',

            // Booking & KPR
            'view-bookings',
            'create-bookings',
            'edit-bookings',
            'approve-bookings',
            'cancel-bookings',

            // Finance & Payments
            'view-finance',
            'verify-payments',
            'issue-invoices',
            'manage-kpr',

            // Receipt Management (Kwitansi)
            'view-receipts',
            'create-receipts',
            'review-receipts',
            'approve-receipts',

            // System & User Management
            'manage-users',
            'manage-roles',
            'manage-settings',
        ];

        foreach ($permissions as $permissionName) {
            Permission::firstOrCreate(['name' => $permissionName, 'guard_name' => 'web']);
        }

        // 2. Create Roles and Assign Permissions
        // Superadmin: Has all permissions
        $superAdminRole = Role::firstOrCreate(['name' => 'superadmin', 'guard_name' => 'web']);
        $superAdminRole->syncPermissions(Permission::all());

        // Sales Manager: Supervise leads, approve bookings, view units & pipeline
        $salesManagerRole = Role::firstOrCreate(['name' => 'sales_manager', 'guard_name' => 'web']);
        $salesManagerRole->syncPermissions([
            'view-dashboard',
            'view-units',
            'create-units',
            'edit-units',
            'view-leads',
            'create-leads',
            'edit-leads',
            'delete-leads',
            'assign-leads',
            'export-leads',
            'view-bookings',
            'create-bookings',
            'edit-bookings',
            'approve-bookings',
            'cancel-bookings',
            'view-receipts',
            'approve-receipts',
        ]);

        // Sales Agent: Create & manage own leads, view units, create bookings
        $salesAgentRole = Role::firstOrCreate(['name' => 'sales_agent', 'guard_name' => 'web']);
        $salesAgentRole->syncPermissions([
            'view-dashboard',
            'view-units',
            'view-leads',
            'create-leads',
            'edit-leads',
            'view-bookings',
            'create-bookings',
            'view-receipts',
            'create-receipts',
        ]);

        // Finance: View bookings, verify payments, financial summary, issue invoices, manage KPR
        $financeRole = Role::firstOrCreate(['name' => 'finance', 'guard_name' => 'web']);
        $financeRole->syncPermissions([
            'view-dashboard',
            'view-financial-summary',
            'view-bookings',
            'view-finance',
            'verify-payments',
            'issue-invoices',
            'manage-kpr',
            'approve-bookings',
            'view-receipts',
            'review-receipts',
        ]);
    }
}
