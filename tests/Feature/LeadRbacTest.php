<?php

namespace Tests\Feature;

use App\Models\Developer;
use App\Models\HousingProject;
use App\Models\Lead;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LeadRbacTest extends TestCase
{
    use RefreshDatabase;

    protected User $superAdmin;

    protected User $salesManager;

    protected User $agent1;

    protected User $agent2;

    protected HousingProject $project;

    protected Lead $leadAgent1;

    protected Lead $leadAgent2;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);

        $this->superAdmin = User::factory()->create();
        $this->superAdmin->assignRole('superadmin');

        $this->salesManager = User::factory()->create();
        $this->salesManager->assignRole('sales_manager');

        $this->agent1 = User::factory()->create();
        $this->agent1->assignRole('sales_agent');

        $this->agent2 = User::factory()->create();
        $this->agent2->assignRole('sales_agent');

        $developer = Developer::create([
            'name' => 'PT Graha Megah',
            'is_active' => true,
        ]);

        $this->project = HousingProject::create([
            'developer_id' => $developer->id,
            'name' => 'Casanuma Grand Village',
            'city' => 'Bandung',
            'status' => 'active',
        ]);

        $this->leadAgent1 = Lead::create([
            'developer_id' => $developer->id,
            'housing_project_id' => $this->project->id,
            'sales_id' => $this->agent1->id,
            'name' => 'Konsumen Prospek Agent 1',
            'whatsapp' => '081100000001',
            'source' => 'Website',
            'status' => 'new',
        ]);

        $this->leadAgent2 = Lead::create([
            'developer_id' => $developer->id,
            'housing_project_id' => $this->project->id,
            'sales_id' => $this->agent2->id,
            'name' => 'Konsumen Prospek Agent 2',
            'whatsapp' => '081100000002',
            'source' => 'Iklan Meta (Facebook/IG)',
            'status' => 'contacted',
        ]);
    }

    public function test_superadmin_can_view_all_leads_across_sales_agents(): void
    {
        $response = $this->actingAs($this->superAdmin)->get(route('leads.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Leads/Index')
            ->has('leads.data', 2)
            ->where('isAgentOnly', false)
        );
    }

    public function test_sales_manager_can_view_all_leads_across_sales_agents(): void
    {
        $response = $this->actingAs($this->salesManager)->get(route('leads.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Leads/Index')
            ->has('leads.data', 2)
            ->where('isAgentOnly', false)
        );
    }

    public function test_sales_agent_only_sees_their_own_leads_in_query_scope(): void
    {
        $response = $this->actingAs($this->agent1)->get(route('leads.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Leads/Index')
            ->has('leads.data', 1)
            ->where('leads.data.0.id', $this->leadAgent1->id)
            ->where('isAgentOnly', true)
        );
    }

    public function test_sales_agent_can_update_own_lead(): void
    {
        $response = $this->actingAs($this->agent1)->put(route('leads.update', $this->leadAgent1->id), [
            'housing_project_id' => $this->project->id,
            'name' => 'Konsumen Agent 1 Updated',
            'whatsapp' => '081100000001',
            'source' => 'Website',
            'status' => 'survey_visit',
        ]);

        $response->assertRedirect();

        $this->leadAgent1->refresh();
        $this->assertEquals('Konsumen Agent 1 Updated', $this->leadAgent1->name);
        $this->assertEquals('survey_visit', $this->leadAgent1->status);
    }

    public function test_sales_agent_cannot_update_another_agents_lead(): void
    {
        $response = $this->actingAs($this->agent1)->put(route('leads.update', $this->leadAgent2->id), [
            'housing_project_id' => $this->project->id,
            'name' => 'Hacked Agent 2 Lead',
            'whatsapp' => '081100000002',
            'source' => 'Website',
            'status' => 'rejected',
        ]);

        $response->assertForbidden();

        $this->leadAgent2->refresh();
        $this->assertNotEquals('Hacked Agent 2 Lead', $this->leadAgent2->name);
    }

    public function test_sales_agent_cannot_update_status_of_another_agents_lead(): void
    {
        $response = $this->actingAs($this->agent1)->patch(route('leads.update-status', $this->leadAgent2->id), [
            'status' => 'rejected',
        ]);

        $response->assertForbidden();

        $this->leadAgent2->refresh();
        $this->assertEquals('contacted', $this->leadAgent2->status);
    }

    public function test_sales_agent_cannot_delete_any_lead(): void
    {
        // Agent 1 tries to delete own lead -> Forbidden (agents have no delete permission)
        $response1 = $this->actingAs($this->agent1)->delete(route('leads.destroy', $this->leadAgent1->id));
        $response1->assertForbidden();

        // Agent 1 tries to delete agent 2 lead -> Forbidden
        $response2 = $this->actingAs($this->agent1)->delete(route('leads.destroy', $this->leadAgent2->id));
        $response2->assertForbidden();

        $this->assertDatabaseHas('leads', ['id' => $this->leadAgent1->id]);
        $this->assertDatabaseHas('leads', ['id' => $this->leadAgent2->id]);
    }

    public function test_sales_manager_can_update_and_delete_any_lead(): void
    {
        // Update agent 1 lead
        $responseUpdate = $this->actingAs($this->salesManager)->put(route('leads.update', $this->leadAgent1->id), [
            'housing_project_id' => $this->project->id,
            'name' => 'Supervised by Manager',
            'whatsapp' => '081100000001',
            'source' => 'Website',
            'status' => 'booking',
        ]);
        $responseUpdate->assertRedirect();
        $this->leadAgent1->refresh();
        $this->assertEquals('Supervised by Manager', $this->leadAgent1->name);

        // Delete agent 2 lead
        $responseDelete = $this->actingAs($this->salesManager)->delete(route('leads.destroy', $this->leadAgent2->id));
        $responseDelete->assertRedirect();
        $this->assertSoftDeleted('leads', ['id' => $this->leadAgent2->id]);
    }

    public function test_sales_agent_creating_lead_forces_own_sales_id(): void
    {
        // Agent 1 submits a lead trying to assign it to Agent 2
        $response = $this->actingAs($this->agent1)->post(route('leads.store'), [
            'housing_project_id' => $this->project->id,
            'sales_id' => $this->agent2->id,
            'name' => 'Lead Baru By Agent 1',
            'whatsapp' => '081233445566',
            'source' => 'Website',
            'status' => 'new',
        ]);

        $response->assertRedirect();

        $lead = Lead::where('whatsapp', '081233445566')->first();
        $this->assertNotNull($lead);
        // Enforced to Agent 1's ID despite submitting Agent 2's ID
        $this->assertEquals($this->agent1->id, $lead->sales_id);
    }
}
