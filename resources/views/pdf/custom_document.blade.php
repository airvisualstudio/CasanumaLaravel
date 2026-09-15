<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>{{ $template->name }}</title>
    <style>
        @page {
            size: {{ $dimensionsMm['width'] }}mm {{ $dimensionsMm['height'] }}mm;
            margin: {{ $template->margin_top_mm }}mm {{ $template->margin_right_mm }}mm {{ $template->margin_bottom_mm }}mm {{ $template->margin_left_mm }}mm;
        }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 11px;
            color: #0f172a;
            line-height: 1.5;
            margin: 0;
            padding: 0;
        }

        /* ── Header / Kop Surat ── */
        .kop-container {
            margin-bottom: 20px;
        }

        .kop-table {
            width: 100%;
            border-collapse: collapse;
        }

        .kop-logo {
            width: 80px;
            vertical-align: middle;
            text-align: center;
        }

        .kop-logo img {
            max-width: 75px;
            max-height: 60px;
        }

        .kop-text {
            vertical-align: middle;
            text-align: center;
            padding-left: 10px;
            padding-right: 10px;
        }

        .kop-title {
            font-size: 16px;
            font-weight: bold;
            color: #0f172a;
            letter-spacing: 0.5px;
            margin: 0;
            text-transform: uppercase;
        }

        .kop-subtitle {
            font-size: 10px;
            font-weight: bold;
            color: #334155;
            margin: 2px 0 0;
            text-transform: uppercase;
        }

        .kop-address {
            font-size: 8.5px;
            color: #475569;
            margin: 3px 0 0;
            line-height: 1.3;
        }

        .kop-contact {
            font-size: 8px;
            color: #64748b;
            margin: 2px 0 0;
        }

        .kop-divider {
            margin-top: 8px;
            border-bottom: 2px solid #0f172a;
            border-top: 0.5px solid #0f172a;
            height: 2px;
        }

        .kop-image-banner img {
            width: 100%;
            max-height: 120px;
            object-fit: contain;
            margin-bottom: 12px;
        }

        /* ── Content Area ── */
        .content-body {
            width: 100%;
        }

        .content-body table {
            border-collapse: collapse;
        }

        /* ── Footer ── */
        .doc-footer {
            margin-top: 30px;
            border-top: 1px solid #e2e8f0;
            padding-top: 8px;
            font-size: 8.5px;
            color: #64748b;
            text-align: center;
            font-style: italic;
        }
    </style>
</head>
<body>

    {{-- KOP SURAT BERDASARKAN MODE --}}
    @if ($template->letterhead_mode === 'default_company')
        <div class="kop-container">
            <table class="kop-table">
                <tr>
                    @if (!empty($logoBase64))
                        <td class="kop-logo">
                            <img src="{{ $logoBase64 }}" alt="Logo">
                        </td>
                    @endif
                    <td class="kop-text" style="{{ empty($logoBase64) ? 'text-align: center;' : 'text-align: left; padding-left: 15px;' }}">
                        <div class="kop-title">{{ $settings['company_name'] ?? 'PT CASANUMA MODERN LIVING' }}</div>
                        <div class="kop-subtitle">{{ $settings['app_name'] ?? 'CASANUMA CRM' }} &ndash; SISTEM PENGEMBANGAN PROPERTI</div>
                        <div class="kop-address">{{ $settings['company_address'] ?? 'Kawasan Residensial & Komersial Terpadu Bandung, Jawa Barat' }}</div>
                    </td>
                </tr>
            </table>
            <div class="kop-divider"></div>
        </div>
    @elseif ($template->letterhead_mode === 'custom_builder')
        <div class="kop-container">
            <table class="kop-table">
                <tr>
                    @if (!empty($logoBase64))
                        <td class="kop-logo">
                            <img src="{{ $logoBase64 }}" alt="Logo">
                        </td>
                    @endif
                    <td class="kop-text">
                        <div class="kop-title">{{ $template->letterhead_title ?? $settings['company_name'] }}</div>
                        @if ($template->letterhead_subtitle)
                            <div class="kop-subtitle">{{ $template->letterhead_subtitle }}</div>
                        @endif
                        @if ($template->letterhead_address)
                            <div class="kop-address">{{ $template->letterhead_address }}</div>
                        @endif
                        @if ($template->letterhead_contact)
                            <div class="kop-contact">{{ $template->letterhead_contact }}</div>
                        @endif
                    </td>
                </tr>
            </table>
            <div class="kop-divider"></div>
        </div>
    @elseif ($template->letterhead_mode === 'custom_image' && !empty($letterheadImageBase64))
        <div class="kop-container kop-image-banner">
            <img src="{{ $letterheadImageBase64 }}" alt="Kop Surat">
        </div>
    @endif

    {{-- DOKUMEN CONTENT --}}
    <div class="content-body">
        {!! $renderedHtml !!}
    </div>

    {{-- FOOTER CATATAN --}}
    @if ($template->footer_text)
        <div class="doc-footer">
            {{ $template->footer_text }}
        </div>
    @endif

</body>
</html>
