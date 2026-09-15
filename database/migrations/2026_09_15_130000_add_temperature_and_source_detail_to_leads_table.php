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
            $table->string('lead_temperature', 20)->default('warm')->index()->after('source');
            $table->string('source_detail', 255)->nullable()->after('lead_temperature');
            $table->timestamp('sla_revoked_at')->nullable()->after('last_interaction_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropIndex(['lead_temperature']);
            $table->dropColumn([
                'lead_temperature',
                'source_detail',
                'sla_revoked_at',
            ]);
        });
    }
};
