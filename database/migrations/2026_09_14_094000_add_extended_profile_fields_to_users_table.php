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
        Schema::table('users', function (Blueprint $table) {
            // Info Pribadi
            $table->string('avatar')->nullable()->after('email');
            $table->string('phone', 30)->nullable()->after('avatar');
            $table->text('address')->nullable()->after('phone');
            $table->string('emergency_contact_name')->nullable()->after('address');
            $table->string('emergency_contact_phone', 30)->nullable()->after('emergency_contact_name');

            // Info Kerja
            $table->string('employee_id', 50)->nullable()->after('emergency_contact_phone');
            $table->string('position', 100)->nullable()->after('employee_id');
            $table->date('join_date')->nullable()->after('position');
            $table->boolean('is_active')->default(true)->after('join_date');

            // Info Keuangan (Pencairan Komisi)
            $table->string('bank_name', 100)->nullable()->after('is_active');
            $table->string('bank_account_number', 50)->nullable()->after('bank_name');
            $table->string('bank_account_holder', 255)->nullable()->after('bank_account_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'avatar',
                'phone',
                'address',
                'emergency_contact_name',
                'emergency_contact_phone',
                'employee_id',
                'position',
                'join_date',
                'is_active',
                'bank_name',
                'bank_account_number',
                'bank_account_holder',
            ]);
        });
    }
};
