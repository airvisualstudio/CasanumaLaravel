import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Receipt, ReceiptStatusLog } from '@/types';
import {
    FileText,
    Download,
    QrCode,
    ExternalLink,
    CheckCircle2,
    Clock,
    User,
    Building2,
    Calendar,
    Wallet,
    AlertCircle,
    XCircle,
    ShieldCheck,
    History,
    CheckCheck,
    ArrowRight
} from 'lucide-react';
import { useAuthorization } from '@/hooks/useAuthorization';

interface ReceiptDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    receipt: Receipt | null;
    onOpenFinanceReview?: (receipt: Receipt) => void;
    onOpenManagerApproval?: (receipt: Receipt) => void;
    onOpenReject?: (receipt: Receipt) => void;
}

export default function ReceiptDetailDialog({
    open,
    onOpenChange,
    receipt,
    onOpenFinanceReview,
    onOpenManagerApproval,
    onOpenReject,
}: ReceiptDetailDialogProps) {
    const { can, isSuperAdmin, isFinance, isSalesManager } = useAuthorization();
    const [activeTab, setActiveTab] = useState<'details' | 'timeline'>('details');

    if (!receipt) return null;

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'submitted':
                return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
            case 'finance_review':
                return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
            case 'finance_approved':
                return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20';
            case 'manager_approved':
                return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
            case 'rejected':
                return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
            default:
                return 'bg-muted text-muted-foreground';
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="border-b border-border/50 pb-3">
                    <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <FileText className="size-4.5 text-primary" />
                                <DialogTitle className="text-base font-bold font-mono">
                                    {receipt.receipt_number || receipt.finance_receipt_number || `DRAFT-#RC${String(receipt.id).padStart(4, '0')}`}
                                </DialogTitle>
                            </div>
                            <DialogDescription className="text-xs">
                                Transaksi {receipt.booking?.booking_code} &bull; Kavling {receipt.booking?.unit?.unit_code || '-'}
                            </DialogDescription>
                        </div>
                        <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${getStatusBadgeVariant(receipt.status)}`}>
                            {receipt.status_label}
                        </span>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex items-center gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => setActiveTab('details')}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                                activeTab === 'details'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-muted'
                            }`}
                        >
                            Rincian Pembayaran
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('timeline')}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                                activeTab === 'timeline'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-muted'
                            }`}
                        >
                            <History className="size-3.5" />
                            <span>Riwayat Dokumen ({receipt.status_logs?.length || 0})</span>
                        </button>
                    </div>
                </DialogHeader>

                {activeTab === 'details' ? (
                    <div className="space-y-4 py-1 text-xs">
                        {/* Amount Box */}
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <div>
                                <span className="text-[11px] text-muted-foreground uppercase font-semibold">
                                    Jenis Pembayaran:
                                </span>
                                <p className="text-sm font-bold text-foreground">
                                    {receipt.payment_type_label}
                                </p>
                            </div>
                            <div className="text-left sm:text-right">
                                <span className="text-[11px] text-muted-foreground uppercase font-semibold">
                                    Total Nominal:
                                </span>
                                <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                                    {receipt.formatted_amount}
                                </p>
                            </div>
                        </div>

                        {/* Konsumen & Kavling */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg border border-border/70 bg-muted/20 space-y-1">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                    Data Konsumen
                                </span>
                                <p className="font-semibold text-foreground text-xs">
                                    {receipt.lead?.name || receipt.booking?.lead?.name || '-'}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                    WA: {receipt.lead?.whatsapp || receipt.booking?.lead?.whatsapp || '-'}
                                </p>
                                {receipt.lead?.email && (
                                    <p className="text-[11px] text-muted-foreground">
                                        Email: {receipt.lead.email}
                                    </p>
                                )}
                            </div>

                            <div className="p-3 rounded-lg border border-border/70 bg-muted/20 space-y-1">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                    Unit & Kavling
                                </span>
                                <p className="font-semibold text-foreground text-xs">
                                    Kode Unit: {receipt.booking?.unit?.unit_code || '-'}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                    Cluster: {receipt.booking?.unit?.cluster?.name || '-'}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                    Proyek: {receipt.booking?.unit?.cluster?.project?.name || '-'}
                                </p>
                            </div>
                        </div>

                        {/* Detail Pembayaran */}
                        <div className="p-3 rounded-lg border border-border/70 bg-muted/10 space-y-2">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                Rincian Transaksi
                            </span>
                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                                <div>
                                    <span className="text-muted-foreground">Metode Bayar:</span>
                                    <p className="font-medium text-foreground capitalize">
                                        {receipt.payment_method?.replace('_', ' ') || '-'}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Bank:</span>
                                    <p className="font-medium text-foreground">
                                        {receipt.bank_name || '-'}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Tanggal Pembayaran:</span>
                                    <p className="font-medium text-foreground">
                                        {receipt.payment_date}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Diajukan oleh:</span>
                                    <p className="font-medium text-foreground">
                                        {receipt.submitter?.name || '-'}
                                    </p>
                                </div>
                            </div>

                            {receipt.notes && (
                                <div className="pt-2 border-t border-border/40">
                                    <span className="text-[10px] text-muted-foreground font-semibold">Catatan Sales:</span>
                                    <p className="text-foreground text-[11px] italic mt-0.5">{receipt.notes}</p>
                                </div>
                            )}

                            {receipt.finance_notes && (
                                <div className="pt-2 border-t border-border/40">
                                    <span className="text-[10px] text-muted-foreground font-semibold">Catatan Finance:</span>
                                    <p className="text-foreground text-[11px] italic mt-0.5">{receipt.finance_notes}</p>
                                </div>
                            )}

                            {receipt.rejection_reason && (
                                <div className="pt-2 border-t border-rose-500/20 text-destructive bg-destructive/5 p-2 rounded">
                                    <span className="text-[10px] font-bold uppercase">Alasan Penolakan:</span>
                                    <p className="text-[11px] mt-0.5">{receipt.rejection_reason}</p>
                                </div>
                            )}
                        </div>

                        {/* Bukti Transfer */}
                        {receipt.transfer_proof_url && (
                            <div className="p-3 rounded-lg border border-border/70 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FileText className="size-4 text-primary" />
                                    <div>
                                        <p className="font-semibold text-foreground text-xs">Lampiran Bukti Transfer</p>
                                        <p className="text-[10px] text-muted-foreground">Klik untuk membuka file asli</p>
                                    </div>
                                </div>
                                <a
                                    href={receipt.transfer_proof_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-primary font-bold hover:underline"
                                >
                                    <span>Buka Lampiran</span>
                                    <ExternalLink className="size-3" />
                                </a>
                            </div>
                        )}

                        {/* Signatures & Verifications section */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div className="p-2.5 rounded-lg border border-border/50 bg-muted/20 text-[11px]">
                                <span className="text-[10px] text-muted-foreground font-bold uppercase">Reviewer Finance</span>
                                <p className="font-semibold text-foreground mt-0.5">
                                    {receipt.finance_reviewer?.name || (receipt.status === 'submitted' ? 'Menunggu Review' : '-')}
                                </p>
                                {receipt.reviewed_by_finance_at && (
                                    <p className="text-[10px] text-muted-foreground">{receipt.reviewed_by_finance_at}</p>
                                )}
                            </div>

                            <div className="p-2.5 rounded-lg border border-border/50 bg-muted/20 text-[11px]">
                                <span className="text-[10px] text-muted-foreground font-bold uppercase">Approver Manager</span>
                                <p className="font-semibold text-foreground mt-0.5">
                                    {receipt.manager_approver?.name || (receipt.status === 'manager_approved' ? 'Disetujui' : 'Menunggu Approval')}
                                </p>
                                {receipt.approved_by_manager_at && (
                                    <p className="text-[10px] text-muted-foreground">{receipt.approved_by_manager_at}</p>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Timeline Tab */
                    <div className="space-y-4 py-2">
                        {receipt.status_logs && receipt.status_logs.length > 0 ? (
                            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                                {receipt.status_logs.map((log) => (
                                    <div key={log.id} className="relative">
                                        <div className="absolute -left-6 top-0.5 size-4 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                                            <div className="size-1.5 rounded-full bg-primary" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-xs font-bold text-foreground">
                                                    {log.status_label}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground font-mono">
                                                    {log.created_at_formatted}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground">
                                                Diproses oleh: <strong className="text-foreground">{log.changed_by_user?.name || 'Sistem'}</strong>
                                            </p>
                                            {log.notes && (
                                                <p className="text-[11px] text-foreground/90 italic bg-muted/40 p-2 rounded mt-1 border border-border/50">
                                                    "{log.notes}"
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-muted-foreground text-xs">
                                <History className="size-8 mx-auto mb-1 opacity-30" />
                                <p>Belum ada riwayat tercatat untuk dokumen ini.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Footer Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/60">
                    <div className="flex items-center gap-2">
                        {receipt.status === 'manager_approved' && (
                            <>
                                <a
                                    href={route('receipts.pdf', receipt.id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button size="sm" className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
                                        <Download className="size-3.5" />
                                        <span>Download PDF Resmi</span>
                                    </Button>
                                </a>

                                {receipt.qr_code_token && (
                                    <a
                                        href={route('receipts.verify', receipt.qr_code_token)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                                            <QrCode className="size-3.5" />
                                            <span>Verifikasi QR</span>
                                        </Button>
                                    </a>
                                )}
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Finance Action: Review */}
                        {(isFinance || isSuperAdmin) && (receipt.status === 'submitted' || receipt.status === 'finance_review') && (
                            <Button
                                size="sm"
                                onClick={() => {
                                    onOpenChange(false);
                                    onOpenFinanceReview?.(receipt);
                                }}
                                className="h-8 text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <CheckCircle2 className="size-3.5" />
                                <span>Review Finance</span>
                            </Button>
                        )}

                        {/* Manager Action: Approve */}
                        {(isSalesManager || isSuperAdmin) && receipt.status === 'finance_approved' && (
                            <Button
                                size="sm"
                                onClick={() => {
                                    onOpenChange(false);
                                    onOpenManagerApproval?.(receipt);
                                }}
                                className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                <CheckCheck className="size-3.5" />
                                <span>Approval Manager</span>
                            </Button>
                        )}

                        {/* Reject Action */}
                        {(isFinance || isSalesManager || isSuperAdmin) && 
                         !['manager_approved', 'rejected'].includes(receipt.status) && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                    onOpenChange(false);
                                    onOpenReject?.(receipt);
                                }}
                                className="h-8 text-xs gap-1.5"
                            >
                                <XCircle className="size-3.5" />
                                <span>Tolak</span>
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenChange(false)}
                            className="h-8 text-xs"
                        >
                            Tutup
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
