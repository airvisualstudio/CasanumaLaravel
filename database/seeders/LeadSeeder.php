<?php

namespace Database\Seeders;

use App\Models\HousingProject;
use App\Models\Lead;
use App\Models\LeadInteraction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class LeadSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $projects = HousingProject::all();
        if ($projects->isEmpty()) {
            return;
        }

        $project1 = $projects[0];
        $project2 = $projects->count() > 1 ? $projects[1] : $project1;

        $salesAgents = User::role('sales_agent')->get();
        $sales1 = $salesAgents->first() ?? User::first();
        $sales2 = $salesAgents->count() > 1 ? $salesAgents[1] : $sales1;

        $leadsData = [
            [
                'developer_id' => $project1->developer_id,
                'housing_project_id' => $project1->id,
                'sales_id' => $sales1->id,
                'name' => 'Bpk. Ahmad Fauzi',
                'whatsapp' => '081223344556',
                'email' => 'ahmad.fauzi@gmail.com',
                'address' => 'Jl. Sukajadi No. 102, Kota Bandung',
                'source' => 'Iklan Meta (Facebook/IG)',
                'status' => 'booking',
                'notes' => 'Telah memilih unit Lavender Blok A1/01. Sudah bayar UTJ Rp 5.000.000 via transfer BCA.',
                'nik' => '3273011208850003',
                'npwp' => '09.345.678.9-428.000',
                'kk_number' => '3273012903100012',
                'job_type' => 'Karyawan Swasta',
                'company_name' => 'PT Astra International Tbk',
                'monthly_income' => 18500000,
                'slik_status' => 'clear',
                'marital_status' => 'married',
                'spouse_name' => 'Dewi Anggraini',
                'spouse_nik' => '3273014502890001',
                'max_budget' => 500000000,
                'preferred_unit_type' => 'Tipe 36/60 (Deluxe)',
                'emergency_contact_name' => 'Bambang Sudibyo',
                'emergency_contact_relation' => 'Orang Tua',
                'emergency_contact_phone' => '081299887766',
                'next_follow_up_date' => Carbon::now()->addDays(2),
                'interactions' => [
                    [
                        'channel' => 'whatsapp',
                        'stage_at_interaction' => 'new',
                        'notes' => 'Menghubungi konsumen pertama kali via WhatsApp. Konsumen merespons positif dan meminta brosur Tipe 36/60.',
                        'interaction_date' => Carbon::now()->subDays(10),
                    ],
                    [
                        'channel' => 'meeting',
                        'stage_at_interaction' => 'survey_visit',
                        'notes' => 'Konsumen dan istri berkunjung survey lokasi kavling Lavender A1/01. Sangat puas dengan lingkungan.',
                        'interaction_date' => Carbon::now()->subDays(5),
                    ],
                    [
                        'channel' => 'meeting',
                        'stage_at_interaction' => 'booking',
                        'notes' => 'Penandatanganan form pemesanan unit dan pembayaran UTJ Rp 5.000.000.',
                        'interaction_date' => Carbon::now()->subDays(1),
                    ],
                ],
            ],
            [
                'developer_id' => $project1->developer_id,
                'housing_project_id' => $project1->id,
                'sales_id' => $sales1->id,
                'name' => 'Ibu Rina Kartika',
                'whatsapp' => '085798765432',
                'email' => 'rina.kartika@yahoo.com',
                'address' => 'Komplek Permata Cimahi Blok D-14',
                'source' => 'Walk-in / Pameran Mall',
                'status' => 'sp3k_issued',
                'notes' => 'SP3K Bank Mandiri sudah terbit plafon Rp 500.000.000. Menunggu konfirmasi jadwal akad kredit.',
                'nik' => '3204126504900002',
                'npwp' => '71.234.567.8-445.000',
                'kk_number' => '3204122105150008',
                'job_type' => 'Wiraswasta',
                'company_name' => 'CV Sumber Makmur Mandiri',
                'monthly_income' => 35000000,
                'slik_status' => 'clear',
                'marital_status' => 'married',
                'spouse_name' => 'Ferry Kusuma',
                'spouse_nik' => '3204121008880004',
                'max_budget' => 650000000,
                'preferred_unit_type' => 'Tipe 45/84 (Grand)',
                'emergency_contact_name' => 'Ratna Juwita',
                'emergency_contact_relation' => 'Saudara Kandung',
                'emergency_contact_phone' => '085611223344',
                'next_follow_up_date' => Carbon::now()->addDays(3),
                'interactions' => [
                    [
                        'channel' => 'phone',
                        'stage_at_interaction' => 'contacted',
                        'notes' => 'Konfirmasi kelengkapan berkas KPR wiraswasta (rekening koran & SIUP/NIB).',
                        'interaction_date' => Carbon::now()->subDays(14),
                    ],
                    [
                        'channel' => 'phone',
                        'stage_at_interaction' => 'sp3k_issued',
                        'notes' => 'Mengabarkan kabar gembira bahwa SP3K Bank Mandiri telah disetujui penuh.',
                        'interaction_date' => Carbon::now()->subDays(2),
                    ],
                ],
            ],
            [
                'developer_id' => $project1->developer_id,
                'housing_project_id' => $project1->id,
                'sales_id' => $sales2->id,
                'name' => 'Bpk. Dimas Pratama',
                'whatsapp' => '081398877665',
                'email' => 'dimas.pratama@outlook.com',
                'address' => 'Jl. Buah Batu No. 240, Bandung',
                'source' => 'Website Casanuma',
                'status' => 'survey_visit',
                'notes' => 'Jadwal kunjungan survey lokasi Sabtu ini jam 10.00 WIB bersama arsitek pribadi.',
                'nik' => '3273152203920005',
                'npwp' => '82.345.678.1-423.000',
                'job_type' => 'PNS / BUMN',
                'company_name' => 'PT Telkom Indonesia (Persero) Tbk',
                'monthly_income' => 14000000,
                'slik_status' => 'ragu',
                'marital_status' => 'single',
                'max_budget' => 550000000,
                'preferred_unit_type' => 'Tipe 36/60 atau Tipe 45/84',
                'next_follow_up_date' => Carbon::now()->addDay(),
                'interactions' => [
                    [
                        'channel' => 'whatsapp',
                        'stage_at_interaction' => 'contacted',
                        'notes' => 'Menyampaikan rundown kunjungan dan share lokasi Google Maps kantor pemasaran.',
                        'interaction_date' => Carbon::now()->subDays(1),
                    ],
                ],
            ],
            [
                'developer_id' => $project1->developer_id,
                'housing_project_id' => $project1->id,
                'sales_id' => $sales1->id,
                'name' => 'Bpk. Hendra Gunawan',
                'whatsapp' => '081122334455',
                'email' => 'hendra.gunawan@perusahaan.co.id',
                'address' => 'Kebayoran Baru, Jakarta Selatan',
                'source' => 'Referensi / Word of Mouth',
                'status' => 'follow_up',
                'notes' => 'Tertarik kavling Pine Hills PH1/10 untuk villa weekend. Masih berdiskusi dengan keluarga.',
                'job_type' => 'Wiraswasta',
                'monthly_income' => 45000000,
                'slik_status' => 'clear',
                'max_budget' => 1500000000,
                'preferred_unit_type' => 'Tipe 72/120 (Villa 2 Lantai)',
                'next_follow_up_date' => Carbon::now()->addDays(5),
                'interactions' => [
                    [
                        'channel' => 'phone',
                        'stage_at_interaction' => 'follow_up',
                        'notes' => 'Follow up via call. Meminta dikirimkan video drone view citylight Bandung dari kavling PH1/10.',
                        'interaction_date' => Carbon::now()->subDays(3),
                    ],
                ],
            ],
            [
                'developer_id' => $project2->developer_id,
                'housing_project_id' => $project2->id,
                'sales_id' => $sales2->id,
                'name' => 'Ibu Siti Nurhaliza',
                'whatsapp' => '087812349988',
                'email' => 'siti.nurhaliza@gmail.com',
                'address' => 'Jl. Raya Gadobangkong No. 56, Padalarang',
                'source' => 'TikTok Ads',
                'status' => 'booking',
                'notes' => 'Booking unit Cluster Lavender A1/02. Berkas KYC lengkap di dalam Customer Document Vault.',
                'nik' => '3217084511940001',
                'npwp' => '65.432.198.7-428.000',
                'kk_number' => '3217081005180004',
                'job_type' => 'Apoteker / Medis',
                'company_name' => 'RSUD Cibabat Cimahi',
                'monthly_income' => 16000000,
                'slik_status' => 'clear',
                'marital_status' => 'married',
                'spouse_name' => 'Rahmat Hidayat',
                'spouse_nik' => '3217081503910003',
                'max_budget' => 500000000,
                'preferred_unit_type' => 'Tipe 36/60 (Deluxe)',
                'next_follow_up_date' => Carbon::now()->addDays(1),
            ],
            [
                'developer_id' => $project2->developer_id,
                'housing_project_id' => $project2->id,
                'sales_id' => $sales2->id,
                'name' => 'Bpk. Irfan Maulana',
                'whatsapp' => '081987654321',
                'email' => 'irfan.maulana@techstartup.id',
                'address' => 'Dago Asri No. 18, Bandung',
                'source' => 'Google Search / SEO',
                'status' => 'new',
                'notes' => 'Lead baru masuk melalui form landing page tadi malam, menanyakan promo subsidi DP.',
                'next_follow_up_date' => Carbon::now()->addHours(4),
            ],
            [
                'developer_id' => $project1->developer_id,
                'housing_project_id' => $project1->id,
                'sales_id' => $sales1->id,
                'name' => 'Ibu Maya Safitri',
                'whatsapp' => '082233445566',
                'email' => 'maya.safitri@gmail.com',
                'address' => 'Antapani, Bandung Timur',
                'source' => 'Iklan Meta (Facebook/IG)',
                'status' => 'completed',
                'notes' => 'Pembelian lunas Cash Keras unit Lavender A2/06. Kunci sudah diserahterimakan.',
                'nik' => '3273205509880006',
                'job_type' => 'Notaris',
                'monthly_income' => 50000000,
            ],
            [
                'developer_id' => $project1->developer_id,
                'housing_project_id' => $project1->id,
                'sales_id' => $sales1->id,
                'name' => 'Bpk. Wahyu Hidayat',
                'whatsapp' => '085877665544',
                'email' => 'wahyu.hidayat@yahoo.co.id',
                'address' => 'Soreang, Bandung Selatan',
                'source' => 'Brosur Flyering',
                'status' => 'rejected',
                'notes' => 'Batal melanjutkan pemesanan karena mutasi dinas kerja ke luar pulau.',
            ],
        ];

        foreach ($leadsData as $data) {
            $interactions = $data['interactions'] ?? [];
            unset($data['interactions']);

            $lead = Lead::updateOrCreate(
                ['whatsapp' => $data['whatsapp'], 'housing_project_id' => $data['housing_project_id']],
                $data
            );

            foreach ($interactions as $inter) {
                LeadInteraction::firstOrCreate(
                    [
                        'lead_id' => $lead->id,
                        'interaction_date' => $inter['interaction_date'],
                    ],
                    [
                        'user_id' => $lead->sales_id ?? $sales1->id,
                        'channel' => $inter['channel'],
                        'stage_at_interaction' => $inter['stage_at_interaction'],
                        'notes' => $inter['notes'],
                    ]
                );
            }
        }
    }
}
