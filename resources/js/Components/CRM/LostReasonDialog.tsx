import { useState, useEffect } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { AlertCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from '@/Components/ui/sonner';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    leadName: string;
    onConfirm: (reason: string) => Promise<void> | void;
    onCancel: () => void;
    loading?: boolean;
}

const COMMON_LOST_REASONS = [
    'BI Checking / SLIK OJK Ditolak Bank',
    'Harga & Simulasi Angsuran di Luar Budget',
    'Pindah Pilihan ke Proyek / Pengembang Lain',
    'Lokasi Tidak Sesuai Kebutuhan Keluarga',
    'Tidak Merespon / Kontak Tidak Aktif (Lost Contact)',
    'Menunda Rencana Pembelian Properti',
    'Alasan Lainnya',
];

export default function LostReasonDialog({
    open,
    onOpenChange,
    leadName,
    onConfirm,
    onCancel,
    loading = false,
}: Props) {
    const [category, setCategory] = useState<string>(COMMON_LOST_REASONS[0]);
    const [customDetail, setCustomDetail] = useState<string>('');

    useEffect(() => {
        if (open) {
            setCategory(COMMON_LOST_REASONS[0]);
            setCustomDetail('');
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const fullReason = customDetail.trim()
            ? `${category}: ${customDetail.trim()}`
            : category;

        if (!fullReason.trim()) {
            toast.error('Alasan pembatalan prospek wajib diisi.');
            return;
        }

        await onConfirm(fullReason);
    };

    const handleClose = () => {
        onCancel();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={(val) => (!val ? handleClose() : onOpenChange(val))}>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                            <XCircle className="size-5" />
                            <DialogTitle className="text-base font-bold">
                                Alasan Prospek Batal (Lost)
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-xs pt-1 text-muted-foreground">
                            Wajib mencatat alasan pembatalan untuk konsumen{' '}
                            <strong className="text-foreground">{leadName}</strong> agar dapat dianalisis tim manajemen.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Kategori Alasan */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">
                                Kategori Alasan <span className="text-destructive">*</span>
                            </Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger className="h-9 text-xs">
                                    <SelectValue placeholder="Pilih kategori alasan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {COMMON_LOST_REASONS.map((r) => (
                                        <SelectItem key={r} value={r} className="text-xs">
                                            {r}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Rincian Tambahan */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">
                                Penjelasan / Catatan Tambahan (Opsional)
                            </Label>
                            <Textarea
                                rows={3}
                                placeholder="Tuliskan detail kendala konsumen, feedback harga, atau kendala BI checking..."
                                value={customDetail}
                                onChange={(e) => setCustomDetail(e.target.value)}
                                className="text-xs resize-none"
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleClose}
                            disabled={loading}
                            className="text-xs rounded-xl"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={loading}
                            className="text-xs rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs gap-1.5"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="size-3.5 animate-spin" />
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <>
                                    <XCircle className="size-3.5" />
                                    <span>Konfirmasi Status Lost</span>
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
