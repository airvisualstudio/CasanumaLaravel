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
        Schema::create('housing_projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('developer_id')->constrained('developers')->onDelete('cascade');
            $table->string('name'); // Nama Proyek Perumahan
            $table->string('city'); // Kota / Wilayah
            $table->text('address')->nullable(); // Alamat Lengkap
            $table->decimal('area_size', 12, 2)->nullable(); // Total Luas Kawasan
            $table->string('area_unit', 20)->default('m²'); // Satuan Luas: m² atau Ha
            $table->string('banner_image')->nullable(); // Banner / Foto Proyek
            $table->text('description')->nullable();
            $table->string('status', 30)->default('active'); // planning, active, sold_out
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('housing_projects');
    }
};
