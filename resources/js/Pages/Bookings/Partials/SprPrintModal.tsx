import React, { useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Printer, X, FileText, CheckCircle2, ShieldCheck, Building2 } from 'lucide-react';

interface SprPrintModalProps {
    open: boolean;
    onClose: () => void;
    booking: any;
}

export default function SprPrintModal({ open, onClose, booking }: SprPrintModalProps) {
    const printAreaRef = useRef<HTMLDivElement>(null);

    if (!booking) return null;

    const formatRp = (val: number | string | undefined | null) => {
        const num = typeof val === 'string' ? parseFloat(val) : Number(val || 0);
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(isNaN(num) ? 0 : num);
    };

    const handlePrint = () => {
        window.print();
    };

    const schemeName = (scheme: string) => {
        switch (scheme) {
            case 'kpr':
                return 'Kredit Kepemilikan Rumah (KPR Bank)';
            case 'cash_bertahap':
                return 'Cash Bertahap (In-House Developer)';
            case 'cash':
            default:
                return 'Cash Keras (Pelunasan Tunai)';
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 print:border-none print:shadow-none print:max-w-none print:m-0 print:p-0">
                {/* Print Control Toolbar - Hidden when printing */}
                <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30 print:hidden sticky top-0 bg-background/95 backdrop-blur z-20">
                    <div className="flex items-center gap-2">
                        <FileText className="size-5 text-primary" />
                        <div>
                            <h3 className="font-semibold text-sm">Dokumen Resmi Surat Pesanan Rumah (SPR)</h3>
                            <p className="text-xs text-muted-foreground">
                                {booking.spr_number || `DRAFT - ${booking.booking_code}`}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={handlePrint}
                            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                        >
                            <Printer className="size-4" />
                            Cetak / Download PDF
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="size-4" />
                        </Button>
                    </div>
                </div>

                {/* Printable Document Sheet */}
                <div
                    ref={printAreaRef}
                    className="p-8 sm:p-12 font-sans text-slate-900 bg-white dark:bg-zinc-950 dark:text-zinc-100 print:bg-white print:text-black print:p-6"
                >
                    {/* Header Kop Surat */}
                    <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <Building2 className="size-7 text-primary" />
                                <span className="font-extrabold text-2xl tracking-wider text-slate-900 dark:text-white uppercase">
                                    CASANUMA RESIDENCE
                                </span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                                PT Casanuma Graha Megah Mandiri • Pengembang & Konsultan Properti Terpercaya
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-zinc-500">
                                Kantor Pemasaran: Jl. Surya Sumantri No. 88, Bandung • Telp: (022) 8765-4321 • contact@casanuma.com
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="inline-block bg-slate-900 text-white dark:bg-zinc-800 px-3 py-1 text-xs font-bold uppercase tracking-widest rounded">
                                SURAT PESANAN RUMAH (SPR)
                            </div>
                            <p className="font-mono text-xs font-bold mt-2 text-slate-900 dark:text-white">
                                {booking.spr_number || booking.booking_code}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                                Tanggal: {booking.spr_date || booking.transaction_date}
                            </p>
                        </div>
                    </div>

                    {/* I. DATA KONSUMEN / PEMESAN */}
                    <div className="mb-5">
                        <h4 className="text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-zinc-800/60 px-3 py-1.5 rounded text-slate-800 dark:text-zinc-200 mb-3">
                            I. Data Identitas Pemesan (Konsumen)
                        </h4>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs px-2">
                            <div>
                                <span className="text-slate-500 dark:text-zinc-400 block">Nama Lengkap Sesuai KTP:</span>
                                <span className="font-semibold text-sm text-slate-900 dark:text-white">{booking.lead?.name || '-'}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 dark:text-zinc-400 block">Nomor Induk Kependudukan (NIK):</span>
                                <span className="font-mono font-medium">{booking.lead?.nik || '-'}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 dark:text-zinc-400 block">Nomor Pokok Wajib Pajak (NPWP):</span>
                                <span className="font-mono font-medium">{booking.lead?.npwp || '-'}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 dark:text-zinc-400 block">No. Kartu Keluarga (KK):</span>
                                <span className="font-mono font-medium">{booking.lead?.kk_number || '-'}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 dark:text-zinc-400 block">No. WhatsApp / Telepon:</span>
                                <span className="font-medium">{booking.lead?.whatsapp || '-'}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 dark:text-zinc-400 block">Pekerjaan & Perusahaan:</span>
                                <span className="font-medium">{booking.lead?.job_type || '-'} {booking.lead?.company_name ? `(${booking.lead.company_name})` : ''}</span>
                            </div>
                            <div className="col-span-2">
                                <span className="text-slate-500 dark:text-zinc-400 block">Alamat Domisili KTP:</span>
                                <span className="font-medium">{booking.lead?.address || '-'}</span>
                            </div>
                        </div>
                    </div>

                    {/* II. DATA OBJEK PROPERTI */}
                    <div className="mb-5">
                        <h4 className="text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-zinc-800/60 px-3 py-1.5 rounded text-slate-800 dark:text-zinc-200 mb-3">
                            II. Data Objek Properti Kavling
                        </h4>
                        <div className="grid grid-cols-3 gap-4 text-xs px-2">
                            <div>
                                <span className="text-slate-500 dark:text-zinc-400 block">Proyek Kawasan:</span>
                                <span className="font-bold text-slate-900 dark:text-white">
                                    {booking.unit?.cluster?.project?.name || 'Casanuma Green Living'}
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-500 dark:text-zinc-400 block">Cluster & Blok Unit:</span>
                                <span className="font-bold text-slate-900 dark:text-white">
                                    {booking.unit?.cluster?.name} • Blok {booking.unit?.unit_code}
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-500 dark:text-zinc-400 block">Tipe & Luas:</span>
                                <span className="font-medium">
                                    Tipe {booking.unit?.unit_type?.name || 'Standard'} (LB: {booking.unit?.unit_type?.building_area || 36}m² / LT: {booking.unit?.unit_type?.surface_area || 60}m²)
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* III. RINCIAN HARGA TRANSAKSI */}
                    <div className="mb-5">
                        <h4 className="text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-zinc-800/60 px-3 py-1.5 rounded text-slate-800 dark:text-zinc-200 mb-3">
                            III. Rincian Finansial & Harga Jual Kesepakatan
                        </h4>
                        <div className="border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden text-xs">
                            <table className="w-full">
                                <tbody>
                                    <tr className="border-b border-slate-200 dark:border-zinc-800">
                                        <td className="p-2.5 text-slate-600 dark:text-zinc-400">1. Harga Dasar Kavling (Base Price)</td>
                                        <td className="p-2.5 text-right font-mono font-medium">{formatRp(booking.base_price || booking.unit?.base_price)}</td>
                                    </tr>
                                    <tr className="border-b border-slate-200 dark:border-zinc-800">
                                        <td className="p-2.5 text-slate-600 dark:text-zinc-400">2. Biaya Tambahan Strategis (Hook / Kelebihan Tanah / Fasum)</td>
                                        <td className="p-2.5 text-right font-mono font-medium">{formatRp(booking.additional_price || 0)}</td>
                                    </tr>
                                    <tr className="border-b border-slate-200 dark:border-zinc-800">
                                        <td className="p-2.5 text-slate-600 dark:text-zinc-400">3. Potongan Diskon Promosi Penjualan</td>
                                        <td className="p-2.5 text-right font-mono text-emerald-600 font-medium">- {formatRp(booking.discount_amount || 0)}</td>
                                    </tr>
                                    <tr className="border-b border-slate-200 dark:border-zinc-800">
                                        <td className="p-2.5 text-slate-600 dark:text-zinc-400">4. Estimasi Biaya Legalitas, AJB, BPHTB, & Notaris</td>
                                        <td className="p-2.5 text-right font-mono font-medium">{formatRp(booking.legal_fees || 0)}</td>
                                    </tr>
                                    <tr className="bg-slate-50 dark:bg-zinc-900/60 font-bold border-b-2 border-slate-300 dark:border-zinc-700">
                                        <td className="p-3 text-sm text-slate-900 dark:text-white">TOTAL HARGA TRANSAKSI BERSIH (NET)</td>
                                        <td className="p-3 text-right font-mono text-base text-primary">{formatRp(booking.total_price || booking.unit?.base_price)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* IV. SKEMA & KETENTUAN PEMBAYARAN */}
                    <div className="mb-6">
                        <h4 className="text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-zinc-800/60 px-3 py-1.5 rounded text-slate-800 dark:text-zinc-200 mb-3">
                            IV. Ketentuan & Skema Pembayaran
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs px-2 mb-4">
                            <div className="p-2.5 rounded border border-slate-200 dark:border-zinc-800">
                                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Skema Pembayaran:</span>
                                <span className="font-bold text-slate-900 dark:text-white capitalize">{schemeName(booking.payment_scheme)}</span>
                            </div>
                            <div className="p-2.5 rounded border border-slate-200 dark:border-zinc-800">
                                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Uang Tanda Jadi (UTJ):</span>
                                <span className="font-bold text-emerald-600 font-mono">{formatRp(booking.booking_fee)}</span>
                            </div>
                            <div className="p-2.5 rounded border border-slate-200 dark:border-zinc-800">
                                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Total Uang Muka (DP):</span>
                                <span className="font-bold text-slate-900 dark:text-white font-mono">{formatRp(booking.dp_amount || 0)} ({booking.dp_installments_count || 1}x cicil)</span>
                            </div>
                            <div className="p-2.5 rounded border border-slate-200 dark:border-zinc-800">
                                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Sisa Pelunasan / Plafond:</span>
                                <span className="font-bold text-primary font-mono">{formatRp(booking.remaining_amount || 0)}</span>
                            </div>
                        </div>

                        <div className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed space-y-1 bg-slate-50 dark:bg-zinc-900 p-3 rounded border border-slate-200 dark:border-zinc-800">
                            <p><strong>Ketentuan Kesepakatan:</strong></p>
                            <p>1. Uang Tanda Jadi (Booking Fee) mengunci unit kavling selama maksimal 14 hari kalender untuk pemberkasan dokumen administrasi / pengajuan KPR.</p>
                            <p>2. Pembayaran resmi hanya sah apabila ditransfer langsung ke rekening giro atas nama <strong>PT Casanuma Graha Megah Mandiri</strong>.</p>
                            <p>3. Apabila pengajuan KPR ditolak oleh bank (SLIK tidak lolos), kebijakan pengembalian dana mengikuti SOP pengembang yang berlaku setelah dikurangi biaya administrasi.</p>
                        </div>
                    </div>

                    {/* V. KOLOM TANDA TANGAN */}
                    <div className="pt-4 border-t border-slate-300 dark:border-zinc-800">
                        <div className="grid grid-cols-4 gap-4 text-center text-xs">
                            <div>
                                <p className="text-slate-500 dark:text-zinc-400 mb-16">Pemesan (Konsumen)</p>
                                <p className="font-bold underline text-slate-900 dark:text-white">{booking.lead?.name || 'Konsumen'}</p>
                                <p className="text-[10px] text-slate-500">Tanda Tangan & Materai</p>
                            </div>

                            <div>
                                <p className="text-slate-500 dark:text-zinc-400 mb-16">Sales Executive</p>
                                <p className="font-bold underline text-slate-900 dark:text-white">{booking.sales?.name || 'Sales Marketing'}</p>
                                <p className="text-[10px] text-slate-500">Penasihat Properti</p>
                            </div>

                            <div>
                                <p className="text-slate-500 dark:text-zinc-400 mb-16">Finance & Kasir</p>
                                <p className="font-bold underline text-slate-900 dark:text-white">{booking.approved_by_finance?.name || 'Finance Dept'}</p>
                                <p className="text-[10px] text-slate-500">Verifikasi Pembayaran</p>
                            </div>

                            <div>
                                <p className="text-slate-500 dark:text-zinc-400 mb-16">Sales Manager / Direksi</p>
                                <p className="font-bold underline text-slate-900 dark:text-white">{booking.approved_by_manager?.name || 'Manajemen Pengembang'}</p>
                                <p className="text-[10px] text-slate-500">Persetujuan Transaksi</p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
