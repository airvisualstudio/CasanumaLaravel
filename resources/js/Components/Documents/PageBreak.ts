import { Node } from '@tiptap/react';

/**
 * PageBreak — Custom TipTap Node Extension
 *
 * Inserts a visual page break separator in the editor.
 * When exported to HTML for PDF rendering, outputs a
 * `page-break-before: always` div.
 */
export const PageBreak = Node.create({
    name: 'pageBreak',
    group: 'block',
    atom: true,
    selectable: true,
    draggable: false,

    parseHTML() {
        return [
            {
                tag: 'div[data-type="page-break"]',
            },
        ];
    },

    renderHTML() {
        return [
            'div',
            {
                'data-type': 'page-break',
                style: 'page-break-before: always; break-before: page;',
            },
        ];
    },

    addNodeView() {
        return () => {
            const dom = document.createElement('div');
            dom.setAttribute('data-type', 'page-break');
            dom.contentEditable = 'false';
            dom.style.cssText = [
                'position: relative',
                'margin: 24px 0',
                'padding: 0',
                'height: 0',
                'border: none',
                'border-top: 2px dashed #94a3b8',
                'cursor: pointer',
                'user-select: none',
            ].join('; ');

            // Label
            const label = document.createElement('span');
            label.textContent = '\u2702 Batas Halaman Baru';
            label.style.cssText = [
                'position: absolute',
                'left: 50%',
                'top: -10px',
                'transform: translateX(-50%)',
                'background: #f1f5f9',
                'color: #64748b',
                'font-size: 10px',
                'font-weight: 600',
                'padding: 2px 12px',
                'border-radius: 9999px',
                'border: 1px solid #cbd5e1',
                'white-space: nowrap',
                'letter-spacing: 0.5px',
                'text-transform: uppercase',
                'font-family: ui-sans-serif, system-ui, sans-serif',
            ].join('; ');

            dom.appendChild(label);

            // Hover
            dom.addEventListener('mouseenter', () => {
                dom.style.borderTopColor = '#6366f1';
                label.style.borderColor = '#818cf8';
                label.style.color = '#4f46e5';
                label.style.background = '#eef2ff';
            });
            dom.addEventListener('mouseleave', () => {
                dom.style.borderTopColor = '#94a3b8';
                label.style.borderColor = '#cbd5e1';
                label.style.color = '#64748b';
                label.style.background = '#f1f5f9';
            });

            dom.title = 'Batas halaman baru \u2014 klik lalu Del/Backspace untuk menghapus';

            return { dom };
        };
    },

    addCommands() {
        return {
            insertPageBreak: () => ({ chain }: { chain: any }) => {
                return chain()
                    .insertContent({ type: this.name })
                    .run();
            },
        };
    },

    addKeyboardShortcuts() {
        return {
            'Mod-Enter': () => (this.editor as any).commands.insertPageBreak(),
        };
    },
});

export default PageBreak;
