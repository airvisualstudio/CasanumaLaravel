import React, { useState } from 'react';
import {
    GripVertical,
    ChevronUp,
    ChevronDown,
    Trash2,
    Copy,
    Settings,
    Edit3,
    Check,
    Plus,
    X,
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
    Sparkles,
} from 'lucide-react';
import { DocumentBlock, PaymentScheduleItem } from './types';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Checkbox } from '@/Components/ui/checkbox';
import { Badge } from '@/Components/ui/badge';

interface BlockCardProps {
    block: DocumentBlock;
    index: number;
    totalBlocks: number;
    availableTokens?: Record<string, { label: string; tokens: any[] }>;
    onUpdate: (updatedBlock: DocumentBlock) => void;
    onDelete: () => void;
    onDuplicate: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onDragStart: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
}

/**
 * Quick Variable Pill Selector for form inputs
 */
function QuickVariableChips({
    onSelectToken,
    presetTokens = [
        '{{nomor_spr}}',
        '{{nama_konsumen}}',
        '{{nik_konsumen}}',
        '{{telepon_konsumen}}',
        '{{alamat_konsumen}}',
        '{{nomor_kavling}}',
        '{{nama_proyek}}',
        '{{tipe_unit}}',
        '{{harga_total}}',
        '{{nominal_booking}}',
        '{{nominal_dp}}',
        '{{plafon_kpr}}',
        '{{tanggal_transaksi}}',
        '{{nama_manager}}',
        '{{nama_perusahaan}}',
    ],
}: {
    onSelectToken: (token: string) => void;
    presetTokens?: string[];
}) {
    return (
        <div className="pt-1.5">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
                <Sparkles className="size-3 text-amber-500" />
                <span>Klik untuk sisipkan variabel cepat:</span>
            </div>
            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
                {presetTokens.map((token) => (
                    <button
                        key={token}
                        type="button"
                        onClick={() => onSelectToken(token)}
                        className="px-1.5 py-0.5 rounded text-[9.5px] font-mono bg-muted/80 hover:bg-primary/10 hover:text-primary border border-border/60 transition-all text-muted-foreground active:scale-95"
                        title={`Sisipkan ${token}`}
                    >
                        + {token}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default function BlockCard({
    block,
    index,
    totalBlocks,
    onUpdate,
    onDelete,
    onDuplicate,
    onMoveUp,
    onMoveDown,
    onDragStart,
    onDragOver,
    onDrop,
}: BlockCardProps) {
    const [isEditing, setIsEditing] = useState(false);

    // Render icon based on block type
    const getBlockIcon = () => {
        switch (block.type) {
            case 'doc_header': return <FileText className="size-3.5 text-blue-500" />;
            case 'customer_dossier': return <UserCheck className="size-3.5 text-sky-500" />;
            case 'unit_spec': return <Building2 className="size-3.5 text-indigo-500" />;
            case 'cost_summary': return <Calculator className="size-3.5 text-emerald-500" />;
            case 'payment_schedule': return <Calendar className="size-3.5 text-teal-500" />;
            case 'clauses': return <ListOrdered className="size-3.5 text-amber-500" />;
            case 'callout_box': return <AlertCircle className="size-3.5 text-orange-500" />;
            case 'signatures_two': return <Stamp className="size-3.5 text-primary" />;
            case 'signatures_three': return <ScrollText className="size-3.5 text-violet-500" />;
            case 'custom_text': return <Type className="size-3.5 text-slate-500" />;
        }
    };

    return (
        <div
            draggable
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            className={`group relative rounded-xl border transition-all ${
                isEditing
                    ? 'border-primary/60 bg-card shadow-md ring-2 ring-primary/20'
                    : 'border-border/80 bg-card/60 hover:bg-card hover:border-border hover:shadow-xs'
            }`}
        >
            {/* 1. Block Control Header Bar */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/60 bg-muted/30 rounded-t-xl select-none">
                <div className="flex items-center gap-2">
                    {/* Drag Handle */}
                    <div
                        className="cursor-grab active:cursor-grabbing p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Tahan & geser untuk atur urutan posisi"
                    >
                        <GripVertical className="size-4" />
                    </div>

                    <div className="flex items-center gap-1.5">
                        <div className="size-5 rounded-md bg-background border border-border flex items-center justify-center">
                            {getBlockIcon()}
                        </div>
                        <span className="text-xs font-semibold text-foreground">
                            {block.title}
                        </span>
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-mono text-muted-foreground">
                            #{index + 1}
                        </Badge>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-6 text-muted-foreground hover:text-foreground"
                        onClick={onMoveUp}
                        disabled={index === 0}
                        title="Pindah ke Atas"
                    >
                        <ChevronUp className="size-3.5" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-6 text-muted-foreground hover:text-foreground"
                        onClick={onMoveDown}
                        disabled={index === totalBlocks - 1}
                        title="Pindah ke Bawah"
                    >
                        <ChevronDown className="size-3.5" />
                    </Button>

                    <div className="h-3 w-px bg-border mx-0.5" />

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={`h-6 px-2 text-[11px] gap-1 rounded-md ${isEditing ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setIsEditing(!isEditing)}
                    >
                        {isEditing ? <Check className="size-3" /> : <Settings className="size-3" />}
                        <span>{isEditing ? 'Selesai' : 'Ubah Data'}</span>
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-6 text-muted-foreground hover:text-foreground"
                        onClick={onDuplicate}
                        title="Duplikat Blok"
                    >
                        <Copy className="size-3" />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-6 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                        onClick={onDelete}
                        title="Hapus Blok"
                    >
                        <Trash2 className="size-3" />
                    </Button>
                </div>
            </div>

            {/* 2. Block Content Render / Edit Form */}
            <div className="p-4">
                {isEditing ? (
                    <BlockSettingsForm block={block} onUpdate={onUpdate} />
                ) : (
                    <BlockVisualPreview block={block} />
                )}
            </div>
        </div>
    );
}

/**
 * Visual Layout Preview of each Block (1:1 Print Look)
 */
function BlockVisualPreview({ block }: { block: DocumentBlock }) {
    switch (block.type) {
        case 'doc_header':
            return (
                <div className="text-center py-1">
                    <h2 className="text-sm font-bold text-foreground tracking-wide uppercase">
                        {block.data.title || 'SURAT PERJANJIAN'}
                    </h2>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                        Nomor: <span className="font-semibold text-foreground">{block.data.docNumber || '{{nomor_surat}}'}</span> &nbsp;|&nbsp; Tanggal: <span className="font-semibold text-foreground">{block.data.docDate || '{{tanggal_transaksi}}'}</span>
                    </p>
                    {block.data.preamble && (
                        <p className="text-[11px] text-muted-foreground text-justify mt-2 leading-relaxed italic">
                            {block.data.preamble}
                        </p>
                    )}
                </div>
            );

        case 'customer_dossier':
            return (
                <div className="border border-border/80 rounded-lg overflow-hidden text-[11px]">
                    <div className="bg-muted/60 px-3 py-1.5 font-bold uppercase tracking-wider text-[10px] text-foreground border-b border-border/80">
                        {block.data.sectionTitle || 'DATA PEMESAN (KONSUMEN)'}
                    </div>
                    <div className="divide-y divide-border/60">
                        <div className="grid grid-cols-3 px-3 py-1.5">
                            <span className="text-muted-foreground">Nama Lengkap</span>
                            <span className="col-span-2 font-semibold text-foreground">{'{{nama_konsumen}}'}</span>
                        </div>
                        {block.data.showNik && (
                            <div className="grid grid-cols-3 px-3 py-1.5">
                                <span className="text-muted-foreground">Nomor KTP / NIK</span>
                                <span className="col-span-2 font-mono text-foreground">{'{{nik_konsumen}}'}</span>
                            </div>
                        )}
                        {block.data.showPhone && (
                            <div className="grid grid-cols-3 px-3 py-1.5">
                                <span className="text-muted-foreground">Telepon / WhatsApp</span>
                                <span className="col-span-2 text-foreground">{'{{telepon_konsumen}}'}</span>
                            </div>
                        )}
                        {block.data.showAddress && (
                            <div className="grid grid-cols-3 px-3 py-1.5">
                                <span className="text-muted-foreground">Alamat Domisili</span>
                                <span className="col-span-2 text-foreground">{'{{alamat_konsumen}}'}</span>
                            </div>
                        )}
                        {block.data.showOccupation && (
                            <div className="grid grid-cols-3 px-3 py-1.5">
                                <span className="text-muted-foreground">Pekerjaan</span>
                                <span className="col-span-2 text-foreground">{'{{pekerjaan_konsumen}}'}</span>
                            </div>
                        )}
                    </div>
                </div>
            );

        case 'unit_spec':
            return (
                <div className="border border-border/80 rounded-lg overflow-hidden text-[11px]">
                    <div className="bg-muted/60 px-3 py-1.5 font-bold uppercase tracking-wider text-[10px] text-foreground border-b border-border/80">
                        {block.data.sectionTitle || 'DATA UNIT & SPESIFIKASI KAVLING'}
                    </div>
                    <div className="divide-y divide-border/60">
                        {block.data.showProject && (
                            <div className="grid grid-cols-3 px-3 py-1.5">
                                <span className="text-muted-foreground">Proyek Perumahan</span>
                                <span className="col-span-2 font-semibold text-foreground">{'{{nama_proyek}}'}</span>
                            </div>
                        )}
                        {block.data.showCluster && (
                            <div className="grid grid-cols-3 px-3 py-1.5">
                                <span className="text-muted-foreground">Cluster</span>
                                <span className="col-span-2 text-foreground">{'{{nama_cluster}}'}</span>
                            </div>
                        )}
                        {block.data.showUnitCode && (
                            <div className="grid grid-cols-3 px-3 py-1.5">
                                <span className="text-muted-foreground">Nomor Kavling</span>
                                <span className="col-span-2 font-bold text-foreground">{'{{nomor_kavling}}'}</span>
                            </div>
                        )}
                        {block.data.showBuildingType && (
                            <div className="grid grid-cols-3 px-3 py-1.5">
                                <span className="text-muted-foreground">Tipe Bangunan</span>
                                <span className="col-span-2 text-foreground">{'{{tipe_unit}}'}</span>
                            </div>
                        )}
                        {block.data.showLandBuildingSize && (
                            <div className="grid grid-cols-3 px-3 py-1.5">
                                <span className="text-muted-foreground">Luas Tanah / Bangunan</span>
                                <span className="col-span-2 text-foreground">LT: {'{{luas_tanah}}'} m² / LB: {'{{luas_bangunan}}'} m²</span>
                            </div>
                        )}
                        {block.data.showElectricityWater && (
                            <div className="grid grid-cols-3 px-3 py-1.5">
                                <span className="text-muted-foreground">Fasilitas</span>
                                <span className="col-span-2 text-foreground">PLN 2.200 VA &amp; Air Bersih PDAM</span>
                            </div>
                        )}
                    </div>
                </div>
            );

        case 'cost_summary':
            return (
                <div className="border border-border/80 rounded-lg overflow-hidden text-[11px]">
                    <div className="bg-muted/60 px-3 py-1.5 font-bold uppercase tracking-wider text-[10px] text-foreground border-b border-border/80">
                        {block.data.sectionTitle || 'RINCIAN HARGA & PEMBAYARAN'}
                    </div>
                    <div className="divide-y divide-border/60">
                        {block.data.showAgreementPrice && (
                            <div className="flex justify-between px-3 py-1.5">
                                <span className="text-muted-foreground">Harga Kesepakatan (Inc. PPN)</span>
                                <span className="font-bold text-foreground">{'{{harga_total}}'}</span>
                            </div>
                        )}
                        {block.data.showBookingFee && (
                            <div className="flex justify-between px-3 py-1.5">
                                <span className="text-muted-foreground">Tanda Jadi (Booking Fee)</span>
                                <span className="text-foreground">{'{{nominal_booking}}'}</span>
                            </div>
                        )}
                        {block.data.showDownPayment && (
                            <div className="flex justify-between px-3 py-1.5">
                                <span className="text-muted-foreground">Uang Muka (Down Payment)</span>
                                <span className="text-foreground">{'{{nominal_dp}}'}</span>
                            </div>
                        )}
                        {block.data.showKprLoan && (
                            <div className="flex justify-between px-3 py-1.5">
                                <span className="text-muted-foreground">Sisa Pelunasan / Plafon KPR</span>
                                <span className="font-bold text-foreground">{'{{plafon_kpr}}'}</span>
                            </div>
                        )}
                        {block.data.showSpelling && (
                            <div className="bg-muted/20 px-3 py-1.5 text-[10px] italic text-muted-foreground">
                                Terbilang: <span className="font-medium text-foreground">{'{{nominal_terbilang}}'}</span>
                            </div>
                        )}
                    </div>
                </div>
            );

        case 'payment_schedule':
            return (
                <div className="border border-border/80 rounded-lg overflow-hidden text-[11px]">
                    <div className="bg-muted/60 px-3 py-1.5 font-bold uppercase tracking-wider text-[10px] text-foreground border-b border-border/80">
                        {block.data.sectionTitle || 'JADWAL ANGSURAN & TERMIN'}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-muted/30 text-[10px] text-muted-foreground border-b border-border/60">
                                <tr>
                                    <th className="py-1 px-2.5">No</th>
                                    <th className="py-1 px-2.5">Tahap</th>
                                    <th className="py-1 px-2.5">Keterangan</th>
                                    <th className="py-1 px-2.5">Jatuh Tempo</th>
                                    <th className="py-1 px-2.5 text-right">Nominal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {block.data.items.map((item, i) => (
                                    <tr key={i}>
                                        <td className="py-1.5 px-2.5 text-center text-muted-foreground">{i + 1}</td>
                                        <td className="py-1.5 px-2.5 font-semibold text-foreground">{item.stage}</td>
                                        <td className="py-1.5 px-2.5 text-muted-foreground">{item.description}</td>
                                        <td className="py-1.5 px-2.5 text-muted-foreground">{item.dueDate}</td>
                                        <td className="py-1.5 px-2.5 text-right font-bold text-foreground">{item.amount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );

        case 'clauses':
            return (
                <div className="text-[11px]">
                    <h4 className="font-bold uppercase tracking-wider text-[10px] text-foreground mb-1.5">
                        {block.data.sectionTitle || 'KETENTUAN KHUSUS'}
                    </h4>
                    <ol className="list-decimal pl-5 space-y-1 text-muted-foreground leading-relaxed">
                        {block.data.clauses.map((clause, idx) => (
                            <li key={idx} className="text-justify">{clause}</li>
                        ))}
                    </ol>
                </div>
            );

        case 'callout_box':
            return (
                <div className={`p-3 rounded-lg border text-[11px] leading-relaxed ${
                    block.data.variant === 'warning'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
                        : block.data.variant === 'info'
                        ? 'bg-sky-500/10 border-sky-500/30 text-sky-700 dark:text-sky-300'
                        : 'bg-muted/40 border-border text-foreground'
                }`}>
                    {block.data.title && (
                        <p className="font-bold uppercase tracking-wider text-[10px] mb-1">
                            {block.data.title}
                        </p>
                    )}
                    <p>{block.data.content}</p>
                </div>
            );

        case 'signatures_two':
            return (
                <div className="grid grid-cols-2 gap-4 text-center text-[11px] pt-2">
                    <div className="border border-dashed border-border/80 rounded-lg p-3 bg-muted/20">
                        <p className="text-muted-foreground mb-2">{block.data.party1Role}</p>
                        {block.data.party1Materai ? (
                            <div className="inline-block border border-dashed border-muted-foreground/40 rounded px-2.5 py-1.5 my-1 text-[9px] text-muted-foreground bg-background">
                                MATERAI Rp 10.000
                            </div>
                        ) : (
                            <div className="h-10" />
                        )}
                        <p className="font-bold underline text-foreground mt-2">{block.data.party1Name}</p>
                        <p className="text-[10px] text-muted-foreground">{block.data.party1Subtext}</p>
                    </div>

                    <div className="border border-dashed border-border/80 rounded-lg p-3 bg-muted/20">
                        <p className="text-muted-foreground mb-2">{block.data.party2Role}</p>
                        {block.data.party2Qr ? (
                            <div className="inline-block border border-border rounded px-2 py-0.5 my-1 text-[9px] font-mono text-primary bg-background">
                                [QR CODE VERIFIED]
                            </div>
                        ) : (
                            <div className="h-10" />
                        )}
                        <p className="font-bold underline text-foreground mt-2">{block.data.party2Name}</p>
                        <p className="text-[10px] text-muted-foreground">{block.data.party2Subtext}</p>
                    </div>
                </div>
            );

        case 'signatures_three':
            return (
                <div className="grid grid-cols-3 gap-2 text-center text-[10.5px] pt-2">
                    <div className="border border-dashed border-border/80 rounded-lg p-2 bg-muted/20">
                        <p className="text-muted-foreground mb-2">{block.data.party1Role}</p>
                        <div className="h-10" />
                        <p className="font-bold underline text-foreground">{block.data.party1Name}</p>
                        <p className="text-[9px] text-muted-foreground">{block.data.party1Subtext}</p>
                    </div>
                    <div className="border border-dashed border-border/80 rounded-lg p-2 bg-muted/20">
                        <p className="text-muted-foreground mb-2">{block.data.party2Role}</p>
                        {block.data.party2Qr ? (
                            <div className="inline-block border border-border rounded px-1.5 py-0.5 my-1 text-[8.5px] font-mono text-primary bg-background">
                                [QR VERIFIED]
                            </div>
                        ) : (
                            <div className="h-10" />
                        )}
                        <p className="font-bold underline text-foreground">{block.data.party2Name}</p>
                        <p className="text-[9px] text-muted-foreground">{block.data.party2Subtext}</p>
                    </div>
                    <div className="border border-dashed border-border/80 rounded-lg p-2 bg-muted/20">
                        <p className="text-muted-foreground mb-2">{block.data.party3Role}</p>
                        <div className="h-10" />
                        <p className="font-bold underline text-foreground">{block.data.party3Name}</p>
                        <p className="text-[9px] text-muted-foreground">{block.data.party3Subtext}</p>
                    </div>
                </div>
            );

        case 'custom_text':
            return (
                <div
                    className="text-[11px] text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: block.data.contentHtml }}
                />
            );
    }
}

/**
 * Settings Editor Form per Block Type
 */
function BlockSettingsForm({
    block,
    onUpdate,
}: {
    block: DocumentBlock;
    onUpdate: (b: DocumentBlock) => void;
}) {
    switch (block.type) {
        case 'doc_header':
            return (
                <div className="space-y-3">
                    <div>
                        <Label className="text-xs">Judul Dokumen</Label>
                        <Input
                            className="h-8 text-xs mt-1"
                            value={block.data.title}
                            onChange={(e) => onUpdate({ ...block, data: { ...block.data, title: e.target.value } })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label className="text-xs">Nomor Surat / Token</Label>
                            <Input
                                className="h-8 text-xs mt-1 font-mono"
                                value={block.data.docNumber}
                                onChange={(e) => onUpdate({ ...block, data: { ...block.data, docNumber: e.target.value } })}
                            />
                        </div>
                        <div>
                            <Label className="text-xs">Tanggal Dokumen</Label>
                            <Input
                                className="h-8 text-xs mt-1 font-mono"
                                value={block.data.docDate}
                                onChange={(e) => onUpdate({ ...block, data: { ...block.data, docDate: e.target.value } })}
                            />
                        </div>
                    </div>
                    <div>
                        <Label className="text-xs">Kalimat Pembuka / Preamble</Label>
                        <Textarea
                            className="text-xs mt-1 min-h-[60px]"
                            value={block.data.preamble}
                            onChange={(e) => onUpdate({ ...block, data: { ...block.data, preamble: e.target.value } })}
                        />
                        <QuickVariableChips
                            onSelectToken={(token) => {
                                const next = block.data.preamble ? `${block.data.preamble} ${token}` : token;
                                onUpdate({ ...block, data: { ...block.data, preamble: next } });
                            }}
                        />
                    </div>
                </div>
            );

        case 'customer_dossier':
            return (
                <div className="space-y-3">
                    <div>
                        <Label className="text-xs">Judul Bagian</Label>
                        <Input
                            className="h-8 text-xs mt-1"
                            value={block.data.sectionTitle}
                            onChange={(e) => onUpdate({ ...block, data: { ...block.data, sectionTitle: e.target.value } })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <Checkbox
                                checked={block.data.showNik}
                                onCheckedChange={(val) => onUpdate({ ...block, data: { ...block.data, showNik: !!val } })}
                            />
                            <span>Tampilkan Baris NIK/KTP</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <Checkbox
                                checked={block.data.showPhone}
                                onCheckedChange={(val) => onUpdate({ ...block, data: { ...block.data, showPhone: !!val } })}
                            />
                            <span>Tampilkan Telepon/WhatsApp</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <Checkbox
                                checked={block.data.showAddress}
                                onCheckedChange={(val) => onUpdate({ ...block, data: { ...block.data, showAddress: !!val } })}
                            />
                            <span>Tampilkan Alamat Domisili</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <Checkbox
                                checked={block.data.showOccupation}
                                onCheckedChange={(val) => onUpdate({ ...block, data: { ...block.data, showOccupation: !!val } })}
                            />
                            <span>Tampilkan Pekerjaan</span>
                        </label>
                    </div>
                </div>
            );

        case 'unit_spec':
            return (
                <div className="space-y-3">
                    <div>
                        <Label className="text-xs">Judul Bagian</Label>
                        <Input
                            className="h-8 text-xs mt-1"
                            value={block.data.sectionTitle}
                            onChange={(e) => onUpdate({ ...block, data: { ...block.data, sectionTitle: e.target.value } })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <Checkbox
                                checked={block.data.showProject}
                                onCheckedChange={(val) => onUpdate({ ...block, data: { ...block.data, showProject: !!val } })}
                            />
                            <span>Nama Proyek Perumahan</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <Checkbox
                                checked={block.data.showCluster}
                                onCheckedChange={(val) => onUpdate({ ...block, data: { ...block.data, showCluster: !!val } })}
                            />
                            <span>Nama Cluster</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <Checkbox
                                checked={block.data.showUnitCode}
                                onCheckedChange={(val) => onUpdate({ ...block, data: { ...block.data, showUnitCode: !!val } })}
                            />
                            <span>Nomor Unit / Kavling</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <Checkbox
                                checked={block.data.showBuildingType}
                                onCheckedChange={(val) => onUpdate({ ...block, data: { ...block.data, showBuildingType: !!val } })}
                            />
                            <span>Tipe Bangunan</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <Checkbox
                                checked={block.data.showLandBuildingSize}
                                onCheckedChange={(val) => onUpdate({ ...block, data: { ...block.data, showLandBuildingSize: !!val } })}
                            />
                            <span>Luas Tanah / Bangunan</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <Checkbox
                                checked={block.data.showElectricityWater}
                                onCheckedChange={(val) => onUpdate({ ...block, data: { ...block.data, showElectricityWater: !!val } })}
                            />
                            <span>Fasilitas Listrik & Air</span>
                        </label>
                    </div>
                </div>
            );

        case 'cost_summary':
            return (
                <div className="space-y-3">
                    <div>
                        <Label className="text-xs">Judul Bagian</Label>
                        <Input
                            className="h-8 text-xs mt-1"
                            value={block.data.sectionTitle}
                            onChange={(e) => onUpdate({ ...block, data: { ...block.data, sectionTitle: e.target.value } })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <Checkbox
                                checked={block.data.showAgreementPrice}
                                onCheckedChange={(val) => onUpdate({ ...block, data: { ...block.data, showAgreementPrice: !!val } })}
                            />
                            <span>Harga Kesepakatan</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <Checkbox
                                checked={block.data.showBookingFee}
                                onCheckedChange={(val) => onUpdate({ ...block, data: { ...block.data, showBookingFee: !!val } })}
                            />
                            <span>Tanda Jadi (Booking Fee)</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <Checkbox
                                checked={block.data.showDownPayment}
                                onCheckedChange={(val) => onUpdate({ ...block, data: { ...block.data, showDownPayment: !!val } })}
                            />
                            <span>Uang Muka (DP)</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <Checkbox
                                checked={block.data.showKprLoan}
                                onCheckedChange={(val) => onUpdate({ ...block, data: { ...block.data, showKprLoan: !!val } })}
                            />
                            <span>Plafon KPR / Pelunasan</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs cursor-pointer col-span-2">
                            <Checkbox
                                checked={block.data.showSpelling}
                                onCheckedChange={(val) => onUpdate({ ...block, data: { ...block.data, showSpelling: !!val } })}
                            />
                            <span>Baris Nominal Terbilang (Italic)</span>
                        </label>
                    </div>
                </div>
            );

        case 'payment_schedule':
            return (
                <div className="space-y-3">
                    <div>
                        <Label className="text-xs">Judul Bagian</Label>
                        <Input
                            className="h-8 text-xs mt-1"
                            value={block.data.sectionTitle}
                            onChange={(e) => onUpdate({ ...block, data: { ...block.data, sectionTitle: e.target.value } })}
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold">Daftar Termin Angsuran</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-6 text-[10px] gap-1 rounded-md"
                                onClick={() => {
                                    const newItems = [
                                        ...block.data.items,
                                        { stage: `Tahap ${block.data.items.length + 1}`, description: 'Pembayaran lanjutan', dueDate: '30 Hari', amount: 'Rp 0' },
                                    ];
                                    onUpdate({ ...block, data: { ...block.data, items: newItems } });
                                }}
                            >
                                <Plus className="size-3" />
                                <span>Tambah Tahap</span>
                            </Button>
                        </div>
                        {block.data.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 p-2 bg-muted/40 rounded-lg border border-border/70">
                                <Input
                                    className="h-7 text-xs w-28 shrink-0"
                                    value={item.stage}
                                    onChange={(e) => {
                                        const newItems = [...block.data.items];
                                        newItems[idx].stage = e.target.value;
                                        onUpdate({ ...block, data: { ...block.data, items: newItems } });
                                    }}
                                />
                                <Input
                                    className="h-7 text-xs flex-1"
                                    value={item.description}
                                    onChange={(e) => {
                                        const newItems = [...block.data.items];
                                        newItems[idx].description = e.target.value;
                                        onUpdate({ ...block, data: { ...block.data, items: newItems } });
                                    }}
                                />
                                <Input
                                    className="h-7 text-xs w-24 shrink-0"
                                    value={item.dueDate}
                                    onChange={(e) => {
                                        const newItems = [...block.data.items];
                                        newItems[idx].dueDate = e.target.value;
                                        onUpdate({ ...block, data: { ...block.data, items: newItems } });
                                    }}
                                />
                                <Input
                                    className="h-7 text-xs w-28 shrink-0 font-semibold text-right"
                                    value={item.amount}
                                    onChange={(e) => {
                                        const newItems = [...block.data.items];
                                        newItems[idx].amount = e.target.value;
                                        onUpdate({ ...block, data: { ...block.data, items: newItems } });
                                    }}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-7 text-destructive hover:bg-destructive/10 shrink-0"
                                    onClick={() => {
                                        const newItems = block.data.items.filter((_, i) => i !== idx);
                                        onUpdate({ ...block, data: { ...block.data, items: newItems } });
                                    }}
                                >
                                    <X className="size-3.5" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'clauses':
            return (
                <div className="space-y-3">
                    <div>
                        <Label className="text-xs">Judul Bagian</Label>
                        <Input
                            className="h-8 text-xs mt-1"
                            value={block.data.sectionTitle}
                            onChange={(e) => onUpdate({ ...block, data: { ...block.data, sectionTitle: e.target.value } })}
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold">Poin Klausul Ketentuan</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-6 text-[10px] gap-1 rounded-md"
                                onClick={() => {
                                    const newClauses = [...block.data.clauses, 'Poin ketentuan baru yang disepakati bersama.'];
                                    onUpdate({ ...block, data: { ...block.data, clauses: newClauses } });
                                }}
                            >
                                <Plus className="size-3" />
                                <span>Tambah Poin</span>
                            </Button>
                        </div>
                        {block.data.clauses.map((clause, idx) => (
                            <div key={idx} className="flex items-start gap-1.5">
                                <span className="text-xs font-bold text-muted-foreground pt-1.5 w-5 text-right">{idx + 1}.</span>
                                <Textarea
                                    className="text-xs min-h-[45px] flex-1"
                                    value={clause}
                                    onChange={(e) => {
                                        const newClauses = [...block.data.clauses];
                                        newClauses[idx] = e.target.value;
                                        onUpdate({ ...block, data: { ...block.data, clauses: newClauses } });
                                    }}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-7 text-destructive hover:bg-destructive/10 shrink-0 mt-1"
                                    onClick={() => {
                                        const newClauses = block.data.clauses.filter((_, i) => i !== idx);
                                        onUpdate({ ...block, data: { ...block.data, clauses: newClauses } });
                                    }}
                                >
                                    <X className="size-3.5" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'callout_box':
            return (
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label className="text-xs">Judul Box Notice</Label>
                            <Input
                                className="h-8 text-xs mt-1 uppercase"
                                value={block.data.title}
                                onChange={(e) => onUpdate({ ...block, data: { ...block.data, title: e.target.value } })}
                            />
                        </div>
                        <div>
                            <Label className="text-xs">Varian Warna</Label>
                            <select
                                className="h-8 text-xs mt-1 w-full rounded-md border border-input bg-background px-3"
                                value={block.data.variant}
                                onChange={(e: any) => onUpdate({ ...block, data: { ...block.data, variant: e.target.value } })}
                            >
                                <option value="warning">Kuning / Perhatian (Warning)</option>
                                <option value="info">Biru / Informasi (Info)</option>
                                <option value="neutral">Netral / Abu-abu</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <Label className="text-xs">Isi Pesan Catatan</Label>
                        <Textarea
                            className="text-xs mt-1 min-h-[60px]"
                            value={block.data.content}
                            onChange={(e) => onUpdate({ ...block, data: { ...block.data, content: e.target.value } })}
                        />
                    </div>
                </div>
            );

        case 'signatures_two':
            return (
                <div className="space-y-3">
                    <div className="p-2.5 rounded-lg border border-border bg-muted/20 space-y-2">
                        <Label className="text-xs font-semibold text-foreground">Kolom Kiri (Pihak 1)</Label>
                        <Input
                            className="h-7 text-xs"
                            placeholder="Role (e.g. Pihak Pertama (Konsumen))"
                            value={block.data.party1Role}
                            onChange={(e) => onUpdate({ ...block, data: { ...block.data, party1Role: e.target.value } })}
                        />
                        <Input
                            className="h-7 text-xs font-bold"
                            placeholder="Nama Terang / Token (e.g. {{nama_konsumen}})"
                            value={block.data.party1Name}
                            onChange={(e) => onUpdate({ ...block, data: { ...block.data, party1Name: e.target.value } })}
                        />
                        <Input
                            className="h-7 text-xs"
                            placeholder="Subtext (e.g. NIK: {{nik_konsumen}})"
                            value={block.data.party1Subtext}
                            onChange={(e) => onUpdate({ ...block, data: { ...block.data, party1Subtext: e.target.value } })}
                        />
                        <label className="flex items-center gap-2 text-xs pt-1 cursor-pointer">
                            <Checkbox
                                checked={block.data.party1Materai}
                                onCheckedChange={(val) => onUpdate({ ...block, data: { ...block.data, party1Materai: !!val } })}
                            />
                            <span>Pasang Kotak Materai Rp 10.000</span>
                        </label>
                    </div>

                    <div className="p-2.5 rounded-lg border border-border bg-muted/20 space-y-2">
                        <Label className="text-xs font-semibold text-foreground">Kolom Kanan (Pihak 2)</Label>
                        <Input
                            className="h-7 text-xs"
                            placeholder="Role (e.g. Disetujui Oleh (Sales Manager))"
                            value={block.data.party2Role}
                            onChange={(e) => onUpdate({ ...block, data: { ...block.data, party2Role: e.target.value } })}
                        />
                        <Input
                            className="h-7 text-xs font-bold"
                            placeholder="Nama Terang / Token (e.g. {{nama_manager}})"
                            value={block.data.party2Name}
                            onChange={(e) => onUpdate({ ...block, data: { ...block.data, party2Name: e.target.value } })}
                        />
                        <Input
                            className="h-7 text-xs"
                            placeholder="Subtext (e.g. {{nama_perusahaan}})"
                            value={block.data.party2Subtext}
                            onChange={(e) => onUpdate({ ...block, data: { ...block.data, party2Subtext: e.target.value } })}
                        />
                        <label className="flex items-center gap-2 text-xs pt-1 cursor-pointer">
                            <Checkbox
                                checked={block.data.party2Qr}
                                onCheckedChange={(val) => onUpdate({ ...block, data: { ...block.data, party2Qr: !!val } })}
                            />
                            <span>Pasang QR Code Verifikasi Manajer</span>
                        </label>
                    </div>
                </div>
            );

        case 'signatures_three':
            return (
                <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                        <div className="p-2 rounded-lg border border-border bg-muted/20 space-y-1.5">
                            <Label className="text-[11px] font-semibold">Pihak 1</Label>
                            <Input className="h-7 text-xs" value={block.data.party1Role} onChange={(e) => onUpdate({ ...block, data: { ...block.data, party1Role: e.target.value } })} />
                            <Input className="h-7 text-xs font-bold" value={block.data.party1Name} onChange={(e) => onUpdate({ ...block, data: { ...block.data, party1Name: e.target.value } })} />
                            <Input className="h-7 text-xs" value={block.data.party1Subtext} onChange={(e) => onUpdate({ ...block, data: { ...block.data, party1Subtext: e.target.value } })} />
                        </div>
                        <div className="p-2 rounded-lg border border-border bg-muted/20 space-y-1.5">
                            <Label className="text-[11px] font-semibold">Pihak 2</Label>
                            <Input className="h-7 text-xs" value={block.data.party2Role} onChange={(e) => onUpdate({ ...block, data: { ...block.data, party2Role: e.target.value } })} />
                            <Input className="h-7 text-xs font-bold" value={block.data.party2Name} onChange={(e) => onUpdate({ ...block, data: { ...block.data, party2Name: e.target.value } })} />
                            <Input className="h-7 text-xs" value={block.data.party2Subtext} onChange={(e) => onUpdate({ ...block, data: { ...block.data, party2Subtext: e.target.value } })} />
                            <label className="flex items-center gap-1.5 text-[10.5px] pt-1 cursor-pointer">
                                <Checkbox checked={block.data.party2Qr} onCheckedChange={(val) => onUpdate({ ...block, data: { ...block.data, party2Qr: !!val } })} />
                                <span>QR Code</span>
                            </label>
                        </div>
                        <div className="p-2 rounded-lg border border-border bg-muted/20 space-y-1.5">
                            <Label className="text-[11px] font-semibold">Pihak 3 (Saksi)</Label>
                            <Input className="h-7 text-xs" value={block.data.party3Role} onChange={(e) => onUpdate({ ...block, data: { ...block.data, party3Role: e.target.value } })} />
                            <Input className="h-7 text-xs font-bold" value={block.data.party3Name} onChange={(e) => onUpdate({ ...block, data: { ...block.data, party3Name: e.target.value } })} />
                            <Input className="h-7 text-xs" value={block.data.party3Subtext} onChange={(e) => onUpdate({ ...block, data: { ...block.data, party3Subtext: e.target.value } })} />
                        </div>
                    </div>
                </div>
            );

        case 'custom_text':
            return (
                <div>
                    <Label className="text-xs">HTML / Narasi Teks</Label>
                    <Textarea
                        className="text-xs mt-1 min-h-[90px] font-mono"
                        value={block.data.contentHtml}
                        onChange={(e) => onUpdate({ ...block, data: { ...block.data, contentHtml: e.target.value } })}
                    />
                    <QuickVariableChips
                        onSelectToken={(token) => {
                            const next = block.data.contentHtml ? `${block.data.contentHtml} ${token}` : token;
                            onUpdate({ ...block, data: { ...block.data, contentHtml: next } });
                        }}
                    />
                </div>
            );
    }
}
