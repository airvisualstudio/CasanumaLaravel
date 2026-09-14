<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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

    public function test_superadmin_can_update_user_and_role(): void
    {
        $admin = User::where('email', 'admin@casanuma.com')->first();
        $sales = User::where('email', 'sales@casanuma.com')->first();

        $response = $this->actingAs($admin)->put("/users/{$sales->id}", [
            'name' => 'Sales Dipromosikan',
            'email' => 'sales@casanuma.com',
            'role' => 'sales_manager',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'id' => $sales->id,
            'name' => 'Sales Dipromosikan',
        ]);

        $sales->refresh();
        $this->assertTrue($sales->hasRole('sales_manager'));
        $this->assertFalse($sales->hasRole('sales_agent'));
    }

    public function test_superadmin_can_delete_user(): void
    {
        $admin = User::where('email', 'admin@casanuma.com')->first();
        $sales = User::where('email', 'sales@casanuma.com')->first();

        $response = $this->actingAs($admin)->delete("/users/{$sales->id}");

        $response->assertRedirect();
        $this->assertDatabaseMissing('users', [
            'id' => $sales->id,
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
}
