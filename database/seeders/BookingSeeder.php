<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\BookingPayment;
use App\Models\HousingUnit;
use App\Models\KprApplication;
use App\Models\Lead;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class BookingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $salesAgent = User::role('sales_agent')->first() ?? User::first();
        $salesManager = User::role('sales_manager')->first() ?? User::first();
        $financeUser = User::role('finance')->first() ?? User::first();

        $leads = Lead::all();
        if ($leads->count() < 3) {
            return;
        }

        $units = HousingUnit::orderBy('id')->get();
        if ($units->count() < 4) {
            return;
        }

        // Update lead 1 with customer dossier legal info
        $lead1 = $leads[0];
        $lead1->update([
            'nik' => '3273011208850003',
            'npwp' => '09.345.678.9-428.000',
            'kk_number' => '3273012903100012',
            'job_type' => 'Karyawan Swasta',
            'company_name' => 'PT Astra International Tbk',
            'monthly_income' => 18500000,
            'marital_status' => 'married',
            'spouse_name' => 'Dewi Anggraini',
            'emergency_contact_name' => 'Bambang Sudibyo',
            'emergency_contact_relation' => 'Orang Tua',
            'emergency_contact_phone' => '081299887766',
        ]);

        $lead2 = $leads[1];
        $lead2->update([
            'nik' => '3204126504900002',
            'npwp' => '71.234.567.8-445.000',
            'kk_number' => '3204122105150008',
            'job_type' => 'Wiraswasta',
            'company_name' => 'CV Sumber Makmur Mandiri',
            'monthly_income' => 35000000,
            'marital_status' => 'married',
            'spouse_name' => 'Ferry Kusuma',
            'emergency_contact_name' => 'Ratna Juwita',
            'emergency_contact_relation' => 'Saudara Kandung',
            'emergency_contact_phone' => '085611223344',
        ]);

        $lead3 = $leads[2];
        $lead3->update([
            'nik' => '3273152203920005',
            'npwp' => '82.345.678.1-423.000',
            'kk_number' => '3273151408160001',
            'job_type' => 'PNS / BUMN',
            'company_name' => 'PT Telkom Indonesia',
            'monthly_income' => 14000000,
            'marital_status' => 'single',
            'emergency_contact_name' => 'Siti Aminah',
            'emergency_contact_relation' => 'Ibu Kandung',
            'emergency_contact_phone' => '081322334455',
        ]);

        // -------------------------------------------------------------
        // Transaksi 1: Skema KPR Bank (Status: kpr_process, SP3K terbit)
        // -------------------------------------------------------------
        $unit1 = $units[0];
        $basePrice1 = (float) $unit1->base_price;
        $additionalPrice1 = 15000000; // Posisi Hook
        $discount1 = 10000000; // Promo Launching
        $legalFees1 = 25000000; // BPHTB + Notaris
        $totalPrice1 = $basePrice1 + $additionalPrice1 - $discount1 + $legalFees1;
        $bookingFee1 = 5000000;
        $dpAmount1 = 50000000;
        $remaining1 = $totalPrice1 - $dpAmount1;

        $booking1 = Booking::updateOrCreate(
            ['booking_code' => 'BK-202609-0001'],
            [
                'spr_number' => 'SPR/CSN/2026/09/0001',
                'spr_date' => Carbon::now()->subDays(15)->format('Y-m-d'),
                'lead_id' => $lead1->id,
                'housing_unit_id' => $unit1->id,
                'sales_id' => $salesAgent->id,
                'payment_scheme' => 'kpr',
                'base_price' => $basePrice1,
                'additional_price' => $additionalPrice1,
                'discount_amount' => $discount1,
                'legal_fees' => $legalFees1,
                'total_price' => $totalPrice1,
                'booking_fee' => $bookingFee1,
                'dp_amount' => $dpAmount1,
                'dp_installments_count' => 2,
                'remaining_amount' => $remaining1,
                'transaction_date' => Carbon::now()->subDays(15)->format('Y-m-d'),
                'status' => 'kpr_process',
                'approved_by_manager_id' => $salesManager->id,
                'approved_by_manager_at' => Carbon::now()->subDays(14),
                'approved_by_finance_id' => $financeUser->id,
                'approved_by_finance_at' => Carbon::now()->subDays(14),
                'notes' => 'Konsumen telah melengkapi berkas KPR Bank BTN. Menunggu SP3K ditandatangani.',
            ]
        );
        $unit1->update(['status' => 'booked']);

        // Payments for Booking 1
        BookingPayment::updateOrCreate(
            ['payment_number' => 'KW-202609-0001'],
            [
                'booking_id' => $booking1->id,
                'payment_type' => 'booking_fee',
                'term_name' => 'Uang Tanda Jadi (Booking Fee)',
                'amount_due' => $bookingFee1,
                'due_date' => Carbon::now()->subDays(15)->format('Y-m-d'),
                'amount_paid' => $bookingFee1,
                'payment_date' => Carbon::now()->subDays(15)->format('Y-m-d'),
                'payment_method' => 'transfer_bank',
                'bank_name' => 'BCA',
                'status' => 'verified',
                'verified_by' => $financeUser->id,
                'verified_at' => Carbon::now()->subDays(14),
                'notes' => 'Tanda jadi terverifikasi di rekening koran developer.',
            ]
        );

        BookingPayment::updateOrCreate(
            ['payment_number' => 'KW-202609-0002'],
            [
                'booking_id' => $booking1->id,
                'payment_type' => 'down_payment',
                'term_name' => 'Uang Muka (DP) Termin 1',
                'amount_due' => 22500000,
                'due_date' => Carbon::now()->subDays(7)->format('Y-m-d'),
                'amount_paid' => 22500000,
                'payment_date' => Carbon::now()->subDays(6)->format('Y-m-d'),
                'payment_method' => 'transfer_bank',
                'bank_name' => 'Mandiri',
                'status' => 'verified',
                'verified_by' => $financeUser->id,
                'verified_at' => Carbon::now()->subDays(5),
                'notes' => 'DP Termin 1 valid.',
            ]
        );

        BookingPayment::updateOrCreate(
            ['payment_number' => 'KW-202609-0003'],
            [
                'booking_id' => $booking1->id,
                'payment_type' => 'down_payment',
                'term_name' => 'Uang Muka (DP) Termin 2',
                'amount_due' => 22500000,
                'due_date' => Carbon::now()->addDays(14)->format('Y-m-d'),
                'amount_paid' => 0,
                'status' => 'unpaid',
            ]
        );

        // KPR Application for Booking 1
        KprApplication::updateOrCreate(
            ['booking_id' => $booking1->id],
            [
                'bank_name' => 'Bank BTN Kantor Cabang Bandung',
                'application_number' => 'KPR-BTN-2026-8819',
                'submitted_amount' => $remaining1,
                'approved_amount' => $remaining1,
                'interest_rate' => 4.75,
                'tenor_years' => 15,
                'current_stage' => 'sp3k_issued',
                'sp3k_number' => 'SP3K/BTN/BDG/09/2026/044',
                'sp3k_date' => Carbon::now()->subDays(2)->format('Y-m-d'),
                'notary_name' => 'Irma Suryani, S.H., M.Kn.',
                'notes' => 'Plafond 100% disetujui tanpa potongan tenor. Siap persiapan pra-akad kredit.',
            ]
        );

        // -------------------------------------------------------------
        // Transaksi 2: Skema Cash Bertahap (Status: in_payment)
        // -------------------------------------------------------------
        $unit2 = $units[1];
        $basePrice2 = (float) $unit2->base_price;
        $totalPrice2 = $basePrice2 + 10000000;
        $bookingFee2 = 10000000;
        $dpAmount2 = 100000000;
        $remaining2 = $totalPrice2 - $dpAmount2;

        $booking2 = Booking::updateOrCreate(
            ['booking_code' => 'BK-202609-0002'],
            [
                'spr_number' => 'SPR/CSN/2026/09/0002',
                'spr_date' => Carbon::now()->subDays(20)->format('Y-m-d'),
                'lead_id' => $lead2->id,
                'housing_unit_id' => $unit2->id,
                'sales_id' => $salesAgent->id,
                'payment_scheme' => 'cash_bertahap',
                'base_price' => $basePrice2,
                'additional_price' => 10000000,
                'discount_amount' => 0,
                'legal_fees' => 0,
                'total_price' => $totalPrice2,
                'booking_fee' => $bookingFee2,
                'dp_amount' => $dpAmount2,
                'dp_installments_count' => 1,
                'remaining_amount' => $remaining2,
                'transaction_date' => Carbon::now()->subDays(20)->format('Y-m-d'),
                'status' => 'in_payment',
                'approved_by_manager_id' => $salesManager->id,
                'approved_by_manager_at' => Carbon::now()->subDays(19),
                'approved_by_finance_id' => $financeUser->id,
                'approved_by_finance_at' => Carbon::now()->subDays(19),
                'notes' => 'Cash bertahap 12 bulan tenor developer (in-house).',
            ]
        );
        $unit2->update(['status' => 'booked']);

        BookingPayment::updateOrCreate(
            ['payment_number' => 'KW-202609-0004'],
            [
                'booking_id' => $booking2->id,
                'payment_type' => 'booking_fee',
                'term_name' => 'Uang Tanda Jadi',
                'amount_due' => $bookingFee2,
                'due_date' => Carbon::now()->subDays(20)->format('Y-m-d'),
                'amount_paid' => $bookingFee2,
                'payment_date' => Carbon::now()->subDays(20)->format('Y-m-d'),
                'payment_method' => 'transfer_bank',
                'bank_name' => 'BCA',
                'status' => 'verified',
                'verified_by' => $financeUser->id,
                'verified_at' => Carbon::now()->subDays(19),
            ]
        );

        BookingPayment::updateOrCreate(
            ['payment_number' => 'KW-202609-0005'],
            [
                'booking_id' => $booking2->id,
                'payment_type' => 'down_payment',
                'term_name' => 'Pelunasan Uang Muka (DP)',
                'amount_due' => 90000000,
                'due_date' => Carbon::now()->subDays(5)->format('Y-m-d'),
                'amount_paid' => 90000000,
                'payment_date' => Carbon::now()->subDays(5)->format('Y-m-d'),
                'payment_method' => 'transfer_bank',
                'bank_name' => 'BCA',
                'status' => 'verified',
                'verified_by' => $financeUser->id,
                'verified_at' => Carbon::now()->subDays(4),
            ]
        );

        // -------------------------------------------------------------
        // Transaksi 3: Booking Baru Diajukan Sales (Status: pending_approval)
        // -------------------------------------------------------------
        $unit3 = $units[2];
        $basePrice3 = (float) $unit3->base_price;
        $bookingFee3 = 5000000;

        $booking3 = Booking::updateOrCreate(
            ['booking_code' => 'BK-202609-0003'],
            [
                'lead_id' => $lead3->id,
                'housing_unit_id' => $unit3->id,
                'sales_id' => $salesAgent->id,
                'payment_scheme' => 'kpr',
                'base_price' => $basePrice3,
                'additional_price' => 0,
                'discount_amount' => 5000000,
                'legal_fees' => 15000000,
                'total_price' => $basePrice3 - 5000000 + 15000000,
                'booking_fee' => $bookingFee3,
                'dp_amount' => 35000000,
                'dp_installments_count' => 1,
                'remaining_amount' => ($basePrice3 - 5000000 + 15000000) - 35000000,
                'transaction_date' => Carbon::now()->format('Y-m-d'),
                'status' => 'pending_approval',
                'notes' => 'Pengajuan booking baru oleh sales marketing. Menunggu approval Sales Manager & verifikasi mutasi transfer oleh Finance.',
            ]
        );
        $unit3->update(['status' => 'booked']);

        BookingPayment::updateOrCreate(
            ['payment_number' => 'KW-202609-0006'],
            [
                'booking_id' => $booking3->id,
                'payment_type' => 'booking_fee',
                'term_name' => 'Uang Tanda Jadi',
                'amount_due' => $bookingFee3,
                'due_date' => Carbon::now()->format('Y-m-d'),
                'amount_paid' => $bookingFee3,
                'payment_date' => Carbon::now()->format('Y-m-d'),
                'payment_method' => 'transfer_bank',
                'bank_name' => 'BCA',
                'status' => 'pending_verification',
                'notes' => 'Bukti bayar telah diunggah sales, menunggu validasi kasir/finance.',
            ]
        );

        // -------------------------------------------------------------
        // Transaksi 4: Selesai Pelunasan & Serah Terima (Status: completed)
        // -------------------------------------------------------------
        $unit4 = $units[3];
        $basePrice4 = (float) $unit4->base_price;
        $booking4 = Booking::updateOrCreate(
            ['booking_code' => 'BK-202609-0004'],
            [
                'spr_number' => 'SPR/CSN/2026/08/0015',
                'spr_date' => Carbon::now()->subDays(60)->format('Y-m-d'),
                'lead_id' => $lead1->id,
                'housing_unit_id' => $unit4->id,
                'sales_id' => $salesAgent->id,
                'payment_scheme' => 'cash',
                'base_price' => $basePrice4,
                'additional_price' => 0,
                'discount_amount' => 15000000,
                'legal_fees' => 20000000,
                'total_price' => $basePrice4 - 15000000 + 20000000,
                'booking_fee' => 10000000,
                'dp_amount' => 0,
                'remaining_amount' => 0,
                'transaction_date' => Carbon::now()->subDays(60)->format('Y-m-d'),
                'status' => 'completed',
                'approved_by_manager_id' => $salesManager->id,
                'approved_by_manager_at' => Carbon::now()->subDays(59),
                'approved_by_finance_id' => $financeUser->id,
                'approved_by_finance_at' => Carbon::now()->subDays(59),
                'notes' => 'Pelunasan Cash Keras 100% selesai. Berita Acara Serah Terima (BAST) fisik unit telah diserahterimakan ke konsumen.',
            ]
        );
        $unit4->update(['status' => 'sold']);

        BookingPayment::updateOrCreate(
            ['payment_number' => 'KW-202609-0007'],
            [
                'booking_id' => $booking4->id,
                'payment_type' => 'pelunasan',
                'term_name' => 'Pelunasan Cash Keras',
                'amount_due' => $booking4->total_price,
                'due_date' => Carbon::now()->subDays(55)->format('Y-m-d'),
                'amount_paid' => $booking4->total_price,
                'payment_date' => Carbon::now()->subDays(55)->format('Y-m-d'),
                'payment_method' => 'transfer_bank',
                'bank_name' => 'BCA',
                'status' => 'verified',
                'verified_by' => $financeUser->id,
                'verified_at' => Carbon::now()->subDays(54),
                'notes' => 'Pelunasan 100% lunas tercatat di rekening giro developer.',
            ]
        );
    }
}
