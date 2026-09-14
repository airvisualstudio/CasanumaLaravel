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
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique()->index();
            $table->text('value')->nullable();
            $table->string('type')->default('string'); // string, boolean, json, integer
            $table->string('group')->default('general')->index(); // telegram, general, notification
            $table->timestamps();
        });

        // Seed initial Telegram settings keys
        $now = now();
        DB::table('system_settings')->insert([
            [
                'key' => 'telegram_bot_token',
                'value' => null,
                'type' => 'string',
                'group' => 'telegram',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'key' => 'telegram_chat_id',
                'value' => null,
                'type' => 'string',
                'group' => 'telegram',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'key' => 'telegram_notifications_enabled',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'telegram',
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
        Schema::dropIfExists('system_settings');
    }
};
