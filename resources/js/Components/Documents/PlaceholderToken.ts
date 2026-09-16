import { Node, mergeAttributes, InputRule, PasteRule } from '@tiptap/react';
import { NodeSelection } from '@tiptap/pm/state';

/**
 * PlaceholderToken — Custom TipTap Atomic Inline Node
 *
 * Renders dynamic template variables (e.g. {{nama_konsumen}}, {{booking_fee}})
 * as modern Notion/Word-style atomic pills.
 *
 * - Non-editable inside (contentEditable = 'false') so variable names are never corrupted.
 * - Atomic: clicking selects the whole pill, Backspace/Delete deletes the entire token.
 * - Category-aware pill styling (Konsumen, Unit/Kavling, Booking/Keuangan, Kwitansi).
 * - InputRule: Typing {{variable_name}} automatically converts to an atomic pill.
 * - PasteRule: Pasting text containing {{variable_name}} automatically parses as pills.
 */
export const PlaceholderToken = Node.create({
    name: 'placeholderToken',
    group: 'inline',
    inline: true,
    atom: true, // Atomic node: treated as single indivisible unit
    selectable: true,
    draggable: true,

    addAttributes() {
        return {
            token: {
                default: '',
                parseHTML: (element: HTMLElement) => element.getAttribute('data-token') || element.textContent || '',
                renderHTML: (attributes: { token: string }) => ({
                    'data-token': attributes.token,
                }),
            },
            label: {
                default: '',
                parseHTML: (element: HTMLElement) => element.getAttribute('data-label') || '',
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
                getAttrs: (element: HTMLElement) => ({
                    token: element.getAttribute('data-token') || element.textContent?.trim() || '',
                    label: element.getAttribute('data-label') || '',
                }),
            },
            {
                tag: 'span.placeholder-token-chip',
                getAttrs: (element: HTMLElement) => ({
                    token: element.getAttribute('data-token') || element.textContent?.trim() || '',
                    label: element.getAttribute('data-label') || '',
                }),
            },
            {
                tag: 'span[data-token]',
                getAttrs: (element: HTMLElement) => ({
                    token: element.getAttribute('data-token') || element.textContent?.trim() || '',
                    label: element.getAttribute('data-label') || '',
                }),
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'span',
            mergeAttributes(HTMLAttributes, {
                'data-type': 'placeholder-token',
                class: 'placeholder-token-chip',
            }),
            HTMLAttributes.token || '',
        ];
    },

    // Auto-convert typed {{tag_name}} into an atomic pill as soon as closing }} is typed
    addInputRules() {
        return [
            new InputRule({
                find: /\{\{([a-zA-Z0-9_]+)\}\}$/,
                handler: ({ state, range, match }) => {
                    const { tr } = state;
                    const token = `{{${match[1]}}}`;
                    tr.replaceWith(
                        range.from,
                        range.to,
                        this.type.create({ token, label: match[1] })
                    );
                },
            }),
        ];
    },

    // Auto-convert pasted {{tag_name}} into atomic pills
    addPasteRules() {
        return [
            new PasteRule({
                find: /\{\{([a-zA-Z0-9_]+)\}\}/g,
                handler: ({ state, range, match }) => {
                    const { tr } = state;
                    const token = `{{${match[1]}}}`;
                    tr.replaceWith(
                        range.from,
                        range.to,
                        this.type.create({ token, label: match[1] })
                    );
                },
            }),
        ];
    },

    // Interactive Atomic NodeView
    addNodeView() {
        return ({ node, getPos, editor }) => {
            const dom = document.createElement('span');
            dom.className = 'placeholder-token-chip';
            dom.setAttribute('data-type', 'placeholder-token');
            dom.setAttribute('data-token', node.attrs.token);
            dom.setAttribute('data-label', node.attrs.label || '');
            dom.contentEditable = 'false';
            dom.draggable = true;

            const tokenString = node.attrs.token || '';
            const cleanKey = tokenString.replace(/^\{\{/, '').replace(/\}\}$/, '');

            // Color palette based on token category
            let bgGradient = 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)';
            let textColor = '#1d4ed8';
            let borderColor = '#bfdbfe';
            let badgeCategory = 'KONSUMEN';

            if (cleanKey.includes('kavling') || cleanKey.includes('unit') || cleanKey.includes('proyek') || cleanKey.includes('luas') || cleanKey.includes('tipe') || cleanKey.includes('cluster')) {
                bgGradient = 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)';
                textColor = '#047857';
                borderColor = '#a7f3d0';
                badgeCategory = 'UNIT/PROPERTI';
            } else if (cleanKey.includes('booking') || cleanKey.includes('bayar') || cleanKey.includes('harga') || cleanKey.includes('nominal') || cleanKey.includes('dp') || cleanKey.includes('terbilang')) {
                bgGradient = 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)';
                textColor = '#7e22ce';
                borderColor = '#e9d5ff';
                badgeCategory = 'FINANSIAL';
            } else if (cleanKey.includes('kwitansi') || cleanKey.includes('spr') || cleanKey.includes('rekening') || cleanKey.includes('bank')) {
                bgGradient = 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)';
                textColor = '#b45309';
                borderColor = '#fde68a';
                badgeCategory = 'TRANSAKSI';
            } else if (cleanKey.includes('manager') || cleanKey.includes('sales') || cleanKey.includes('notaris') || cleanKey.includes('ppat')) {
                bgGradient = 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)';
                textColor = '#15803d';
                borderColor = '#bbf7d0';
                badgeCategory = 'LEGAL/SDM';
            }

            // Left icon pill ({ })
            const iconBadge = document.createElement('span');
            iconBadge.textContent = '{ }';
            iconBadge.style.cssText = [
                'display: inline-flex',
                'align-items: center',
                'justify-content: center',
                'font-size: 8px',
                'font-weight: 800',
                'font-family: ui-monospace, monospace',
                'opacity: 0.7',
                'background: rgba(255, 255, 255, 0.6)',
                'padding: 1px 3px',
                'border-radius: 3px',
            ].join('; ');

            // Variable text
            const labelText = document.createElement('span');
            labelText.textContent = cleanKey;
            labelText.style.cssText = [
                'font-family: ui-monospace, "Cascadia Code", "Fira Code", monospace',
                'font-size: 0.85em',
                'font-weight: 600',
                'letter-spacing: -0.02em',
                'white-space: nowrap',
            ].join('; ');

            dom.appendChild(iconBadge);
            dom.appendChild(labelText);

            // Base pill styles
            const updateStyles = (isSelected: boolean) => {
                dom.style.cssText = [
                    'display: inline-flex',
                    'align-items: center',
                    'gap: 4px',
                    `background: ${bgGradient}`,
                    `color: ${textColor}`,
                    `border: 1px solid ${isSelected ? '#3b82f6' : borderColor}`,
                    'border-radius: 6px',
                    'padding: 1px 7px',
                    'margin: 0 1.5px',
                    'line-height: 1.5',
                    'white-space: nowrap',
                    'user-select: none',
                    'cursor: pointer',
                    'vertical-align: baseline',
                    'transition: all 0.15s ease-in-out',
                    isSelected ? 'outline: 2px solid #3b82f6; outline-offset: 1px; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25); transform: translateY(-0.5px);' : '',
                ].join('; ');
            };

            updateStyles(false);

            // Hover styling
            dom.addEventListener('mouseenter', () => {
                if (!dom.classList.contains('ProseMirror-selectednode')) {
                    dom.style.transform = 'translateY(-1px)';
                    dom.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.08)';
                    dom.style.borderColor = textColor;
                }
            });

            dom.addEventListener('mouseleave', () => {
                if (!dom.classList.contains('ProseMirror-selectednode')) {
                    dom.style.transform = 'translateY(0)';
                    dom.style.boxShadow = 'none';
                    dom.style.borderColor = borderColor;
                }
            });

            // Single click selects the entire atomic node in ProseMirror
            dom.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (typeof getPos === 'function') {
                    const pos = getPos();
                    if (typeof pos === 'number') {
                        const tr = editor.state.tr.setSelection(
                            NodeSelection.create(editor.state.doc, pos)
                        );
                        editor.view.dispatch(tr);
                        editor.view.focus();
                    }
                }
            });

            // Tooltip info
            dom.title = `[Variabel ${badgeCategory}]\nTag: ${tokenString}\n(Klik untuk memilih utuh, tekan Backspace/Delete untuk hapus)`;

            return {
                dom,
                selectNode: () => {
                    dom.classList.add('ProseMirror-selectednode');
                    updateStyles(true);
                },
                deselectNode: () => {
                    dom.classList.remove('ProseMirror-selectednode');
                    updateStyles(false);
                },
            };
        };
    },
});

export default PlaceholderToken;
