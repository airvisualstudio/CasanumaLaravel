<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\Booking;
use App\Models\HousingProject;
use App\Models\Lead;
use App\Models\PropertyUnit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserSecurityAndLeadHandoverTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_inactive_user_cannot_login(): void
    {
        $sales = User::where('email', 'sales@casanuma.com')->first();
        $sales->update(['is_active' => false]);

        $response = $this->post('/login', [
            'email' => 'sales@casanuma.com',
            'password' => 'password',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();

        $errors = session('errors')->get('email');
        $this->assertStringContainsString('dinonaktifkan', $errors[0]);
    }

    public function test_active_user_can_login(): void
    {
        $sales = User::where('email', 'sales@casanuma.com')->first();
        $this->assertTrue($sales->is_active);

        $response = $this->post('/login', [
            'email' => 'sales@casanuma.com',
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($sales);
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_user_with_leads_cannot_be_deleted(): void
    {
        $admin = User::where('email', 'admin@casanuma.com')->first();
        $sales = User::where('email', 'sales@casanuma.com')->first();
        $project = HousingProject::first();

        // Assign a lead to the sales agent
        Lead::create([
            'name' => 'Budi Santoso',
            'whatsapp' => '081234567890',
            'housing_project_id' => $project->id,
            'sales_id' => $sales->id,
            'source' => 'Website',
            'status' => 'new',
        ]);

        $response = $this->actingAs($admin)->delete("/users/{$sales->id}");

        $response->assertSessionHasErrors('error');
        $this->assertDatabaseHas('users', ['id' => $sales->id]);
    }

    public function test_user_with_bookings_cannot_be_deleted(): void
    {
        $admin = User::where('email', 'admin@casanuma.com')->first();
        $sales = User::where('email', 'sales@casanuma.com')->first();
        $project = HousingProject::first();
        $unit = PropertyUnit::first();

        $lead = Lead::create([
            'name' => 'Citra Lestari',
            'whatsapp' => '081298765432',
            'housing_project_id' => $project->id,
            'sales_id' => null,
            'source' => 'Meta Ads',
            'status' => 'booking',
        ]);

        Booking::create([
            'booking_code' => 'BK-TEST-001',
            'lead_id' => $lead->id,
            'property_unit_id' => $unit->id,
            'sales_id' => $sales->id,
            'booking_fee' => 5000000,
            'status' => 'confirmed',
            'payment_status' => 'verified',
            'booking_date' => now(),
        ]);

        $response = $this->actingAs($admin)->delete("/users/{$sales->id}");

        $response->assertSessionHasErrors('error');
        $this->assertDatabaseHas('users', ['id' => $sales->id]);
    }

    public function test_superadmin_can_deactivate_and_handover_leads_to_another_sales(): void
    {
        $admin = User::where('email', 'admin@casanuma.com')->first();
        $departingSales = User::where('email', 'sales@casanuma.com')->first();
        $project = HousingProject::first();

        // Create replacement active sales agent
        $newSales = User::create([
            'name' => 'Sales Pengganti',
            'email' => 'pengganti@casanuma.com',
            'password' => bcrypt('password'),
            'is_active' => true,
        ]);
        $newSales->assignRole('sales_agent');

        // Create 2 leads assigned to departing sales
        $lead1 = Lead::create([
            'name' => 'Prospek Satu',
            'whatsapp' => '081111111111',
            'housing_project_id' => $project->id,
            'sales_id' => $departingSales->id,
            'source' => 'Website',
            'status' => 'new',
        ]);

        $lead2 = Lead::create([
            'name' => 'Prospek Dua',
            'whatsapp' => '082222222222',
            'housing_project_id' => $project->id,
            'sales_id' => $departingSales->id,
            'source' => 'TikTok',
            'status' => 'contacted',
        ]);

        $response = $this->actingAs($admin)->post("/users/{$departingSales->id}/deactivate-and-handover", [
            'target_sales_id' => $newSales->id,
        ]);

        $response->assertSessionHas('success');

        // Check departing sales is deactivated
        $departingSales->refresh();
        $this->assertFalse($departingSales->is_active);

        // Check leads reassigned
        $lead1->refresh();
        $lead2->refresh();
        $this->assertEquals($newSales->id, $lead1->sales_id);
        $this->assertEquals($newSales->id, $lead2->sales_id);

        // Check interaction timelines recorded
        $this->assertDatabaseHas('lead_interactions', [
            'lead_id' => $lead1->id,
            'channel' => 'system',
        ]);
        $this->assertDatabaseHas('lead_interactions', [
            'lead_id' => $lead2->id,
            'channel' => 'system',
        ]);

        // Check ActivityLog recorded
        $this->assertDatabaseHas('activity_logs', [
            'action' => 'lead_handover',
        ]);
    }

    public function test_deactivate_and_handover_fails_if_target_sales_is_inactive(): void
    {
        $admin = User::where('email', 'admin@casanuma.com')->first();
        $departingSales = User::where('email', 'sales@casanuma.com')->first();

        $inactiveSales = User::create([
            'name' => 'Sales Inaktif',
            'email' => 'inaktif@casanuma.com',
            'password' => bcrypt('password'),
            'is_active' => false,
        ]);
        $inactiveSales->assignRole('sales_agent');

        $response = $this->actingAs($admin)->post("/users/{$departingSales->id}/deactivate-and-handover", [
            'target_sales_id' => $inactiveSales->id,
        ]);

        $response->assertSessionHasErrors('target_sales_id');
        $departingSales->refresh();
        $this->assertTrue($departingSales->is_active);
    }

    public function test_export_leads_is_strictly_forbidden_for_sales_agent(): void
    {
        $sales = User::where('email', 'sales@casanuma.com')->first();

        $response = $this->actingAs($sales)->get('/leads/export');

        $response->assertForbidden();
    }

    public function test_export_leads_is_strictly_forbidden_for_sales_manager(): void
    {
        $manager = User::where('email', 'manager@casanuma.com')->first();

        $response = $this->actingAs($manager)->get('/leads/export');

        $response->assertForbidden();
    }

    public function test_export_leads_is_strictly_forbidden_for_finance(): void
    {
        $finance = User::where('email', 'finance@casanuma.com')->first();

        $response = $this->actingAs($finance)->get('/leads/export');

        $response->assertForbidden();
    }

    public function test_superadmin_can_export_leads_and_it_records_audit_log(): void
    {
        $admin = User::where('email', 'admin@casanuma.com')->first();
        $project = HousingProject::first();

        Lead::create([
            'name' => 'Konsumen Export Test',
            'whatsapp' => '081999888777',
            'housing_project_id' => $project->id,
            'source' => 'Meta Ads',
            'status' => 'new',
        ]);

        $response = $this->actingAs($admin)->get('/leads/export');

        $response->assertOk();
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');

        // Verify CSV output contains header and data
        $content = $response->streamedContent();
        $this->assertStringContainsString('Nama Konsumen', $content);
        $this->assertStringContainsString('Konsumen Export Test', $content);

        // Verify audit log recorded
        $this->assertDatabaseHas('activity_logs', [
            'action' => 'export_leads',
            'user_id' => $admin->id,
        ]);
    }
}
