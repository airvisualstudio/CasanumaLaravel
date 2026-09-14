import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState, useMemo, useRef, FormEventHandler } from 'react';
import {
    CreditCard,
    Home,
    Users,
    Plus,
    Search,
    Trash2,
    Loader2,
    AlertTriangle,
    X,
    Filter,
    CheckCircle2,
    Clock,
    FileText,
    ExternalLink,
    DollarSign,
    Upload,
    Calendar,
    Phone,
    XCircle,
    UserCheck,
    Layers,
    Receipt
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
    } | null;
}

interface LeadOption {
    id: number;
    name: string;
    whatsapp: string;
    housing_project_id: number;
}

interface SalesUserOption {
    id: number;
    name: string;
    email: string;
}

interface BookingData {
    id: number;
    booking_code: string;
    lead_id: number;
    housing_unit_id: number;
    sales_id?: number | null;
    payment_scheme: 'cash' | 'kpr' | 'cash_bertahap';
    booking_fee: number | string;
    formatted_booking_fee: string;
    transfer_proof?: string | null;
    transfer_proof_url?: string | null;
    transaction_date: string;
    status: 'confirmed' | 'cancelled' | 'completed';
    notes?: string | null;
    lead?: {
        id: number;
        name: string;
        whatsapp: string;
        email?: string | null;
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
    total_fee: number;
    kpr_count: number;
    cash_count: number;
    cash_bertahap_count: number;
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
    const { can } = useAuthorization();

    // Filters
    const [search, setSearch] = useState(filters?.search || '');
    const [projectId, setProjectId] = useState<string>(filters?.project_id || 'all');
    const [paymentScheme, setPaymentScheme] = useState<string>(filters?.payment_scheme || 'all');
    const [statusFilter, setStatusFilter] = useState<string>(filters?.status || 'all');

    // Dialogs
    const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState<BookingData | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);

    // Form
    const bookingForm = useForm<{
        lead_id: string;
        housing_unit_id: string;
        sales_id: string;
        payment_scheme: 'cash' | 'kpr' | 'cash_bertahap';
        booking_fee: string;
        transaction_date: string;
        transfer_proof: File | null;
        notes: string;
    }>({
        lead_id: leads[0]?.id?.toString() || '',
        housing_unit_id: availableUnits[0]?.id?.toString() || '',
        sales_id: salesUsers[0]?.id?.toString() || 'none',
        payment_scheme: 'kpr',
        booking_fee: '5000000',
        transaction_date: new Date().toISOString().split('T')[0],
        transfer_proof: null,
        notes: '',
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedProofName, setSelectedProofName] = useState<string | null>(null);

    const formatRp = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val);
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

    const handleOpenCreate = () => {
        setSelectedProofName(null);
        bookingForm.reset();
        bookingForm.setData({
            lead_id: leads[0]?.id?.toString() || '',
            housing_unit_id: availableUnits[0]?.id?.toString() || '',
            sales_id: salesUsers[0]?.id?.toString() || 'none',
            payment_scheme: 'kpr',
            booking_fee: '5000000',
            transaction_date: new Date().toISOString().split('T')[0],
            transfer_proof: null,
            notes: '',
        });
        bookingForm.clearErrors();
        setBookingDialogOpen(true);
    };

    const handleSubmitBooking: FormEventHandler = (e) => {
        e.preventDefault();
        bookingForm.transform((data) => ({
            ...data,
            sales_id: data.sales_id === 'none' ? '' : data.sales_id,
        }));

        bookingForm.post(route('bookings.store'), {
            onSuccess: () => setBookingDialogOpen(false),
        });
    };

    const confirmCancelBooking = (booking: BookingData) => {
        setBookingToCancel(booking);
        setCancelDialogOpen(true);
    };

