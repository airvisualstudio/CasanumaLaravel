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
        Schema::create('clusters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('housing_project_id')->constrained('housing_projects')->onDelete('cascade');
            $table->string('name'); // Nama Cluster (misal: Cluster Lavender)
            $table->string('code', 30)->nullable(); // Kode Cluster (misal: LVD)
            $table->text('description')->nullable();
            $table->string('siteplan_image')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clusters');
    }
};
