import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent } from '@/Components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import {
    FileText,
    Printer,
    CheckCircle2,
    Clock,
    AlertCircle,
    UserCheck,
    CreditCard,
    DollarSign,
    Calendar,
    Phone,
    Building2,
    ShieldCheck,
    Upload,
    ExternalLink,
    ChevronRight,
    Loader2,
    Home,
    Layers,
    Receipt,
    Landmark,
    Check,
    AlertTriangle,
} from 'lucide-react';
import { router, useForm } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { useAuthorization } from '@/hooks/useAuthorization';

interface TransactionDossierDialogProps {
    open: boolean;
    onClose: () => void;
    booking: any;
    onOpenPrint: (booking: any) => void;
}

export default function TransactionDossierDialog({
    open,
    onClose,
    booking,
    onOpenPrint,
}: TransactionDossierDialogProps) {
    const { can, isSuperAdmin, isFinance, isSalesManager } = useAuthorization();
    const [activeTab, setActiveTab] = useState<'spr' | 'customer' | 'payments' | 'kpr'>('spr');

    // Add Payment Form State
    const [showAddPayment, setShowAddPayment] = useState(false);
    const paymentForm = useForm<{
        payment_type: string;
        term_name: string;
        amount_due: string;
        due_date: string;
        amount_paid: string;
        payment_date: string;
        payment_method: string;
        bank_name: string;
        payment_proof: File | null;
        notes: string;
    }>({
        payment_type: 'down_payment',
        term_name: 'Uang Muka (DP) Termin Tambahan',
        amount_due: '',
        due_date: new Date().toISOString().split('T')[0],
        amount_paid: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'transfer_bank',
        bank_name: 'BCA',
        payment_proof: null,
        notes: '',
    });

    // Update KPR Stage Form State
    const kprForm = useForm<{
        bank_name: string;
        application_number: string;
        submitted_amount: string;
        approved_amount: string;
        interest_rate: string;
        tenor_years: string;
        current_stage: string;
        sp3k_number: string;
        sp3k_date: string;
        sp3k_document: File | null;
        akad_date: string;
        notary_name: string;
        notes: string;
    }>({
        bank_name: booking?.kpr_application?.bank_name || 'Bank BTN',
        application_number: booking?.kpr_application?.application_number || '',
        submitted_amount: booking?.kpr_application?.submitted_amount || booking?.remaining_amount || '',
        approved_amount: booking?.kpr_application?.approved_amount || '',
        interest_rate: booking?.kpr_application?.interest_rate || '4.75',
        tenor_years: booking?.kpr_application?.tenor_years?.toString() || '15',
        current_stage: booking?.kpr_application?.current_stage || 'document_collection',
        sp3k_number: booking?.kpr_application?.sp3k_number || '',
        sp3k_date: booking?.kpr_application?.sp3k_date || '',
        sp3k_document: null,
        akad_date: booking?.kpr_application?.akad_date || '',
        notary_name: booking?.kpr_application?.notary_name || '',
        notes: booking?.kpr_application?.notes || '',
    });

    if (!booking) return null;

    const formatRp = (val: number | string | undefined | null) => {
        const num = typeof val === 'string' ? parseFloat(val) : Number(val || 0);
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(isNaN(num) ? 0 : num);
    };

    const statusBadge = (status: string) => {
        switch (status) {
            case 'pending_approval':
                return (
                    <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1">
                        <Clock className="size-3" />
                        Pending Approval
                    </Badge>
                );
            case 'approved':
                return (
                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1">
                        <CheckCircle2 className="size-3" />
                        Booking Approved
                    </Badge>
                );
            case 'in_payment':
                return (
                    <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 gap-1">
                        <Receipt className="size-3" />
                        Termin Berjalan
                    </Badge>
                );
            case 'kpr_process':
                return (
                    <Badge className="bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 gap-1">
                        <Landmark className="size-3" />
                        Proses KPR Bank
                    </Badge>
                );
            case 'ready_for_akad':
                return (
                    <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30 gap-1">
                        <ShieldCheck className="size-3" />
                        Siap Akad Kredit
                    </Badge>
                );
            case 'completed':
                return (
                    <Badge className="bg-emerald-600 text-white border-emerald-600 gap-1">
                        <CheckCircle2 className="size-3" />
                        Selesai (Sold)
                    </Badge>
                );
            case 'cancelled':
                return (
                    <Badge variant="destructive" className="gap-1">
                        <AlertCircle className="size-3" />
                        Cancelled
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const handleApprove = () => {
        router.post(route('bookings.approve', booking.id), {}, {
            preserveScroll: true,
        });
    };

    const handleComplete = () => {
        router.patch(route('bookings.complete', booking.id), {}, {
            preserveScroll: true,
        });
    };

    const handleVerifyPayment = (paymentId: number) => {
        router.patch(route('bookings.payments.verify', paymentId), {}, {
            preserveScroll: true,
        });
    };

    const handleSubmitPayment: React.FormEventHandler = (e) => {
        e.preventDefault();
        paymentForm.post(route('bookings.payments.store', booking.id), {
            onSuccess: () => {
                setShowAddPayment(false);
                paymentForm.reset();
            },
        });
    };

    const handleSubmitKpr: React.FormEventHandler = (e) => {
        e.preventDefault();
        kprForm.post(route('bookings.kpr.update', booking.id), {
            preserveScroll: true,
        });
    };

    const kprStages = [
        { key: 'document_collection', label: '1. Pemberkasan' },
        { key: 'submitted_to_bank', label: '2. Masuk Bank' },
        { key: 'slik_checking', label: '3. BI Checking' },
        { key: 'appraisal', label: '4. Appraisal' },
        { key: 'sp3k_issued', label: '5. SP3K Terbit' },
        { key: 'pre_akad', label: '6. Pra-Akad' },
        { key: 'akad_scheduled', label: '7. Akad Kredit' },
        { key: 'disbursed', label: '8. Pencairan Bank' },
    ];

    const currentKprStageIndex = kprStages.findIndex(
        (s) => s.key === (booking?.kpr_application?.current_stage || 'document_collection')
    );

    const totalPaid = booking.payments?.reduce((acc: number, p: any) => {
        return p.status === 'verified' ? acc + (Number(p.amount_paid) || 0) : acc;
    }, 0) || 0;

    const totalPrice = Number(booking.total_price || booking.unit?.base_price || 0);
    const progressPercent = totalPrice > 0 ? Math.min(100, Math.round((totalPaid / totalPrice) * 100)) : 0;

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 gap-0">
                {/* Dossier Header */}
                <DialogHeader className="p-6 border-b bg-muted/20">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <DialogTitle className="text-xl font-bold font-mono text-foreground flex items-center gap-2">
                                    <FileText className="size-5 text-primary" />
                                    {booking.booking_code}
                                </DialogTitle>
                                {statusBadge(booking.status)}
                                <Badge variant="outline" className="font-mono text-xs">
                                    Unit {booking.unit?.unit_code}
                                </Badge>
                            </div>
                            <DialogDescription className="text-xs">
                                Dokumen SPR: <span className="font-mono font-semibold text-foreground">{booking.spr_number || 'Belum Terbit'}</span> • Konsumen: <span className="font-semibold text-foreground">{booking.lead?.name}</span>
                            </DialogDescription>
                        </div>

                        {/* Top Action Buttons */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onOpenPrint(booking)}
                                className="h-9 gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
                            >
                                <Printer className="size-4" />
                                Cetak SPR
                            </Button>

                            {booking.status === 'pending_approval' && (can('approve-bookings') || isSalesManager || isFinance || isSuperAdmin) && (
                                <Button
                                    size="sm"
                                    onClick={handleApprove}
                                    className="h-9 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-medium"
                                >
                                    <CheckCircle2 className="size-4" />
                                    Setujui Transaksi & Terbitkan SPR
                                </Button>
                            )}

                            {booking.status !== 'completed' && booking.status !== 'cancelled' && (can('approve-bookings') || isFinance || isSuperAdmin) && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleComplete}
                                    className="h-9 gap-1.5 border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 font-medium"
                                >
                                    <Check className="size-4" />
                                    Tandai Selesai (Sold)
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Dossier Tabs Navigation */}
                    <div className="flex items-center gap-2 pt-4 border-t border-border/60 overflow-x-auto">
                        <Button
                            variant={activeTab === 'spr' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveTab('spr')}
                            className="h-8 text-xs gap-1.5"
                        >
                            <Building2 className="size-3.5" />
                            Ikhtisar & SPR
                        </Button>
                        <Button
                            variant={activeTab === 'customer' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveTab('customer')}
                            className="h-8 text-xs gap-1.5"
                        >
                            <UserCheck className="size-3.5" />
                            Legalitas Konsumen
                        </Button>
                        <Button
                            variant={activeTab === 'payments' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveTab('payments')}
                            className="h-8 text-xs gap-1.5"
                        >
                            <Receipt className="size-3.5" />
                            Jadwal Pembayaran ({booking.payments?.length || 0})
                        </Button>
                        {booking.payment_scheme === 'kpr' && (
                            <Button
                                variant={activeTab === 'kpr' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setActiveTab('kpr')}
                                className="h-8 text-xs gap-1.5"
                            >
                                <Landmark className="size-3.5" />
                                Tracking KPR Bank
                            </Button>
                        )}
                    </div>
                </DialogHeader>

                {/* Tab Content Container */}
                <div className="p-6 space-y-6">
                    {/* TAB 1: IKHTISAR & STRUKTUR HARGA SPR */}
                    {activeTab === 'spr' && (
                        <div className="space-y-6">
                            {/* Summary Progress Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <Card className="shadow-none border-border/80">
                                    <CardContent className="p-3.5">
                                        <p className="text-[11px] text-muted-foreground font-medium">Total Harga Transaksi</p>
                                        <p className="text-base font-bold font-mono text-primary mt-1">
                                            {formatRp(booking.total_price || booking.unit?.base_price)}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-none border-border/80">
                                    <CardContent className="p-3.5">
                                        <p className="text-[11px] text-muted-foreground font-medium">Uang Tanda Jadi (UTJ)</p>
                                        <p className="text-base font-bold font-mono text-emerald-600 mt-1">
                                            {formatRp(booking.booking_fee)}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-none border-border/80">
                                    <CardContent className="p-3.5">
                                        <p className="text-[11px] text-muted-foreground font-medium">Total Dana Masuk Valid</p>
                                        <p className="text-base font-bold font-mono text-foreground mt-1">
                                            {formatRp(totalPaid)}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">{progressPercent}% dari total harga</p>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-none border-border/80">
                                    <CardContent className="p-3.5">
                                        <p className="text-[11px] text-muted-foreground font-medium">Sisa Pelunasan / KPR</p>
                                        <p className="text-base font-bold font-mono text-amber-600 mt-1">
                                            {formatRp(Math.max(0, totalPrice - totalPaid))}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Objek Unit & Detail Harga */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <Home className="size-4 text-primary" />
                                        Spesifikasi Objek Kavling
                                    </h4>
                                    <div className="rounded-lg border p-4 space-y-2.5 text-xs">
                                        <div className="flex justify-between pb-2 border-b">
                                            <span className="text-muted-foreground">Kawasan Proyek:</span>
                                            <span className="font-semibold text-foreground">
                                                {booking.unit?.cluster?.project?.name || 'Casanuma Project'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between pb-2 border-b">
                                            <span className="text-muted-foreground">Cluster & Blok:</span>
                                            <span className="font-semibold text-foreground">
                                                {booking.unit?.cluster?.name} • Blok {booking.unit?.unit_code}
                                            </span>
                                        </div>
                                        <div className="flex justify-between pb-2 border-b">
                                            <span className="text-muted-foreground">Tipe Bangunan:</span>
                                            <span className="font-medium text-foreground">
                                                Tipe {booking.unit?.unit_type?.name || 'Standard'} (LB {booking.unit?.unit_type?.building_area || 36}m² / LT {booking.unit?.unit_type?.surface_area || 60}m²)
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Skema Pembayaran:</span>
                                            <Badge variant="secondary" className="capitalize font-mono text-[11px]">
                                                {booking.payment_scheme === 'cash_bertahap' ? 'Cash Bertahap' : booking.payment_scheme.toUpperCase()}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Approval Audit Box */}
                                    <div className="rounded-lg border p-4 space-y-2 text-xs bg-muted/20">
                                        <h5 className="font-semibold text-foreground flex items-center gap-1.5">
                                            <ShieldCheck className="size-4 text-primary" />
                                            Status Verifikasi Approval
                                        </h5>
                                        <div className="flex justify-between pt-1">
                                            <span className="text-muted-foreground">Sales Manager:</span>
                                            <span className="font-medium text-foreground">
                                                {booking.approved_by_manager ? (
                                                    <span className="text-emerald-600 font-semibold">✓ Disetujui ({booking.approved_by_manager.name})</span>
                                                ) : (
                                                    <span className="text-amber-600">Menunggu Approval</span>
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between pt-1">
                                            <span className="text-muted-foreground">Finance & Kasir:</span>
                                            <span className="font-medium text-foreground">
                                                {booking.approved_by_finance ? (
                                                    <span className="text-emerald-600 font-semibold">✓ Valid ({booking.approved_by_finance.name})</span>
                                                ) : (
                                                    <span className="text-amber-600">Menunggu Validasi Kasir</span>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Financial Breakdown Breakdown Table */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <CreditCard className="size-4 text-primary" />
                                        Rincian Finansial & Harga Bersih
                                    </h4>
                                    <div className="rounded-lg border overflow-hidden text-xs">
                                        <table className="w-full">
                                            <tbody>
                                                <tr className="border-b p-2">
                                                    <td className="p-2.5 text-muted-foreground">Harga Dasar Unit (Base Price)</td>
                                                    <td className="p-2.5 text-right font-mono font-medium">{formatRp(booking.base_price || booking.unit?.base_price)}</td>
                                                </tr>
                                                <tr className="border-b p-2">
                                                    <td className="p-2.5 text-muted-foreground">Biaya Hook / Fasum / Posisi</td>
                                                    <td className="p-2.5 text-right font-mono font-medium">{formatRp(booking.additional_price || 0)}</td>
                                                </tr>
                                                <tr className="border-b p-2">
                                                    <td className="p-2.5 text-muted-foreground">Potongan Diskon Promo</td>
                                                    <td className="p-2.5 text-right font-mono text-emerald-600 font-medium">- {formatRp(booking.discount_amount || 0)}</td>
                                                </tr>
                                                <tr className="border-b p-2">
                                                    <td className="p-2.5 text-muted-foreground">Biaya Legalitas & Notaris</td>
                                                    <td className="p-2.5 text-right font-mono font-medium">{formatRp(booking.legal_fees || 0)}</td>
                                                </tr>
                                                <tr className="bg-muted/40 font-bold border-b">
                                                    <td className="p-2.5 text-foreground">TOTAL HARGA TRANSAKSI</td>
                                                    <td className="p-2.5 text-right font-mono text-primary text-sm">{formatRp(booking.total_price || booking.unit?.base_price)}</td>
                                                </tr>
                                                <tr className="border-b p-2">
                                                    <td className="p-2.5 text-muted-foreground">Uang Muka (DP) yang Disepakati</td>
                                                    <td className="p-2.5 text-right font-mono font-medium">{formatRp(booking.dp_amount || 0)} ({booking.dp_installments_count || 1}x cicil)</td>
                                                </tr>
                                                <tr>
                                                    <td className="p-2.5 text-muted-foreground">Sisa Kewajiban / Plafond KPR</td>
                                                    <td className="p-2.5 text-right font-mono font-bold text-foreground">{formatRp(booking.remaining_amount || 0)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    {booking.notes && (
                                        <div className="rounded-lg border p-3 bg-muted/10 text-xs">
                                            <span className="font-semibold text-muted-foreground block mb-1">Catatan Tambahan:</span>
                                            <p className="text-foreground">{booking.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: DATA & BERKAS LEGALITAS KONSUMEN */}
                    {activeTab === 'customer' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <UserCheck className="size-4 text-primary" />
                                        Data Identitas Utama Konsumen
                                    </h4>
                                    <div className="rounded-lg border p-4 space-y-3 text-xs">
                                        <div>
                                            <span className="text-muted-foreground block">Nama Lengkap (KTP):</span>
                                            <span className="font-bold text-sm text-foreground">{booking.lead?.name || '-'}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <span className="text-muted-foreground block">No. KTP / NIK:</span>
                                                <span className="font-mono font-medium text-foreground">{booking.lead?.nik || 'Belum diisi'}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground block">Nomor NPWP:</span>
                                                <span className="font-mono font-medium text-foreground">{booking.lead?.npwp || 'Belum diisi'}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground block">No. Kartu Keluarga (KK):</span>
                                            <span className="font-mono font-medium text-foreground">{booking.lead?.kk_number || 'Belum diisi'}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <span className="text-muted-foreground block">WhatsApp / Telepon:</span>
                                                <span className="font-medium text-foreground">{booking.lead?.whatsapp || '-'}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground block">Email:</span>
                                                <span className="font-medium text-foreground">{booking.lead?.email || '-'}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground block">Alamat KTP / Domisili:</span>
                                            <span className="font-medium text-foreground">{booking.lead?.address || '-'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <Building2 className="size-4 text-primary" />
                                        Pekerjaan, Finansial & Kontak Darurat
                                    </h4>
                                    <div className="rounded-lg border p-4 space-y-3 text-xs">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <span className="text-muted-foreground block">Profesi / Pekerjaan:</span>
                                                <span className="font-semibold text-foreground">{booking.lead?.job_type || 'Karyawan Swasta'}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground block">Nama Perusahaan:</span>
                                                <span className="font-medium text-foreground">{booking.lead?.company_name || '-'}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground block">Estimasi Penghasilan Bulanan:</span>
                                            <span className="font-mono font-bold text-emerald-600 text-sm">
                                                {booking.lead?.formatted_monthly_income || 'Rp -'}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                                            <div>
                                                <span className="text-muted-foreground block">Status Pernikahan:</span>
                                                <span className="font-medium capitalize text-foreground">{booking.lead?.marital_status || 'Belum diisi'}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground block">Nama Pasangan:</span>
                                                <span className="font-medium text-foreground">{booking.lead?.spouse_name || '-'}</span>
                                            </div>
                                        </div>
                                        <div className="pt-2 border-t">
                                            <span className="text-muted-foreground block">Kontak Darurat:</span>
                                            <span className="font-semibold text-foreground">
                                                {booking.lead?.emergency_contact_name || '-'} ({booking.lead?.emergency_contact_relation || 'Keluarga'}) • {booking.lead?.emergency_contact_phone || '-'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: JADWAL & RIWAYAT PEMBAYARAN TERMIN */}
                    {activeTab === 'payments' && (
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b">
                                <div>
                                    <h4 className="text-sm font-bold text-foreground">Jadwal & Riwayat Pembayaran (Payment Schedule)</h4>
                                    <p className="text-xs text-muted-foreground">
                                        Total Terverifikasi: <strong className="text-emerald-600 font-mono">{formatRp(totalPaid)}</strong> dari total <strong className="text-foreground font-mono">{formatRp(totalPrice)}</strong>
                                    </p>
                                </div>

                                {(can('create-bookings') || isFinance || isSuperAdmin) && (
                                    <Button
                                        size="sm"
                                        onClick={() => setShowAddPayment(!showAddPayment)}
                                        className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground"
                                    >
                                        <Receipt className="size-3.5" />
                                        {showAddPayment ? 'Tutup Form' : 'Tambah Termin Tagihan / Bukti Bayar'}
                                    </Button>
                                )}
                            </div>

                            {/* Form Input Termin / Bukti Bayar Tambahan */}
                            {showAddPayment && (
                                <form onSubmit={handleSubmitPayment} className="p-4 rounded-lg border bg-muted/20 space-y-4">
                                    <h5 className="font-semibold text-xs text-foreground">Input Pembayaran / Termin Baru</h5>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div>
                                            <Label className="text-xs">Tipe Termin</Label>
                                            <Select
                                                value={paymentForm.data.payment_type}
                                                onValueChange={(val) => paymentForm.setData('payment_type', val)}
                                            >
                                                <SelectTrigger className="h-9 mt-1 bg-background">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="down_payment">Uang Muka (DP)</SelectItem>
                                                    <SelectItem value="installment">Angsuran / Cicilan</SelectItem>
                                                    <SelectItem value="pelunasan">Pelunasan Tunai</SelectItem>
                                                    <SelectItem value="bank_disbursement">Pencairan KPR Bank</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label className="text-xs">Nama Label Termin</Label>
                                            <Input
                                                placeholder="Contoh: DP Termin 2"
                                                value={paymentForm.data.term_name}
                                                onChange={(e) => paymentForm.setData('term_name', e.target.value)}
                                                className="h-9 mt-1 bg-background"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label className="text-xs">Nominal Tagihan (Rp)</Label>
                                            <Input
                                                type="number"
                                                value={paymentForm.data.amount_due}
                                                onChange={(e) => {
                                                    paymentForm.setData('amount_due', e.target.value);
                                                    paymentForm.setData('amount_paid', e.target.value);
                                                }}
                                                className="h-9 mt-1 bg-background"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label className="text-xs">Jatuh Tempo</Label>
                                            <Input
                                                type="date"
                                                value={paymentForm.data.due_date}
                                                onChange={(e) => paymentForm.setData('due_date', e.target.value)}
                                                className="h-9 mt-1 bg-background"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label className="text-xs">Nominal Dibayar (Rp)</Label>
                                            <Input
                                                type="number"
                                                value={paymentForm.data.amount_paid}
                                                onChange={(e) => paymentForm.setData('amount_paid', e.target.value)}
                                                className="h-9 mt-1 bg-background"
                                            />
                                        </div>

                                        <div>
                                            <Label className="text-xs">Metode & Bank</Label>
                                            <Input
                                                placeholder="BCA / Mandiri"
                                                value={paymentForm.data.bank_name}
                                                onChange={(e) => paymentForm.setData('bank_name', e.target.value)}
                                                className="h-9 mt-1 bg-background"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowAddPayment(false)}
                                            className="h-8 text-xs"
                                        >
                                            Batal
                                        </Button>
                                        <Button
                                            type="submit"
                                            size="sm"
                                            disabled={paymentForm.processing}
                                            className="h-8 text-xs bg-primary text-primary-foreground gap-1.5"
                                        >
                                            {paymentForm.processing && <Loader2 className="size-3 animate-spin" />}
                                            Simpan Jadwal Tagihan
                                        </Button>
                                    </div>
                                </form>
                            )}

                            {/* Table Payments */}
                            <div className="rounded-lg border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/40">
                                            <TableHead className="text-xs">No. Kwitansi / Termin</TableHead>
                                            <TableHead className="text-xs">Jatuh Tempo</TableHead>
                                            <TableHead className="text-xs">Nominal Tagihan</TableHead>
                                            <TableHead className="text-xs">Realisasi Bayar</TableHead>
                                            <TableHead className="text-xs">Bukti Bayar</TableHead>
                                            <TableHead className="text-xs">Status</TableHead>
                                            <TableHead className="text-xs text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {booking.payments?.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-6 text-xs text-muted-foreground">
                                                    Belum ada jadwal atau riwayat pembayaran termin tercatat.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            booking.payments?.map((payment: any) => (
                                                <TableRow key={payment.id} className="hover:bg-muted/20 text-xs">
                                                    <TableCell>
                                                        <span className="font-mono font-bold text-foreground block">
                                                            {payment.payment_number}
                                                        </span>
                                                        <span className="text-[11px] text-muted-foreground">{payment.term_name}</span>
                                                    </TableCell>
                                                    <TableCell className="font-mono">{payment.due_date}</TableCell>
                                                    <TableCell className="font-mono font-semibold">{payment.formatted_amount_due}</TableCell>
                                                    <TableCell>
                                                        <span className="font-mono font-bold text-foreground block">
                                                            {payment.formatted_amount_paid}
                                                        </span>
                                                        {payment.payment_date && (
                                                            <span className="text-[10px] text-muted-foreground">Tgl: {payment.payment_date}</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {payment.payment_proof_url ? (
                                                            <a
                                                                href={payment.payment_proof_url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-1 text-primary hover:underline font-medium text-[11px]"
                                                            >
                                                                <FileText className="size-3" />
                                                                Lihat Bukti
                                                                <ExternalLink className="size-2.5" />
                                                            </a>
                                                        ) : (
                                                            <span className="text-muted-foreground italic text-[11px]">-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {payment.status === 'verified' ? (
                                                            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] gap-1">
                                                                <CheckCircle2 className="size-2.5" />
                                                                Valid
                                                            </Badge>
                                                        ) : payment.status === 'pending_verification' ? (
                                                            <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] gap-1">
                                                                <Clock className="size-2.5" />
                                                                Pending Validasi
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-[10px]">Unpaid</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {payment.status !== 'verified' && (can('verify-payments') || isFinance || isSuperAdmin) && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleVerifyPayment(payment.id)}
                                                                className="h-7 px-2 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                                                            >
                                                                <Check className="size-3" />
                                                                Verifikasi
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}

                    {/* TAB 4: TRACKING KPR BANK */}
                    {activeTab === 'kpr' && booking.payment_scheme === 'kpr' && (
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-sm font-bold text-foreground">Pipeline & Progres Pengajuan KPR Bank</h4>
                                <p className="text-xs text-muted-foreground">
                                    Pemantauan 8 tahapan berkas kredit dari pengajuan hingga pencairan dana ke rekening developer.
                                </p>
                            </div>

                            {/* Stepper Progress Visualizer */}
                            <div className="rounded-lg border p-4 bg-muted/20">
                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                                    {kprStages.map((stage, idx) => {
                                        const isCompleted = idx < currentKprStageIndex;
                                        const isCurrent = idx === currentKprStageIndex;
                                        return (
                                            <div
                                                key={stage.key}
                                                className={cn(
                                                    'p-2.5 rounded-lg border text-center transition-all',
                                                    isCurrent
                                                        ? 'bg-primary text-primary-foreground border-primary font-bold shadow-sm'
                                                        : isCompleted
                                                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-medium'
                                                        : 'bg-background border-border text-muted-foreground opacity-60'
                                                )}
                                            >
                                                <div className="flex items-center justify-center mb-1">
                                                    {isCompleted ? (
                                                        <CheckCircle2 className="size-4" />
                                                    ) : isCurrent ? (
                                                        <Clock className="size-4 animate-pulse" />
                                                    ) : (
                                                        <span className="text-[10px] font-mono">{idx + 1}</span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] leading-tight line-clamp-2">{stage.label}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Form Update Progres KPR */}
                            {(can('manage-kpr') || isFinance || isSalesManager || isSuperAdmin) && (
                                <form onSubmit={handleSubmitKpr} className="rounded-lg border p-5 space-y-4">
                                    <h5 className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                                        <Landmark className="size-4 text-primary" />
                                        Perbarui Data Berkas & Tahapan KPR Bank
                                    </h5>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                                        <div>
                                            <Label className="text-xs">Tahapan Saat Ini</Label>
                                            <Select
                                                value={kprForm.data.current_stage}
                                                onValueChange={(val) => kprForm.setData('current_stage', val)}
                                            >
                                                <SelectTrigger className="h-9 mt-1 bg-background">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {kprStages.map((s) => (
                                                        <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
                                                    ))}
                                                    <SelectItem value="rejected">Ditolak Bank</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label className="text-xs">Bank Rekanan Penyalur</Label>
                                            <Input
                                                placeholder="Contoh: Bank BTN Bandung"
                                                value={kprForm.data.bank_name}
                                                onChange={(e) => kprForm.setData('bank_name', e.target.value)}
                                                className="h-9 mt-1 bg-background"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label className="text-xs">Nomor Registrasi Aplikasi</Label>
                                            <Input
                                                placeholder="KPR-BTN-2026-XXXX"
                                                value={kprForm.data.application_number}
                                                onChange={(e) => kprForm.setData('application_number', e.target.value)}
                                                className="h-9 mt-1 bg-background"
                                            />
                                        </div>

                                        <div>
                                            <Label className="text-xs">Nominal Plafond Disetujui (SP3K)</Label>
                                            <Input
                                                type="number"
                                                placeholder="Rp Plafond SP3K"
                                                value={kprForm.data.approved_amount}
                                                onChange={(e) => kprForm.setData('approved_amount', e.target.value)}
                                                className="h-9 mt-1 bg-background font-mono"
                                            />
                                        </div>

                                        <div>
                                            <Label className="text-xs">Nomor Surat SP3K</Label>
                                            <Input
                                                placeholder="SP3K/BTN/09/2026/XXXX"
                                                value={kprForm.data.sp3k_number}
                                                onChange={(e) => kprForm.setData('sp3k_number', e.target.value)}
                                                className="h-9 mt-1 bg-background font-mono"
                                            />
                                        </div>

                                        <div>
                                            <Label className="text-xs">Tanggal SP3K Terbit</Label>
                                            <Input
                                                type="date"
                                                value={kprForm.data.sp3k_date}
                                                onChange={(e) => kprForm.setData('sp3k_date', e.target.value)}
                                                className="h-9 mt-1 bg-background"
                                            />
                                        </div>

                                        <div>
                                            <Label className="text-xs">Tanggal Rencana Akad Kredit</Label>
                                            <Input
                                                type="date"
                                                value={kprForm.data.akad_date}
                                                onChange={(e) => kprForm.setData('akad_date', e.target.value)}
                                                className="h-9 mt-1 bg-background"
                                            />
                                        </div>

                                        <div>
                                            <Label className="text-xs">Notaris Penanggung Jawab</Label>
                                            <Input
                                                placeholder="Nama Notaris Rekanan"
                                                value={kprForm.data.notary_name}
                                                onChange={(e) => kprForm.setData('notary_name', e.target.value)}
                                                className="h-9 mt-1 bg-background"
                                            />
                                        </div>

                                        <div>
                                            <Label className="text-xs">Suku Bunga (% p.a.) & Tenor (Thn)</Label>
                                            <div className="flex gap-2 mt-1">
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="4.75%"
                                                    value={kprForm.data.interest_rate}
                                                    onChange={(e) => kprForm.setData('interest_rate', e.target.value)}
                                                    className="h-9 bg-background w-1/2"
                                                />
                                                <Input
                                                    type="number"
                                                    placeholder="15 thn"
                                                    value={kprForm.data.tenor_years}
                                                    onChange={(e) => kprForm.setData('tenor_years', e.target.value)}
                                                    className="h-9 bg-background w-1/2"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-xs">Catatan Analis Bank / Progres Berkas</Label>
                                        <Textarea
                                            placeholder="Catatan kendala berkas atau jadwal wawancara..."
                                            value={kprForm.data.notes}
                                            onChange={(e) => kprForm.setData('notes', e.target.value)}
                                            className="mt-1 bg-background text-xs"
                                            rows={2}
                                        />
                                    </div>

                                    <div className="flex justify-end gap-2 pt-2">
                                        <Button
                                            type="submit"
                                            size="sm"
                                            disabled={kprForm.processing}
                                            className="h-9 text-xs bg-primary text-primary-foreground gap-1.5"
                                        >
                                            {kprForm.processing && <Loader2 className="size-3 animate-spin" />}
                                            Perbarui Tahapan KPR Bank
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}
                </div>

                {/* Dossier Footer */}
                <DialogFooter className="p-4 border-t bg-muted/20">
                    <Button variant="outline" size="sm" onClick={onClose}>
                        Tutup Dossier
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
