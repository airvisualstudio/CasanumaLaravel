<?php

namespace Tests\Feature;

use App\Models\Developer;
use App\Models\HousingProject;
use App\Models\Lead;
use App\Models\LeadInteraction;
use App\Models\User;
use Carbon\Carbon;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LeadFollowUpTest extends TestCase
{
    use RefreshDatabase;

    protected User $superAdmin;

    protected User $salesManager;

    protected User $salesAgent1;

    protected User $salesAgent2;

    protected HousingProject $project;

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

        $this->salesAgent1 = User::factory()->create(['name' => 'Agent One']);
        $this->salesAgent1->assignRole('sales_agent');

        $this->salesAgent2 = User::factory()->create(['name' => 'Agent Two']);
        $this->salesAgent2->assignRole('sales_agent');
    }

    public function test_sales_agent_only_sees_own_leads_in_pipeline_kanban(): void
    {
        $lead1 = Lead::create([
            'housing_project_id' => $this->project->id,
            'sales_id' => $this->salesAgent1->id,
            'name' => 'Konsumen Agent 1',
            'whatsapp' => '081200000001',
            'source' => 'Walk-in',
            'status' => 'new',
        ]);

        $lead2 = Lead::create([
            'housing_project_id' => $this->project->id,
            'sales_id' => $this->salesAgent2->id,
            'name' => 'Konsumen Agent 2',
            'whatsapp' => '081200000002',
            'source' => 'Meta Ads',
            'status' => 'contacted',
        ]);

        $response = $this->actingAs($this->salesAgent1)
            ->get(route('leads.pipeline'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Leads/Pipeline')
            ->has('leads', 1)
            ->where('leads.0.id', $lead1->id)
            ->where('leads.0.name', 'Konsumen Agent 1')
        );
    }

    public function test_sales_manager_sees_all_leads_in_pipeline_kanban(): void
    {
        Lead::create([
            'housing_project_id' => $this->project->id,
            'sales_id' => $this->salesAgent1->id,
            'name' => 'Konsumen Agent 1',
            'whatsapp' => '081200000001',
            'source' => 'Walk-in',
            'status' => 'new',
        ]);

        Lead::create([
            'housing_project_id' => $this->project->id,
            'sales_id' => $this->salesAgent2->id,
            'name' => 'Konsumen Agent 2',
            'whatsapp' => '081200000002',
            'source' => 'Meta Ads',
            'status' => 'contacted',
        ]);

        $response = $this->actingAs($this->salesManager)
            ->get(route('leads.pipeline'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Leads/Pipeline')
            ->has('leads', 2)
        );
    }

    public function test_updating_lead_stage_via_patch(): void
    {
        $lead = Lead::create([
            'housing_project_id' => $this->project->id,
            'sales_id' => $this->salesAgent1->id,
            'name' => 'Bpk. Ahmad Fauzi',
            'whatsapp' => '081234567890',
            'source' => 'Website',
            'status' => 'new',
        ]);

        $response = $this->actingAs($this->salesAgent1)
            ->json('PATCH', route('leads.update-status', $lead->id), [
                'status' => 'survey_visit',
            ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
            ]);

        $this->assertDatabaseHas('leads', [
            'id' => $lead->id,
            'status' => 'survey_visit',
        ]);

        // Verify interaction history was automatically recorded
        $this->assertDatabaseHas('lead_interactions', [
            'lead_id' => $lead->id,
            'user_id' => $this->salesAgent1->id,
            'channel' => 'other',
            'stage_at_interaction' => 'survey_visit',
        ]);

        $interaction = LeadInteraction::where('lead_id', $lead->id)->latest()->first();
        $this->assertStringContainsString('Status diubah dari New Lead ke Survey Visit oleh Sales Agent One', $interaction->notes);
    }

    public function test_moving_to_lost_requires_reason_and_records_interaction(): void
    {
        $lead = Lead::create([
            'housing_project_id' => $this->project->id,
            'sales_id' => $this->salesAgent1->id,
            'name' => 'Konsumen Batal Test',
            'whatsapp' => '081299998888',
            'source' => 'Website',
            'status' => 'contacted',
        ]);

        // Attempt without reason -> 422
        $responseNoReason = $this->actingAs($this->salesAgent1)
            ->json('PATCH', route('leads.update-status', $lead->id), [
                'status' => 'lost',
            ]);

        $responseNoReason->assertStatus(422)
            ->assertJsonValidationErrors(['reason']);

        // Submit WITH reason -> 200 OK
        $reason = 'BI Checking / SLIK OJK Ditolak Bank: Kol 5 pinjaman';
        $responseWithReason = $this->actingAs($this->salesAgent1)
            ->json('PATCH', route('leads.update-status', $lead->id), [
                'status' => 'lost',
                'reason' => $reason,
            ]);

        $responseWithReason->assertOk()
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('leads', [
            'id' => $lead->id,
            'status' => 'lost',
        ]);

        $interaction = LeadInteraction::where('lead_id', $lead->id)->latest()->first();
        $this->assertStringContainsString('Status diubah dari Contacted ke Lost / Batal', $interaction->notes);
        $this->assertStringContainsString($reason, $interaction->notes);
    }

    public function test_sales_agent_cannot_update_stage_of_another_agents_lead(): void
    {
        $lead = Lead::create([
            'housing_project_id' => $this->project->id,
            'sales_id' => $this->salesAgent2->id,
            'name' => 'Lead Milik Agent 2',
            'whatsapp' => '081234567890',
            'source' => 'Website',
            'status' => 'new',
        ]);

        $response = $this->actingAs($this->salesAgent1)
            ->json('PATCH', route('leads.update-status', $lead->id), [
                'status' => 'contacted',
            ]);

        $response->assertForbidden();
    }

    public function test_logging_follow_up_interaction_and_scheduling_reminder(): void
    {
        $lead = Lead::create([
            'housing_project_id' => $this->project->id,
            'sales_id' => $this->salesAgent1->id,
            'name' => 'Ibu Siti Aminah',
            'whatsapp' => '081298765432',
            'source' => 'Instagram Ads',
            'status' => 'new',
        ]);

        $interactionDate = Carbon::now()->format('Y-m-d H:i:s');
        $nextFollowUp = Carbon::now()->addDays(2)->format('Y-m-d H:i:s');

        $response = $this->actingAs($this->salesAgent1)
            ->json('POST', route('leads.interactions.store', $lead->id), [
                'channel' => 'whatsapp',
                'notes' => 'Konsumen merespon ramah via WA. Berminat pada tipe 60/100, meminta pricelist dan simulasi KPR Bank BSI.',
                'interaction_date' => $interactionDate,
                'update_stage' => 'contacted',
                'next_follow_up_date' => $nextFollowUp,
                'next_follow_up_note' => 'Kirim brosur fisik dan konfirmasi kesiapan survey Sabtu pagi.',
            ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
            ]);

        $this->assertDatabaseHas('lead_interactions', [
            'lead_id' => $lead->id,
            'user_id' => $this->salesAgent1->id,
            'channel' => 'whatsapp',
            'stage_at_interaction' => 'contacted',
            'next_follow_up_note' => 'Kirim brosur fisik dan konfirmasi kesiapan survey Sabtu pagi.',
        ]);

        $this->assertDatabaseHas('leads', [
            'id' => $lead->id,
            'status' => 'contacted',
        ]);

        $refreshed = $lead->fresh();
        $this->assertNotNull($refreshed->next_follow_up_date);
        $this->assertNotNull($refreshed->last_interaction_at);
    }

    public function test_fetching_lead_interaction_history(): void
    {
        $lead = Lead::create([
            'housing_project_id' => $this->project->id,
            'sales_id' => $this->salesAgent1->id,
            'name' => 'Pak Rudi Hartono',
            'whatsapp' => '081211112222',
            'source' => 'Walk-in',
            'status' => 'contacted',
        ]);

        LeadInteraction::create([
            'lead_id' => $lead->id,
            'user_id' => $this->salesAgent1->id,
            'channel' => 'phone',
            'stage_at_interaction' => 'contacted',
            'notes' => 'Telepon pertama untuk kualifikasi profil',
            'interaction_date' => Carbon::now()->subDay(),
        ]);

        $response = $this->actingAs($this->salesAgent1)
            ->json('GET', route('leads.interactions.index', $lead->id));

        $response->assertOk()
            ->assertJsonCount(1, 'interactions')
            ->assertJsonPath('interactions.0.channel', 'phone');
    }
}
