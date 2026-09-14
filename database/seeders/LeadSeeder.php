<?php

namespace Database\Seeders;

use App\Models\Developer;
use App\Models\HousingProject;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Database\Seeder;

class LeadSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $project1 = HousingProject::first();
        if (!$project1) return;

        $salesAgent = User::role('sales_agent')->first() ?? User::role('sales_manager')->first() ?? User::first();

        $leads = [
            [
                'developer_id' => $project1->developer_id,
                'housing_project_id' => $project1->id,
                'sales_id' => $salesAgent?->id,
                'name' => 'Bpk. Ahmad Fauzi',
                'whatsapp' => '081223344556',
                'email' => 'ahmad.fauzi@gmail.com',
                'address' => 'Kota Bandung Barat',
                'source' => 'Iklan Meta (Facebook/IG)',
                'status' => 'new',
                'notes' => 'Tertarik tipe 36/60, menanyakan simulasi KPR tenor 15 tahun.',
            ],
            [
                'developer_id' => $project1->developer_id,
                'housing_project_id' => $project1->id,
                'sales_id' => $salesAgent?->id,
                'name' => 'Ibu Rina Kartika',
                'whatsapp' => '085798765432',
                'email' => 'rina.kartika@yahoo.com',
                'address' => 'Cimahi Tengah',
                'source' => 'Walk-in / Pameran Mall',
                'status' => 'contacted',
                'notes' => 'Sudah dikirimi e-brosur dan pricelist via WhatsApp.',
            ],
            [
                'developer_id' => $project1->developer_id,
                'housing_project_id' => $project1->id,
                'sales_id' => $salesAgent?->id,
                'name' => 'Bpk. Dimas Pratama',
                'whatsapp' => '081398877665',
                'email' => 'dimas.pratama@outlook.com',
                'address' => 'Kota Bandung',
                'source' => 'Website Casanuma',
                'status' => 'survey_visit',
                'notes' => 'Jadwal kunjungan survey lokasi hari Sabtu jam 10.00 pagi.',
            ],
            [
                'developer_id' => $project1->developer_id,
                'housing_project_id' => $project1->id,
                'sales_id' => $salesAgent?->id,
                'name' => 'Bpk. Hendra Gunawan',
                'whatsapp' => '081122334455',
                'email' => 'hendra.gunawan@perusahaan.co.id',
                'address' => 'Jakarta Selatan',
                'source' => 'Referensi / Word of Mouth',
                'status' => 'booking',
                'notes' => 'Siap tanda jadi unit Lavender A1/02, menunggu kelengkapan berkas KPR.',
            ],
            [
                'developer_id' => $project1->developer_id,
                'housing_project_id' => $project1->id,
                'sales_id' => $salesAgent?->id,
                'name' => 'Ibu Siti Nurhaliza',
                'whatsapp' => '087812349988',
                'email' => 'siti.nurhaliza@gmail.com',
                'address' => 'Padalarang',
                'source' => 'TikTok Ads',
                'status' => 'rejected',
                'notes' => 'BI checking memiliki kendala pinjaman aktif.',
            ],
        ];

        foreach ($leads as $lead) {
            Lead::firstOrCreate(
                ['whatsapp' => $lead['whatsapp'], 'housing_project_id' => $lead['housing_project_id']],
                $lead
            );
        }
    }
}
