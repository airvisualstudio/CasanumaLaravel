import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    CreditCard,
    Plus,
    Search,
    Loader2,
    X,
    Filter,
    CheckCircle2,
    Clock,
    FileText,
    ExternalLink,
    DollarSign,
    Calendar,
    Phone,
    XCircle,
    UserCheck,
    Layers,
    Receipt,
    Printer,
    Landmark,
    ShieldCheck,
    AlertCircle,
    TrendingUp,
    ChevronRight,
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
import CreateBookingDialog from './Partials/CreateBookingDialog';
import TransactionDossierDialog from './Partials/TransactionDossierDialog';
import SprPrintModal from './Partials/SprPrintModal';

interface ProjectOption {
    id: number;
    name: string;
}

interface AvailableUnit {
    id: number;
    cluster_id: number;
    unit_type_id: number;
    block: string;
    unit_number: string;
    unit_code: string;
    base_price: number | string;
    cluster?: {
        name: string;
        project?: {
            id: number;
            name: string;
        } | null;
    } | null;
    unit_type?: {
        name: string;
        surface_area?: number | string;
        building_area?: number | string;
    } | null;
}

interface LeadOption {
    id: number;
    name: string;
    whatsapp: string;
    email?: string | null;
    housing_project_id: number;
    nik?: string | null;
    npwp?: string | null;
    job_type?: string | null;
    monthly_income?: number | string | null;
}

interface SalesUserOption {
    id: number;
    name: string;
    email: string;
}

interface BookingData {
    id: number;
    booking_code: string;
    spr_number?: string | null;
    spr_date?: string | null;
    lead_id: number;
    housing_unit_id: number;
    sales_id?: number | null;
    payment_scheme: 'cash' | 'kpr' | 'cash_bertahap';
    base_price?: number | string | null;
    additional_price?: number | string | null;
    discount_amount?: number | string | null;
    legal_fees?: number | string | null;
    total_price?: number | string | null;
    booking_fee: number | string;
    formatted_booking_fee: string;
    formatted_base_price?: string;
    formatted_total_price?: string;
    formatted_dp_amount?: string;
    formatted_remaining_amount?: string;
    total_paid?: number;
    formatted_total_paid?: string;
    dp_amount?: number | string | null;
    dp_installments_count?: number | null;
    remaining_amount?: number | string | null;
    transfer_proof?: string | null;
    transfer_proof_url?: string | null;
    transaction_date: string;
    status: 'pending_approval' | 'approved' | 'in_payment' | 'kpr_process' | 'ready_for_akad' | 'completed' | 'cancelled';
    approved_by_manager_id?: number | null;
    approved_by_manager_at?: string | null;
    approved_by_finance_id?: number | null;
    approved_by_finance_at?: string | null;
    approved_by_manager?: { id: number; name: string } | null;
    approved_by_finance?: { id: number; name: string } | null;
    rejection_reason?: string | null;
    notes?: string | null;
    lead?: {
        id: number;
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
        marital_status?: string | null;
        spouse_name?: string | null;
        emergency_contact_name?: string | null;
        emergency_contact_relation?: string | null;
        emergency_contact_phone?: string | null;
        address?: string | null;
    } | null;
    unit?: {
        id: number;
        unit_code: string;
        base_price: number | string;
        cluster?: {
            name: string;
            project?: {
                id: number;
                name: string;
            } | null;
        } | null;
        unit_type?: {
            name: string;
            surface_area: number | string;
            building_area: number | string;
        } | null;
    } | null;
    sales?: {
        id: number;
        name: string;
        email: string;
    } | null;
    payments?: any[];
    kpr_application?: any;
    created_at?: string;
}

interface PaginatedBookings {
    data: BookingData[];
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

interface BookingStats {
    total: number;
    pending_approval: number;
    total_fee: number;
    total_turnover: number;
    kpr_count: number;
    cash_count: number;
    cash_bertahap_count: number;
    pending_payments_count: number;
}

interface Props {
    bookings: PaginatedBookings;
    projects: ProjectOption[];
    availableUnits: AvailableUnit[];
    leads: LeadOption[];
    salesUsers: SalesUserOption[];
    stats: BookingStats;
    filters?: {
        search?: string;
        project_id?: string;
        payment_scheme?: string;
        status?: string;
    };
}

export default function BookingsIndex({
    bookings,
    projects,
    availableUnits,
    leads,
    salesUsers,
    stats,
    filters,
}: Props) {
    const { can, isSuperAdmin, isFinance, isSalesManager } = useAuthorization();

    // Filters
    const [search, setSearch] = useState(filters?.search || '');
    const [projectId, setProjectId] = useState<string>(filters?.project_id || 'all');
    const [paymentScheme, setPaymentScheme] = useState<string>(filters?.payment_scheme || 'all');
    const [statusFilter, setStatusFilter] = useState<string>(filters?.status || 'all');

    // Dialog States
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [dossierDialogOpen, setDossierDialogOpen] = useState(false);
    const [selectedBookingForDossier, setSelectedBookingForDossier] = useState<BookingData | null>(null);

    const [printModalOpen, setPrintModalOpen] = useState(false);
    const [selectedBookingForPrint, setSelectedBookingForPrint] = useState<BookingData | null>(null);

    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState<BookingData | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);

