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
        Schema::create('unit_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('housing_project_id')->constrained('housing_projects')->onDelete('cascade');
            $table->foreignId('cluster_id')->nullable()->constrained('clusters')->onDelete('set null');
            $table->string('name'); // Nama Tipe Unit (misal: 36/60, 45/84, Villa 2 Lantai)
            $table->decimal('surface_area', 10, 2); // Luas Tanah (m²)
            $table->decimal('building_area', 10, 2); // Luas Bangunan (m²)
            $table->integer('bedrooms')->default(2); // Jumlah Kamar Tidur
            $table->integer('bathrooms')->default(1); // Jumlah Kamar Mandi
            $table->string('electricity', 50)->nullable(); // Daya Listrik (misal: 1300 VA, 2200 VA)
            $table->string('brochure_file')->nullable(); // Brosur / Denah 2D/3D (Storage disk public)
            $table->text('description')->nullable(); // Spesifikasi Teknis Bangunan
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('unit_types');
    }
};
