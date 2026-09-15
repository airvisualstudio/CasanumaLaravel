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
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Receipt } from '@/types';
import { XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from '@/Components/ui/sonner';

interface RejectReceiptDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    receipt: Receipt | null;
}

export default function RejectReceiptDialog({
    open,
    onOpenChange,
    receipt,
}: RejectReceiptDialogProps) {
    if (!receipt) return null;

    const { data, setData, post, processing, errors, reset } = useForm({
        rejection_reason: '',
    });

    const handleReject = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.rejection_reason.trim()) {
            toast.error('Alasan penolakan kwitansi wajib diisi.');
            return;
        }

        post(route('receipts.reject', receipt.id), {
            onSuccess: () => {
                toast.success('Pengajuan kwitansi telah ditolak.');
                reset();
                onOpenChange(false);
            },
            onError: () => {
                toast.error('Gagal menolak kwitansi.');
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleReject} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base font-bold text-destructive">
                            <XCircle className="size-5" />
                            <span>Tolak Pengajuan Kwitansi</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Kwitansi yang ditolak akan dikembalikan ke Sales disertai alasan perbaikan/revisi.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Ringkasan */}
                    <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/5 text-xs space-y-1">
                        <p><strong className="text-foreground">Konsumen:</strong> {receipt.lead?.name || receipt.booking?.lead?.name || '-'}</p>
                        <p><strong className="text-foreground">Nominal:</strong> {receipt.formatted_amount} ({receipt.payment_type_label})</p>
                        <p><strong className="text-foreground">Diajukan oleh:</strong> {receipt.submitter?.name || 'Sales'}</p>
                    </div>

                    {/* Alasan Penolakan */}
                    <div className="space-y-1.5">
                        <Label htmlFor="rejection_reason" className="text-xs font-semibold">
                            Alasan Penolakan <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="rejection_reason"
                            rows={3}
                            placeholder="Contoh: Bukti transfer buram/tidak terbaca, nominal tidak sesuai rekening koran, dll..."
                            value={data.rejection_reason}
                            onChange={(e) => setData('rejection_reason', e.target.value)}
                            className="text-xs resize-none"
                            required
                        />
                        {errors.rejection_reason && (
                            <p className="text-xs font-medium text-destructive">{errors.rejection_reason}</p>
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
                            variant="destructive"
                            disabled={processing}
                            className="text-xs gap-1.5"
                        >
                            {processing && <Loader2 className="size-3.5 animate-spin" />}
                            <span>Konfirmasi Penolakan</span>
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
