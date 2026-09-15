<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Kwitansi {{ $receipt->receipt_number ?? $receipt->finance_receipt_number ?? 'DRAFT' }}</title>
    <style>
        @page {
            margin: 25mm 20mm 20mm 20mm;
        }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 11px;
            color: #1a1a2e;
            line-height: 1.5;
            margin: 0;
            padding: 0;
        }

        /* ── Header / Kop Surat ── */
        .header {
            border-bottom: 3px solid #0f3460;
            padding-bottom: 12px;
            margin-bottom: 20px;
        }

        .header-table {
            width: 100%;
        }

        .header-logo {
            width: 80px;
            vertical-align: middle;
        }

        .header-logo img {
            max-width: 70px;
            max-height: 55px;
        }

        .header-info {
            vertical-align: middle;
        }

        .company-name {
            font-size: 18px;
            font-weight: bold;
            color: #0f3460;
            letter-spacing: 0.5px;
        }

        .company-desc {
            font-size: 9px;
            color: #555;
            margin-top: 2px;
        }

        /* ── Receipt Title ── */
        .receipt-title {
            text-align: center;
            margin: 20px 0 15px;
        }

        .receipt-title h1 {
            font-size: 20px;
            font-weight: bold;
            color: #0f3460;
            margin: 0;
            letter-spacing: 2px;
            text-transform: uppercase;
        }

        .receipt-number {
            font-size: 13px;
            color: #e94560;
            font-weight: bold;
            margin-top: 4px;
        }

        .receipt-date {
            font-size: 10px;
            color: #666;
            margin-top: 2px;
        }

        /* ── Info Tables ── */
        .info-section {
            margin-bottom: 18px;
        }

        .section-label {
            font-size: 10px;
            font-weight: bold;
            color: #0f3460;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 4px;
            margin-bottom: 8px;
        }

        .info-table {
            width: 100%;
            border-collapse: collapse;
        }

        .info-table td {
            padding: 4px 8px;
            font-size: 11px;
            vertical-align: top;
        }

        .info-table .label {
            width: 35%;
            color: #555;
            font-weight: 600;
        }

        .info-table .value {
            color: #1a1a2e;
        }

        /* ── Amount Box ── */
        .amount-box {
            background: #f8f9fa;
            border: 2px solid #0f3460;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
        }

        .amount-label {
            font-size: 10px;
            color: #555;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .amount-value {
            font-size: 24px;
            font-weight: bold;
            color: #0f3460;
            margin-top: 5px;
        }

        .amount-terbilang {
            font-size: 9px;
            color: #666;
            font-style: italic;
            margin-top: 4px;
        }

        /* ── Approval Section ── */
        .approval-section {
            margin-top: 25px;
            width: 100%;
        }

        .approval-table {
            width: 100%;
            border-collapse: collapse;
        }

        .approval-table td {
            width: 33.33%;
            text-align: center;
            padding: 8px;
            vertical-align: top;
        }

        .approval-role {
            font-size: 9px;
            color: #555;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .approval-signature {
            min-height: 50px;
            margin: 8px 0;
        }

        .approval-signature img {
            max-height: 45px;
        }

        .approval-name {
            font-size: 10px;
            font-weight: bold;
            color: #1a1a2e;
            border-top: 1px solid #333;
            padding-top: 4px;
            display: inline-block;
            min-width: 120px;
        }

        .approval-date {
            font-size: 8px;
            color: #888;
        }

        /* ── QR Code ── */
        .qr-section {
            position: fixed;
            bottom: 20mm;
            right: 20mm;
            text-align: center;
        }

        .qr-code img {
            width: 100px;
            height: 100px;
        }

        .qr-label {
            font-size: 7px;
            color: #888;
            margin-top: 3px;
        }

        /* ── Footer ── */
        .footer {
            position: fixed;
            bottom: 8mm;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 8px;
            color: #999;
            border-top: 1px solid #eee;
            padding-top: 5px;
        }

        /* ── Status Badge ── */
        .status-badge {
            display: inline-block;
            padding: 3px 12px;
            border-radius: 12px;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .status-approved {
            background: #d4edda;
            color: #155724;
        }

        .status-draft {
            background: #fff3cd;
            color: #856404;
        }
    </style>
</head>
<body>
    {{-- ── Kop Surat / Header ── --}}
    <div class="header">
        <table class="header-table">
            <tr>
                @if($logoBase64)
                <td class="header-logo">
                    <img src="{{ $logoBase64 }}" alt="Logo">
                </td>
                @endif
                <td class="header-info">
                    <div class="company-name">{{ $settings['company_name'] }}</div>
                    <div class="company-desc">{{ $settings['app_name'] }} — Sistem Manajemen Penjualan & Properti Terpadu</div>
                </td>
            </tr>
        </table>
    </div>

    {{-- ── Judul Kwitansi ── --}}
    <div class="receipt-title">
        <h1>KWITANSI</h1>
        <div class="receipt-number">
            No: {{ $receipt->receipt_number ?? $receipt->finance_receipt_number ?? 'BELUM TERBIT' }}
        </div>
        <div class="receipt-date">
            Tanggal: {{ $receipt->approved_by_manager_at ? $receipt->approved_by_manager_at->format('d F Y') : now()->format('d F Y') }}
        </div>
        <div style="margin-top: 6px;">
            @if($receipt->status === 'manager_approved')
                <span class="status-badge status-approved">✓ TERVERIFIKASI</span>
            @else
                <span class="status-badge status-draft">DRAFT</span>
            @endif
        </div>
    </div>

    {{-- ── Data Konsumen ── --}}
    <div class="info-section">
        <div class="section-label">Data Konsumen</div>
        <table class="info-table">
            <tr>
                <td class="label">Nama Konsumen</td>
                <td class="value">{{ $lead->name ?? '-' }}</td>
            </tr>
            <tr>
                <td class="label">No. WhatsApp</td>
                <td class="value">{{ $lead->whatsapp ?? '-' }}</td>
            </tr>
            @if($lead && $lead->email)
            <tr>
                <td class="label">Email</td>
                <td class="value">{{ $lead->email }}</td>
            </tr>
            @endif
        </table>
    </div>

    {{-- ── Detail Properti ── --}}
    <div class="info-section">
        <div class="section-label">Detail Properti</div>
        <table class="info-table">
            @if($project)
            <tr>
                <td class="label">Proyek</td>
                <td class="value">{{ $project->name }}</td>
            </tr>
            @endif
            @if($unit)
            <tr>
                <td class="label">Kode Unit / Kavling</td>
                <td class="value">{{ $unit->unit_code }}</td>
            </tr>
            @endif
            <tr>
                <td class="label">Kode Booking</td>
                <td class="value">{{ $booking->booking_code ?? '-' }}</td>
            </tr>
        </table>
    </div>

    {{-- ── Detail Pembayaran ── --}}
    <div class="info-section">
        <div class="section-label">Detail Pembayaran</div>
        <table class="info-table">
            <tr>
                <td class="label">Jenis Pembayaran</td>
                <td class="value">{{ $receipt->payment_type_label }}</td>
            </tr>
            <tr>
                <td class="label">Metode Pembayaran</td>
                <td class="value">
                    @switch($receipt->payment_method)
                        @case('transfer_bank') Transfer Bank @break
                        @case('cash') Tunai @break
                        @case('cheque') Cek / Giro @break
                        @default {{ ucfirst($receipt->payment_method) }}
                    @endswitch
                </td>
            </tr>
            @if($receipt->bank_name)
            <tr>
                <td class="label">Bank</td>
                <td class="value">{{ $receipt->bank_name }}</td>
            </tr>
            @endif
            <tr>
                <td class="label">Tanggal Pembayaran</td>
                <td class="value">{{ $receipt->payment_date->format('d F Y') }}</td>
            </tr>
        </table>
    </div>

    {{-- ── Nominal ── --}}
    <div class="amount-box">
        <div class="amount-label">Jumlah Pembayaran</div>
        <div class="amount-value">{{ $receipt->formatted_amount }}</div>
    </div>

    @if($receipt->notes)
    <div class="info-section">
        <div class="section-label">Catatan</div>
        <p style="font-size: 10px; color: #555;">{{ $receipt->notes }}</p>
    </div>
    @endif

    {{-- ── Approval Signatures ── --}}
    <div class="approval-section">
        <table class="approval-table">
            <tr>
                <td>
                    <div class="approval-role">Diajukan oleh</div>
                    <div class="approval-signature"></div>
                    <div class="approval-name">{{ $receipt->submitter->name ?? '-' }}</div>
                    <div class="approval-date">
                        {{ $receipt->submitted_at ? $receipt->submitted_at->format('d/m/Y H:i') : '-' }}
                    </div>
                </td>
                <td>
                    <div class="approval-role">Diverifikasi Finance</div>
                    <div class="approval-signature">
                        @if($signatureBase64 && $reviewedByFinance)
                            <img src="{{ $signatureBase64 }}" alt="Signature">
                        @endif
                    </div>
                    <div class="approval-name">{{ $reviewedByFinance->name ?? '-' }}</div>
                    <div class="approval-date">
                        {{ $receipt->reviewed_by_finance_at ? $receipt->reviewed_by_finance_at->format('d/m/Y H:i') : '-' }}
                    </div>
                </td>
                <td>
                    <div class="approval-role">Disetujui Manager</div>
                    <div class="approval-signature">
                        @if($signatureBase64 && $approvedByManager)
                            <img src="{{ $signatureBase64 }}" alt="Signature">
                        @endif
                    </div>
                    <div class="approval-name">{{ $approvedByManager->name ?? '-' }}</div>
                    <div class="approval-date">
                        {{ $receipt->approved_by_manager_at ? $receipt->approved_by_manager_at->format('d/m/Y H:i') : '-' }}
                    </div>
                </td>
            </tr>
        </table>
    </div>

    {{-- ── QR Code Verification ── --}}
    @if($qrCodeSvg)
    <div class="qr-section">
        <div class="qr-code">
            <img src="data:image/svg+xml;base64,{{ $qrCodeSvg }}" alt="QR Verification">
        </div>
        <div class="qr-label">Scan untuk verifikasi keaslian</div>
    </div>
    @endif

    {{-- ── Footer ── --}}
    <div class="footer">
        {{ $settings['receipt_footer_notes'] }}<br>
        Dicetak oleh {{ $settings['app_name'] }} pada {{ now()->format('d M Y, H:i') }} WIB
    </div>
</body>
</html>