    const handleCancelBooking = () => {
        if (!bookingToCancel) return;
        setIsCancelling(true);

        router.post(route('bookings.cancel', bookingToCancel.id), {}, {
            onFinish: () => {
                setIsCancelling(false);
                setCancelDialogOpen(false);
                setBookingToCancel(null);
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Booking Fee & SPR - Transaksi Properti" />

            <div className="space-y-6">
                {/* Header Page */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                            <CreditCard className="size-6 text-primary" />
                            Booking Fee & SPR
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Pencatatan tanda jadi kavling konsumen, validasi bukti transfer, skema bayar, dan update otomatis status unit.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => router.get(route('siteplan.index'))}
                            className="h-10 px-4 gap-2 border-primary/40 text-primary hover:bg-primary/10"
                        >
                            <Layers className="size-4" />
                            Lihat Peta Siteplan
                        </Button>

                        {can('create-bookings') && (
                            <Button
                                onClick={handleOpenCreate}
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
                                <p className="text-xs font-medium text-muted-foreground">Total Booking Aktif</p>
                                <h3 className="text-2xl font-bold text-foreground mt-1">{stats.total} Unit</h3>
                                <p className="text-[11px] text-muted-foreground mt-0.5">Status kavling terkunci</p>
                            </div>
                            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Receipt className="size-5" />
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
                                <p className="text-[11px] text-muted-foreground mt-0.5">Dana masuk confirmed</p>
                            </div>
                            <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <DollarSign className="size-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-none border-border/80 border-l-4 border-l-blue-500">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Skema KPR Bank</p>
                                <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.kpr_count} Unit</h3>
                                <p className="text-[11px] text-muted-foreground mt-0.5">Pengajuan berkas bank</p>
                            </div>
                            <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <CreditCard className="size-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-none border-border/80 border-l-4 border-l-amber-500">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Cash Keras & Bertahap</p>
                                <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                                    {stats.cash_count + stats.cash_bertahap_count} Unit
                                </h3>
                                <p className="text-[11px] text-muted-foreground mt-0.5">Cash: {stats.cash_count}, Bertahap: {stats.cash_bertahap_count}</p>
                            </div>
                            <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                <Clock className="size-5" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter and Search Panel */}
                <Card className="shadow-none border-border/80">
                    <CardContent className="p-4 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                            <div className="relative lg:col-span-2">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari Kode BK / Nama Konsumen / Unit..."
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
                                {(search || projectId !== 'all' || paymentScheme !== 'all') && (
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
                            <CardTitle className="text-base font-semibold">Daftar Transaksi Tanda Jadi (Booking)</CardTitle>
                            <CardDescription className="text-xs">
                                Menampilkan {bookings.data.length} dari total {bookings.total} transaksi
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                    <TableHead className="w-[70px]">No</TableHead>
                                    <TableHead>Kode & Tgl Booking</TableHead>
                                    <TableHead>Konsumen (Lead)</TableHead>
                                    <TableHead>Unit Kavling</TableHead>
                                    <TableHead>Skema & Biaya Booking</TableHead>
                                    <TableHead>Marketing (Sales)</TableHead>
                                    <TableHead>Bukti Bayar</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-[100px] text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bookings.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                                            Belum ada transaksi tanda jadi booking kavling tercatat.
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
                                                    <span className="font-mono font-bold text-xs text-foreground">
                                                        {booking.booking_code}
                                                    </span>
                                                    <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                                        <Calendar className="size-3" />
                                                        {booking.transaction_date}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-sm text-foreground">
                                                        {booking.lead?.name || '-'}
                                                    </span>
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
                                                        {booking.unit?.unit_code || '-'}
                                                    </Badge>
                                                    <span className="text-[11px] text-muted-foreground">
                                                        {booking.unit?.cluster?.name} ({booking.unit?.cluster?.project?.name})
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm text-foreground">
                                                        {booking.formatted_booking_fee}
                                                    </span>
                                                    <Badge variant="secondary" className="w-fit text-[10px] mt-0.5 capitalize">
                                                        {booking.payment_scheme === 'cash_bertahap' ? 'Cash Bertahap' : booking.payment_scheme.toUpperCase()}
                                                    </Badge>
                                                </div>
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
                                            <TableCell>
                                                {booking.transfer_proof_url ? (
                                                    <a
                                                        href={booking.transfer_proof_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                                                    >
                                                        <FileText className="size-3.5" />
                                                        Lihat Bukti
                                                        <ExternalLink className="size-2.5" />
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground italic">Tanpa lampiran</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {booking.status === 'confirmed' ? (
                                                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border-emerald-500/30">
                                                        Confirmed
                                                    </Badge>
                                                ) : booking.status === 'cancelled' ? (
                                                    <Badge variant="destructive" className="gap-1">
                                                        <XCircle className="size-3" />
                                                        Cancelled
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline">{booking.status}</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {booking.status === 'confirmed' && can('cancel-bookings') && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => confirmCancelBooking(booking)}
                                                        className="text-destructive hover:bg-destructive/10 text-xs h-8 px-2"
                                                        title="Batalkan booking & buka kembali kavling"
                                                    >
                                                        Batalkan
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {bookings.last_page > 1 && (
                    <div className="flex items-center justify-between pt-2">
                        <p className="text-xs text-muted-foreground">
                            Halaman {bookings.current_page} dari {bookings.last_page}
                        </p>
                        <div className="flex items-center gap-1">
                            {bookings.links.map((link, i) => {
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

            {/* Modal Form: Input Booking Unit */}
            <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-background">
                    <DialogHeader className="px-6 py-5 border-b border-border/80">
                        <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                            <CreditCard className="size-5 text-primary" />
                            Input Tanda Jadi (Booking Unit)
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Kunci unit kavling yang dipilih konsumen dan catat pembayaran booking fee ke sistem.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmitBooking} className="flex flex-col flex-1 overflow-hidden">
                        <div className="px-6 py-5 max-h-[68vh] overflow-y-auto space-y-4 custom-scrollbar overscroll-contain">
                            {/* Select Unit Available */}
                            <div className="space-y-1.5">
                                <Label htmlFor="booking_unit">Pilih Unit Kavling Tersedia (Available) *</Label>
                                <Select
                                    value={bookingForm.data.housing_unit_id}
                                    onValueChange={(val) => bookingForm.setData('housing_unit_id', val)}
                                >
                                    <SelectTrigger id="booking_unit" className="h-10">
                                        <SelectValue placeholder="Pilih unit rumah" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableUnits.map((u) => (
                                            <SelectItem key={u.id} value={u.id.toString()}>
                                                {u.unit_code} - {u.cluster?.name} ({u.unit_type?.name}) - Rp {Number(u.base_price).toLocaleString('id-ID')}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {bookingForm.errors.housing_unit_id && (
                                    <p className="text-xs text-destructive">{bookingForm.errors.housing_unit_id}</p>
                                )}
                            </div>

                            {/* Select Lead Consumer */}
                            <div className="space-y-1.5">
                                <Label htmlFor="booking_lead">Pilih Konsumen (Leads) *</Label>
                                <Select
                                    value={bookingForm.data.lead_id}
                                    onValueChange={(val) => bookingForm.setData('lead_id', val)}
                                >
                                    <SelectTrigger id="booking_lead" className="h-10">
                                        <SelectValue placeholder="Pilih konsumen pemesan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {leads.map((l) => (
                                            <SelectItem key={l.id} value={l.id.toString()}>
                                                {l.name} ({l.whatsapp})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {bookingForm.errors.lead_id && (
                                    <p className="text-xs text-destructive">{bookingForm.errors.lead_id}</p>
                                )}
                            </div>

                            {/* Payment Scheme & Booking Fee */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="booking_scheme">Rencana Skema Pembayaran *</Label>
                                    <Select
                                        value={bookingForm.data.payment_scheme}
                                        onValueChange={(val) => bookingForm.setData('payment_scheme', val as any)}
                                    >
                                        <SelectTrigger id="booking_scheme" className="h-10">
                                            <SelectValue placeholder="Pilih skema" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="kpr">KPR Bank</SelectItem>
                                            <SelectItem value="cash">Cash Keras</SelectItem>
                                            <SelectItem value="cash_bertahap">Cash Bertahap (Developer)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="booking_fee">Nominal Booking Fee (Rp) *</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                                            Rp
                                        </span>
                                        <Input
                                            id="booking_fee"
                                            type="number"
                                            step="100000"
                                            value={bookingForm.data.booking_fee}
                                            onChange={(e) => bookingForm.setData('booking_fee', e.target.value)}
                                            className="h-10 pl-9 font-mono"
                                            required
                                        />
                                    </div>
                                    {bookingForm.errors.booking_fee && (
                                        <p className="text-xs text-destructive">{bookingForm.errors.booking_fee}</p>
                                    )}
                                </div>
                            </div>

                            {/* Transaction Date & Sales */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="booking_date">Tanggal Transaksi Tanda Jadi *</Label>
                                    <Input
                                        id="booking_date"
                                        type="date"
                                        value={bookingForm.data.transaction_date}
                                        onChange={(e) => bookingForm.setData('transaction_date', e.target.value)}
                                        className="h-10"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="booking_sales">Sales Marketing In Charge</Label>
                                    <Select
                                        value={bookingForm.data.sales_id}
                                        onValueChange={(val) => bookingForm.setData('sales_id', val)}
                                    >
                                        <SelectTrigger id="booking_sales" className="h-10">
                                            <SelectValue placeholder="Pilih Sales" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Otomatis / Current User</SelectItem>
                                            {salesUsers.map((s) => (
                                                <SelectItem key={s.id} value={s.id.toString()}>
                                                    {s.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Upload Transfer Proof */}
                            <div className="space-y-1.5">
                                <Label>Upload Bukti Transfer / Resi Pembayaran (Maks 5MB)</Label>
                                <div className="flex items-center gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="h-10 gap-2 border-dashed"
                                    >
                                        <Upload className="size-4 text-muted-foreground" />
                                        Pilih Berkas Bukti
                                    </Button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg,application/pdf"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0] || null;
                                            bookingForm.setData('transfer_proof', file);
                                            setSelectedProofName(file ? file.name : null);
                                        }}
                                    />
                                    {selectedProofName ? (
                                        <span className="text-xs text-primary font-medium flex items-center gap-1.5">
                                            <FileText className="size-3.5" />
                                            {selectedProofName}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">Belum ada file dipilih</span>
                                    )}
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="space-y-1.5">
                                <Label htmlFor="booking_notes">Catatan Transaksi</Label>
                                <Textarea
                                    id="booking_notes"
                                    placeholder="Catatan tambahan, kesepakatan bonus AC, rencana tanggal akad..."
                                    value={bookingForm.data.notes}
                                    onChange={(e) => bookingForm.setData('notes', e.target.value)}
                                    rows={2}
                                />
                            </div>
                        </div>

                        <DialogFooter className="px-6 py-4 border-t border-border/80 bg-muted/20 sm:justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setBookingDialogOpen(false)}
                                disabled={bookingForm.processing}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={bookingForm.processing}
                                className="bg-primary text-primary-foreground gap-2"
                            >
                                {bookingForm.processing && <Loader2 className="size-4 animate-spin" />}
                                Konfirmasi Booking & Kunci Unit
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Cancel Booking Confirmation */}
            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <DialogContent className="sm:max-w-md bg-background">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="size-5" />
                            Batalkan Transaksi Booking
                        </DialogTitle>
                        <DialogDescription className="text-sm pt-2">
                            Apakah Anda yakin ingin membatalkan transaksi booking{' '}
                            <strong className="text-foreground">{bookingToCancel?.booking_code}</strong>?
                            Unit <strong className="text-foreground">{bookingToCancel?.unit?.unit_code}</strong> akan otomatis dikembalikan menjadi <strong>Available</strong> di katalog dan denah siteplan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-end gap-2 pt-4">
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
                            className="gap-2"
                        >
                            {isCancelling && <Loader2 className="size-4 animate-spin" />}
                            Ya, Batalkan Booking
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
