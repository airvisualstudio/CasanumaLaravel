import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, Link } from '@inertiajs/react';
import { useState, useMemo, FormEventHandler } from 'react';
import {
    Users,
    UserPlus,
    Plus,
    Search,
    Edit2,
    Trash2,
    Loader2,
    AlertTriangle,
    X,
    Filter,
    CheckCircle2,
    Clock,
    Phone,
    Mail,
    MapPin,
    Building,
    CalendarCheck,
    Briefcase,
    ExternalLink,
    Send,
    MessageSquare,
    UserCheck,
    XCircle,
    Building2,
    Columns3,
    History,
    Sparkles,
    FolderLock,
    Home,
    CreditCard,
    ShieldCheck,
    HeartHandshake,
    RefreshCw,
    ShieldAlert,
    Flame,
    Archive,
    RotateCcw,
    LayoutGrid,
    List,
} from 'lucide-react';
import FollowUpTimelineDialog from '@/Components/CRM/FollowUpTimelineDialog';
import CustomerDocumentVaultDialog from '@/Components/CRM/CustomerDocumentVaultDialog';
import { cn } from '@/lib/utils';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import { toast } from '@/Components/ui/sonner';
import { useAuthorization } from '@/hooks/useAuthorization';

interface ProjectOption {
    id: number;
    name: string;
    developer_id: number;
}

interface DeveloperOption {
    id: number;
    name: string;
}

interface SalesUserOption {
    id: number;
    name: string;
    email: string;
}

interface LeadData {
    id: number;
    developer_id?: number | null;
    housing_project_id: number;
    sales_id?: number | null;
    name: string;
    whatsapp: string;
    email?: string | null;
    nik?: string | null;
    npwp?: string | null;
    kk_number?: string | null;
    job_type?: string | null;
    company_name?: string | null;
    monthly_income?: number | string | null;
    formatted_monthly_income?: string | null;
    slik_status?: 'clear' | 'ragu' | 'blacklist' | string | null;
    slik_status_badge?: {
        label: string;
        color: string;
        status: string;
    } | null;
    marital_status?: 'single' | 'married' | 'divorced' | string | null;
    spouse_name?: string | null;
    spouse_nik?: string | null;
    max_budget?: number | string | null;
    formatted_max_budget?: string | null;
    preferred_unit_type?: string | null;
    address?: string | null;
    source: string;
    source_detail?: string | null;
    lead_temperature?: 'hot' | 'warm' | 'cold' | string | null;
    lead_temperature_badge?: {
        label: string;
        full_label: string;
        color: string;
        status: string;
    } | null;
    sla_status?: {
        is_overdue: boolean;
        days_passed: number;
        days_remaining: number;
        label: string;
        color: string;
    } | null;
    status: 'new' | 'contacted' | 'survey_visit' | 'booking' | 'spk_akad' | 'lost' | 'rejected' | string;
    is_archived?: boolean;
    archived_at?: string | null;
    archive_reason?: string | null;
    notes?: string | null;
    whatsapp_url?: string | null;
    next_follow_up_date?: string | null;
    formatted_next_follow_up?: string | null;
    next_follow_up_status?: 'overdue' | 'today' | 'upcoming' | null;
    project?: {
        id: number;
        name: string;
        developer_id: number;
    } | null;
    developer?: {
        id: number;
        name: string;
    } | null;
    sales?: {
        id: number;
        name: string;
        email: string;
    } | null;
    active_booking?: {
        id: number;
        booking_code: string;
        status: string;
        payment_scheme?: string;
        total_price?: number;
        unit?: {
            id: number;
            unit_code: string;
            block: string;
            unit_number: string;
            base_price: number;
            status: string;
            cluster?: {
                id: number;
                name: string;
            } | null;
            unit_type?: {
                id: number;
                name: string;
            } | null;
        } | null;
    } | null;
    created_at?: string;
}

