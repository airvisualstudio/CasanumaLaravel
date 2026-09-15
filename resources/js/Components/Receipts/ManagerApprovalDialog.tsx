import React from 'react';
import { useForm } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Receipt } from '@/types';
import { Award, CheckCircle2, Loader2, QrCode, FileText, AlertCircle } from 'lucide-react';
import { toast } from '@/Components/ui/sonner';

interface ManagerApprovalDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    receipt: Receipt | null;
}

export default function ManagerApprovalDialog({
    open,
    onOpenChange,
    receipt,
}: ManagerApprovalDialogProps) {
    if (!receipt) return null;

    const { post, processing } = useForm();

    const handleApprove = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('receipts.approve-manager', receipt.id), {
            onSuccess: () => {
                toast.success('Kwitansi disetujui! QR Code verifikasi dan PDF resmi berhasil di-generate.');
                onOpenChange(false);
            },
            onError: () => {
                toast.error('Gagal memberikan approval final.');
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleApprove} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                            <Award className="size-5 text-emerald-600" />
                            <span>Approval Akhir Kwitansi (Manager)</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Kwitansi ini telah diverifikasi oleh tim Finance. Setelah approval diberikan, sistem akan otomatis menerbitkan QR Code keaslian dan PDF resmi.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Ringkasan Dokumen */}
                    <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2.5 text-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Nomor Kwitansi:</span>
                            <span className="font-mono font-bold text-foreground">
                                {receipt.finance_receipt_number || receipt.receipt_number || '-'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Konsumen:</span>
                            <span className="font-semibold text-foreground">
                                {receipt.lead?.name || receipt.booking?.lead?.name || '-'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Unit Properti:</span>
                            <span className="font-medium text-foreground">
                                {receipt.booking?.unit?.unit_code || '-'} ({receipt.booking?.booking_code || '-'})
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Jenis Pembayaran:</span>
                            <span className="font-medium text-foreground">{receipt.payment_type_label}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-emerald-500/20">
                            <span className="text-muted-foreground font-semibold">Total Nominal:</span>
                            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                                {receipt.formatted_amount}
                            </span>
                        </div>
                    </div>

                    {receipt.finance_notes && (
                        <div className="p-3 rounded-lg border border-border/60 bg-muted/20 text-xs">
                            <p className="text-[11px] font-semibold text-muted-foreground mb-0.5">Catatan Verifikasi Finance:</p>
                            <p className="text-foreground italic">"{receipt.finance_notes}"</p>
                        </div>
                    )}

                    {/* Fitur Otomatisasi Highlight */}
                    <div className="flex items-start gap-2.5 p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
                        <QrCode className="size-4 text-primary shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                            <p className="font-semibold text-foreground">Otomatisasi Sistem:</p>
                            <p className="text-[11px]">
                                Dokumen PDF resmi akan langsung diarsip dengan watermark tanda tangan digital dan QR Code validasi keaslian publik.
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={processing}
                            className="text-xs"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                        >
                            {processing && <Loader2 className="size-3.5 animate-spin" />}
                            <CheckCircle2 className="size-3.5" />
                            <span>Setujui & Terbitkan Kwitansi</span>
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
