<?php

namespace Tests\Feature;

use App\Models\Developer;
use App\Models\HousingProject;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PropertyMasterTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
        $this->seed(UserSeeder::class);
    }

    public function test_guest_cannot_access_property_master(): void
    {
        $this->get('/properties')->assertRedirect('/login');
    }

    public function test_user_without_view_units_permission_cannot_access(): void
    {
        $finance = User::where('email', 'finance@casanuma.com')->first();
        $this->actingAs($finance)->get('/properties')->assertForbidden();
    }

    public function test_authorized_user_can_view_property_master_index(): void
    {
        $admin = User::where('email', 'admin@casanuma.com')->first();
        $manager = User::where('email', 'manager@casanuma.com')->first();
        $sales = User::where('email', 'sales@casanuma.com')->first();

        // Create sample developer & project
        $developer = Developer::create([
            'name' => 'PT Casanuma Land Property',
            'npwp' => '01.234.567.8-901.000',
            'office_address' => 'Jl. Boulevard No. 1, Bandung',
            'phone' => '022-88776655',
            'bank_name' => 'BCA',
            'bank_account_number' => '1234567890',
            'bank_account_holder' => 'PT Casanuma Land Property',
            'is_active' => true,
        ]);

        HousingProject::create([
            'developer_id' => $developer->id,
            'name' => 'Casanuma Grand Residence',
            'city' => 'Bandung Barat',
            'address' => 'Jl. Kolonel Masturi No. 99',
            'area_size' => 35000,
            'area_unit' => 'm²',
            'status' => 'active',
        ]);

        // Superadmin access
        $response = $this->actingAs($admin)->get('/properties');
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Properties/Index')
            ->has('developers')
            ->has('projects')
            ->has('stats')
        );

        // Sales Manager access
        $this->actingAs($manager)->get('/properties')->assertOk();

        // Sales Agent access (view only)
        $this->actingAs($sales)->get('/properties')->assertOk();
    }

    public function test_can_create_developer_with_logo(): void
    {
        Storage::fake('public');
        $admin = User::where('email', 'admin@casanuma.com')->first();

        $logo = UploadedFile::fake()->create('pt_logo.png', 100, 'image/png');

        $response = $this->actingAs($admin)->post('/developers', [
            'name' => 'PT Graha Sinergi Sentosa',
            'npwp' => '09.876.543.2-100.000',
            'office_address' => 'Gedung Sinergi Lt. 5, Jl. Sudirman Jakarta',
            'phone' => '021-99887766',
            'bank_name' => 'Bank Mandiri',
            'bank_account_number' => '123000998877',
            'bank_account_holder' => 'PT Graha Sinergi Sentosa',
            'is_active' => '1',
            'logo' => $logo,
        ]);

        $response->assertRedirect(route('properties.index', ['tab' => 'developers']));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('developers', [
            'name' => 'PT Graha Sinergi Sentosa',
            'npwp' => '09.876.543.2-100.000',
            'bank_name' => 'Bank Mandiri',
        ]);

        $developer = Developer::where('name', 'PT Graha Sinergi Sentosa')->first();
        $this->assertNotNull($developer->logo);
        Storage::disk('public')->assertExists($developer->logo);
    }

    public function test_can_update_developer(): void
    {
        $admin = User::where('email', 'admin@casanuma.com')->first();

        $developer = Developer::create([
            'name' => 'PT Awal Sejahtera',
            'phone' => '021-11112222',
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->put("/developers/{$developer->id}", [
            'name' => 'PT Awal Sejahtera Makmur',
            'phone' => '021-33334444',
            'office_address' => 'Jl. Baru No. 10',
            'bank_name' => 'BCA',
            'bank_account_number' => '888001122',
            'bank_account_holder' => 'PT Awal Sejahtera Makmur',
            'is_active' => '1',
        ]);

        $response->assertRedirect(route('properties.index', ['tab' => 'developers']));
        $this->assertDatabaseHas('developers', [
            'id' => $developer->id,
            'name' => 'PT Awal Sejahtera Makmur',
            'phone' => '021-33334444',
        ]);
    }

    public function test_can_delete_developer(): void
    {
        $admin = User::where('email', 'admin@casanuma.com')->first();

        $developer = Developer::create([
            'name' => 'PT Yang Akan Dihapus',
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->delete("/developers/{$developer->id}");

        $response->assertRedirect(route('properties.index', ['tab' => 'developers']));
        $this->assertDatabaseMissing('developers', [
            'id' => $developer->id,
        ]);
    }

    public function test_can_create_housing_project_with_banner(): void
    {
        Storage::fake('public');
        $admin = User::where('email', 'admin@casanuma.com')->first();

        $developer = Developer::create([
            'name' => 'PT Casanuma Utama',
            'is_active' => true,
        ]);

        $banner = UploadedFile::fake()->create('project_banner.jpg', 200, 'image/jpeg');

        $response = $this->actingAs($admin)->post('/housing-projects', [
            'developer_id' => $developer->id,
            'name' => 'Casanuma Highland View',
            'city' => 'Bandung',
            'address' => 'Jl. Panorama Hills No. 10',
            'area_size' => 50000,
            'area_unit' => 'm²',
            'description' => 'Perumahan mewah dengan view 360 kota Bandung',
            'status' => 'active',
            'banner_image' => $banner,
        ]);

        $response->assertRedirect(route('properties.index', ['tab' => 'projects']));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('housing_projects', [
            'developer_id' => $developer->id,
            'name' => 'Casanuma Highland View',
            'city' => 'Bandung',
            'status' => 'active',
        ]);

        $project = HousingProject::where('name', 'Casanuma Highland View')->first();
        $this->assertNotNull($project->banner_image);
        Storage::disk('public')->assertExists($project->banner_image);
    }

    public function test_can_update_housing_project(): void
    {
        $admin = User::where('email', 'admin@casanuma.com')->first();

        $developer = Developer::create([
            'name' => 'PT Casanuma Developer',
            'is_active' => true,
        ]);

        $project = HousingProject::create([
            'developer_id' => $developer->id,
            'name' => 'Proyek Lama',
            'city' => 'Bandung',
            'area_size' => 10000,
            'area_unit' => 'm²',
            'status' => 'planning',
        ]);

        $response = $this->actingAs($admin)->put("/housing-projects/{$project->id}", [
            'developer_id' => $developer->id,
            'name' => 'Proyek Baru Rebranded',
            'city' => 'Bandung Barat',
            'area_size' => 15000,
            'area_unit' => 'm²',
            'status' => 'active',
        ]);

        $response->assertRedirect(route('properties.index', ['tab' => 'projects']));
        $this->assertDatabaseHas('housing_projects', [
            'id' => $project->id,
            'name' => 'Proyek Baru Rebranded',
            'city' => 'Bandung Barat',
            'status' => 'active',
        ]);
    }

    public function test_can_delete_housing_project(): void
    {
        $admin = User::where('email', 'admin@casanuma.com')->first();

        $developer = Developer::create([
            'name' => 'PT Casanuma Developer',
            'is_active' => true,
        ]);

        $project = HousingProject::create([
            'developer_id' => $developer->id,
            'name' => 'Proyek Siap Hapus',
            'city' => 'Cimahi',
            'status' => 'planning',
        ]);

        $response = $this->actingAs($admin)->delete("/housing-projects/{$project->id}");

        $response->assertRedirect(route('properties.index', ['tab' => 'projects']));
        $this->assertDatabaseMissing('housing_projects', [
            'id' => $project->id,
        ]);
    }
}
