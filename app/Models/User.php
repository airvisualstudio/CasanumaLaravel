<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Storage;

#[Fillable([
    'name',
    'email',
    'password',
    'avatar',
    'phone',
    'address',
    'emergency_contact_name',
    'emergency_contact_phone',
    'employee_id',
    'position',
    'join_date',
    'is_active',
    'bank_name',
    'bank_account_number',
    'bank_account_holder',
])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = ['avatar_url', 'join_date_formatted'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'join_date' => 'date',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Sanitize phone number to standard 628xx format.
     */
    public static function sanitizePhoneNumber(?string $phone): ?string
    {
        if (empty($phone)) {
            return null;
        }

        // Strip non-digit characters
        $digits = preg_replace('/\D+/', '', $phone);

        if (empty($digits)) {
            return null;
        }

        // Convert leading '0' to '62' (e.g. 0812... -> 62812...)
        if (str_starts_with($digits, '0')) {
            $digits = '62' . substr($digits, 1);
        }
        // Convert starting with '8' to '628' (e.g. 812... -> 62812...)
        elseif (str_starts_with($digits, '8')) {
            $digits = '62' . $digits;
        }

        return $digits;
    }

    /**
     * Mutator & accessor for phone (WhatsApp).
     */
    protected function phone(): Attribute
    {
        return Attribute::make(
            get: fn (?string $value) => $value,
            set: fn (?string $value) => self::sanitizePhoneNumber($value),
        );
    }

    /**
     * Mutator & accessor for emergency contact phone.
     */
    protected function emergencyContactPhone(): Attribute
    {
        return Attribute::make(
            get: fn (?string $value) => $value,
            set: fn (?string $value) => self::sanitizePhoneNumber($value),
        );
    }

    /**
     * Get the user's avatar URL.
     */
    protected function avatarUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->avatar ? '/storage/' . ltrim($this->avatar, '/') : null,
        );
    }

    /**
     * Formatted join date.
     */
    protected function joinDateFormatted(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->join_date ? $this->join_date->translatedFormat('d F Y') : null,
        );
    }
}
