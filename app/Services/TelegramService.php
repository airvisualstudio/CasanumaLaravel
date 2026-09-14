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
            $response = Http::timeout(10)->post("https://api.telegram.org/bot{$token}/sendMessage", [
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
}