interface PaginatedLeads {
    data: LeadData[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

interface LeadStats {
    total: number;
    new: number;
    contacted: number;
    survey_visit: number;
    booking: number;
    spk_akad?: number;
    lost?: number;
    rejected?: number;
}

interface Props {
    leads: PaginatedLeads;
    projects: ProjectOption[];
    developers: DeveloperOption[];
    salesUsers: SalesUserOption[];
    stats: LeadStats;
    pool?: 'active' | 'archived';
    poolStats?: {
        active: number;
        archived: number;
    };
    filters?: {
        search?: string;
        project_id?: string;
        status?: string;
        sales_id?: string;
        temperature?: string;
        pool?: string;
    };
    isAgentOnly?: boolean;
}

const SOURCE_OPTIONS = [
    'Iklan Meta (Facebook/IG)',
    'Walk-in / Pameran Mall',
    'Website Casanuma',
    'Referensi / Word of Mouth',
    'TikTok Ads',
    'Spanduk / Baliho Kawasan',
    'Agen Properti Rekanan',
    'Lainnya',
];

export default function LeadsIndex({
    leads,
    projects,
    developers,
    salesUsers,
    stats,
    pool = 'active',
    poolStats,
    filters,
    isAgentOnly = false,
}: Props) {
    const { user, can, isSuperAdmin, isSalesManager, isSalesAgent } = useAuthorization();

    // Pool workspace state
    const [currentPool, setCurrentPool] = useState<'active' | 'archived'>((filters?.pool as 'active' | 'archived') || pool);

    // View mode state (table vs card) - default 'card'
    const [viewMode, setViewMode] = useState<'table' | 'card'>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('leads_view_mode_v2') as 'table' | 'card') || 'card';
        }
        return 'card';
    });

    const handleToggleViewMode = (mode: 'table' | 'card') => {
        setViewMode(mode);
        if (typeof window !== 'undefined') {
            localStorage.setItem('leads_view_mode_v2', mode);
        }
    };

    const canEditLead = (lead: LeadData) => {
        if (!can('edit-leads')) return false;
        if (isSuperAdmin || isSalesManager) return true;
        if (isSalesAgent) return Number(lead.sales_id) === Number(user?.id);
        return false;
    };

    const canDeleteLead = (lead: LeadData) => {
        if (!can('delete-leads')) return false;
        return isSuperAdmin || isSalesManager;
    };

    const canAssignLeads = isSuperAdmin || isSalesManager || can('assign-leads');

    // Archive / Blacklist Pool Dialog
    const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
    const [leadToArchive, setLeadToArchive] = useState<LeadData | null>(null);
    const [archiveReason, setArchiveReason] = useState<string>('Tidak Berminat / Batal');
    const [customArchiveReason, setCustomArchiveReason] = useState<string>('');
    const [isArchiving, setIsArchiving] = useState(false);

    // Restore Lead Dialog
    const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
    const [leadToRestore, setLeadToRestore] = useState<LeadData | null>(null);
    const [isRestoring, setIsRestoring] = useState(false);

    const handleOpenArchive = (lead: LeadData) => {
        setLeadToArchive(lead);
        setArchiveReason('Tidak Berminat / Batal');
        setCustomArchiveReason('');
        setArchiveDialogOpen(true);
    };

    const handleConfirmArchive = () => {
        if (!leadToArchive) return;
        const finalReason = archiveReason === 'Lainnya' ? (customArchiveReason.trim() || 'Lainnya') : archiveReason;
        setIsArchiving(true);
        router.post(
            route('leads.archive', leadToArchive.id),
            { reason: finalReason },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setArchiveDialogOpen(false);
                    setLeadToArchive(null);
                    toast.success('Prospek berhasil dipindahkan ke Archive Pool.');
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] as string;
                    toast.error(msg || 'Gagal memindahkan prospek ke arsip.');
                },
                onFinish: () => setIsArchiving(false),
            }
        );
    };

    const handleOpenRestore = (lead: LeadData) => {
        setLeadToRestore(lead);
        setRestoreDialogOpen(true);
    };

    const handleConfirmRestore = () => {
        if (!leadToRestore) return;
        setIsRestoring(true);
        router.post(
            route('leads.restore', leadToRestore.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setRestoreDialogOpen(false);
                    setLeadToRestore(null);
                    toast.success('Prospek berhasil dipulihkan ke Workspace Aktif.');
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] as string;
                    toast.error(msg || 'Gagal memulihkan prospek.');
                },
                onFinish: () => setIsRestoring(false),
            }
        );
    };

    // Filters state
    const [search, setSearch] = useState(filters?.search || '');
    const [projectId, setProjectId] = useState<string>(filters?.project_id || 'all');
    const [statusFilter, setStatusFilter] = useState<string>(filters?.status || 'all');
    const [salesFilter, setSalesFilter] = useState<string>(filters?.sales_id || 'all');
    const [temperatureFilter, setTemperatureFilter] = useState<string>(filters?.temperature || 'all');

    // Dialogs state
    const [leadDialogOpen, setLeadDialogOpen] = useState(false);
    const [editingLead, setEditingLead] = useState<LeadData | null>(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [leadToDelete, setLeadToDelete] = useState<LeadData | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Re-assign Sales Dialog (Manager & Superadmin Only)
    const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
    const [leadToReassign, setLeadToReassign] = useState<LeadData | null>(null);
    const [newSalesId, setNewSalesId] = useState<string>('');
    const [reassignReason, setReassignReason] = useState<string>('');
    const [isReassigning, setIsReassigning] = useState(false);

    // SLA Audit Dialog (Manager & Superadmin Only)
    const [slaDialogOpen, setSlaDialogOpen] = useState(false);
    const [isCheckingSla, setIsCheckingSla] = useState(false);

    const handleTriggerCheckSla = () => {
        setIsCheckingSla(true);
        router.post(route('leads.check-sla'), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setSlaDialogOpen(false);
                toast.success('Pemeriksaan SLA prospek inaktif berhasil dijalankan.');
            },
            onError: () => {
                toast.error('Gagal menjalankan pemeriksaan SLA.');
            },
            onFinish: () => setIsCheckingSla(false),
        });
    };

    const handleOpenReassign = (lead: LeadData) => {
        if (!canAssignLeads) return;
        setLeadToReassign(lead);
        setNewSalesId(lead.sales_id ? lead.sales_id.toString() : '');
        setReassignReason('');
        setReassignDialogOpen(true);
    };

    const handleConfirmReassign = () => {
        if (!leadToReassign || !newSalesId) {
            toast.error('Pilih sales marketing tujuan.');
            return;
        }

        setIsReassigning(true);
        router.patch(
            route('leads.reassign', leadToReassign.id),
            {
                sales_id: newSalesId,
                reason: reassignReason || undefined,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setReassignDialogOpen(false);
                    setLeadToReassign(null);
                    toast.success('Penugasan sales berhasil dialihkan.');
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] as string;
                    toast.error(msg || 'Gagal mengalihkan penugasan sales.');
                },
                onFinish: () => setIsReassigning(false),
            }
        );
    };

    // Quick status change
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [targetLeadForStatus, setTargetLeadForStatus] = useState<LeadData | null>(null);
    const [selectedNewStatus, setSelectedNewStatus] = useState<string>('new');
    const [quickStatusReason, setQuickStatusReason] = useState<string>('');

    // Follow-Up Timeline Dialog
    const [timelineDialogOpen, setTimelineDialogOpen] = useState(false);
    const [selectedLeadForTimeline, setSelectedLeadForTimeline] = useState<LeadData | null>(null);

    const handleOpenTimeline = (lead: LeadData) => {
        setSelectedLeadForTimeline(lead);
        setTimelineDialogOpen(true);
    };

    // Customer Document Vault Dialog
    const [documentVaultOpen, setDocumentVaultOpen] = useState(false);
    const [selectedLeadForDocuments, setSelectedLeadForDocuments] = useState<LeadData | null>(null);

    const handleOpenDocumentVault = (lead: LeadData) => {
        setSelectedLeadForDocuments(lead);
        setDocumentVaultOpen(true);
    };

    // Form
    const leadForm = useForm({
        housing_project_id: projects[0]?.id?.toString() || '',
        developer_id: projects[0]?.developer_id?.toString() || '',
        sales_id: isAgentOnly ? user?.id?.toString() || 'none' : 'none',
        name: '',
        whatsapp: '',
        email: '',
        nik: '',
        job_type: '',
        company_name: '',
        monthly_income: '',
        slik_status: 'clear',
        marital_status: 'single',
        spouse_name: '',
        spouse_nik: '',
        max_budget: '',
        preferred_unit_type: '',
        address: '',
        source: 'Iklan Meta (Facebook/IG)',
        source_detail: '',
        lead_temperature: 'warm',
        status: 'new',
        notes: '',
    });

    // Apply Filter
    const executeFilter = (targetPool: 'active' | 'archived') => {
        router.get(
            route('leads.index'),
            {
                pool: targetPool !== 'active' ? targetPool : undefined,
                search: search || undefined,
                project_id: projectId !== 'all' ? projectId : undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                sales_id: !isAgentOnly && salesFilter !== 'all' ? salesFilter : undefined,
                temperature: temperatureFilter !== 'all' ? temperatureFilter : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleApplyFilter = () => {
        executeFilter(currentPool);
    };

    const handleSwitchPool = (targetPool: 'active' | 'archived') => {
        setCurrentPool(targetPool);
        executeFilter(targetPool);
    };

    const handleResetFilters = () => {
        setSearch('');
        setProjectId('all');
        setStatusFilter('all');
        setSalesFilter('all');
        setTemperatureFilter('all');
        router.get(route('leads.index'), {
            pool: currentPool !== 'active' ? currentPool : undefined,
        });
    };

    // Open Create Modal
    const handleOpenCreate = () => {
        setEditingLead(null);
        const defaultProject = projects[0];
        leadForm.reset();
        leadForm.setData({
            housing_project_id: defaultProject?.id?.toString() || '',
            developer_id: defaultProject?.developer_id?.toString() || '',
            sales_id: (!canAssignLeads || isAgentOnly) ? user?.id?.toString() || 'none' : (salesUsers[0]?.id?.toString() || 'none'),
            name: '',
            whatsapp: '',
            email: '',
            nik: '',
            job_type: '',
            company_name: '',
            monthly_income: '',
            slik_status: 'clear',
            marital_status: 'single',
            spouse_name: '',
            spouse_nik: '',
            max_budget: '',
            preferred_unit_type: '',
            address: '',
            source: 'Iklan Meta (Facebook/IG)',
            source_detail: '',
            lead_temperature: 'warm',
            status: 'new',
            notes: '',
        });
        leadForm.clearErrors();
        setLeadDialogOpen(true);
    };

    // Open Edit Modal
    const handleOpenEdit = (lead: LeadData) => {
        if (!canEditLead(lead)) return;
        setEditingLead(lead);
        leadForm.setData({
            housing_project_id: lead.housing_project_id.toString(),
            developer_id: lead.developer_id ? lead.developer_id.toString() : '',
            sales_id: lead.sales_id ? lead.sales_id.toString() : ((!canAssignLeads || isAgentOnly) ? user?.id?.toString() || 'none' : 'none'),
            name: lead.name,
            whatsapp: lead.whatsapp,
            email: lead.email || '',
            nik: lead.nik || '',
            job_type: lead.job_type || '',
            company_name: lead.company_name || '',
            monthly_income: lead.monthly_income ? lead.monthly_income.toString() : '',
            slik_status: lead.slik_status || 'clear',
            marital_status: lead.marital_status || 'single',
            spouse_name: lead.spouse_name || '',
            spouse_nik: lead.spouse_nik || '',
            max_budget: lead.max_budget ? lead.max_budget.toString() : '',
            preferred_unit_type: lead.preferred_unit_type || '',
            address: lead.address || '',
            source: lead.source,
            source_detail: lead.source_detail || '',
            lead_temperature: lead.lead_temperature || 'warm',
            status: lead.status,
            notes: lead.notes || '',
        });
        leadForm.clearErrors();
        setLeadDialogOpen(true);
    };

    const handleSubmitLead: FormEventHandler = (e) => {
        e.preventDefault();
        const payload = {
            ...leadForm.data,
            sales_id: isAgentOnly ? user?.id : (leadForm.data.sales_id === 'none' ? null : leadForm.data.sales_id),
        };

        if (editingLead) {
            router.put(route('leads.update', editingLead.id), payload, {
                onSuccess: () => setLeadDialogOpen(false),
            });
        } else {
            router.post(route('leads.store'), payload, {
                onSuccess: () => setLeadDialogOpen(false),
            });
        }
    };

    // Quick Status Change
    const openQuickStatus = (lead: LeadData) => {
        if (!canEditLead(lead)) return;
        setTargetLeadForStatus(lead);
        setSelectedNewStatus(lead.status);
        setQuickStatusReason('');
        setStatusModalOpen(true);
    };

    const handleSaveQuickStatus = () => {
        if (!targetLeadForStatus) return;
        if (selectedNewStatus === 'lost' && !quickStatusReason.trim()) {
            toast.error('Alasan pembatalan prospek (Lost) wajib diisi.');
            return;
        }

        router.patch(route('leads.update-status', targetLeadForStatus.id), {
            status: selectedNewStatus,
            reason: selectedNewStatus === 'lost' ? quickStatusReason.trim() : undefined,
        }, {
            onSuccess: () => {
                setStatusModalOpen(false);
                setTargetLeadForStatus(null);
                setQuickStatusReason('');
            }
        });
    };

    // Delete
    const confirmDelete = (lead: LeadData) => {
        if (!canDeleteLead(lead)) return;
        setLeadToDelete(lead);
        setDeleteDialogOpen(true);
    };

    const handleDelete = () => {
        if (!leadToDelete) return;
        setIsDeleting(true);

        router.delete(route('leads.destroy', leadToDelete.id), {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteDialogOpen(false);
                setLeadToDelete(null);
            },
        });
    };

    // Status Badge UI helper
    const renderStatusBadge = (status: string) => {
        switch (status) {
            case 'new':
                return (
                    <Badge className="bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30 gap-1">
                        <Clock className="size-3" />
                        Lead Baru
                    </Badge>
                );
            case 'contacted':
                return (
                    <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 gap-1">
                        <MessageSquare className="size-3" />
                        Dihubungi
                    </Badge>
                );
            case 'survey_visit':
                return (
                    <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30 gap-1">
                        <CalendarCheck className="size-3" />
                        Janji Survey
                    </Badge>
                );
            case 'booking':
                return (
                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1">
                        <CheckCircle2 className="size-3" />
                        Booking Unit
                    </Badge>
                );
            case 'spk_akad':
                return (
                    <Badge className="bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 gap-1">
                        <CheckCircle2 className="size-3" />
                        SPK / Akad
                    </Badge>
                );
            case 'lost':
            case 'rejected':
                return (
                    <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 gap-1">
                        <XCircle className="size-3" />
                        Lost / Batal
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Pipeline Leads & Konsumen - CRM" />

            <div className="space-y-6">
                {/* Header Page */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                            <Users className="size-6 text-primary" />
                            Pipeline Leads & Konsumen
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Manajemen prospek pembeli, penugasan sales marketing, riwayat follow up, dan status pipeline penjualan perumahan.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="h-10 px-3.5 gap-2 rounded-xl text-xs"
                        >
                            <Link href={route('leads.pipeline')}>
                                <Columns3 className="size-4 text-primary" />
                                <span>Kanban Pipeline</span>
                            </Link>
                        </Button>

                        {canAssignLeads && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSlaDialogOpen(true)}
                                className="h-10 px-3.5 gap-2 rounded-xl text-xs border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                            >
                                <ShieldAlert className="size-4 text-amber-500" />
                                <span>Audit SLA Inaktif</span>
                            </Button>
                        )}

                        {can('create-leads') && (
                            <Button
                                onClick={handleOpenCreate}
                                className="h-10 px-4 gap-2 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 font-medium rounded-xl text-xs"
                            >
                                <Plus className="size-4" />
                                Tambah Konsumen Baru
                            </Button>
                        )}
                    </div>
                </div>

                {/* Workspace Segregation Tabs (Active Workspace vs Archive & Blacklist Pool) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-3">
                    <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl w-fit">
                        <button
                            type="button"
                            onClick={() => handleSwitchPool('active')}
                            className={cn(
                                "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                                currentPool === 'active'
                                    ? "bg-background text-foreground shadow-xs ring-1 ring-border/50"
                                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                            )}
                        >
                            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Workspace Prospek Aktif</span>
                            <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-5 font-bold">
                                {poolStats?.active ?? (stats.total - (poolStats?.archived ?? 0))}
                            </Badge>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleSwitchPool('archived')}
                            className={cn(
                                "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                                currentPool === 'archived'
                                    ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500/30 font-bold"
                                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                            )}
                        >
                            <Archive className="size-3.5 text-rose-500" />
                            <span>Archive & Blacklist Pool</span>
                            <Badge variant="outline" className="ml-1 text-[10px] px-1.5 py-0 h-5 font-bold border-rose-500/30 text-rose-600 dark:text-rose-400">
                                {poolStats?.archived ?? 0}
                            </Badge>
                        </button>
                    </div>

                    {currentPool === 'archived' ? (
                        <div className="text-xs flex items-center gap-1.5 bg-rose-500/10 text-rose-700 dark:text-rose-400 px-3 py-1.5 rounded-lg border border-rose-500/20">
                            <Archive className="size-3.5 text-rose-500 shrink-0" />
                            <span>Database prospek inaktif: Leads dibatalkan (Lost), ditolak, diarsipkan, atau Blacklist SLIK.</span>
                        </div>
                    ) : (
                        <div className="text-xs text-muted-foreground hidden sm:flex items-center gap-1.5">
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                            <span>Workspace bersih khusus prospek berjalan & calon pembeli aktif.</span>
                        </div>
                    )}
                </div>

                {/* Pipeline Funnel KPI Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <Card className="shadow-none border-border/80">
                        <CardContent className="p-3.5 flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-medium text-muted-foreground">Total Leads</p>
                                <h3 className="text-xl font-bold text-foreground mt-0.5">{stats.total}</h3>
                                <p className="text-[10px] text-muted-foreground">Semua prospek</p>
                            </div>
                            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <Users className="size-4" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-none border-border/80 border-l-4 border-l-sky-500">
                        <CardContent className="p-3.5 flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-medium text-muted-foreground">Lead Baru</p>
                                <h3 className="text-xl font-bold text-sky-600 dark:text-sky-400 mt-0.5">{stats.new}</h3>
                                <p className="text-[10px] text-muted-foreground">Belum dihubungi</p>
                            </div>
                            <div className="size-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400">
                                <Clock className="size-4" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-none border-border/80 border-l-4 border-l-blue-500">
                        <CardContent className="p-3.5 flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-medium text-muted-foreground">Dihubungi</p>
                                <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">{stats.contacted}</h3>
                                <p className="text-[10px] text-muted-foreground">Follow-up berjalan</p>
                            </div>
                            <div className="size-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <MessageSquare className="size-4" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-none border-border/80 border-l-4 border-l-purple-500">
                        <CardContent className="p-3.5 flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-medium text-muted-foreground">Survey Lokasi</p>
                                <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-0.5">{stats.survey_visit}</h3>
                                <p className="text-[10px] text-muted-foreground">Jadwal visit kavling</p>
                            </div>
                            <div className="size-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                <CalendarCheck className="size-4" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-none border-border/80 border-l-4 border-l-emerald-500">
                        <CardContent className="p-3.5 flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-medium text-muted-foreground">Booking Unit</p>
                                <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{stats.booking}</h3>
                                <p className="text-[10px] text-muted-foreground">Masuk tanda jadi</p>
                            </div>
                            <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="size-4" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-none border-border/80 border-l-4 border-l-rose-500">
                        <CardContent className="p-3.5 flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-medium text-muted-foreground">Ditolak / Batal</p>
                                <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-0.5">{stats.rejected}</h3>
                                <p className="text-[10px] text-muted-foreground">Tidak prospek / BI check</p>
                            </div>
                            <div className="size-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
                                <XCircle className="size-4" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter & Search Panel */}
                <Card className="shadow-none border-border/80">
                    <CardContent className="p-4 space-y-3">
                        <div className={cn('grid grid-cols-1 sm:grid-cols-2 gap-3', isAgentOnly ? 'lg:grid-cols-5' : 'lg:grid-cols-6')}>
                            <div className="relative lg:col-span-2">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari nama, No WhatsApp, NIK, atau email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
                                    className="pl-9 h-10 bg-background"
                                />
                                {search && (
                                    <button
                                        onClick={() => setSearch('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="size-4" />
                                    </button>
                                )}
                            </div>

                            <div>
                                <Select value={projectId} onValueChange={setProjectId}>
                                    <SelectTrigger className="h-10 bg-background">
                                        <SelectValue placeholder="Semua Proyek" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Proyek Perumahan</SelectItem>
                                        {projects.map((p) => (
                                            <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="h-10 bg-background">
                                        <SelectValue placeholder="Tahapan Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Tahapan Pipeline</SelectItem>
                                        <SelectItem value="new">Lead Baru</SelectItem>
                                        <SelectItem value="contacted">Dihubungi</SelectItem>
                                        <SelectItem value="survey_visit">Janji Survey</SelectItem>
                                        <SelectItem value="booking">Booking Unit</SelectItem>
                                        <SelectItem value="rejected">Ditolak / Batal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Select value={temperatureFilter} onValueChange={setTemperatureFilter}>
                                    <SelectTrigger className="h-10 bg-background">
                                        <SelectValue placeholder="Suhu Prospek" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Suhu</SelectItem>
                                        <SelectItem value="hot">🔥 Hot (Prioritas)</SelectItem>
                                        <SelectItem value="warm">⚡ Warm (Menimbang)</SelectItem>
                                        <SelectItem value="cold">❄️ Cold (Dingin)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {!isAgentOnly && (
                                <div>
                                    <Select value={salesFilter} onValueChange={setSalesFilter}>
                                        <SelectTrigger className="h-10 bg-background">
                                            <SelectValue placeholder="Semua Sales" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Sales Marketing</SelectItem>
                                            <SelectItem value="unassigned">Belum Ditugaskan (Unassigned)</SelectItem>
                                            {salesUsers.map((s) => (
                                                <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={handleApplyFilter}
                                    className="h-10 flex-1 bg-primary text-primary-foreground gap-1.5"
                                >
                                    <Filter className="size-3.5" />
                                    Filter
                                </Button>
                                {(search || projectId !== 'all' || statusFilter !== 'all' || temperatureFilter !== 'all' || (!isAgentOnly && salesFilter !== 'all')) && (
                                    <Button
                                        variant="outline"
                                        onClick={handleResetFilters}
                                        className="h-10 px-3 text-xs"
                                    >
                                        Reset
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Leads Datatable Card */}
                <Card className="shadow-none border-border/80">
                    <CardHeader className="px-6 py-4 border-b border-border/70 flex flex-row items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-base font-semibold">Daftar Prospek Konsumen</CardTitle>
                            <CardDescription className="text-xs">
                                Menampilkan {leads.data.length} dari total {leads.total} prospek tercatat
                            </CardDescription>
                        </div>
                        {/* View Mode Switcher */}
                        <div className="flex items-center bg-muted/80 p-0.5 rounded-lg border border-border/60 shrink-0">
                            <button
                                type="button"
                                onClick={() => handleToggleViewMode('table')}
                                className={cn(
                                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer",
                                    viewMode === 'table'
                                        ? "bg-background text-foreground shadow-xs ring-1 ring-border/50"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                                title="Tampilan Tabel"
                            >
                                <List className="size-3.5" />
                                <span className="hidden sm:inline">Tabel</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleToggleViewMode('card')}
                                className={cn(
                                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer",
                                    viewMode === 'card'
                                        ? "bg-background text-foreground shadow-xs ring-1 ring-border/50"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                                title="Tampilan Kartu"
                            >
                                <LayoutGrid className="size-3.5" />
                                <span className="hidden sm:inline">Kartu</span>
                            </button>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {viewMode === 'card' ? (
                            <div className="p-5">
                                {leads.data.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        Tidak ada data prospek konsumen yang cocok dengan filter.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                                        {leads.data.map((lead) => (
                                            <div
                                                key={lead.id}
                                                className="group relative rounded-xl border border-border/80 bg-card p-4 hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between"
                                            >
                                                <div className="space-y-3">
                                                    {/* Card Header: Name, Temp, SLA & SLIK badges */}
                                                    <div>
                                                        <div className="flex items-start justify-between gap-2 mb-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenTimeline(lead)}
                                                                className="font-semibold text-sm text-foreground line-clamp-1 hover:text-primary hover:underline text-left cursor-pointer transition-colors"
                                                                title="Klik untuk buka riwayat timeline & detail konsumen"
                                                            >
                                                                {lead.name}
                                                            </button>
                                                            {lead.lead_temperature_badge && (
                                                                <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 font-bold shrink-0", lead.lead_temperature_badge.color)}>
                                                                    {lead.lead_temperature_badge.full_label}
                                                                </Badge>
                                                            )}
                                                        </div>

                                                        {/* Badges row: SLA & SLIK */}
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            {lead.sla_status && (
                                                                <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 font-mono font-semibold", lead.sla_status.color)}>
                                                                    <Clock className="size-2.5 mr-1 inline" />
                                                                    {lead.sla_status.label}
                                                                </Badge>
                                                            )}
                                                            {lead.slik_status === 'blacklist' ? (
                                                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-rose-500/10 text-rose-600 border-rose-500/30 font-medium">
                                                                    SLIK: Blacklist
                                                                </Badge>
                                                            ) : lead.slik_status === 'ragu' ? (
                                                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-amber-500/10 text-amber-600 border-amber-500/30 font-medium">
                                                                    SLIK: Ragu
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-medium">
                                                                    SLIK: Clear
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Contact & WA */}
                                                    <div className="flex flex-col gap-1 text-xs border-y border-border/50 py-2">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <a
                                                                href={lead.whatsapp_url || `https://wa.me/${lead.whatsapp}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium font-mono"
                                                                title="Chat langsung via WhatsApp"
                                                            >
                                                                <Phone className="size-3" />
                                                                {lead.whatsapp}
                                                                <ExternalLink className="size-2.5" />
                                                            </a>
                                                            <Badge variant="outline" className="text-[10px] font-normal bg-muted/40">
                                                                {lead.source}
                                                            </Badge>
                                                        </div>
                                                        {lead.email && (
                                                            <a
                                                                href={`mailto:${lead.email}`}
                                                                className="text-[11px] text-muted-foreground hover:text-primary hover:underline flex items-center gap-1 truncate cursor-pointer transition-colors"
                                                                title={`Kirim email ke ${lead.email}`}
                                                            >
                                                                <Mail className="size-3 shrink-0" />
                                                                <span className="truncate">{lead.email}</span>
                                                            </a>
                                                        )}
                                                        {lead.source_detail && (
                                                            <div className="text-[10px] text-muted-foreground/80 font-mono truncate" title={lead.source_detail}>
                                                                Sub: {lead.source_detail}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Property & Unit Context */}
                                                    <div className="space-y-1.5 text-xs">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="text-muted-foreground">Proyek:</span>
                                                            {lead.project ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setProjectId(lead.housing_project_id.toString());
                                                                        router.get(
                                                                            route('leads.index'),
                                                                            {
                                                                                pool: currentPool !== 'active' ? currentPool : undefined,
                                                                                project_id: lead.housing_project_id.toString(),
                                                                            },
                                                                            { preserveState: true, preserveScroll: true }
                                                                        );
                                                                    }}
                                                                    className="font-medium text-foreground text-right truncate max-w-[160px] hover:text-primary hover:underline cursor-pointer transition-colors"
                                                                    title={`Filter prospek untuk proyek ${lead.project.name}`}
                                                                >
                                                                    {lead.project.name}
                                                                </button>
                                                            ) : (
                                                                <span className="font-medium text-foreground text-right truncate max-w-[160px]">
                                                                    -
                                                                </span>
                                                            )}
                                                        </div>

                                                        {currentPool === 'archived' ? (
                                                            <div className="p-2 rounded-lg bg-rose-500/5 border border-rose-500/20 text-xs">
                                                                <span className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                                                                    <Archive className="size-3 text-rose-500 shrink-0" />
                                                                    {lead.archive_reason || 'Diarsipkan'}
                                                                </span>
                                                                {lead.archived_at && (
                                                                    <span className="text-[10px] text-muted-foreground font-mono block mt-0.5">
                                                                        {new Date(lead.archived_at).toLocaleDateString('id-ID', {
                                                                            day: 'numeric',
                                                                            month: 'short',
                                                                            year: 'numeric',
                                                                        })}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ) : lead.active_booking?.unit ? (
                                                            <div
                                                                onClick={() => router.visit(route('bookings.index', { search: lead.active_booking?.booking_code }))}
                                                                className="p-2 rounded-lg bg-primary/5 border border-primary/20 hover:bg-primary/10 hover:border-primary/40 cursor-pointer transition-all text-xs space-y-1 group/booking"
                                                                title={`Buka data booking & transaksi ${lead.active_booking.booking_code}`}
                                                            >
                                                                <div className="flex items-center justify-between font-bold text-foreground">
                                                                    <span className="flex items-center gap-1 group-hover/booking:text-primary transition-colors">
                                                                        <Home className="size-3 text-primary shrink-0" />
                                                                        {lead.active_booking.unit.unit_code}
                                                                    </span>
                                                                    <Badge variant="outline" className="text-[9px] px-1 py-0 bg-primary/10 text-primary border-primary/20 font-mono">
                                                                        {lead.active_booking.booking_code}
                                                                    </Badge>
                                                                </div>
                                                                <div className="text-[11px] text-muted-foreground truncate">
                                                                    {lead.active_booking.unit.cluster?.name || 'Cluster'} • Blok {lead.active_booking.unit.block}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            (lead.preferred_unit_type || lead.formatted_max_budget) && (
                                                                <div className="flex items-center justify-between gap-2 text-[11px]">
                                                                    <span className="text-muted-foreground">Preferensi:</span>
                                                                    {lead.preferred_unit_type ? (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => router.visit(route('properties.units.index', { search: lead.preferred_unit_type }))}
                                                                            className="font-medium text-primary text-right truncate hover:underline cursor-pointer"
                                                                            title={`Cari unit tipe ${lead.preferred_unit_type}`}
                                                                        >
                                                                            {lead.preferred_unit_type}{lead.formatted_max_budget ? ` (${lead.formatted_max_budget})` : ''}
                                                                        </button>
                                                                    ) : (
                                                                        <span className="font-medium text-primary text-right truncate">
                                                                            {lead.formatted_max_budget || '-'}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )
                                                        )}

                                                        {(lead.job_type || lead.formatted_monthly_income) && (
                                                            <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                                                                <span>Profesi:</span>
                                                                <span className="truncate max-w-[170px] text-foreground/90 font-medium">
                                                                    {lead.job_type || '-'}{lead.formatted_monthly_income ? ` (${lead.formatted_monthly_income})` : ''}
                                                                </span>
                                                            </div>
                                                        )}

                                                        {/* Sales PIC */}
                                                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
                                                            <span className="text-muted-foreground text-[11px]">Sales PIC:</span>
                                                            {canAssignLeads ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleOpenReassign(lead)}
                                                                    className="flex items-center gap-1 text-[11px] text-foreground font-medium hover:text-primary transition-colors cursor-pointer group/pic text-right truncate"
                                                                    title="Klik untuk alihkan sales PIC"
                                                                >
                                                                    <UserCheck className="size-3 text-primary shrink-0" />
                                                                    <span className="underline decoration-dashed underline-offset-2 truncate max-w-[130px]">
                                                                        {lead.sales ? lead.sales.name : 'Belum di-assign'}
                                                                    </span>
                                                                    <RefreshCw className="size-2.5 text-muted-foreground opacity-60 group-hover/pic:opacity-100 shrink-0" />
                                                                </button>
                                                            ) : (
                                                                <span className="text-[11px] font-medium text-foreground flex items-center gap-1 truncate max-w-[150px]">
                                                                    <UserCheck className="size-3 text-primary shrink-0" />
                                                                    {lead.sales ? lead.sales.name : 'Belum di-assign'}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Pipeline Status */}
                                                        <div className="flex items-center justify-between gap-2 pt-1">
                                                            <span className="text-muted-foreground text-[11px]">Status:</span>
                                                            {canEditLead(lead) ? (
                                                                <button
                                                                    onClick={() => openQuickStatus(lead)}
                                                                    className="cursor-pointer transition-opacity hover:opacity-80"
                                                                    title="Klik untuk ubah status pipeline"
                                                                >
                                                                    {renderStatusBadge(lead.status)}
                                                                </button>
                                                            ) : (
                                                                <div>{renderStatusBadge(lead.status)}</div>
                                                            )}
                                                        </div>

                                                        {lead.notes && (
                                                            <p className="text-[11px] text-muted-foreground line-clamp-2 italic bg-muted/30 p-1.5 rounded-md mt-1">
                                                                "{lead.notes}"
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Action Bar Footer */}
                                                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-1">
                                                    <div className="flex items-center gap-1">
                                                        {/* Timeline History */}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleOpenTimeline(lead)}
                                                            className="h-7 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10 border-primary/20"
                                                            title="Riwayat Follow-Up & Jadwal"
                                                        >
                                                            <History className="size-3 mr-1" />
                                                            <span>Timeline</span>
                                                        </Button>

                                                        {/* KYC Vault */}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleOpenDocumentVault(lead)}
                                                            className="h-7 px-2 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 border-indigo-500/20"
                                                            title="Berkas Dokumen KYC"
                                                        >
                                                            <FolderLock className="size-3 mr-1" />
                                                            <span>Berkas</span>
                                                        </Button>
                                                    </div>

                                                    <div className="flex items-center gap-0.5">
                                                        {/* Reassign (Manager & Superadmin) */}
                                                        {canAssignLeads && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleOpenReassign(lead)}
                                                                className="size-7 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                                                                title="Re-assign Sales PIC"
                                                            >
                                                                <RefreshCw className="size-3" />
                                                            </Button>
                                                        )}

                                                        {/* Archive / Restore */}
                                                        {canEditLead(lead) && (
                                                            currentPool === 'archived' ? (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleOpenRestore(lead)}
                                                                    className="size-7 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                                                                    title="Pulihkan ke Workspace Aktif"
                                                                >
                                                                    <RotateCcw className="size-3" />
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleOpenArchive(lead)}
                                                                    className="size-7 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
                                                                    title="Pindahkan ke Archive Pool"
                                                                >
                                                                    <Archive className="size-3" />
                                                                </Button>
                                                            )
                                                        )}

                                                        {/* Edit */}
                                                        {canEditLead(lead) && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleOpenEdit(lead)}
                                                                className="size-7 text-muted-foreground hover:text-foreground"
                                                                title="Edit Data Konsumen"
                                                            >
                                                                <Edit2 className="size-3" />
                                                            </Button>
                                                        )}

                                                        {/* Delete */}
                                                        {canDeleteLead(lead) && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => confirmDelete(lead)}
                                                                className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                title="Hapus Data Konsumen"
                                                            >
                                                                <Trash2 className="size-3" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                    <TableHead className="w-[70px]">No</TableHead>
                                    <TableHead>Konsumen & Kontak</TableHead>
                                    <TableHead>Proyek Peminatan</TableHead>
                                    {currentPool === 'archived' ? (
                                        <TableHead>Alasan & Tgl Arsip</TableHead>
                                    ) : (
                                        <TableHead>Kavling / Unit</TableHead>
                                    )}
                                    <TableHead>Sales In Charge</TableHead>
                                    <TableHead>Sumber Prospek</TableHead>
                                    <TableHead>Status Pipeline</TableHead>
                                    <TableHead>Catatan</TableHead>
                                    <TableHead className="w-[120px] text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leads.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                                            Tidak ada data prospek konsumen yang cocok dengan filter.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    leads.data.map((lead, idx) => (
                                        <TableRow key={lead.id} className="hover:bg-muted/30">
                                            <TableCell className="font-mono text-xs text-muted-foreground">
                                                {(leads.current_page - 1) * leads.per_page + idx + 1}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="font-semibold text-sm text-foreground">
                                                            {lead.name}
                                                        </span>
                                                        {lead.lead_temperature_badge && (
                                                            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 font-bold", lead.lead_temperature_badge.color)}>
                                                                {lead.lead_temperature_badge.full_label}
                                                            </Badge>
                                                        )}
                                                        {lead.sla_status && (
                                                            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 font-mono font-semibold", lead.sla_status.color)}>
                                                                <Clock className="size-2.5 mr-1 inline" />
                                                                {lead.sla_status.label}
                                                            </Badge>
                                                        )}
                                                        {lead.slik_status === 'blacklist' ? (
                                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-rose-500/10 text-rose-600 border-rose-500/30 font-medium">
                                                                SLIK: Blacklist
                                                            </Badge>
                                                        ) : lead.slik_status === 'ragu' ? (
                                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-amber-500/10 text-amber-600 border-amber-500/30 font-medium">
                                                                SLIK: Ragu
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-medium">
                                                                SLIK: Clear
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <a
                                                            href={lead.whatsapp_url || `https://wa.me/${lead.whatsapp}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 hover:underline font-medium font-mono"
                                                            title="Chat langsung via WhatsApp"
                                                        >
                                                            <Phone className="size-3" />
                                                            {lead.whatsapp}
                                                            <ExternalLink className="size-2.5" />
                                                        </a>
                                                        {lead.email && (
                                                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                                                <Mail className="size-3" />
                                                                {lead.email}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {(lead.job_type || lead.formatted_monthly_income) && (
                                                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                                            <Briefcase className="size-3 text-muted-foreground/70 flex-shrink-0" />
                                                            <span className="truncate max-w-[180px]">{lead.job_type || 'Pekerjaan'}</span>
                                                            {lead.formatted_monthly_income && (
                                                                <span className="font-mono text-foreground/80 font-medium">({lead.formatted_monthly_income})</span>
                                                            )}
                                                        </div>
                                                    )}
                                                    {(lead.preferred_unit_type || lead.formatted_max_budget) && (
                                                        <div className="text-[11px] text-primary/90 font-medium flex items-center gap-1">
                                                            <Home className="size-3 flex-shrink-0" />
                                                            <span className="truncate max-w-[160px]">{lead.preferred_unit_type || 'Unit'}</span>
                                                            {lead.formatted_max_budget && (
                                                                <span className="font-mono text-muted-foreground">(Max {lead.formatted_max_budget})</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-xs font-semibold text-foreground">
                                                        {lead.project?.name || '-'}
                                                    </span>
                                                    {lead.developer && (
                                                        <span className="text-[11px] text-muted-foreground">
                                                            PT: {lead.developer.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            {currentPool === 'archived' ? (
                                                <TableCell>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                                                            <Archive className="size-3 text-rose-500 shrink-0" />
                                                            {lead.archive_reason || (lead.status === 'lost' || lead.status === 'rejected' ? 'Prospek Batal / Lost' : (lead.slik_status === 'blacklist' ? 'Blacklist SLIK' : 'Diarsipkan'))}
                                                        </span>
                                                        {lead.archived_at ? (
                                                            <span className="text-[10px] text-muted-foreground font-mono">
                                                                {new Date(lead.archived_at).toLocaleDateString('id-ID', {
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                    year: 'numeric',
                                                                })}
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] text-muted-foreground font-mono">Arsip Status</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            ) : (
                                                <TableCell>
                                                    {lead.active_booking?.unit ? (
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="font-bold text-xs text-foreground flex items-center gap-1">
                                                                <Home className="size-3 text-primary flex-shrink-0" />
                                                                {lead.active_booking.unit.unit_code}
                                                            </span>
                                                            <span className="text-[11px] text-muted-foreground truncate max-w-[140px]">
                                                                {lead.active_booking.unit.cluster?.name || 'Cluster'} • Blok {lead.active_booking.unit.block}
                                                            </span>
                                                            <div className="flex items-center gap-1 mt-0.5">
                                                                <Badge variant="outline" className="text-[9px] px-1 py-0 bg-primary/5 text-primary border-primary/20 font-mono">
                                                                    {lead.active_booking.booking_code}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground italic">-</span>
                                                    )}
                                                </TableCell>
                                            )}
                                            <TableCell>
                                                {canAssignLeads ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenReassign(lead)}
                                                        className="flex items-center gap-1.5 text-xs text-foreground font-medium group text-left hover:text-primary transition-colors cursor-pointer"
                                                        title="Klik untuk re-assign / alihkan sales"
                                                    >
                                                        <UserCheck className="size-3.5 text-primary group-hover:scale-110 transition-transform" />
                                                        <span className="underline decoration-dashed underline-offset-2">
                                                            {lead.sales ? lead.sales.name : 'Belum di-assign'}
                                                        </span>
                                                        <RefreshCw className="size-3 text-muted-foreground opacity-60 group-hover:opacity-100 ml-0.5" />
                                                    </button>
                                                ) : (
                                                    lead.sales ? (
                                                        <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                                                            <UserCheck className="size-3.5 text-primary" />
                                                            {lead.sales.name}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground italic">Belum di-assign</span>
                                                    )
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-0.5">
                                                    <Badge variant="outline" className="text-xs font-normal bg-background w-fit">
                                                        {lead.source}
                                                    </Badge>
                                                    {lead.source_detail && (
                                                        <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[140px]" title={lead.source_detail}>
                                                            {lead.source_detail}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {canEditLead(lead) ? (
                                                    <button
                                                        onClick={() => openQuickStatus(lead)}
                                                        className="cursor-pointer transition-opacity hover:opacity-80"
                                                        title="Klik untuk ubah tahapan status"
                                                    >
                                                        {renderStatusBadge(lead.status)}
                                                    </button>
                                                ) : (
                                                    <div>{renderStatusBadge(lead.status)}</div>
                                                )}
                                            </TableCell>
                                            <TableCell className="max-w-[180px] truncate text-xs text-muted-foreground">
                                                {lead.notes || '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {/* Follow Up Timeline History */}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleOpenTimeline(lead)}
                                                        className="size-8 text-primary hover:text-primary hover:bg-primary/10"
                                                        title="Riwayat Follow-Up & Jadwal"
                                                    >
                                                        <History className="size-3.5" />
                                                    </Button>

                                                    {/* Dokumen Konsumen (KYC Vault) */}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleOpenDocumentVault(lead)}
                                                        className="size-8 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10"
                                                        title="Berkas Dokumen Konsumen (KYC Vault)"
                                                    >
                                                        <FolderLock className="size-3.5" />
                                                    </Button>

                                                    {/* Re-assign Sales (Manager & Superadmin) */}
                                                    {canAssignLeads && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleOpenReassign(lead)}
                                                            className="size-8 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                                                            title="Re-assign / Alihkan Sales PIC"
                                                        >
                                                            <RefreshCw className="size-3.5" />
                                                        </Button>
                                                    )}

                                                    {/* Archive / Restore Button */}
                                                    {canEditLead(lead) && (
                                                        currentPool === 'archived' ? (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleOpenRestore(lead)}
                                                                className="size-8 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                                                                title="Pulihkan ke Workspace Aktif"
                                                            >
                                                                <RotateCcw className="size-3.5" />
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleOpenArchive(lead)}
                                                                className="size-8 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
                                                                title="Pindahkan ke Archive / Blacklist Pool"
                                                            >
                                                                <Archive className="size-3.5" />
                                                            </Button>
                                                        )
                                                    )}

                                                    {canEditLead(lead) && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleOpenEdit(lead)}
                                                            className="size-8 text-muted-foreground hover:text-foreground"
                                                            title="Edit Data Konsumen"
                                                        >
                                                            <Edit2 className="size-3.5" />
                                                        </Button>
                                                    )}
                                                    {canDeleteLead(lead) && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => confirmDelete(lead)}
                                                            className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            title="Hapus Data Konsumen"
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {leads.last_page > 1 && (
                    <div className="flex items-center justify-between pt-2">
                        <p className="text-xs text-muted-foreground">
                            Halaman {leads.current_page} dari {leads.last_page}
                        </p>
                        <div className="flex items-center gap-1">
                            {leads.links.map((link, i) => {
                                if (!link.url) {
                                    return (
                                        <span
                                            key={i}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className="px-3 py-1.5 text-xs text-muted-foreground/50 border border-border/40 rounded opacity-50 cursor-not-allowed"
                                        />
                                    );
                                }
                                return (
                                    <button
                                        key={i}
                                        onClick={() => router.get(link.url!, {}, { preserveState: true, preserveScroll: true })}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={cn(
                                            'px-3 py-1.5 text-xs rounded border transition-colors',
                                            link.active
                                                ? 'bg-primary text-primary-foreground border-primary font-medium'
                                                : 'border-border text-foreground hover:bg-muted'
                                        )}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Form: Input / Edit Lead */}
            <Dialog open={leadDialogOpen} onOpenChange={setLeadDialogOpen}>
                <DialogContent className="sm:max-w-4xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden bg-background">
                    <DialogHeader className="px-6 py-4 border-b border-border/80 bg-muted/20">
                        <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                            <Users className="size-5 text-primary" />
                            {editingLead ? 'Edit Data Konsumen Prospek' : 'Tambah Data Konsumen Baru'}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            {editingLead
                                ? 'Perbarui data kontak, kelayakan finansial & BI Checking, penjamin, dan preferensi unit KPR.'
                                : 'Input calon pembeli ke sistem CRM dengan data lengkap untuk kelayakan KPR bank.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmitLead} className="flex flex-col flex-1 overflow-hidden">
                        <div className="px-6 py-5 max-h-[72vh] overflow-y-auto space-y-6 custom-scrollbar overscroll-contain">
                            {/* SECTION 1: DATA POKOK & KONTAK */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-1 border-b border-border/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    <Users className="size-4 text-primary" />
                                    <span>1. Data Pokok & Kontak Konsumen</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="lead_project">Proyek Perumahan *</Label>
                                        <Select
                                            value={leadForm.data.housing_project_id}
                                            onValueChange={(val) => {
                                                const sel = projects.find(p => p.id.toString() === val);
                                                leadForm.setData({
                                                    ...leadForm.data,
                                                    housing_project_id: val,
                                                    developer_id: sel ? sel.developer_id.toString() : leadForm.data.developer_id,
                                                });
                                            }}
                                        >
                                            <SelectTrigger id="lead_project" className="h-10">
                                                <SelectValue placeholder="Pilih Proyek" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {projects.map((p) => (
                                                    <SelectItem key={p.id} value={p.id.toString()}>
                                                        {p.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {leadForm.errors.housing_project_id && (
                                            <p className="text-xs text-destructive">{leadForm.errors.housing_project_id}</p>
                                        )}
                                    </div>

                                    {canAssignLeads ? (
                                        <div className="space-y-1.5">
                                            <Label htmlFor="lead_sales">Sales In Charge (Marketing)</Label>
                                            <Select
                                                value={leadForm.data.sales_id}
                                                onValueChange={(val) => leadForm.setData('sales_id', val)}
                                            >
                                                <SelectTrigger id="lead_sales" className="h-10 bg-background">
                                                    <SelectValue placeholder="Pilih Sales Marketing" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">Belum Ditugaskan (Unassigned)</SelectItem>
                                                    {salesUsers.map((u) => (
                                                        <SelectItem key={u.id} value={u.id.toString()}>
                                                            {u.name} ({u.email})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-[11px] text-muted-foreground">
                                                Otoritas Manager / Superadmin: Anda dapat menentukan sales in charge untuk prospek ini.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-1.5">
                                            <Label>Sales In Charge</Label>
                                            <div className="h-10 px-3 py-2 rounded-md border border-input bg-muted/40 flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2 text-foreground font-medium truncate">
                                                    <UserCheck className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                                    <span className="truncate">{user?.name || 'Sales In Charge'} (Akun Anda)</span>
                                                </div>
                                                <Badge variant="secondary" className="text-[10px] uppercase font-mono tracking-wider">
                                                    Auto-Assign
                                                </Badge>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground">
                                                Otomatis terikat pada akun Anda untuk memproteksi kepemilikan prospek.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="lead_name">Nama Lengkap Konsumen *</Label>
                                        <Input
                                            id="lead_name"
                                            placeholder="Contoh: Bpk. Hendra Gunawan"
                                            value={leadForm.data.name}
                                            onChange={(e) => leadForm.setData('name', e.target.value)}
                                            className="h-10"
                                            required
                                        />
                                        {leadForm.errors.name && (
                                            <p className="text-xs text-destructive">{leadForm.errors.name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="lead_nik">Nomor KTP / NIK Konsumen</Label>
                                        <Input
                                            id="lead_nik"
                                            placeholder="16 Digit NIK sesuai e-KTP"
                                            maxLength={20}
                                            value={leadForm.data.nik}
                                            onChange={(e) => leadForm.setData('nik', e.target.value)}
                                            className="h-10 font-mono"
                                        />
                                        {leadForm.errors.nik && (
                                            <p className="text-xs text-destructive">{leadForm.errors.nik}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="lead_whatsapp">Nomor WhatsApp *</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-mono">
                                                +62
                                            </span>
                                            <Input
                                                id="lead_whatsapp"
                                                placeholder="81234567890"
                                                value={leadForm.data.whatsapp}
                                                onChange={(e) => leadForm.setData('whatsapp', e.target.value)}
                                                className="h-10 pl-12 font-mono"
                                                required
                                            />
                                        </div>
                                        {leadForm.errors.whatsapp && (
                                            <p className="text-xs text-destructive">{leadForm.errors.whatsapp}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="lead_email">Email Konsumen (Opsional)</Label>
                                        <Input
                                            id="lead_email"
                                            type="email"
                                            placeholder="contoh@gmail.com"
                                            value={leadForm.data.email}
                                            onChange={(e) => leadForm.setData('email', e.target.value)}
                                            className="h-10"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-1.5 sm:col-span-1">
                                        <Label htmlFor="lead_address">Alamat / Domisili Kota</Label>
                                        <Input
                                            id="lead_address"
                                            placeholder="Contoh: Bandung Barat"
                                            value={leadForm.data.address}
                                            onChange={(e) => leadForm.setData('address', e.target.value)}
                                            className="h-10"
                                        />
                                    </div>

                                    <div className="space-y-1.5 sm:col-span-1">
                                        <Label htmlFor="lead_source">Sumber Prospek (Lead Source) *</Label>
                                        <Select
                                            value={leadForm.data.source}
                                            onValueChange={(val) => leadForm.setData('source', val)}
                                        >
                                            <SelectTrigger id="lead_source" className="h-10 bg-background">
                                                <SelectValue placeholder="Pilih Sumber" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {SOURCE_OPTIONS.map((opt) => (
                                                    <SelectItem key={opt} value={opt}>
                                                        {opt}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1.5 sm:col-span-1">
                                        <Label htmlFor="lead_status">Status Pipeline CRM *</Label>
                                        <Select
                                            value={leadForm.data.status}
                                            onValueChange={(val) => leadForm.setData('status', val as any)}
                                        >
                                            <SelectTrigger id="lead_status" className="h-10 bg-background">
                                                <SelectValue placeholder="Pilih Tahapan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="new">Lead Baru (New)</SelectItem>
                                                <SelectItem value="contacted">Dihubungi (Contacted)</SelectItem>
                                                <SelectItem value="survey_visit">Janji Survey Lokasi (Survey Visit)</SelectItem>
                                                <SelectItem value="booking">Booking Unit (Tanda Jadi)</SelectItem>
                                                <SelectItem value="spk_akad">Pemberkasan SPK / Akad KPR</SelectItem>
                                                <SelectItem value="rejected">Ditolak / Batal (Lost)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {leadForm.errors.status && (
                                            <p className="text-xs text-destructive">{leadForm.errors.status}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="lead_source_detail">Detail Sub-Sumber / Nama Campaign / Event</Label>
                                        <Input
                                            id="lead_source_detail"
                                            placeholder="Contoh: Meta Ads Promo DP 0%, Pameran Mall BEC, Brosur CFD..."
                                            value={leadForm.data.source_detail}
                                            onChange={(e) => leadForm.setData('source_detail', e.target.value)}
                                            className="h-10"
                                        />
                                        <p className="text-[11px] text-muted-foreground">
                                            Spesifikasikan judul campaign iklan atau nama event penarik konsumen.
                                        </p>
                                        {leadForm.errors.source_detail && (
                                            <p className="text-xs text-destructive">{leadForm.errors.source_detail}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="lead_temperature">Suhu / Prioritas Closing (Lead Temperature) *</Label>
                                        <Select
                                            value={leadForm.data.lead_temperature}
                                            onValueChange={(val) => leadForm.setData('lead_temperature', val)}
                                        >
                                            <SelectTrigger id="lead_temperature" className="h-10 bg-background">
                                                <SelectValue placeholder="Pilih Suhu Prospek" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="hot">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-rose-600 font-bold">🔥 HOT</span>
                                                        <span className="text-xs text-muted-foreground">(Prioritas Tinggi - Siap Beli)</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="warm">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-amber-600 font-bold">⚡ WARM</span>
                                                        <span className="text-xs text-muted-foreground">(Menimbang - Tertarik / Bandingkan Tipe)</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="cold">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sky-600 font-bold">❄️ COLD</span>
                                                        <span className="text-xs text-muted-foreground">(Dingin - Tanya-tanya / Rencana Panjang)</span>
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-[11px] text-muted-foreground">
                                            Bantu sales memprioritaskan follow-up yang paling prospektif closing.
                                        </p>
                                        {leadForm.errors.lead_temperature && (
                                            <p className="text-xs text-destructive">{leadForm.errors.lead_temperature}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 2: FINANSIAL & BI CHECKING / SLIK */}
                            <div className="p-4 rounded-xl border border-primary/20 bg-primary/[0.02] space-y-4">
                                <div className="flex items-center justify-between pb-1 border-b border-primary/10">
                                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                                        <CreditCard className="size-4" />
                                        <span>2. Profil Finansial & BI Checking (SLIK OJK)</span>
                                    </div>
                                    <span className="text-[11px] text-muted-foreground hidden sm:inline">
                                        Kelayakan Pengajuan KPR Bank
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="lead_job_type">Pekerjaan / Profesi</Label>
                                        <Select
                                            value={leadForm.data.job_type}
                                            onValueChange={(val) => leadForm.setData('job_type', val)}
                                        >
                                            <SelectTrigger id="lead_job_type" className="h-10 bg-background">
                                                <SelectValue placeholder="Pilih Profesi Konsumen" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PNS / ASN">PNS / ASN</SelectItem>
                                                <SelectItem value="Karyawan BUMN / BUMD">Karyawan BUMN / BUMD</SelectItem>
                                                <SelectItem value="Karyawan Swasta Tetap">Karyawan Swasta Tetap</SelectItem>
                                                <SelectItem value="Karyawan Swasta Kontrak">Karyawan Swasta Kontrak</SelectItem>
                                                <SelectItem value="Wiraswasta / Pengusaha">Wiraswasta / Pengusaha</SelectItem>
                                                <SelectItem value="Dokter / Tenaga Medis">Dokter / Tenaga Medis</SelectItem>
                                                <SelectItem value="Pengacara / Notaris">Pengacara / Notaris</SelectItem>
                                                <SelectItem value="TNI / POLRI">TNI / POLRI</SelectItem>
                                                <SelectItem value="Profesional / Freelancer">Profesional / Freelancer</SelectItem>
                                                <SelectItem value="Lainnya">Lainnya</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {leadForm.errors.job_type && (
                                            <p className="text-xs text-destructive">{leadForm.errors.job_type}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="lead_company_name">Nama Perusahaan / Instansi / Usaha</Label>
                                        <Input
                                            id="lead_company_name"
                                            placeholder="Contoh: PT Telekomunikasi Indonesia Tbk"
                                            value={leadForm.data.company_name}
                                            onChange={(e) => leadForm.setData('company_name', e.target.value)}
                                            className="h-10 bg-background"
                                        />
                                        {leadForm.errors.company_name && (
                                            <p className="text-xs text-destructive">{leadForm.errors.company_name}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="lead_monthly_income">Kisaran Gaji / Penghasilan Bulanan (Rp)</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                                                Rp
                                            </span>
                                            <Input
                                                id="lead_monthly_income"
                                                type="number"
                                                step="500000"
                                                min="0"
                                                placeholder="Contoh: 15000000"
                                                value={leadForm.data.monthly_income}
                                                onChange={(e) => leadForm.setData('monthly_income', e.target.value)}
                                                className="h-10 pl-10 font-mono bg-background"
                                            />
                                        </div>
                                        {leadForm.data.monthly_income && Number(leadForm.data.monthly_income) > 0 && (
                                            <p className="text-[11px] text-emerald-600 font-medium">
                                                Rp {Number(leadForm.data.monthly_income).toLocaleString('id-ID')} / bulan
                                            </p>
                                        )}
                                        {leadForm.errors.monthly_income && (
                                            <p className="text-xs text-destructive">{leadForm.errors.monthly_income}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="lead_slik_status">Status SLIK / BI Checking *</Label>
                                        <Select
                                            value={leadForm.data.slik_status}
                                            onValueChange={(val) => leadForm.setData('slik_status', val)}
                                        >
                                            <SelectTrigger id="lead_slik_status" className="h-10 bg-background">
                                                <SelectValue placeholder="Pilih Status BI Checking" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="clear">
                                                    <div className="flex items-center gap-2">
                                                        <span className="size-2 rounded-full bg-emerald-500" />
                                                        <span className="font-medium text-emerald-700 dark:text-emerald-400">Clear</span>
                                                        <span className="text-xs text-muted-foreground">(Kol 1 - Lancar / Siap KPR)</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="ragu">
                                                    <div className="flex items-center gap-2">
                                                        <span className="size-2 rounded-full bg-amber-500" />
                                                        <span className="font-medium text-amber-700 dark:text-amber-400">Ragu</span>
                                                        <span className="text-xs text-muted-foreground">(Kol 2 - Perlu Konfirmasi / Ada DPD)</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="blacklist">
                                                    <div className="flex items-center gap-2">
                                                        <span className="size-2 rounded-full bg-rose-500" />
                                                        <span className="font-medium text-rose-700 dark:text-rose-400">Blacklist</span>
                                                        <span className="text-xs text-muted-foreground">(Kol 3-5 - Macet / Gugur KPR)</span>
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {leadForm.errors.slik_status && (
                                            <p className="text-xs text-destructive">{leadForm.errors.slik_status}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 3: DATA PASANGAN / PENJAMIN */}
                            <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-4">
                                <div className="flex items-center justify-between pb-1 border-b border-border/50">
                                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        <HeartHandshake className="size-4 text-primary" />
                                        <span>3. Data Pasangan / Penjamin (Join Income KPR)</span>
                                    </div>
                                    <span className="text-[11px] text-muted-foreground hidden sm:inline">
                                        Syarat Berkas Bank Suami & Istri
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-1.5 sm:col-span-1">
                                        <Label htmlFor="lead_marital_status">Status Pernikahan</Label>
                                        <Select
                                            value={leadForm.data.marital_status}
                                            onValueChange={(val) => leadForm.setData('marital_status', val)}
                                        >
                                            <SelectTrigger id="lead_marital_status" className="h-10 bg-background">
                                                <SelectValue placeholder="Status Pernikahan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="single">Belum Menikah (Lajang)</SelectItem>
                                                <SelectItem value="married">Menikah</SelectItem>
                                                <SelectItem value="divorced">Cerai / Single Parent</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {leadForm.errors.marital_status && (
                                            <p className="text-xs text-destructive">{leadForm.errors.marital_status}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5 sm:col-span-1">
                                        <Label htmlFor="lead_spouse_name">Nama Pasangan / Penjamin</Label>
                                        <Input
                                            id="lead_spouse_name"
                                            placeholder="Nama Suami / Istri"
                                            value={leadForm.data.spouse_name}
                                            onChange={(e) => leadForm.setData('spouse_name', e.target.value)}
                                            className="h-10 bg-background"
                                        />
                                        {leadForm.errors.spouse_name && (
                                            <p className="text-xs text-destructive">{leadForm.errors.spouse_name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5 sm:col-span-1">
                                        <Label htmlFor="lead_spouse_nik">NIK Pasangan (16 Digit)</Label>
                                        <Input
                                            id="lead_spouse_nik"
                                            placeholder="Nomor KTP Pasangan"
                                            maxLength={20}
                                            value={leadForm.data.spouse_nik}
                                            onChange={(e) => leadForm.setData('spouse_nik', e.target.value)}
                                            className="h-10 font-mono bg-background"
                                        />
                                        {leadForm.errors.spouse_nik && (
                                            <p className="text-xs text-destructive">{leadForm.errors.spouse_nik}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 4: PREFERENSI UNIT & CATATAN */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-1 border-b border-border/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    <Home className="size-4 text-primary" />
                                    <span>4. Preferensi Unit & Kebutuhan Konsumen</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="lead_max_budget">Budget Maksimal Konsumen (Rp)</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                                                Rp
                                            </span>
                                            <Input
                                                id="lead_max_budget"
                                                type="number"
                                                step="5000000"
                                                min="0"
                                                placeholder="Contoh: 750000000"
                                                value={leadForm.data.max_budget}
                                                onChange={(e) => leadForm.setData('max_budget', e.target.value)}
                                                className="h-10 pl-10 font-mono"
                                            />
                                        </div>
                                        {leadForm.data.max_budget && Number(leadForm.data.max_budget) > 0 && (
                                            <p className="text-[11px] text-primary font-medium">
                                                Rp {Number(leadForm.data.max_budget).toLocaleString('id-ID')}
                                            </p>
                                        )}
                                        {leadForm.errors.max_budget && (
                                            <p className="text-xs text-destructive">{leadForm.errors.max_budget}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="lead_preferred_unit_type">Tipe Rumah yang Dicari</Label>
                                        <Input
                                            id="lead_preferred_unit_type"
                                            placeholder="Contoh: Tipe 36/60, Tipe 45 Hook, 2 Lantai..."
                                            value={leadForm.data.preferred_unit_type}
                                            onChange={(e) => leadForm.setData('preferred_unit_type', e.target.value)}
                                            className="h-10"
                                        />
                                        {leadForm.errors.preferred_unit_type && (
                                            <p className="text-xs text-destructive">{leadForm.errors.preferred_unit_type}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Notes */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="lead_notes">Catatan Tambahan & Preferensi Pembayaran</Label>
                                    <Textarea
                                        id="lead_notes"
                                        placeholder="Konsumen tertarik kavling sudut, rencana pembayaran join income suami-istri KPR BTN Syariah DP 10%..."
                                        value={leadForm.data.notes}
                                        onChange={(e) => leadForm.setData('notes', e.target.value)}
                                        rows={3}
                                    />
                                    {leadForm.errors.notes && (
                                        <p className="text-xs text-destructive">{leadForm.errors.notes}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="px-6 py-4 border-t border-border/80 bg-muted/20 sm:justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setLeadDialogOpen(false)}
                                disabled={leadForm.processing}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={leadForm.processing}
                                className="bg-primary text-primary-foreground gap-2"
                            >
                                {leadForm.processing && <Loader2 className="size-4 animate-spin" />}
                                {editingLead ? 'Simpan Perubahan' : 'Tambah Konsumen'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Quick Change Status */}
            <Dialog open={statusModalOpen} onOpenChange={setStatusModalOpen}>
                <DialogContent className="sm:max-w-md bg-background">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold">
                            Ubah Tahapan Pipeline: {targetLeadForStatus?.name}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Pindahkan prospek konsumen ke tahapan pipeline berikutnya.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-3">
                        <Label>Tahapan Status Baru</Label>
                        <Select value={selectedNewStatus} onValueChange={setSelectedNewStatus}>
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="Pilih status baru" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="new">Lead Baru (New)</SelectItem>
                                <SelectItem value="contacted">Dihubungi (Contacted)</SelectItem>
                                <SelectItem value="survey_visit">Janji Survey (Survey Visit)</SelectItem>
                                <SelectItem value="booking">Booking Unit (Tanda Jadi)</SelectItem>
                                <SelectItem value="spk_akad">SPK / Akad</SelectItem>
                                <SelectItem value="lost">Lost / Batal (Ditolak)</SelectItem>
                            </SelectContent>
                        </Select>

                        {selectedNewStatus === 'lost' && (
                            <div className="space-y-1.5 pt-2">
                                <Label className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                                    Alasan Pembatalan (Wajib Diisi) <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    rows={3}
                                    placeholder="Contoh: BI Checking / SLIK OJK ditolak bank, harga melebihi budget..."
                                    value={quickStatusReason}
                                    onChange={(e) => setQuickStatusReason(e.target.value)}
                                    className="text-xs resize-none"
                                />
                            </div>
                        )}
                    </div>

                    <DialogFooter className="sm:justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setStatusModalOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleSaveQuickStatus}
                            className="bg-primary text-primary-foreground"
                        >
                            Perbarui Tahapan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Delete Lead */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md bg-background">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="size-5" />
                            Hapus Data Prospek
                        </DialogTitle>
                        <DialogDescription className="text-sm pt-2">
                            Apakah Anda yakin ingin menghapus data prospek konsumen{' '}
                            <strong className="text-foreground">{leadToDelete?.name}</strong>?
                            Data ini akan dihapus dari pipeline CRM.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-end gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={isDeleting}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="gap-2"
                        >
                            {isDeleting && <Loader2 className="size-4 animate-spin" />}
                            Ya, Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Follow-up Timeline Dialog */}
            <FollowUpTimelineDialog
                open={timelineDialogOpen}
                onOpenChange={setTimelineDialogOpen}
                lead={selectedLeadForTimeline}
                onInteractionAdded={() => {
                    router.reload({ only: ['leads', 'stats'] });
                }}
            />

            {/* Customer Document Vault Dialog */}
            <CustomerDocumentVaultDialog
                open={documentVaultOpen}
                onClose={() => {
                    setDocumentVaultOpen(false);
                    setSelectedLeadForDocuments(null);
                }}
                lead={selectedLeadForDocuments}
            />

            {/* Re-assign Sales In Charge Dialog (Manager & Superadmin Only) */}
            <Dialog open={reassignDialogOpen} onOpenChange={setReassignDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                                <RefreshCw className="size-5" />
                            </div>
                            <span>Alihkan Sales In Charge</span>
                        </DialogTitle>
                        <DialogDescription>
                            Pindahkan kepemilikan konsumen ke tenaga marketing lain. Riwayat pengalihan ini akan otomatis dicatat ke riwayat audit aktivitas.
                        </DialogDescription>
                    </DialogHeader>

                    {leadToReassign && (
                        <div className="space-y-4 py-2">
                            {/* Current lead info */}
                            <div className="p-3 rounded-lg border bg-muted/30 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Nama Konsumen:</span>
                                    <span className="text-xs font-semibold text-foreground">{leadToReassign.name}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Proyek Perumahan:</span>
                                    <span className="text-xs font-medium text-foreground">{leadToReassign.project?.name || '-'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Sales Saat Ini:</span>
                                    <Badge variant="outline" className="text-xs">
                                        {leadToReassign.sales?.name || 'Belum Ditugaskan'}
                                    </Badge>
                                </div>
                            </div>

                            {/* New sales target */}
                            <div className="space-y-1.5">
                                <Label htmlFor="new_sales_target">Sales Marketing Tujuan *</Label>
                                <Select value={newSalesId} onValueChange={setNewSalesId}>
                                    <SelectTrigger id="new_sales_target" className="h-10 bg-background">
                                        <SelectValue placeholder="Pilih Sales Penerima" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {salesUsers.map((u) => (
                                            <SelectItem key={u.id} value={u.id.toString()}>
                                                {u.name} ({u.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Reason notes */}
                            <div className="space-y-1.5">
                                <Label htmlFor="reassign_reason">Alasan / Catatan Pengalihan (Opsional)</Label>
                                <Input
                                    id="reassign_reason"
                                    placeholder="Contoh: Rotasi leads bulanan, penyesuaian wilayah, sales berhalangan"
                                    value={reassignReason}
                                    onChange={(e) => setReassignReason(e.target.value)}
                                    className="h-10"
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setReassignDialogOpen(false)}
                            disabled={isReassigning}
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            onClick={handleConfirmReassign}
                            disabled={isReassigning || !newSalesId}
                            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                        >
                            {isReassigning ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <RefreshCw className="size-4" />
                            )}
                            Simpan Perubahan Sales
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Audit SLA Inaktif Dialog (Manager & Superadmin Only) */}
            <Dialog open={slaDialogOpen} onOpenChange={setSlaDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg">
                            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
                                <ShieldAlert className="size-5" />
                            </div>
                            <span>Audit & Eksekusi SLA Lead Inaktif</span>
                        </DialogTitle>
                        <DialogDescription>
                            Sistem akan memeriksa seluruh prospek berstatus <strong>Lead Baru (New)</strong> yang sudah ditugaskan ke sales namun <strong>tidak memiliki catatan follow-up selama lebih dari 7 hari</strong>. Prospek tersebut otomatis dicabut penugasannya dan dikembalikan ke status Unassigned.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-3.5 rounded-lg border bg-amber-500/5 border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 space-y-1.5">
                        <p className="font-semibold flex items-center gap-1.5">
                            <Clock className="size-4 text-amber-600 dark:text-amber-400" />
                            Aturan SLA Konversi Casanuma:
                        </p>
                        <p>
                            Mencegah prospek 'mati' di tangan sales tertentu agar database segera bisa di-reassign ke sales aktif lainnya.
                        </p>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setSlaDialogOpen(false)}
                            disabled={isCheckingSla}
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            onClick={handleTriggerCheckSla}
                            disabled={isCheckingSla}
                            className="bg-amber-600 hover:bg-amber-700 text-white gap-2"
                        >
                            {isCheckingSla ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <ShieldAlert className="size-4" />
                            )}
                            Jalankan Audit SLA Sekarang
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Archive / Blacklist Pool Dialog */}
            <Dialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg">
                            <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400">
                                <Archive className="size-5" />
                            </div>
                            <span>Arsipkan / Pindahkan ke Pool</span>
                        </DialogTitle>
                        <DialogDescription>
                            Pindahkan database prospek <strong>{leadToArchive?.name}</strong> ({leadToArchive?.whatsapp}) ke Archive & Blacklist Pool agar workspace utama tetap bersih.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="archive_reason">Alasan Pengarsipan / Batal</Label>
                            <Select value={archiveReason} onValueChange={setArchiveReason}>
                                <SelectTrigger id="archive_reason" className="h-10">
                                    <SelectValue placeholder="Pilih alasan arsip..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Tidak Berminat / Batal">Tidak Berminat / Batal</SelectItem>
                                    <SelectItem value="Nomor Tidak Aktif / Salah Sambung">Nomor Tidak Aktif / Salah Sambung</SelectItem>
                                    <SelectItem value="Budget Tidak Cukup / Belum Mampu">Budget Tidak Cukup / Belum Mampu</SelectItem>
                                    <SelectItem value="Blacklist SLIK / BI Checking">Blacklist SLIK / BI Checking</SelectItem>
                                    <SelectItem value="Sudah Beli di Proyek Kompetitor">Sudah Beli di Proyek Kompetitor</SelectItem>
                                    <SelectItem value="Prospek Tidak Menanggapi Follow-up">Prospek Tidak Menanggapi Follow-up</SelectItem>
                                    <SelectItem value="Lainnya">Lainnya (Ketik Manual)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {archiveReason === 'Lainnya' && (
                            <div className="space-y-1.5">
                                <Label htmlFor="custom_archive_reason">Keterangan Alasan Lainnya</Label>
                                <Input
                                    id="custom_archive_reason"
                                    placeholder="Tulis alasan pembatalan / pengarsipan..."
                                    value={customArchiveReason}
                                    onChange={(e) => setCustomArchiveReason(e.target.value)}
                                    className="h-10"
                                />
                            </div>
                        )}

                        <div className="p-3 rounded-lg border bg-rose-500/5 border-rose-500/20 text-xs text-rose-700 dark:text-rose-300 space-y-1">
                            <p className="font-semibold flex items-center gap-1">
                                <AlertTriangle className="size-3.5 text-rose-500" />
                                Dampak Pengarsipan:
                            </p>
                            <p>
                                Prospek ini akan dipindahkan dari workspace aktif ke Archive & Blacklist Pool. Prospek sewaktu-waktu tetap dapat dipulihkan kembali jika calon pembeli menghubungi kembali.
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setArchiveDialogOpen(false)}
                            disabled={isArchiving}
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            onClick={handleConfirmArchive}
                            disabled={isArchiving}
                            className="bg-rose-600 hover:bg-rose-700 text-white gap-2"
                        >
                            {isArchiving ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Archive className="size-4" />
                            )}
                            Pindahkan ke Archive Pool
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Restore Lead Dialog */}
            <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg">
                            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                                <RotateCcw className="size-5" />
                            </div>
                            <span>Pulihkan ke Workspace Aktif</span>
                        </DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin memulihkan prospek <strong>{leadToRestore?.name}</strong> ({leadToRestore?.whatsapp}) kembali ke <strong>Workspace Prospek Aktif</strong>?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-3.5 rounded-lg border bg-emerald-500/5 border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 space-y-1.5">
                        <p className="font-semibold flex items-center gap-1.5">
                            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                            Status Pemulihan:
                        </p>
                        <p>
                            Prospek akan kembali muncul di tabel utama dan tahapan status diset kembali ke <strong>Dihubungi (Contacted)</strong> untuk ditindaklanjuti sales marketing.
                        </p>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setRestoreDialogOpen(false)}
                            disabled={isRestoring}
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            onClick={handleConfirmRestore}
                            disabled={isRestoring}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                        >
                            {isRestoring ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <RotateCcw className="size-4" />
                            )}
                            Pulihkan ke Workspace Aktif
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
