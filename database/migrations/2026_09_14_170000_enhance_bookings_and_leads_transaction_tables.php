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
        Schema::table('leads', function (Blueprint $table) {
            $table->string('nik', 30)->nullable()->after('email');
            $table->string('npwp', 30)->nullable()->after('nik');
            $table->string('kk_number', 30)->nullable()->after('npwp');
            $table->string('job_type', 50)->nullable()->after('kk_number');
            $table->string('company_name', 150)->nullable()->after('job_type');
            $table->decimal('monthly_income', 15, 2)->nullable()->after('company_name');
            $table->string('marital_status', 30)->nullable()->after('monthly_income');
            $table->string('spouse_name', 150)->nullable()->after('marital_status');
            $table->string('emergency_contact_name', 150)->nullable()->after('spouse_name');
            $table->string('emergency_contact_relation', 50)->nullable()->after('emergency_contact_name');
            $table->string('emergency_contact_phone', 50)->nullable()->after('emergency_contact_relation');
            $table->string('id_card_file')->nullable()->after('emergency_contact_phone');
            $table->string('npwp_file')->nullable()->after('id_card_file');
            $table->string('kk_file')->nullable()->after('npwp_file');
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->string('spr_number', 60)->nullable()->unique()->after('booking_code');
            $table->date('spr_date')->nullable()->after('spr_number');
            $table->decimal('base_price', 15, 2)->nullable()->after('payment_scheme');
            $table->decimal('additional_price', 15, 2)->default(0)->after('base_price');
            $table->decimal('discount_amount', 15, 2)->default(0)->after('additional_price');
            $table->decimal('legal_fees', 15, 2)->default(0)->after('discount_amount');
            $table->decimal('total_price', 15, 2)->nullable()->after('legal_fees');
            $table->decimal('dp_amount', 15, 2)->default(0)->after('booking_fee');
            $table->integer('dp_installments_count')->default(1)->after('dp_amount');
            $table->decimal('remaining_amount', 15, 2)->default(0)->after('dp_installments_count');
            $table->foreignId('approved_by_manager_id')->nullable()->after('status')->constrained('users')->onDelete('set null');
            $table->timestamp('approved_by_manager_at')->nullable()->after('approved_by_manager_id');
            $table->foreignId('approved_by_finance_id')->nullable()->after('approved_by_manager_at')->constrained('users')->onDelete('set null');
            $table->timestamp('approved_by_finance_at')->nullable()->after('approved_by_finance_id');
            $table->text('rejection_reason')->nullable()->after('notes');
        });

        Schema::create('booking_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->onDelete('cascade');
            $table->string('payment_number', 60)->unique();
            $table->string('payment_type', 30); // booking_fee, down_payment, installment, bank_disbursement, pelunasan
            $table->string('term_name', 100);
            $table->decimal('amount_due', 15, 2);
            $table->date('due_date');
            $table->decimal('amount_paid', 15, 2)->default(0);
            $table->date('payment_date')->nullable();
            $table->string('payment_method', 30)->nullable(); // transfer_bank, cash, cheque
            $table->string('bank_name', 60)->nullable();
            $table->string('payment_proof')->nullable();
            $table->string('status', 30)->default('unpaid'); // unpaid, pending_verification, verified, rejected
            $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('verified_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('kpr_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->onDelete('cascade');
            $table->string('bank_name', 80);
            $table->string('application_number', 80)->nullable();
            $table->decimal('submitted_amount', 15, 2)->default(0);
            $table->decimal('approved_amount', 15, 2)->default(0);
            $table->decimal('interest_rate', 5, 2)->nullable();
            $table->integer('tenor_years')->nullable();
            $table->string('current_stage', 40)->default('document_collection');
            $table->string('sp3k_number', 80)->nullable();
            $table->date('sp3k_date')->nullable();
            $table->string('sp3k_document')->nullable();
            $table->date('akad_date')->nullable();
            $table->string('notary_name', 150)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kpr_applications');
        Schema::dropIfExists('booking_payments');

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropForeign(['approved_by_manager_id']);
            $table->dropForeign(['approved_by_finance_id']);
            $table->dropColumn([
                'spr_number',
                'spr_date',
                'base_price',
                'additional_price',
                'discount_amount',
                'legal_fees',
                'total_price',
                'dp_amount',
                'dp_installments_count',
                'remaining_amount',
                'approved_by_manager_id',
                'approved_by_manager_at',
                'approved_by_finance_id',
                'approved_by_finance_at',
                'rejection_reason',
            ]);
        });

        Schema::table('leads', function (Blueprint $table) {
            $table->dropColumn([
                'nik',
                'npwp',
                'kk_number',
                'job_type',
                'company_name',
                'monthly_income',
                'marital_status',
                'spouse_name',
                'emergency_contact_name',
                'emergency_contact_relation',
                'emergency_contact_phone',
                'id_card_file',
                'npwp_file',
                'kk_file',
            ]);
        });
    }
};
