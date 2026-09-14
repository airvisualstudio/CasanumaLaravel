<?php

namespace Database\Seeders;

use App\Models\Developer;
use App\Models\HousingProject;
use Illuminate\Database\Seeder;

class PropertySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $dev1 = Developer::firstOrCreate(
            ['name' => 'PT Casanuma Modern Living'],
            [
                'npwp' => '01.892.456.7-428.000',
                'office_address' => 'Jl. Boulevard Utama No. 88, Kawasan Niaga Kota Baru Parahyangan, Bandung Barat',
                'phone' => '022-86813400',
                'bank_name' => 'BCA',
                'bank_account_number' => '7720991823',
                'bank_account_holder' => 'PT Casanuma Modern Living',
                'is_active' => true,
            ]
        );

        $dev2 = Developer::firstOrCreate(
            ['name' => 'PT Graha Nusantara Sukses'],
            [
                'npwp' => '02.134.789.0-401.000',
                'office_address' => 'Gedung Graha Tower Lt. 10, Jl. Asia Afrika No. 120, Kota Bandung',
                'phone' => '022-4235889',
                'bank_name' => 'Mandiri',
                'bank_account_number' => '1310088921004',
                'bank_account_holder' => 'PT Graha Nusantara Sukses',
                'is_active' => true,
            ]
        );

        HousingProject::firstOrCreate(
            ['name' => 'Casanuma Highland Resort & Residence', 'developer_id' => $dev1->id],
            [
                'city' => 'Bandung Barat',
                'address' => 'Jl. Kolonel Masturi KM 4.5, Cisarua, Lembang',
                'area_size' => 45000,
                'area_unit' => 'm²',
                'description' => 'Kawasan hunian premium bernuansa villa resort dengan hawa sejuk pegunungan dan pemandangan lembah kota Bandung.',
                'status' => 'active',
            ]
        );

        HousingProject::firstOrCreate(
            ['name' => 'Casanuma Cityville Eco Living', 'developer_id' => $dev1->id],
            [
                'city' => 'Cimahi',
                'address' => 'Jl. Mahar Martanegara No. 45, Cimahi Selatan',
                'area_size' => 28000,
                'area_unit' => 'm²',
                'description' => 'Hunian modern berkonsep eco-green 5 menit dari stasiun KCIC Padalarang.',
                'status' => 'active',
            ]
        );

        HousingProject::firstOrCreate(
            ['name' => 'Grand Nusapro Sentosa', 'developer_id' => $dev2->id],
            [
                'city' => 'Bandung Timur',
                'address' => 'Jl. Soekarno Hatta No. 780, Gedebage',
                'area_size' => 60000,
                'area_unit' => 'm²',
                'description' => 'Kawasan terpadu mandiri dekat stasiun Tegalluar dan Stadion GBLA.',
                'status' => 'planning',
            ]
        );
    }
}
