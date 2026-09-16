import React, { useState } from 'react';
import {
    CustomKopBlock,
    HeaderColumn,
    HeaderSubElement,
    HeaderLogoElement,
    HeaderTextElement,
    HeaderDividerElement,
    HeaderSpacerElement,
} from './types';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Checkbox } from '@/Components/ui/checkbox';
import { Badge } from '@/Components/ui/badge';
import AtomicVariablePill from './AtomicVariablePill';
import {
    Image as LucideImage,
    Type,
    Minus,
    Maximize2,
    ChevronUp,
    ChevronDown,
    Trash2,
    Plus,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Columns,
    Sparkles,
} from 'lucide-react';

interface CustomKopEditorProps {
    block: CustomKopBlock;
    onUpdate: (updatedBlock: CustomKopBlock) => void;
}

export default function CustomKopEditor({ block, onUpdate }: CustomKopEditorProps) {
    const { layoutMode, columns, showBottomDivider, bottomDivider } = block.data;
    const [selectedColIndex, setSelectedColIndex] = useState(0);

    // Ensure selected column index is valid
    const activeColIndex = Math.min(selectedColIndex, Math.max(0, columns.length - 1));
    const activeCol = columns[activeColIndex];

    // Helper to update columns
    const updateColumns = (newCols: HeaderColumn[]) => {
        onUpdate({
            ...block,
            data: {
                ...block.data,
                columns: newCols,
            },
        });
    };

    // Helper to update the active column
    const updateActiveCol = (updatedCol: HeaderColumn) => {
        const nextCols = [...columns];
        nextCols[activeColIndex] = updatedCol;
        updateColumns(nextCols);
    };

    // Layout Mode switch handler
    const handleLayoutModeChange = (mode: '1_col' | '2_col' | '3_col') => {
        if (mode === layoutMode) return;

        let newCols: HeaderColumn[] = [];
        if (mode === '1_col') {
            // Merge all elements into 1 single column
            const allElements: HeaderSubElement[] = [];
            columns.forEach((c) => allElements.push(...c.elements));
            newCols = [
                {
                    id: `col-${Date.now()}-1`,
                    widthPercent: 100,
                    align: 'center',
                    elements: allElements.length > 0 ? allElements : [
                        {
                            id: `txt-${Date.now()}-1`,
                            type: 'text',
                            content: 'PT CASANUMA GRAHA PERSADA',
                            fontSizePt: 14,
                            fontWeight: '800',
                            colorHex: '#0f172a',
                            isUppercase: true,
                            align: 'center',
                        },
                        {
                            id: `txt-${Date.now()}-2`,
                            type: 'text',
                            content: 'Jl. Boulevard Utama No. 88, Grand Casanuma Hills, Jakarta Selatan',
                            fontSizePt: 9,
                            fontWeight: 'normal',
                            colorHex: '#475569',
                            isUppercase: false,
                            align: 'center',
                        },
                    ],
                },
            ];
        } else if (mode === '2_col') {
            // Left col 25% for logo, Right col 75% for company info
            const col1Elements = columns[0]?.elements.filter((e) => e.type === 'logo') || [
                {
                    id: `logo-${Date.now()}`,
                    type: 'logo',
                    url: '/images/logo.png',
                    widthPx: 100,
                    maxHeightPx: 80,
                    align: 'center',
                } as HeaderLogoElement,
            ];
            const col2Elements = columns[1]?.elements || columns[0]?.elements.filter((e) => e.type !== 'logo') || [
                {
                    id: `txt-${Date.now()}-1`,
                    type: 'text',
                    content: 'PT CASANUMA GRAHA PERSADA',
                    fontSizePt: 14,
                    fontWeight: '800',
                    colorHex: '#0f172a',
                    isUppercase: true,
                    align: 'center',
                } as HeaderTextElement,
                {
                    id: `txt-${Date.now()}-2`,
                    type: 'text',
                    content: 'Kawasan Bisnis Prima Blok C No. 12, Jl. Sudirman Kav. 45, Jakarta Selatan',
                    fontSizePt: 9,
                    fontWeight: 'normal',
                    colorHex: '#475569',
                    isUppercase: false,
                    align: 'center',
                } as HeaderTextElement,
                {
                    id: `txt-${Date.now()}-3`,
                    type: 'text',
                    content: 'Telp: (021) 555-8900 | Email: sales@casanuma.co.id | Website: www.casanuma.co.id',
                    fontSizePt: 8,
                    fontWeight: 'normal',
                    colorHex: '#64748b',
                    isUppercase: false,
                    align: 'center',
                } as HeaderTextElement,
            ];

            newCols = [
                {
                    id: `col-${Date.now()}-1`,
                    widthPercent: 25,
                    align: 'center',
                    elements: col1Elements,
                },
                {
                    id: `col-${Date.now()}-2`,
                    widthPercent: 75,
                    align: 'center',
                    elements: col2Elements,
                },
            ];
        } else if (mode === '3_col') {
            // 3 cols: 20% Logo Kiri, 60% Teks Tengah, 20% Logo Kanan/Sertifikasi
            newCols = [
                {
                    id: `col-${Date.now()}-1`,
                    widthPercent: 20,
                    align: 'center',
                    elements: [
                        {
                            id: `logo-${Date.now()}-1`,
                            type: 'logo',
                            url: '/images/logo.png',
                            widthPx: 80,
                            maxHeightPx: 70,
                            align: 'center',
                        },
                    ],
                },
                {
                    id: `col-${Date.now()}-2`,
                    widthPercent: 60,
                    align: 'center',
                    elements: [
                        {
                            id: `txt-${Date.now()}-1`,
                            type: 'text',
                            content: 'PT CASANUMA GRAHA PERSADA',
                            fontSizePt: 13,
                            fontWeight: '800',
                            colorHex: '#0f172a',
                            isUppercase: true,
                            align: 'center',
                        },
                        {
                            id: `txt-${Date.now()}-2`,
                            type: 'text',
                            content: 'Grand Casanuma Office Tower Lt. 15, Jl. Jend. Sudirman Kav. 45, Jakarta',
                            fontSizePt: 8.5,
                            fontWeight: 'normal',
                            colorHex: '#475569',
                            isUppercase: false,
                            align: 'center',
                        },
                    ],
                },
                {
                    id: `col-${Date.now()}-3`,
                    widthPercent: 20,
                    align: 'center',
                    elements: [
                        {
                            id: `txt-${Date.now()}-iso`,
                            type: 'text',
                            content: 'ISO 9001:2015\nCertified',
                            fontSizePt: 8,
                            fontWeight: 'bold',
                            colorHex: '#0284c7',
                            isUppercase: true,
                            align: 'center',
                        },
                    ],
                },
            ];
        }

        onUpdate({
            ...block,
            data: {
                ...block.data,
                layoutMode: mode,
                columns: newCols,
            },
        });
        setSelectedColIndex(0);
    };

    // Sub-elements manipulation in active column
    const handleAddSubElement = (type: 'logo' | 'text' | 'divider' | 'spacer') => {
        if (!activeCol) return;

        let newElement: HeaderSubElement;
        const genId = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

        if (type === 'logo') {
            newElement = {
                id: genId,
                type: 'logo',
                url: '/images/logo.png',
                widthPx: 90,
                maxHeightPx: 75,
                align: 'center',
            };
        } else if (type === 'text') {
            newElement = {
                id: genId,
                type: 'text',
                content: 'Baris Informasi Baru',
                fontSizePt: 10,
                fontWeight: 'normal',
                colorHex: '#334155',
                isUppercase: false,
                align: activeCol.align || 'center',
            };
        } else if (type === 'divider') {
            newElement = {
                id: genId,
                type: 'divider',
                style: 'solid',
                thicknessPx: 1,
                colorHex: '#cbd5e1',
                marginTopPx: 4,
                marginBottomPx: 4,
            };
        } else {
            newElement = {
                id: genId,
                type: 'spacer',
                heightPx: 8,
            };
        }

        updateActiveCol({
            ...activeCol,
            elements: [...activeCol.elements, newElement],
        });
    };

    const handleUpdateSubElement = (elId: string, updatedEl: HeaderSubElement) => {
        if (!activeCol) return;
        const nextElements = activeCol.elements.map((e) => (e.id === elId ? updatedEl : e));
        updateActiveCol({ ...activeCol, elements: nextElements });
    };

    const handleDeleteSubElement = (elId: string) => {
        if (!activeCol) return;
        const nextElements = activeCol.elements.filter((e) => e.id !== elId);
        updateActiveCol({ ...activeCol, elements: nextElements });
    };

    const handleMoveSubElement = (index: number, direction: 'up' | 'down') => {
        if (!activeCol) return;
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= activeCol.elements.length) return;

        const nextElements = [...activeCol.elements];
        const [moved] = nextElements.splice(index, 1);
        nextElements.splice(targetIndex, 0, moved);
        updateActiveCol({ ...activeCol, elements: nextElements });
    };

    return (
        <div className="space-y-4">
            {/* 1. Layout Mode & Columns Selector */}
            <div className="p-3 rounded-lg border border-border/80 bg-muted/20 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Columns className="size-3.5 text-primary" />
                        <span>Format Kolom Kop</span>
                    </Label>
                    <div className="flex items-center gap-1">
                        <Button
                            type="button"
                            variant={layoutMode === '1_col' ? 'default' : 'outline'}
                            size="sm"
                            className="h-7 text-xs px-2.5 gap-1.5"
                            onClick={() => handleLayoutModeChange('1_col')}
                        >
                            <span>1 Kolom (Pusat)</span>
                        </Button>
                        <Button
                            type="button"
                            variant={layoutMode === '2_col' ? 'default' : 'outline'}
                            size="sm"
                            className="h-7 text-xs px-2.5 gap-1.5"
                            onClick={() => handleLayoutModeChange('2_col')}
                        >
                            <span>2 Kolom (Logo + Teks)</span>
                        </Button>
                        <Button
                            type="button"
                            variant={layoutMode === '3_col' ? 'default' : 'outline'}
                            size="sm"
                            className="h-7 text-xs px-2.5 gap-1.5"
                            onClick={() => handleLayoutModeChange('3_col')}
                        >
                            <span>3 Kolom</span>
                        </Button>
                    </div>
                </div>

                {/* Garis Pembatas Bawah Kop (Official Double Line) */}
                <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                            checked={showBottomDivider}
                            onCheckedChange={(checked) =>
                                onUpdate({
                                    ...block,
                                    data: { ...block.data, showBottomDivider: !!checked },
                                })
                            }
                        />
                        <span className="font-semibold text-foreground">
                            Garis Pembatas Bawah Kop (Khas Surat Resmi)
                        </span>
                    </label>

                    {showBottomDivider && (
                        <div className="flex items-center gap-2">
                            <select
                                className="h-7 text-xs rounded border border-input bg-background px-2 py-0.5 text-foreground"
                                value={bottomDivider.style}
                                onChange={(e) =>
                                    onUpdate({
                                        ...block,
                                        data: {
                                            ...block.data,
                                            bottomDivider: {
                                                ...bottomDivider,
                                                style: e.target.value as 'double' | 'solid' | 'dashed',
                                            },
                                        },
                                    })
                                }
                            >
                                <option value="double">Garis Ganda (Double)</option>
                                <option value="solid">Garis Tunggal (Solid)</option>
                                <option value="dashed">Garis Putus (Dashed)</option>
                            </select>

                            <div className="flex items-center gap-1">
                                <span className="text-[11px] text-muted-foreground">Tebal:</span>
                                <Input
                                    type="number"
                                    min={1}
                                    max={6}
                                    className="h-7 w-14 text-xs px-1.5 text-center"
                                    value={bottomDivider.thicknessPx}
                                    onChange={(e) =>
                                        onUpdate({
                                            ...block,
                                            data: {
                                                ...block.data,
                                                bottomDivider: {
                                                    ...bottomDivider,
                                                    thicknessPx: Number(e.target.value) || 2,
                                                },
                                            },
                                        })
                                    }
                                />
                                <span className="text-[10px] text-muted-foreground">px</span>
                            </div>

                            <input
                                type="color"
                                className="h-7 w-8 rounded border border-input cursor-pointer bg-background p-0.5"
                                value={bottomDivider.colorHex}
                                onChange={(e) =>
                                    onUpdate({
                                        ...block,
                                        data: {
                                            ...block.data,
                                            bottomDivider: {
                                                ...bottomDivider,
                                                colorHex: e.target.value,
                                            },
                                        },
                                    })
                                }
                                title="Warna Garis"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* 2. Column Navigation Tabs (if 2 or 3 cols) */}
            {columns.length > 1 && (
                <div className="flex items-center gap-2 border-b border-border/80 pb-2">
                    <span className="text-xs font-semibold text-muted-foreground mr-1">Edit Kolom:</span>
                    {columns.map((col, idx) => (
                        <Button
                            key={col.id}
                            type="button"
                            variant={activeColIndex === idx ? 'default' : 'secondary'}
                            size="sm"
                            className="h-7 text-xs px-3 rounded-md gap-1.5"
                            onClick={() => setSelectedColIndex(idx)}
                        >
                            <span>Kolom #{idx + 1}</span>
                            <Badge variant="outline" className="text-[9px] px-1 py-0 ml-0.5">
                                {col.widthPercent}%
                            </Badge>
                        </Button>
                    ))}
                </div>
            )}

            {/* 3. Active Column Properties */}
            {activeCol && (
                <div className="p-3 rounded-lg border border-border/80 bg-background space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs pb-2 border-b border-border/60">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">Pengaturan Kolom #{activeColIndex + 1}</span>
                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                <span>Lebar:</span>
                                <Input
                                    type="number"
                                    min={10}
                                    max={100}
                                    className="h-6 w-14 text-xs px-1 text-center"
                                    value={activeCol.widthPercent}
                                    onChange={(e) =>
                                        updateActiveCol({
                                            ...activeCol,
                                            widthPercent: Number(e.target.value) || 50,
                                        })
                                    }
                                />
                                <span>%</span>
                            </div>
                        </div>

                        {/* Alignment buttons */}
                        <div className="flex items-center gap-1">
                            <span className="text-[11px] text-muted-foreground mr-1">Rata:</span>
                            <Button
                                type="button"
                                variant={activeCol.align === 'left' ? 'default' : 'outline'}
                                size="icon"
                                className="size-6"
                                onClick={() => updateActiveCol({ ...activeCol, align: 'left' })}
                                title="Rata Kiri"
                            >
                                <AlignLeft className="size-3" />
                            </Button>
                            <Button
                                type="button"
                                variant={activeCol.align === 'center' ? 'default' : 'outline'}
                                size="icon"
                                className="size-6"
                                onClick={() => updateActiveCol({ ...activeCol, align: 'center' })}
                                title="Rata Tengah"
                            >
                                <AlignCenter className="size-3" />
                            </Button>
                            <Button
                                type="button"
                                variant={activeCol.align === 'right' ? 'default' : 'outline'}
                                size="icon"
                                className="size-6"
                                onClick={() => updateActiveCol({ ...activeCol, align: 'right' })}
                                title="Rata Kanan"
                            >
                                <AlignRight className="size-3" />
                            </Button>
                        </div>
                    </div>

                    {/* Sub-Elements In Active Column */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                                Elemen di Kolom Ini ({activeCol.elements.length})
                            </span>
                            <div className="flex items-center gap-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-6 text-[10px] gap-1 rounded px-2"
                                    onClick={() => handleAddSubElement('logo')}
                                >
                                    <LucideImage className="size-3 text-blue-500" />
                                    <span>+ Logo</span>
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-6 text-[10px] gap-1 rounded px-2"
                                    onClick={() => handleAddSubElement('text')}
                                >
                                    <Type className="size-3 text-emerald-500" />
                                    <span>+ Teks</span>
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-6 text-[10px] gap-1 rounded px-2"
                                    onClick={() => handleAddSubElement('divider')}
                                >
                                    <Minus className="size-3 text-amber-500" />
                                    <span>+ Garis</span>
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-6 text-[10px] gap-1 rounded px-2"
                                    onClick={() => handleAddSubElement('spacer')}
                                >
                                    <Maximize2 className="size-3 text-purple-500" />
                                    <span>+ Spasi</span>
                                </Button>
                            </div>
                        </div>

                        {/* List of sub-elements */}
                        {activeCol.elements.length === 0 ? (
                            <div className="p-4 text-center border border-dashed rounded-lg text-xs text-muted-foreground">
                                Belum ada elemen di kolom ini. Klik tombol di atas untuk menambah Logo atau Teks.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {activeCol.elements.map((el, elIdx) => (
                                    <div
                                        key={el.id}
                                        className="p-2.5 rounded-lg border border-border/80 bg-muted/20 space-y-2"
                                    >
                                        {/* Element Header */}
                                        <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-1.5">
                                                {el.type === 'logo' && <LucideImage className="size-3.5 text-blue-500" />}
                                                {el.type === 'text' && <Type className="size-3.5 text-emerald-500" />}
                                                {el.type === 'divider' && <Minus className="size-3.5 text-amber-500" />}
                                                {el.type === 'spacer' && <Maximize2 className="size-3.5 text-purple-500" />}
                                                <span className="font-semibold text-foreground uppercase text-[10.5px]">
                                                    {el.type === 'logo'
                                                        ? 'Logo / Gambar'
                                                        : el.type === 'text'
                                                        ? 'Teks Kop'
                                                        : el.type === 'divider'
                                                        ? 'Garis Pemisah'
                                                        : 'Spacer'}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-5"
                                                    disabled={elIdx === 0}
                                                    onClick={() => handleMoveSubElement(elIdx, 'up')}
                                                    title="Naikkan"
                                                >
                                                    <ChevronUp className="size-3" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-5"
                                                    disabled={elIdx === activeCol.elements.length - 1}
                                                    onClick={() => handleMoveSubElement(elIdx, 'down')}
                                                    title="Turunkan"
                                                >
                                                    <ChevronDown className="size-3" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-5 text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDeleteSubElement(el.id)}
                                                    title="Hapus Elemen"
                                                >
                                                    <Trash2 className="size-3" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Element Content Forms */}
                                        {el.type === 'logo' && (
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                                <div className="sm:col-span-2 space-y-1">
                                                    <Label className="text-[10.5px] text-muted-foreground">URL Logo / Gambar</Label>
                                                    <Input
                                                        className="h-7 text-xs"
                                                        placeholder="/images/logo.png atau URL"
                                                        value={el.url}
                                                        onChange={(e) =>
                                                            handleUpdateSubElement(el.id, { ...el, url: e.target.value })
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[10.5px] text-muted-foreground">Lebar (px)</Label>
                                                    <Input
                                                        type="number"
                                                        min={30}
                                                        max={300}
                                                        className="h-7 text-xs"
                                                        value={el.widthPx}
                                                        onChange={(e) =>
                                                            handleUpdateSubElement(el.id, {
                                                                ...el,
                                                                widthPx: Number(e.target.value) || 80,
                                                            })
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {el.type === 'text' && (
                                            <div className="space-y-2 text-xs">
                                                <div className="space-y-1">
                                                    <Label className="text-[10.5px] text-muted-foreground">Isi Teks</Label>
                                                    <Input
                                                        className="h-7 text-xs"
                                                        placeholder="Contoh: PT CASANUMA GRAHA PERSADA"
                                                        value={el.content}
                                                        onChange={(e) =>
                                                            handleUpdateSubElement(el.id, { ...el, content: e.target.value })
                                                        }
                                                    />
                                                </div>

                                                <div className="flex flex-wrap items-center gap-3">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-[10.5px] text-muted-foreground">Ukuran:</span>
                                                        <Input
                                                            type="number"
                                                            min={6}
                                                            max={36}
                                                            className="h-6 w-14 text-xs px-1 text-center"
                                                            value={el.fontSizePt}
                                                            onChange={(e) =>
                                                                handleUpdateSubElement(el.id, {
                                                                    ...el,
                                                                    fontSizePt: Number(e.target.value) || 10,
                                                                })
                                                            }
                                                        />
                                                        <span className="text-[10px] text-muted-foreground">pt</span>
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        <span className="text-[10.5px] text-muted-foreground">Bobot:</span>
                                                        <select
                                                            className="h-6 text-xs rounded border border-input bg-background px-1.5 py-0"
                                                            value={el.fontWeight}
                                                            onChange={(e) =>
                                                                handleUpdateSubElement(el.id, {
                                                                    ...el,
                                                                    fontWeight: e.target.value as 'normal' | 'bold' | '800',
                                                                })
                                                            }
                                                        >
                                                            <option value="normal">Normal</option>
                                                            <option value="bold">Bold (Tebal)</option>
                                                            <option value="800">Extra Bold (800)</option>
                                                        </select>
                                                    </div>

                                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                                        <Checkbox
                                                            checked={el.isUppercase}
                                                            onCheckedChange={(checked) =>
                                                                handleUpdateSubElement(el.id, {
                                                                    ...el,
                                                                    isUppercase: !!checked,
                                                                })
                                                            }
                                                        />
                                                        <span className="text-[10.5px]">KAPITAL</span>
                                                    </label>

                                                    <div className="flex items-center gap-1">
                                                        <span className="text-[10.5px] text-muted-foreground">Warna:</span>
                                                        <input
                                                            type="color"
                                                            className="h-6 w-7 rounded border border-input cursor-pointer bg-background p-0.5"
                                                            value={el.colorHex}
                                                            onChange={(e) =>
                                                                handleUpdateSubElement(el.id, { ...el, colorHex: e.target.value })
                                                            }
                                                        />
                                                    </div>
                                                </div>

                                                {/* Variable Chips Inserter for Kop Text */}
                                                <div className="pt-1">
                                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
                                                        <Sparkles className="size-2.5 text-amber-500" />
                                                        <span>Sisip variabel ke baris teks:</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {['{{nama_perusahaan}}', '{{nama_proyek}}', '{{telepon_konsumen}}'].map(
                                                            (token) => (
                                                                <AtomicVariablePill
                                                                    key={token}
                                                                    token={token}
                                                                    onClick={() => {
                                                                        const updatedContent = el.content
                                                                            ? `${el.content} ${token}`
                                                                            : token;
                                                                        handleUpdateSubElement(el.id, {
                                                                            ...el,
                                                                            content: updatedContent,
                                                                        });
                                                                    }}
                                                                />
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {el.type === 'divider' && (
                                            <div className="flex flex-wrap items-center gap-3 text-xs">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[10.5px] text-muted-foreground">Style:</span>
                                                    <select
                                                        className="h-6 text-xs rounded border border-input bg-background px-1.5 py-0"
                                                        value={el.style}
                                                        onChange={(e) =>
                                                            handleUpdateSubElement(el.id, {
                                                                ...el,
                                                                style: e.target.value as 'double' | 'solid' | 'dashed',
                                                            })
                                                        }
                                                    >
                                                        <option value="solid">Solid</option>
                                                        <option value="double">Double</option>
                                                        <option value="dashed">Dashed</option>
                                                    </select>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    <span className="text-[10.5px] text-muted-foreground">Tebal:</span>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        max={6}
                                                        className="h-6 w-12 text-xs px-1 text-center"
                                                        value={el.thicknessPx}
                                                        onChange={(e) =>
                                                            handleUpdateSubElement(el.id, {
                                                                ...el,
                                                                thicknessPx: Number(e.target.value) || 1,
                                                            })
                                                        }
                                                    />
                                                    <span className="text-[10px] text-muted-foreground">px</span>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    <span className="text-[10.5px] text-muted-foreground">Warna:</span>
                                                    <input
                                                        type="color"
                                                        className="h-6 w-7 rounded border border-input cursor-pointer bg-background p-0.5"
                                                        value={el.colorHex}
                                                        onChange={(e) =>
                                                            handleUpdateSubElement(el.id, { ...el, colorHex: e.target.value })
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {el.type === 'spacer' && (
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className="text-[10.5px] text-muted-foreground">Tinggi Ruang Kosong:</span>
                                                <Input
                                                    type="number"
                                                    min={2}
                                                    max={50}
                                                    className="h-6 w-16 text-xs px-1 text-center"
                                                    value={el.heightPx}
                                                    onChange={(e) =>
                                                        handleUpdateSubElement(el.id, {
                                                            ...el,
                                                            heightPx: Number(e.target.value) || 8,
                                                        })
                                                    }
                                                />
                                                <span className="text-[10px] text-muted-foreground">px</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
