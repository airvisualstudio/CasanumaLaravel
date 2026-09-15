<?php

namespace Tests\Feature;

use App\Models\Developer;
use App\Models\HousingProject;
use App\Models\Lead;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LeadKprReadinessTest extends TestCase
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
            'name' => 'PT Casanuma Living Sejahtera',
            'is_active' => true,
        ]);

        $this->project = HousingProject::create([
            'developer_id' => $this->developer->id,
            'name' => 'Casanuma Hills',
            'city' => 'Bandung Barat',
            'area_size' => 25000,
            'area_unit' => 'm²',
            'status' => 'active',
        ]);
    }

    public function test_can_create_lead_with_financial_slik_spouse_and_unit_preference(): void
    {
        $response = $this->actingAs($this->superAdmin)->post(route('leads.store'), [
            'housing_project_id' => $this->project->id,
            'developer_id' => $this->developer->id,
            'sales_id' => $this->salesAgent->id,
            'name' => 'Bpk. Ahmad Fauzi',
            'whatsapp' => '081298765432',
            'email' => 'ahmad.fauzi@gmail.com',
            'nik' => '3273011203890001',
            'job_type' => 'Karyawan BUMN / BUMD',
            'company_name' => 'PT Telkom Indonesia',
            'monthly_income' => 22000000,
            'slik_status' => 'clear',
            'marital_status' => 'married',
            'spouse_name' => 'Ibu Siti Nurhaliza',
            'spouse_nik' => '3273015506900002',
            'max_budget' => 850000000,
            'preferred_unit_type' => 'Tipe 45/84 Hook',
            'address' => 'Kota Bandung',
            'source' => 'Iklan Meta (Facebook/IG)',
            'status' => 'new',
            'notes' => 'Siap join income KPR BTN Syariah DP 10%',
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('leads', [
            'name' => 'Bpk. Ahmad Fauzi',
            'nik' => '3273011203890001',
            'job_type' => 'Karyawan BUMN / BUMD',
            'company_name' => 'PT Telkom Indonesia',
            'slik_status' => 'clear',
            'marital_status' => 'married',
            'spouse_name' => 'Ibu Siti Nurhaliza',
            'spouse_nik' => '3273015506900002',
            'preferred_unit_type' => 'Tipe 45/84 Hook',
        ]);

        $lead = Lead::where('name', 'Bpk. Ahmad Fauzi')->first();
        $this->assertNotNull($lead);
        $this->assertEquals('clear', $lead->slik_status);
        $this->assertEquals(22000000, (float) $lead->monthly_income);
        $this->assertEquals(850000000, (float) $lead->max_budget);
        $this->assertStringContainsString('Rp 22.000.000', $lead->formatted_monthly_income);
        $this->assertStringContainsString('Rp 850.000.000', $lead->formatted_max_budget);
    }

    public function test_can_update_lead_slik_status_and_kpr_data(): void
    {
        $lead = Lead::create([
            'housing_project_id' => $this->project->id,
            'developer_id' => $this->developer->id,
            'sales_id' => $this->salesAgent->id,
            'name' => 'Ibu Ratna Dewi',
            'whatsapp' => '081398765432',
            'email' => 'ratna.dewi@gmail.com',
            'slik_status' => 'ragu',
            'source' => 'Website Casanuma',
            'status' => 'contacted',
        ]);

        $response = $this->actingAs($this->superAdmin)->put(route('leads.update', $lead->id), [
            'housing_project_id' => $this->project->id,
            'developer_id' => $this->developer->id,
            'sales_id' => $this->salesAgent->id,
            'name' => 'Ibu Ratna Dewi',
            'whatsapp' => '081398765432',
            'email' => 'ratna.dewi@gmail.com',
            'job_type' => 'Wiraswasta / Pengusaha',
            'company_name' => 'CV Sumber Rejeki',
            'monthly_income' => 35000000,
            'slik_status' => 'clear', // Updated after paying off overdue
            'marital_status' => 'single',
            'max_budget' => 950000000,
            'preferred_unit_type' => 'Tipe 54/90',
            'source' => 'Website Casanuma',
            'status' => 'survey_visit',
        ]);

        $response->assertRedirect();

        $lead->refresh();
        $this->assertEquals('clear', $lead->slik_status);
        $this->assertEquals('Wiraswasta / Pengusaha', $lead->job_type);
        $this->assertEquals('CV Sumber Rejeki', $lead->company_name);
        $this->assertEquals('Tipe 54/90', $lead->preferred_unit_type);
        $this->assertEquals('survey_visit', $lead->status);
    }

    public function test_validates_slik_status_must_be_in_allowed_options(): void
    {
        $response = $this->actingAs($this->superAdmin)->post(route('leads.store'), [
            'housing_project_id' => $this->project->id,
            'name' => 'Test Slik Validation',
            'whatsapp' => '081112223334',
            'slik_status' => 'invalid_status',
            'source' => 'Website Casanuma',
            'status' => 'new',
        ]);

        $response->assertSessionHasErrors(['slik_status']);
    }

    public function test_can_search_leads_by_spouse_name_and_preferred_unit_type(): void
    {
        Lead::create([
            'housing_project_id' => $this->project->id,
            'sales_id' => $this->salesAgent->id,
            'name' => 'Bpk. Surya Saputra',
            'whatsapp' => '081234000111',
            'marital_status' => 'married',
            'spouse_name' => 'Cynthia Lamusu',
            'preferred_unit_type' => 'Tipe Villa Mezzanine',
            'source' => 'Website Casanuma',
            'status' => 'new',
        ]);

        $response = $this->actingAs($this->superAdmin)->get(route('leads.index', ['search' => 'Cynthia']));
        $response->assertStatus(200);

        $response2 = $this->actingAs($this->superAdmin)->get(route('leads.index', ['search' => 'Mezzanine']));
        $response2->assertStatus(200);
    }
}
