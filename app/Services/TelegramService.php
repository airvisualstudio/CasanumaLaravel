<?php

namespace App\Services;

use App\Models\SystemSetting;
use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramService
{
    /**
     * Send message to configured or specified Telegram chat.
     */
    public function sendMessage(
        string $text,
        ?string $botToken = null,
        ?string $chatId = null,
        string $parseMode = 'HTML'
    ): array {
        $token = $botToken ?: SystemSetting::get('telegram_bot_token');
        $chat = $chatId ?: SystemSetting::get('telegram_chat_id');

        if (empty($token) || empty($chat)) {
            return [
                'success' => false,
                'message' => 'Bot Token atau Chat ID Telegram belum dikonfigurasi.',
                'data' => null,
            ];
        }

        try {
            $httpClient = Http::timeout(10);

            // Bypass SSL verification in development/local environments or when verify_ssl is disabled
            // This prevents Windows cURL error 60 (self-signed cert in chain / missing cacert.pem)
            if (! app()->isProduction() || ! config('services.telegram.verify_ssl', true)) {
                $httpClient = $httpClient->withoutVerifying();
            }

            $response = $httpClient->post("https://api.telegram.org/bot{$token}/sendMessage", [
                'chat_id' => $chat,
                'text' => $text,
                'parse_mode' => $parseMode,
                'disable_web_page_preview' => true,
            ]);

            $result = $response->json();

            if ($response->successful() && ($result['ok'] ?? false)) {
                return [
                    'success' => true,
                    'message' => 'Pesan Telegram berhasil dikirim.',
                    'data' => $result['result'] ?? null,
                ];
            }

            $errorMessage = $result['description'] ?? "HTTP Error: {$response->status()}";

            Log::warning('Telegram send message failed', [
                'error' => $errorMessage,
                'chat_id' => $chat,
            ]);

            return [
                'success' => false,
                'message' => "Gagal mengirim pesan Telegram: {$errorMessage}",
                'data' => $result,
            ];
        } catch (Exception $e) {
            Log::error('Telegram connection exception', [
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => "Kesalahan jaringan / koneksi ke API Telegram: {$e->getMessage()}",
                'data' => null,
            ];
        }
    }

    /**
     * Test connection to Telegram bot and chat.
     */
    public function testConnection(?string $botToken = null, ?string $chatId = null, ?string $operatorName = null): array
    {
        $token = $botToken ?: SystemSetting::get('telegram_bot_token');
        $chat = $chatId ?: SystemSetting::get('telegram_chat_id');

        if (empty($token)) {
            return [
                'success' => false,
                'message' => 'Bot Token Telegram wajib diisi.',
                'data' => null,
            ];
        }

        if (empty($chat)) {
            return [
                'success' => false,
                'message' => 'Chat ID Telegram wajib diisi.',
                'data' => null,
            ];
        }

        $timestamp = now()->timezone('Asia/Jakarta')->format('d M Y, H:i:s T');
        $operator = $operatorName ?: 'Superadmin';
        $serverEnv = config('app.env', 'production');

        $testMessage = "<b>🔔 CASANUMA CRM - Uji Koneksi Telegram</b>\n\n"
            ."✅ <b>Status:</b> Koneksi Berhasil Terhubung!\n"
            ."👤 <b>Operator:</b> {$operator}\n"
            ."⏱ <b>Waktu:</b> {$timestamp}\n"
            ."🌐 <b>Environment:</b> <code>{$serverEnv}</code>\n\n"
            ."<i>Notifikasi sistem CRM, audit activity logs, dan update operasional akan dikirimkan ke channel/chat ini secara otomatis.</i>";

        return $this->sendMessage($testMessage, $token, $chat);
    }

    /**
     * Send real-time activity log notification to Telegram.
     */
    public function sendActivityNotification(\App\Models\ActivityLog $log): array
    {
        $notificationsEnabled = filter_var(
            SystemSetting::get('telegram_notifications_enabled', true),
            FILTER_VALIDATE_BOOLEAN
        );

        if (! $notificationsEnabled) {
            return [
                'success' => false,
                'message' => 'Notifikasi Telegram dinonaktifkan.',
                'data' => null,
            ];
        }

        $token = SystemSetting::get('telegram_bot_token');
        $chat = SystemSetting::get('telegram_chat_id');

        if (empty($token) || empty($chat)) {
            return [
                'success' => false,
                'message' => 'Bot Token atau Chat ID Telegram belum dikonfigurasi.',
                'data' => null,
            ];
        }

        $log->loadMissing(['user.roles:id,name']);

        $userName = $log->user?->name ?? 'Sistem / Anonim';
        $userRole = $log->user?->roles?->pluck('name')->first() ?? 'system';
        $timestamp = ($log->created_at ?? now())->timezone('Asia/Jakarta')->format('d M Y, H:i:s T');
        $ip = $log->ip_address ?: '127.0.0.1';

        $actionBadges = [
            'user_create' => '👤 Pengguna Baru Dibuat',
            'user_update' => '✏️ Data Pengguna Diperbarui',
            'user_delete' => '🗑️ Pengguna Dihapus',
            'status_toggle' => '🔄 Status Akun Diubah',
            'password_reset' => '🔐 Reset Password oleh Admin',
            'profile_update' => '👤 Update Profil Mandiri',
            'password_change' => '🔑 Ganti Password Mandiri',
            'telegram_config' => '⚙️ Pengaturan Telegram Diubah',
        ];

        $actionTitle = $actionBadges[$log->action] ?? "⚡ <code>{$log->action}</code>";

        $message = "<b>📋 CASANUMA CRM - LOG AKTIVITAS SISTEM</b>\n\n"
            ."📌 <b>Aksi:</b> {$actionTitle}\n"
            ."👤 <b>Pelaku:</b> {$userName} (<code>{$userRole}</code>)\n"
            ."📝 <b>Keterangan:</b> {$log->description}\n"
            ."⏱ <b>Waktu:</b> {$timestamp}\n"
            ."🌐 <b>IP Address:</b> <code>{$ip}</code>";

        if (! empty($log->properties) && is_array($log->properties)) {
            $details = "\n\n🔍 <b>Detail Perubahan:</b>\n";
            $count = 0;
            foreach ($log->properties as $key => $val) {
                if ($count >= 6) {
                    $details .= "• <i>...dan " . (count($log->properties) - 6) . " properti lainnya</i>\n";
                    break;
                }
                $valStr = is_bool($val) ? ($val ? 'true' : 'false') : (is_scalar($val) ? (string) $val : json_encode($val));
                $details .= "• <b>" . htmlspecialchars((string) $key) . ":</b> " . htmlspecialchars($valStr) . "\n";
                $count++;
            }
            $message .= rtrim($details);
        }

        return $this->sendMessage($message, $token, $chat);
    }
}
