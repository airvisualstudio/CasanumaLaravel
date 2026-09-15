<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\Developer;
use App\Models\HousingProject;
use App\Models\Lead;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LeadProtectionAndReassignTest extends TestCase
{
    use RefreshDatabase;

    protected User $superAdmin;
    protected User $salesManager;
    protected User $salesAgent1;
    protected User $salesAgent2;
    protected HousingProject $projectA;
    protected HousingProject $projectB;
    protected Developer $developer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);

        $this->superAdmin = User::factory()->create(['name' => 'Superadmin Master']);
        $this->superAdmin->assignRole('superadmin');

        $this->salesManager = User::factory()->create(['name' => 'Budi Sales Manager']);
        $this->salesManager->assignRole('sales_manager');

        $this->salesAgent1 = User::factory()->create(['name' => 'Andi Agent Satu']);
        $this->salesAgent1->assignRole('sales_agent');

        $this->salesAgent2 = User::factory()->create(['name' => 'Citra Agent Dua']);
        $this->salesAgent2->assignRole('sales_agent');

        $this->developer = Developer::create([
            'name' => 'PT Casanuma Living Developer',
            'is_active' => true,
        ]);

        $this->projectA = HousingProject::create([
            'developer_id' => $this->developer->id,
            'name' => 'Casanuma Hills Emerald',
            'city' => 'Bandung',
            'area_size' => 15000,
            'area_unit' => 'm²',
            'status' => 'active',
        ]);

        $this->projectB = HousingProject::create([
            'developer_id' => $this->developer->id,
            'name' => 'Casanuma Valley Sapphire',
            'city' => 'Bandung Barat',
            'area_size' => 12000,
            'area_unit' => 'm²',
            'status' => 'active',
        ]);
    }

    public function test_sales_agent_auto_assigned_when_creating_lead(): void
    {
        $payload = [
            'housing_project_id' => $this->projectA->id,
            'developer_id' => $this->developer->id,
            'sales_id' => $this->salesAgent2->id, // Attempt to assign to Agent 2
            'name' => 'Bpk. Ahmad Fauzi',
            'whatsapp' => '081298765432',
            'source' => 'Iklan Meta (Facebook/IG)',
            'status' => 'new',
        ];

        $response = $this->actingAs($this->salesAgent1)->post(route('leads.store'), $payload);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('leads', [
            'name' => 'Bpk. Ahmad Fauzi',
            'housing_project_id' => $this->projectA->id,
            'sales_id' => $this->salesAgent1->id, // Must be forced to Agent 1 (auth user)
        ]);
    }

    public function test_manager_can_explicitly_assign_sales_when_creating_lead(): void
    {
        $payload = [
            'housing_project_id' => $this->projectA->id,
            'developer_id' => $this->developer->id,
            'sales_id' => $this->salesAgent2->id,
            'name' => 'Ibu Siti Aminah',
            'whatsapp' => '081211112222',
            'source' => 'Walk In / Lokasi',
            'status' => 'new',
        ];

        $response = $this->actingAs($this->salesManager)->post(route('leads.store'), $payload);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('leads', [
            'name' => 'Ibu Siti Aminah',
            'housing_project_id' => $this->projectA->id,
            'sales_id' => $this->salesAgent2->id,
        ]);
    }

    public function test_duplicate_whatsapp_in_same_project_is_rejected_with_sales_holder_info(): void
    {
        // Existing lead owned by salesAgent1
        Lead::create([
            'developer_id' => $this->developer->id,
            'housing_project_id' => $this->projectA->id,
            'sales_id' => $this->salesAgent1->id,
            'name' => 'Bpk. Hendra Gunawan',
            'whatsapp' => '081234567890',
            'source' => 'Iklan Meta (Facebook/IG)',
            'status' => 'contacted',
        ]);

        // Another agent tries to enter with normalized variant: +6281234567890
        $payload = [
            'housing_project_id' => $this->projectA->id,
            'developer_id' => $this->developer->id,
            'name' => 'Hendra G (Duplikat)',
            'whatsapp' => '+62 812-3456-7890',
            'source' => 'Referral Sales',
            'status' => 'new',
        ];

        $response = $this->actingAs($this->salesAgent2)->post(route('leads.store'), $payload);

        $response->assertSessionHasErrors(['whatsapp']);
        $errorMsg = session('errors')->first('whatsapp');
        $this->assertStringContainsString('sudah terdaftar pada proyek ini', $errorMsg);
        $this->assertStringContainsString('Andi Agent Satu', $errorMsg);
    }

    public function test_same_whatsapp_in_different_projects_is_allowed(): void
    {
        // Lead exists in Project A
        Lead::create([
            'developer_id' => $this->developer->id,
            'housing_project_id' => $this->projectA->id,
            'sales_id' => $this->salesAgent1->id,
            'name' => 'Bpk. Hendra Gunawan',
            'whatsapp' => '081234567890',
            'source' => 'Iklan Meta (Facebook/IG)',
            'status' => 'contacted',
        ]);

        // Agent 2 enters same WhatsApp in Project B -> should be allowed
        $payload = [
            'housing_project_id' => $this->projectB->id,
            'developer_id' => $this->developer->id,
            'name' => 'Bpk. Hendra Gunawan (Project B)',
            'whatsapp' => '081234567890',
            'source' => 'Walk In / Lokasi',
            'status' => 'new',
        ];

        $response = $this->actingAs($this->salesAgent2)->post(route('leads.store'), $payload);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('leads', [
            'name' => 'Bpk. Hendra Gunawan (Project B)',
            'housing_project_id' => $this->projectB->id,
            'whatsapp' => '081234567890',
        ]);
    }

    public function test_duplicate_nik_in_same_project_is_rejected(): void
    {
        Lead::create([
            'developer_id' => $this->developer->id,
            'housing_project_id' => $this->projectA->id,
            'sales_id' => $this->salesAgent1->id,
            'name' => 'Ibu Ratna Juwita',
            'nik' => '3201012345670001',
            'whatsapp' => '081299991111',
            'source' => 'Iklan Meta (Facebook/IG)',
            'status' => 'new',
        ]);

        $payload = [
            'housing_project_id' => $this->projectA->id,
            'developer_id' => $this->developer->id,
            'name' => 'Ratna J (KTP Sama)',
            'nik' => '3201012345670001',
            'whatsapp' => '081299992222', // Different WA, same NIK
            'source' => 'Iklan Google Search',
            'status' => 'new',
        ];

        $response = $this->actingAs($this->salesAgent2)->post(route('leads.store'), $payload);

        $response->assertSessionHasErrors(['nik']);
        $errorMsg = session('errors')->first('nik');
        $this->assertStringContainsString('sudah terdaftar pada proyek ini', $errorMsg);
        $this->assertStringContainsString('Ibu Ratna Juwita', $errorMsg);
    }

    public function test_sales_manager_and_superadmin_can_reassign_lead(): void
    {
        $lead = Lead::create([
            'developer_id' => $this->developer->id,
            'housing_project_id' => $this->projectA->id,
            'sales_id' => $this->salesAgent1->id,
            'name' => 'Bpk. Bambang Pamungkas',
            'whatsapp' => '081377889900',
            'source' => 'Walk In / Lokasi',
            'status' => 'survey_visit',
        ]);

        $response = $this->actingAs($this->salesManager)->patch(route('leads.reassign', $lead->id), [
            'sales_id' => $this->salesAgent2->id,
            'reason' => 'Rotasi leads bulanan tim marketing',
        ]);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $lead->refresh();
        $this->assertEquals($this->salesAgent2->id, $lead->sales_id);

        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $this->salesManager->id,
            'action' => 'lead_reassigned',
            'subject_type' => Lead::class,
            'subject_id' => $lead->id,
        ]);
    }

    public function test_sales_agent_cannot_reassign_lead(): void
    {
        $lead = Lead::create([
            'developer_id' => $this->developer->id,
            'housing_project_id' => $this->projectA->id,
            'sales_id' => $this->salesAgent1->id,
            'name' => 'Bpk. Bambang Pamungkas',
            'whatsapp' => '081377889900',
            'source' => 'Walk In / Lokasi',
            'status' => 'survey_visit',
        ]);

        $response = $this->actingAs($this->salesAgent1)->patch(route('leads.reassign', $lead->id), [
            'sales_id' => $this->salesAgent2->id,
        ]);

        $response->assertForbidden();

        $lead->refresh();
        $this->assertEquals($this->salesAgent1->id, $lead->sales_id);
    }

    public function test_sales_agent_cannot_modify_sales_id_via_update(): void
    {
        $lead = Lead::create([
            'developer_id' => $this->developer->id,
            'housing_project_id' => $this->projectA->id,
            'sales_id' => $this->salesAgent1->id,
            'name' => 'Bpk. Bambang Pamungkas',
            'whatsapp' => '081377889900',
            'source' => 'Walk In / Lokasi',
            'status' => 'survey_visit',
        ]);

        $response = $this->actingAs($this->salesAgent1)->put(route('leads.update', $lead->id), [
            'housing_project_id' => $this->projectA->id,
            'developer_id' => $this->developer->id,
            'sales_id' => $this->salesAgent2->id, // Attempt to tamper sales_id
            'name' => 'Bpk. Bambang Pamungkas Updated',
            'whatsapp' => '081377889900',
            'source' => 'Walk In / Lokasi',
            'status' => 'booking',
        ]);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $lead->refresh();
        $this->assertEquals('Bpk. Bambang Pamungkas Updated', $lead->name);
        $this->assertEquals($this->salesAgent1->id, $lead->sales_id); // sales_id must remain Agent 1
    }
}
