<?php

namespace Tests\Feature;

use App\Models\Booking;
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

class LeadUnitSyncBookingTest extends TestCase
{
    use RefreshDatabase;

    protected User $superAdmin;

    protected User $salesManager;

    protected User $salesAgent;

    protected HousingProject $project;

    protected Cluster $cluster;

    protected UnitType $unitType;

    protected HousingUnit $unit;

    protected Lead $lead;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);

        $this->superAdmin = User::factory()->create();
        $this->superAdmin->assignRole('superadmin');

        $this->salesManager = User::factory()->create();
        $this->salesManager->assignRole('sales_manager');

        $this->salesAgent = User::factory()->create(['name' => 'Bambang Sales']);
        $this->salesAgent->assignRole('sales_agent');

        $developer = Developer::create([
            'name' => 'PT Casanuma Megah',
            'is_active' => true,
        ]);

        $this->project = HousingProject::create([
            'developer_id' => $developer->id,
            'name' => 'Casanuma Riverside',
            'city' => 'Bandung',
            'status' => 'active',
        ]);

        $this->cluster = Cluster::create([
            'housing_project_id' => $this->project->id,
            'name' => 'Cluster Magnolia',
            'code' => 'MGN',
            'is_active' => true,
        ]);

        $this->unitType = UnitType::create([
            'housing_project_id' => $this->project->id,
            'cluster_id' => $this->cluster->id,
            'name' => 'Tipe 45/90',
            'surface_area' => 90,
            'building_area' => 45,
            'bedrooms' => 2,
            'bathrooms' => 1,
        ]);

        $this->unit = HousingUnit::create([
            'cluster_id' => $this->cluster->id,
            'unit_type_id' => $this->unitType->id,
            'block' => 'B2',
            'unit_number' => '10',
            'unit_code' => 'B2/10',
            'base_price' => 550000000,
            'status' => 'available',
        ]);

        $this->lead = Lead::create([
            'housing_project_id' => $this->project->id,
            'sales_id' => $this->salesAgent->id,
            'name' => 'Hendra Gunawan',
            'whatsapp' => '081234567890',
            'email' => 'hendra@example.com',
            'source' => 'Meta Ads',
            'status' => 'survey_visit',
        ]);
    }

    public function test_booking_creation_switches_unit_status_to_booked_and_lead_to_booking(): void
    {
        $this->assertEquals('available', $this->unit->status);
        $this->assertEquals('survey_visit', $this->lead->status);

        $response = $this->actingAs($this->salesAgent)->post(route('bookings.store'), [
            'lead_id' => $this->lead->id,
            'housing_unit_id' => $this->unit->id,
            'payment_scheme' => 'kpr',
            'base_price' => 550000000,
            'booking_fee' => 5000000,
            'dp_amount' => 55000000,
            'transaction_date' => now()->format('Y-m-d'),
        ]);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        // 1. Unit status is switched from 'available' to 'booked'
        $this->unit->refresh();
        $this->assertEquals('booked', $this->unit->status);

        // 2. Lead status is switched to 'booking'
        $this->lead->refresh();
        $this->assertEquals('booking', $this->lead->status);

        // 3. Booking is created in DB linking lead and unit
        $this->assertDatabaseHas('bookings', [
            'lead_id' => $this->lead->id,
            'housing_unit_id' => $this->unit->id,
            'sales_id' => $this->salesAgent->id,
        ]);
    }

    public function test_cannot_book_already_booked_unit(): void
    {
        // Set unit to booked
        $this->unit->update(['status' => 'booked']);

        $anotherLead = Lead::create([
            'housing_project_id' => $this->project->id,
            'sales_id' => $this->salesAgent->id,
            'name' => 'Siti Rahma',
            'whatsapp' => '081299988877',
            'source' => 'Walk In',
            'status' => 'survey_visit',
        ]);

        $response = $this->actingAs($this->salesAgent)->post(route('bookings.store'), [
            'lead_id' => $anotherLead->id,
            'housing_unit_id' => $this->unit->id,
            'payment_scheme' => 'cash',
            'base_price' => 550000000,
            'booking_fee' => 5000000,
            'transaction_date' => now()->format('Y-m-d'),
        ]);

        $response->assertSessionHas('error');
        $this->assertEquals('booked', $this->unit->fresh()->status);
    }

    public function test_cancelling_booking_restores_unit_status_to_available(): void
    {
        $this->actingAs($this->salesAgent)->post(route('bookings.store'), [
            'lead_id' => $this->lead->id,
            'housing_unit_id' => $this->unit->id,
            'payment_scheme' => 'kpr',
            'base_price' => 550000000,
            'booking_fee' => 5000000,
            'transaction_date' => now()->format('Y-m-d'),
        ]);

        $this->assertEquals('booked', $this->unit->fresh()->status);
        $booking = Booking::where('housing_unit_id', $this->unit->id)->firstOrFail();

        // Cancel booking
        $cancelResponse = $this->actingAs($this->superAdmin)->post(route('bookings.cancel', $booking->id), [
            'reason' => 'Konsumen mengundurkan diri karena mutasi dinas luar pulau.',
        ]);

        $cancelResponse->assertRedirect();
        $this->assertEquals('available', $this->unit->fresh()->status);
        $this->assertEquals('cancelled', $booking->fresh()->status);
    }

    public function test_bidirectional_display_housing_unit_has_active_booking_with_lead_and_sales(): void
    {
        $this->actingAs($this->salesAgent)->post(route('bookings.store'), [
            'lead_id' => $this->lead->id,
            'housing_unit_id' => $this->unit->id,
            'payment_scheme' => 'kpr',
            'base_price' => 550000000,
            'booking_fee' => 5000000,
            'transaction_date' => now()->format('Y-m-d'),
        ]);

        $unit = HousingUnit::with(['activeBooking.lead', 'activeBooking.sales'])->find($this->unit->id);

        $this->assertNotNull($unit->activeBooking);
        $this->assertEquals($this->lead->id, $unit->activeBooking->lead->id);
        $this->assertEquals('Hendra Gunawan', $unit->activeBooking->lead->name);
        $this->assertEquals($this->salesAgent->id, $unit->activeBooking->sales->id);
        $this->assertEquals('Bambang Sales', $unit->activeBooking->sales->name);
    }

    public function test_bidirectional_display_lead_has_active_booking_with_unit_and_cluster(): void
    {
        $this->actingAs($this->salesAgent)->post(route('bookings.store'), [
            'lead_id' => $this->lead->id,
            'housing_unit_id' => $this->unit->id,
            'payment_scheme' => 'kpr',
            'base_price' => 550000000,
            'booking_fee' => 5000000,
            'transaction_date' => now()->format('Y-m-d'),
        ]);

        $lead = Lead::with(['activeBooking.unit.cluster'])->find($this->lead->id);

        $this->assertNotNull($lead->activeBooking);
        $this->assertEquals($this->unit->id, $lead->activeBooking->unit->id);
        $this->assertEquals('B2/10', $lead->activeBooking->unit->unit_code);
        $this->assertEquals('Cluster Magnolia', $lead->activeBooking->unit->cluster->name);
    }
}
