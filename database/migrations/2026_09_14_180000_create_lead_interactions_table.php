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
        // Add follow-up tracking columns to leads table if not already present
        Schema::table('leads', function (Blueprint $table) {
            if (! Schema::hasColumn('leads', 'next_follow_up_date')) {
                $table->timestamp('next_follow_up_date')->nullable()->after('notes');
            }
            if (! Schema::hasColumn('leads', 'last_interaction_at')) {
                $table->timestamp('last_interaction_at')->nullable()->after('next_follow_up_date');
            }
        });

        // Create lead_interactions table for interaction logs & tree timeline
        Schema::create('lead_interactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lead_id')->constrained('leads')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('channel', 30)->default('whatsapp'); // whatsapp, phone, meeting, email, other
            $table->string('stage_at_interaction', 30)->default('new');
            $table->text('notes');
            $table->timestamp('interaction_date');
            $table->timestamp('next_follow_up_date')->nullable();
            $table->string('next_follow_up_note')->nullable();
            $table->boolean('is_reminder_completed')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lead_interactions');

        Schema::table('leads', function (Blueprint $table) {
            if (Schema::hasColumn('leads', 'next_follow_up_date')) {
                $table->dropColumn('next_follow_up_date');
            }
            if (Schema::hasColumn('leads', 'last_interaction_at')) {
                $table->dropColumn('last_interaction_at');
            }
        });
    }
};
