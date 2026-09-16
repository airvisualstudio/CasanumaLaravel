import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { NodeSelection } from '@tiptap/pm/state';
import {
    GripVertical,
    Plus,
    Trash2,
    Copy,
    ArrowUp,
    ArrowDown,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';

interface EditorDragHandleProps {
    editor: Editor | null;
    containerRef: React.RefObject<HTMLDivElement | null>;
}

export default function EditorDragHandle({ editor, containerRef }: EditorDragHandleProps) {
    const [hoveredBlock, setHoveredBlock] = useState<HTMLElement | null>(null);
    const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const hideTimeoutRef = useRef<number | null>(null);
    const handleRef = useRef<HTMLDivElement | null>(null);

    // Track mouse movement to locate top-level blocks inside the editor
    useEffect(() => {
        if (!editor) return;

        const container = containerRef.current;
        if (!container) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (!editor.isEditable || isDragging || menuOpen) return;

            const target = e.target as HTMLElement | null;
            if (!target) return;

            // If mouse is directly over the drag handle or its menu, keep it visible
            if (handleRef.current && handleRef.current.contains(target)) {
                if (hideTimeoutRef.current) {
                    window.clearTimeout(hideTimeoutRef.current);
                    hideTimeoutRef.current = null;
                }
                return;
            }

            const editorDom = editor.view.dom;
            if (!editorDom.contains(target)) {
                if (!hideTimeoutRef.current && isVisible) {
                    hideTimeoutRef.current = window.setTimeout(() => {
                        setIsVisible(false);
                        hideTimeoutRef.current = null;
                    }, 300);
                }
                return;
            }

            // Find top-level child of .tiptap
            let block: HTMLElement | null = target;
            while (block && block.parentElement !== editorDom) {
                block = block.parentElement;
            }

            if (!block) {
                if (!hideTimeoutRef.current && isVisible) {
                    hideTimeoutRef.current = window.setTimeout(() => {
                        setIsVisible(false);
                        hideTimeoutRef.current = null;
                    }, 300);
                }
                return;
            }

            if (hideTimeoutRef.current) {
                window.clearTimeout(hideTimeoutRef.current);
                hideTimeoutRef.current = null;
            }

            const containerRect = container.getBoundingClientRect();
            const blockRect = block.getBoundingClientRect();

            // Calculate handle coordinates relative to container
            const top = blockRect.top - containerRect.top + Math.min(Math.max((blockRect.height - 24) / 2, 2), 10);
            const left = blockRect.left - containerRect.left - 30;

            setHoveredBlock(block);
            setPosition({ top, left });
            setIsVisible(true);
        };

        const handleMouseLeave = () => {
            if (isDragging || menuOpen) return;
            if (!hideTimeoutRef.current) {
                hideTimeoutRef.current = window.setTimeout(() => {
                    setIsVisible(false);
                    hideTimeoutRef.current = null;
                }, 350);
            }
        };

        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseleave', handleMouseLeave);
            if (hideTimeoutRef.current) window.clearTimeout(hideTimeoutRef.current);
        };
    }, [editor, containerRef, isDragging, menuOpen, isVisible]);

    // Select the hovered block in ProseMirror
    const selectCurrentBlock = (): number | null => {
        if (!editor || !hoveredBlock) return null;
        try {
            const pos = editor.view.posAtDOM(hoveredBlock, 0);
            const $pos = editor.view.state.doc.resolve(pos);
            const blockPos = $pos.before(1);
            const tr = editor.view.state.tr.setSelection(
                NodeSelection.create(editor.view.state.doc, blockPos)
            );
            editor.view.dispatch(tr);
            editor.view.focus();
            return blockPos;
        } catch (e) {
            console.warn('Unable to select block', e);
            return null;
        }
    };

    // Drag-and-drop handlers
    const handleDragStart = (e: React.DragEvent) => {
        if (!editor || !hoveredBlock) return;
        setIsDragging(true);

        const blockPos = selectCurrentBlock();
        if (blockPos === null) return;

        try {
            const selection = editor.view.state.selection;
            const slice = selection.content();

            // Register ProseMirror's dragging state to activate native dropCursor
            (editor.view as any).dragging = { slice, move: true };

            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', hoveredBlock.outerHTML);
            e.dataTransfer.setData('text/plain', hoveredBlock.innerText || '');

            // Custom semi-transparent drag preview
            const ghost = hoveredBlock.cloneNode(true) as HTMLElement;
            ghost.style.position = 'absolute';
            ghost.style.top = '-9999px';
            ghost.style.left = '-9999px';
            ghost.style.width = `${Math.min(hoveredBlock.offsetWidth, 500)}px`;
            ghost.style.opacity = '0.85';
            ghost.style.backgroundColor = '#ffffff';
            ghost.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.18)';
            ghost.style.borderRadius = '8px';
            ghost.style.padding = '8px';
            ghost.style.pointerEvents = 'none';
            ghost.style.zIndex = '99999';
            document.body.appendChild(ghost);

            if (e.dataTransfer.setDragImage) {
                e.dataTransfer.setDragImage(ghost, 20, 20);
            }

            setTimeout(() => {
                if (document.body.contains(ghost)) {
                    document.body.removeChild(ghost);
                }
            }, 0);
        } catch (err) {
            console.error('Drag start error:', err);
        }
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        if (editor) {
            (editor.view as any).dragging = null;
        }
    };

    // Quick Action: Insert empty paragraph below
    const handleInsertParagraphBelow = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!editor || !hoveredBlock) return;
        try {
            const pos = editor.view.posAtDOM(hoveredBlock, 0);
            const $pos = editor.view.state.doc.resolve(pos);
            const afterPos = $pos.after(1);
            editor
                .chain()
                .insertContentAt(afterPos, { type: 'paragraph' })
                .setTextSelection(afterPos + 1)
                .focus()
                .run();
        } catch (err) {
            console.warn('Insert below error', err);
        }
    };

    // Quick Action: Delete block
    const handleDeleteBlock = () => {
        if (!editor || !hoveredBlock) return;
        const blockPos = selectCurrentBlock();
        if (blockPos === null) return;
        editor.chain().focus().deleteSelection().run();
        setIsVisible(false);
    };

    // Quick Action: Duplicate block
    const handleDuplicateBlock = () => {
        if (!editor || !hoveredBlock) return;
        try {
            const pos = editor.view.posAtDOM(hoveredBlock, 0);
            const $pos = editor.view.state.doc.resolve(pos);
            const node = $pos.node(1);
            const afterPos = $pos.after(1);
            if (node) {
                editor
                    .chain()
                    .insertContentAt(afterPos, node.toJSON())
                    .setTextSelection(afterPos + 1)
                    .focus()
                    .run();
            }
        } catch (err) {
            console.warn('Duplicate error', err);
        }
    };

    // Quick Action: Move block up
    const handleMoveBlockUp = () => {
        if (!editor || !hoveredBlock) return;
        try {
            const pos = editor.view.posAtDOM(hoveredBlock, 0);
            const $pos = editor.view.state.doc.resolve(pos);
            const index = $pos.index(0);
            if (index <= 0) return; // Already at the top

            const currentPos = $pos.before(1);
            const node = $pos.node(1);
            const prevNode = editor.state.doc.child(index - 1);
            const targetPos = currentPos - prevNode.nodeSize;

            editor
                .chain()
                .deleteRange({ from: currentPos, to: currentPos + node.nodeSize })
                .insertContentAt(targetPos, node.toJSON())
                .focus()
                .run();
        } catch (err) {
            console.warn('Move up error', err);
        }
    };

    // Quick Action: Move block down
    const handleMoveBlockDown = () => {
        if (!editor || !hoveredBlock) return;
        try {
            const pos = editor.view.posAtDOM(hoveredBlock, 0);
            const $pos = editor.view.state.doc.resolve(pos);
            const index = $pos.index(0);
            if (index >= editor.state.doc.childCount - 1) return; // Already at the bottom

            const currentPos = $pos.before(1);
            const node = $pos.node(1);
            const nextNode = editor.state.doc.child(index + 1);
            const targetPos = currentPos + nextNode.nodeSize;

            editor
                .chain()
                .deleteRange({ from: currentPos, to: currentPos + node.nodeSize })
                .insertContentAt(targetPos, node.toJSON())
                .focus()
                .run();
        } catch (err) {
            console.warn('Move down error', err);
        }
    };

    if (!isVisible || !position) return null;

    return (
        <div
            ref={handleRef}
            style={{
                position: 'absolute',
                top: `${position.top}px`,
                left: `${position.left}px`,
                zIndex: 50,
            }}
            className="flex items-center gap-0.5 select-none print:hidden transition-opacity duration-150"
            onMouseEnter={() => {
                if (hideTimeoutRef.current) {
                    window.clearTimeout(hideTimeoutRef.current);
                    hideTimeoutRef.current = null;
                }
                setIsVisible(true);
            }}
        >
            {/* Quick Add Button (+) */}
            <button
                type="button"
                onClick={handleInsertParagraphBelow}
                className="size-5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors shadow-2xs border border-transparent hover:border-slate-200 bg-white/90"
                title="Sisipkan baris baru di bawah"
            >
                <Plus className="size-3" />
            </button>

            {/* Drag Handle (⋮⋮) with Context Menu */}
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger asChild>
                    <div
                        draggable={true}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onClick={(e) => {
                            selectCurrentBlock();
                        }}
                        className={`size-5 rounded-md flex items-center justify-center cursor-grab active:cursor-grabbing transition-all shadow-2xs border bg-white/95 ${
                            menuOpen || isDragging
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700 border-slate-200/80'
                        }`}
                        title="Tarik untuk memindahkan blok, atau klik untuk opsi"
                    >
                        <GripVertical className="size-3.5" />
                    </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start" side="left" className="w-48 rounded-xl shadow-lg border-border">
                    <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Opsi Blok Dokumen
                    </div>
                    <DropdownMenuItem
                        onClick={handleDuplicateBlock}
                        className="text-xs gap-2 rounded-lg cursor-pointer"
                    >
                        <Copy className="size-3.5 text-muted-foreground" />
                        <span>Duplikat Blok</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={handleMoveBlockUp}
                        className="text-xs gap-2 rounded-lg cursor-pointer"
                    >
                        <ArrowUp className="size-3.5 text-muted-foreground" />
                        <span>Geser ke Atas</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={handleMoveBlockDown}
                        className="text-xs gap-2 rounded-lg cursor-pointer"
                    >
                        <ArrowDown className="size-3.5 text-muted-foreground" />
                        <span>Geser ke Bawah</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={handleDeleteBlock}
                        className="text-xs gap-2 rounded-lg text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/40 cursor-pointer"
                    >
                        <Trash2 className="size-3.5" />
                        <span>Hapus Blok</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
