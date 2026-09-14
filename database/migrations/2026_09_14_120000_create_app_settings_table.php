<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('app_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique()->index();
            $table->text('value')->nullable();
            $table->string('type')->default('string'); // string, boolean, json, integer
            $table->string('group')->default('general')->index(); // general, branding, etc.
            $table->timestamps();
        });

        // Seed initial default general & branding settings
        $now = now();
        DB::table('app_settings')->insert([
            [
                'key' => 'app_name',
                'value' => 'CASANUMA CRM',
                'type' => 'string',
                'group' => 'general',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'key' => 'company_name',
                'value' => 'PT Casanuma Modern Living',
                'type' => 'string',
                'group' => 'general',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'key' => 'app_description',
                'value' => 'Sistem Manajemen Penjualan & Properti Terpadu',
                'type' => 'string',
                'group' => 'general',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'key' => 'logo_light',
                'value' => null,
                'type' => 'string',
                'group' => 'branding',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'key' => 'logo_dark',
                'value' => null,
                'type' => 'string',
                'group' => 'branding',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'key' => 'favicon',
                'value' => null,
                'type' => 'string',
                'group' => 'branding',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_settings');
    }
};
