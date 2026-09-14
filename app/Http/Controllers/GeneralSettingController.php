<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\AppSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class GeneralSettingController extends Controller
{
    /**
     * Display the general & branding settings page.
     */
    public function index(): Response
    {
        return Inertia::render('Settings/General', [
            'settings' => AppSetting::getAllFormatted(),
        ]);
    }

    /**
     * Update the general & branding settings.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'app_name' => ['required', 'string', 'max:100'],
            'company_name' => ['required', 'string', 'max:150'],
            'app_description' => ['nullable', 'string', 'max:500'],
            'primary_color' => ['nullable', 'string', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'logo_light' => ['nullable', 'image', 'mimes:jpeg,png,jpg,svg,webp', 'max:2048'],
            'logo_dark' => ['nullable', 'image', 'mimes:jpeg,png,jpg,svg,webp', 'max:2048'],
            'favicon' => ['nullable', 'file', 'mimes:ico,png,svg', 'max:1024'],
            'login_background' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:4096'],
            'remove_logo_light' => ['nullable', 'boolean'],
            'remove_logo_dark' => ['nullable', 'boolean'],
            'remove_favicon' => ['nullable', 'boolean'],
            'remove_primary_color' => ['nullable', 'boolean'],
            'remove_login_background' => ['nullable', 'boolean'],
        ], [
            'app_name.required' => 'Nama aplikasi wajib diisi.',
            'app_name.max' => 'Nama aplikasi maksimal 100 karakter.',
            'company_name.required' => 'Nama perusahaan / PT wajib diisi.',
            'company_name.max' => 'Nama perusahaan maksimal 150 karakter.',
            'app_description.max' => 'Deskripsi aplikasi maksimal 500 karakter.',
            'primary_color.regex' => 'Format kode warna HEX tidak valid (contoh: #4F46E5).',
            'logo_light.image' => 'Logo light mode harus berupa file gambar valid.',
            'logo_light.mimes' => 'Format logo light mode harus JPG, PNG, SVG, atau WebP.',
            'logo_light.max' => 'Ukuran logo light mode tidak boleh melebihi 2MB.',
            'logo_dark.image' => 'Logo dark mode harus berupa file gambar valid.',
            'logo_dark.mimes' => 'Format logo dark mode harus JPG, PNG, SVG, atau WebP.',
            'logo_dark.max' => 'Ukuran logo dark mode tidak boleh melebihi 2MB.',
            'favicon.file' => 'Favicon harus berupa file valid.',
            'favicon.mimes' => 'Format favicon harus berupa ICO, PNG, atau SVG.',
            'favicon.max' => 'Ukuran favicon tidak boleh melebihi 1MB.',
            'login_background.image' => 'Background login harus berupa file gambar valid.',
            'login_background.mimes' => 'Format background login harus JPG, PNG, atau WebP.',
            'login_background.max' => 'Ukuran background login tidak boleh melebihi 4MB.',
        ]);

        // 1. Update text settings
        AppSetting::set('app_name', $validated['app_name'], 'general');
        AppSetting::set('company_name', $validated['company_name'], 'general');
        AppSetting::set('app_description', $validated['app_description'] ?? '', 'general');

        // 2. Handle Primary Brand Color
        if ($request->boolean('remove_primary_color')) {
            AppSetting::set('primary_color', null, 'branding');
        } elseif ($request->filled('primary_color')) {
            AppSetting::set('primary_color', $request->input('primary_color'), 'branding');
        }

        // 3. Handle Logo Light Mode
        if ($request->boolean('remove_logo_light')) {
            $oldLight = AppSetting::get('logo_light');
            if ($oldLight && Storage::disk('public')->exists($oldLight)) {
                Storage::disk('public')->delete($oldLight);
            }
            AppSetting::set('logo_light', null, 'branding');
        } elseif ($request->hasFile('logo_light')) {
            $oldLight = AppSetting::get('logo_light');
            if ($oldLight && Storage::disk('public')->exists($oldLight)) {
                Storage::disk('public')->delete($oldLight);
            }
            $path = $request->file('logo_light')->store('branding', 'public');
            AppSetting::set('logo_light', $path, 'branding');
        }

        // 4. Handle Logo Dark Mode
        if ($request->boolean('remove_logo_dark')) {
            $oldDark = AppSetting::get('logo_dark');
            if ($oldDark && Storage::disk('public')->exists($oldDark)) {
                Storage::disk('public')->delete($oldDark);
            }
            AppSetting::set('logo_dark', null, 'branding');
        } elseif ($request->hasFile('logo_dark')) {
            $oldDark = AppSetting::get('logo_dark');
            if ($oldDark && Storage::disk('public')->exists($oldDark)) {
                Storage::disk('public')->delete($oldDark);
            }
            $path = $request->file('logo_dark')->store('branding', 'public');
            AppSetting::set('logo_dark', $path, 'branding');
        }

        // 5. Handle Favicon
        if ($request->boolean('remove_favicon')) {
            $oldFavicon = AppSetting::get('favicon');
            if ($oldFavicon && Storage::disk('public')->exists($oldFavicon)) {
                Storage::disk('public')->delete($oldFavicon);
            }
            AppSetting::set('favicon', null, 'branding');
        } elseif ($request->hasFile('favicon')) {
            $oldFavicon = AppSetting::get('favicon');
            if ($oldFavicon && Storage::disk('public')->exists($oldFavicon)) {
                Storage::disk('public')->delete($oldFavicon);
            }
            $path = $request->file('favicon')->store('branding', 'public');
            AppSetting::set('favicon', $path, 'branding');
        }

        // 6. Handle Login Background Banner
        if ($request->boolean('remove_login_background')) {
            $oldBg = AppSetting::get('login_background');
            if ($oldBg && Storage::disk('public')->exists($oldBg)) {
                Storage::disk('public')->delete($oldBg);
            }
            AppSetting::set('login_background', null, 'branding');
        } elseif ($request->hasFile('login_background')) {
            $oldBg = AppSetting::get('login_background');
            if ($oldBg && Storage::disk('public')->exists($oldBg)) {
                Storage::disk('public')->delete($oldBg);
            }
            $path = $request->file('login_background')->store('branding', 'public');
            AppSetting::set('login_background', $path, 'branding');
        }

        // 7. Record Activity Log for Superadmin audit trail
        ActivityLog::record(
            action: 'settings_update',
            description: "Memperbarui identitas aplikasi & branding sistem: {$validated['app_name']} ({$validated['company_name']})",
            properties: [
                'app_name' => $validated['app_name'],
                'company_name' => $validated['company_name'],
                'primary_color' => AppSetting::get('primary_color'),
                'has_logo_light' => (bool) AppSetting::get('logo_light'),
                'has_logo_dark' => (bool) AppSetting::get('logo_dark'),
                'has_favicon' => (bool) AppSetting::get('favicon'),
                'has_login_background' => (bool) AppSetting::get('login_background'),
            ]
        );

        return redirect()->back()->with('success', 'Pengaturan branding aplikasi berhasil disimpan.');
    }
}
