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
            'receipt_number_format' => ['nullable', 'string', 'max:80'],
            'receipt_footer_notes' => ['nullable', 'string', 'max:1000'],
            'receipt_letterhead_logo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,svg,webp', 'max:2048'],
            'receipt_signature_image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,svg,webp', 'max:2048'],
            'remove_receipt_letterhead_logo' => ['nullable', 'boolean'],
            'remove_receipt_signature_image' => ['nullable', 'boolean'],
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
            'receipt_letterhead_logo.image' => 'Kop surat kwitansi harus berupa file gambar valid.',
            'receipt_letterhead_logo.max' => 'Ukuran kop surat kwitansi maksimal 2MB.',
            'receipt_signature_image.image' => 'Tanda tangan digital harus berupa file gambar valid.',
            'receipt_signature_image.max' => 'Ukuran tanda tangan digital maksimal 2MB.',
        ]);

        // 1. Update text settings
        AppSetting::set('app_name', $validated['app_name'], 'general');
        AppSetting::set('company_name', $validated['company_name'], 'general');
        AppSetting::set('app_description', $validated['app_description'] ?? '', 'general');

        if (isset($validated['receipt_number_format'])) {
            AppSetting::set('receipt_number_format', $validated['receipt_number_format'], 'receipt');
        }
        if (isset($validated['receipt_footer_notes'])) {
            AppSetting::set('receipt_footer_notes', $validated['receipt_footer_notes'], 'receipt');
        }

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

        // 7. Handle Receipt Letterhead Logo
        if ($request->boolean('remove_receipt_letterhead_logo')) {
            $oldReceiptLogo = AppSetting::get('receipt_letterhead_logo');
            if ($oldReceiptLogo && Storage::disk('public')->exists($oldReceiptLogo)) {
                Storage::disk('public')->delete($oldReceiptLogo);
            }
            AppSetting::set('receipt_letterhead_logo', null, 'receipt');
        } elseif ($request->hasFile('receipt_letterhead_logo')) {
            $oldReceiptLogo = AppSetting::get('receipt_letterhead_logo');
            if ($oldReceiptLogo && Storage::disk('public')->exists($oldReceiptLogo)) {
                Storage::disk('public')->delete($oldReceiptLogo);
            }
            $path = $request->file('receipt_letterhead_logo')->store('receipts/assets', 'public');
            AppSetting::set('receipt_letterhead_logo', $path, 'receipt');
        }

        // 8. Handle Receipt Digital Signature Image
        if ($request->boolean('remove_receipt_signature_image')) {
            $oldSignature = AppSetting::get('receipt_signature_image');
            if ($oldSignature && Storage::disk('public')->exists($oldSignature)) {
                Storage::disk('public')->delete($oldSignature);
            }
            AppSetting::set('receipt_signature_image', null, 'receipt');
        } elseif ($request->hasFile('receipt_signature_image')) {
            $oldSignature = AppSetting::get('receipt_signature_image');
            if ($oldSignature && Storage::disk('public')->exists($oldSignature)) {
                Storage::disk('public')->delete($oldSignature);
            }
            $path = $request->file('receipt_signature_image')->store('receipts/assets', 'public');
            AppSetting::set('receipt_signature_image', $path, 'receipt');
        }

        // 9. Record Activity Log for Superadmin audit trail
        ActivityLog::record(
            action: 'settings_update',
            description: "Memperbarui identitas aplikasi & template kwitansi sistem: {$validated['app_name']} ({$validated['company_name']})",
            properties: [
                'app_name' => $validated['app_name'],
                'company_name' => $validated['company_name'],
                'primary_color' => AppSetting::get('primary_color'),
                'receipt_number_format' => AppSetting::get('receipt_number_format'),
            ]
        );

        return redirect()->back()->with('success', 'Pengaturan branding & template kwitansi berhasil disimpan.');
    }
}