    const formatRp = (val: number | string | undefined | null) => {
        const num = typeof val === 'string' ? parseFloat(val) : Number(val || 0);
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(isNaN(num) ? 0 : num);
    };

    const handleApplyFilter = () => {
        router.get(
            route('bookings.index'),
            {
                search: search || undefined,
                project_id: projectId !== 'all' ? projectId : undefined,
                payment_scheme: paymentScheme !== 'all' ? paymentScheme : undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
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
        setPaymentScheme('all');
        setStatusFilter('all');
        router.get(route('bookings.index'));
    };

    const handleOpenDossier = (booking: BookingData) => {
        setSelectedBookingForDossier(booking);
        setDossierDialogOpen(true);
    };

    const handleOpenPrint = (booking: BookingData) => {
        setSelectedBookingForPrint(booking);
        setPrintModalOpen(true);
    };

    const confirmCancelBooking = (booking: BookingData) => {
        setBookingToCancel(booking);
        setCancelReason('');
        setCancelDialogOpen(true);
    };

    const handleCancelBooking = () => {
        if (!bookingToCancel) return;
        setIsCancelling(true);

        router.post(
            route('bookings.cancel', bookingToCancel.id),
            { reason: cancelReason },
            {
                onFinish: () => {
                    setIsCancelling(false);
                    setCancelDialogOpen(false);
                    setBookingToCancel(null);
                },
            }
        );
    };

    const statusBadge = (status: string) => {
        switch (status) {
            case 'pending_approval':
                return (
                    <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1 font-medium">
                        <Clock className="size-3" />
                        Pending Approval
                    </Badge>
                );
            case 'approved':
                return (
                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 font-medium">
                        <CheckCircle2 className="size-3" />
                        Booking Approved
                    </Badge>
                );
            case 'in_payment':
                return (
                    <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 gap-1 font-medium">
                        <Receipt className="size-3" />
                        Termin DP/Cicilan
                    </Badge>
                );
            case 'kpr_process':
                return (
                    <Badge className="bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 gap-1 font-medium">
                        <Landmark className="size-3" />
                        Proses KPR Bank
                    </Badge>
                );
            case 'ready_for_akad':
                return (
                    <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30 gap-1 font-medium">
                        <ShieldCheck className="size-3" />
                        Siap Akad Kredit
                    </Badge>
                );
            case 'completed':
                return (
                    <Badge className="bg-emerald-600 text-white border-emerald-600 gap-1 font-medium">
                        <CheckCircle2 className="size-3" />
                        Selesai (Sold)
                    </Badge>
                );
            case 'cancelled':
                return (
                    <Badge variant="destructive" className="gap-1 font-medium">
                        <XCircle className="size-3" />
                        Dibatalkan
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Alur Transaksi, Booking & SPR - Casanuma CRM" />

            <div className="space-y-6">
                {/* Header Page */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                            <CreditCard className="size-6 text-primary" />
                            Transaksi Booking & Dokumen SPR
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Manajemen alur transaksi properti menyeluruh: Uang Tanda Jadi, approval berjenjang, jadwal angsuran DP, dan pemantauan KPR perbankan.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => router.get(route('siteplan.index'))}
                            className="h-10 px-4 gap-2 border-primary/40 text-primary hover:bg-primary/10"
                        >
                            <Layers className="size-4" />
                            Peta Siteplan Kavling
                        </Button>

                        {can('create-bookings') && (
                            <Button
                                onClick={() => setCreateDialogOpen(true)}
                                className="h-10 px-4 gap-2 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 font-medium"
                                disabled={availableUnits.length === 0}
                            >
                                <Plus className="size-4" />
                                Input Booking Unit
                            </Button>
                        )}
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="shadow-none border-border/80">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Total Transaksi Aktif</p>
                                <h3 className="text-2xl font-bold text-foreground mt-1">{stats.total} Transaksi</h3>
                                <p className="text-[11px] text-muted-foreground mt-0.5">Unit kavling terikat</p>
                            </div>
                            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Receipt className="size-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className={cn(
                        'shadow-none border-border/80 border-l-4',
                        stats.pending_approval > 0 ? 'border-l-amber-500 bg-amber-500/5' : 'border-l-emerald-500'
                    )}>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Pending Approval</p>
                                <h3 className={cn(
                                    'text-2xl font-bold mt-1',
                                    stats.pending_approval > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'
                                )}>
                                    {stats.pending_approval} Transaksi
                                </h3>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                    {stats.pending_approval > 0 ? 'Perlu tindakan review' : 'Semua sudah disetujui'}
                                </p>
                            </div>
                            <div className={cn(
                                'size-10 rounded-xl flex items-center justify-center',
                                stats.pending_approval > 0 ? 'bg-amber-500/15 text-amber-600' : 'bg-muted text-muted-foreground'
                            )}>
                                <Clock className="size-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-none border-border/80 border-l-4 border-l-emerald-500">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Total Uang Tanda Jadi</p>
                                <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                                    {formatRp(stats.total_fee)}
                                </h3>
                                <p className="text-[11px] text-muted-foreground mt-0.5">Dana masuk transaksi</p>
                            </div>
                            <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <DollarSign className="size-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-none border-border/80 border-l-4 border-l-blue-500">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Omset Penjualan Aktif</p>
                                <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                                    {formatRp(stats.total_turnover)}
                                </h3>
                                <p className="text-[11px] text-muted-foreground mt-0.5">KPR: {stats.kpr_count} • Cash: {stats.cash_count + stats.cash_bertahap_count}</p>
                            </div>
                            <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <TrendingUp className="size-5" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter and Search Panel */}
                <Card className="shadow-none border-border/80">
                    <CardContent className="p-4 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                            <div className="relative lg:col-span-2">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari Kode BK / No SPR / Konsumen / NIK / Unit..."
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
                                        <SelectItem value="all">Semua Proyek</SelectItem>
                                        {projects.map((p) => (
                                            <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="h-10 bg-background">
                                        <SelectValue placeholder="Status Transaksi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        <SelectItem value="pending_approval">Pending Approval</SelectItem>
                                        <SelectItem value="approved">Booking Approved</SelectItem>
                                        <SelectItem value="in_payment">Termin DP/Cicilan</SelectItem>
                                        <SelectItem value="kpr_process">Proses KPR Bank</SelectItem>
                                        <SelectItem value="ready_for_akad">Siap Akad Kredit</SelectItem>
                                        <SelectItem value="completed">Selesai (Sold)</SelectItem>
                                        <SelectItem value="cancelled">Dibatalkan</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Select value={paymentScheme} onValueChange={setPaymentScheme}>
                                    <SelectTrigger className="h-10 bg-background">
                                        <SelectValue placeholder="Skema Bayar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Skema</SelectItem>
                                        <SelectItem value="kpr">KPR Bank</SelectItem>
                                        <SelectItem value="cash">Cash Keras</SelectItem>
                                        <SelectItem value="cash_bertahap">Cash Bertahap</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={handleApplyFilter}
                                    className="h-10 flex-1 bg-primary text-primary-foreground gap-1.5"
                                >
                                    <Filter className="size-3.5" />
                                    Filter
                                </Button>
                                {(search || projectId !== 'all' || paymentScheme !== 'all' || statusFilter !== 'all') && (
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

                {/* Bookings Datatable */}
                <Card className="shadow-none border-border/80">
                    <CardHeader className="px-6 py-4 border-b border-border/70 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base font-semibold">Daftar Transaksi Kavling & SPR</CardTitle>
                            <CardDescription className="text-xs">
                                Menampilkan {bookings.data.length} dari total {bookings.total} data transaksi
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                    <TableHead className="w-[60px]">No</TableHead>
                                    <TableHead>No. Booking & SPR</TableHead>
                                    <TableHead>Konsumen (Lead)</TableHead>
                                    <TableHead>Objek Unit Kavling</TableHead>
                                    <TableHead>Skema & Nilai Transaksi</TableHead>
                                    <TableHead>Status Progres</TableHead>
                                    <TableHead>Sales PIC</TableHead>
                                    <TableHead className="w-[120px] text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bookings.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                                            Belum ada transaksi tanda jadi atau data sesuai filter ditemukan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    bookings.data.map((booking, idx) => (
                                        <TableRow key={booking.id} className="hover:bg-muted/30">
                                            <TableCell className="font-mono text-xs text-muted-foreground">
                                                {(bookings.current_page - 1) * bookings.per_page + idx + 1}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-mono font-bold text-xs text-foreground flex items-center gap-1.5">
                                                        <FileText className="size-3 text-primary" />
                                                        {booking.booking_code}
                                                    </span>
                                                    <span className="text-[11px] font-mono text-muted-foreground">
                                                        {booking.spr_number || 'SPR Belum Terbit'}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground mt-0.5">
                                                        Tgl: {booking.transaction_date}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-sm text-foreground">
                                                        {booking.lead?.name || '-'}
                                                    </span>
                                                    {booking.lead?.nik && (
                                                        <span className="font-mono text-[10px] text-muted-foreground">
                                                            NIK: {booking.lead.nik}
                                                        </span>
                                                    )}
                                                    {booking.lead?.whatsapp && (
                                                        <a
                                                            href={`https://wa.me/${booking.lead.whatsapp}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-[11px] text-emerald-600 hover:underline flex items-center gap-1 mt-0.5"
                                                        >
                                                            <Phone className="size-3" />
                                                            {booking.lead.whatsapp}
                                                        </a>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-0.5">
                                                    <Badge variant="outline" className="w-fit font-bold font-mono text-xs">
                                                        Blok {booking.unit?.unit_code || '-'}
                                                    </Badge>
                                                    <span className="text-[11px] text-muted-foreground">
                                                        {booking.unit?.cluster?.name} ({booking.unit?.cluster?.project?.name})
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm font-mono text-primary">
                                                        {formatRp(booking.total_price || booking.unit?.base_price)}
                                                    </span>
                                                    <span className="text-[11px] text-muted-foreground">
                                                        UTJ: <strong className="text-emerald-600 font-mono">{booking.formatted_booking_fee}</strong>
                                                    </span>
                                                    <Badge variant="secondary" className="w-fit text-[10px] mt-0.5 capitalize">
                                                        {booking.payment_scheme === 'cash_bertahap' ? 'Cash Bertahap' : booking.payment_scheme.toUpperCase()}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {statusBadge(booking.status)}
                                            </TableCell>
                                            <TableCell>
                                                {booking.sales ? (
                                                    <div className="flex items-center gap-1.5 text-xs text-foreground">
                                                        <UserCheck className="size-3.5 text-primary" />
                                                        {booking.sales.name}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleOpenDossier(booking)}
                                                        className="h-8 px-2.5 text-xs gap-1 text-primary hover:bg-primary/10"
                                                        title="Buka Dossier 360° Transaksi"
                                                    >
                                                        Dossier
                                                        <ChevronRight className="size-3.5" />
                                                    </Button>

                                                    {booking.status !== 'cancelled' && (can('cancel-bookings') || isSalesManager || isSuperAdmin) && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => confirmCancelBooking(booking)}
                                                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                            title="Batalkan Booking"
                                                        >
                                                            <X className="size-4" />
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
            </div>

            {/* Modal Form Input Booking */}
            <CreateBookingDialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                availableUnits={availableUnits}
                leads={leads}
                salesUsers={salesUsers}
            />

            {/* Modal Dossier 360° Transaksi */}
            <TransactionDossierDialog
                open={dossierDialogOpen}
                onClose={() => setDossierDialogOpen(false)}
                booking={selectedBookingForDossier}
                onOpenPrint={(booking) => {
                    handleOpenPrint(booking);
                }}
            />

            {/* Modal Cetak Surat Pesanan Rumah (SPR) */}
            <SprPrintModal
                open={printModalOpen}
                onClose={() => setPrintModalOpen(false)}
                booking={selectedBookingForPrint}
            />

            {/* Modal Dialog Konfirmasi Pembatalan Booking */}
            <Dialog open={cancelDialogOpen} onOpenChange={(open) => !open && !isCancelling && setCancelDialogOpen(false)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="size-5" />
                            Batalkan Transaksi Booking Kavling
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Membatalkan booking akan mengembalikan status unit kavling <strong className="font-mono text-foreground">{bookingToCancel?.unit?.unit_code}</strong> menjadi <strong>AVAILABLE</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-2 text-xs">
                        <Label>Alasan Pembatalan Transaksi</Label>
                        <Textarea
                            placeholder="Tulis alasan pembatalan (misal: BI checking tidak lolos, konsumen batal sepihak, ganti unit)..."
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setCancelDialogOpen(false)}
                            disabled={isCancelling}
                        >
                            Tutup
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleCancelBooking}
                            disabled={isCancelling}
                            className="gap-1.5"
                        >
                            {isCancelling && <Loader2 className="size-3.5 animate-spin" />}
                            Konfirmasi Batalkan Booking
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
