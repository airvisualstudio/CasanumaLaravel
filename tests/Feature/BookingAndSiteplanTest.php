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
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class BookingAndSiteplanTest extends TestCase
{
    use RefreshDatabase;

    protected User $superAdmin;

    protected HousingProject $project;

    protected Cluster $cluster;

    protected HousingUnit $unit;

    protected Lead $lead;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);

        $this->superAdmin = User::factory()->create();
        $this->superAdmin->assignRole('superadmin');

        $developer = Developer::create([
            'name' => 'PT Graha Nusantara',
            'is_active' => true,
        ]);

        $this->project = HousingProject::create([
            'developer_id' => $developer->id,
            'name' => 'Casanuma Hills',
            'city' => 'Bandung',
            'area_size' => 15000,
            'status' => 'active',
        ]);

        $this->cluster = Cluster::create([
            'housing_project_id' => $this->project->id,
            'name' => 'Cluster Lavender',
            'code' => 'LVN',
            'is_active' => true,
        ]);

        $unitType = UnitType::create([
            'housing_project_id' => $this->project->id,
            'cluster_id' => $this->cluster->id,
            'name' => 'Tipe 36/60',
            'surface_area' => 60,
            'building_area' => 36,
            'bedrooms' => 2,
            'bathrooms' => 1,
        ]);

        $this->unit = HousingUnit::create([
            'cluster_id' => $this->cluster->id,
            'unit_type_id' => $unitType->id,
            'block' => 'A1',
            'unit_number' => '05',
            'unit_code' => 'A1/05',
            'base_price' => 450000000,
            'status' => 'available',
            'svg_element_id' => 'lot-a1-05',
        ]);

        $this->lead = Lead::create([
            'housing_project_id' => $this->project->id,
            'name' => 'Bpk. Jonathan',
            'whatsapp' => '081299887766',
            'source' => 'Website',
            'status' => 'survey_visit',
        ]);
    }

    public function test_booking_creation_updates_unit_to_booked_and_lead_to_booking(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->create('receipt.jpg', 200, 'image/jpeg');

        $response = $this->actingAs($this->superAdmin)->post(route('bookings.store'), [
            'lead_id' => $this->lead->id,
            'housing_unit_id' => $this->unit->id,
            'payment_scheme' => 'kpr',
            'base_price' => 450000000,
            'additional_price' => 10000000,
            'discount_amount' => 5000000,
            'legal_fees' => 15000000,
            'booking_fee' => 5000000,
            'dp_amount' => 45000000,
            'dp_installments_count' => 2,
            'transaction_date' => now()->toDateString(),
            'transfer_proof' => $file,
            'notes' => 'Booking tanda jadi unit A1/05',
        ]);

        $response->assertRedirect();

        // 1. Verify booking record created with calculated financial structure
        $this->assertDatabaseHas('bookings', [
            'lead_id' => $this->lead->id,
            'housing_unit_id' => $this->unit->id,
            'payment_scheme' => 'kpr',
            'base_price' => 450000000,
            'total_price' => 470000000,
            'booking_fee' => 5000000,
        ]);

        // 2. Verify initial payment schedule created for booking fee
        $this->assertDatabaseHas('booking_payments', [
            'payment_type' => 'booking_fee',
            'amount_due' => 5000000,
        ]);

        // 3. Verify unit status updated to booked
        $this->unit->refresh();
        $this->assertEquals('booked', $this->unit->status);

        // 4. Verify lead status updated to booking
        $this->lead->refresh();
        $this->assertEquals('booking', $this->lead->status);
    }

    public function test_booking_approval_issues_spr_number_and_generates_dp_schedule(): void
    {
        $salesAgent = User::factory()->create();
        $salesAgent->assignRole('sales_agent');

        $booking = Booking::create([
            'booking_code' => 'BK-PENDING-001',
            'lead_id' => $this->lead->id,
            'housing_unit_id' => $this->unit->id,
            'sales_id' => $salesAgent->id,
            'payment_scheme' => 'kpr',
            'base_price' => 450000000,
            'total_price' => 450000000,
            'booking_fee' => 5000000,
            'dp_amount' => 45000000,
            'dp_installments_count' => 2,
            'remaining_amount' => 405000000,
            'transaction_date' => now()->toDateString(),
            'status' => 'pending_approval',
        ]);

        $response = $this->actingAs($this->superAdmin)->post(route('bookings.approve', $booking->id));
        $response->assertRedirect();

        $booking->refresh();
        $this->assertNotNull($booking->spr_number);
        $this->assertEquals('kpr_process', $booking->status);

        // Verify KPR Application created
        $this->assertDatabaseHas('kpr_applications', [
            'booking_id' => $booking->id,
            'current_stage' => 'document_collection',
        ]);

        // Verify DP payment schedule generated
        $this->assertDatabaseHas('booking_payments', [
            'booking_id' => $booking->id,
            'payment_type' => 'down_payment',
            'term_name' => 'Uang Muka (DP) Termin 1',
        ]);
    }

    public function test_finance_can_verify_payment(): void
    {
        $finance = User::factory()->create();
        $finance->assignRole('finance');

        $booking = Booking::create([
            'booking_code' => 'BK-PAY-001',
            'lead_id' => $this->lead->id,
            'housing_unit_id' => $this->unit->id,
            'sales_id' => $this->superAdmin->id,
            'payment_scheme' => 'cash',
            'base_price' => 450000000,
            'total_price' => 450000000,
            'booking_fee' => 5000000,
            'transaction_date' => now()->toDateString(),
            'status' => 'approved',
        ]);

        $payment = BookingPayment::create([
            'booking_id' => $booking->id,
            'payment_number' => 'KW-TEST-001',
            'payment_type' => 'down_payment',
            'term_name' => 'Uang Muka DP 1',
            'amount_due' => 20000000,
            'due_date' => now()->toDateString(),
            'amount_paid' => 20000000,
            'payment_date' => now()->toDateString(),
            'status' => 'pending_verification',
        ]);

        $response = $this->actingAs($finance)->patch(route('bookings.payments.verify', $payment->id));
        $response->assertRedirect();

        $payment->refresh();
        $this->assertEquals('verified', $payment->status);
        $this->assertEquals($finance->id, $payment->verified_by);
    }

    public function test_booking_cancellation_restores_unit_to_available(): void
    {
        $booking = Booking::create([
            'booking_code' => 'BK-TEST-001',
            'lead_id' => $this->lead->id,
            'housing_unit_id' => $this->unit->id,
            'sales_id' => $this->superAdmin->id,
            'payment_scheme' => 'cash',
            'base_price' => 450000000,
            'total_price' => 450000000,
            'booking_fee' => 10000000,
            'transaction_date' => now()->toDateString(),
            'status' => 'approved',
        ]);

        $this->unit->update(['status' => 'booked']);

        $response = $this->actingAs($this->superAdmin)->post(route('bookings.cancel', $booking->id), [
            'reason' => 'Konsumen mengundurkan diri.',
        ]);
        $response->assertRedirect();

        $booking->refresh();
        $this->assertEquals('cancelled', $booking->status);
        $this->assertEquals('Konsumen mengundurkan diri.', $booking->rejection_reason);

        $this->unit->refresh();
        $this->assertEquals('available', $this->unit->status);
    }

    public function test_can_view_interactive_siteplan_page(): void
    {
        $response = $this->actingAs($this->superAdmin)->get(route('siteplan.index', [
            'project_id' => $this->project->id,
            'cluster_id' => $this->cluster->id,
        ]));

        $response->assertStatus(200);
    }

    public function test_can_upload_cluster_siteplan_svg(): void
    {
        Storage::fake('public');

        $svgFile = UploadedFile::fake()->createWithContent('siteplan.svg', '<svg id="test"></svg>');

        $response = $this->actingAs($this->superAdmin)->post(route('siteplan.upload-svg'), [
            'target_type' => 'cluster',
            'target_id' => $this->cluster->id,
            'svg_file' => $svgFile,
        ]);

        $response->assertRedirect();

        $this->cluster->refresh();
        $this->assertNotNull($this->cluster->siteplan_svg);
        Storage::disk('public')->assertExists($this->cluster->siteplan_svg);
    }
}
