<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\Developer;
use App\Models\HousingProject;
use App\Models\Lead;
use App\Models\LeadInteraction;
use App\Models\User;
use App\Services\LeadSlaService;
use Carbon\Carbon;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LeadTemperatureAndSlaTest extends TestCase
{
    use RefreshDatabase;

    protected User $superAdmin;
    protected User $salesManager;
    protected User $salesAgent;
    protected HousingProject $project;
    protected Developer $developer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);

        $this->superAdmin = User::factory()->create(['name' => 'Super Admin Test']);
        $this->superAdmin->assignRole('superadmin');

        $this->salesManager = User::factory()->create(['name' => 'Sales Manager Test']);
        $this->salesManager->assignRole('sales_manager');

        $this->salesAgent = User::factory()->create(['name' => 'Sales Agent Test']);
        $this->salesAgent->assignRole('sales_agent');

        $this->developer = Developer::create([
            'name' => 'PT Casanuma Living Developer',
            'is_active' => true,
        ]);

        $this->project = HousingProject::create([
            'developer_id' => $this->developer->id,
            'name' => 'Casanuma Grand Emerald',
            'city' => 'Bandung',
            'area_size' => 20000,
            'area_unit' => 'm²',
            'status' => 'active',
        ]);
    }

    public function test_can_create_lead_with_temperature_and_source_detail(): void
    {
        $payload = [
            'housing_project_id' => $this->project->id,
            'developer_id' => $this->developer->id,
            'sales_id' => $this->salesAgent->id,
            'name' => 'Bpk. Suryanto Wijaya',
            'whatsapp' => '081299887766',
            'source' => 'Iklan Meta (Facebook/IG)',
            'source_detail' => 'Meta Ads Promo DP 0% Cluster Ruby',
            'lead_temperature' => 'hot',
            'status' => 'new',
        ];

        $response = $this->actingAs($this->salesManager)->post(route('leads.store'), $payload);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('leads', [
            'name' => 'Bpk. Suryanto Wijaya',
            'lead_temperature' => 'hot',
            'source_detail' => 'Meta Ads Promo DP 0% Cluster Ruby',
        ]);

        $lead = Lead::where('whatsapp', '081299887766')->first();
        $this->assertEquals('HOT', $lead->lead_temperature_badge['label']);
        $this->assertEquals('hot', $lead->lead_temperature_badge['status']);
    }

    public function test_default_temperature_is_warm(): void
    {
        $payload = [
            'housing_project_id' => $this->project->id,
            'developer_id' => $this->developer->id,
            'name' => 'Ibu Maria Ulfa',
            'whatsapp' => '081211223344',
            'source' => 'Walk-in / Pameran Mall',
            'status' => 'new',
        ];

        $response = $this->actingAs($this->salesAgent)->post(route('leads.store'), $payload);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $lead = Lead::where('whatsapp', '081211223344')->first();
        $this->assertEquals('warm', $lead->lead_temperature);
        $this->assertEquals('WARM', $lead->lead_temperature_badge['label']);
    }

    public function test_auto_revoke_inactive_new_lead_after_7_days(): void
    {
        // Lead status 'new' created 9 days ago with no follow-up
        $lead = Lead::create([
            'developer_id' => $this->developer->id,
            'housing_project_id' => $this->project->id,
            'sales_id' => $this->salesAgent->id,
            'name' => 'Bpk. Dian Sastro',
            'whatsapp' => '081344556677',
            'source' => 'Iklan Meta (Facebook/IG)',
            'status' => 'new',
        ]);
        Lead::where('id', $lead->id)->update(['created_at' => Carbon::now()->subDays(9)]);

        $slaService = new LeadSlaService();
        $result = $slaService->revokeInactiveLeads(7);

        $this->assertEquals(1, $result['count']);

        $lead->refresh();
        $this->assertNull($lead->sales_id);
        $this->assertNotNull($lead->sla_revoked_at);

        // Assert auto-interaction recorded
        $this->assertDatabaseHas('lead_interactions', [
            'lead_id' => $lead->id,
            'stage_at_interaction' => 'new',
        ]);

        // Assert ActivityLog recorded
        $this->assertDatabaseHas('activity_logs', [
            'action' => 'lead_sla_revoked',
            'subject_type' => Lead::class,
            'subject_id' => $lead->id,
        ]);
    }

    public function test_active_new_lead_with_recent_interaction_is_not_revoked(): void
    {
        // Lead created 10 days ago, but interacted 2 days ago
        $lead = Lead::create([
            'developer_id' => $this->developer->id,
            'housing_project_id' => $this->project->id,
            'sales_id' => $this->salesAgent->id,
            'name' => 'Bpk. Anton Prasetyo',
            'whatsapp' => '081399001122',
            'source' => 'Website Casanuma',
            'status' => 'new',
            'created_at' => Carbon::now()->subDays(10),
            'last_interaction_at' => Carbon::now()->subDays(2),
        ]);

        $slaService = new LeadSlaService();
        $result = $slaService->revokeInactiveLeads(7);

        $this->assertEquals(0, $result['count']);

        $lead->refresh();
        $this->assertEquals($this->salesAgent->id, $lead->sales_id);
    }

    public function test_non_new_stage_leads_are_not_revoked(): void
    {
        // Lead in 'survey_visit' stage created 14 days ago without recent follow-up
        $lead = Lead::create([
            'developer_id' => $this->developer->id,
            'housing_project_id' => $this->project->id,
            'sales_id' => $this->salesAgent->id,
            'name' => 'Bpk. Fajar Ramadhan',
            'whatsapp' => '081355667788',
            'source' => 'Walk-in / Pameran Mall',
            'status' => 'survey_visit',
            'created_at' => Carbon::now()->subDays(14),
        ]);

        $slaService = new LeadSlaService();
        $result = $slaService->revokeInactiveLeads(7);

        $this->assertEquals(0, $result['count']);

        $lead->refresh();
        $this->assertEquals($this->salesAgent->id, $lead->sales_id);
    }

    public function test_artisan_revoke_inactive_leads_command(): void
    {
        $lead1 = Lead::create([
            'developer_id' => $this->developer->id,
            'housing_project_id' => $this->project->id,
            'sales_id' => $this->salesAgent->id,
            'name' => 'Bpk. Inaktif Satu',
            'whatsapp' => '081122334455',
            'source' => 'Iklan Meta (Facebook/IG)',
            'status' => 'new',
        ]);
        Lead::where('id', $lead1->id)->update(['created_at' => Carbon::now()->subDays(8)]);

        $this->artisan('leads:revoke-inactive --days=7')
            ->expectsOutputToContain('Berhasil mencabut penugasan 1 prospek')
            ->assertSuccessful();

        $lead = Lead::where('whatsapp', '081122334455')->first();
        $this->assertNull($lead->sales_id);
    }

    public function test_manager_can_trigger_check_sla_endpoint(): void
    {
        $lead2 = Lead::create([
            'developer_id' => $this->developer->id,
            'housing_project_id' => $this->project->id,
            'sales_id' => $this->salesAgent->id,
            'name' => 'Bpk. Inaktif Dua',
            'whatsapp' => '081199887766',
            'source' => 'Iklan Meta (Facebook/IG)',
            'status' => 'new',
        ]);
        Lead::where('id', $lead2->id)->update(['created_at' => Carbon::now()->subDays(12)]);

        $response = $this->actingAs($this->salesManager)->post(route('leads.check-sla'));

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $lead = Lead::where('whatsapp', '081199887766')->first();
        $this->assertNull($lead->sales_id);
    }

    public function test_sales_agent_cannot_trigger_check_sla_endpoint(): void
    {
        $response = $this->actingAs($this->salesAgent)->post(route('leads.check-sla'));
        $response->assertForbidden();
    }

    public function test_filter_leads_by_temperature(): void
    {
        Lead::create([
            'developer_id' => $this->developer->id,
            'housing_project_id' => $this->project->id,
            'sales_id' => $this->salesAgent->id,
            'name' => 'Lead Panas',
            'whatsapp' => '081111111111',
            'source' => 'Iklan Meta (Facebook/IG)',
            'lead_temperature' => 'hot',
            'status' => 'new',
        ]);

        Lead::create([
            'developer_id' => $this->developer->id,
            'housing_project_id' => $this->project->id,
            'sales_id' => $this->salesAgent->id,
            'name' => 'Lead Hangat',
            'whatsapp' => '082222222222',
            'source' => 'Iklan Meta (Facebook/IG)',
            'lead_temperature' => 'warm',
            'status' => 'new',
        ]);

        $response = $this->actingAs($this->superAdmin)->get(route('leads.index', ['temperature' => 'hot']));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Leads/Index')
            ->has('leads.data', 1)
            ->where('leads.data.0.name', 'Lead Panas')
        );
    }

    public function test_search_matches_source_detail(): void
    {
        Lead::create([
            'developer_id' => $this->developer->id,
            'housing_project_id' => $this->project->id,
            'sales_id' => $this->salesAgent->id,
            'name' => 'Bpk. Budi Santoso',
            'whatsapp' => '083333333333',
            'source' => 'Pameran / Event',
            'source_detail' => 'Pameran Mall BEC Bandung 2026',
            'status' => 'new',
        ]);

        $response = $this->actingAs($this->superAdmin)->get(route('leads.index', ['search' => 'BEC Bandung']));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Leads/Index')
            ->has('leads.data', 1)
            ->where('leads.data.0.name', 'Bpk. Budi Santoso')
        );
    }
}
