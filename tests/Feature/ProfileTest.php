<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_page_is_displayed(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get('/profile');

        $response->assertOk();
    }

    public function test_profile_information_can_be_updated(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch('/profile', [
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $user->refresh();

        $this->assertSame('Test User', $user->name);
        $this->assertSame('test@example.com', $user->email);
        $this->assertNull($user->email_verified_at);
    }

    public function test_email_verification_status_is_unchanged_when_the_email_address_is_unchanged(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch('/profile', [
                'name' => 'Test User',
                'email' => $user->email,
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $this->assertNotNull($user->refresh()->email_verified_at);
    }

    public function test_user_can_delete_their_account(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->delete('/profile', [
                'password' => 'password',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/');

        $this->assertGuest();
        $this->assertNull($user->fresh());
    }

    public function test_correct_password_must_be_provided_to_delete_account(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->from('/profile')
            ->delete('/profile', [
                'password' => 'wrong-password',
            ]);

        $response
            ->assertSessionHasErrors('password')
            ->assertRedirect('/profile');

        $this->assertNotNull($user->fresh());
    }

    public function test_user_can_update_extended_profile_fields(): void
    {
        $user = User::factory()->create([
            'name' => 'Original Name',
            'phone' => '081234567890',
        ]);

        $response = $this
            ->actingAs($user)
            ->patch('/profile', [
                'name' => 'Updated Name',
                'email' => $user->email,
                'phone' => '089876543210',
                'address' => 'Jl. Kenanga Blok C No. 5',
                'emergency_contact_name' => 'Dewi Safitri',
                'emergency_contact_phone' => '081122334455',
                'bank_name' => 'BCA',
                'bank_account_number' => '5432109876',
                'bank_account_holder' => 'Updated Name',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $user->refresh();

        $this->assertSame('Updated Name', $user->name);
        $this->assertSame('6289876543210', $user->phone);
        $this->assertSame('Jl. Kenanga Blok C No. 5', $user->address);
        $this->assertSame('Dewi Safitri', $user->emergency_contact_name);
        $this->assertSame('6281122334455', $user->emergency_contact_phone);
        $this->assertSame('BCA', $user->bank_name);
        $this->assertSame('5432109876', $user->bank_account_number);
        $this->assertSame('Updated Name', $user->bank_account_holder);
    }

    public function test_phone_number_is_automatically_sanitized_to_628_format(): void
    {
        $user = User::factory()->create();

        // Testing different phone formats: 08xx, +628xx, 8xx
        $this->actingAs($user)->patch('/profile', [
            'name' => $user->name,
            'email' => $user->email,
            'phone' => '0812-3456-7890',
            'emergency_contact_phone' => '+62 878-1122-3344',
        ]);

        $user->refresh();
        $this->assertSame('6281234567890', $user->phone);
        $this->assertSame('6287811223344', $user->emergency_contact_phone);
    }

    public function test_profile_avatar_upload_rejects_files_larger_than_2mb(): void
    {
        $user = User::factory()->create();

        // 2.5 MB file (2560 KB > 2048 KB)
        $largeAvatar = \Illuminate\Http\UploadedFile::fake()->create('large.jpg', 2560, 'image/jpeg');

        $response = $this->actingAs($user)->patch('/profile', [
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => $largeAvatar,
        ]);

        $response->assertSessionHasErrors('avatar');
    }

    public function test_user_cannot_modify_restricted_administrative_fields(): void
    {
        $user = User::factory()->create([
            'employee_id' => 'CSN-ORI-001',
            'position' => 'Junior Sales',
            'join_date' => '2025-01-01',
            'is_active' => true,
        ]);

        // Malicious user attempts to hijack admin fields
        $response = $this
            ->actingAs($user)
            ->patch('/profile', [
                'name' => $user->name,
                'email' => $user->email,
                'employee_id' => 'CSN-HACKED-999',
                'position' => 'CEO & Superadmin',
                'join_date' => '2020-01-01',
                'is_active' => false,
                'role' => 'superadmin',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $user->refresh();

        // Ensure restricted admin fields remain completely untouched
        $this->assertSame('CSN-ORI-001', $user->employee_id);
        $this->assertSame('Junior Sales', $user->position);
        $this->assertSame('2025-01-01', $user->join_date->format('Y-m-d'));
        $this->assertTrue($user->is_active);
    }
}
