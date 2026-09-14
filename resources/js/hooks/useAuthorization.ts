import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

export function useAuthorization() {
    const { auth } = usePage<PageProps>().props;
    const user = auth?.user;
    const roles: string[] = user?.roles || [];
    const permissions: string[] = user?.permissions || [];

    /**
     * Check if user has a specific role or at least one of the provided roles
     */
    const hasRole = (role: string | string[]): boolean => {
        if (!user) return false;
        if (Array.isArray(role)) {
            return role.some((r) => roles.includes(r));
        }
        return roles.includes(role);
    };

    /**
     * Check if user has all the provided roles
     */
    const hasAllRoles = (requiredRoles: string[]): boolean => {
        if (!user) return false;
        return requiredRoles.every((r) => roles.includes(r));
    };

    /**
     * Check if user has permission (superadmin always returns true)
     */
    const can = (permission: string | string[]): boolean => {
        if (!user) return false;
        if (roles.includes('superadmin')) return true;

        if (Array.isArray(permission)) {
            return permission.some((p) => permissions.includes(p));
        }
        return permissions.includes(permission);
    };

    /**
     * Check if user has all required permissions
     */
    const canAll = (requiredPermissions: string[]): boolean => {
        if (!user) return false;
        if (roles.includes('superadmin')) return true;
        return requiredPermissions.every((p) => permissions.includes(p));
    };

    return {
        user,
        roles,
        permissions,
        hasRole,
        hasAllRoles,
        can,
        canAll,
        isSuperAdmin: roles.includes('superadmin'),
        isSalesManager: roles.includes('sales_manager'),
        isSalesAgent: roles.includes('sales_agent'),
        isFinance: roles.includes('finance'),
    };
}
