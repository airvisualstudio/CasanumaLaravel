import { Node, mergeAttributes } from '@tiptap/react';

/**
 * PlaceholderToken — Custom TipTap Node Extension
 *
 * Renders dynamic document tokens (e.g. {{nama_konsumen}}) as styled,
 * non-editable inline badge chips in the TipTap editor.
 *
 * When exported to HTML for PDF rendering, the token is preserved
 * as raw {{token_name}} text for backend replacement.
 */
export const PlaceholderToken = Node.create({
    name: 'placeholderToken',
    group: 'inline',
    inline: true,
    atom: true, // non-editable, treated as single unit
    selectable: true,
    draggable: true,

    addAttributes() {
        return {
            token: {
                default: '',
                parseHTML: (element: HTMLElement) => element.getAttribute('data-token'),
                renderHTML: (attributes: { token: string }) => ({
                    'data-token': attributes.token,
                }),
            },
            label: {
                default: '',
                parseHTML: (element: HTMLElement) => element.getAttribute('data-label'),
                renderHTML: (attributes: { label: string }) => ({
                    'data-label': attributes.label,
                }),
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'span[data-type="placeholder-token"]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        // When rendering to HTML (for PDF export / backend replacement),
        // output the raw {{token}} text inside a styled span
        return [
            'span',
            mergeAttributes(HTMLAttributes, {
                'data-type': 'placeholder-token',
                class: 'placeholder-token-chip',
                contenteditable: 'false',
                style: [
                    'display: inline-flex',
                    'align-items: center',
                    'gap: 3px',
                    'background: linear-gradient(135deg, #ede9fe 0%, #e0e7ff 100%)',
                    'color: #4f46e5',
                    'border: 1px solid #c7d2fe',
                    'border-radius: 6px',
                    'padding: 1px 8px',
                    'font-family: ui-monospace, "Cascadia Code", "Fira Code", monospace',
                    'font-size: 0.85em',
                    'font-weight: 600',
                    'line-height: 1.6',
                    'white-space: nowrap',
                    'user-select: all',
                    'cursor: grab',
                    'vertical-align: baseline',
                    'transition: all 0.15s ease',
                ].join('; '),
            }),
            // Inner content: the raw token text for backend replacement
            HTMLAttributes.token || '',
        ];
    },

    // Custom NodeView for interactive rendering in the editor
    addNodeView() {
        return ({ node }) => {
            const dom = document.createElement('span');
            dom.className = 'placeholder-token-chip';
            dom.setAttribute('data-type', 'placeholder-token');
            dom.setAttribute('data-token', node.attrs.token);
            dom.setAttribute('data-label', node.attrs.label || '');
            dom.contentEditable = 'false';
            dom.draggable = true;

            // Display the clean token name (without {{ }})
            const cleanName = (node.attrs.token || '')
                .replace(/^\{\{/, '')
                .replace(/\}\}$/, '');

            // Build chip content
            const icon = document.createElement('span');
            icon.textContent = '\u26A1';
            icon.style.cssText = 'font-size: 10px; opacity: 0.8;';

            const text = document.createElement('span');
            text.textContent = cleanName;
            text.style.cssText = 'font-size: 0.85em;';

            dom.appendChild(icon);
            dom.appendChild(text);

            // Styling
            dom.style.cssText = [
                'display: inline-flex',
                'align-items: center',
                'gap: 3px',
                'background: linear-gradient(135deg, #ede9fe 0%, #e0e7ff 100%)',
                'color: #4f46e5',
                'border: 1px solid #c7d2fe',
                'border-radius: 6px',
                'padding: 1px 8px',
                'font-family: ui-monospace, "Cascadia Code", "Fira Code", monospace',
                'font-weight: 600',
                'line-height: 1.6',
                'white-space: nowrap',
                'user-select: all',
                'cursor: grab',
                'vertical-align: baseline',
                'transition: all 0.15s ease',
            ].join('; ');

            // Hover effect
            dom.addEventListener('mouseenter', () => {
                dom.style.background = 'linear-gradient(135deg, #ddd6fe 0%, #c7d2fe 100%)';
                dom.style.borderColor = '#818cf8';
                dom.style.transform = 'scale(1.03)';
            });
            dom.addEventListener('mouseleave', () => {
                dom.style.background = 'linear-gradient(135deg, #ede9fe 0%, #e0e7ff 100%)';
                dom.style.borderColor = '#c7d2fe';
                dom.style.transform = 'scale(1)';
            });

            // Title tooltip
            dom.title = `${node.attrs.label || cleanName}\nKlik untuk memilih, Backspace/Del untuk hapus`;

            return { dom };
        };
    },
});

export default PlaceholderToken;
