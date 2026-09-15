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
        // 1. Receipts — Master kwitansi (multi-step approval)
        Schema::create('receipts', function (Blueprint $table) {
            $table->id();
            $table->string('receipt_number', 80)->nullable()->unique();
            $table->foreignId('booking_id')->constrained('bookings')->onDelete('cascade');
            $table->foreignId('lead_id')->constrained('leads')->onDelete('cascade');
            $table->string('payment_type', 30); // booking_fee, dp, installment, pelunasan
            $table->decimal('amount', 15, 2);
            $table->string('payment_method', 30)->nullable(); // transfer_bank, cash, cheque
            $table->string('bank_name', 80)->nullable();
            $table->string('transfer_proof')->nullable();
            $table->date('payment_date');
            $table->text('notes')->nullable();

            // Multi-step approval status
            $table->string('status', 30)->default('submitted');
            // Status flow: submitted → finance_review → finance_approved → manager_approved → rejected

            // Step 1: Sales submits
            $table->foreignId('submitted_by')->constrained('users')->onDelete('cascade');
            $table->timestamp('submitted_at')->nullable();

            // Step 2: Finance reviews
            $table->foreignId('reviewed_by_finance_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('reviewed_by_finance_at')->nullable();
            $table->string('finance_receipt_number', 80)->nullable(); // Nomor kwitansi resmi dari finance
            $table->text('finance_notes')->nullable();

            // Step 3: Manager approves
            $table->foreignId('approved_by_manager_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_by_manager_at')->nullable();

            // Rejection
            $table->text('rejection_reason')->nullable();
            $table->foreignId('rejected_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('rejected_at')->nullable();

            // QR Code verification
            $table->string('qr_code_token', 64)->nullable()->unique();
            $table->string('qr_code_url')->nullable();
            $table->string('pdf_path')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes for performance
            $table->index(['status', 'submitted_by']);
            $table->index('payment_date');
        });

        // 2. Receipt Status Logs — Audit trail per kwitansi
        Schema::create('receipt_status_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('receipt_id')->constrained('receipts')->onDelete('cascade');
            $table->string('from_status', 30)->nullable();
            $table->string('to_status', 30);
            $table->foreignId('changed_by')->constrained('users')->onDelete('cascade');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('receipt_id');
        });

        // 3. Laravel Notifications table (if not exists)
        if (! Schema::hasTable('notifications')) {
            Schema::create('notifications', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('type');
                $table->morphs('notifiable');
                $table->text('data');
                $table->timestamp('read_at')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('receipt_status_logs');
        Schema::dropIfExists('receipts');

        // Only drop notifications if we created it
        // Schema::dropIfExists('notifications');
    }
};
