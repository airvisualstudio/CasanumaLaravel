<?php

namespace App\Policies;

use App\Models\Booking;
use App\Models\BookingPayment;
use App\Models\User;

class BookingPolicy
{
    /**
     * Superadmin bypass all abilities.
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole('superadmin')) {
            return true;
        }

        return null;
    }

    /**
     * Determine whether the user can view any bookings.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('view-bookings');
    }

    /**
     * Determine whether the user can view the booking dossier.
     */
    public function view(User $user, Booking $booking): bool
    {
        if (! $user->can('view-bookings')) {
            return false;
        }

        if ($user->hasRole(['sales_manager', 'finance'])) {
            return true;
        }

        if ($user->hasRole('sales_agent')) {
            return (int) $booking->sales_id === (int) $user->id || (int) $booking->lead?->sales_id === (int) $user->id;
        }

        return false;
    }

    /**
     * Determine whether the user can create a booking.
     */
    public function create(User $user): bool
    {
        return $user->can('create-bookings');
    }

    /**
     * Determine whether the user can update the booking.
     */
    public function update(User $user, Booking $booking): bool
    {
        if ($user->hasRole('sales_manager')) {
            return true;
        }

        if ($user->hasRole('sales_agent')) {
            return (int) $booking->sales_id === (int) $user->id && $booking->status === 'pending_approval';
        }

        return false;
    }

    /**
     * Determine whether the user can cancel the booking.
     */
    public function cancel(User $user, Booking $booking): bool
    {
        if ($user->hasRole('sales_manager') || $user->can('cancel-bookings')) {
            return true;
        }

        // Sales agent can cancel only their own booking when still pending approval
        if ($user->hasRole('sales_agent')) {
            return (int) $booking->sales_id === (int) $user->id && $booking->status === 'pending_approval';
        }

        return false;
    }

    /**
     * Determine whether the user can add payments / installments to the booking.
     */
    public function addPayment(User $user, Booking $booking): bool
    {
        if ($user->hasRole(['sales_manager', 'finance'])) {
            return true;
        }

        if ($user->hasRole('sales_agent')) {
            return (int) $booking->sales_id === (int) $user->id;
        }

        return false;
    }

    /**
     * Determine whether the user can approve the booking and issue SPR.
     */
    public function approve(User $user, Booking $booking): bool
    {
        return $user->can('approve-bookings') || $user->hasRole(['sales_manager', 'finance']);
    }

    /**
     * Determine whether the user can verify a payment proof.
     */
    public function verifyPayment(User $user, BookingPayment $payment): bool
    {
        return $user->can('verify-payments') || $user->hasRole('finance');
    }

    /**
     * Determine whether the user can manage KPR stages.
     */
    public function manageKpr(User $user, Booking $booking): bool
    {
        return $user->can('manage-kpr') || $user->hasRole(['finance', 'sales_manager']);
    }
}
