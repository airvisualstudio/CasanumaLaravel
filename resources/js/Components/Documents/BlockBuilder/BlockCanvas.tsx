import React, { useState, useRef, useEffect } from 'react';
import { DocumentBlock } from './types';
import BlockCard from './BlockCard';
import QuickInsertDivider from './QuickInsertDivider';
import { Plus, Layers, AlertTriangle, CheckCircle2, FileText } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';

interface BlockCanvasProps {
    blocks: DocumentBlock[];
    paperHeightMm?: number;
    marginTopMm?: number;
    marginBottomMm?: number;
    availableTokens?: Record<string, { label: string; tokens: any[] }>;
    onBlocksChange: (blocks: DocumentBlock[]) => void;
    onOpenPalette: () => void;
}

export default function BlockCanvas({
    blocks,
    paperHeightMm = 297,
    marginTopMm = 20,
    marginBottomMm = 20,
    availableTokens,
    onBlocksChange,
    onOpenPalette,
}: BlockCanvasProps) {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const [estimatedPages, setEstimatedPages] = useState<number>(1);
    const [contentHeightPx, setContentHeightPx] = useState<number>(0);

    // Standard A4 printable height in pixels (96 DPI: 1 mm ≈ 3.7795 px)
    // Printable height = paperHeight - margins
    const printableHeightMm = Math.max(100, paperHeightMm - marginTopMm - marginBottomMm);
    const printableHeightPx = Math.round(printableHeightMm * 3.7795);

    // Calculate dynamic page estimate via ResizeObserver
    useEffect(() => {
        if (!canvasContainerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const height = entry.contentRect.height;
                setContentHeightPx(height);
                const pages = Math.max(1, Math.ceil(height / (printableHeightPx || 900)));
                setEstimatedPages(pages);
            }
        });

        observer.observe(canvasContainerRef.current);
        return () => observer.disconnect();
    }, [printableHeightPx, blocks]);

    // Insert block at specific index (used by QuickInsertDivider)
    const handleInsertBlockAt = (newBlock: DocumentBlock, index: number) => {
        const next = [...blocks];
        next.splice(index, 0, newBlock);
        onBlocksChange(next);
    };

    // Update single block
    const handleUpdateBlock = (index: number, updated: DocumentBlock) => {
        const next = [...blocks];
        next[index] = updated;
        onBlocksChange(next);
    };

    // Delete single block
    const handleDeleteBlock = (index: number) => {
        const next = blocks.filter((_, i) => i !== index);
        onBlocksChange(next);
    };

    // Duplicate single block
    const handleDuplicateBlock = (index: number) => {
        const target = blocks[index];
        const clone: DocumentBlock = {
            ...JSON.parse(JSON.stringify(target)),
            id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            title: `${target.title} (Salinan)`,
        };
        const next = [...blocks];
        next.splice(index + 1, 0, clone);
        onBlocksChange(next);
    };

    // Move Up
    const handleMoveUp = (index: number) => {
        if (index <= 0) return;
        const next = [...blocks];
        const temp = next[index - 1];
        next[index - 1] = next[index];
        next[index] = temp;
        onBlocksChange(next);
    };

    // Move Down
    const handleMoveDown = (index: number) => {
        if (index >= blocks.length - 1) return;
        const next = [...blocks];
        const temp = next[index + 1];
        next[index + 1] = next[index];
        next[index] = temp;
        onBlocksChange(next);
    };

    // HTML5 Drag and Drop Handlers
    const handleDragStart = (index: number) => (e: React.DragEvent) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        try {
            e.dataTransfer.setData('text/plain', String(index));
        } catch (err) {}
    };

    const handleDragOver = (index: number) => (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (index: number) => (e: React.DragEvent) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) {
            setDraggedIndex(null);
            return;
        }

        const next = [...blocks];
        const [movedItem] = next.splice(draggedIndex, 1);
        next.splice(index, 0, movedItem);
        setDraggedIndex(null);
        onBlocksChange(next);
    };

    return (
        <div className="space-y-3">
            {/* Header: Page Length & Fit Indicator Badge */}
            {blocks.length > 0 && (
                <div className="flex items-center justify-between px-2 py-1.5 bg-muted/40 rounded-xl border border-border/60 text-xs">
                    <div className="flex items-center gap-2">
                        <FileText className="size-3.5 text-primary" />
                        <span className="font-semibold text-foreground text-[11px]">
                            Struktur Blok Dokumen ({blocks.length} Elemen)
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {estimatedPages === 1 ? (
                            <Badge variant="outline" className="h-5 text-[10px] gap-1 border-emerald-500/30 text-emerald-600 bg-emerald-500/10 font-medium">
                                <CheckCircle2 className="size-3" />
                                <span>Pas 1 Halaman Cetak</span>
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="h-5 text-[10px] gap-1 border-amber-500/30 text-amber-600 bg-amber-500/10 font-medium">
                                <AlertTriangle className="size-3" />
                                <span>Estimasi {estimatedPages} Halaman Cetak</span>
                            </Badge>
                        )}
                    </div>
                </div>
            )}

            {blocks.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-border/80 rounded-2xl p-6 bg-muted/10 flex flex-col items-center justify-center gap-3">
                    <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                        <Layers className="size-6" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-foreground">Kanvas Dokumen Masih Kosong</h4>
                        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                            Mulai tambahkan blok komponen seperti Kop Surat, Dossier Konsumen, Rincian Biaya, atau Tanda Tangan dari palet samping.
                        </p>
                    </div>
                    <Button
                        type="button"
                        onClick={onOpenPalette}
                        className="mt-2 h-9 text-xs gap-1.5 rounded-xl bg-primary text-primary-foreground font-semibold"
                    >
                        <Plus className="size-3.5" />
                        <span>Buka Palet Blok</span>
                    </Button>
                </div>
            ) : (
                <div ref={canvasContainerRef} className="relative space-y-1">
                    {/* Quick Insert divider before the first block */}
                    <QuickInsertDivider
                        atIndex={0}
                        onInsert={(b) => handleInsertBlockAt(b, 0)}
                    />

                    {blocks.map((block, idx) => (
                        <React.Fragment key={block.id}>
                            <BlockCard
                                block={block}
                                index={idx}
                                totalBlocks={blocks.length}
                                availableTokens={availableTokens}
                                onUpdate={(updated) => handleUpdateBlock(idx, updated)}
                                onDelete={() => handleDeleteBlock(idx)}
                                onDuplicate={() => handleDuplicateBlock(idx)}
                                onMoveUp={() => handleMoveUp(idx)}
                                onMoveDown={() => handleMoveDown(idx)}
                                onDragStart={handleDragStart(idx)}
                                onDragOver={handleDragOver(idx)}
                                onDrop={handleDrop(idx)}
                            />

                            {/* Quick Insert Divider between blocks */}
                            <QuickInsertDivider
                                atIndex={idx + 1}
                                onInsert={(b) => handleInsertBlockAt(b, idx + 1)}
                            />
                        </React.Fragment>
                    ))}

                    {/* Add block trigger at bottom */}
                    <div className="pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onOpenPalette}
                            className="w-full h-10 border-dashed border-border/80 hover:border-primary/60 hover:bg-primary/5 text-muted-foreground hover:text-primary rounded-xl text-xs gap-2 transition-all cursor-pointer"
                        >
                            <Plus className="size-3.5" />
                            <span>Tambah Blok Komponen di Akhir</span>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
