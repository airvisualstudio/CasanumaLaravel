import React, { useRef, useState } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover';
import { Calendar } from '@/Components/ui/calendar';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { CalendarIcon, Upload, Trash2, Loader2, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from '@/Components/ui/sonner';

interface BookingOption {
    id: number;
    booking_code: string;
    lead?: {
        id: number;
        name: string;
        whatsapp?: string | null;
    };
    unit?: {
        id: number;
        unit_code: string;
        cluster?: {
            name: string;
            project?: {
                name: string;
            };
        };
    };
}

interface CreateReceiptDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    bookings: BookingOption[];
}

export default function CreateReceiptDialog({
    open,
    onOpenChange,
    bookings,
}: CreateReceiptDialogProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [proofPreview, setProofPreview] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        booking_id: '',
        payment_type: 'booking_fee',
        amount: '',
        payment_method: 'transfer_bank',
        bank_name: '',
        payment_date: new Date().toISOString().split('T')[0],
        transfer_proof: null as File | null,
        notes: '',
    });

    const selectedBooking = bookings.find((b) => String(b.id) === data.booking_id);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Ukuran file bukti transfer maksimal 5MB.');
            e.target.value = '';
            return;
        }

        setData('transfer_proof', file);
        if (file.type.startsWith('image/')) {
            setProofPreview(URL.createObjectURL(file));
        } else {
            setProofPreview(null);
        }
    };

    const handleRemoveProof = () => {
        setData('transfer_proof', null);
        setProofPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.booking_id) {
            toast.error('Pilih transaksi booking terlebih dahulu.');
            return;
        }

        if (!data.amount || Number(data.amount) <= 0) {
            toast.error('Masukkan nominal pembayaran yang valid.');
            return;
        }

        post(route('receipts.store'), {
            onSuccess: () => {
                toast.success('Pengajuan kwitansi berhasil dibuat dan dikirim ke Finance!');
                reset();
                setProofPreview(null);
                onOpenChange(false);
            },
            onError: (errs) => {
                toast.error('Gagal mengajukan kwitansi. Periksa form kembali.');
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                            <FileText className="size-4.5 text-primary" />
                            <span>Pengajuan Kwitansi Pembayaran Baru</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Isi detail penerimaan pembayaran untuk diajukan ke Finance dan Manager.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Transaksi Booking / Konsumen */}
                    <div className="space-y-1.5">
                        <Label htmlFor="booking_id" className="text-xs font-semibold">
                            Pilih Transaksi Booking & Konsumen <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={data.booking_id}
                            onValueChange={(val) => setData('booking_id', val)}
                        >
                            <SelectTrigger id="booking_id" className="text-xs">
                                <SelectValue placeholder="-- Pilih Booking / Konsumen --" />
                            </SelectTrigger>
                            <SelectContent className="max-h-56">
                                {bookings.map((booking) => (
                                    <SelectItem key={booking.id} value={String(booking.id)} className="text-xs">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-semibold text-foreground">
                                                {booking.booking_code}
                                            </span>
                                            <span className="text-muted-foreground">
                                                {booking.lead?.name || 'Konsumen'} (Unit {booking.unit?.unit_code || '-'})
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.booking_id && (
                            <p className="text-xs font-medium text-destructive">{errors.booking_id}</p>
                        )}
                        {selectedBooking && (
                            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 text-[11px] text-muted-foreground space-y-0.5">
                                <p><strong className="text-foreground">Konsumen:</strong> {selectedBooking.lead?.name} {selectedBooking.lead?.whatsapp ? `(${selectedBooking.lead.whatsapp})` : ''}</p>
                                <p><strong className="text-foreground">Unit:</strong> {selectedBooking.unit?.unit_code} - {selectedBooking.unit?.cluster?.name} ({selectedBooking.unit?.cluster?.project?.name})</p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Jenis Pembayaran */}
                        <div className="space-y-1.5">
                            <Label htmlFor="payment_type" className="text-xs font-semibold">
                                Jenis Pembayaran <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={data.payment_type}
                                onValueChange={(val) => setData('payment_type', val)}
                            >
                                <SelectTrigger id="payment_type" className="text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="booking_fee" className="text-xs">Tanda Jadi (Booking Fee)</SelectItem>
                                    <SelectItem value="dp" className="text-xs">Uang Muka (DP)</SelectItem>
                                    <SelectItem value="installment" className="text-xs">Cicilan Bertahap</SelectItem>
                                    <SelectItem value="pelunasan" className="text-xs">Pelunasan Akhir</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.payment_type && (
                                <p className="text-xs font-medium text-destructive">{errors.payment_type}</p>
                            )}
                        </div>

                        {/* Metode Pembayaran */}
                        <div className="space-y-1.5">
                            <Label htmlFor="payment_method" className="text-xs font-semibold">
                                Metode Pembayaran <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={data.payment_method}
                                onValueChange={(val) => setData('payment_method', val)}
                            >
                                <SelectTrigger id="payment_method" className="text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="transfer_bank" className="text-xs">Transfer Bank</SelectItem>
                                    <SelectItem value="cash" className="text-xs">Tunai / Kasir</SelectItem>
                                    <SelectItem value="cheque" className="text-xs">Cek / Giro</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.payment_method && (
                                <p className="text-xs font-medium text-destructive">{errors.payment_method}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Nominal Pembayaran */}
                        <div className="space-y-1.5">
                            <Label htmlFor="amount" className="text-xs font-semibold">
                                Nominal Pembayaran (Rp) <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="amount"
                                type="number"
                                min="1000"
                                step="1000"
                                placeholder="Contoh: 10000000"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                                className="text-xs font-mono font-semibold"
                                required
                            />
                            {data.amount && Number(data.amount) > 0 && (
                                <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                    Rp {Number(data.amount).toLocaleString('id-ID')}
                                </p>
                            )}
                            {errors.amount && (
                                <p className="text-xs font-medium text-destructive">{errors.amount}</p>
                            )}
                        </div>

                        {/* Nama Bank */}
                        <div className="space-y-1.5">
                            <Label htmlFor="bank_name" className="text-xs font-semibold">
                                Bank Tujuan / Pengirim
                            </Label>
                            <Input
                                id="bank_name"
                                placeholder="Contoh: BCA / Mandiri / BSI"
                                value={data.bank_name}
                                onChange={(e) => setData('bank_name', e.target.value)}
                                className="text-xs"
                            />
                            {errors.bank_name && (
                                <p className="text-xs font-medium text-destructive">{errors.bank_name}</p>
                            )}
                        </div>
                    </div>

                    {/* Tanggal Bayar */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">
                            Tanggal Pembayaran <span className="text-destructive">*</span>
                        </Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal text-xs h-9"
                                >
                                    <CalendarIcon className="mr-2 size-3.5" />
                                    {data.payment_date ? (
                                        format(new Date(data.payment_date), 'PPP', { locale: idLocale })
                                    ) : (
                                        <span>Pilih Tanggal</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={data.payment_date ? new Date(data.payment_date) : undefined}
                                    onSelect={(date) => {
                                        if (date) {
                                            setData('payment_date', format(date, 'yyyy-MM-dd'));
                                        }
                                    }}
                                    autoFocus
                                />
                            </PopoverContent>
                        </Popover>
                        {errors.payment_date && (
                            <p className="text-xs font-medium text-destructive">{errors.payment_date}</p>
                        )}
                    </div>

                    {/* Bukti Transfer File */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">
                            Upload Bukti Transfer / Bukti Setor
                        </Label>
                        <div className="flex items-center gap-3">
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/png,image/jpeg,application/pdf"
                                onChange={handleFileChange}
                                className="hidden"
                                id="receipt_transfer_proof"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                className="h-8 text-xs gap-1.5"
                            >
                                <Upload className="size-3.5" />
                                <span>{data.transfer_proof ? 'Ganti File' : 'Pilih File Bukti'}</span>
                            </Button>
                            {data.transfer_proof && (
                                <div className="flex items-center gap-2 text-xs text-foreground font-medium">
                                    <span className="truncate max-w-[180px]">{data.transfer_proof.name}</span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleRemoveProof}
                                        className="size-6 text-destructive hover:bg-destructive/10"
                                    >
                                        <Trash2 className="size-3" />
                                    </Button>
                                </div>
                            )}
                        </div>
                        {proofPreview && (
                            <div className="mt-2 relative rounded-lg border border-border overflow-hidden max-h-36 max-w-[200px]">
                                <img src={proofPreview} alt="Preview Bukti" className="w-full h-full object-cover" />
                            </div>
                        )}
                        <p className="text-[11px] text-muted-foreground">
                            Format JPG, PNG, atau PDF (maks. 5MB).
                        </p>
                        {errors.transfer_proof && (
                            <p className="text-xs font-medium text-destructive">{errors.transfer_proof}</p>
                        )}
                    </div>

                    {/* Catatan Tambahan */}
                    <div className="space-y-1.5">
                        <Label htmlFor="notes" className="text-xs font-semibold">
                            Catatan Tambahan
                        </Label>
                        <Textarea
                            id="notes"
                            rows={2}
                            placeholder="Catatan rekening asal pengirim atau informasi referensi..."
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            className="text-xs resize-none"
                        />
                        {errors.notes && (
                            <p className="text-xs font-medium text-destructive">{errors.notes}</p>
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
                            className="text-xs gap-1.5"
                        >
                            {processing && <Loader2 className="size-3.5 animate-spin" />}
                            <span>Kirim Pengajuan</span>
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
