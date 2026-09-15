<?php

namespace Tests\Feature;

use App\Models\Developer;
use App\Models\HousingProject;
use App\Models\Lead;
use App\Models\LeadInteraction;
use App\Models\LeadInteractionNote;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LeadInteractionNoteTest extends TestCase
{
    use RefreshDatabase;

    protected User $superAdmin;
    protected User $salesManager;
    protected User $salesPIC;
    protected User $otherSalesAgent;
    protected User $finance;
    protected HousingProject $project;
    protected Developer $developer;
    protected Lead $lead;
    protected LeadInteraction $interaction;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);

        $this->superAdmin = User::factory()->create(['name' => 'Super Admin CRM']);
        $this->superAdmin->assignRole('superadmin');

        $this->salesManager = User::factory()->create(['name' => 'Budi Santoso Manager']);
        $this->salesManager->assignRole('sales_manager');

        $this->salesPIC = User::factory()->create(['name' => 'Andi Sales PIC']);
        $this->salesPIC->assignRole('sales_agent');

        $this->otherSalesAgent = User::factory()->create(['name' => 'Doni Other Agent']);
        $this->otherSalesAgent->assignRole('sales_agent');

        $this->finance = User::factory()->create(['name' => 'Siti Finance Staff']);
        $this->finance->assignRole('finance');

        $this->developer = Developer::create([
            'name' => 'PT Casanuma Living Sejahtera',
            'is_active' => true,
        ]);

        $this->project = HousingProject::create([
            'developer_id' => $this->developer->id,
            'name' => 'Casanuma Highland Resort',
            'city' => 'Bandung Barat',
            'area_size' => 20000,
            'area_unit' => 'm²',
            'status' => 'active',
        ]);

        $this->lead = Lead::create([
            'housing_project_id' => $this->project->id,
            'developer_id' => $this->developer->id,
            'sales_id' => $this->salesPIC->id,
            'name' => 'Bpk. Hendra Gunawan',
            'whatsapp' => '081234567890',
            'email' => 'hendra@gmail.com',
            'slik_status' => 'clear',
            'source' => 'Iklan Meta (Facebook/IG)',
            'status' => 'survey_visit',
        ]);

        $this->interaction = LeadInteraction::create([
            'lead_id' => $this->lead->id,
            'user_id' => $this->salesPIC->id,
            'channel' => 'meeting',
            'stage_at_interaction' => 'survey_visit',
            'notes' => 'Konsumen telah survey lokasi, tertarik kavling Blok A2 tapi masih membandingkan harga.',
            'interaction_date' => now(),
        ]);
    }

    public function test_superadmin_can_add_internal_note_to_any_lead_interaction(): void
    {
        $response = $this->actingAs($this->superAdmin)->postJson(
            route('leads.interactions.notes.store', [$this->lead->id, $this->interaction->id]),
            ['content' => 'Coba tawarkan diskon DP 5% dan gratis biaya BPHTB untuk booking minggu ini.']
        );

        $response->assertStatus(201);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('note.content', 'Coba tawarkan diskon DP 5% dan gratis biaya BPHTB untuk booking minggu ini.');
        $response->assertJsonPath('note.author_role_badge', 'Superadmin');

        $this->assertDatabaseHas('lead_interaction_notes', [
            'lead_interaction_id' => $this->interaction->id,
            'user_id' => $this->superAdmin->id,
            'content' => 'Coba tawarkan diskon DP 5% dan gratis biaya BPHTB untuk booking minggu ini.',
        ]);

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'lead_interaction_internal_note',
            'subject_id' => $this->lead->id,
        ]);
    }

    public function test_sales_manager_can_add_internal_note_and_view_thread(): void
    {
        $response = $this->actingAs($this->salesManager)->postJson(
            route('leads.interactions.notes.store', [$this->lead->id, $this->interaction->id]),
            ['content' => 'Segera minta mutasi rekening 3 bulan terakhir untuk pre-screening bank.']
        );

        $response->assertStatus(201);
        $response->assertJsonPath('note.author_role_badge', 'Sales Manager');

        // Check timeline interactions endpoint includes internal_notes
        $listResponse = $this->actingAs($this->salesManager)->getJson(
            route('leads.interactions.index', $this->lead->id)
        );

        $listResponse->assertStatus(200);
        $listResponse->assertJsonPath('can_manage_notes', true);
        $this->assertCount(1, $listResponse->json('interactions.0.internal_notes'));
        $this->assertEquals(
            'Segera minta mutasi rekening 3 bulan terakhir untuk pre-screening bank.',
            $listResponse->json('interactions.0.internal_notes.0.content')
        );
    }

    public function test_sales_in_charge_can_view_and_reply_to_internal_notes(): void
    {
        // First, manager leaves a directive
        LeadInteractionNote::create([
            'lead_interaction_id' => $this->interaction->id,
            'user_id' => $this->salesManager->id,
            'content' => 'Tanyakan apakah bisa join income dengan istri.',
        ]);

        // Sales PIC views thread
        $listResponse = $this->actingAs($this->salesPIC)->getJson(
            route('leads.interactions.index', $this->lead->id)
        );

        $listResponse->assertStatus(200);
        $listResponse->assertJsonPath('can_manage_notes', true);
        $this->assertCount(1, $listResponse->json('interactions.0.internal_notes'));

        // Sales PIC replies to the directive
        $replyResponse = $this->actingAs($this->salesPIC)->postJson(
            route('leads.interactions.notes.store', [$this->lead->id, $this->interaction->id]),
            ['content' => 'Siap Pak, konsumen bersedia join income. Berkas istri sedang disiapkan.']
        );

        $replyResponse->assertStatus(201);
        $replyResponse->assertJsonPath('note.author_role_badge', 'Sales PIC');

        $this->assertDatabaseCount('lead_interaction_notes', 2);
    }

    public function test_unauthorized_sales_agent_cannot_add_internal_notes(): void
    {
        // otherSalesAgent is NOT the sales PIC of this lead
        $response = $this->actingAs($this->otherSalesAgent)->postJson(
            route('leads.interactions.notes.store', [$this->lead->id, $this->interaction->id]),
            ['content' => 'Mencoba nimbrung komen tanpa hak akses.']
        );

        $response->assertStatus(403);
    }

    public function test_finance_role_cannot_add_or_view_internal_notes(): void
    {
        // Manager left a confidential sales directive
        LeadInteractionNote::create([
            'lead_interaction_id' => $this->interaction->id,
            'user_id' => $this->salesManager->id,
            'content' => 'Diskon khusus manager approval 10 juta.',
        ]);

        // Finance cannot add note
        $response = $this->actingAs($this->finance)->postJson(
            route('leads.interactions.notes.store', [$this->lead->id, $this->interaction->id]),
            ['content' => 'Komentar dari finance.']
        );
        $response->assertStatus(403);

        // Finance viewing interactions is forbidden by middleware can:view-leads
        $listResponse = $this->actingAs($this->finance)->getJson(
            route('leads.interactions.index', $this->lead->id)
        );

        $listResponse->assertStatus(403);
    }

    public function test_validates_note_content_cannot_be_empty(): void
    {
        $response = $this->actingAs($this->superAdmin)->postJson(
            route('leads.interactions.notes.store', [$this->lead->id, $this->interaction->id]),
            ['content' => '   ']
        );

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['content']);
    }
}
