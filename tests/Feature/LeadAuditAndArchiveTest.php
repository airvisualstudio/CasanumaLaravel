<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\Developer;
use App\Models\HousingProject;
use App\Models\Lead;
use App\Models\LeadInteraction;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LeadAuditAndArchiveTest extends TestCase
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

    /**
     * Test 1: Updating sensitive fields (e.g. WhatsApp, Status, Sales PIC, NIK, Name) records an Audit Log.
     */
    public function test_sensitive_data_change_triggers_activity_log_and_interaction_audit(): void
    {
        $lead = Lead::create([
            'housing_project_id' => $this->project->id,
            'developer_id' => $this->developer->id,
            'sales_id' => $this->salesAgent->id,
            'name' => 'Budi Santoso',
            'whatsapp' => '081234567890',
            'source' => 'Iklan Meta (Facebook/IG)',
            'status' => 'contacted',
            'lead_temperature' => 'warm',
            'slik_status' => 'clear',
        ]);

        // Manager updates sensitive field (WhatsApp number)
        $response = $this->actingAs($this->salesManager)
            ->put(route('leads.update', $lead->id), [
                'housing_project_id' => $this->project->id,
                'sales_id' => $this->salesAgent->id,
                'name' => 'Budi Santoso',
                'whatsapp' => '081999888777', // CHANGED SENSITIVE FIELD
                'source' => 'Iklan Meta (Facebook/IG)',
                'status' => 'contacted',
                'lead_temperature' => 'warm',
                'slik_status' => 'clear',
            ]);

        $response->assertRedirect();
        $lead->refresh();

        $this->assertEquals('081999888777', $lead->whatsapp);

        // Assert ActivityLog recorded
        $this->assertDatabaseHas('activity_logs', [
            'subject_type' => Lead::class,
            'subject_id' => $lead->id,
            'action' => 'lead_sensitive_updated',
        ]);

        // Assert LeadInteraction audit note created
        $latestInteraction = LeadInteraction::where('lead_id', $lead->id)->latest('id')->first();
        $this->assertNotNull($latestInteraction);
        $this->assertStringContainsString('🛡️ Audit Log', $latestInteraction->notes);
        $this->assertStringContainsString('081234567890', $latestInteraction->notes);
        $this->assertStringContainsString('081999888777', $latestInteraction->notes);
    }

    /**
     * Test 2: Status change creates an audit log interaction note.
     */
    public function test_status_change_triggers_audit_interaction_note(): void
    {
        $lead = Lead::create([
            'housing_project_id' => $this->project->id,
            'developer_id' => $this->developer->id,
            'sales_id' => $this->salesAgent->id,
            'name' => 'Siti Nurhaliza',
            'whatsapp' => '085566778899',
            'source' => 'Website Casanuma',
            'status' => 'new',
        ]);

        $response = $this->actingAs($this->salesAgent)
            ->patch(route('leads.update-status', $lead->id), [
                'status' => 'contacted',
            ]);

        $response->assertRedirect();

        $latestInteraction = LeadInteraction::where('lead_id', $lead->id)->latest('id')->first();
        $this->assertNotNull($latestInteraction);
        $this->assertStringContainsString('🛡️ Audit Log: Status diubah', $latestInteraction->notes);
    }

    /**
     * Test 3: Can archive lead with reason into Archive / Blacklist Pool.
     */
    public function test_can_archive_lead_to_archive_pool_with_reason(): void
    {
        $lead = Lead::create([
            'housing_project_id' => $this->project->id,
            'developer_id' => $this->developer->id,
            'sales_id' => $this->salesAgent->id,
            'name' => 'Ahmad Dani',
            'whatsapp' => '087788990011',
            'source' => 'Walk-in / Pameran Mall',
            'status' => 'contacted',
            'is_archived' => false,
        ]);

        $response = $this->actingAs($this->salesAgent)
            ->post(route('leads.archive', $lead->id), [
                'reason' => 'Nomor Tidak Aktif / Salah Sambung',
            ]);

        $response->assertRedirect();
        $lead->refresh();

        $this->assertTrue($lead->is_archived);
        $this->assertNotNull($lead->archived_at);
        $this->assertEquals('Nomor Tidak Aktif / Salah Sambung', $lead->archive_reason);

        // ActivityLog assertion
        $this->assertDatabaseHas('activity_logs', [
            'subject_id' => $lead->id,
            'action' => 'lead_archived',
        ]);

        // LeadInteraction timeline note assertion
        $latestInteraction = LeadInteraction::where('lead_id', $lead->id)->latest('id')->first();
        $this->assertNotNull($latestInteraction);
        $this->assertStringContainsString('Archive/Blacklist Pool', $latestInteraction->notes);
        $this->assertStringContainsString('Nomor Tidak Aktif', $latestInteraction->notes);
    }

    /**
     * Test 4: Workspace segregation between Active Workspace and Archive & Blacklist Pool.
     */
    public function test_workspace_segregation_between_active_and_archived_pool(): void
    {
        // 1 Active lead
        $activeLead = Lead::create([
            'housing_project_id' => $this->project->id,
            'developer_id' => $this->developer->id,
            'sales_id' => $this->salesManager->id,
            'name' => 'Active Consumer',
            'whatsapp' => '0811111111',
            'source' => 'Website',
            'status' => 'contacted',
            'is_archived' => false,
        ]);

        // 1 Explicitly archived lead
        $archivedLead = Lead::create([
            'housing_project_id' => $this->project->id,
            'developer_id' => $this->developer->id,
            'sales_id' => $this->salesManager->id,
            'name' => 'Archived Consumer',
            'whatsapp' => '0822222222',
            'source' => 'Website',
            'status' => 'contacted',
            'is_archived' => true,
            'archive_reason' => 'Batal',
            'archived_at' => now(),
        ]);

        // 1 Dead lead (status lost)
        $lostLead = Lead::create([
            'housing_project_id' => $this->project->id,
            'developer_id' => $this->developer->id,
            'sales_id' => $this->salesManager->id,
            'name' => 'Lost Consumer',
            'whatsapp' => '0833333333',
            'source' => 'Website',
            'status' => 'lost',
            'is_archived' => false,
        ]);

        // Query Active Workspace
        $responseActive = $this->actingAs($this->salesManager)
            ->get(route('leads.index', ['pool' => 'active']));

        $responseActive->assertOk();
        $responseActive->assertInertia(fn ($page) => $page
            ->component('Leads/Index')
            ->has('leads.data', 1)
            ->where('leads.data.0.id', $activeLead->id)
            ->where('poolStats.active', 1)
            ->where('poolStats.archived', 2)
        );

        // Query Archive & Blacklist Pool
        $responseArchived = $this->actingAs($this->salesManager)
            ->get(route('leads.index', ['pool' => 'archived']));

        $responseArchived->assertOk();
        $responseArchived->assertInertia(fn ($page) => $page
            ->component('Leads/Index')
            ->has('leads.data', 2)
            ->where('poolStats.active', 1)
            ->where('poolStats.archived', 2)
        );
    }

    /**
     * Test 5: Can restore lead from Archive / Blacklist Pool back to Active Workspace.
     */
    public function test_can_restore_lead_from_archive_pool_back_to_active(): void
    {
        $lead = Lead::create([
            'housing_project_id' => $this->project->id,
            'developer_id' => $this->developer->id,
            'sales_id' => $this->salesAgent->id,
            'name' => 'Rina Wijaya',
            'whatsapp' => '0899998888',
            'source' => 'Website',
            'status' => 'lost',
            'is_archived' => true,
            'archive_reason' => 'Tidak respon',
            'archived_at' => now(),
        ]);

        $response = $this->actingAs($this->salesAgent)
            ->post(route('leads.restore', $lead->id));

        $response->assertRedirect();
        $lead->refresh();

        $this->assertFalse($lead->is_archived);
        $this->assertNull($lead->archived_at);
        $this->assertNull($lead->archive_reason);
        $this->assertEquals('contacted', $lead->status); // Reset from lost to contacted

        // Assert ActivityLog recorded
        $this->assertDatabaseHas('activity_logs', [
            'subject_id' => $lead->id,
            'action' => 'lead_restored',
        ]);

        // Lead now appears in Active scope
        $this->assertTrue(Lead::active()->where('id', $lead->id)->exists());
    }
}
