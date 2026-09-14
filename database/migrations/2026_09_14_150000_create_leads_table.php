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
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('developer_id')->nullable()->constrained('developers')->onDelete('cascade');
            $table->foreignId('housing_project_id')->constrained('housing_projects')->onDelete('cascade');
            $table->foreignId('sales_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('name'); // Nama Lengkap Konsumen
            $table->string('whatsapp', 50); // No WhatsApp
            $table->string('email')->nullable(); // Email
            $table->text('address')->nullable(); // Alamat / Kota
            $table->string('source', 100)->default('Walk-in / Pameran'); // Sumber Lead
            $table->string('status', 30)->default('new'); // new, contacted, survey_visit, booking, rejected
            $table->text('notes')->nullable(); // Catatan preferensi & kebutuhan unit
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
