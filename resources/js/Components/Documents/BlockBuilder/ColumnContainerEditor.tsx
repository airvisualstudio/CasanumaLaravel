import React, { useState } from 'react';
import {
    ColumnContainerBlock,
    ContainerColumn,
    ContainerColumnContentType,
} from './types';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Checkbox } from '@/Components/ui/checkbox';
import { Badge } from '@/Components/ui/badge';
import AtomicVariablePill from './AtomicVariablePill';
import {
    Columns,
    Type,
    AlertCircle,
    Stamp,
    Table as TableIcon,
    FileText,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Sliders,
    Plus,
    Trash2,
    Sparkles,
} from 'lucide-react';

interface ColumnContainerEditorProps {
    block: ColumnContainerBlock;
    onUpdate: (updatedBlock: ColumnContainerBlock) => void;
}

const TWO_COL_PRESETS = [
    { label: '50 : 50', col1: 50, col2: 50 },
    { label: '40 : 60', col1: 40, col2: 60 },
    { label: '60 : 40', col1: 60, col2: 40 },
    { label: '30 : 70', col1: 30, col2: 70 },
    { label: '70 : 30', col1: 70, col2: 30 },
];

const THREE_COL_PRESETS = [
    { label: '33 : 34 : 33', col1: 33, col2: 34, col3: 33 },
    { label: '25 : 50 : 25', col1: 25, col2: 50, col3: 25 },
    { label: '20 : 60 : 20', col1: 20, col2: 60, col3: 20 },
];

