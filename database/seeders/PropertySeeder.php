<?php

namespace Database\Seeders;

use App\Models\Cluster;
use App\Models\Developer;
use App\Models\HousingProject;
use App\Models\HousingUnit;
use App\Models\UnitType;
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

        $project1 = HousingProject::firstOrCreate(
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

        $project2 = HousingProject::firstOrCreate(
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

        $project3 = HousingProject::firstOrCreate(
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

        // 1. Clusters
        $clusterLavender = Cluster::firstOrCreate(
            ['housing_project_id' => $project1->id, 'name' => 'Cluster Lavender'],
            [
                'code' => 'LVN',
                'description' => 'Kawasan hunian cluster terdepan dengan pemandangan langsung ke bukit pinus dan taman tematik lavender.',
                'is_active' => true,
            ]
        );

        $clusterPineHills = Cluster::firstOrCreate(
            ['housing_project_id' => $project1->id, 'name' => 'Cluster Pine Hills'],
            [
                'code' => 'PNH',
                'description' => 'Cluster eksklusif lereng bukit dengan kontur bertingkat dan view citylight Bandung.',
                'is_active' => true,
            ]
        );

        $clusterGardenia = Cluster::firstOrCreate(
            ['housing_project_id' => $project2->id, 'name' => 'Cluster Gardenia'],
            [
                'code' => 'GRD',
                'description' => 'Cluster modern eco-smart home dengan solar panel dan sirkulasi udara optimal.',
                'is_active' => true,
            ]
        );

        // 2. Unit Types
        $tipe36 = UnitType::firstOrCreate(
            ['housing_project_id' => $project1->id, 'name' => 'Tipe 36/60 (Deluxe)'],
            [
                'cluster_id' => $clusterLavender->id,
                'surface_area' => 60,
                'building_area' => 36,
                'bedrooms' => 2,
                'bathrooms' => 1,
                'electricity' => '1300 VA',
                'description' => 'Rumah 1 lantai efisien dengan 2 kamar tidur, ruang keluarga terbuka, dan carport luas.',
            ]
        );

        $tipe45 = UnitType::firstOrCreate(
            ['housing_project_id' => $project1->id, 'name' => 'Tipe 45/84 (Grand)'],
            [
                'cluster_id' => $clusterLavender->id,
                'surface_area' => 84,
                'building_area' => 45,
                'bedrooms' => 2,
                'bathrooms' => 1,
                'electricity' => '2200 VA',
                'description' => 'Hunian lega dengan sisa tanah belakang luas untuk taman atau pengembangan ruangan.',
            ]
        );

        $tipe72 = UnitType::firstOrCreate(
            ['housing_project_id' => $project1->id, 'name' => 'Tipe 72/120 (Villa 2 Lantai)'],
            [
                'cluster_id' => $clusterPineHills->id,
                'surface_area' => 120,
                'building_area' => 72,
                'bedrooms' => 3,
                'bathrooms' => 2,
                'electricity' => '3500 VA',
                'description' => 'Desain modern villa 2 lantai dengan rooftop terrace dan master bedroom luas.',
            ]
        );

        // 3. Housing Units
        $unitsData = [
            [
                'cluster_id' => $clusterLavender->id,
                'unit_type_id' => $tipe36->id,
                'block' => 'A1',
                'unit_number' => '01',
                'unit_code' => 'A1/01',
                'base_price' => 450000000,
                'status' => 'available',
                'svg_element_id' => 'lot-a1-01',
                'notes' => 'Posisi dekat gerbang utama cluster.',
            ],
            [
                'cluster_id' => $clusterLavender->id,
                'unit_type_id' => $tipe36->id,
                'block' => 'A1',
                'unit_number' => '02',
                'unit_code' => 'A1/02',
                'base_price' => 450000000,
                'status' => 'booked',
                'svg_element_id' => 'lot-a1-02',
                'notes' => 'Tanda jadi via Pak Budi Santoso.',
            ],
            [
                'cluster_id' => $clusterLavender->id,
                'unit_type_id' => $tipe45->id,
                'block' => 'A2',
                'unit_number' => '05',
                'unit_code' => 'A2/05',
                'base_price' => 585000000,
                'status' => 'available',
                'svg_element_id' => 'lot-a2-05',
                'notes' => 'Hadap timur (matahari pagi).',
            ],
            [
                'cluster_id' => $clusterLavender->id,
                'unit_type_id' => $tipe45->id,
                'block' => 'A2',
                'unit_number' => '06',
                'unit_code' => 'A2/06',
                'base_price' => 610000000,
                'status' => 'sold',
                'svg_element_id' => 'lot-a2-06',
                'notes' => 'Sudah serah terima kunci.',
            ],
            [
                'cluster_id' => $clusterPineHills->id,
                'unit_type_id' => $tipe72->id,
                'block' => 'PH1',
                'unit_number' => '10',
                'unit_code' => 'PH1/10',
                'base_price' => 1150000000,
                'status' => 'available',
                'svg_element_id' => 'lot-ph1-10',
                'notes' => 'Kavling sudut (hook) dengan view bukit.',
            ],
            [
                'cluster_id' => $clusterPineHills->id,
                'unit_type_id' => $tipe72->id,
                'block' => 'PH1',
                'unit_number' => '11',
                'unit_code' => 'PH1/11',
                'base_price' => 1100000000,
                'status' => 'hold',
                'svg_element_id' => 'lot-ph1-11',
                'notes' => 'Ditahan untuk manajemen direksi.',
            ],
        ];

        foreach ($unitsData as $unit) {
            HousingUnit::firstOrCreate(
                ['unit_code' => $unit['unit_code']],
                $unit
            );
        }
    }
}
