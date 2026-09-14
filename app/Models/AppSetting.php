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
     * Get full branding & general settings formatted with public URLs.
     *
     * @return array<string, mixed>
     */
    public static function getAllFormatted(): array
    {
        $logoLight = static::get('logo_light');
        $logoDark = static::get('logo_dark');
        $favicon = static::get('favicon');

        return [
            'app_name' => static::get('app_name', 'CASANUMA CRM'),
            'company_name' => static::get('company_name', 'PT Casanuma Modern Living'),
            'app_description' => static::get('app_description', 'Sistem Manajemen Penjualan & Properti Terpadu'),
            'logo_light' => $logoLight,
            'logo_light_url' => $logoLight ? Storage::url($logoLight) : null,
            'logo_dark' => $logoDark,
            'logo_dark_url' => $logoDark ? Storage::url($logoDark) : null,
            'favicon' => $favicon,
            'favicon_url' => $favicon ? Storage::url($favicon) : null,
        ];
    }
}
