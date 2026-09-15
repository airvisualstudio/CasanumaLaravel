<?php

namespace App\Models;

use App\Services\TelegramService;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'action',
        'description',
        'subject_type',
        'subject_id',
        'properties',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'properties' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = [
        'created_at_formatted',
        'created_at_human',
    ];

    /**
     * The user who performed the activity.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Convenience helper to record user or system activities.
     */
    public static function record(
        string $action,
        string $description,
        ?Model $subject = null,
        array $properties = []
    ): static {
        $request = request();

        $log = static::create([
            'user_id' => Auth::id(),
            'action' => $action,
            'description' => $description,
            'subject_type' => $subject ? get_class($subject) : null,
            'subject_id' => $subject?->getKey(),
            'properties' => ! empty($properties) ? $properties : null,
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent() ? substr($request->userAgent(), 0, 500) : null,
        ]);

        // Auto-send real-time notification to Telegram bot/group
        try {
            if ($action !== 'telegram_test') {
                app(TelegramService::class)->sendActivityNotification($log);
            }
        } catch (\Throwable $e) {
            Log::warning('Telegram activity notification error: '.$e->getMessage());
        }

        return $log;
    }

    /**
     * Formatted human readable relative timestamp.
     */
    protected function createdAtHuman(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->created_at?->diffForHumans() ?? '-',
        );
    }

    /**
     * Formatted absolute timestamp.
     */
    protected function createdAtFormatted(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->created_at?->format('d M Y, H:i') ?? '-',
        );
    }
}
