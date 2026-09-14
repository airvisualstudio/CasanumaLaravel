<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RoleTest extends TestCase
{
    use RefreshDatabase;

    public function test_base_roles_and_users_are_seeded(): void
    {
        $this->seed();

        $expectedRoles = ['superadmin', 'sales_manager', 'sales_agent', 'finance'];

        foreach ($expectedRoles as $roleName) {
            $this->assertDatabaseHas('roles', [
                'name' => $roleName,
                'guard_name' => 'web',
            ]);
        }

        $admin = User::where('email', 'admin@casanuma.com')->first();
        $this->assertNotNull($admin);
        $this->assertTrue($admin->hasRole('superadmin'));

        $manager = User::where('email', 'manager@casanuma.com')->first();
        $this->assertNotNull($manager);
        $this->assertTrue($manager->hasRole('sales_manager'));

        $sales = User::where('email', 'sales@casanuma.com')->first();
        $this->assertNotNull($sales);
        $this->assertTrue($sales->hasRole('sales_agent'));

        $finance = User::where('email', 'finance@casanuma.com')->first();
        $this->assertNotNull($finance);
        $this->assertTrue($finance->hasRole('finance'));
    }

    public function test_inertia_share_contains_user_roles(): void
    {
        $this->seed();

        $admin = User::where('email', 'admin@casanuma.com')->first();

        $response = $this->actingAs($admin)->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('auth.user.roles.0', 'superadmin')
            ->has('auth.user.permissions')
        );
    }
}
