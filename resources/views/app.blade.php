@php
    $dynamicAppName = \App\Models\AppSetting::get('app_name', config('app.name', 'CASANUMA CRM'));
    $dynamicFavicon = \App\Models\AppSetting::get('favicon');
    $dynamicPrimary = \App\Models\AppSetting::get('primary_color');
    $primaryHsl = null;
    $primaryForegroundHsl = '0 0% 100%';
    if ($dynamicPrimary) {
        $primaryHsl = \App\Models\AppSetting::hexToHsl($dynamicPrimary);
        $cleanHex = ltrim($dynamicPrimary, '#');
        if (strlen($cleanHex) === 6) {
            $r = hexdec(substr($cleanHex, 0, 2));
            $g = hexdec(substr($cleanHex, 2, 2));
            $b = hexdec(substr($cleanHex, 4, 2));
            $luminance = ($r * 0.299 + $g * 0.587 + $b * 0.114);
            $primaryForegroundHsl = $luminance > 160 ? '0 0% 9%' : '0 0% 100%';
        }
    }
@endphp
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @if($primaryHsl) style="--primary: {{ $primaryHsl }} !important; --primary-foreground: {{ $primaryForegroundHsl }} !important; --ring: {{ $primaryHsl }} !important; --sidebar-primary: {{ $primaryHsl }} !important; --sidebar-primary-foreground: {{ $primaryForegroundHsl }} !important; --sidebar-ring: {{ $primaryHsl }} !important;" @endif>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ $dynamicAppName }}</title>

        @if($dynamicFavicon)
            <link rel="icon" href="{{ asset('storage/' . $dynamicFavicon) }}">
        @endif

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=SUSE:wght@100..800&display=swap" rel="stylesheet">

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx'])

        @if($primaryHsl)
            <style id="custom-brand-theme">
                :root, html, html.dark, body {
                    --primary: {{ $primaryHsl }} !important;
                    --primary-foreground: {{ $primaryForegroundHsl }} !important;
                    --ring: {{ $primaryHsl }} !important;
                    --sidebar-primary: {{ $primaryHsl }} !important;
                    --sidebar-primary-foreground: {{ $primaryForegroundHsl }} !important;
                    --sidebar-ring: {{ $primaryHsl }} !important;
                }
            </style>
        @endif
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
