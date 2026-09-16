import React from 'react';
import { BlockStyles } from './types';
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { RotateCcw, Box, MoveVertical, Palette, Shield } from 'lucide-react';

interface BlockStyleSettingsProps {
    styles?: BlockStyles;
    onChange: (styles: BlockStyles) => void;
    onReset: () => void;
}

const BG_PRESETS = [
    { label: 'Transparan', value: 'transparent', classBg: 'bg-transparent border-border' },
    { label: 'Putih', value: '#ffffff', classBg: 'bg-white border-slate-300' },
    { label: 'Slate', value: '#f8fafc', classBg: 'bg-slate-50 border-slate-200' },
    { label: 'Gray', value: '#f1f5f9', classBg: 'bg-slate-100 border-slate-300' },
    { label: 'Emerald', value: '#ecfdf5', classBg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Amber', value: '#fffbeb', classBg: 'bg-amber-50 border-amber-200' },
    { label: 'Sky', value: '#f0f9ff', classBg: 'bg-sky-50 border-sky-200' },
    { label: 'Indigo', value: '#eef2ff', classBg: 'bg-indigo-50 border-indigo-200' },
];

const RADIUS_PRESETS = [
    { label: '0 (Siku)', value: 0 },
    { label: '4px', value: 4 },
    { label: '8px', value: 8 },
    { label: '12px', value: 12 },
    { label: '16px', value: 16 },
];

export default function BlockStyleSettings({
    styles = {},
    onChange,
    onReset,
}: BlockStyleSettingsProps) {
    const update = (patch: Partial<BlockStyles>) => {
        onChange({ ...styles, ...patch });
    };

    const currentBg = styles.backgroundColor || 'transparent';
    const currentRadius = styles.borderRadiusPx ?? 0;
    const currentBorderWidth = styles.borderWidthPx ?? 0;
    const currentBorderStyle = styles.borderStyle || 'none';
    const currentBorderColor = styles.borderColor || '#cbd5e1';

    return (
        <div className="space-y-4 p-3 rounded-lg border border-border/80 bg-muted/20 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <Box className="size-3.5 text-primary" />
                    <span>Styling & Spacing Blok (Kustom Jarak & Tampilan)</span>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10.5px] text-muted-foreground hover:text-foreground gap-1"
                    onClick={onReset}
                    title="Reset ke pengaturan bawaan dokumen"
                >
                    <RotateCcw className="size-3" />
                    <span>Reset</span>
                </Button>
            </div>

            {/* 1. Spacing Controls (Margin & Padding) */}
            <div className="space-y-3">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <MoveVertical className="size-3 text-emerald-500" />
                    <span>Jarak Spacing (Margin & Padding)</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {/* Margin Top */}
                    <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Margin Atas</Label>
                        <div className="flex items-center gap-1">
                            <Input
                                type="number"
                                min={0}
                                max={80}
                                step={2}
                                className="h-7 text-xs px-1.5 text-center"
                                value={styles.marginTopPx ?? 0}
                                onChange={(e) => update({ marginTopPx: Number(e.target.value) || 0 })}
                            />
                            <span className="text-[10px] text-muted-foreground">px</span>
                        </div>
                    </div>

                    {/* Margin Bottom */}
                    <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Margin Bawah</Label>
                        <div className="flex items-center gap-1">
                            <Input
                                type="number"
                                min={0}
                                max={80}
                                step={2}
                                className="h-7 text-xs px-1.5 text-center"
                                value={styles.marginBottomPx ?? 16}
                                onChange={(e) => update({ marginBottomPx: Number(e.target.value) || 0 })}
                            />
                            <span className="text-[10px] text-muted-foreground">px</span>
                        </div>
                    </div>

                    {/* Padding Vertikal */}
                    <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Padding Atas/Bawah</Label>
                        <div className="flex items-center gap-1">
                            <Input
                                type="number"
                                min={0}
                                max={48}
                                step={2}
                                className="h-7 text-xs px-1.5 text-center"
                                value={styles.paddingTopPx ?? 0}
                                onChange={(e) => {
                                    const val = Number(e.target.value) || 0;
                                    update({ paddingTopPx: val, paddingBottomPx: val });
                                }}
                            />
                            <span className="text-[10px] text-muted-foreground">px</span>
                        </div>
                    </div>

                    {/* Padding Horizontal */}
                    <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Padding Kiri/Kanan</Label>
                        <div className="flex items-center gap-1">
                            <Input
                                type="number"
                                min={0}
                                max={48}
                                step={2}
                                className="h-7 text-xs px-1.5 text-center"
                                value={styles.paddingLeftPx ?? 0}
                                onChange={(e) => {
                                    const val = Number(e.target.value) || 0;
                                    update({ paddingLeftPx: val, paddingRightPx: val });
                                }}
                            />
                            <span className="text-[10px] text-muted-foreground">px</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Background Color */}
            <div className="space-y-2 pt-2 border-t border-border/60">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                        <Palette className="size-3 text-sky-500" />
                        <span>Warna Latar (Background Box)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-muted-foreground">Kustom:</span>
                        <input
                            type="color"
                            className="h-6 w-8 rounded border border-input cursor-pointer bg-background p-0.5"
                            value={currentBg.startsWith('#') ? currentBg : '#ffffff'}
                            onChange={(e) => update({ backgroundColor: e.target.value })}
                            title="Pilih warna kustom"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                    {BG_PRESETS.map((preset) => {
                        const isSelected = currentBg.toLowerCase() === preset.value.toLowerCase();
                        return (
                            <button
                                key={preset.value}
                                type="button"
                                onClick={() => update({ backgroundColor: preset.value })}
                                className={`px-2 py-1 rounded-md text-[10.5px] border flex items-center gap-1.5 transition-all ${
                                    isSelected
                                        ? 'ring-2 ring-primary border-primary font-bold shadow-xs'
                                        : 'border-border/80 hover:bg-muted'
                                }`}
                            >
                                <span className={`size-3 rounded-full border ${preset.classBg}`} />
                                <span className="text-foreground">{preset.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 3. Border & Rounded Corner */}
            <div className="space-y-2 pt-2 border-t border-border/60">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <Shield className="size-3 text-amber-500" />
                    <span>Garis Tepi & Sudut Melengkung (Border & Radius)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Border Style */}
                    <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Jenis Border</Label>
                        <select
                            className="h-7 w-full text-xs rounded border border-input bg-background px-2 py-0 text-foreground"
                            value={currentBorderStyle}
                            onChange={(e) => {
                                const style = e.target.value as 'none' | 'solid' | 'dashed' | 'dotted';
                                update({
                                    borderStyle: style,
                                    borderWidthPx: style !== 'none' && currentBorderWidth === 0 ? 1 : currentBorderWidth,
                                });
                            }}
                        >
                            <option value="none">Tanpa Border</option>
                            <option value="solid">Garis Lurus (Solid)</option>
                            <option value="dashed">Garis Putus (Dashed)</option>
                            <option value="dotted">Garis Titik (Dotted)</option>
                        </select>
                    </div>

                    {/* Border Thickness & Color */}
                    <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Tebal & Warna Garis</Label>
                        <div className="flex items-center gap-1">
                            <Input
                                type="number"
                                min={0}
                                max={6}
                                className="h-7 w-14 text-xs px-1 text-center"
                                value={currentBorderWidth}
                                onChange={(e) => update({ borderWidthPx: Number(e.target.value) || 0 })}
                            />
                            <span className="text-[10px] text-muted-foreground">px</span>
                            <input
                                type="color"
                                className="h-7 w-8 rounded border border-input cursor-pointer bg-background p-0.5 ml-auto"
                                value={currentBorderColor}
                                onChange={(e) => update({ borderColor: e.target.value })}
                                title="Warna border"
                            />
                        </div>
                    </div>

                    {/* Border Radius */}
                    <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Kelengkungan Sudut</Label>
                        <div className="flex items-center gap-1">
                            <select
                                className="h-7 w-full text-xs rounded border border-input bg-background px-2 py-0 text-foreground"
                                value={currentRadius}
                                onChange={(e) => update({ borderRadiusPx: Number(e.target.value) || 0 })}
                            >
                                {RADIUS_PRESETS.map((rp) => (
                                    <option key={rp.value} value={rp.value}>
                                        {rp.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
