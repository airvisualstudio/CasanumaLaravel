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

export interface AppSettings {
    app_name: string;
    company_name: string;
    company_address?: string | null;
    company_phone?: string | null;
    company_email?: string | null;
    app_description: string;
    primary_color?: string | null;
    primary_hsl?: string | null;
    login_background?: string | null;
    login_background_url?: string | null;
    logo_light?: string | null;
    logo_light_url?: string | null;
    logo_dark?: string | null;
    logo_dark_url?: string | null;
    favicon?: string | null;
    favicon_url?: string | null;
    receipt_number_format?: string | null;
    receipt_footer_notes?: string | null;
    receipt_letterhead_logo?: string | null;
    receipt_letterhead_logo_url?: string | null;
    receipt_signature_image?: string | null;
    receipt_signature_image_url?: string | null;
}

export interface ReceiptStatusLog {
    id: number;
    receipt_id: number;
    from_status?: string | null;
    to_status: string;
    changed_by: number;
    notes?: string | null;
    created_at: string;
    created_at_formatted: string;
    status_label: string;
    changed_by_user?: {
        id: number;
        name: string;
    };
}

export interface Receipt {
    id: number;
    receipt_number?: string | null;
    booking_id: number;
    lead_id: number;
    payment_type: 'booking_fee' | 'dp' | 'installment' | 'pelunasan';
    amount: number | string;
    formatted_amount: string;
    payment_method?: string | null;
    bank_name?: string | null;
    transfer_proof?: string | null;
    transfer_proof_url?: string | null;
    payment_date: string;
    notes?: string | null;
    status: 'submitted' | 'finance_review' | 'finance_approved' | 'manager_approved' | 'rejected';
    status_label: string;
    status_color: string;
    payment_type_label: string;
    submitted_by: number;
    submitted_at?: string | null;
    reviewed_by_finance_id?: number | null;
    reviewed_by_finance_at?: string | null;
    finance_receipt_number?: string | null;
    finance_notes?: string | null;
    approved_by_manager_id?: number | null;
    approved_by_manager_at?: string | null;
    rejection_reason?: string | null;
    rejected_by?: number | null;
    rejected_at?: string | null;
    qr_code_token?: string | null;
    qr_code_url?: string | null;
    pdf_path?: string | null;
    pdf_url?: string | null;
    created_at: string;
    booking?: {
        id: number;
        booking_code: string;
        housing_unit_id: number;
        lead?: {
            id: number;
            name: string;
            whatsapp?: string | null;
            email?: string | null;
        };
        unit?: {
            id: number;
            unit_code: string;
            cluster_id: number;
            cluster?: {
                id: number;
                name: string;
                housing_project_id: number;
                project?: {
                    id: number;
                    name: string;
                };
            };
        };
    };
    lead?: {
        id: number;
        name: string;
        whatsapp?: string | null;
        email?: string | null;
    };
    submitter?: {
        id: number;
        name: string;
        email?: string | null;
    };
    finance_reviewer?: {
        id: number;
        name: string;
    };
    manager_approver?: {
        id: number;
        name: string;
    };
    rejected_by_user?: {
        id: number;
        name: string;
    };
    status_logs?: ReceiptStatusLog[];
}

export interface InAppNotification {
    id: string;
    type: string;
    notifiable_type: string;
    notifiable_id: number;
    data: {
        receipt_id?: number;
        receipt_number?: string;
        status?: string;
        title?: string;
        message: string;
        amount?: number;
        formatted_amount?: string;
        booking_code?: string;
        customer_name?: string;
        action_url?: string;
        icon?: string;
        color?: string;
    };
    read_at?: string | null;
    created_at: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    app_settings?: AppSettings;
    notifications?: {
        unread_count: number;
        recent: InAppNotification[];
    };
    flash?: {
        success?: string;
        error?: string;
    };
};

