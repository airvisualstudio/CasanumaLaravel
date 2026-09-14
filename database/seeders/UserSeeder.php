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
                'phone' => '081220001001',
                'address' => 'Jl. Boulevard Casanuma No. 1, Bandung',
                'emergency_contact_name' => 'Keluarga Admin',
                'emergency_contact_phone' => '081220001002',
                'employee_id' => 'CSN-ADM-001',
                'position' => 'Head of Operations & IT',
                'join_date' => '2023-01-15',
                'is_active' => true,
                'bank_name' => 'BCA',
                'bank_account_number' => '7720192831',
                'bank_account_holder' => 'Super Admin',
            ],
            [
                'name' => 'Budi Santoso (Manager)',
                'email' => 'manager@casanuma.com',
                'password' => 'password',
                'role' => 'sales_manager',
                'phone' => '081324567890',
                'address' => 'Komplek Larasati Blok A-12, Bandung Barat',
                'emergency_contact_name' => 'Ratna Dewi (Istri)',
                'emergency_contact_phone' => '081324567899',
                'employee_id' => 'CSN-MGR-002',
                'position' => 'Sales & Marketing Manager',
                'join_date' => '2023-03-01',
                'is_active' => true,
                'bank_name' => 'Mandiri',
                'bank_account_number' => '1310028912384',
                'bank_account_holder' => 'Budi Santoso',
            ],
            [
                'name' => 'Rian Pratama (Sales)',
                'email' => 'sales@casanuma.com',
                'password' => 'password',
                'role' => 'sales_agent',
                'phone' => '082119876543',
                'address' => 'Jl. Cilame Indah No. 45, Cimahi',
                'emergency_contact_name' => 'Bambang Pratama (Ayah)',
                'emergency_contact_phone' => '082119876540',
                'employee_id' => 'CSN-SLS-003',
                'position' => 'Senior Property Consultant',
                'join_date' => '2023-06-10',
                'is_active' => true,
                'bank_name' => 'BCA',
                'bank_account_number' => '8420912345',
                'bank_account_holder' => 'Rian Pratama',
            ],
            [
                'name' => 'Siti Rahma (Sales)',
                'email' => 'sales2@casanuma.com',
                'password' => 'password',
                'role' => 'sales_agent',
                'phone' => '085712349876',
                'address' => 'Jl. Cibabat Raya No. 88, Cimahi',
                'emergency_contact_name' => 'Hj. Aminah (Ibu)',
                'emergency_contact_phone' => '085712349870',
                'employee_id' => 'CSN-SLS-004',
                'position' => 'Property Consultant',
                'join_date' => '2024-01-08',
                'is_active' => true,
                'bank_name' => 'BNI',
                'bank_account_number' => '0981234567',
                'bank_account_holder' => 'Siti Rahma',
            ],
            [
                'name' => 'Dewi Lestari (Finance)',
                'email' => 'finance@casanuma.com',
                'password' => 'password',
                'role' => 'finance',
                'phone' => '087823456789',
                'address' => 'Jl. Sariwangi Asri No. 19, Bandung Barat',
                'emergency_contact_name' => 'Agus Lestari (Suami)',
                'emergency_contact_phone' => '087823456780',
                'employee_id' => 'CSN-FIN-005',
                'position' => 'Finance & KPR Specialist',
                'join_date' => '2023-04-15',
                'is_active' => true,
                'bank_name' => 'BRI',
                'bank_account_number' => '412301009876501',
                'bank_account_holder' => 'Dewi Lestari',
            ],
        ];

        foreach ($users as $userData) {
            $user = User::updateOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'password' => $userData['password'],
                    'email_verified_at' => now(),
                    'phone' => $userData['phone'],
                    'address' => $userData['address'],
                    'emergency_contact_name' => $userData['emergency_contact_name'],
                    'emergency_contact_phone' => $userData['emergency_contact_phone'],
                    'employee_id' => $userData['employee_id'],
                    'position' => $userData['position'],
                    'join_date' => $userData['join_date'],
                    'is_active' => $userData['is_active'],
                    'bank_name' => $userData['bank_name'],
                    'bank_account_number' => $userData['bank_account_number'],
                    'bank_account_holder' => $userData['bank_account_holder'],
                ]
            );

            // Sync role to ensure correct role assignment
            $user->syncRoles([$userData['role']]);
        }
    }
}
