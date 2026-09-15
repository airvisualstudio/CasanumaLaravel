<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Cluster;
use App\Models\Developer;
use App\Models\HousingProject;
use App\Models\HousingUnit;
use App\Models\Lead;
use App\Models\Receipt;
use App\Models\UnitType;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ReceiptApprovalWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected User $superAdmin;
    protected User $salesManager;
    protected User $finance;
    protected User $agent1;
    protected User $agent2;
    protected Booking $booking1;
    protected Booking $booking2;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
        Storage::fake('public');

        $this->superAdmin = User::factory()->create(['name' => 'Superadmin User', 'is_active' => true]);
        $this->superAdmin->assignRole('superadmin');

        $this->salesManager = User::factory()->create(['name' => 'Sales Manager User', 'is_active' => true]);
        $this->salesManager->assignRole('sales_manager');

        $this->finance = User::factory()->create(['name' => 'Finance Staff User', 'is_active' => true]);
        $this->finance->assignRole('finance');

        $this->agent1 = User::factory()->create(['name' => 'Agent One User', 'is_active' => true]);
        $this->agent1->assignRole('sales_agent');

        $this->agent2 = User::factory()->create(['name' => 'Agent Two User', 'is_active' => true]);
        $this->agent2->assignRole('sales_agent');

        // Setup property hierarchy
        $dev = Developer::create(['name' => 'PT Pengembang Utama', 'is_active' => true]);
        $proj = HousingProject::create([
            'developer_id' => $dev->id,
            'name' => 'Casanuma Hills',
            'city' => 'Bandung',
            'status' => 'active',
        ]);
        $cluster = Cluster::create(['housing_project_id' => $proj->id, 'name' => 'Cluster Sakura']);
        $type = UnitType::create([
            'housing_project_id' => $proj->id,
            'cluster_id' => $cluster->id,
            'name' => 'Type 45/90',
            'surface_area' => 90,
            'building_area' => 45,
            'standard_price' => 750000000,
        ]);

        $unit1 = HousingUnit::create([
            'cluster_id' => $cluster->id,
            'unit_type_id' => $type->id,
            'block' => 'A',
            'unit_number' => '01',
            'unit_code' => 'A-01',
            'status' => 'booked',
            'base_price' => 750000000,
        ]);

        $unit2 = HousingUnit::create([
            'cluster_id' => $cluster->id,
            'unit_type_id' => $type->id,
            'block' => 'A',
            'unit_number' => '02',
            'unit_code' => 'A-02',
            'status' => 'booked',
            'base_price' => 750000000,
        ]);

        $lead1 = Lead::create([
            'name' => 'Budi Konsumen 1',
            'whatsapp' => '081234567890',
            'sales_id' => $this->agent1->id,
            'housing_project_id' => $proj->id,
            'status' => 'booking',
        ]);

        $lead2 = Lead::create([
            'name' => 'Siti Konsumen 2',
            'whatsapp' => '089876543210',
            'sales_id' => $this->agent2->id,
            'housing_project_id' => $proj->id,
            'status' => 'booking',
        ]);

        $this->booking1 = Booking::create([
            'booking_code' => 'BK-2026-001',
            'lead_id' => $lead1->id,
            'housing_unit_id' => $unit1->id,
            'sales_id' => $this->agent1->id,
            'booking_date' => now()->toDateString(),
            'transaction_date' => now()->toDateString(),
            'booking_fee' => 10000000,
            'payment_scheme' => 'cash',
            'base_price' => 750000000,
            'total_price' => 750000000,
            'status' => 'confirmed',
        ]);

        $this->booking2 = Booking::create([
            'booking_code' => 'BK-2026-002',
            'lead_id' => $lead2->id,
            'housing_unit_id' => $unit2->id,
            'sales_id' => $this->agent2->id,
            'booking_date' => now()->toDateString(),
            'transaction_date' => now()->toDateString(),
            'booking_fee' => 10000000,
            'payment_scheme' => 'kpr',
            'base_price' => 750000000,
            'total_price' => 750000000,
            'status' => 'confirmed',
        ]);
    }

    /**
     * Test full multi-step approval workflow from Sales submit to Manager approval.
     */
    public function test_complete_multi_step_approval_workflow(): void
    {
        // 1. Sales Agent 1 submits a receipt request
        $file = UploadedFile::fake()->image('transfer_proof.jpg', 600, 400);

        $submitResponse = $this->actingAs($this->agent1)->post(route('receipts.store'), [
            'booking_id' => $this->booking1->id,
            'payment_type' => 'booking_fee',
            'amount' => 10000000,
            'payment_method' => 'transfer_bank',
            'bank_name' => 'BCA',
            'payment_date' => now()->toDateString(),
            'notes' => 'Pembayaran tanda jadi via transfer m-BCA',
            'transfer_proof' => $file,
        ]);

        $submitResponse->assertRedirect(route('receipts.index'));
        $this->assertDatabaseHas('receipts', [
            'booking_id' => $this->booking1->id,
            'amount' => 10000000,
            'status' => Receipt::STATUS_SUBMITTED,
            'submitted_by' => $this->agent1->id,
        ]);

        $receipt = Receipt::where('booking_id', $this->booking1->id)->first();
        $this->assertNotNull($receipt);
        $this->assertNotNull($receipt->qr_code_token);
        $this->assertDatabaseHas('receipt_status_logs', [
            'receipt_id' => $receipt->id,
            'to_status' => Receipt::STATUS_SUBMITTED,
            'changed_by' => $this->agent1->id,
        ]);

        // 2. Finance Reviews and assigns official receipt number
        $financeResponse = $this->actingAs($this->finance)->post(route('receipts.review-finance', $receipt->id), [
            'finance_receipt_number' => 'KW/2026/09/0001',
            'finance_notes' => 'Bukti mutasi rekening BCA valid.',
        ]);

        $financeResponse->assertRedirect();
        $receipt->refresh();
        $this->assertEquals(Receipt::STATUS_FINANCE_APPROVED, $receipt->status);
        $this->assertEquals('KW/2026/09/0001', $receipt->finance_receipt_number);
        $this->assertEquals($this->finance->id, $receipt->reviewed_by_finance_id);
        $this->assertDatabaseHas('receipt_status_logs', [
            'receipt_id' => $receipt->id,
            'to_status' => Receipt::STATUS_FINANCE_APPROVED,
            'changed_by' => $this->finance->id,
        ]);

        // 3. Manager approves receipt
        $managerResponse = $this->actingAs($this->salesManager)->post(route('receipts.approve-manager', $receipt->id));
        $managerResponse->assertRedirect();

        $receipt->refresh();
        $this->assertEquals(Receipt::STATUS_MANAGER_APPROVED, $receipt->status);
        $this->assertEquals('KW/2026/09/0001', $receipt->receipt_number);
        $this->assertEquals($this->salesManager->id, $receipt->approved_by_manager_id);
        $this->assertNotNull($receipt->qr_code_url);
        $this->assertNotNull($receipt->pdf_path);
        Storage::disk('public')->assertExists($receipt->pdf_path);

        $this->assertDatabaseHas('receipt_status_logs', [
            'receipt_id' => $receipt->id,
            'to_status' => Receipt::STATUS_MANAGER_APPROVED,
            'changed_by' => $this->salesManager->id,
        ]);

        // 4. Public QR verification
        $verifyResponse = $this->get(route('receipts.verify', $receipt->qr_code_token));
        $verifyResponse->assertOk();
        $verifyResponse->assertInertia(fn ($page) => $page
            ->component('Receipts/Verify')
            ->where('is_valid', true)
            ->where('receipt.receipt_number', 'KW/2026/09/0001')
        );

        // 5. Download PDF
        $downloadResponse = $this->actingAs($this->agent1)->get(route('receipts.pdf', $receipt->id));
        $downloadResponse->assertOk();
        $this->assertEquals('application/pdf', $downloadResponse->headers->get('content-type'));
    }

    /**
     * Test receipt rejection flow by Finance.
     */
    public function test_finance_can_reject_receipt(): void
    {
        $receipt = Receipt::create([
            'booking_id' => $this->booking1->id,
            'lead_id' => $this->booking1->lead_id,
            'payment_type' => 'dp',
            'amount' => 50000000,
            'payment_method' => 'transfer_bank',
            'payment_date' => now()->toDateString(),
            'status' => Receipt::STATUS_SUBMITTED,
            'submitted_by' => $this->agent1->id,
            'submitted_at' => now(),
        ]);

        $response = $this->actingAs($this->finance)->post(route('receipts.reject', $receipt->id), [
            'rejection_reason' => 'Nominal transfer tidak sesuai dengan invoice DP.',
        ]);

        $response->assertRedirect();
        $receipt->refresh();
        $this->assertEquals(Receipt::STATUS_REJECTED, $receipt->status);
        $this->assertEquals('Nominal transfer tidak sesuai dengan invoice DP.', $receipt->rejection_reason);
        $this->assertEquals($this->finance->id, $receipt->rejected_by);
    }

    /**
     * Test RBAC: Sales Agent cannot review or approve receipts.
     */
    public function test_sales_agent_cannot_review_or_approve(): void
    {
        $receipt = Receipt::create([
            'booking_id' => $this->booking1->id,
            'lead_id' => $this->booking1->lead_id,
            'payment_type' => 'booking_fee',
            'amount' => 10000000,
            'payment_method' => 'cash',
            'payment_date' => now()->toDateString(),
            'status' => Receipt::STATUS_SUBMITTED,
            'submitted_by' => $this->agent1->id,
            'submitted_at' => now(),
        ]);

        // Agent attempts review -> 403
        $reviewRes = $this->actingAs($this->agent1)->post(route('receipts.review-finance', $receipt->id), [
            'finance_receipt_number' => 'KW/ILLEGAL',
        ]);
        $reviewRes->assertForbidden();

        // Agent attempts manager approve -> 403
        $approveRes = $this->actingAs($this->agent1)->post(route('receipts.approve-manager', $receipt->id));
        $approveRes->assertForbidden();
    }

    /**
     * Test RBAC: Sales Agent only sees their own receipts in index.
     */
    public function test_sales_agent_only_sees_own_receipts(): void
    {
        // Receipt submitted by Agent 1
        $receipt1 = Receipt::create([
            'booking_id' => $this->booking1->id,
            'lead_id' => $this->booking1->lead_id,
            'payment_type' => 'booking_fee',
            'amount' => 10000000,
            'payment_method' => 'cash',
            'payment_date' => now()->toDateString(),
            'status' => Receipt::STATUS_SUBMITTED,
            'submitted_by' => $this->agent1->id,
            'submitted_at' => now(),
        ]);

        // Receipt submitted by Agent 2
        $receipt2 = Receipt::create([
            'booking_id' => $this->booking2->id,
            'lead_id' => $this->booking2->lead_id,
            'payment_type' => 'booking_fee',
            'amount' => 10000000,
            'payment_method' => 'cash',
            'payment_date' => now()->toDateString(),
            'status' => Receipt::STATUS_SUBMITTED,
            'submitted_by' => $this->agent2->id,
            'submitted_at' => now(),
        ]);

        $response = $this->actingAs($this->agent1)->get(route('receipts.index'));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Receipts/Index')
            ->has('receipts.data', 1)
            ->where('receipts.data.0.id', $receipt1->id)
        );

        // Manager sees both
        $mgrResponse = $this->actingAs($this->salesManager)->get(route('receipts.index'));
        $mgrResponse->assertOk();
        $mgrResponse->assertInertia(fn ($page) => $page
            ->component('Receipts/Index')
            ->has('receipts.data', 2)
        );
    }
}
