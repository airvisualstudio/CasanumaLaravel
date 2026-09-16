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
    Columns,
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
            case 'column_container':
                return {
                    id,
                    type: 'column_container',
                    title: 'Container Kolom (Split 50:50)',
                    data: {
                        columnCount: 2,
                        gapPx: 12,
                        columns: [
                            {
                                id: `col-1-${Date.now()}`,
                                widthPercent: 50,
                                align: 'left',
                                content: {
                                    type: 'callout',
                                    calloutVariant: 'neutral',
                                    calloutTitle: 'CATATAN',
                                    calloutText: 'Catatan penting atau klausul dokumen.',
                                },
                            },
                            {
                                id: `col-2-${Date.now()}`,
                                widthPercent: 50,
                                align: 'center',
                                content: {
                                    type: 'signature',
                                    signRole: 'Pihak Pertama',
                                    signName: '{{nama_konsumen}}',
                                    signSubtext: 'Konsumen',
                                    signHasQr: false,
                                    signHasMaterai: true,
                                },
                            },
                        ],
                    },
                };
            case 'custom_kop':
                return {
                    id,
                    type: 'custom_kop',
                    title: 'Kop Surat Perusahaan',
                    data: {
                        layoutMode: '2_col',
                        showBottomDivider: true,
                        bottomDivider: {
                            id: 'div-bot',
                            type: 'divider',
                            style: 'double',
                            thicknessPx: 2,
                            colorHex: '#0f172a',
                            marginTopPx: 6,
                            marginBottomPx: 12,
                        },
                        columns: [
                            {
                                id: 'col-1',
                                widthPercent: 20,
                                align: 'center',
                                elements: [
                                    {
                                        id: 'el-logo',
                                        type: 'logo',
                                        url: '',
                                        widthPx: 80,
                                        maxHeightPx: 60,
                                        align: 'center',
                                    },
                                ],
                            },
                            {
                                id: 'col-2',
                                widthPercent: 80,
                                align: 'center',
                                elements: [
                                    {
                                        id: 'el-t1',
                                        type: 'text',
                                        content: 'PT CASANUMA MODERN LIVING',
                                        fontSizePt: 13,
                                        fontWeight: '800',
                                        colorHex: '#0f172a',
                                        isUppercase: true,
                                        align: 'center',
                                    },
                                    {
                                        id: 'el-t2',
                                        type: 'text',
                                        content: 'PENGEMBANG PERUMAHAN & PROPERTY RESIDENTIAL TERPADU',
                                        fontSizePt: 8.5,
                                        fontWeight: 'bold',
                                        colorHex: '#334155',
                                        isUppercase: true,
                                        align: 'center',
                                    },
                                    {
                                        id: 'el-t3',
                                        type: 'text',
                                        content: 'Jl. Boulevard Utama No. 88, Bandung • Telp: (022) 8765-4321 • Email: info@casanuma.com',
                                        fontSizePt: 7.5,
                                        fontWeight: 'normal',
                                        colorHex: '#64748b',
                                        isUppercase: false,
                                        align: 'center',
                                    },
                                ],
                            },
                        ],
                    },
                };
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
            case 'dynamic_table':
                return {
                    id,
                    type: 'dynamic_table',
                    title: 'Tabel Kustom Dinamis',
                    data: {
                        sectionTitle: 'TABEL RINCIAN BIAYA',
                        headers: ['Keterangan', 'Rincian', 'Nominal (Rp)'],
                        showBorder: true,
                        isStriped: true,
                        rows: [
                            {
                                id: 'r-1',
                                cells: [
                                    { id: 'c-1-1', text: 'Nama Konsumen' },
                                    { id: 'c-1-2', text: '{{nama_konsumen}}' },
                                    { id: 'c-1-3', text: '-' },
                                ],
                            },
                            {
                                id: 'r-2',
                                isRepeatable: true,
                                cells: [
                                    { id: 'c-2-1', text: 'Tanda Jadi (Booking)' },
                                    { id: 'c-2-2', text: 'Pembayaran Sah' },
                                    { id: 'c-2-3', text: '{{booking_fee}}' },
                                ],
                            },
                        ],
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
                    <DropdownMenuItem onClick={() => handleSelect('column_container')} className="text-xs gap-2 py-1.5 cursor-pointer">
                        <Columns className="size-3.5 text-indigo-600" />
                        <span>Container Multi-Kolom</span>
                    </DropdownMenuItem>
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
                    <DropdownMenuItem onClick={() => handleSelect('dynamic_table')} className="text-xs gap-2 py-1.5 cursor-pointer">
                        <Calculator className="size-3.5 text-emerald-500" />
                        <span>Tabel Dinamis / Looping</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSelect('cost_summary')} className="text-xs gap-2 py-1.5 cursor-pointer">
                        <Calculator className="size-3.5 text-emerald-500" />
                        <span>Rincian Biaya Standar</span>
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
