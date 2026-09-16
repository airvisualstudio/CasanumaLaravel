<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_superadmin_can_access_user_management(): void
    {
        $admin = User::where('email', 'admin@casanuma.com')->first();

        $response = $this->actingAs($admin)->get('/users');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Users/Index')
            ->has('users')
            ->has('availableRoles')
        );
    }

    public function test_sales_agent_cannot_access_user_management(): void
    {
        $sales = User::where('email', 'sales@casanuma.com')->first();

        $response = $this->actingAs($sales)->get('/users');

        $response->assertForbidden();
    }

    public function test_finance_cannot_access_user_management(): void
    {
        $finance = User::where('email', 'finance@casanuma.com')->first();

        $response = $this->actingAs($finance)->get('/users');

        $response->assertForbidden();
    }

    public function test_sales_manager_cannot_access_user_management(): void
    {
        $manager = User::where('email', 'manager@casanuma.com')->first();

        $response = $this->actingAs($manager)->get('/users');

        $response->assertForbidden();
    }

    public function test_superadmin_can_create_new_user_with_role(): void
    {
        $admin = User::where('email', 'admin@casanuma.com')->first();

        $response = $this->actingAs($admin)->post('/users', [
            'name' => 'Agent Baru',
            'email' => 'agentbaru@casanuma.com',
            'password' => 'password123',
            'role' => 'sales_agent',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'email' => 'agentbaru@casanuma.com',
            'name' => 'Agent Baru',
        ]);

        $created = User::where('email', 'agentbaru@casanuma.com')->first();
        $this->assertTrue($created->hasRole('sales_agent'));
    }

    public function test_superadmin_can_create_user_with_complete_profile_fields(): void
    {
        $admin = User::where('email', 'admin@casanuma.com')->first();

        $response = $this->actingAs($admin)->post('/users', [
            'name' => 'Doni Saputra',
            'email' => 'doni@casanuma.com',
            'password' => 'password123',
            'role' => 'sales_agent',
            'phone' => '081299887766',
            'address' => 'Jl. Aster Merah No. 10, Cimahi',
            'emergency_contact_name' => 'Sinta (Istri)',
            'emergency_contact_phone' => '081299887700',
            'employee_id' => 'CSN-SLS-010',
            'position' => 'Property Advisor',
            'join_date' => '2024-02-01',
            'is_active' => true,
            'bank_name' => 'BCA',
            'bank_account_number' => '1234567890',
            'bank_account_holder' => 'Doni Saputra',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'email' => 'doni@casanuma.com',
            'phone' => '6281299887766',
            'employee_id' => 'CSN-SLS-010',
            'bank_name' => 'BCA',
            'bank_account_number' => '1234567890',
        ]);

        $user = User::where('email', 'doni@casanuma.com')->first();
        $this->assertTrue($user->is_active);
        $this->assertEquals('Property Advisor', $user->position);
    }

    public function test_superadmin_can_upload_avatar_for_user(): void
    {
        Storage::fake('public');
        $admin = User::where('email', 'admin@casanuma.com')->first();

        $avatarFile = UploadedFile::fake()->create('avatar.jpg', 150, 'image/jpeg');

        $response = $this->actingAs($admin)->post('/users', [
            'name' => 'Maya Anggraeni',
            'email' => 'maya@casanuma.com',
            'password' => 'password123',
            'role' => 'finance',
            'avatar' => $avatarFile,
        ]);

        $response->assertRedirect();
        $user = User::where('email', 'maya@casanuma.com')->first();
        $this->assertNotNull($user->avatar);
        Storage::disk('public')->assertExists($user->avatar);
    }

    public function test_superadmin_can_update_user_and_role(): void
    {
        $admin = User::where('email', 'admin@casanuma.com')->first();
        $sales = User::where('email', 'sales@casanuma.com')->first();

        $response = $this->actingAs($admin)->put("/users/{$sales->id}", [
            'name' => 'Sales Dipromosikan',
            'email' => 'sales@casanuma.com',
            'role' => 'sales_manager',
            'position' => 'Senior Sales Manager',
            'phone' => '082199998888',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'id' => $sales->id,
            'name' => 'Sales Dipromosikan',
            'position' => 'Senior Sales Manager',
            'phone' => '6282199998888',
        ]);

        $sales->refresh();
        $this->assertTrue($sales->hasRole('sales_manager'));
        $this->assertFalse($sales->hasRole('sales_agent'));
    }

    public function test_superadmin_can_toggle_user_active_status(): void
    {
        $admin = User::where('email', 'admin@casanuma.com')->first();
        $sales = User::where('email', 'sales@casanuma.com')->first();

        $this->assertTrue($sales->is_active);

        $response = $this->actingAs($admin)->patch("/users/{$sales->id}/toggle-status");
        $response->assertRedirect();

        $sales->refresh();
        $this->assertFalse($sales->is_active);

        // Toggle back
        $this->actingAs($admin)->patch("/users/{$sales->id}/toggle-status");
        $sales->refresh();
        $this->assertTrue($sales->is_active);
    }

    public function test_superadmin_cannot_deactivate_themselves(): void
    {
        $admin = User::where('email', 'admin@casanuma.com')->first();

        $response = $this->actingAs($admin)->patch("/users/{$admin->id}/toggle-status");

        $response->assertSessionHasErrors('error');
        $admin->refresh();
        $this->assertTrue($admin->is_active);
    }

    public function test_superadmin_can_delete_user(): void
    {
        $admin = User::where('email', 'admin@casanuma.com')->first();
        $userToDelete = User::factory()->create([
            'email' => 'todelete@casanuma.com',
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->delete("/users/{$userToDelete->id}");

        $response->assertRedirect();
        $this->assertDatabaseMissing('users', [
            'id' => $userToDelete->id,
        ]);
    }

    public function test_superadmin_cannot_delete_themselves(): void
    {
        $admin = User::where('email', 'admin@casanuma.com')->first();

        $response = $this->actingAs($admin)->delete("/users/{$admin->id}");

        $response->assertSessionHasErrors('error');
        $this->assertDatabaseHas('users', [
            'id' => $admin->id,
        ]);
    }

    public function test_superadmin_can_force_reset_user_password(): void
    {
        $admin = User::where('email', 'admin@casanuma.com')->first();
        $sales = User::where('email', 'sales@casanuma.com')->first();

        $newPassword = 'NewSecretPassword2026!';

        $response = $this->actingAs($admin)->patch("/users/{$sales->id}/reset-password", [
            'password' => $newPassword,
            'password_confirmation' => $newPassword,
        ]);

        $response->assertRedirect();
        $sales->refresh();

        $this->assertTrue(Hash::check($newPassword, $sales->password));
    }

    public function test_non_superadmin_cannot_force_reset_user_password(): void
    {
        $sales = User::where('email', 'sales@casanuma.com')->first();
        $finance = User::where('email', 'finance@casanuma.com')->first();

        $response = $this->actingAs($sales)->patch("/users/{$finance->id}/reset-password", [
            'password' => 'HackerPassword123!',
            'password_confirmation' => 'HackerPassword123!',
        ]);

        $response->assertForbidden();
    }

    public function test_user_creation_rejects_avatar_greater_than_2mb(): void
    {
        $admin = User::where('email', 'admin@casanuma.com')->first();
        $largeAvatar = UploadedFile::fake()->create('large.jpg', 2560, 'image/jpeg');

        $response = $this->actingAs($admin)->post('/users', [
            'name' => 'Ukuran Besar',
            'email' => 'besar@casanuma.com',
            'password' => 'password123',
            'role' => 'sales_agent',
            'avatar' => $largeAvatar,
        ]);

        $response->assertSessionHasErrors('avatar');
    }

    public function test_superadmin_can_remove_avatar_from_user(): void
    {
        Storage::fake('public');
        $admin = User::where('email', 'admin@casanuma.com')->first();
        $user = User::factory()->create(['avatar' => 'avatars/sample.jpg']);
        Storage::disk('public')->put('avatars/sample.jpg', 'fake content');

        $response = $this->actingAs($admin)->put("/users/{$user->id}", [
            'name' => $user->name,
            'email' => $user->email,
            'role' => 'sales_agent',
            'remove_avatar' => true,
        ]);

        $response->assertRedirect();
        $user->refresh();
        $this->assertNull($user->avatar);
        Storage::disk('public')->assertMissing('avatars/sample.jpg');
    }

    public function test_phone_number_is_automatically_sanitized_to_628_on_user_creation(): void
    {
        $admin = User::where('email', 'admin@casanuma.com')->first();

        $response = $this->actingAs($admin)->post('/users', [
            'name' => 'Budi Santoso',
            'email' => 'budi.santoso@casanuma.com',
            'password' => 'password123',
            'role' => 'sales_agent',
            'phone' => '0857-1234-5678',
            'emergency_contact_phone' => '+62 813-9876-5432',
        ]);

        $response->assertRedirect();
        $user = User::where('email', 'budi.santoso@casanuma.com')->first();
        $this->assertSame('6285712345678', $user->phone);
        $this->assertSame('6281398765432', $user->emergency_contact_phone);
    }
}
