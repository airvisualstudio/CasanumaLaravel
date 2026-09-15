<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->string('slik_status', 30)->default('clear')->nullable()->after('monthly_income');
            $table->string('spouse_nik', 30)->nullable()->after('spouse_name');
            $table->decimal('max_budget', 15, 2)->nullable()->after('spouse_nik');
            $table->string('preferred_unit_type', 100)->nullable()->after('max_budget');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropColumn([
                'slik_status',
                'spouse_nik',
                'max_budget',
                'preferred_unit_type',
            ]);
        });
    }
};
