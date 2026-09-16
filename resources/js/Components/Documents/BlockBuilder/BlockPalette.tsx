import React from 'react';
import {
    FileText,
    UserCheck,
    Building2,
    Calculator,
    Calendar,
    ListOrdered,
    AlertCircle,
    Stamp,
    ScrollText,
    Type,
    Plus,
} from 'lucide-react';
import { BlockType, DocumentBlock } from './types';
import { Button } from '@/Components/ui/button';

interface BlockPaletteProps {
    onAddBlock: (block: DocumentBlock) => void;
}

interface PaletteItem {
    type: BlockType;
    label: string;
    description: string;
    icon: React.ElementType;
    color: string;
    createBlock: () => DocumentBlock;
}

export default function BlockPalette({ onAddBlock }: BlockPaletteProps) {
    const paletteItems: PaletteItem[] = [
        {
            type: 'doc_header',
            label: 'Header & No. Surat',
            description: 'Judul dokumen, nomor surat, tanggal & pembuka',
            icon: FileText,
            color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
            createBlock: () => ({
                id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                type: 'doc_header',
                title: 'Header & Nomor Surat',
                data: {
                    title: 'SURAT PESANAN RUMAH',
                    docNumber: '{{nomor_spr}}',
                    docDate: '{{tanggal_transaksi}}',
                    preamble: 'Pada hari ini telah disepakati perjanjian antara Pihak Pertama dan Pihak Kedua dengan ketentuan berikut:',
                },
            }),
        },
        {
            type: 'customer_dossier',
            label: 'Data Konsumen',
            description: 'Kotak 2-kolom info Pemesan (Nama, NIK, Telp, Alamat)',
            icon: UserCheck,
            color: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
            createBlock: () => ({
                id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                type: 'customer_dossier',
                title: 'Data Pemesan (Konsumen)',
                data: {
                    sectionTitle: 'A. DATA PEMESAN (KONSUMEN)',
                    showNik: true,
                    showPhone: true,
                    showAddress: true,
                    showOccupation: false,
                },
            }),
        },
        {
            type: 'unit_spec',
            label: 'Spesifikasi Unit',
            description: 'Tabel kavling, cluster, tipe rumah, LT/LB',
            icon: Building2,
            color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
            createBlock: () => ({
                id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                type: 'unit_spec',
                title: 'Data Unit & Spesifikasi Kavling',
                data: {
                    sectionTitle: 'B. DATA UNIT & SPESIFIKASI KAVLING',
                    showProject: true,
                    showCluster: true,
                    showUnitCode: true,
                    showBuildingType: true,
                    showLandBuildingSize: true,
                    showElectricityWater: true,
                },
            }),
        },
        {
            type: 'cost_summary',
            label: 'Rincian Biaya',
            description: 'Tabel harga kesepakatan, DP, booking, KPR & terbilang',
            icon: Calculator,
            color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
            createBlock: () => ({
                id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                type: 'cost_summary',
                title: 'Rincian Biaya & Pembayaran',
                data: {
                    sectionTitle: 'C. RINCIAN HARGA & PEMBAYARAN',
                    showAgreementPrice: true,
                    showBookingFee: true,
                    showDownPayment: true,
                    showKprLoan: true,
                    showSpelling: true,
                },
            }),
        },
        {
            type: 'payment_schedule',
            label: 'Jadwal Termin',
            description: 'Tabel jadwal angsuran bertahap & tanggal jatuh tempo',
            icon: Calendar,
            color: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
            createBlock: () => ({
                id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                type: 'payment_schedule',
                title: 'Jadwal Angsuran & Termin Pembayaran',
                data: {
                    sectionTitle: 'JADWAL ANGSURAN & TERMIN',
                    items: [
                        { stage: 'Tahap 1 (Booking Fee)', description: 'Tanda jadi pemesanan kavling', dueDate: '{{tanggal_transaksi}}', amount: '{{nominal_booking}}' },
                        { stage: 'Tahap 2 (DP 1)', description: 'Uang muka pertama (14 hari)', dueDate: '14 Hari Kerja', amount: '{{nominal_dp}}' },
                        { stage: 'Tahap 3 (Pelunasan KPR)', description: 'Akad kredit KPR / Pelunasan', dueDate: 'Saat Akad Bank', amount: '{{plafon_kpr}}' },
                    ],
                },
            }),
        },
        {
            type: 'clauses',
            label: 'Klausul & Syarat',
            description: 'Daftar ketentuan hukum bernomor urut rapi',
            icon: ListOrdered,
            color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
            createBlock: () => ({
                id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                type: 'clauses',
                title: 'Ketentuan Khusus Pemesanan',
                data: {
                    sectionTitle: 'KETENTUAN KHUSUS',
                    clauses: [
                        'Tanda Jadi (Booking Fee) bersifat mengikat dan tidak dapat dikembalikan apabila konsumen membatalkan pesanan secara sepihak.',
                        'Konsumen wajib melengkapi seluruh berkas pengajuan KPR selambat-lambatnya 14 (empat belas) hari kalender setelah SPR ditandatangani.',
                        'Apabila plafon KPR disetujui di bawah pengajuan, kekurangan uang muka wajib dilunasi oleh konsumen sesuai musyawarah mufakat.',
                    ],
                },
            }),
        },
        {
            type: 'callout_box',
            label: 'Kotak Catatan Penting',
            description: 'Box berbingkai untuk notice, peringatan, atau info garansi',
            icon: AlertCircle,
            color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
            createBlock: () => ({
                id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                type: 'callout_box',
                title: 'Catatan Penting Legalitas',
                data: {
                    variant: 'warning',
                    title: 'PERHATIAN KONSUMEN',
                    content: 'Pembayaran hanya sah jika ditransfer langsung ke Rekening Resmi Perusahaan PT Casanuma Modern Living dan divalidasi dengan kwitansi ber-barcode/stempel digital.',
                },
            }),
        },
        {
            type: 'signatures_two',
            label: 'TTD 2 Pihak + QR/Materai',
            description: 'Konsumen vs Sales Manager + slot Materai Rp 10.000',
            icon: Stamp,
            color: 'text-primary bg-primary/10 border-primary/20',
            createBlock: () => ({
                id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                type: 'signatures_two',
                title: 'Grid Tanda Tangan 2 Pihak',
                data: {
                    party1Role: 'Pihak Pertama (Konsumen)',
                    party1Name: '{{nama_konsumen}}',
                    party1Subtext: 'NIK: {{nik_konsumen}}',
                    party1Materai: true,
                    party2Role: 'Disetujui Oleh (Sales Manager)',
                    party2Name: '{{nama_manager}}',
                    party2Subtext: '{{nama_perusahaan}}',
                    party2Qr: true,
                },
            }),
        },
        {
            type: 'signatures_three',
            label: 'TTD 3 Pihak (+ Notaris)',
            description: 'Format legal 3 kolom: Konsumen, Developer, Notaris PPAT',
            icon: ScrollText,
            color: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
            createBlock: () => ({
                id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                type: 'signatures_three',
                title: 'Grid Tanda Tangan 3 Pihak',
                data: {
                    party1Role: 'Pihak Pertama (Konsumen)',
                    party1Name: '{{nama_konsumen}}',
                    party1Subtext: 'Konsumen',
                    party2Role: 'Pihak Kedua (Developer)',
                    party2Name: '{{nama_manager}}',
                    party2Subtext: '{{nama_perusahaan}}',
                    party2Qr: true,
                    party3Role: 'Saksi / Notaris PPAT',
                    party3Name: '(....................................)',
                    party3Subtext: 'Pejabat Pembuat Akta Tanah',
                },
            }),
        },
        {
            type: 'custom_text',
            label: 'Teks Paragraf Bebas',
            description: 'Blok narasi bebas untuk pembukaan, penutup, atau pasal khusus',
            icon: Type,
            color: 'text-slate-500 bg-slate-500/10 border-slate-500/20',
            createBlock: () => ({
                id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                type: 'custom_text',
                title: 'Paragraf Teks Tambahan',
                data: {
                    contentHtml: '<p>Demikian surat perjanjian ini dibuat dalam rangkap 2 (dua) bermaterai cukup serta memiliki kekuatan hukum yang sama bagi kedua belah pihak.</p>',
                },
            }),
        },
    ];

    return (
        <div className="space-y-2 p-3">
            <div className="flex items-center justify-between pb-1 border-b border-border">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Palet Blok Legalitas
                </span>
                <span className="text-[10px] text-muted-foreground">Klik untuk pasang</span>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-1">
                {paletteItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.type}
                            type="button"
                            onClick={() => onAddBlock(item.createBlock())}
                            className="w-full text-left p-2.5 rounded-xl border border-border/70 hover:border-primary/50 bg-card hover:bg-muted/40 transition-all group cursor-pointer flex items-start gap-2.5 shadow-2xs hover:shadow-xs"
                        >
                            <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 border ${item.color} group-hover:scale-105 transition-transform`}>
                                <Icon className="size-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                                        {item.label}
                                    </h4>
                                    <Plus className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all" />
                                </div>
                                <p className="text-[10.5px] text-muted-foreground line-clamp-1 leading-tight mt-0.5">
                                    {item.description}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
