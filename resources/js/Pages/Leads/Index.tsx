import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
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
    Building2
} from 'lucide-react';
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
    address?: string | null;
    source: string;
    status: 'new' | 'contacted' | 'survey_visit' | 'booking' | 'rejected';
    notes?: string | null;
    whatsapp_url?: string | null;
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
    rejected: number;
}

interface Props {
    leads: PaginatedLeads;
    projects: ProjectOption[];
    developers: DeveloperOption[];
    salesUsers: SalesUserOption[];
    stats: LeadStats;
    filters?: {
        search?: string;
        project_id?: string;
        status?: string;
        sales_id?: string;
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
    filters,
    isAgentOnly = false,
}: Props) {
    const { user, can, isSuperAdmin, isSalesManager, isSalesAgent } = useAuthorization();

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

    // Filters state
    const [search, setSearch] = useState(filters?.search || '');
    const [projectId, setProjectId] = useState<string>(filters?.project_id || 'all');
    const [statusFilter, setStatusFilter] = useState<string>(filters?.status || 'all');
    const [salesFilter, setSalesFilter] = useState<string>(filters?.sales_id || 'all');

    // Dialogs state
    const [leadDialogOpen, setLeadDialogOpen] = useState(false);
    const [editingLead, setEditingLead] = useState<LeadData | null>(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [leadToDelete, setLeadToDelete] = useState<LeadData | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Quick status change
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [targetLeadForStatus, setTargetLeadForStatus] = useState<LeadData | null>(null);
    const [selectedNewStatus, setSelectedNewStatus] = useState<string>('new');

    // Form
    const leadForm = useForm({
        housing_project_id: projects[0]?.id?.toString() || '',
        developer_id: projects[0]?.developer_id?.toString() || '',
        sales_id: isAgentOnly ? user?.id?.toString() || 'none' : 'none',
        name: '',
        whatsapp: '',
        email: '',
        address: '',
        source: 'Iklan Meta (Facebook/IG)',
        status: 'new',
        notes: '',
    });

    // Apply Filter
    const handleApplyFilter = () => {
        router.get(
            route('leads.index'),
            {
                search: search || undefined,
                project_id: projectId !== 'all' ? projectId : undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                sales_id: !isAgentOnly && salesFilter !== 'all' ? salesFilter : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleResetFilters = () => {
        setSearch('');
        setProjectId('all');
        setStatusFilter('all');
        setSalesFilter('all');
        router.get(route('leads.index'));
    };

    // Open Create Modal
    const handleOpenCreate = () => {
        setEditingLead(null);
        const defaultProject = projects[0];
        leadForm.reset();
        leadForm.setData({
            housing_project_id: defaultProject?.id?.toString() || '',
            developer_id: defaultProject?.developer_id?.toString() || '',
            sales_id: isAgentOnly ? user?.id?.toString() || 'none' : (salesUsers[0]?.id?.toString() || 'none'),
            name: '',
            whatsapp: '',
            email: '',
            address: '',
            source: 'Iklan Meta (Facebook/IG)',
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
            sales_id: lead.sales_id ? lead.sales_id.toString() : (isAgentOnly ? user?.id?.toString() || 'none' : 'none'),
            name: lead.name,
            whatsapp: lead.whatsapp,
            email: lead.email || '',
            address: lead.address || '',
            source: lead.source,
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
        setStatusModalOpen(true);
    };

    const handleSaveQuickStatus = () => {
        if (!targetLeadForStatus) return;
        router.patch(route('leads.update-status', targetLeadForStatus.id), {
            status: selectedNewStatus,
        }, {
            onSuccess: () => {
                setStatusModalOpen(false);
                setTargetLeadForStatus(null);
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
                    <Badge className="bg-sky-500/15 text-sky-600 dark:text-sky-400 hover:bg-sky-500/25 border-sky-500/30 gap-1">
                        <Clock className="size-3" />
                        Lead Baru
                    </Badge>
                );
            case 'contacted':
                return (
                    <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 hover:bg-blue-500/25 border-blue-500/30 gap-1">
                        <MessageSquare className="size-3" />
                        Dihubungi
                    </Badge>
                );
            case 'survey_visit':
                return (
                    <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 hover:bg-purple-500/25 border-purple-500/30 gap-1">
                        <CalendarCheck className="size-3" />
                        Janji Survey
                    </Badge>
                );
            case 'booking':
                return (
                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border-emerald-500/30 gap-1">
                        <CheckCircle2 className="size-3" />
                        Booking Unit
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25 border-rose-500/30 gap-1">
                        <XCircle className="size-3" />
                        Ditolak / Batal
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

                    <div className="flex items-center gap-3">
                        {can('create-leads') && (
                            <Button
                                onClick={handleOpenCreate}
                                className="h-10 px-4 gap-2 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 font-medium"
                            >
                                <Plus className="size-4" />
                                Tambah Konsumen Baru
                            </Button>
                        )}
                    </div>
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

                            {!isAgentOnly && (
                                <div>
                                    <Select value={salesFilter} onValueChange={setSalesFilter}>
                                        <SelectTrigger className="h-10 bg-background">
                                            <SelectValue placeholder="Semua Sales" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Sales Marketing</SelectItem>
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
                                {(search || projectId !== 'all' || statusFilter !== 'all' || (!isAgentOnly && salesFilter !== 'all')) && (
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
                    <CardHeader className="px-6 py-4 border-b border-border/70 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base font-semibold">Daftar Prospek Konsumen</CardTitle>
                            <CardDescription className="text-xs">
                                Menampilkan {leads.data.length} dari total {leads.total} prospek tercatat
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                    <TableHead className="w-[70px]">No</TableHead>
                                    <TableHead>Konsumen & Kontak</TableHead>
                                    <TableHead>Proyek Peminatan</TableHead>
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
                                        <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
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
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-sm text-foreground">
                                                        {lead.name}
                                                    </span>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <a
                                                            href={lead.whatsapp_url || `https://wa.me/${lead.whatsapp}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 hover:underline font-medium"
                                                            title="Chat langsung via WhatsApp"
                                                        >
                                                            <Phone className="size-3" />
                                                            {lead.whatsapp}
                                                            <ExternalLink className="size-2.5" />
                                                        </a>
                                                    </div>
                                                    {lead.email && (
                                                        <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                                            <Mail className="size-3" />
                                                            {lead.email}
                                                        </span>
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
                                            <TableCell>
                                                {lead.sales ? (
                                                    <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                                                        <UserCheck className="size-3.5 text-primary" />
                                                        {lead.sales.name}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground italic">Belum di-assign</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-xs font-normal bg-background">
                                                    {lead.source}
                                                </Badge>
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
                <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-background">
                    <DialogHeader className="px-6 py-5 border-b border-border/80">
                        <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                            <Users className="size-5 text-primary" />
                            {editingLead ? 'Edit Data Konsumen Prospek' : 'Tambah Data Konsumen Baru'}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            {editingLead
                                ? 'Perbarui data kontak, status pipeline, dan penugasan marketing.'
                                : 'Input calon pembeli ke sistem CRM pipeline perumahan.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmitLead} className="flex flex-col flex-1 overflow-hidden">
                        <div className="px-6 py-5 max-h-[68vh] overflow-y-auto space-y-4 custom-scrollbar overscroll-contain">
                            {/* Project & Tenant Selection */}
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

                                <div className="space-y-1.5">
                                    <Label htmlFor="lead_sales">Sales In Charge (Marketing)</Label>
                                    <Select
                                        value={leadForm.data.sales_id}
                                        onValueChange={(val) => leadForm.setData('sales_id', val)}
                                        disabled={isAgentOnly}
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
                                    {isAgentOnly && (
                                        <p className="text-[11px] text-muted-foreground">
                                            Otomatis terikat pada akun marketing Anda ({user?.name}).
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Consumer Name & Phone */}
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
                                    <Label htmlFor="lead_whatsapp">Nomor WhatsApp *</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                                            +62 / 08
                                        </span>
                                        <Input
                                            id="lead_whatsapp"
                                            placeholder="81234567890"
                                            value={leadForm.data.whatsapp}
                                            onChange={(e) => leadForm.setData('whatsapp', e.target.value)}
                                            className="h-10 pl-16 font-mono"
                                            required
                                        />
                                    </div>
                                    {leadForm.errors.whatsapp && (
                                        <p className="text-xs text-destructive">{leadForm.errors.whatsapp}</p>
                                    )}
                                </div>
                            </div>

                            {/* Email & Address */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                                <div className="space-y-1.5">
                                    <Label htmlFor="lead_address">Alamat / Domisili Kota</Label>
                                    <Input
                                        id="lead_address"
                                        placeholder="Contoh: Kota Bandung Barat"
                                        value={leadForm.data.address}
                                        onChange={(e) => leadForm.setData('address', e.target.value)}
                                        className="h-10"
                                    />
                                </div>
                            </div>

                            {/* Lead Source & Pipeline Stage */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30 border border-border/60">
                                <div className="space-y-1.5">
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

                                <div className="space-y-1.5">
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
                                            <SelectItem value="rejected">Ditolak / Batal (Rejected)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="space-y-1.5">
                                <Label htmlFor="lead_notes">Catatan & Kebutuhan Konsumen</Label>
                                <Textarea
                                    id="lead_notes"
                                    placeholder="Tertarik tipe 36/60 kavling sudut, rencana pembayaran cash bertahap / KPR syariah..."
                                    value={leadForm.data.notes}
                                    onChange={(e) => leadForm.setData('notes', e.target.value)}
                                    rows={3}
                                />
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
                                <SelectItem value="rejected">Ditolak / Batal (Rejected)</SelectItem>
                            </SelectContent>
                        </Select>
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
        </AuthenticatedLayout>
    );
}
