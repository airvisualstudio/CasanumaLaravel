<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\AppSetting;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class GeneralSettingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
        $this->seed(UserSeeder::class);
    }

    public function test_superadmin_can_view_general_settings_page(): void
    {
        $admin = User::where('email', 'admin@casanuma.com')->first();

        $response = $this->actingAs($admin)->get('/settings/general');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Settings/General')
            ->has('settings')
            ->has('app_settings')
            ->where('app_settings.app_name', 'CASANUMA CRM')
        );
    }

    public function test_non_superadmin_cannot_access_general_settings(): void
    {
        $sales = User::where('email', 'sales@casanuma.com')->first();
        $finance = User::where('email', 'finance@casanuma.com')->first();

        $this->actingAs($sales)->get('/settings/general')->assertForbidden();
        $this->actingAs($finance)->get('/settings/general')->assertForbidden();
    }

    public function test_superadmin_can_update_text_settings(): void
    {
        $admin = User::where('email', 'admin@casanuma.com')->first();

        $response = $this->actingAs($admin)->post('/settings/general', [
            'app_name' => 'KAVLINGKU CRM',
            'company_name' => 'PT Graha Pratama Makmur',
            'app_description' => 'Solusi penjualan properti terdepan di Indonesia',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertEquals('KAVLINGKU CRM', AppSetting::get('app_name'));
        $this->assertEquals('PT Graha Pratama Makmur', AppSetting::get('company_name'));
        $this->assertEquals('Solusi penjualan properti terdepan di Indonesia', AppSetting::get('app_description'));

        // Verify Activity Log recorded
        $this->assertDatabaseHas('activity_logs', [
            'action' => 'settings_update',
            'user_id' => $admin->id,
        ]);
    }

    public function test_superadmin_can_upload_and_remove_logos_and_favicon(): void
    {
        Storage::fake('public');

        $admin = User::where('email', 'admin@casanuma.com')->first();

        $logoLight = UploadedFile::fake()->create('logo_light.png', 100, 'image/png');
        $logoDark = UploadedFile::fake()->create('logo_dark.png', 100, 'image/png');
        $favicon = UploadedFile::fake()->create('favicon.png', 50, 'image/png');

        $response = $this->actingAs($admin)->post('/settings/general', [
            'app_name' => 'KAVLINGKU CRM',
            'company_name' => 'PT Graha Pratama Makmur',
            'logo_light' => $logoLight,
            'logo_dark' => $logoDark,
            'favicon' => $favicon,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $savedLight = AppSetting::get('logo_light');
        $savedDark = AppSetting::get('logo_dark');
        $savedFavicon = AppSetting::get('favicon');

        $this->assertNotNull($savedLight);
        $this->assertNotNull($savedDark);
        $this->assertNotNull($savedFavicon);

        Storage::disk('public')->assertExists($savedLight);
        Storage::disk('public')->assertExists($savedDark);
        Storage::disk('public')->assertExists($savedFavicon);

        // Test removing logo light and favicon
        $responseRemove = $this->actingAs($admin)->post('/settings/general', [
            'app_name' => 'KAVLINGKU CRM',
            'company_name' => 'PT Graha Pratama Makmur',
            'remove_logo_light' => true,
            'remove_favicon' => true,
        ]);

        $responseRemove->assertRedirect();
        $this->assertNull(AppSetting::get('logo_light'));
        $this->assertNull(AppSetting::get('favicon'));
        $this->assertNotNull(AppSetting::get('logo_dark')); // dark should remain

        Storage::disk('public')->assertMissing($savedLight);
        Storage::disk('public')->assertMissing($savedFavicon);
        Storage::disk('public')->assertExists($savedDark);
    }

    public function test_app_settings_are_shared_globally_via_inertia(): void
    {
        AppSetting::set('app_name', 'CUSTOM BRAND CRM', 'general');

        $admin = User::where('email', 'admin@casanuma.com')->first();

        $response = $this->actingAs($admin)->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('app_settings')
            ->where('app_settings.app_name', 'CUSTOM BRAND CRM')
        );
    }
}
