import React, { useState } from 'react';
import {
    Plus,
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
} from 'lucide-react';
import { DocumentBlock, BlockType } from './types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';

interface QuickInsertDividerProps {
    atIndex: number;
    onInsert: (block: DocumentBlock, index: number) => void;
}

export default function QuickInsertDivider({
    atIndex,
    onInsert,
}: QuickInsertDividerProps) {
    const [isOpen, setIsOpen] = useState(false);

    const createBlock = (type: BlockType): DocumentBlock => {
        const id = `block-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        switch (type) {
            case 'doc_header':
                return {
                    id,
                    type: 'doc_header',
                    title: 'Header & Nomor Surat',
                    data: {
                        title: 'SURAT PESANAN RUMAH',
                        docNumber: '{{nomor_spr}}',
                        docDate: '{{tanggal_transaksi}}',
                        preamble: 'Pada hari ini telah disepakati perjanjian pemesanan unit dengan ketentuan:',
                    },
                };
            case 'customer_dossier':
                return {
                    id,
                    type: 'customer_dossier',
                    title: 'Data Pemesan (Konsumen)',
                    data: {
                        sectionTitle: 'A. DATA PEMESAN (KONSUMEN)',
                        showNik: true,
                        showPhone: true,
                        showAddress: true,
                        showOccupation: false,
                    },
                };
            case 'unit_spec':
                return {
                    id,
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
                };
            case 'cost_summary':
                return {
                    id,
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
                };
            case 'payment_schedule':
                return {
                    id,
                    type: 'payment_schedule',
                    title: 'Jadwal Angsuran & Termin',
                    data: {
                        sectionTitle: 'JADWAL ANGSURAN & TERMIN',
                        items: [
                            { stage: 'Tahap 1 (Booking Fee)', description: 'Tanda jadi pemesanan kavling', dueDate: '{{tanggal_transaksi}}', amount: '{{nominal_booking}}' },
                            { stage: 'Tahap 2 (DP 1)', description: 'Uang muka pertama', dueDate: '14 Hari Kerja', amount: '{{nominal_dp}}' },
                            { stage: 'Tahap 3 (Pelunasan KPR)', description: 'Akad kredit KPR / Pelunasan', dueDate: 'Saat Akad Bank', amount: '{{plafon_kpr}}' },
                        ],
                    },
                };
            case 'clauses':
                return {
                    id,
                    type: 'clauses',
                    title: 'Ketentuan Khusus Pemesanan',
                    data: {
                        sectionTitle: 'KETENTUAN KHUSUS',
                        clauses: [
                            'Uang Tanda Jadi (Booking Fee) mengikat pemesanan unit kavling dan tidak dapat ditarik kembali.',
                            'Berkas KPR wajib dilengkapi selambat-lambatnya 14 (empat belas) hari kerja.',
                            'Kekurangan uang muka akibat penurunan plafon KPR disepakati dilunasi oleh pemesan.',
                        ],
                    },
                };
            case 'callout_box':
                return {
                    id,
                    type: 'callout_box',
                    title: 'Kotak Catatan Penting',
                    data: {
                        variant: 'warning',
                        title: 'CATATAN PENTING',
                        content: 'Pembayaran hanya sah jika ditransfer ke rekening resmi developer PT Casanuma Modern Living.',
                    },
                };
            case 'signatures_two':
                return {
                    id,
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
                };
            case 'signatures_three':
                return {
                    id,
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
                };
            case 'custom_text':
                return {
                    id,
                    type: 'custom_text',
                    title: 'Teks Paragraf Tambahan',
                    data: {
                        contentHtml: '<p>Demikian surat perjanjian ini dibuat dalam rangkap 2 (dua) serta memiliki kekuatan hukum yang sama bagi kedua belah pihak.</p>',
                    },
                };
        }
    };

    const handleSelect = (type: BlockType) => {
        onInsert(createBlock(type), atIndex);
        setIsOpen(false);
    };

    return (
        <div className="relative group/divider py-1 -my-1.5 flex items-center justify-center z-10">
            {/* Hover Line */}
            <div className="absolute inset-x-4 h-px bg-transparent group-hover/divider:bg-primary/40 transition-colors pointer-events-none" />

            {/* "+" Button */}
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        className={`size-6 rounded-full border flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                            isOpen
                                ? 'opacity-100 bg-primary text-primary-foreground border-primary scale-110'
                                : 'opacity-0 group-hover/divider:opacity-100 bg-background text-muted-foreground hover:text-primary hover:border-primary border-border/80 hover:scale-110'
                        }`}
                        title="Sisipkan blok di posisi ini"
                    >
                        <Plus className="size-3.5" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-56 rounded-xl border-border shadow-xl">
                    <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Sisipkan Blok Di Sini (#{atIndex + 1})
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleSelect('doc_header')} className="text-xs gap-2 py-1.5 cursor-pointer">
                        <FileText className="size-3.5 text-blue-500" />
                        <span>Header & No. Surat</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSelect('customer_dossier')} className="text-xs gap-2 py-1.5 cursor-pointer">
                        <UserCheck className="size-3.5 text-sky-500" />
                        <span>Data Konsumen</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSelect('unit_spec')} className="text-xs gap-2 py-1.5 cursor-pointer">
                        <Building2 className="size-3.5 text-indigo-500" />
                        <span>Spesifikasi Unit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSelect('cost_summary')} className="text-xs gap-2 py-1.5 cursor-pointer">
                        <Calculator className="size-3.5 text-emerald-500" />
                        <span>Rincian Biaya</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSelect('payment_schedule')} className="text-xs gap-2 py-1.5 cursor-pointer">
                        <Calendar className="size-3.5 text-teal-500" />
                        <span>Jadwal Termin</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSelect('clauses')} className="text-xs gap-2 py-1.5 cursor-pointer">
                        <ListOrdered className="size-3.5 text-amber-500" />
                        <span>Klausul Ketentuan</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSelect('callout_box')} className="text-xs gap-2 py-1.5 cursor-pointer">
                        <AlertCircle className="size-3.5 text-orange-500" />
                        <span>Kotak Catatan</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSelect('signatures_two')} className="text-xs gap-2 py-1.5 cursor-pointer">
                        <Stamp className="size-3.5 text-primary" />
                        <span>TTD 2 Pihak + QR</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSelect('signatures_three')} className="text-xs gap-2 py-1.5 cursor-pointer">
                        <ScrollText className="size-3.5 text-violet-500" />
                        <span>TTD 3 Pihak (Notaris)</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSelect('custom_text')} className="text-xs gap-2 py-1.5 cursor-pointer">
                        <Type className="size-3.5 text-slate-500" />
                        <span>Teks Bebas Tambahan</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
