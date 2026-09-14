<?php

namespace Tests\Feature;

use App\Models\Cluster;
use App\Models\Developer;
use App\Models\HousingProject;
use App\Models\HousingUnit;
use App\Models\UnitType;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PropertyDetailTest extends TestCase
{
    use RefreshDatabase;

    protected User $superAdmin;
    protected HousingProject $project;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);

        $this->superAdmin = User::factory()->create();
        $this->superAdmin->assignRole('superadmin');

        $developer = Developer::create([
            'name' => 'PT Test Developer',
            'is_active' => true,
        ]);

        $this->project = HousingProject::create([
            'developer_id' => $developer->id,
            'name' => 'Test Residence',
            'city' => 'Bandung',
            'area_size' => 10000,
            'area_unit' => 'm²',
            'status' => 'active',
        ]);
    }

    public function test_can_view_clusters_and_unit_types_page(): void
    {
        $response = $this->actingAs($this->superAdmin)->get(route('clusters.index'));
        $response->assertStatus(200);
    }

    public function test_can_create_update_and_delete_cluster(): void
    {
        // 1. Create
        $response = $this->actingAs($this->superAdmin)->post(route('clusters.store'), [
            'housing_project_id' => $this->project->id,
            'name' => 'Cluster Sakura',
            'code' => 'SKR',
            'description' => 'Cluster bertema Jepang',
            'is_active' => true,
        ]);
        $response->assertRedirect();
        $this->assertDatabaseHas('clusters', ['name' => 'Cluster Sakura', 'code' => 'SKR']);

        $cluster = Cluster::where('name', 'Cluster Sakura')->first();

        // 2. Update
        $updateResponse = $this->actingAs($this->superAdmin)->put(route('clusters.update', $cluster->id), [
            'housing_project_id' => $this->project->id,
            'name' => 'Cluster Sakura Garden',
            'code' => 'SKRG',
            'description' => 'Cluster terupdate',
            'is_active' => true,
        ]);
        $updateResponse->assertRedirect();
        $this->assertDatabaseHas('clusters', ['name' => 'Cluster Sakura Garden', 'code' => 'SKRG']);

        // 3. Delete
        $deleteResponse = $this->actingAs($this->superAdmin)->delete(route('clusters.destroy', $cluster->id));
        $deleteResponse->assertRedirect();
        $this->assertSoftDeleted('clusters', ['id' => $cluster->id]);
    }

    public function test_can_create_update_and_delete_unit_type(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->create('brochure.pdf', 500, 'application/pdf');

        // 1. Create
        $response = $this->actingAs($this->superAdmin)->post(route('unit-types.store'), [
            'housing_project_id' => $this->project->id,
            'name' => 'Tipe 45/90',
            'surface_area' => 90,
            'building_area' => 45,
            'bedrooms' => 2,
            'bathrooms' => 1,
            'electricity' => '2200 VA',
            'description' => 'Desain minimalis',
            'brochure_file' => $file,
        ]);
        $response->assertRedirect();
        $this->assertDatabaseHas('unit_types', ['name' => 'Tipe 45/90']);

        $unitType = UnitType::where('name', 'Tipe 45/90')->first();
        $this->assertNotNull($unitType->brochure_file);
        Storage::disk('public')->assertExists($unitType->brochure_file);

        // 2. Delete
        $deleteResponse = $this->actingAs($this->superAdmin)->delete(route('unit-types.destroy', $unitType->id));
        $deleteResponse->assertRedirect();
        $this->assertSoftDeleted('unit_types', ['id' => $unitType->id]);
    }

    public function test_can_view_and_manage_housing_units_with_svg_id(): void
    {
        $cluster = Cluster::create([
            'housing_project_id' => $this->project->id,
            'name' => 'Cluster Jasmine',
            'code' => 'JSM',
            'is_active' => true,
        ]);

        $unitType = UnitType::create([
            'housing_project_id' => $this->project->id,
            'cluster_id' => $cluster->id,
            'name' => 'Tipe 36/60',
            'surface_area' => 60,
            'building_area' => 36,
            'bedrooms' => 2,
            'bathrooms' => 1,
        ]);

        // 1. View Index
        $viewResponse = $this->actingAs($this->superAdmin)->get(route('units.index'));
        $viewResponse->assertStatus(200);

        // 2. Create Unit
        $createResponse = $this->actingAs($this->superAdmin)->post(route('units.store'), [
            'cluster_id' => $cluster->id,
            'unit_type_id' => $unitType->id,
            'block' => 'B2',
            'unit_number' => '15',
            'unit_code' => 'B2/15',
            'base_price' => 475000000,
            'status' => 'available',
            'svg_element_id' => 'lot-b2-15',
            'notes' => 'Dekat taman bermain',
        ]);
        $createResponse->assertRedirect();
        $this->assertDatabaseHas('housing_units', [
            'unit_code' => 'B2/15',
            'svg_element_id' => 'lot-b2-15',
            'status' => 'available',
        ]);

        $unit = HousingUnit::where('unit_code', 'B2/15')->first();

        // 3. Update Status
        $patchResponse = $this->actingAs($this->superAdmin)->patch(route('units.update-status', $unit->id), [
            'status' => 'booked',
        ]);
        $patchResponse->assertRedirect();
        $this->assertDatabaseHas('housing_units', [
            'id' => $unit->id,
            'status' => 'booked',
        ]);

        // 4. Update Unit
        $updateResponse = $this->actingAs($this->superAdmin)->put(route('units.update', $unit->id), [
            'cluster_id' => $cluster->id,
            'unit_type_id' => $unitType->id,
            'block' => 'B2',
            'unit_number' => '15',
            'unit_code' => 'B2/15',
            'base_price' => 485000000,
            'status' => 'booked',
            'svg_element_id' => 'lot-b2-15-updated',
        ]);
        $updateResponse->assertRedirect();
        $this->assertDatabaseHas('housing_units', [
            'id' => $unit->id,
            'svg_element_id' => 'lot-b2-15-updated',
            'base_price' => 485000000,
        ]);

        // 5. Delete Unit
        $deleteResponse = $this->actingAs($this->superAdmin)->delete(route('units.destroy', $unit->id));
        $deleteResponse->assertRedirect();
        $this->assertSoftDeleted('housing_units', ['id' => $unit->id]);
    }
}