export default function ColumnContainerEditor({
    block,
    onUpdate,
}: ColumnContainerEditorProps) {
    const { columnCount, columns, gapPx = 12 } = block.data;
    const [activeColIndex, setActiveColIndex] = useState(0);

    const safeActiveIndex = Math.min(activeColIndex, Math.max(0, columns.length - 1));
    const activeCol = columns[safeActiveIndex];

    const updateColumns = (newCols: ContainerColumn[]) => {
        onUpdate({
            ...block,
            data: {
                ...block.data,
                columns: newCols,
            },
        });
    };

    const updateActiveCol = (patch: Partial<ContainerColumn>) => {
        const nextCols = [...columns];
        nextCols[safeActiveIndex] = { ...nextCols[safeActiveIndex], ...patch };
        updateColumns(nextCols);
    };

    // Switch between 2 and 3 columns
    const handleColumnCountChange = (count: 2 | 3) => {
        if (count === columnCount) return;

        let newCols: ContainerColumn[] = [];
        if (count === 2) {
            newCols = [
                columns[0] || {
                    id: `col-1-${Date.now()}`,
                    widthPercent: 50,
                    align: 'left',
                    content: {
                        type: 'text',
                        textHtml: '<p>Konten sisi kiri...</p>',
                    },
                },
                columns[1] || {
                    id: `col-2-${Date.now()}`,
                    widthPercent: 50,
                    align: 'left',
                    content: {
                        type: 'signature',
                        signRole: 'Pihak Kedua',
                        signName: '{{nama_konsumen}}',
                        signSubtext: 'Konsumen',
                        signHasQr: false,
                        signHasMaterai: true,
                    },
                },
            ];
            newCols[0].widthPercent = 50;
            newCols[1].widthPercent = 50;
        } else {
            newCols = [
                columns[0] || {
                    id: `col-1-${Date.now()}`,
                    widthPercent: 33,
                    align: 'left',
                    content: { type: 'text', textHtml: '<p>Kolom 1</p>' },
                },
                columns[1] || {
                    id: `col-2-${Date.now()}`,
                    widthPercent: 34,
                    align: 'left',
                    content: { type: 'text', textHtml: '<p>Kolom 2</p>' },
                },
                {
                    id: `col-3-${Date.now()}`,
                    widthPercent: 33,
                    align: 'left',
                    content: {
                        type: 'signature',
                        signRole: 'Mengetahui',
                        signName: '{{nama_manager}}',
                        signSubtext: 'Sales Manager',
                        signHasQr: true,
                    },
                },
            ];
            newCols[0].widthPercent = 33;
            newCols[1].widthPercent = 34;
            newCols[2].widthPercent = 33;
        }

        onUpdate({
            ...block,
            data: {
                ...block.data,
                columnCount: count,
                columns: newCols,
            },
        });
        setActiveColIndex(0);
    };

    // Quick Ratio Apply
    const applyTwoColPreset = (col1: number, col2: number) => {
        if (columns.length < 2) return;
        const nextCols = [...columns];
        nextCols[0] = { ...nextCols[0], widthPercent: col1 };
        nextCols[1] = { ...nextCols[1], widthPercent: col2 };
        updateColumns(nextCols);
    };

    const applyThreeColPreset = (col1: number, col2: number, col3: number) => {
        if (columns.length < 3) return;
        const nextCols = [...columns];
        nextCols[0] = { ...nextCols[0], widthPercent: col1 };
        nextCols[1] = { ...nextCols[1], widthPercent: col2 };
        nextCols[2] = { ...nextCols[2], widthPercent: col3 };
        updateColumns(nextCols);
    };

    // Change Content Type for Active Column
    const handleContentTypeChange = (type: ContainerColumnContentType) => {
        if (!activeCol) return;

        let newContent = { ...activeCol.content, type };
        if (type === 'text' && !newContent.textHtml) {
            newContent.textHtml = '<p>Paragraf teks kolom atau catatan klausul...</p>';
        } else if (type === 'callout' && !newContent.calloutText) {
            newContent.calloutVariant = 'neutral';
            newContent.calloutTitle = 'CATATAN PENTING';
            newContent.calloutText = 'Segala kewajiban administrasi wajib diselesaikan sebelum jatuh tempo.';
        } else if (type === 'dossier' && (!newContent.dossierItems || newContent.dossierItems.length === 0)) {
            newContent.dossierTitle = 'INFORMASI TAMBAHAN';
            newContent.dossierItems = [
                { label: 'Status Legalitas', value: 'SHM Bersertifikat' },
                { label: 'Rekening Pembayaran', value: 'BCA 8890-1234-56' },
            ];
        } else if (type === 'signature' && !newContent.signName) {
            newContent.signRole = 'Pihak Berwenang';
            newContent.signName = '{{nama_konsumen}}';
            newContent.signSubtext = 'Pembeli / Pemesan';
            newContent.signHasQr = false;
            newContent.signHasMaterai = true;
        } else if (type === 'table' && !newContent.tableHeaders) {
            newContent.tableHeaders = ['Item', 'Status', 'Nominal'];
            newContent.tableRows = [
                ['Biaya Notaris PPAT', 'Termasuk', 'Rp 0'],
                ['BPHTB / Pajak Pembeli', 'Ditanggung Pembeli', 'Rp 0'],
            ];
        }

        updateActiveCol({ content: newContent });
    };

    return (
        <div className="space-y-4">
            {/* 1. Layout Mode & Ratio Controls */}
            <div className="p-3 rounded-lg border border-border/80 bg-muted/20 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Columns className="size-3.5 text-primary" />
                        <span>Jumlah Kolom Container</span>
                    </Label>
                    <div className="flex items-center gap-1">
                        <Button
                            type="button"
                            variant={columnCount === 2 ? 'default' : 'outline'}
                            size="sm"
                            className="h-7 text-xs px-3"
                            onClick={() => handleColumnCountChange(2)}
                        >
                            2 Kolom (Split)
                        </Button>
                        <Button
                            type="button"
                            variant={columnCount === 3 ? 'default' : 'outline'}
                            size="sm"
                            className="h-7 text-xs px-3"
                            onClick={() => handleColumnCountChange(3)}
                        >
                            3 Kolom
                        </Button>
                    </div>
                </div>

                {/* Ratio Presets */}
                <div className="pt-2 border-t border-border/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground flex items-center gap-1">
                            <Sliders className="size-3 text-muted-foreground" />
                            <span>Rasio Lebar Kolom</span>
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <span>Jarak Antar Kolom (Gap):</span>
                            <Input
                                type="number"
                                min={4}
                                max={32}
                                className="h-6 w-12 text-xs px-1 text-center"
                                value={gapPx}
                                onChange={(e) =>
                                    onUpdate({
                                        ...block,
                                        data: { ...block.data, gapPx: Number(e.target.value) || 12 },
                                    })
                                }
                            />
                            <span>px</span>
                        </div>
                    </div>

                    {/* Visual Proportion Bar */}
                    <div className="flex h-3 w-full rounded-md overflow-hidden border border-border/80 bg-muted/50">
                        {columns.map((col, idx) => (
                            <div
                                key={col.id}
                                style={{ width: `${col.widthPercent}%` }}
                                className={`h-full transition-all flex items-center justify-center text-[8px] font-bold ${
                                    idx === 0
                                        ? 'bg-blue-500/30 text-blue-800 dark:text-blue-200'
                                        : idx === 1
                                        ? 'bg-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                                        : 'bg-amber-500/30 text-amber-800 dark:text-amber-200'
                                }`}
                                title={`Kolom ${idx + 1}: ${col.widthPercent}%`}
                            >
                                {col.widthPercent}%
                            </div>
                        ))}
                    </div>

                    {/* Quick Presets Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-muted-foreground mr-1">Preset Rasio:</span>
                        {columnCount === 2 ? (
                            <>
                                {TWO_COL_PRESETS.map((p) => (
                                    <Button
                                        key={p.label}
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className={`h-6 text-[10.5px] px-2 ${
                                            columns[0]?.widthPercent === p.col1 && columns[1]?.widthPercent === p.col2
                                                ? 'border-primary bg-primary/10 text-primary font-bold'
                                                : ''
                                        }`}
                                        onClick={() => applyTwoColPreset(p.col1, p.col2)}
                                    >
                                        {p.label}
                                    </Button>
                                ))}
                            </>
                        ) : (
                            <>
                                {THREE_COL_PRESETS.map((p) => (
                                    <Button
                                        key={p.label}
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className={`h-6 text-[10.5px] px-2 ${
                                            columns[0]?.widthPercent === p.col1 && columns[1]?.widthPercent === p.col2
                                                ? 'border-primary bg-primary/10 text-primary font-bold'
                                                : ''
                                        }`}
                                        onClick={() => applyThreeColPreset(p.col1, p.col2, p.col3)}
                                    >
                                        {p.label}
                                    </Button>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. Column Selection Tabs */}
            <div className="flex items-center gap-2 border-b border-border/80 pb-2">
                <span className="text-xs font-semibold text-muted-foreground mr-1">Edit Kolom:</span>
                {columns.map((col, idx) => (
                    <Button
                        key={col.id}
                        type="button"
                        variant={safeActiveIndex === idx ? 'default' : 'secondary'}
                        size="sm"
                        className="h-7 text-xs px-3 rounded-md gap-1.5"
                        onClick={() => setActiveColIndex(idx)}
                    >
                        <span>Kolom #{idx + 1}</span>
                        <Badge variant="outline" className="text-[9px] px-1 py-0 ml-0.5">
                            {col.widthPercent}%
                        </Badge>
                    </Button>
                ))}
            </div>

            {/* 3. Active Column Settings */}
            {activeCol && (
                <div className="p-3 rounded-lg border border-border/80 bg-background space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs pb-2 border-b border-border/60">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">Kolom #{safeActiveIndex + 1}</span>
                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                <span>Lebar:</span>
                                <Input
                                    type="number"
                                    min={15}
                                    max={85}
                                    className="h-6 w-14 text-xs px-1 text-center"
                                    value={activeCol.widthPercent}
                                    onChange={(e) => {
                                        const val = Number(e.target.value) || 50;
                                        if (columnCount === 2) {
                                            const otherIdx = safeActiveIndex === 0 ? 1 : 0;
                                            const nextCols = [...columns];
                                            nextCols[safeActiveIndex] = { ...activeCol, widthPercent: val };
                                            nextCols[otherIdx] = { ...nextCols[otherIdx], widthPercent: 100 - val };
                                            updateColumns(nextCols);
                                        } else {
                                            updateActiveCol({ widthPercent: val });
                                        }
                                    }}
                                />
                                <span>%</span>
                            </div>
                        </div>

                        {/* Alignment Buttons */}
                        <div className="flex items-center gap-1">
                            <span className="text-[11px] text-muted-foreground mr-1">Rata:</span>
                            <Button
                                type="button"
                                variant={activeCol.align === 'left' ? 'default' : 'outline'}
                                size="icon"
                                className="size-6"
                                onClick={() => updateActiveCol({ align: 'left' })}
                                title="Rata Kiri"
                            >
                                <AlignLeft className="size-3" />
                            </Button>
                            <Button
                                type="button"
                                variant={activeCol.align === 'center' ? 'default' : 'outline'}
                                size="icon"
                                className="size-6"
                                onClick={() => updateActiveCol({ align: 'center' })}
                                title="Rata Tengah"
                            >
                                <AlignCenter className="size-3" />
                            </Button>
                            <Button
                                type="button"
                                variant={activeCol.align === 'right' ? 'default' : 'outline'}
                                size="icon"
                                className="size-6"
                                onClick={() => updateActiveCol({ align: 'right' })}
                                title="Rata Kanan"
                            >
                                <AlignRight className="size-3" />
                            </Button>
                        </div>
                    </div>

                    {/* Content Type Selector */}
                    <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold text-muted-foreground uppercase">
                            Tipe Konten Kolom Ini
                        </Label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                            {[
                                { type: 'text', label: 'Teks Bebas', icon: Type },
                                { type: 'callout', label: 'Box Catatan', icon: AlertCircle },
                                { type: 'dossier', label: 'Tabel Info', icon: FileText },
                                { type: 'signature', label: 'Tanda Tangan', icon: Stamp },
                                { type: 'table', label: 'Mini Tabel', icon: TableIcon },
                            ].map((item) => {
                                const Icon = item.icon;
                                const isSelected = activeCol.content.type === item.type;
                                return (
                                    <button
                                        key={item.type}
                                        type="button"
                                        onClick={() => handleContentTypeChange(item.type as ContainerColumnContentType)}
                                        className={`p-2 rounded-lg border text-left flex flex-col items-center justify-center gap-1 transition-all ${
                                            isSelected
                                                ? 'border-primary bg-primary/10 text-primary font-semibold'
                                                : 'border-border/80 bg-muted/20 hover:bg-muted/40 text-muted-foreground'
                                        }`}
                                    >
                                        <Icon className="size-3.5" />
                                        <span className="text-[10px] text-center">{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content Editor per Type */}
                    <div className="pt-2 border-t border-border/60">
                        {/* 1. TEXT */}
                        {activeCol.content.type === 'text' && (
                            <div className="space-y-2">
                                <Label className="text-xs">Isi Teks / HTML</Label>
                                <Textarea
                                    rows={4}
                                    className="text-xs leading-relaxed"
                                    value={activeCol.content.textHtml || ''}
                                    onChange={(e) =>
                                        updateActiveCol({
                                            content: { ...activeCol.content, textHtml: e.target.value },
                                        })
                                    }
                                    placeholder="Tuliskan teks paragraf..."
                                />
                                <div className="pt-1">
                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
                                        <Sparkles className="size-2.5 text-amber-500" />
                                        <span>Sisip variabel ke teks:</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {['{{nama_konsumen}}', '{{nomor_kavling}}', '{{harga_total}}', '{{nominal_booking}}'].map(
                                            (token) => (
                                                <AtomicVariablePill
                                                    key={token}
                                                    token={token}
                                                    onClick={() => {
                                                        const cur = activeCol.content.textHtml || '';
                                                        updateActiveCol({
                                                            content: {
                                                                ...activeCol.content,
                                                                textHtml: cur ? `${cur} ${token}` : token,
                                                            },
                                                        });
                                                    }}
                                                />
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. CALLOUT */}
                        {activeCol.content.type === 'callout' && (
                            <div className="space-y-2 text-xs">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-[10.5px]">Judul Box</Label>
                                        <Input
                                            className="h-7 text-xs"
                                            value={activeCol.content.calloutTitle || ''}
                                            onChange={(e) =>
                                                updateActiveCol({
                                                    content: { ...activeCol.content, calloutTitle: e.target.value },
                                                })
                                            }
                                            placeholder="Contoh: CATATAN"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10.5px]">Varian Warna</Label>
                                        <select
                                            className="h-7 w-full text-xs rounded border border-input bg-background px-2 py-0"
                                            value={activeCol.content.calloutVariant || 'neutral'}
                                            onChange={(e) =>
                                                updateActiveCol({
                                                    content: {
                                                        ...activeCol.content,
                                                        calloutVariant: e.target.value as 'neutral' | 'info' | 'warning',
                                                    },
                                                })
                                            }
                                        >
                                            <option value="neutral">Netral (Abu-abu)</option>
                                            <option value="info">Informasi (Biru Muda)</option>
                                            <option value="warning">Penting (Kuning Emas)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10.5px]">Pesan / Catatan</Label>
                                    <Textarea
                                        rows={3}
                                        className="text-xs"
                                        value={activeCol.content.calloutText || ''}
                                        onChange={(e) =>
                                            updateActiveCol({
                                                content: { ...activeCol.content, calloutText: e.target.value },
                                            })
                                        }
                                        placeholder="Tuliskan catatan penting di sini..."
                                    />
                                </div>
                            </div>
                        )}

                        {/* 3. DOSSIER / KEY-VALUE */}
                        {activeCol.content.type === 'dossier' && (
                            <div className="space-y-2 text-xs">
                                <div className="space-y-1">
                                    <Label className="text-[10.5px]">Judul Tabel Info</Label>
                                    <Input
                                        className="h-7 text-xs"
                                        value={activeCol.content.dossierTitle || ''}
                                        onChange={(e) =>
                                            updateActiveCol({
                                                content: { ...activeCol.content, dossierTitle: e.target.value },
                                            })
                                        }
                                    />
                                </div>

                                <div className="space-y-1.5 pt-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10.5px] font-semibold text-muted-foreground">
                                            Baris Data (Label & Nilai)
                                        </span>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-5 text-[9.5px] px-1.5 gap-1 rounded"
                                            onClick={() => {
                                                const items = activeCol.content.dossierItems || [];
                                                updateActiveCol({
                                                    content: {
                                                        ...activeCol.content,
                                                        dossierItems: [...items, { label: 'Label Baru', value: 'Nilai' }],
                                                    },
                                                });
                                            }}
                                        >
                                            <Plus className="size-2.5" />
                                            <span>+ Baris</span>
                                        </Button>
                                    </div>

                                    {(activeCol.content.dossierItems || []).map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-1.5">
                                            <Input
                                                className="h-7 text-xs w-1/3"
                                                value={item.label}
                                                onChange={(e) => {
                                                    const items = [...(activeCol.content.dossierItems || [])];
                                                    items[idx] = { ...items[idx], label: e.target.value };
                                                    updateActiveCol({
                                                        content: { ...activeCol.content, dossierItems: items },
                                                    });
                                                }}
                                                placeholder="Label"
                                            />
                                            <Input
                                                className="h-7 text-xs flex-1"
                                                value={item.value}
                                                onChange={(e) => {
                                                    const items = [...(activeCol.content.dossierItems || [])];
                                                    items[idx] = { ...items[idx], value: e.target.value };
                                                    updateActiveCol({
                                                        content: { ...activeCol.content, dossierItems: items },
                                                    });
                                                }}
                                                placeholder="Nilai / {{token}}"
                                            />
                                            <button
                                                type="button"
                                                className="size-6 text-muted-foreground hover:text-destructive flex items-center justify-center"
                                                onClick={() => {
                                                    const items = (activeCol.content.dossierItems || []).filter(
                                                        (_, i) => i !== idx
                                                    );
                                                    updateActiveCol({
                                                        content: { ...activeCol.content, dossierItems: items },
                                                    });
                                                }}
                                            >
                                                <Trash2 className="size-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 4. SIGNATURE */}
                        {activeCol.content.type === 'signature' && (
                            <div className="space-y-2 text-xs">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-[10.5px]">Jabatan / Peran Pihak</Label>
                                        <Input
                                            className="h-7 text-xs"
                                            value={activeCol.content.signRole || ''}
                                            onChange={(e) =>
                                                updateActiveCol({
                                                    content: { ...activeCol.content, signRole: e.target.value },
                                                })
                                            }
                                            placeholder="Pihak Pertama (Konsumen)"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10.5px]">Nama Penandatangan</Label>
                                        <Input
                                            className="h-7 text-xs"
                                            value={activeCol.content.signName || ''}
                                            onChange={(e) =>
                                                updateActiveCol({
                                                    content: { ...activeCol.content, signName: e.target.value },
                                                })
                                            }
                                            placeholder="{{nama_konsumen}}"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-[10.5px]">Keterangan Bawah (Subtext)</Label>
                                    <Input
                                        className="h-7 text-xs"
                                        value={activeCol.content.signSubtext || ''}
                                        onChange={(e) =>
                                            updateActiveCol({
                                                content: { ...activeCol.content, signSubtext: e.target.value },
                                            })
                                        }
                                        placeholder="Konsumen / NIK: {{nik_konsumen}}"
                                    />
                                </div>

                                <div className="flex items-center gap-4 pt-1">
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <Checkbox
                                            checked={activeCol.content.signHasMaterai}
                                            onCheckedChange={(val) =>
                                                updateActiveCol({
                                                    content: { ...activeCol.content, signHasMaterai: !!val },
                                                })
                                            }
                                        />
                                        <span>Kotak Materai Rp 10.000</span>
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <Checkbox
                                            checked={activeCol.content.signHasQr}
                                            onCheckedChange={(val) =>
                                                updateActiveCol({
                                                    content: { ...activeCol.content, signHasQr: !!val },
                                                })
                                            }
                                        />
                                        <span>Verifikasi QR Code</span>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* 5. MINI TABLE */}
                        {activeCol.content.type === 'table' && (
                            <div className="space-y-2 text-xs">
                                <span className="text-[10.5px] font-semibold text-muted-foreground">
                                    Mini Rincian Tabel
                                </span>
                                <div className="space-y-1.5">
                                    {(activeCol.content.tableRows || []).map((row, rIdx) => (
                                        <div key={rIdx} className="flex items-center gap-1.5">
                                            {row.map((cell, cIdx) => (
                                                <Input
                                                    key={cIdx}
                                                    className="h-7 text-xs"
                                                    value={cell}
                                                    onChange={(e) => {
                                                        const rows = [...(activeCol.content.tableRows || [])];
                                                        const newCells = [...rows[rIdx]];
                                                        newCells[cIdx] = e.target.value;
                                                        rows[rIdx] = newCells;
                                                        updateActiveCol({
                                                            content: { ...activeCol.content, tableRows: rows },
                                                        });
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
