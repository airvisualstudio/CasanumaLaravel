<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\SystemSetting;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ActivityLogTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
        $this->seed(UserSeeder::class);
    }

    public function test_superadmin_can_access_activity_logs_and_settings_page(): void
    {
        $admin = User::where('email', 'admin@casanuma.com')->first();

        // Create an activity log with authenticated user to test eager loading relation
        $this->actingAs($admin);
        ActivityLog::record('test.action', 'Testing eager loading with user and roles', $admin);

        $response = $this->get('/settings/activity-logs');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Settings/ActivityLogs')
            ->has('logs.data')
            ->where('logs.data.0.user.email', $admin->email)
            ->has('kpi')
            ->has('telegramConfig')
        );
    }

    public function test_non_superadmin_cannot_access_activity_logs(): void
    {
        $sales = User::where('email', 'sales@casanuma.com')->first();
        $finance = User::where('email', 'finance@casanuma.com')->first();

        $this->actingAs($sales)->get('/settings/activity-logs')->assertForbidden();
        $this->actingAs($finance)->get('/settings/activity-logs')->assertForbidden();
    }

    public function test_superadmin_can_save_telegram_settings_in_database(): void
    {
        $admin = User::where('email', 'admin@casanuma.com')->first();

        $response = $this->actingAs($admin)->post('/settings/telegram', [
            'bot_token' => '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ',
            'chat_id' => '-1001234567890',
            'notifications_enabled' => true,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertEquals('123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ', SystemSetting::get('telegram_bot_token'));
        $this->assertEquals('-1001234567890', SystemSetting::get('telegram_chat_id'));
        $this->assertTrue(SystemSetting::get('telegram_notifications_enabled'));

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'telegram_config',
            'user_id' => $admin->id,
        ]);
    }

    public function test_superadmin_can_test_telegram_connection_successfully(): void
    {
        Http::fake([
            'https://api.telegram.org/*' => Http::response([
                'ok' => true,
                'result' => [
                    'message_id' => 12345,
                    'chat' => ['id' => 987654],
                ],
            ], 200),
        ]);

        $admin = User::where('email', 'admin@casanuma.com')->first();

        $response = $this->actingAs($admin)->post('/settings/telegram/test', [
            'bot_token' => 'test-token-123',
            'chat_id' => 'test-chat-456',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'telegram_test',
            'user_id' => $admin->id,
        ]);
    }

    public function test_telegram_connection_handles_api_failure_gracefully(): void
    {
        Http::fake([
            'https://api.telegram.org/*' => Http::response([
                'ok' => false,
                'description' => 'Unauthorized',
            ], 401),
        ]);

        $admin = User::where('email', 'admin@casanuma.com')->first();

        $response = $this->actingAs($admin)->post('/settings/telegram/test', [
            'bot_token' => 'invalid-token',
            'chat_id' => 'test-chat-456',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('error');

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'telegram_test',
            'user_id' => $admin->id,
        ]);
    }

    public function test_user_actions_automatically_create_activity_logs(): void
    {
        $admin = User::where('email', 'admin@casanuma.com')->first();

        // 1. Create User action
        $this->actingAs($admin)->post('/users', [
            'name' => 'Audit Test User',
            'email' => 'audit.test@casanuma.com',
            'password' => 'password123',
            'role' => 'sales_agent',
        ]);

        $newUser = User::where('email', 'audit.test@casanuma.com')->first();
        $this->assertNotNull($newUser);

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'user_create',
            'subject_id' => $newUser->id,
            'user_id' => $admin->id,
        ]);

        // 2. Update User action
        $this->actingAs($admin)->put("/users/{$newUser->id}", [
            'name' => 'Audit Test User Updated',
            'email' => 'audit.test@casanuma.com',
            'role' => 'sales_agent',
        ]);

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'user_update',
            'subject_id' => $newUser->id,
        ]);

        // 3. Reset Password action
        $this->actingAs($admin)->patch("/users/{$newUser->id}/reset-password", [
            'password' => 'NewPassword2026!',
            'password_confirmation' => 'NewPassword2026!',
        ]);

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'password_reset',
            'subject_id' => $newUser->id,
        ]);

        // 4. Toggle status action
        $this->actingAs($admin)->patch("/users/{$newUser->id}/toggle-status");

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'status_toggle',
            'subject_id' => $newUser->id,
        ]);

        // 5. Delete user action
        $this->actingAs($admin)->delete("/users/{$newUser->id}");

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'user_delete',
        ]);
    }
}
