<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        @php
            $dynamicAppName = \App\Models\AppSetting::get('app_name', config('app.name', 'CASANUMA CRM'));
            $dynamicFavicon = \App\Models\AppSetting::get('favicon');
        @endphp
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
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
