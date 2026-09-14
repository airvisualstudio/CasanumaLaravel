import React, { useState, useEffect, useRef } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Card, CardContent } from '@/Components/ui/card';
import { useForm } from '@inertiajs/react';
import { CreditCard, Upload, Loader2, DollarSign, Home, User, X } from 'lucide-react';
import { useAuthorization } from '@/hooks/useAuthorization';

interface CreateBookingDialogProps {
    open: boolean;
    onClose: () => void;
    availableUnits: any[];
    leads: any[];
    salesUsers: any[];
}

export default function CreateBookingDialog({
    open,
    onClose,
    availableUnits,
    leads,
    salesUsers,
}: CreateBookingDialogProps) {
    const { user, isSuperAdmin, isSalesManager } = useAuthorization();
    const canAssignSales = isSuperAdmin || isSalesManager;

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedProofName, setSelectedProofName] = useState<string | null>(null);

    const bookingForm = useForm<{
        lead_id: string;
        housing_unit_id: string;
        sales_id: string;
        payment_scheme: 'cash' | 'kpr' | 'cash_bertahap';
        base_price: string;
        additional_price: string;
        discount_amount: string;
        legal_fees: string;
        booking_fee: string;
        dp_amount: string;
        dp_installments_count: string;
        transaction_date: string;
        transfer_proof: File | null;
        notes: string;
    }>({
        lead_id: leads[0]?.id?.toString() || '',
        housing_unit_id: availableUnits[0]?.id?.toString() || '',
        sales_id: salesUsers[0]?.id?.toString() || 'none',
        payment_scheme: 'kpr',
        base_price: availableUnits[0]?.base_price?.toString() || '450000000',
        additional_price: '0',
        discount_amount: '0',
        legal_fees: '0',
        booking_fee: '5000000',
        dp_amount: '45000000',
        dp_installments_count: '1',
        transaction_date: new Date().toISOString().split('T')[0],
        transfer_proof: null,
        notes: '',
    });

    // When unit changes, update base_price automatically
    useEffect(() => {
        if (bookingForm.data.housing_unit_id) {
            const selectedUnit = availableUnits.find(
                (u) => u.id.toString() === bookingForm.data.housing_unit_id
            );
            if (selectedUnit) {
                const base = parseFloat(selectedUnit.base_price?.toString() || '0');
                bookingForm.setData((prev) => ({
                    ...prev,
                    base_price: base.toString(),
                    dp_amount: (base * 0.1).toString(), // Default DP 10%
                }));
            }
        }
    }, [bookingForm.data.housing_unit_id]);

    const basePrice = parseFloat(bookingForm.data.base_price || '0');
    const additionalPrice = parseFloat(bookingForm.data.additional_price || '0');
    const discountAmount = parseFloat(bookingForm.data.discount_amount || '0');
    const legalFees = parseFloat(bookingForm.data.legal_fees || '0');
    const totalPrice = Math.max(0, basePrice + additionalPrice - discountAmount + legalFees);

    const bookingFee = parseFloat(bookingForm.data.booking_fee || '0');
    const dpAmount = parseFloat(bookingForm.data.dp_amount || '0');
    const remainingAmount = Math.max(0, totalPrice - (dpAmount > 0 ? dpAmount : bookingFee));

    const formatRp = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val);
    };

    const handleSubmit: React.FormEventHandler = (e) => {
        e.preventDefault();
        bookingForm.transform((data) => ({
            ...data,
            sales_id: data.sales_id === 'none' ? '' : data.sales_id,
        }));

        bookingForm.post(route('bookings.store'), {
            onSuccess: () => {
                onClose();
                setSelectedProofName(null);
                bookingForm.reset();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                        <CreditCard className="size-5 text-primary" />
                        Input Transaksi Tanda Jadi (Booking Unit)
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Pencatatan tanda jadi kavling, pemilihan skema bayar, perhitungan estimasi SPR, dan penguncian unit otomatis.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Unit & Customer Selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <Label className="text-xs font-semibold">Pilih Unit Kavling Tersedia *</Label>
                            <Select
                                value={bookingForm.data.housing_unit_id}
                                onValueChange={(val) => bookingForm.setData('housing_unit_id', val)}
                            >
                                <SelectTrigger className="h-10 mt-1 bg-background">
                                    <SelectValue placeholder="Pilih unit kavling..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableUnits.map((u) => (
                                        <SelectItem key={u.id} value={u.id.toString()}>
                                            Blok {u.unit_code} - {u.cluster?.name} ({formatRp(Number(u.base_price))})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {bookingForm.errors.housing_unit_id && (
                                <p className="text-[11px] text-destructive mt-1">{bookingForm.errors.housing_unit_id}</p>
                            )}
                        </div>

                        <div>
                            <Label className="text-xs font-semibold">Pilih Prospek Konsumen *</Label>
                            <Select
                                value={bookingForm.data.lead_id}
                                onValueChange={(val) => bookingForm.setData('lead_id', val)}
                            >
                                <SelectTrigger className="h-10 mt-1 bg-background">
                                    <SelectValue placeholder="Pilih konsumen..." />
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
                                <p className="text-[11px] text-destructive mt-1">{bookingForm.errors.lead_id}</p>
                            )}
                        </div>
                    </div>

                    {/* Marketing & Payment Scheme */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <Label className="text-xs font-semibold">Sales Marketing (PIC)</Label>
                            {canAssignSales ? (
                                <Select
                                    value={bookingForm.data.sales_id}
                                    onValueChange={(val) => bookingForm.setData('sales_id', val)}
                                >
                                    <SelectTrigger className="h-10 mt-1 bg-background">
                                        <SelectValue placeholder="Pilih marketing..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Otomatis User Saya Sendiri</SelectItem>
                                        {salesUsers.map((s) => (
                                            <SelectItem key={s.id} value={s.id.toString()}>
                                                {s.name} ({s.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input
                                    value={`${user?.name || 'Saya Sendiri'} (${user?.email || ''})`}
                                    disabled
                                    className="h-10 mt-1 bg-muted/60 text-foreground font-medium text-xs cursor-not-allowed"
                                />
                            )}
                        </div>

                        <div>
                            <Label className="text-xs font-semibold">Skema Pembayaran *</Label>
                            <Select
                                value={bookingForm.data.payment_scheme}
                                onValueChange={(val: any) => bookingForm.setData('payment_scheme', val)}
                            >
                                <SelectTrigger className="h-10 mt-1 bg-background">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="kpr">Kredit Kepemilikan Rumah (KPR Bank)</SelectItem>
                                    <SelectItem value="cash">Cash Keras (Pelunasan Tunai)</SelectItem>
                                    <SelectItem value="cash_bertahap">Cash Bertahap (In-House)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Financial Structure Inputs */}
                    <div className="rounded-lg border p-3.5 bg-muted/20 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <DollarSign className="size-4 text-primary" />
                            Struktur Finansial & Kesepakatan Harga SPR
                        </h4>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            <div>
                                <Label className="text-[11px]">Harga Dasar Unit</Label>
                                <Input
                                    type="number"
                                    value={bookingForm.data.base_price}
                                    onChange={(e) => bookingForm.setData('base_price', e.target.value)}
                                    className="h-9 mt-1 bg-background font-mono text-xs"
                                    required
                                />
                            </div>

                            <div>
                                <Label className="text-[11px]">Biaya Hook/Fasum</Label>
                                <Input
                                    type="number"
                                    value={bookingForm.data.additional_price}
                                    onChange={(e) => bookingForm.setData('additional_price', e.target.value)}
                                    className="h-9 mt-1 bg-background font-mono text-xs"
                                />
                            </div>

                            <div>
                                <Label className="text-[11px]">Diskon Promo (Rp)</Label>
                                <Input
                                    type="number"
                                    value={bookingForm.data.discount_amount}
                                    onChange={(e) => bookingForm.setData('discount_amount', e.target.value)}
                                    className="h-9 mt-1 bg-background font-mono text-xs text-emerald-600"
                                />
                            </div>

                            <div>
                                <Label className="text-[11px]">Biaya Legalitas/AJB</Label>
                                <Input
                                    type="number"
                                    value={bookingForm.data.legal_fees}
                                    onChange={(e) => bookingForm.setData('legal_fees', e.target.value)}
                                    className="h-9 mt-1 bg-background font-mono text-xs"
                                />
                            </div>
                        </div>

                        {/* Real-time Calculation Card */}
                        <div className="p-2.5 rounded bg-background border flex items-center justify-between">
                            <div>
                                <span className="text-[11px] text-muted-foreground block">Estimasi Total Harga Transaksi Bersih:</span>
                                <span className="text-base font-bold font-mono text-primary">{formatRp(totalPrice)}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-[11px] text-muted-foreground block">Estimasi Sisa Pelunasan / KPR:</span>
                                <span className="text-sm font-bold font-mono text-foreground">{formatRp(remainingAmount)}</span>
                            </div>
                        </div>

                        {/* Booking Fee & DP */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <div>
                                <Label className="text-[11px] font-semibold">Uang Tanda Jadi (Booking Fee) *</Label>
                                <Input
                                    type="number"
                                    value={bookingForm.data.booking_fee}
                                    onChange={(e) => bookingForm.setData('booking_fee', e.target.value)}
                                    className="h-9 mt-1 bg-background font-mono text-xs text-emerald-600 font-bold"
                                    required
                                />
                            </div>

                            <div>
                                <Label className="text-[11px]">Rencana Uang Muka (DP)</Label>
                                <Input
                                    type="number"
                                    value={bookingForm.data.dp_amount}
                                    onChange={(e) => bookingForm.setData('dp_amount', e.target.value)}
                                    className="h-9 mt-1 bg-background font-mono text-xs"
                                />
                            </div>

                            <div>
                                <Label className="text-[11px]">Berapa Kali DP Dicicil</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    max="36"
                                    value={bookingForm.data.dp_installments_count}
                                    onChange={(e) => bookingForm.setData('dp_installments_count', e.target.value)}
                                    className="h-9 mt-1 bg-background font-mono text-xs"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Transaction Date & Proof Upload */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <Label className="text-xs font-semibold">Tanggal Transaksi Tanda Jadi *</Label>
                            <Input
                                type="date"
                                value={bookingForm.data.transaction_date}
                                onChange={(e) => bookingForm.setData('transaction_date', e.target.value)}
                                className="h-10 mt-1 bg-background"
                                required
                            />
                        </div>

                        <div>
                            <Label className="text-xs font-semibold">Bukti Transfer Tanda Jadi</Label>
                            <div className="mt-1 flex items-center gap-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] || null;
                                        bookingForm.setData('transfer_proof', file);
                                        setSelectedProofName(file ? file.name : null);
                                    }}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="h-10 text-xs gap-1.5 flex-1"
                                >
                                    <Upload className="size-4 text-muted-foreground" />
                                    {selectedProofName ? selectedProofName : 'Pilih File (JPG/PNG/PDF)'}
                                </Button>
                                {selectedProofName && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 text-muted-foreground hover:text-destructive"
                                        onClick={() => {
                                            bookingForm.setData('transfer_proof', null);
                                            setSelectedProofName(null);
                                            if (fileInputRef.current) fileInputRef.current.value = '';
                                        }}
                                    >
                                        <X className="size-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label className="text-xs">Catatan Kesepakatan Khusus</Label>
                        <Textarea
                            placeholder="Catatan bonus AC/kanopi, bank pilihan konsumen, dll..."
                            value={bookingForm.data.notes}
                            onChange={(e) => bookingForm.setData('notes', e.target.value)}
                            className="mt-1 bg-background text-xs"
                            rows={2}
                        />
                    </div>

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={bookingForm.processing}>
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={bookingForm.processing}
                            className="bg-primary text-primary-foreground font-semibold gap-1.5"
                        >
                            {bookingForm.processing && <Loader2 className="size-4 animate-spin" />}
                            Simpan & Kunci Unit Kavling
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
