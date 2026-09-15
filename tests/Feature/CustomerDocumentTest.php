<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\CustomerDocument;
use App\Models\Developer;
use App\Models\HousingProject;
use App\Models\Lead;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CustomerDocumentTest extends TestCase
{
    use RefreshDatabase;

    protected User $superAdmin;

    protected User $salesManager;

    protected User $salesAgent1;

    protected User $salesAgent2;

    protected User $finance;

    protected HousingProject $project;

    protected Lead $lead1;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);

        $developer = Developer::create([
            'name' => 'Casanuma Land Development',
            'email' => 'dev@casanuma.com',
            'phone' => '08123456789',
            'is_active' => true,
        ]);

        $this->project = HousingProject::create([
            'developer_id' => $developer->id,
            'name' => 'Grand Casanuma Hills',
            'slug' => 'grand-casanuma-hills',
            'city' => 'Bandung',
            'status' => 'active',
        ]);

        $this->superAdmin = User::factory()->create();
        $this->superAdmin->assignRole('superadmin');

        $this->salesManager = User::factory()->create();
        $this->salesManager->assignRole('sales_manager');

        $this->finance = User::factory()->create();
        $this->finance->assignRole('finance');

        $this->salesAgent1 = User::factory()->create(['name' => 'Agent One']);
        $this->salesAgent1->assignRole('sales_agent');

        $this->salesAgent2 = User::factory()->create(['name' => 'Agent Two']);
        $this->salesAgent2->assignRole('sales_agent');

        $this->lead1 = Lead::create([
            'housing_project_id' => $this->project->id,
            'sales_id' => $this->salesAgent1->id,
            'name' => 'Budi Santoso',
            'whatsapp' => '081298765432',
            'email' => 'budi@example.com',
            'source' => 'Meta Ads',
            'status' => 'survey_visit',
        ]);
    }

    public function test_user_can_upload_customer_document_to_private_storage(): void
    {
        Storage::fake('local');

        $file = UploadedFile::fake()->create('ktp_budi.pdf', 1500, 'application/pdf');

        $response = $this->actingAs($this->salesAgent1)
            ->post(route('leads.documents.store', $this->lead1->id), [
                'document_type' => 'ktp',
                'file' => $file,
            ], ['Accept' => 'application/json']);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);

        $this->assertDatabaseHas('customer_documents', [
            'lead_id' => $this->lead1->id,
            'document_type' => 'ktp',
            'file_name' => 'ktp_budi.pdf',
            'status' => 'pending',
            'uploaded_by' => $this->salesAgent1->id,
        ]);

        $doc = CustomerDocument::where('lead_id', $this->lead1->id)->first();
        $this->assertNotNull($doc);
        Storage::disk('local')->assertExists($doc->file_path);

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'upload_customer_document',
            'user_id' => $this->salesAgent1->id,
        ]);
    }

    public function test_all_six_document_slots_can_be_uploaded(): void
    {
        Storage::fake('local');

        $slots = ['ktp', 'kk', 'npwp', 'buku_nikah', 'slip_gaji', 'rek_koran'];

        foreach ($slots as $slot) {
            $file = UploadedFile::fake()->create("{$slot}.pdf", 1000, 'application/pdf');

            $response = $this->actingAs($this->salesAgent1)
                ->post(route('leads.documents.store', $this->lead1->id), [
                    'document_type' => $slot,
                    'file' => $file,
                ], ['Accept' => 'application/json']);

            $response->assertStatus(200);
        }

        $this->assertCount(6, $this->lead1->customerDocuments()->get());
    }

    public function test_sales_agent_cannot_upload_document_for_other_agents_lead(): void
    {
        Storage::fake('local');

        $file = UploadedFile::fake()->create('ktp_fraud.pdf', 500, 'application/pdf');

        $response = $this->actingAs($this->salesAgent2)
            ->post(route('leads.documents.store', $this->lead1->id), [
                'document_type' => 'ktp',
                'file' => $file,
            ], ['Accept' => 'application/json']);

        $response->assertStatus(403);
    }

    public function test_authorized_user_can_stream_preview_and_download_document(): void
    {
        Storage::fake('local');

        $file = UploadedFile::fake()->create('ktp_budi.jpg', 800, 'image/jpeg');

        $this->actingAs($this->salesAgent1)
            ->post(route('leads.documents.store', $this->lead1->id), [
                'document_type' => 'ktp',
                'file' => $file,
            ], ['Accept' => 'application/json']);

        $doc = CustomerDocument::where('lead_id', $this->lead1->id)->firstOrFail();

        // Preview stream
        $previewResponse = $this->actingAs($this->salesAgent1)
            ->get(route('customer-documents.preview', $doc->id));

        $previewResponse->assertStatus(200);
        $this->assertEquals('image/jpeg', $previewResponse->headers->get('Content-Type'));
        $this->assertStringContainsString('inline', $previewResponse->headers->get('Content-Disposition'));

        // Download
        $downloadResponse = $this->actingAs($this->finance)
            ->get(route('customer-documents.download', $doc->id));

        $downloadResponse->assertStatus(200);
    }

    public function test_finance_and_manager_can_verify_and_reject_document(): void
    {
        Storage::fake('local');

        $file = UploadedFile::fake()->create('npwp.pdf', 500, 'application/pdf');

        $this->actingAs($this->salesAgent1)
            ->post(route('leads.documents.store', $this->lead1->id), [
                'document_type' => 'npwp',
                'file' => $file,
            ], ['Accept' => 'application/json']);

        $doc = CustomerDocument::where('lead_id', $this->lead1->id)->firstOrFail();

        // 1. Finance approves/verifies
        $verifyRes = $this->actingAs($this->finance)
            ->patch(route('customer-documents.status', $doc->id), [
                'status' => 'verified',
            ], ['Accept' => 'application/json']);

        $verifyRes->assertStatus(200);
        $this->assertDatabaseHas('customer_documents', [
            'id' => $doc->id,
            'status' => 'verified',
            'verified_by' => $this->finance->id,
        ]);

        // 2. Sales Manager rejects with reason
        $rejectRes = $this->actingAs($this->salesManager)
            ->patch(route('customer-documents.status', $doc->id), [
                'status' => 'rejected',
                'rejection_reason' => 'NPWP buram dan tidak terbaca jelas',
            ], ['Accept' => 'application/json']);

        $rejectRes->assertStatus(200);
        $this->assertDatabaseHas('customer_documents', [
            'id' => $doc->id,
            'status' => 'rejected',
            'rejection_reason' => 'NPWP buram dan tidak terbaca jelas',
            'verified_by' => $this->salesManager->id,
        ]);
    }

    public function test_sales_agent_cannot_verify_document_status(): void
    {
        Storage::fake('local');

        $file = UploadedFile::fake()->create('ktp.pdf', 500, 'application/pdf');

        $this->actingAs($this->salesAgent1)
            ->post(route('leads.documents.store', $this->lead1->id), [
                'document_type' => 'ktp',
                'file' => $file,
            ], ['Accept' => 'application/json']);

        $doc = CustomerDocument::where('lead_id', $this->lead1->id)->firstOrFail();

        $response = $this->actingAs($this->salesAgent1)
            ->patch(route('customer-documents.status', $doc->id), [
                'status' => 'verified',
            ], ['Accept' => 'application/json']);

        $response->assertStatus(403);
    }

    public function test_document_deletion_removes_file_from_private_storage(): void
    {
        Storage::fake('local');

        $file = UploadedFile::fake()->create('slip_gaji.pdf', 500, 'application/pdf');

        $this->actingAs($this->salesAgent1)
            ->post(route('leads.documents.store', $this->lead1->id), [
                'document_type' => 'slip_gaji',
                'file' => $file,
            ], ['Accept' => 'application/json']);

        $doc = CustomerDocument::where('lead_id', $this->lead1->id)->firstOrFail();
        $filePath = $doc->file_path;

        Storage::disk('local')->assertExists($filePath);

        $delResponse = $this->actingAs($this->salesAgent1)
            ->delete(route('customer-documents.destroy', $doc->id), [], ['Accept' => 'application/json']);

        $delResponse->assertStatus(200);
        Storage::disk('local')->assertMissing($filePath);
        $this->assertSoftDeleted('customer_documents', ['id' => $doc->id]);
    }
}
