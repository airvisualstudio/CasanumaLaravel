<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class AppSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
    ];

    /**
     * Get setting value by key with cache support.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        return Cache::remember("app_setting_{$key}", 3600, function () use ($key, $default) {
            $setting = static::where('key', $key)->first();

            if (! $setting) {
                return $default;
            }

            return match ($setting->type) {
                'boolean' => filter_var($setting->value, FILTER_VALIDATE_BOOLEAN),
                'integer' => (int) $setting->value,
                'json' => json_decode($setting->value ?? '{}', true),
                default => $setting->value ?? $default,
            };
        });
    }

    /**
     * Set or update setting value by key.
     */
    public static function set(string $key, mixed $value, string $group = 'general', string $type = 'string'): static
    {
        $serializedValue = match ($type) {
            'boolean' => $value ? 'true' : 'false',
            'json' => is_string($value) ? $value : json_encode($value),
            default => $value === null ? null : (string) $value,
        };

        $setting = static::updateOrCreate(
            ['key' => $key],
            [
                'value' => $serializedValue,
                'group' => $group,
                'type' => $type,
            ]
        );

        Cache::forget("app_setting_{$key}");

        return $setting;
    }

    /**
     * Convert HEX color code to CSS HSL channel string (e.g. "221.2 83.2% 53.3%").
     */
    public static function hexToHsl(string $hex): string
    {
        $hex = ltrim($hex, '#');
        if (strlen($hex) === 3) {
            $hex = $hex[0].$hex[0].$hex[1].$hex[1].$hex[2].$hex[2];
        }

        if (strlen($hex) !== 6) {
            return '173.4 80.4% 40%';
        }

        $r = hexdec(substr($hex, 0, 2)) / 255;
        $g = hexdec(substr($hex, 2, 2)) / 255;
        $b = hexdec(substr($hex, 4, 2)) / 255;

        $max = max($r, $g, $b);
        $min = min($r, $g, $b);
        $l = ($max + $min) / 2;
        $d = $max - $min;

        if ($d == 0) {
            $h = 0;
            $s = 0;
        } else {
            $s = $l > 0.5 ? $d / (2 - $max - $min) : $d / ($max + $min);
            if ($max === $r) {
                $h = (($g - $b) / $d) + ($g < $b ? 6 : 0);
            } elseif ($max === $g) {
                $h = (($b - $r) / $d) + 2;
            } else {
                $h = (($r - $g) / $d) + 4;
            }
            $h *= 60;
        }

        $h = round($h, 1);
        $s = round($s * 100, 1);
        $l = round($l * 100, 1);

        return "{$h} {$s}% {$l}%";
    }

    /**
     * Get full branding & general settings formatted with public URLs.
     *
     * @return array<string, mixed>
     */
    public static function getAllFormatted(): array
    {
        $logoLight = static::get('logo_light');
        $logoDark = static::get('logo_dark');
        $favicon = static::get('favicon');
        $loginBg = static::get('login_background');
        $primaryColor = static::get('primary_color', null);
        $receiptLetterhead = static::get('receipt_letterhead_logo');
        $receiptSignature = static::get('receipt_signature_image');

        return [
            'app_name' => static::get('app_name', 'CASANUMA CRM'),
            'company_name' => static::get('company_name', 'PT Casanuma Modern Living'),
            'app_description' => static::get('app_description', 'Sistem Manajemen Penjualan & Properti Terpadu'),
            'primary_color' => $primaryColor,
            'primary_hsl' => $primaryColor ? static::hexToHsl($primaryColor) : null,
            'login_background' => $loginBg,
            'login_background_url' => $loginBg ? Storage::url($loginBg) : null,
            'logo_light' => $logoLight,
            'logo_light_url' => $logoLight ? Storage::url($logoLight) : null,
            'logo_dark' => $logoDark,
            'logo_dark_url' => $logoDark ? Storage::url($logoDark) : null,
            'favicon' => $favicon,
            'favicon_url' => $favicon ? Storage::url($favicon) : null,
            'receipt_number_format' => static::get('receipt_number_format', 'KW/{YEAR}/{MONTH}/{ID}'),
            'receipt_footer_notes' => static::get('receipt_footer_notes', 'Kwitansi ini sah dan diproses secara digital sebagai tanda bukti pembayaran resmi.'),
            'receipt_letterhead_logo' => $receiptLetterhead,
            'receipt_letterhead_logo_url' => $receiptLetterhead ? Storage::url($receiptLetterhead) : null,
            'receipt_signature_image' => $receiptSignature,
            'receipt_signature_image_url' => $receiptSignature ? Storage::url($receiptSignature) : null,
        ];
    }
}
