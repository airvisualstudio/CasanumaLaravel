import React from 'react';
import { Sparkles, X } from 'lucide-react';

interface AtomicVariablePillProps {
    token: string;
    label?: string;
    onDelete?: () => void;
    onClick?: (e: React.MouseEvent) => void;
    size?: 'sm' | 'md';
    draggable?: boolean;
    onDragStart?: (e: React.DragEvent) => void;
}

/**
 * AtomicVariablePill - Single indivisible variable tag
 * - Atomic: acts as one single entity
 * - Non-corruptible: cannot edit characters inside
 * - Draggable: can be dragged into inputs or table cells
 */
export default function AtomicVariablePill({
    token,
    label,
    onDelete,
    onClick,
    size = 'sm',
    draggable = true,
    onDragStart,
}: AtomicVariablePillProps) {
    const displayLabel = label || token.replace(/[{}]/g, '');

    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('text/plain', token);
        e.dataTransfer.effectAllowed = 'copy';
        if (onDragStart) onDragStart(e);
    };

    return (
        <span
            draggable={draggable}
            onDragStart={handleDragStart}
            onClick={onClick}
            className={`inline-flex items-center gap-1 font-mono font-medium rounded-md border select-none transition-all shadow-2xs ${
                draggable ? 'cursor-grab active:cursor-grabbing hover:scale-105' : 'cursor-pointer'
            } ${
                size === 'sm'
                    ? 'text-[10px] px-1.5 py-0.5'
                    : 'text-xs px-2 py-1'
            } bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 hover:border-primary/50`}
            title={`Variabel Dinamis: ${token} (Klik untuk pilih / drag untuk memindahkan)`}
        >
            <Sparkles className={size === 'sm' ? 'size-2.5 opacity-80' : 'size-3 opacity-80'} />
            <span className="truncate max-w-[150px]">{displayLabel}</span>
            {onDelete && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="size-3.5 rounded flex items-center justify-center hover:bg-primary/30 text-primary/70 hover:text-primary transition-colors cursor-pointer"
                >
                    <X className="size-2.5" />
                </button>
            )}
        </span>
    );
}
