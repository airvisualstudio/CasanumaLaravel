<?php

namespace App\Policies;

use App\Models\Lead;
use App\Models\User;

class LeadPolicy
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
     * Determine whether the user can view any leads.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('view-leads');
    }

    /**
     * Determine whether the user can view the specific lead.
     */
    public function view(User $user, Lead $lead): bool
    {
        if (! $user->can('view-leads')) {
            return false;
        }

        if ($user->hasRole(['sales_manager', 'finance'])) {
            return true;
        }

        if ($user->hasRole('sales_agent')) {
            return (int) $lead->sales_id === (int) $user->id;
        }

        return false;
    }

    /**
     * Determine whether the user can create leads.
     */
    public function create(User $user): bool
    {
        return $user->can('create-leads');
    }

    /**
     * Determine whether the user can update the lead.
     */
    public function update(User $user, Lead $lead): bool
    {
        if (! $user->can('edit-leads')) {
            return false;
        }

        if ($user->hasRole('sales_manager')) {
            return true;
        }

        if ($user->hasRole('sales_agent')) {
            return (int) $lead->sales_id === (int) $user->id;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the lead.
     */
    public function delete(User $user, Lead $lead): bool
    {
        return $user->can('delete-leads') && $user->hasRole(['sales_manager', 'superadmin']);
    }

    /**
     * Determine whether the user can assign/reassign leads.
     */
    public function assign(User $user): bool
    {
        return $user->can('assign-leads') && $user->hasRole(['sales_manager', 'superadmin']);
    }

    /**
     * Determine whether the user can view and add internal notes/comments on the lead's follow-up history.
     * Only Superadmin, Sales Manager, and the assigned Sales PIC can view and participate.
     */
    public function manageInternalNotes(User $user, Lead $lead): bool
    {
        if ($user->hasRole('superadmin')) {
            return true;
        }

        if ($user->hasRole('sales_manager')) {
            return true;
        }

        if ($user->hasRole('sales_agent')) {
            return (int) $lead->sales_id === (int) $user->id;
        }

        return false;
    }
}
