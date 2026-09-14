<?php

namespace Tests\Feature;

use App\Models\Developer;
use App\Models\HousingProject;
use App\Models\Lead;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LeadManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $superAdmin;
    protected User $salesAgent;
    protected HousingProject $project;
    protected Developer $developer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);

        $this->superAdmin = User::factory()->create();
        $this->superAdmin->assignRole('superadmin');

        $this->salesAgent = User::factory()->create();
        $this->salesAgent->assignRole('sales_agent');

        $this->developer = Developer::create([
            'name' => 'PT Casanuma Living',
            'is_active' => true,
        ]);

        $this->project = HousingProject::create([
            'developer_id' => $this->developer->id,
            'name' => 'Casanuma Highland',
            'city' => 'Bandung',
            'area_size' => 20000,
            'area_unit' => 'm²',
            'status' => 'active',
        ]);
    }

    public function test_can_view_leads_index_page(): void
    {
        $response = $this->actingAs($this->superAdmin)->get(route('leads.index'));
        $response->assertStatus(200);
    }

    public function test_can_create_lead(): void
    {
        $response = $this->actingAs($this->superAdmin)->post(route('leads.store'), [
            'housing_project_id' => $this->project->id,
            'developer_id' => $this->developer->id,
            'sales_id' => $this->salesAgent->id,
            'name' => 'Bpk. Ridwan Kamil',
            'whatsapp' => '081234567890',
            'email' => 'ridwan@gmail.com',
            'address' => 'Kota Bandung',
            'source' => 'Iklan Meta (Facebook/IG)',
            'status' => 'new',
            'notes' => 'Tertarik tipe 72/120',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('leads', [
            'name' => 'Bpk. Ridwan Kamil',
            'whatsapp' => '081234567890',
            'status' => 'new',
            'sales_id' => $this->salesAgent->id,
        ]);
    }

    public function test_can_update_lead_and_pipeline_status(): void
    {
        $lead = Lead::create([
            'housing_project_id' => $this->project->id,
            'developer_id' => $this->developer->id,
            'sales_id' => $this->salesAgent->id,
            'name' => 'Ibu Siti Aminah',
            'whatsapp' => '081987654321',
            'source' => 'Website Casanuma',
            'status' => 'new',
        ]);

        // 1. Update full details
        $updateResponse = $this->actingAs($this->superAdmin)->put(route('leads.update', $lead->id), [
            'housing_project_id' => $this->project->id,
            'developer_id' => $this->developer->id,
            'sales_id' => $this->salesAgent->id,
            'name' => 'Ibu Siti Aminah M.Si',
            'whatsapp' => '081987654321',
            'source' => 'Website Casanuma',
            'status' => 'contacted',
            'notes' => 'Sudah ditelepon',
        ]);
        $updateResponse->assertRedirect();
        $this->assertDatabaseHas('leads', [
            'id' => $lead->id,
            'name' => 'Ibu Siti Aminah M.Si',
            'status' => 'contacted',
        ]);

        // 2. Quick status update
        $patchResponse = $this->actingAs($this->superAdmin)->patch(route('leads.update-status', $lead->id), [
            'status' => 'survey_visit',
        ]);
        $patchResponse->assertRedirect();
        $this->assertDatabaseHas('leads', [
            'id' => $lead->id,
            'status' => 'survey_visit',
        ]);
    }

    public function test_can_soft_delete_lead(): void
    {
        $lead = Lead::create([
            'housing_project_id' => $this->project->id,
            'name' => 'Bpk. Budi Santoso',
            'whatsapp' => '08111222333',
            'source' => 'Walk-in / Pameran Mall',
            'status' => 'new',
        ]);

        $deleteResponse = $this->actingAs($this->superAdmin)->delete(route('leads.destroy', $lead->id));
        $deleteResponse->assertRedirect();

        $this->assertSoftDeleted('leads', ['id' => $lead->id]);
    }

    public function test_filter_leads_by_project_and_status(): void
    {
        Lead::create([
            'housing_project_id' => $this->project->id,
            'name' => 'Lead New 1',
            'whatsapp' => '08110001',
            'source' => 'Website',
            'status' => 'new',
        ]);

        Lead::create([
            'housing_project_id' => $this->project->id,
            'name' => 'Lead Booking 1',
            'whatsapp' => '08110002',
            'source' => 'Iklan',
            'status' => 'booking',
        ]);

        $response = $this->actingAs($this->superAdmin)->get(route('leads.index', [
            'project_id' => $this->project->id,
            'status' => 'booking',
        ]));

        $response->assertStatus(200);
        $response->assertSee('Lead Booking 1');
    }
}
