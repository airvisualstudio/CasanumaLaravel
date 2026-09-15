<?php

namespace Database\Seeders;

use App\Models\CustomerDocument;
use App\Models\Lead;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class CustomerDocumentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminUser = User::role('superadmin')->first() ?? User::first();
        $financeUser = User::role('finance')->first() ?? $adminUser;

        // Find leads that need KYC documents
        $leads = Lead::whereIn('status', ['booking', 'sp3k_issued', 'completed'])->get();
        if ($leads->isEmpty()) {
            $leads = Lead::limit(2)->get();
        }

        // Dummy PDF template content
        $samplePdfContent = "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000098 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF";

        // Dummy 1x1 transparent PNG content
        $samplePngContent = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');

        foreach ($leads as $lead) {
            $storageFolder = "customer_documents/{$lead->id}";

            $documentDefinitions = [
                [
                    'type' => 'ktp',
                    'file_name' => "KTP_{$lead->id}_" . preg_replace('/[^a-zA-Z0-9]/', '', $lead->name) . ".pdf",
                    'mime_type' => 'application/pdf',
                    'content' => $samplePdfContent,
                    'status' => 'verified',
                    'verified_by' => $financeUser?->id,
                    'verified_at' => Carbon::now()->subDays(2),
                    'rejection_reason' => null,
                ],
                [
                    'type' => 'kk',
                    'file_name' => "KK_{$lead->id}_Keluarga.pdf",
                    'mime_type' => 'application/pdf',
                    'content' => $samplePdfContent,
                    'status' => 'verified',
                    'verified_by' => $financeUser?->id,
                    'verified_at' => Carbon::now()->subDays(2),
                    'rejection_reason' => null,
                ],
                [
                    'type' => 'npwp',
                    'file_name' => "NPWP_{$lead->id}_Pribadi.png",
                    'mime_type' => 'image/png',
                    'content' => $samplePngContent,
                    'status' => 'verified',
                    'verified_by' => $financeUser?->id,
                    'verified_at' => Carbon::now()->subDays(1),
                    'rejection_reason' => null,
                ],
                [
                    'type' => 'buku_nikah',
                    'file_name' => "Buku_Nikah_{$lead->id}.pdf",
                    'mime_type' => 'application/pdf',
                    'content' => $samplePdfContent,
                    'status' => 'verified',
                    'verified_by' => $financeUser?->id,
                    'verified_at' => Carbon::now()->subDay(),
                    'rejection_reason' => null,
                ],
                [
                    'type' => 'slip_gaji',
                    'file_name' => "Slip_Gaji_3_Bulan_Terakhir.pdf",
                    'mime_type' => 'application/pdf',
                    'content' => $samplePdfContent,
                    'status' => 'pending',
                    'verified_by' => null,
                    'verified_at' => null,
                    'rejection_reason' => null,
                ],
                [
                    'type' => 'rek_koran',
                    'file_name' => "Rek_Koran_BCA_Bulan_Ini.pdf",
                    'mime_type' => 'application/pdf',
                    'content' => $samplePdfContent,
                    'status' => 'rejected',
                    'verified_by' => $financeUser?->id,
                    'verified_at' => Carbon::now()->subHours(6),
                    'rejection_reason' => 'Mutasi halaman ke-3 terpotong dan tidak ada stempel basah bank. Mohon upload ulang rekening koran lengkap 3 bulan.',
                ],
            ];

            foreach ($documentDefinitions as $def) {
                $filePath = "{$storageFolder}/{$def['file_name']}";

                // Save dummy file to private storage
                Storage::disk('local')->put($filePath, $def['content']);
                $fileSize = Storage::disk('local')->size($filePath);

                CustomerDocument::updateOrCreate(
                    [
                        'lead_id' => $lead->id,
                        'document_type' => $def['type'],
                    ],
                    [
                        'file_path' => $filePath,
                        'file_name' => $def['file_name'],
                        'file_size' => $fileSize ?: 102400,
                        'mime_type' => $def['mime_type'],
                        'status' => $def['status'],
                        'rejection_reason' => $def['rejection_reason'],
                        'verified_by' => $def['verified_by'],
                        'verified_at' => $def['verified_at'],
                        'uploaded_by' => $lead->sales_id ?? $adminUser->id,
                    ]
                );
            }
        }
    }
}
