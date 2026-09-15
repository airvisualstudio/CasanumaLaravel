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
            $table->boolean('is_archived')->default(false)->index()->after('status');
            $table->timestamp('archived_at')->nullable()->after('is_archived');
            $table->string('archive_reason', 255)->nullable()->after('archived_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropIndex(['is_archived']);
            $table->dropColumn([
                'is_archived',
                'archived_at',
                'archive_reason',
            ]);
        });
    }
};
