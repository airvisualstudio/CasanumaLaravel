<?php

namespace App\Policies;

use App\Models\BookingPayment;
use App\Models\User;

class BookingPaymentPolicy
{
    /**
     * Superadmin bypass.
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole('superadmin')) {
            return true;
        }

        return null;
    }

    /**
     * Determine whether the user can verify the payment.
     */
    public function verifyPayment(User $user, BookingPayment $payment): bool
    {
        return $user->can('verify-payments') || $user->hasRole('finance');
    }
}
