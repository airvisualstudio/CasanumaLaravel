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
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Receipt } from '@/types';
import { CheckCircle2, FileCheck2, Loader2, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { toast } from '@/Components/ui/sonner';

interface FinanceReviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    receipt: Receipt | null;
}

export default function FinanceReviewDialog({
    open,
    onOpenChange,
    receipt,
}: FinanceReviewDialogProps) {
    if (!receipt) return null;

    // Generate suggested receipt number if none
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const defaultNumber = `KW/${year}/${month}/${String(receipt.id).padStart(4, '0')}`;

    const { data, setData, post, processing, errors, reset } = useForm({
        finance_receipt_number: receipt.finance_receipt_number || defaultNumber,
        finance_notes: receipt.finance_notes || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.finance_receipt_number.trim()) {
            toast.error('Nomor kwitansi resmi wajib diisi oleh Finance.');
            return;
        }

        post(route('receipts.review-finance', receipt.id), {
            onSuccess: () => {
                toast.success('Kwitansi berhasil diverifikasi Finance dan diteruskan ke Manager!');
                reset();
                onOpenChange(false);
            },
            onError: () => {
                toast.error('Gagal memproses review kwitansi.');
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                            <FileCheck2 className="size-4.5 text-blue-600" />
                            <span>Review Kwitansi oleh Finance</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Verifikasi bukti pembayaran, input nomor kwitansi resmi perusahaan, dan submit ke Manager.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Ringkasan Kwitansi */}
                    <div className="p-3.5 rounded-xl border border-border/70 bg-muted/20 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Konsumen:</span>
                            <span className="font-semibold text-foreground">
                                {receipt.lead?.name || receipt.booking?.lead?.name || '-'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Booking Code:</span>
                            <span className="font-mono font-semibold text-foreground">
                                {receipt.booking?.booking_code || '-'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Jenis Pembayaran:</span>
                            <span className="font-medium text-foreground">{receipt.payment_type_label}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-border/50">
                            <span className="text-muted-foreground font-semibold">Nominal Pembayaran:</span>
                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                {receipt.formatted_amount}
                            </span>
                        </div>
                        {receipt.bank_name && (
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Bank:</span>
                                <span className="font-medium text-foreground">{receipt.bank_name}</span>
                            </div>
                        )}
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Tanggal Bayar:</span>
                            <span className="font-medium text-foreground">{receipt.payment_date}</span>
                        </div>
                    </div>

                    {/* Bukti Transfer */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Bukti Transfer dari Sales</Label>
                        {receipt.transfer_proof_url ? (
                            <div className="p-2.5 rounded-lg border border-border/60 bg-muted/10 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ImageIcon className="size-4 text-primary" />
                                    <span className="text-xs font-medium truncate max-w-[220px]">
                                        File Bukti Pembayaran
                                    </span>
                                </div>
                                <a
                                    href={receipt.transfer_proof_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-semibold"
                                >
                                    <span>Lihat File</span>
                                    <ExternalLink className="size-3" />
                                </a>
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground italic">Tidak ada lampiran bukti transfer.</p>
                        )}
                    </div>

                    {/* Nomor Kwitansi Resmi */}
                    <div className="space-y-1.5">
                        <Label htmlFor="finance_receipt_number" className="text-xs font-semibold">
                            Nomor Kwitansi Resmi Perusahaan <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="finance_receipt_number"
                            value={data.finance_receipt_number}
                            onChange={(e) => setData('finance_receipt_number', e.target.value)}
                            placeholder="Contoh: KW/2026/09/0001"
                            className="text-xs font-mono font-bold"
                            required
                        />
                        <p className="text-[11px] text-muted-foreground">
                            Nomor kwitansi ini akan dicetak di header dokumen PDF dan menjadi identitas arsip resmi.
                        </p>
                        {errors.finance_receipt_number && (
                            <p className="text-xs font-medium text-destructive">{errors.finance_receipt_number}</p>
                        )}
                    </div>

                    {/* Catatan Finance */}
                    <div className="space-y-1.5">
                        <Label htmlFor="finance_notes" className="text-xs font-semibold">
                            Catatan Finance (Opsional)
                        </Label>
                        <Textarea
                            id="finance_notes"
                            rows={2}
                            placeholder="Contoh: Dana masuk rekening BCA pada 15/09/2026 pukul 10:15 WIB. Rekening valid."
                            value={data.finance_notes}
                            onChange={(e) => setData('finance_notes', e.target.value)}
                            className="text-xs resize-none"
                        />
                        {errors.finance_notes && (
                            <p className="text-xs font-medium text-destructive">{errors.finance_notes}</p>
                        )}
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
                            className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {processing && <Loader2 className="size-3.5 animate-spin" />}
                            <CheckCircle2 className="size-3.5" />
                            <span>Setujui & Teruskan ke Manager</span>
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
