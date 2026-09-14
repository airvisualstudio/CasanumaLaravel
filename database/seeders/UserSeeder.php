<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Super Admin',
                'email' => 'admin@casanuma.com',
                'password' => 'password',
                'role' => 'superadmin',
            ],
            [
                'name' => 'Budi Santoso (Manager)',
                'email' => 'manager@casanuma.com',
                'password' => 'password',
                'role' => 'sales_manager',
            ],
            [
                'name' => 'Rian Pratama (Sales)',
                'email' => 'sales@casanuma.com',
                'password' => 'password',
                'role' => 'sales_agent',
            ],
            [
                'name' => 'Siti Rahma (Sales)',
                'email' => 'sales2@casanuma.com',
                'password' => 'password',
                'role' => 'sales_agent',
            ],
            [
                'name' => 'Dewi Lestari (Finance)',
                'email' => 'finance@casanuma.com',
                'password' => 'password',
                'role' => 'finance',
            ],
        ];

        foreach ($users as $userData) {
            $user = User::firstOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'password' => $userData['password'],
                    'email_verified_at' => now(),
                ]
            );

            // Sync role to ensure correct role assignment
            $user->syncRoles([$userData['role']]);
        }
    }
}
