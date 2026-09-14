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
        Schema::create('housing_units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cluster_id')->constrained('clusters')->onDelete('cascade');
            $table->foreignId('unit_type_id')->constrained('unit_types')->onDelete('restrict');
            $table->string('block', 30); // Blok (misal: A1, B)
            $table->string('unit_number', 30); // Nomor Unit (misal: 05, 12A)
            $table->string('unit_code', 60); // Gabungan Kode (misal: A1/05)
            $table->decimal('base_price', 15, 2); // Harga Dasar Unit (Rupiah)
            $table->string('status', 20)->default('available'); // available, booked, sold, hold
            $table->string('svg_element_id', 100)->nullable()->unique(); // ID elemen SVG denah interaktif
            $table->text('notes')->nullable(); // Catatan khusus kavling/unit
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('housing_units');
    }
};
