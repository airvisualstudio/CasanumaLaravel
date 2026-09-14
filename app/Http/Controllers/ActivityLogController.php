<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\SystemSetting;
use App\Services\TelegramService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    /**
     * Display the activity logs and Telegram settings page.
     */
    public function index(Request $request): Response
    {
        $query = ActivityLog::with(['user:id,name,email,avatar', 'user.roles:id,name'])
            ->orderBy('id', 'desc');

        if ($request->filled('search')) {
            $search = strtolower($request->string('search'));
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(action) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(description) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(ip_address) LIKE ?', ["%{$search}%"])
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"])
                            ->orWhereRaw('LOWER(email) LIKE ?', ["%{$search}%"]);
                    });
            });
        }

        if ($request->filled('action') && $request->input('action') !== 'all') {
            $query->where('action', $request->input('action'));
        }

        $logs = $query->paginate(30)->withQueryString()->through(function (ActivityLog $log) {
            return [
                'id' => $log->id,
                'action' => $log->action,
                'description' => $log->description,
                'subject_type' => $log->subject_type,
                'subject_id' => $log->subject_id,
                'properties' => $log->properties,
                'ip_address' => $log->ip_address,
                'user_agent' => $log->user_agent,
                'created_at_formatted' => $log->created_at?->timezone('Asia/Jakarta')->format('d M Y, H:i:s') ?? '-',
                'created_at_human' => $log->created_at?->diffForHumans() ?? '-',
                'user' => $log->user ? [
                    'id' => $log->user->id,
                    'name' => $log->user->name,
                    'email' => $log->user->email,
                    'avatar_url' => $log->user->avatar_url,
                    'roles' => $log->user->roles->pluck('name'),
                ] : null,
            ];
        });

        // Summary KPI statistics
        $totalLogsCount = ActivityLog::count();
        $todayLogsCount = ActivityLog::whereDate('created_at', today())->count();
        $activeUsersToday = ActivityLog::whereDate('created_at', today())
            ->whereNotNull('user_id')
            ->distinct('user_id')
            ->count('user_id');

        // Available actions for filtering
        $availableActions = ActivityLog::select('action')
            ->distinct()
            ->pluck('action')
            ->values();

        // Telegram settings from database
        $telegramConfig = [
            'bot_token' => SystemSetting::get('telegram_bot_token', ''),
            'chat_id' => SystemSetting::get('telegram_chat_id', ''),
            'notifications_enabled' => (bool) SystemSetting::get('telegram_notifications_enabled', true),
        ];

        return Inertia::render('Settings/ActivityLogs', [
            'logs' => $logs,
            'filters' => [
                'search' => $request->input('search', ''),
                'action' => $request->input('action', 'all'),
            ],
            'availableActions' => $availableActions,
            'kpi' => [
                'total_logs' => $totalLogsCount,
                'today_logs' => $todayLogsCount,
                'active_users_today' => $activeUsersToday,
            ],
            'telegramConfig' => $telegramConfig,
        ]);
    }

    /**
     * Update Telegram integration settings in database.
     */
    public function updateTelegramSettings(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'bot_token' => ['nullable', 'string', 'max:255'],
            'chat_id' => ['nullable', 'string', 'max:100'],
            'notifications_enabled' => ['nullable', 'boolean'],
        ]);

        SystemSetting::set('telegram_bot_token', $validated['bot_token'] ?? null, 'telegram');
        SystemSetting::set('telegram_chat_id', $validated['chat_id'] ?? null, 'telegram');
        SystemSetting::set('telegram_notifications_enabled', $request->boolean('notifications_enabled'), 'telegram', 'boolean');

        ActivityLog::record(
            'telegram_config',
            'Memperbarui konfigurasi Telegram Bot & Chat ID di database',
            null,
            [
                'has_token' => ! empty($validated['bot_token']),
                'chat_id' => $validated['chat_id'] ?? null,
                'notifications_enabled' => $request->boolean('notifications_enabled'),
            ]
        );

        return back()->with('success', 'Konfigurasi Telegram berhasil disimpan ke database!');
    }

    /**
     * Test connection to Telegram bot and chat.
     */
    public function testTelegramConnection(Request $request, TelegramService $telegramService): RedirectResponse
    {
        $validated = $request->validate([
            'bot_token' => ['required', 'string'],
            'chat_id' => ['required', 'string'],
        ], [
            'bot_token.required' => 'Bot Token Telegram wajib diisi untuk melakukan tes koneksi.',
            'chat_id.required' => 'Chat ID Telegram wajib diisi untuk melakukan tes koneksi.',
        ]);

        $result = $telegramService->testConnection(
            $validated['bot_token'],
            $validated['chat_id'],
            $request->user()->name
        );

        if ($result['success']) {
            ActivityLog::record(
                'telegram_test',
                "Berhasil menguji koneksi Bot Telegram ke Chat ID: {$validated['chat_id']}",
                null,
                ['status' => 'success', 'chat_id' => $validated['chat_id']]
            );

            return back()->with('success', 'Koneksi ke Telegram berhasil! Pesan uji coba telah terkirim ke chat tujuan.');
        }

        ActivityLog::record(
            'telegram_test',
            "Gagal menguji koneksi Bot Telegram: {$result['message']}",
            null,
            ['status' => 'failed', 'error' => $result['message']]
        );

        return back()->with('error', $result['message']);
    }
}
