import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import {
    Receipt as ReceiptIcon,
    Plus,
    Search,
    Filter,
    CheckCircle2,
    Clock,
    FileText,
    ExternalLink,
    DollarSign,
    Calendar,
    Phone,
    XCircle,
    Award,
    Download,
    QrCode,
    LayoutGrid,
    List,
    Building,
    Eye,
    ShieldCheck,
    CheckCheck,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { useAuthorization } from '@/hooks/useAuthorization';
import { Receipt } from '@/types';
import CreateReceiptDialog from '@/Components/Receipts/CreateReceiptDialog';
import FinanceReviewDialog from '@/Components/Receipts/FinanceReviewDialog';
import ManagerApprovalDialog from '@/Components/Receipts/ManagerApprovalDialog';
import RejectReceiptDialog from '@/Components/Receipts/RejectReceiptDialog';
import ReceiptDetailDialog from '@/Components/Receipts/ReceiptDetailDialog';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedReceipts {
    data: Receipt[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
}

interface IndexProps {
    receipts: PaginatedReceipts;
    bookings: any[];
    stats: {
        total: number;
        submitted: number;
        finance_review: number;
        finance_approved: number;
        manager_approved: number;
        rejected: number;
    };
    filters: {
        status?: string;
        payment_type?: string;
        search?: string;
    };
}

export default function Index({ receipts, bookings, stats, filters }: IndexProps) {
    const { can, isSuperAdmin, isFinance, isSalesManager, isSalesAgent } = useAuthorization();

    // View mode: Default to 'card' per rule #6
    const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

    // Filter states
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [paymentTypeFilter, setPaymentTypeFilter] = useState(filters.payment_type || 'all');

    // Dialog states
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [financeReviewDialogOpen, setFinanceReviewDialogOpen] = useState(false);
    const [managerApprovalDialogOpen, setManagerApprovalDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

    // Persist view mode in localStorage
    useEffect(() => {
        const savedView = localStorage.getItem('receipts_view_mode_v2');
        if (savedView === 'table' || savedView === 'card') {
            setViewMode(savedView);
        }
    }, []);

    const handleViewModeChange = (mode: 'card' | 'table') => {
        setViewMode(mode);
        localStorage.setItem('receipts_view_mode_v2', mode);
    };

    // Auto-open detail if receipt_id in query params (e.g. from notification)
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const receiptIdParam = urlParams.get('receipt_id');
        if (receiptIdParam && receipts.data.length > 0) {
            const found = receipts.data.find((r) => String(r.id) === receiptIdParam);
            if (found) {
                setSelectedReceipt(found);
                setDetailDialogOpen(true);
            }
        }
    }, [receipts.data]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters({ search: searchTerm });
    };

    const handleStatusFilterChange = (status: string) => {
        setStatusFilter(status);
        applyFilters({ status });
    };

    const handlePaymentTypeChange = (type: string) => {
        setPaymentTypeFilter(type);
        applyFilters({ payment_type: type });
    };

    const applyFilters = (overrides: Record<string, string>) => {
        router.get(
            route('receipts.index'),
            {
                search: overrides.search !== undefined ? overrides.search : searchTerm,
                status: overrides.status !== undefined ? overrides.status : statusFilter,
                payment_type: overrides.payment_type !== undefined ? overrides.payment_type : paymentTypeFilter,
            },
            { preserveState: true, replace: true }
        );
    };

    const openDetail = (receipt: Receipt) => {
        setSelectedReceipt(receipt);
        setDetailDialogOpen(true);
    };

    const openFinanceReview = (receipt: Receipt) => {
        setSelectedReceipt(receipt);
        setFinanceReviewDialogOpen(true);
    };

    const openManagerApproval = (receipt: Receipt) => {
        setSelectedReceipt(receipt);
        setManagerApprovalDialogOpen(true);
    };

    const openReject = (receipt: Receipt) => {
        setSelectedReceipt(receipt);
        setRejectDialogOpen(true);
    };

    const getStatusBadge = (status: string, label: string) => {
        switch (status) {
            case 'submitted':
                return <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">{label}</span>;
            case 'finance_review':
                return <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">{label}</span>;
            case 'finance_approved':
                return <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">{label}</span>;
            case 'manager_approved':
                return <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">{label}</span>;
            case 'rejected':
                return <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20">{label}</span>;
            default:
                return <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-muted text-muted-foreground">{label}</span>;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Kwitansi & Finansial — CASANUMA CRM" />

            <div className="space-y-6 pb-12">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                <ReceiptIcon className="size-4.5" />
                            </div>
                            <h1 className="text-xl sm:text-2xl font-black text-foreground font-heading tracking-tight">
                                Kwitansi & Finansial
                            </h1>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Alur verifikasi penerimaan pembayaran bertahap (Sales ➔ Finance ➔ Manager), barcode QR keaslian, dan cetak PDF resmi.
                        </p>
                    </div>

                    {can('create-receipts') && (
                        <Button
                            onClick={() => setCreateDialogOpen(true)}
                            size="sm"
                            className="gap-1.5 text-xs h-9 shadow-xs"
                        >
                            <Plus className="size-4" />
                            <span>Buat Pengajuan Kwitansi</span>
                        </Button>
                    )}
                </div>

                {/* Stats Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    <Card
                        className={`border-border/70 shadow-2xs cursor-pointer transition-all hover:border-primary/50 ${statusFilter === 'all' ? 'ring-2 ring-primary/30' : ''}`}
                        onClick={() => handleStatusFilterChange('all')}
                    >
                        <CardContent className="p-3.5 space-y-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                Total Kwitansi
                            </span>
                            <div className="flex items-baseline justify-between">
                                <span className="text-xl font-extrabold text-foreground font-mono">{stats.total}</span>
                                <ReceiptIcon className="size-4 text-muted-foreground opacity-50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className={`border-border/70 shadow-2xs cursor-pointer transition-all hover:border-amber-500/50 ${statusFilter === 'submitted' ? 'ring-2 ring-amber-500/30' : ''}`}
                        onClick={() => handleStatusFilterChange('submitted')}
                    >
                        <CardContent className="p-3.5 space-y-1">
                            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                                Menunggu Finance
                            </span>
                            <div className="flex items-baseline justify-between">
                                <span className="text-xl font-extrabold text-amber-600 font-mono">{stats.submitted}</span>
                                <Clock className="size-4 text-amber-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className={`border-border/70 shadow-2xs cursor-pointer transition-all hover:border-indigo-500/50 ${statusFilter === 'finance_approved' ? 'ring-2 ring-indigo-500/30' : ''}`}
                        onClick={() => handleStatusFilterChange('finance_approved')}
                    >
                        <CardContent className="p-3.5 space-y-1">
                            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                                Menunggu Manager
                            </span>
                            <div className="flex items-baseline justify-between">
                                <span className="text-xl font-extrabold text-indigo-600 font-mono">{stats.finance_approved}</span>
                                <CheckCircle2 className="size-4 text-indigo-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className={`border-border/70 shadow-2xs cursor-pointer transition-all hover:border-emerald-500/50 ${statusFilter === 'manager_approved' ? 'ring-2 ring-emerald-500/30' : ''}`}
                        onClick={() => handleStatusFilterChange('manager_approved')}
                    >
                        <CardContent className="p-3.5 space-y-1">
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                                Disetujui (Sah)
                            </span>
                            <div className="flex items-baseline justify-between">
                                <span className="text-xl font-extrabold text-emerald-600 font-mono">{stats.manager_approved}</span>
                                <Award className="size-4 text-emerald-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className={`border-border/70 shadow-2xs cursor-pointer transition-all hover:border-rose-500/50 ${statusFilter === 'rejected' ? 'ring-2 ring-rose-500/30' : ''}`}
                        onClick={() => handleStatusFilterChange('rejected')}
                    >
                        <CardContent className="p-3.5 space-y-1">
                            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                                Ditolak
                            </span>
                            <div className="flex items-baseline justify-between">
                                <span className="text-xl font-extrabold text-rose-600 font-mono">{stats.rejected}</span>
                                <XCircle className="size-4 text-rose-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter and View Mode Switcher */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/70 bg-card/60 backdrop-blur-xs shadow-2xs">
                    {/* Search bar */}
                    <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
                        <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Cari no. kwitansi, konsumen, booking..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 text-xs h-8.5"
                        />
                    </form>

                    {/* Filter Dropdowns & View Switcher */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Status Select */}
                        <div className="w-40">
                            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                                <SelectTrigger className="text-xs h-8.5">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all" className="text-xs">Semua Status</SelectItem>
                                    <SelectItem value="submitted" className="text-xs">Menunggu Finance</SelectItem>
                                    <SelectItem value="finance_approved" className="text-xs">Menunggu Manager</SelectItem>
                                    <SelectItem value="manager_approved" className="text-xs">Disetujui (Sah)</SelectItem>
                                    <SelectItem value="rejected" className="text-xs">Ditolak</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Payment Type Select */}
                        <div className="w-36">
                            <Select value={paymentTypeFilter} onValueChange={handlePaymentTypeChange}>
                                <SelectTrigger className="text-xs h-8.5">
                                    <SelectValue placeholder="Jenis Bayar" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all" className="text-xs">Semua Jenis</SelectItem>
                                    <SelectItem value="booking_fee" className="text-xs">Booking Fee</SelectItem>
                                    <SelectItem value="dp" className="text-xs">Uang Muka (DP)</SelectItem>
                                    <SelectItem value="installment" className="text-xs">Cicilan</SelectItem>
                                    <SelectItem value="pelunasan" className="text-xs">Pelunasan</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* View Switcher (Rule #6) */}
                        <div className="flex items-center p-0.5 rounded-lg border border-border bg-muted/30">
                            <Button
                                type="button"
                                variant={viewMode === 'card' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => handleViewModeChange('card')}
                                className="h-7 px-2.5 text-xs gap-1"
                                title="Tampilan Kartu (Default)"
                            >
                                <LayoutGrid className="size-3.5" />
                                <span className="hidden sm:inline">Kartu</span>
                            </Button>
                            <Button
                                type="button"
                                variant={viewMode === 'table' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => handleViewModeChange('table')}
                                className="h-7 px-2.5 text-xs gap-1"
                                title="Tampilan Tabel"
                            >
                                <List className="size-3.5" />
                                <span className="hidden sm:inline">Tabel</span>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Content: Card View vs Table View */}
                {receipts.data.length === 0 ? (
                    <div className="text-center py-16 p-6 rounded-2xl border border-dashed border-border/80 bg-muted/10">
                        <div className="size-12 rounded-full bg-muted/80 flex items-center justify-center mx-auto mb-3 text-muted-foreground">
                            <ReceiptIcon className="size-6 opacity-50" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground">Tidak Ada Data Kwitansi</h3>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                            Belum ada dokumen kwitansi yang sesuai dengan kriteria filter saat ini.
                        </p>
                        {can('create-receipts') && (
                            <Button
                                onClick={() => setCreateDialogOpen(true)}
                                size="sm"
                                className="mt-4 gap-1.5 text-xs h-8"
                            >
                                <Plus className="size-3.5" />
                                <span>Buat Kwitansi Pertama</span>
                            </Button>
                        )}
                    </div>
                ) : viewMode === 'card' ? (
                    /* CARD VIEW (DEFAULT - Rule #6) */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {receipts.data.map((receipt) => {
                            const customerName = receipt.lead?.name || receipt.booking?.lead?.name || '-';
                            const unitCode = receipt.booking?.unit?.unit_code || '-';
                            const bookingCode = receipt.booking?.booking_code || '-';
                            const projectName = receipt.booking?.unit?.cluster?.project?.name || '-';

                            return (
                                <Card
                                    key={receipt.id}
                                    className="border-border/70 shadow-xs hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                                >
                                    <div>
                                        {/* Card Header */}
                                        <CardHeader className="p-4 pb-3 border-b border-border/40 bg-muted/10">
                                            <div className="flex items-start justify-between gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openDetail(receipt)}
                                                    className="text-left font-mono font-bold text-sm text-foreground hover:text-primary transition-colors truncate"
                                                >
                                                    {receipt.receipt_number || receipt.finance_receipt_number || `#DRAFT-${String(receipt.id).padStart(4, '0')}`}
                                                </button>
                                                {getStatusBadge(receipt.status, receipt.status_label)}
                                            </div>
                                            <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
                                                <span className="font-semibold text-primary/80">
                                                    {receipt.payment_type_label}
                                                </span>
                                                <span>&bull;</span>
                                                <span>{receipt.payment_date}</span>
                                            </div>
                                        </CardHeader>

                                        {/* Card Body */}
                                        <CardContent className="p-4 space-y-3">
                                            {/* Amount Box */}
                                            <div className="p-3 rounded-xl bg-muted/40 border border-border/50 flex items-baseline justify-between">
                                                <span className="text-[11px] text-muted-foreground font-medium">Nominal:</span>
                                                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                                                    {receipt.formatted_amount}
                                                </span>
                                            </div>

                                            {/* Interactive Data Points (Rule #6) */}
                                            <div className="space-y-1.5 text-xs">
                                                {/* Customer */}
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-muted-foreground text-[11px]">Konsumen:</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => openDetail(receipt)}
                                                        className="font-semibold text-foreground hover:text-primary transition-colors truncate max-w-[170px]"
                                                    >
                                                        {customerName}
                                                    </button>
                                                </div>

                                                {/* Unit / Booking Box */}
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-muted-foreground text-[11px]">Kavling & Booking:</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => openDetail(receipt)}
                                                        className="font-medium text-foreground hover:text-primary transition-colors text-[11px] font-mono"
                                                    >
                                                        {unitCode} ({bookingCode})
                                                    </button>
                                                </div>

                                                {/* Proyek */}
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-muted-foreground text-[11px]">Proyek:</span>
                                                    <span className="text-muted-foreground text-[11px] truncate max-w-[170px]">
                                                        {projectName}
                                                    </span>
                                                </div>

                                                {/* Submitter */}
                                                <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40 text-[10px] text-muted-foreground">
                                                    <span>Sales: {receipt.submitter?.name || '-'}</span>
                                                    <span>{receipt.payment_method?.replace('_', ' ') || '-'}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </div>

                                    {/* Card Action Footer */}
                                    <div className="p-3 border-t border-border/50 bg-muted/10 flex items-center justify-between gap-1.5">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openDetail(receipt)}
                                            className="h-7 text-xs gap-1 px-2"
                                        >
                                            <Eye className="size-3" />
                                            <span>Detail</span>
                                        </Button>

                                        <div className="flex items-center gap-1.5">
                                            {/* Role Action: Finance Review */}
                                            {(isFinance || isSuperAdmin) && (receipt.status === 'submitted' || receipt.status === 'finance_review') && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => openFinanceReview(receipt)}
                                                    className="h-7 text-[11px] px-2.5 gap-1 bg-blue-600 hover:bg-blue-700 text-white"
                                                >
                                                    <CheckCircle2 className="size-3" />
                                                    <span>Review</span>
                                                </Button>
                                            )}

                                            {/* Role Action: Manager Approve */}
                                            {(isSalesManager || isSuperAdmin) && receipt.status === 'finance_approved' && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => openManagerApproval(receipt)}
                                                    className="h-7 text-[11px] px-2.5 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                                >
                                                    <CheckCheck className="size-3" />
                                                    <span>Approve</span>
                                                </Button>
                                            )}

                                            {/* Manager Approved Actions: PDF & QR */}
                                            {receipt.status === 'manager_approved' && (
                                                <>
                                                    <a
                                                        href={route('receipts.pdf', receipt.id)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-7 text-[11px] px-2 gap-1 text-emerald-600 hover:text-emerald-700"
                                                            title="Download PDF"
                                                        >
                                                            <Download className="size-3" />
                                                            <span className="hidden sm:inline">PDF</span>
                                                        </Button>
                                                    </a>
                                                    {receipt.qr_code_token && (
                                                        <a
                                                            href={route('receipts.verify', receipt.qr_code_token)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-7 text-[11px] px-2"
                                                                title="Cek QR Verifikasi"
                                                            >
                                                                <QrCode className="size-3" />
                                                            </Button>
                                                        </a>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    /* TABLE VIEW (Multi-View Parity - Rule #6) */
                    <div className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-xs">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30">
                                    <TableHead className="text-xs font-bold">No. Kwitansi</TableHead>
                                    <TableHead className="text-xs font-bold">Konsumen</TableHead>
                                    <TableHead className="text-xs font-bold">Kavling / Proyek</TableHead>
                                    <TableHead className="text-xs font-bold">Jenis</TableHead>
                                    <TableHead className="text-xs font-bold text-right">Nominal</TableHead>
                                    <TableHead className="text-xs font-bold">Status</TableHead>
                                    <TableHead className="text-xs font-bold text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {receipts.data.map((receipt) => {
                                    const customerName = receipt.lead?.name || receipt.booking?.lead?.name || '-';
                                    const unitCode = receipt.booking?.unit?.unit_code || '-';
                                    const bookingCode = receipt.booking?.booking_code || '-';
                                    const projectName = receipt.booking?.unit?.cluster?.project?.name || '-';

                                    return (
                                        <TableRow key={receipt.id} className="hover:bg-muted/40">
                                            <TableCell className="font-mono text-xs font-semibold">
                                                <button
                                                    type="button"
                                                    onClick={() => openDetail(receipt)}
                                                    className="hover:text-primary transition-colors text-left"
                                                >
                                                    {receipt.receipt_number || receipt.finance_receipt_number || `#DRAFT-${receipt.id}`}
                                                </button>
                                                <p className="text-[10px] text-muted-foreground font-sans">{receipt.payment_date}</p>
                                            </TableCell>
                                            <TableCell className="text-xs font-medium">
                                                <button
                                                    type="button"
                                                    onClick={() => openDetail(receipt)}
                                                    className="hover:text-primary transition-colors text-left font-semibold"
                                                >
                                                    {customerName}
                                                </button>
                                                <p className="text-[10px] text-muted-foreground">Sales: {receipt.submitter?.name || '-'}</p>
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                <span className="font-mono font-medium">{unitCode}</span>
                                                <span className="text-[11px] text-muted-foreground"> ({bookingCode})</span>
                                                <p className="text-[10px] text-muted-foreground">{projectName}</p>
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                <span className="font-medium">{receipt.payment_type_label}</span>
                                                <p className="text-[10px] text-muted-foreground capitalize">{receipt.payment_method?.replace('_', ' ')}</p>
                                            </TableCell>
                                            <TableCell className="text-xs font-bold text-right text-emerald-600 dark:text-emerald-400 font-mono">
                                                {receipt.formatted_amount}
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                {getStatusBadge(receipt.status, receipt.status_label)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openDetail(receipt)}
                                                        className="size-7"
                                                        title="Detail"
                                                    >
                                                        <Eye className="size-3.5" />
                                                    </Button>

                                                    {(isFinance || isSuperAdmin) && (receipt.status === 'submitted' || receipt.status === 'finance_review') && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => openFinanceReview(receipt)}
                                                            className="h-7 text-[11px] px-2 bg-blue-600 hover:bg-blue-700 text-white"
                                                        >
                                                            Review
                                                        </Button>
                                                    )}

                                                    {(isSalesManager || isSuperAdmin) && receipt.status === 'finance_approved' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => openManagerApproval(receipt)}
                                                            className="h-7 text-[11px] px-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                                                        >
                                                            Approve
                                                        </Button>
                                                    )}

                                                    {receipt.status === 'manager_approved' && (
                                                        <a
                                                            href={route('receipts.pdf', receipt.id)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="size-7 text-emerald-600"
                                                                title="Download PDF"
                                                            >
                                                                <Download className="size-3.5" />
                                                            </Button>
                                                        </a>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* Pagination */}
                {receipts.last_page > 1 && (
                    <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                        <span>Menampilkan {receipts.from} - {receipts.to} dari {receipts.total} kwitansi</span>
                        <div className="flex items-center gap-1">
                            {receipts.links.map((link, idx) => (
                                <button
                                    key={idx}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.visit(link.url)}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-2.5 py-1 rounded text-xs transition-colors ${
                                        link.active
                                            ? 'bg-primary text-primary-foreground font-bold'
                                            : link.url
                                            ? 'hover:bg-muted text-foreground'
                                            : 'opacity-40 cursor-not-allowed'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modals & Dialogs */}
            <CreateReceiptDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                bookings={bookings}
            />

            <FinanceReviewDialog
                open={financeReviewDialogOpen}
                onOpenChange={setFinanceReviewDialogOpen}
                receipt={selectedReceipt}
            />

            <ManagerApprovalDialog
                open={managerApprovalDialogOpen}
                onOpenChange={setManagerApprovalDialogOpen}
                receipt={selectedReceipt}
            />

            <RejectReceiptDialog
                open={rejectDialogOpen}
                onOpenChange={setRejectDialogOpen}
                receipt={selectedReceipt}
            />

            <ReceiptDetailDialog
                open={detailDialogOpen}
                onOpenChange={setDetailDialogOpen}
                receipt={selectedReceipt}
                onOpenFinanceReview={openFinanceReview}
                onOpenManagerApproval={openManagerApproval}
                onOpenReject={openReject}
            />
        </AuthenticatedLayout>
    );
}
