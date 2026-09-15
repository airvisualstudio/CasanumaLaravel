import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Receipt, AppSettings } from '@/types';
import {
    ShieldCheck,
    AlertTriangle,
    FileCheck2,
    Calendar,
    User,
    Home,
    Building2,
    ExternalLink,
    Download,
    CheckCircle2,
    Lock
} from 'lucide-react';
import { Button } from '@/Components/ui/button';

interface VerifyProps {
    receipt: Receipt | null;
    is_valid: boolean;
    token: string;
    app_settings?: AppSettings;
}

export default function Verify({ receipt, is_valid, token, app_settings }: VerifyProps) {
    const companyName = app_settings?.company_name || 'PT Casanuma Modern Living';
    const appName = app_settings?.app_name || 'CASANUMA CRM';

    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-muted/50 flex flex-col items-center justify-center p-4 sm:p-6 antialiased selection:bg-primary selection:text-white">
            <Head title={`Verifikasi Dokumen Kwitansi — ${appName}`} />

            <div className="w-full max-w-lg space-y-6">
                {/* Header Branding */}
                <div className="text-center space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-2">
                        <Lock className="size-3.5" />
                        <span>Sistem Verifikasi Dokumen Digital</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-foreground font-heading tracking-tight">
                        {appName}
                    </h1>
                    <p className="text-xs text-muted-foreground">{companyName}</p>
                </div>

                {/* Main Card */}
                <div className="bg-card border border-border/80 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm">
                    {/* Status Banner */}
                    {is_valid && receipt ? (
                        <div className="p-6 bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-transparent border-b border-emerald-500/20 text-center sm:text-left flex flex-col sm:flex-row items-center gap-4">
                            <div className="size-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                                <ShieldCheck className="size-8" />
                            </div>
                            <div className="space-y-0.5 text-center sm:text-left">
                                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                    <CheckCircle2 className="size-3.5" />
                                    <span>Dokumen Resmi Terverifikasi</span>
                                </div>
                                <h2 className="text-lg font-bold text-foreground font-mono">
                                    {receipt.receipt_number || receipt.finance_receipt_number}
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Kwitansi ini sah dan tercatat dalam basis data resmi perusahaan.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 bg-gradient-to-r from-rose-500/15 via-rose-500/10 to-transparent border-b border-rose-500/20 text-center flex flex-col items-center gap-2">
                            <div className="size-12 rounded-2xl bg-destructive text-white flex items-center justify-center shadow-lg shadow-destructive/20">
                                <AlertTriangle className="size-6" />
                            </div>
                            <h2 className="text-base font-bold text-foreground">Dokumen Tidak Valid / Belum Disetujui</h2>
                            <p className="text-xs text-muted-foreground max-w-sm">
                                Token verifikasi <code className="text-destructive font-mono">{token}</code> tidak ditemukan atau status kwitansi belum mendapat approval final dari Manager.
                            </p>
                        </div>
                    )}

                    {/* Content Details */}
                    {is_valid && receipt && (
                        <div className="p-6 space-y-5">
                            {/* Amount Highlight */}
                            <div className="p-4 rounded-xl bg-muted/40 border border-border/70 flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                                        Jenis Pembayaran
                                    </span>
                                    <p className="text-sm font-semibold text-foreground">
                                        {receipt.payment_type_label}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                                        Total Nominal
                                    </span>
                                    <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                                        {receipt.formatted_amount}
                                    </p>
                                </div>
                            </div>

                            {/* Data Points Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div className="space-y-1">
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
                                        <User className="size-3" />
                                        <span>Nama Konsumen</span>
                                    </span>
                                    <p className="font-semibold text-foreground text-sm">
                                        {receipt.lead?.name || receipt.booking?.lead?.name || '-'}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
                                        <Home className="size-3" />
                                        <span>Unit & Booking</span>
                                    </span>
                                    <p className="font-semibold text-foreground">
                                        Unit {receipt.booking?.unit?.unit_code || '-'} ({receipt.booking?.booking_code || '-'})
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
                                        <Calendar className="size-3" />
                                        <span>Tanggal Pembayaran</span>
                                    </span>
                                    <p className="font-medium text-foreground">
                                        {receipt.payment_date}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
                                        <Building2 className="size-3" />
                                        <span>Metode Pembayaran</span>
                                    </span>
                                    <p className="font-medium text-foreground capitalize">
                                        {receipt.payment_method?.replace('_', ' ') || '-'} {receipt.bank_name ? `(${receipt.bank_name})` : ''}
                                    </p>
                                </div>
                            </div>

                            {/* Verifier Information */}
                            <div className="pt-4 border-t border-border/60 grid grid-cols-2 gap-3 text-[11px]">
                                <div className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-0.5">
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Verifikasi Finance</span>
                                    <p className="font-semibold text-foreground">
                                        {receipt.finance_reviewer?.name || '-'}
                                    </p>
                                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                                        Terverifikasi
                                    </p>
                                </div>

                                <div className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-0.5">
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Approval Manager</span>
                                    <p className="font-semibold text-foreground">
                                        {receipt.manager_approver?.name || '-'}
                                    </p>
                                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                                        Disetujui Final
                                    </p>
                                </div>
                            </div>

                            {/* PDF Download Action */}
                            {receipt.pdf_url && (
                                <div className="pt-2">
                                    <a
                                        href={receipt.pdf_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full"
                                    >
                                        <Button className="w-full text-xs gap-2 bg-primary hover:bg-primary/90 h-10 shadow-md">
                                            <Download className="size-4" />
                                            <span>Download Salinan PDF Dokumen Asli</span>
                                        </Button>
                                    </a>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Footer security note */}
                    <div className="p-4 bg-muted/20 border-t border-border/60 text-center text-[11px] text-muted-foreground">
                        <p>
                            Dokumen ini dilindungi tanda tangan digital terenkripsi dan hash QR unik yang dihasilkan secara otomatis oleh sistem {companyName}.
                        </p>
                    </div>
                </div>

                {/* Back to Login link */}
                <div className="text-center">
                    <Link
                        href={route('login')}
                        className="text-xs text-muted-foreground hover:text-foreground font-medium inline-flex items-center gap-1 transition-colors"
                    >
                        <span>Masuk ke Portal CRM</span>
                        <ExternalLink className="size-3" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
