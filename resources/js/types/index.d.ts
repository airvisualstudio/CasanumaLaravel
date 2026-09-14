export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
    avatar_url?: string | null;
    phone?: string | null;
    address?: string | null;
    emergency_contact_name?: string | null;
    emergency_contact_phone?: string | null;
    employee_id?: string | null;
    position?: string | null;
    join_date?: string | null;
    join_date_formatted?: string | null;
    is_active?: boolean;
    bank_name?: string | null;
    bank_account_number?: string | null;
    bank_account_holder?: string | null;
    email_verified_at?: string;
    created_at?: string;
    roles: string[];
    permissions?: string[];
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    flash?: {
        success?: string;
        error?: string;
    };
};
