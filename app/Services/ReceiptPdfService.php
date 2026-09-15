<?php

namespace App\Services;

use App\Models\AppSetting;
use App\Models\Receipt;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class ReceiptPdfService
{
    /**
     * Generate a receipt PDF with QR code verification.
     *
     * @return string The storage path of the generated PDF
     */
    public function generate(Receipt $receipt): string
    {
        // Prepare QR Code as base64 SVG
        $qrCodeSvg = null;
        if ($receipt->qr_code_url) {
            $qrCodeSvg = base64_encode(
                QrCode::format('svg')
                    ->size(120)
                    ->margin(1)
                    ->errorCorrection('H')
                    ->generate($receipt->qr_code_url)
            );
        }

        // Load branding settings
        $settings = [
            'company_name' => AppSetting::get('company_name', 'PT Casanuma Modern Living'),
            'app_name' => AppSetting::get('app_name', 'CASANUMA CRM'),
            'receipt_footer_notes' => AppSetting::get('receipt_footer_notes', 'Kwitansi ini sah dan diproses secara digital.'),
        ];

        // Load logo if available
        $logoPath = AppSetting::get('receipt_letterhead_logo') ?? AppSetting::get('logo_light');
        $logoBase64 = null;
        if ($logoPath && Storage::disk('public')->exists($logoPath)) {
            $logoContent = Storage::disk('public')->get($logoPath);
            $mimeType = Storage::disk('public')->mimeType($logoPath);
            $logoBase64 = 'data:'.$mimeType.';base64,'.base64_encode($logoContent);
        }

        // Load digital signature if available
        $signaturePath = AppSetting::get('receipt_signature_image');
        $signatureBase64 = null;
        if ($signaturePath && Storage::disk('public')->exists($signaturePath)) {
            $signatureContent = Storage::disk('public')->get($signaturePath);
            $signatureMime = Storage::disk('public')->mimeType($signaturePath);
            $signatureBase64 = 'data:'.$signatureMime.';base64,'.base64_encode($signatureContent);
        }

        // Render PDF
        $pdf = Pdf::loadView('pdf.receipt', [
            'receipt' => $receipt,
            'booking' => $receipt->booking,
            'lead' => $receipt->booking->lead ?? $receipt->lead,
            'unit' => $receipt->booking->unit ?? null,
            'project' => $receipt->booking->unit->cluster->project ?? null,
            'qrCodeSvg' => $qrCodeSvg,
            'logoBase64' => $logoBase64,
            'signatureBase64' => $signatureBase64,
            'settings' => $settings,
            'approvedByManager' => $receipt->managerApprover,
            'reviewedByFinance' => $receipt->financeReviewer,
        ]);

        $pdf->setPaper('a4', 'portrait');

        // Save to storage
        $year = $receipt->created_at->format('Y');
        $month = $receipt->created_at->format('m');
        $filename = "receipts/{$year}/{$month}/KW-{$receipt->id}.pdf";

        Storage::disk('public')->put($filename, $pdf->output());

        return $filename;
    }
}
