<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Cluster;
use App\Models\Developer;
use App\Models\DocumentTemplate;
use App\Models\HousingProject;
use App\Models\HousingUnit;
use App\Models\Lead;
use App\Models\UnitType;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DocumentTemplateTest extends TestCase
{
    use RefreshDatabase;

    protected User $superAdmin;
    protected User $salesManager;
    protected User $agent;
    protected Booking $booking;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
        Storage::fake('public');

        $this->superAdmin = User::factory()->create(['name' => 'Superadmin', 'is_active' => true]);
        $this->superAdmin->assignRole('superadmin');

        $this->salesManager = User::factory()->create(['name' => 'Manager', 'is_active' => true]);
        $this->salesManager->assignRole('sales_manager');

        $this->agent = User::factory()->create(['name' => 'Agent', 'is_active' => true]);
        $this->agent->assignRole('sales_agent');

        $developer = Developer::create(['name' => 'PT Pengembang Jaya', 'email' => 'dev@jaya.com', 'phone' => '0811111111']);
        $project = HousingProject::create(['developer_id' => $developer->id, 'name' => 'Grand Casanuma', 'city' => 'Bandung']);
        $cluster = Cluster::create(['housing_project_id' => $project->id, 'name' => 'Cluster Sakura']);
        $unitType = UnitType::create([
            'housing_project_id' => $project->id,
            'cluster_id' => $cluster->id,
            'name' => 'Tipe 45',
            'surface_area' => 72,
            'building_area' => 45,
            'price' => 500000000,
        ]);
        $unit = HousingUnit::create([
            'cluster_id' => $cluster->id,
            'unit_type_id' => $unitType->id,
            'block' => 'A',
            'unit_number' => '01',
            'unit_code' => 'SAK-01',
            'surface_area' => 72,
            'building_area' => 45,
            'base_price' => 500000000,
            'status' => 'booked',
        ]);
        $lead = Lead::create([
            'housing_project_id' => $project->id,
            'name' => 'Budi Santoso',
            'phone' => '08123456789',
            'whatsapp' => '08123456789',
            'email' => 'budi@gmail.com',
            'nik' => '3273010101900001',
            'assigned_agent_id' => $this->agent->id,
            'status' => 'booking',
        ]);

        $this->booking = Booking::create([
            'booking_code' => 'BK-2026-001',
            'housing_unit_id' => $unit->id,
            'lead_id' => $lead->id,
            'sales_id' => $this->agent->id,
            'transaction_date' => '2026-09-15',
            'booking_fee' => 5000000,
            'payment_scheme' => 'cash_bertahap',
            'status' => 'draft',
        ]);
    }

    public function test_authorized_user_can_view_document_templates_index(): void
    {
        DocumentTemplate::create([
            'name' => 'Kwitansi Pembayaran Standar',
            'category' => 'receipt',
            'paper_size' => 'a4',
            'orientation' => 'portrait',
            'margin_top_mm' => 20,
            'margin_bottom_mm' => 20,
            'margin_left_mm' => 25,
            'margin_right_mm' => 20,
            'letterhead_mode' => 'default_company',
            'content_html' => '<p>Kwitansi untuk {{nama_konsumen}} sebesar {{nominal_rupiah}}</p>',
            'created_by' => $this->superAdmin->id,
        ]);

        $response = $this->actingAs($this->superAdmin)->get(route('document-templates.index'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Documents/Index')
            ->has('templates', 1)
        );
    }

    public function test_user_can_create_document_template_with_f4_folio_size_and_custom_letterhead(): void
    {
        $logo = UploadedFile::fake()->image('logo_kop.png', 300, 100);

        $payload = [
            'name' => 'Surat Pengikatan Perjanjian Jual Beli (PPJB)',
            'category' => 'ppjb',
            'description' => 'PPJB Notaris Resmi Standar F4 / Folio',
            'paper_size' => 'f4',
            'orientation' => 'portrait',
            'margin_top_mm' => 25,
            'margin_bottom_mm' => 25,
            'margin_left_mm' => 30,
            'margin_right_mm' => 25,
            'letterhead_mode' => 'custom_builder',
            'letterhead_title' => 'KANTOR NOTARIS & PPAT',
            'letterhead_subtitle' => 'Pejabat Pembuat Akta Tanah Wilayah Jawa Barat',
            'letterhead_address' => 'Jl. Asia Afrika No. 100, Bandung',
            'letterhead_contact' => 'Telp: (022) 420-1234',
            'letterhead_logo' => $logo,
            'content_html' => '<p>Pada hari ini {{tanggal_sekarang}}, bertempat di kantor Notaris, telah disepakati PPJB antara {{nama_konsumen}} dan {{nama_developer}} untuk unit {{kode_unit}}.</p>',
            'footer_text' => 'Salinan PPJB Resmi',
            'is_default' => '1',
        ];

        $response = $this->actingAs($this->superAdmin)->post(route('document-templates.store'), $payload);

        $response->assertRedirect(route('document-templates.index'));
        $this->assertDatabaseHas('document_templates', [
            'name' => 'Surat Pengikatan Perjanjian Jual Beli (PPJB)',
            'category' => 'ppjb',
            'paper_size' => 'f4',
            'letterhead_mode' => 'custom_builder',
            'is_default' => true,
        ]);
    }

    public function test_preview_endpoint_renders_variables_with_booking_data(): void
    {
        $payload = [
            'content_html' => '<p>Pembeli {{nama_konsumen}} dengan NIK {{nik_konsumen}} telah memesan unit {{kode_unit}} di perumahan {{nama_proyek}} dengan skema {{skema_pembayaran}}.</p>',
            'booking_id' => $this->booking->id,
        ];

        $response = $this->actingAs($this->superAdmin)->postJson(route('document-templates.preview'), $payload);

        $response->assertStatus(200);
        $response->assertJsonStructure(['rendered_html', 'dictionary']);

        $json = $response->json();
        $this->assertStringContainsString('Budi Santoso', $json['rendered_html']);
        $this->assertStringContainsString('3273010101900001', $json['rendered_html']);
        $this->assertStringContainsString('SAK-01', $json['rendered_html']);
        $this->assertStringContainsString('Grand Casanuma', $json['rendered_html']);
    }

    public function test_export_pdf_returns_pdf_stream(): void
    {
        $template = DocumentTemplate::create([
            'name' => 'Kwitansi Pembayaran Kas',
            'category' => 'receipt',
            'paper_size' => 'a4',
            'orientation' => 'portrait',
            'margin_top_mm' => 15,
            'margin_bottom_mm' => 15,
            'margin_left_mm' => 20,
            'margin_right_mm' => 15,
            'letterhead_mode' => 'default_company',
            'content_html' => '<h3>KWITANSI</h3><p>Telah diterima dari: {{nama_konsumen}}</p>',
            'created_by' => $this->superAdmin->id,
        ]);

        $response = $this->actingAs($this->superAdmin)->get(route('document-templates.pdf', [
            'document_template' => $template->id,
            'booking_id' => $this->booking->id,
        ]));

        $response->assertStatus(200);
        $this->assertEquals('application/pdf', $response->headers->get('content-type'));
    }
}
