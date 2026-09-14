<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\BookingPayment;
use App\Models\Cluster;
use App\Models\Developer;
use App\Models\HousingProject;
use App\Models\HousingUnit;
use App\Models\Lead;
use App\Models\UnitType;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingRbacTest extends TestCase
{
    use RefreshDatabase;

    protected User $superAdmin;

    protected User $salesManager;

    protected User $finance;

    protected User $agent1;

    protected User $agent2;

    protected HousingProject $project;

    protected HousingUnit $unit1;

    protected HousingUnit $unit2;

    protected HousingUnit $unit3;

    protected Lead $leadAgent1;

    protected Lead $leadAgent2;

    protected Booking $bookingAgent1;

    protected Booking $bookingAgent2;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);

        $this->superAdmin = User::factory()->create(['name' => 'Super Administrator']);
        $this->superAdmin->assignRole('superadmin');

        $this->salesManager = User::factory()->create(['name' => 'Sales Manager User']);
        $this->salesManager->assignRole('sales_manager');

        $this->finance = User::factory()->create(['name' => 'Finance Officer']);
        $this->finance->assignRole('finance');

        $this->agent1 = User::factory()->create(['name' => 'Agent Satu']);
        $this->agent1->assignRole('sales_agent');

        $this->agent2 = User::factory()->create(['name' => 'Agent Dua']);
        $this->agent2->assignRole('sales_agent');

        $developer = Developer::create([
            'name' => 'PT Casanuma Megah',
            'is_active' => true,
        ]);

        $this->project = HousingProject::create([
            'developer_id' => $developer->id,
            'name' => 'Casanuma Grand Village',
            'city' => 'Bandung',
            'status' => 'active',
        ]);

        $cluster = Cluster::create([
            'housing_project_id' => $this->project->id,
            'name' => 'Cluster Sakura',
        ]);

        $unitType = UnitType::create([
            'housing_project_id' => $this->project->id,
            'name' => 'Tipe 36/60',
            'surface_area' => 60,
            'building_area' => 36,
        ]);

        $this->unit1 = HousingUnit::create([
            'cluster_id' => $cluster->id,
            'unit_type_id' => $unitType->id,
            'block' => 'A1',
            'unit_number' => '01',
            'unit_code' => 'A1/01',
            'base_price' => 500000000,
            'status' => 'booked',
        ]);

        $this->unit2 = HousingUnit::create([
            'cluster_id' => $cluster->id,
            'unit_type_id' => $unitType->id,
            'block' => 'A1',
            'unit_number' => '02',
            'unit_code' => 'A1/02',
            'base_price' => 550000000,
            'status' => 'booked',
        ]);

        $this->unit3 = HousingUnit::create([
            'cluster_id' => $cluster->id,
            'unit_type_id' => $unitType->id,
            'block' => 'B1',
            'unit_number' => '01',
            'unit_code' => 'B1/01',
            'base_price' => 600000000,
            'status' => 'available',
        ]);

        $this->leadAgent1 = Lead::create([
            'developer_id' => $developer->id,
            'housing_project_id' => $this->project->id,
            'sales_id' => $this->agent1->id,
            'name' => 'Konsumen Budi (Agent 1)',
            'whatsapp' => '081234567001',
            'source' => 'Website',
            'status' => 'booking',
        ]);

        $this->leadAgent2 = Lead::create([
            'developer_id' => $developer->id,
            'housing_project_id' => $this->project->id,
            'sales_id' => $this->agent2->id,
            'name' => 'Konsumen Siti (Agent 2)',
            'whatsapp' => '081234567002',
            'source' => 'Meta Ads',
            'status' => 'booking',
        ]);

        $this->bookingAgent1 = Booking::create([
            'booking_code' => 'BK-202609-0001',
            'lead_id' => $this->leadAgent1->id,
            'housing_unit_id' => $this->unit1->id,
            'sales_id' => $this->agent1->id,
            'payment_scheme' => 'kpr',
            'base_price' => 500000000,
            'total_price' => 500000000,
            'booking_fee' => 5000000,
            'remaining_amount' => 495000000,
            'transaction_date' => '2026-09-14',
            'status' => 'pending_approval',
        ]);

        $this->bookingAgent2 = Booking::create([
            'booking_code' => 'BK-202609-0002',
            'lead_id' => $this->leadAgent2->id,
            'housing_unit_id' => $this->unit2->id,
            'sales_id' => $this->agent2->id,
            'payment_scheme' => 'cash',
            'base_price' => 550000000,
            'total_price' => 550000000,
            'booking_fee' => 10000000,
            'remaining_amount' => 540000000,
            'transaction_date' => '2026-09-14',
            'status' => 'approved',
        ]);
    }

    public function test_superadmin_can_view_all_bookings(): void
    {
        $response = $this->actingAs($this->superAdmin)->get(route('bookings.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Bookings/Index')
            ->has('bookings.data', 2)
            ->where('isAgentOnly', false)
            ->where('stats.total', 2)
        );
    }

    public function test_sales_manager_can_view_all_bookings(): void
    {
        $response = $this->actingAs($this->salesManager)->get(route('bookings.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Bookings/Index')
            ->has('bookings.data', 2)
            ->where('isAgentOnly', false)
            ->where('stats.total', 2)
        );
    }

    public function test_finance_can_view_all_bookings(): void
    {
        $response = $this->actingAs($this->finance)->get(route('bookings.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Bookings/Index')
            ->has('bookings.data', 2)
            ->where('isAgentOnly', false)
        );
    }

    public function test_sales_agent_can_only_view_their_own_bookings(): void
    {
        $response = $this->actingAs($this->agent1)->get(route('bookings.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Bookings/Index')
            ->has('bookings.data', 1)
            ->where('bookings.data.0.booking_code', 'BK-202609-0001')
            ->where('isAgentOnly', true)
            ->where('stats.total', 1)
            ->where('stats.total_fee', 5000000)
        );
    }

    public function test_sales_agent_can_create_booking_for_their_own_lead(): void
    {
        $lead = Lead::create([
            'housing_project_id' => $this->project->id,
            'sales_id' => $this->agent1->id,
            'name' => 'Konsumen Baru Agent 1',
            'whatsapp' => '081299990001',
            'status' => 'new',
        ]);

        $response = $this->actingAs($this->agent1)->post(route('bookings.store'), [
            'lead_id' => $lead->id,
            'housing_unit_id' => $this->unit3->id,
            'payment_scheme' => 'cash',
            'base_price' => 600000000,
            'booking_fee' => 5000000,
            'transaction_date' => '2026-09-14',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('bookings', [
            'lead_id' => $lead->id,
            'sales_id' => $this->agent1->id,
            'housing_unit_id' => $this->unit3->id,
            'status' => 'pending_approval',
        ]);
    }

    public function test_sales_agent_cannot_create_booking_for_another_agents_lead(): void
    {
        $response = $this->actingAs($this->agent1)->post(route('bookings.store'), [
            'lead_id' => $this->leadAgent2->id,
            'housing_unit_id' => $this->unit3->id,
            'payment_scheme' => 'cash',
            'base_price' => 600000000,
            'booking_fee' => 5000000,
            'transaction_date' => '2026-09-14',
        ]);

        $response->assertForbidden();
    }

    public function test_sales_agent_cannot_approve_booking(): void
    {
        $response = $this->actingAs($this->agent1)->post(route('bookings.approve', $this->bookingAgent1));

        $response->assertForbidden();
    }

    public function test_sales_manager_can_approve_booking(): void
    {
        $response = $this->actingAs($this->salesManager)->post(route('bookings.approve', $this->bookingAgent1));

        $response->assertRedirect();
        $this->assertDatabaseHas('bookings', [
            'id' => $this->bookingAgent1->id,
            'status' => 'kpr_process',
            'approved_by_manager_id' => $this->salesManager->id,
        ]);
    }

    public function test_sales_agent_cannot_verify_payment(): void
    {
        $payment = BookingPayment::create([
            'booking_id' => $this->bookingAgent1->id,
            'payment_number' => 'KW-202609-0099',
            'payment_type' => 'booking_fee',
            'term_name' => 'Uang Tanda Jadi',
            'amount_due' => 5000000,
            'due_date' => '2026-09-14',
            'amount_paid' => 5000000,
            'status' => 'pending_verification',
        ]);

        $response = $this->actingAs($this->agent1)->patch(route('bookings.payments.verify', $payment));

        $response->assertForbidden();
    }

    public function test_finance_can_verify_payment(): void
    {
        $payment = BookingPayment::create([
            'booking_id' => $this->bookingAgent1->id,
            'payment_number' => 'KW-202609-0098',
            'payment_type' => 'booking_fee',
            'term_name' => 'Uang Tanda Jadi',
            'amount_due' => 5000000,
            'due_date' => '2026-09-14',
            'amount_paid' => 5000000,
            'status' => 'pending_verification',
        ]);

        $response = $this->actingAs($this->finance)->patch(route('bookings.payments.verify', $payment));

        $response->assertRedirect();
        $this->assertDatabaseHas('booking_payments', [
            'id' => $payment->id,
            'status' => 'verified',
            'verified_by' => $this->finance->id,
        ]);
    }

    public function test_sales_agent_cannot_add_payment_to_another_agents_booking(): void
    {
        $response = $this->actingAs($this->agent1)->post(route('bookings.payments.store', $this->bookingAgent2), [
            'payment_type' => 'down_payment',
            'term_name' => 'DP Termin 1',
            'amount_due' => 20000000,
            'due_date' => '2026-09-28',
        ]);

        $response->assertForbidden();
    }

    public function test_sales_agent_can_cancel_own_pending_booking(): void
    {
        $response = $this->actingAs($this->agent1)->post(route('bookings.cancel', $this->bookingAgent1), [
            'reason' => 'Konsumen membatalkan sepihak.',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('bookings', [
            'id' => $this->bookingAgent1->id,
            'status' => 'cancelled',
        ]);
        $this->assertDatabaseHas('housing_units', [
            'id' => $this->unit1->id,
            'status' => 'available',
        ]);
    }

    public function test_sales_agent_cannot_cancel_another_agents_booking(): void
    {
        $response = $this->actingAs($this->agent1)->post(route('bookings.cancel', $this->bookingAgent2), [
            'reason' => 'Mencoba batalkan booking orang lain.',
        ]);

        $response->assertForbidden();
    }

    public function test_sales_agent_cannot_create_or_delete_housing_unit(): void
    {
        // Attempt create unit
        $createRes = $this->actingAs($this->agent1)->post(route('units.store'), [
            'cluster_id' => $this->unit1->cluster_id,
            'unit_type_id' => $this->unit1->unit_type_id,
            'block' => 'Z9',
            'unit_number' => '99',
            'base_price' => 700000000,
            'status' => 'available',
        ]);
        $createRes->assertForbidden();

        // Attempt delete unit
        $delRes = $this->actingAs($this->agent1)->delete(route('units.destroy', $this->unit3));
        $delRes->assertForbidden();
    }
}
