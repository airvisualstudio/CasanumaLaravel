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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('booking_code', 60)->unique();
            $table->foreignId('lead_id')->constrained('leads')->onDelete('cascade');
            $table->foreignId('housing_unit_id')->constrained('housing_units')->onDelete('cascade');
            $table->foreignId('sales_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('payment_scheme', 30); // cash, kpr, cash_bertahap
            $table->decimal('booking_fee', 15, 2);
            $table->string('transfer_proof')->nullable();
            $table->date('transaction_date');
            $table->string('status', 30)->default('confirmed'); // confirmed, cancelled, completed
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::table('clusters', function (Blueprint $table) {
            $table->string('siteplan_svg')->nullable()->after('siteplan_image');
        });

        Schema::table('housing_projects', function (Blueprint $table) {
            $table->string('siteplan_svg')->nullable()->after('banner_image');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('housing_projects', function (Blueprint $table) {
            $table->dropColumn('siteplan_svg');
        });

        Schema::table('clusters', function (Blueprint $table) {
            $table->dropColumn('siteplan_svg');
        });

        Schema::dropIfExists('bookings');
    }
};
