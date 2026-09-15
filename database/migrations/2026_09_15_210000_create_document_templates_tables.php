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
        // 1. Document Templates Master
        Schema::create('document_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->string('category', 50)->default('custom'); // receipt, spr, ppjb, bast, invitation, notification, custom
            $table->text('description')->nullable();

            // Paper & Canvas Sizing
            $table->string('paper_size', 30)->default('a4'); // a4, f4, letter, legal, custom
            $table->unsignedSmallInteger('custom_width_mm')->nullable(); // in mm
            $table->unsignedSmallInteger('custom_height_mm')->nullable(); // in mm
            $table->string('orientation', 20)->default('portrait'); // portrait, landscape
            $table->unsignedSmallInteger('margin_top_mm')->default(20);
            $table->unsignedSmallInteger('margin_bottom_mm')->default(20);
            $table->unsignedSmallInteger('margin_left_mm')->default(25);
            $table->unsignedSmallInteger('margin_right_mm')->default(20);

            // Letterhead (Kop Surat) Configuration
            $table->string('letterhead_mode', 30)->default('default_company'); // default_company, custom_builder, custom_image, none
            $table->string('letterhead_logo')->nullable();
            $table->string('letterhead_title')->nullable();
            $table->string('letterhead_subtitle')->nullable();
            $table->text('letterhead_address')->nullable();
            $table->string('letterhead_contact')->nullable();
            $table->string('letterhead_image')->nullable(); // Full-width custom image banner

            // Content & Footer
            $table->longText('content_html');
            $table->text('footer_text')->nullable();
            $table->boolean('is_default')->default(false);

            // Audit
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['category', 'is_default']);
        });

        // 2. Generated Documents Record
        Schema::create('generated_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_template_id')->nullable()->constrained('document_templates')->onDelete('set null');
            $table->string('document_number', 100);
            $table->string('title', 200);
            $table->string('category', 50)->default('custom');
            $table->foreignId('booking_id')->nullable()->constrained('bookings')->onDelete('cascade');
            $table->foreignId('lead_id')->nullable()->constrained('leads')->onDelete('cascade');
            $table->foreignId('receipt_id')->nullable()->constrained('receipts')->onDelete('set null');
            $table->longText('rendered_html');
            $table->string('pdf_path')->nullable();
            $table->string('paper_size', 30)->default('a4');
            $table->string('orientation', 20)->default('portrait');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->index(['category', 'document_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('generated_documents');
        Schema::dropIfExists('document_templates');
    }
};
