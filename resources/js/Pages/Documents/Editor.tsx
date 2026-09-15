import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import React, { useState, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import {
    FileText,
    ArrowLeft,
    Save,
    Printer,
    Eye,
    Sliders,
    ZoomIn,
    ZoomOut,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Bold as BoldIcon,
    Italic as ItalicIcon,
    Underline as UnderlineIcon,
    Strikethrough,
    List,
    ListOrdered,
    Table as TableIcon,
    PenTool,
    Sparkles,
    Trash2,
    Upload,
    Undo2,
    Redo2,
    Search,
    Copy,
    Check,
    GripVertical,
    Layers,
    Plus,
    Minus,
    CheckCircle2,
    FileSpreadsheet,
    Building2,
    QrCode as QrIcon,
    User,
    CreditCard,
    Home,
    Calendar,
    ChevronDown,
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Badge } from '@/Components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Checkbox } from '@/Components/ui/checkbox';
import { ScrollArea } from '@/Components/ui/scroll-area';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import PaperCanvas from '@/Components/Documents/PaperCanvas';
import { TokenItem } from '@/Components/Documents/VariablePicker';
import { toast } from 'sonner';
import { PageProps } from '@/types';

interface BookingOption {
    id: number;
    booking_code: string;
    lead?: { name: string };
    unit?: { unit_code: string };
}

interface TemplateData {
    id?: number;
    name: string;
    category: 'receipt' | 'spr' | 'ppjb' | 'bast' | 'official_letter' | 'custom';
    description?: string;
    paper_size: 'a4' | 'f4' | 'letter' | 'legal' | 'custom';
    custom_width_mm?: number;
    custom_height_mm?: number;
    orientation: 'portrait' | 'landscape';
    margin_top_mm: number;
    margin_bottom_mm: number;
    margin_left_mm: number;
    margin_right_mm: number;
    letterhead_mode: 'default_company' | 'custom_builder' | 'custom_image' | 'none';
    letterhead_title?: string;
    letterhead_subtitle?: string;
    letterhead_address?: string;
    letterhead_contact?: string;
    letterhead_logo_url?: string;
    letterhead_image_url?: string;
    content_html: string;
    footer_text?: string;
    is_default: boolean;
}

interface EditorProps {
    template?: TemplateData | null;
    availableTokens: Record<string, { label: string; tokens: TokenItem[] }>;
    sampleDictionary: Record<string, string>;
    paperSizes: Record<string, { name: string; width: number; height: number; desc: string }>;
    recentBookings: BookingOption[];
}

const DEFAULT_DOCUMENT_HTML = `
<h2>SURAT PESANAN RUMAH (SPR)</h2>
<p>Nomor: <strong>{{nomor_spr}}</strong></p>
<p>Pada hari ini, <strong>{{tanggal_transaksi}}</strong>, telah disepakati pemesanan unit properti dengan rincian sebagai berikut:</p>

<table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
    <thead>
        <tr style="background-color: #f1f5f9;">
            <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-size: 11px;">Keterangan Rincian</th>
            <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: right; font-size: 11px;">Data / Keterangan</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 8px; font-size: 11px;">Nama Pemesan / Konsumen</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: right; font-weight: bold; font-size: 11px;">{{nama_konsumen}}</td>
        </tr>
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 8px; font-size: 11px;">Nomor KTP / NIK</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: right; font-size: 11px;">{{nik_konsumen}}</td>
        </tr>
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 8px; font-size: 11px;">Unit & Kavling</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: right; font-weight: bold; font-size: 11px;">{{nomor_kavling}} - {{nama_proyek}}</td>
        </tr>
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 8px; font-size: 11px;">Tipe Bangunan / Luas</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: right; font-size: 11px;">{{tipe_unit}} (LT {{luas_tanah}} / LB {{luas_bangunan}})</td>
        </tr>
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 8px; font-size: 11px;">Total Nilai Transaksi</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: right; font-weight: bold; font-size: 11px;">{{harga_total}}</td>
        </tr>
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 8px; font-size: 11px;">Terbilang</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: right; font-style: italic; font-size: 11px;">{{nominal_terbilang}}</td>
        </tr>
    </tbody>
</table>

<p>Demikian surat pesanan ini dibuat dengan sebenar-benarnya untuk dipergunakan sebagaimana mestinya.</p>

<table style="width: 100%; border: none; margin-top: 36px; border-collapse: collapse;">
    <tbody>
        <tr>
            <td style="width: 50%; border: none; text-align: center; vertical-align: top; padding: 8px;">
                <p style="font-size: 11px; margin-bottom: 5px;">Pihak Pertama (Konsumen),</p>
                <div style="height: 60px;"></div>
                <p style="font-weight: bold; font-size: 11px; text-decoration: underline;">{{nama_konsumen}}</p>
                <p style="font-size: 10px; color: #64748b;">NIK: {{nik_konsumen}}</p>
            </td>
            <td style="width: 50%; border: none; text-align: center; vertical-align: top; padding: 8px;">
                <p style="font-size: 11px; margin-bottom: 5px;">Disetujui Oleh (Sales Manager),</p>
                <div style="margin: 4px 0;">{{qr_manager}}</div>
                <p style="font-weight: bold; font-size: 11px; text-decoration: underline;">{{nama_manager}}</p>
                <p style="font-size: 10px; color: #64748b;">{{nama_perusahaan}}</p>
            </td>
        </tr>
    </tbody>
</table>
`;

export default function DocumentEditor({
    template,
    availableTokens,
    sampleDictionary,
    paperSizes,
    recentBookings = [],
}: EditorProps) {
    const { app_settings } = usePage<PageProps>().props;
    const isEditMode = !!template?.id;

    // Form states
    const [name, setName] = useState(template?.name || 'Dokumen Baru Tanpa Judul');
    const [category, setCategory] = useState<string>(template?.category || 'official_letter');
    const [description, setDescription] = useState(template?.description || '');
    const [paperSize, setPaperSize] = useState<string>(template?.paper_size || 'a4');
    const [customWidth, setCustomWidth] = useState<number>(template?.custom_width_mm || 210);
    const [customHeight, setCustomHeight] = useState<number>(template?.custom_height_mm || 297);
    const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(template?.orientation || 'portrait');
    const [marginTop, setMarginTop] = useState<number>(template?.margin_top_mm ?? 20);
    const [marginBottom, setMarginBottom] = useState<number>(template?.margin_bottom_mm ?? 20);
    const [marginLeft, setMarginLeft] = useState<number>(template?.margin_left_mm ?? 25);
    const [marginRight, setMarginRight] = useState<number>(template?.margin_right_mm ?? 20);

    // Letterhead states
    const [letterheadMode, setLetterheadMode] = useState<'default_company' | 'custom_builder' | 'custom_image' | 'none'>(
        template?.letterhead_mode || 'default_company'
    );
    const [letterheadTitle, setLetterheadTitle] = useState(template?.letterhead_title || '');
    const [letterheadSubtitle, setLetterheadSubtitle] = useState(template?.letterhead_subtitle || '');
    const [letterheadAddress, setLetterheadAddress] = useState(template?.letterhead_address || '');
    const [letterheadContact, setLetterheadContact] = useState(template?.letterhead_contact || '');
    const [letterheadLogoFile, setLetterheadLogoFile] = useState<File | null>(null);
    const [letterheadLogoPreview, setLetterheadLogoPreview] = useState<string | null>(template?.letterhead_logo_url || null);
    const [removeLetterheadLogo, setRemoveLetterheadLogo] = useState(false);

    const [letterheadImageFile, setLetterheadImageFile] = useState<File | null>(null);
    const [letterheadImagePreview, setLetterheadImagePreview] = useState<string | null>(template?.letterhead_image_url || null);
    const [removeLetterheadImage, setRemoveLetterheadImage] = useState(false);

    // Content & Footer
    const [contentHtml, setContentHtml] = useState<string>(template?.content_html || DEFAULT_DOCUMENT_HTML);
    const [footerText, setFooterText] = useState(template?.footer_text || '');
    const [isDefault, setIsDefault] = useState(!!template?.is_default);

    // View & UI controls
    const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
    const [zoomPercent, setZoomPercent] = useState<number>(100);
    const [showGuides, setShowGuides] = useState(true);
    const [sidebarTab, setSidebarTab] = useState<'variables' | 'settings'>('variables');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selectedBookingId, setSelectedBookingId] = useState<string>('sample');
    const [previewHtml, setPreviewHtml] = useState<string>('');
    const [isRenderingPreview, setIsRenderingPreview] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [discardDialogOpen, setDiscardDialogOpen] = useState(false);

    // Variable search & category filter
    const [tokenSearch, setTokenSearch] = useState('');
    const [activeTokenCategory, setActiveTokenCategory] = useState<string>('all');
    const [copiedToken, setCopiedToken] = useState<string | null>(null);

    // Initialize TipTap Editor
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content: contentHtml,
        onUpdate: ({ editor: currentEditor }) => {
            setContentHtml(currentEditor.getHTML());
        },
    });

    // Calculate dimensions for paper canvas
    const currentDimensions = useMemo(() => {
        if (paperSize === 'custom') {
            return { width: customWidth || 210, height: customHeight || 297 };
        }
        const preset = paperSizes[paperSize] || { width: 210, height: 297 };
        return { width: preset.width, height: preset.height };
    }, [paperSize, customWidth, customHeight, paperSizes]);

    // Live preview fetcher
    const fetchPreview = async (bookingId?: string) => {
        setIsRenderingPreview(true);
        try {
            const currentContent = editor ? editor.getHTML() : contentHtml;
            const payload: any = {
                content_html: currentContent,
            };
            if (bookingId && bookingId !== 'sample') {
                payload.booking_id = bookingId;
            }

            const res = await fetch(route('document-templates.preview'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                const data = await res.json();
                setPreviewHtml(data.rendered_html);
            } else {
                toast.error('Gagal memuat pratinjau data.');
            }
        } catch (err) {
            toast.error('Terjadi kesalahan saat merender pratinjau.');
        } finally {
            setIsRenderingPreview(false);
        }
    };

    const handleSwitchToPreview = () => {
        if (editor) {
            setContentHtml(editor.getHTML());
        }
        setViewMode('preview');
        fetchPreview(selectedBookingId);
    };

    // Insert dynamic token into editor
    const handleInsertToken = (token: string) => {
        if (!editor) return;
        editor.chain().focus().insertContent(token).run();
        setCopiedToken(token);
        toast.success(`Variabel ${token} disisipkan!`);
        setTimeout(() => setCopiedToken(null), 1500);
    };

    // Copy token to clipboard
    const handleCopyToken = (e: React.MouseEvent, token: string) => {
        e.stopPropagation();
        navigator.clipboard.writeText(token);
        setCopiedToken(token);
        toast.info(`Variabel ${token} disalin ke clipboard!`);
        setTimeout(() => setCopiedToken(null), 1500);
    };

    // Preset Insertions
    const handleInsertReceiptTable = () => {
        if (!editor) return;
        editor.chain().focus().insertContent(`
            <table style="width: 100%; border-collapse: collapse; margin: 12px 0;">
                <thead>
                    <tr style="background-color: #f1f5f9;">
                        <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-size: 11px;">Keterangan Pembayaran</th>
                        <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: right; font-size: 11px;">Rincian / Jumlah</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="border: 1px solid #cbd5e1; padding: 8px; font-size: 11px;">Nomor Kwitansi Resmi</td>
                        <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: right; font-weight: bold; font-size: 11px;">{{nomor_kwitansi}}</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #cbd5e1; padding: 8px; font-size: 11px;">Unit & Kavling</td>
                        <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: right; font-size: 11px;">{{nomor_kavling}} - {{nama_proyek}}</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #cbd5e1; padding: 8px; font-size: 11px;">Jenis Pembayaran</td>
                        <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: right; font-size: 11px;">{{jenis_pembayaran}}</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #cbd5e1; padding: 8px; font-size: 11px;">Nominal Pembayaran</td>
                        <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: right; font-weight: bold; font-size: 11px;">{{nominal_bayar}}</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #cbd5e1; padding: 8px; font-size: 11px;">Terbilang</td>
                        <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: right; font-style: italic; font-size: 11px;">{{nominal_terbilang}}</td>
                    </tr>
                </tbody>
            </table>
            <p></p>
        `).run();
        toast.success('Tabel rincian kwitansi disisipkan!');
    };

    const handleInsertSignatureBlock = () => {
        if (!editor) return;
        editor.chain().focus().insertContent(`
            <table style="width: 100%; border: none; margin-top: 30px; border-collapse: collapse;">
                <tbody>
                    <tr>
                        <td style="width: 50%; border: none; text-align: center; vertical-align: top; padding: 8px;">
                            <p style="font-size: 11px; margin-bottom: 5px;">Pihak Pertama (Konsumen),</p>
                            <div style="height: 60px;"></div>
                            <p style="font-weight: bold; font-size: 11px; text-decoration: underline;">{{nama_konsumen}}</p>
                            <p style="font-size: 10px; color: #64748b;">NIK: {{nik_konsumen}}</p>
                        </td>
                        <td style="width: 50%; border: none; text-align: center; vertical-align: top; padding: 8px;">
                            <p style="font-size: 11px; margin-bottom: 5px;">Disetujui Oleh (Sales Manager),</p>
                            <div style="margin: 4px 0;">{{qr_manager}}</div>
                            <p style="font-weight: bold; font-size: 11px; text-decoration: underline;">{{nama_manager}}</p>
                            <p style="font-size: 10px; color: #64748b;">{{nama_perusahaan}}</p>
                        </td>
                    </tr>
                </tbody>
            </table>
            <p></p>
        `).run();
        toast.success('Blok tanda tangan & QR Manager disisipkan!');
    };

    // Save Template
    const handleSave = () => {
        if (!name.trim()) {
            toast.error('Harap masukkan nama template!');
            return;
        }

        const currentHtml = editor ? editor.getHTML() : contentHtml;

        setIsSaving(true);
        const formData = new FormData();
        formData.append('name', name);
        formData.append('category', category);
        formData.append('description', description);
        formData.append('paper_size', paperSize);
        if (paperSize === 'custom') {
            formData.append('custom_width_mm', String(customWidth));
            formData.append('custom_height_mm', String(customHeight));
        }
        formData.append('orientation', orientation);
        formData.append('margin_top_mm', String(marginTop));
        formData.append('margin_bottom_mm', String(marginBottom));
        formData.append('margin_left_mm', String(marginLeft));
        formData.append('margin_right_mm', String(marginRight));

        formData.append('letterhead_mode', letterheadMode);
        formData.append('letterhead_title', letterheadTitle);
        formData.append('letterhead_subtitle', letterheadSubtitle);
        formData.append('letterhead_address', letterheadAddress);
        formData.append('letterhead_contact', letterheadContact);
        formData.append('footer_text', footerText);
        formData.append('is_default', isDefault ? '1' : '0');
        formData.append('content_html', currentHtml);

        if (letterheadLogoFile) {
            formData.append('letterhead_logo', letterheadLogoFile);
        }
        if (removeLetterheadLogo) {
            formData.append('remove_letterhead_logo', '1');
        }

        if (letterheadImageFile) {
            formData.append('letterhead_image', letterheadImageFile);
        }
        if (removeLetterheadImage) {
            formData.append('remove_letterhead_image', '1');
        }

        const url = isEditMode
            ? route('document-templates.update', template.id)
            : route('document-templates.store');

        router.post(url, formData, {
            onSuccess: () => {
                toast.success('Template dokumen berhasil disimpan!');
                setIsSaving(false);
            },
            onError: (errors) => {
                const first = Object.values(errors)[0];
                toast.error(typeof first === 'string' ? first : 'Gagal menyimpan template');
                setIsSaving(false);
            },
        });
    };

    // PDF Export
    const handleExportPdf = () => {
        if (!isEditMode) {
            toast.error('Harap simpan template terlebih dahulu sebelum mengunduh PDF.');
            return;
        }
        const bId = selectedBookingId !== 'sample' ? `?booking_id=${selectedBookingId}` : '';
        window.open(route('document-templates.pdf', template.id) + bId, '_blank');
    };

    // Filter tokens for sidebar
    const tokenCategories = Object.entries(availableTokens);
    const filteredTokens: { categoryKey: string; categoryLabel: string; item: TokenItem }[] = [];

    tokenCategories.forEach(([key, group]) => {
        if (activeTokenCategory === 'all' || activeTokenCategory === key) {
            group.tokens.forEach((item) => {
                const q = tokenSearch.toLowerCase();
                if (
                    !q ||
                    item.token.toLowerCase().includes(q) ||
                    item.label.toLowerCase().includes(q) ||
                    (item.example && item.example.toLowerCase().includes(q))
                ) {
                    filteredTokens.push({
                        categoryKey: key,
                        categoryLabel: group.label || key,
                        item,
                    });
                }
            });
        }
    });

    const getCategoryIcon = (key: string) => {
        const k = key.toLowerCase();
        if (k.includes('konsumen')) return <User className="size-3.5 text-blue-500" />;
        if (k.includes('properti') || k.includes('kavling')) return <Home className="size-3.5 text-emerald-500" />;
        if (k.includes('transaksi') || k.includes('kwitansi') || k.includes('bayar')) return <CreditCard className="size-3.5 text-purple-500" />;
        if (k.includes('validasi') || k.includes('approval')) return <QrIcon className="size-3.5 text-rose-500" />;
        return <Building2 className="size-3.5 text-amber-500" />;
    };

    return (
        <AuthenticatedLayout>
            <Head title={isEditMode ? `Edit Template: ${name}` : 'Document Template Builder (Google Docs Style)'} />

            <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-muted/20">
                {/* 1. Google Docs Topbar Header */}
                <header className="h-16 px-4 border-b border-border bg-card flex items-center justify-between gap-3 shrink-0 z-30 shadow-xs">
                    <div className="flex items-center gap-3 min-w-0">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-9 rounded-xl shrink-0"
                            onClick={() => setDiscardDialogOpen(true)}
                            title="Kembali ke Daftar Template"
                        >
                            <ArrowLeft className="size-4" />
                        </Button>

                        <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ketik Nama Template Dokumen..."
                                    className="text-sm sm:text-base font-bold bg-transparent hover:bg-muted/40 focus:bg-background px-2 py-0.5 rounded-lg border-transparent focus:border-border transition-all outline-none text-foreground truncate max-w-xs sm:max-w-md"
                                />
                                {isDefault && (
                                    <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px] shrink-0 font-medium">
                                        Default Kategori
                                    </Badge>
                                )}
                            </div>
                            <span className="text-[11px] text-muted-foreground px-2 flex items-center gap-1.5">
                                <FileText className="size-3" />
                                {isEditMode ? 'Mengubah Template Tersimpan' : 'Template Dokumen Baru'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {/* Zoom Controls */}
                        <div className="hidden lg:flex items-center bg-muted/60 rounded-xl p-1 border border-border/50 text-xs">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
                                onClick={() => setZoomPercent((prev) => Math.max(50, prev - 10))}
                                title="Zoom Out"
                            >
                                <ZoomOut className="size-3.5" />
                            </Button>
                            <span className="px-2 font-mono text-[11px] min-w-12 text-center text-muted-foreground">
                                {zoomPercent}%
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
                                onClick={() => setZoomPercent((prev) => Math.min(150, prev + 10))}
                                title="Zoom In"
                            >
                                <ZoomIn className="size-3.5" />
                            </Button>
                        </div>

                        {/* View Switcher: Editor vs Pratinjau Nyata */}
                        <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border/50">
                            <Button
                                variant={viewMode === 'edit' ? 'default' : 'ghost'}
                                size="sm"
                                className={`h-8 px-3 text-xs rounded-lg gap-1.5 font-medium transition-all ${
                                    viewMode === 'edit' ? 'shadow-xs' : 'text-muted-foreground hover:text-foreground'
                                }`}
                                onClick={() => setViewMode('edit')}
                            >
                                <PenTool className="size-3.5" />
                                <span>Editor Dokumen</span>
                            </Button>
                            <Button
                                variant={viewMode === 'preview' ? 'default' : 'ghost'}
                                size="sm"
                                className={`h-8 px-3 text-xs rounded-lg gap-1.5 font-medium transition-all ${
                                    viewMode === 'preview' ? 'shadow-xs' : 'text-muted-foreground hover:text-foreground'
                                }`}
                                onClick={handleSwitchToPreview}
                            >
                                <Eye className="size-3.5" />
                                <span>Pratinjau Nyata</span>
                            </Button>
                        </div>

                        {/* Export PDF */}
                        {isEditMode && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 gap-1.5 rounded-xl border-border hidden sm:flex"
                                onClick={handleExportPdf}
                                title="Cetak PDF Dokumen Resmi"
                            >
                                <Printer className="size-3.5" />
                                <span>Cetak PDF</span>
                            </Button>
                        )}

                        {/* Save Template Button */}
                        <Button
                            size="sm"
                            className="h-9 gap-1.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-md font-semibold px-4"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            <Save className="size-3.5" />
                            <span>{isSaving ? 'Menyimpan...' : 'Simpan Template'}</span>
                        </Button>

                        {/* Toggle Right Sidebar Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`size-9 rounded-xl ${sidebarOpen ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            title="Buka/Tutup Sidebar Variabel & Pengaturan"
                        >
                            <Sliders className="size-4" />
                        </Button>
                    </div>
                </header>

                {/* 2. Google Docs Action Toolbar (Rich Text & Table Tools) */}
                {viewMode === 'edit' && editor ? (
                    <div className="px-4 py-2 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shrink-0 shadow-xs">
                        <div className="flex items-center gap-1 shrink-0">
                            {/* Undo / Redo */}
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
                                onClick={() => editor.chain().focus().undo().run()}
                                disabled={!editor.can().undo()}
                                title="Undo (Ctrl+Z)"
                            >
                                <Undo2 className="size-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
                                onClick={() => editor.chain().focus().redo().run()}
                                disabled={!editor.can().redo()}
                                title="Redo (Ctrl+Y)"
                            >
                                <Redo2 className="size-4" />
                            </Button>

                            <div className="h-4 w-px bg-border mx-1" />

                            {/* Heading / Style Selector */}
                            <Select
                                value={
                                    editor.isActive('heading', { level: 1 })
                                        ? 'h1'
                                        : editor.isActive('heading', { level: 2 })
                                        ? 'h2'
                                        : editor.isActive('heading', { level: 3 })
                                        ? 'h3'
                                        : 'p'
                                }
                                onValueChange={(val) => {
                                    if (val === 'p') editor.chain().focus().setParagraph().run();
                                    else if (val === 'h1') editor.chain().focus().toggleHeading({ level: 1 }).run();
                                    else if (val === 'h2') editor.chain().focus().toggleHeading({ level: 2 }).run();
                                    else if (val === 'h3') editor.chain().focus().toggleHeading({ level: 3 }).run();
                                }}
                            >
                                <SelectTrigger className="h-8 w-32 text-xs rounded-lg bg-background border-border">
                                    <SelectValue placeholder="Format Teks" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-border">
                                    <SelectItem value="p" className="text-xs">Teks Normal</SelectItem>
                                    <SelectItem value="h1" className="text-xs font-bold">Judul 1 (H1)</SelectItem>
                                    <SelectItem value="h2" className="text-xs font-semibold">Judul 2 (H2)</SelectItem>
                                    <SelectItem value="h3" className="text-xs font-medium">Judul 3 (H3)</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="h-4 w-px bg-border mx-1" />

                            {/* Bold, Italic, Underline, Strikethrough */}
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className={`size-8 rounded-lg ${editor.isActive('bold') ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:text-foreground'}`}
                                onClick={() => editor.chain().focus().toggleBold().run()}
                                title="Tebal (Ctrl+B)"
                            >
                                <BoldIcon className="size-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className={`size-8 rounded-lg ${editor.isActive('italic') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                onClick={() => editor.chain().focus().toggleItalic().run()}
                                title="Miring (Ctrl+I)"
                            >
                                <ItalicIcon className="size-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className={`size-8 rounded-lg ${editor.isActive('underline') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                onClick={() => editor.chain().focus().toggleUnderline().run()}
                                title="Garis Bawah (Ctrl+U)"
                            >
                                <UnderlineIcon className="size-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className={`size-8 rounded-lg ${editor.isActive('strike') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                onClick={() => editor.chain().focus().toggleStrike().run()}
                                title="Coret Teks"
                            >
                                <Strikethrough className="size-4" />
                            </Button>

                            <div className="h-4 w-px bg-border mx-1" />

                            {/* Alignments */}
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className={`size-8 rounded-lg ${editor.isActive({ textAlign: 'left' }) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                                title="Rata Kiri"
                            >
                                <AlignLeft className="size-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className={`size-8 rounded-lg ${editor.isActive({ textAlign: 'center' }) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                                title="Rata Tengah"
                            >
                                <AlignCenter className="size-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className={`size-8 rounded-lg ${editor.isActive({ textAlign: 'right' }) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                                title="Rata Kanan"
                            >
                                <AlignRight className="size-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className={`size-8 rounded-lg ${editor.isActive({ textAlign: 'justify' }) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                                title="Rata Kanan Kiri"
                            >
                                <AlignJustify className="size-4" />
                            </Button>

                            <div className="h-4 w-px bg-border mx-1" />

                            {/* Lists */}
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className={`size-8 rounded-lg ${editor.isActive('bulletList') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                onClick={() => editor.chain().focus().toggleBulletList().run()}
                                title="Bullet List"
                            >
                                <List className="size-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className={`size-8 rounded-lg ${editor.isActive('orderedList') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                                title="Numbered List"
                            >
                                <ListOrdered className="size-4" />
                            </Button>

                            <div className="h-4 w-px bg-border mx-1" />

                            {/* Table Dropdown Menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-8 gap-1.5 text-xs rounded-lg border-border"
                                    >
                                        <TableIcon className="size-3.5 text-primary" />
                                        <span>Tabel</span>
                                        <ChevronDown className="size-3 opacity-60" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-56 rounded-xl border-border">
                                    <DropdownMenuLabel className="text-xs">Manipulasi Tabel</DropdownMenuLabel>
                                    <DropdownMenuItem
                                        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 2, withHeaderRow: true }).run()}
                                        className="text-xs gap-2 cursor-pointer"
                                    >
                                        <Plus className="size-3.5 text-primary" />
                                        <span>Sisipkan Tabel (2×3)</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                                        className="text-xs gap-2 cursor-pointer"
                                    >
                                        <Plus className="size-3.5 text-primary" />
                                        <span>Sisipkan Tabel (3×3)</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => editor.chain().focus().addRowAfter().run()}
                                        disabled={!editor.can().addRowAfter()}
                                        className="text-xs gap-2 cursor-pointer"
                                    >
                                        <span>+ Tambah Baris Bawah</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => editor.chain().focus().deleteRow().run()}
                                        disabled={!editor.can().deleteRow()}
                                        className="text-xs gap-2 text-rose-500 cursor-pointer"
                                    >
                                        <span>- Hapus Baris</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => editor.chain().focus().addColumnAfter().run()}
                                        disabled={!editor.can().addColumnAfter()}
                                        className="text-xs gap-2 cursor-pointer"
                                    >
                                        <span>+ Tambah Kolom Kanan</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => editor.chain().focus().deleteColumn().run()}
                                        disabled={!editor.can().deleteColumn()}
                                        className="text-xs gap-2 text-rose-500 cursor-pointer"
                                    >
                                        <span>- Hapus Kolom</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => editor.chain().focus().deleteTable().run()}
                                        disabled={!editor.can().deleteTable()}
                                        className="text-xs gap-2 text-rose-600 font-semibold cursor-pointer"
                                    >
                                        <Trash2 className="size-3.5" />
                                        <span>Hapus Seluruh Tabel</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Quick Insertion Chips */}
                        <div className="flex items-center gap-1.5 shrink-0">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleInsertReceiptTable}
                                className="h-8 text-xs gap-1.5 rounded-lg text-primary hover:bg-primary/10 border border-primary/20"
                            >
                                <FileSpreadsheet className="size-3.5" />
                                <span>+ Tabel Rincian</span>
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleInsertSignatureBlock}
                                className="h-8 text-xs gap-1.5 rounded-lg text-primary hover:bg-primary/10 border border-primary/20"
                            >
                                <QrIcon className="size-3.5" />
                                <span>+ TTD & QR Approval</span>
                            </Button>
                        </div>
                    </div>
                ) : null}

                {/* 3. Main Workspace Area: Paper Viewport (Center) + Docked Variable Shelf (Right) */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Center: Scrollable Paper Sheet */}
                    <main
                        className="flex-1 overflow-y-auto bg-muted/30 flex flex-col items-center p-4 sm:p-8"
                        onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'copy';
                        }}
                        onDrop={(e) => {
                            e.preventDefault();
                            const token = e.dataTransfer.getData('text/plain');
                            if (token && editor) {
                                editor.chain().focus().insertContent(token).run();
                                toast.success(`Variabel ${token} disisipkan ke dokumen!`);
                            }
                        }}
                    >
                        {viewMode === 'preview' ? (
                            /* Live Preview Mode */
                            <div className="w-full flex flex-col items-center">
                                {/* Preview Data Selector Header */}
                                <div className="mb-6 p-3 bg-card border border-border/80 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-3 w-full max-w-3xl">
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs px-2.5 py-1">
                                            Live Simulation Active
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            Data dinamis di-render menggunakan data transaksi aktual:
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Select
                                            value={selectedBookingId}
                                            onValueChange={(val) => {
                                                setSelectedBookingId(val);
                                                fetchPreview(val);
                                            }}
                                        >
                                            <SelectTrigger className="h-8 w-56 text-xs rounded-xl bg-background border-border">
                                                <SelectValue placeholder="Pilih Data Transaksi..." />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-border">
                                                <SelectItem value="sample">Data Dummy Simulasi Standar</SelectItem>
                                                {recentBookings.map((b) => (
                                                    <SelectItem key={b.id} value={String(b.id)}>
                                                        {b.booking_code} - {b.lead?.name || 'Konsumen'} ({b.unit?.unit_code || 'Unit'})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-8 px-3 text-xs rounded-xl"
                                            onClick={() => fetchPreview(selectedBookingId)}
                                            disabled={isRenderingPreview}
                                        >
                                            {isRenderingPreview ? 'Memuat...' : 'Muat Ulang'}
                                        </Button>
                                    </div>
                                </div>

                                <PaperCanvas
                                    widthMm={currentDimensions.width}
                                    heightMm={currentDimensions.height}
                                    marginTopMm={marginTop}
                                    marginBottomMm={marginBottom}
                                    marginLeftMm={marginLeft}
                                    marginRightMm={marginRight}
                                    orientation={orientation}
                                    zoomPercent={zoomPercent}
                                    showMarginGuides={showGuides}
                                    footerText={footerText}
                                    letterhead={{
                                        mode: letterheadMode,
                                        title: letterheadTitle,
                                        subtitle: letterheadSubtitle,
                                        address: letterheadAddress,
                                        contact: letterheadContact,
                                        logoUrl: letterheadLogoPreview,
                                        imageUrl: letterheadImagePreview,
                                        companySettings: {
                                            company_name: app_settings?.company_name,
                                            company_address: app_settings?.company_address,
                                            company_phone: app_settings?.company_phone,
                                            company_email: app_settings?.company_email,
                                            logo_light_url: app_settings?.logo_light,
                                        },
                                    }}
                                >
                                    {isRenderingPreview ? (
                                        <div className="py-24 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-3">
                                            <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                            <span>Sedang merender data pratinjau dokumen...</span>
                                        </div>
                                    ) : (
                                        <div
                                            className="document-preview-body text-slate-900 leading-relaxed"
                                            dangerouslySetInnerHTML={{ __html: previewHtml || '<p className="text-gray-400">Belum ada konten pratinjau.</p>' }}
                                        />
                                    )}
                                </PaperCanvas>
                            </div>
                        ) : (
                            /* TipTap Rich Text Paper Canvas */
                            <PaperCanvas
                                widthMm={currentDimensions.width}
                                heightMm={currentDimensions.height}
                                marginTopMm={marginTop}
                                marginBottomMm={marginBottom}
                                marginLeftMm={marginLeft}
                                marginRightMm={marginRight}
                                orientation={orientation}
                                zoomPercent={zoomPercent}
                                showMarginGuides={showGuides}
                                footerText={footerText}
                                letterhead={{
                                    mode: letterheadMode,
                                    title: letterheadTitle,
                                    subtitle: letterheadSubtitle,
                                    address: letterheadAddress,
                                    contact: letterheadContact,
                                    logoUrl: letterheadLogoPreview,
                                    imageUrl: letterheadImagePreview,
                                    companySettings: {
                                        company_name: app_settings?.company_name,
                                        company_address: app_settings?.company_address,
                                        company_phone: app_settings?.company_phone,
                                        company_email: app_settings?.company_email,
                                        logo_light_url: app_settings?.logo_light,
                                    },
                                }}
                            >
                                <div className="document-editor-content">
                                    <EditorContent editor={editor} />
                                </div>
                            </PaperCanvas>
                        )}
                    </main>

                    {/* Right: Docked Google Docs Sidebar (Dynamic Placeholders & Document Settings) */}
                    {sidebarOpen && (
                        <aside className="w-80 sm:w-96 border-l border-border bg-card flex flex-col shrink-0 z-20 shadow-lg">
                            {/* Sidebar Tab Selector */}
                            <div className="flex border-b border-border bg-muted/40 p-1 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setSidebarTab('variables')}
                                    className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                                        sidebarTab === 'variables'
                                            ? 'bg-card text-foreground shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <Sparkles className="size-3.5 text-primary" />
                                    <span>Variabel Dinamis</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSidebarTab('settings')}
                                    className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                                        sidebarTab === 'settings'
                                            ? 'bg-card text-foreground shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <Sliders className="size-3.5 text-muted-foreground" />
                                    <span>Format Kertas & Kop</span>
                                </button>
                            </div>

                            {/* Tab 1: Dynamic Variables Shelf */}
                            {sidebarTab === 'variables' && (
                                <div className="flex-1 flex flex-col overflow-hidden">
                                    {/* Search & Categories */}
                                    <div className="p-3 border-b border-border space-y-2 bg-muted/20 shrink-0">
                                        <div className="relative">
                                            <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                value={tokenSearch}
                                                onChange={(e) => setTokenSearch(e.target.value)}
                                                placeholder="Cari variabel, cth: nama, kavling, qr..."
                                                className="h-8 pl-8 pr-2.5 text-xs rounded-xl bg-background border-border"
                                            />
                                        </div>

                                        {/* Category pills */}
                                        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
                                            <button
                                                type="button"
                                                onClick={() => setActiveTokenCategory('all')}
                                                className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors shrink-0 ${
                                                    activeTokenCategory === 'all'
                                                        ? 'bg-primary text-primary-foreground font-semibold'
                                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                                }`}
                                            >
                                                Semua
                                            </button>
                                            {tokenCategories.map(([k, grp]) => (
                                                <button
                                                    key={k}
                                                    type="button"
                                                    onClick={() => setActiveTokenCategory(k)}
                                                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors shrink-0 flex items-center gap-1 ${
                                                        activeTokenCategory === k
                                                            ? 'bg-primary text-primary-foreground font-semibold'
                                                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                                    }`}
                                                >
                                                    {getCategoryIcon(k)}
                                                    <span>{grp.label || k}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Draggable Token List */}
                                    <ScrollArea className="flex-1 p-3">
                                        <div className="space-y-2">
                                            <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/20 text-[11px] text-primary flex items-start gap-2">
                                                <Sparkles className="size-4 shrink-0 mt-0.5" />
                                                <span>
                                                    <strong>Drag & Drop</strong> variabel ke kanvas dokumen, atau <strong>klik</strong> untuk memasukkan langsung ke kursor.
                                                </span>
                                            </div>

                                            {filteredTokens.length === 0 ? (
                                                <div className="text-center py-10 text-xs text-muted-foreground">
                                                    Tidak ada variabel yang sesuai pencarian.
                                                </div>
                                            ) : (
                                                filteredTokens.map(({ item }) => {
                                                    const isCopied = copiedToken === item.token;
                                                    return (
                                                        <div
                                                            key={item.token}
                                                            draggable
                                                            onDragStart={(e) => {
                                                                e.dataTransfer.setData('text/plain', item.token);
                                                                e.dataTransfer.effectAllowed = 'copy';
                                                            }}
                                                            onClick={() => handleInsertToken(item.token)}
                                                            className="group flex items-start justify-between p-2.5 rounded-xl border border-border/70 hover:border-primary/40 bg-card hover:bg-primary/5 cursor-grab active:cursor-grabbing transition-all text-left shadow-2xs select-none"
                                                        >
                                                            <div className="space-y-1 min-w-0 pr-2">
                                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                                    <GripVertical className="size-3 text-muted-foreground opacity-40 group-hover:opacity-100" />
                                                                    <code className="text-xs font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                                                        {item.token}
                                                                    </code>
                                                                </div>
                                                                <p className="text-xs font-medium text-foreground line-clamp-1 pl-4">
                                                                    {item.label}
                                                                </p>
                                                                {item.example && (
                                                                    <p className="text-[10px] text-muted-foreground italic pl-4 font-mono">
                                                                        Contoh: {item.example}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center gap-1 shrink-0 pt-0.5">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="size-7 text-muted-foreground hover:text-foreground"
                                                                    onClick={(e) => handleCopyToken(e, item.token)}
                                                                    title="Salin variabel"
                                                                >
                                                                    {isCopied ? (
                                                                        <Check className="size-3.5 text-emerald-500" />
                                                                    ) : (
                                                                        <Copy className="size-3.5" />
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </ScrollArea>
                                </div>
                            )}

                            {/* Tab 2: Document & Paper Settings */}
                            {sidebarTab === 'settings' && (
                                <ScrollArea className="flex-1 p-4">
                                    <div className="space-y-5">
                                        {/* Kategori Template */}
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold">Kategori Template Dokumen</Label>
                                            <Select value={category} onValueChange={setCategory}>
                                                <SelectTrigger className="h-9 text-xs rounded-xl bg-background border-border">
                                                    <SelectValue placeholder="Pilih Kategori" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-border">
                                                    <SelectItem value="official_letter">Surat Resmi / Pemberitahuan</SelectItem>
                                                    <SelectItem value="receipt">Kwitansi & Tanda Terima</SelectItem>
                                                    <SelectItem value="spr">Surat Pesanan Rumah (SPR)</SelectItem>
                                                    <SelectItem value="ppjb">Perjanjian Pengikatan Jual Beli (PPJB)</SelectItem>
                                                    <SelectItem value="bast">Berita Acara Serah Terima (BAST)</SelectItem>
                                                    <SelectItem value="custom">Format Kustom Lainnya</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Ukuran Kertas */}
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold">Ukuran Kertas Standar</Label>
                                            <Select value={paperSize} onValueChange={setPaperSize}>
                                                <SelectTrigger className="h-9 text-xs rounded-xl bg-background border-border">
                                                    <SelectValue placeholder="Pilih Ukuran Kertas" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-border">
                                                    {Object.entries(paperSizes).map(([k, val]) => (
                                                        <SelectItem key={k} value={k}>
                                                            {val.name} ({val.desc})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Orientasi */}
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold">Orientasi Lembar</Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Button
                                                    type="button"
                                                    variant={orientation === 'portrait' ? 'default' : 'outline'}
                                                    size="sm"
                                                    className="h-8 text-xs rounded-xl"
                                                    onClick={() => setOrientation('portrait')}
                                                >
                                                    Portrait (Tegak)
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant={orientation === 'landscape' ? 'default' : 'outline'}
                                                    size="sm"
                                                    className="h-8 text-xs rounded-xl"
                                                    onClick={() => setOrientation('landscape')}
                                                >
                                                    Landscape (Lebar)
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Margin Batas Cetak (mm) */}
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold">Margin Batas Cetak (Milimeter)</Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <span className="text-[10px] text-muted-foreground">Atas (mm)</span>
                                                    <Input
                                                        type="number"
                                                        value={marginTop}
                                                        onChange={(e) => setMarginTop(Number(e.target.value))}
                                                        className="h-8 text-xs rounded-xl"
                                                    />
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-muted-foreground">Bawah (mm)</span>
                                                    <Input
                                                        type="number"
                                                        value={marginBottom}
                                                        onChange={(e) => setMarginBottom(Number(e.target.value))}
                                                        className="h-8 text-xs rounded-xl"
                                                    />
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-muted-foreground">Kiri (mm)</span>
                                                    <Input
                                                        type="number"
                                                        value={marginLeft}
                                                        onChange={(e) => setMarginLeft(Number(e.target.value))}
                                                        className="h-8 text-xs rounded-xl"
                                                    />
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-muted-foreground">Kanan (mm)</span>
                                                    <Input
                                                        type="number"
                                                        value={marginRight}
                                                        onChange={(e) => setMarginRight(Number(e.target.value))}
                                                        className="h-8 text-xs rounded-xl"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Mode Kop Surat */}
                                        <div className="space-y-2 pt-2 border-t border-border">
                                            <Label className="text-xs font-semibold">Model Kop Surat (Header)</Label>
                                            <Select
                                                value={letterheadMode}
                                                onValueChange={(val: any) => setLetterheadMode(val)}
                                            >
                                                <SelectTrigger className="h-9 text-xs rounded-xl bg-background border-border">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-border">
                                                    <SelectItem value="default_company">Gunakan Data Profil PT Casanuma</SelectItem>
                                                    <SelectItem value="custom_builder">Kop Teks Kustom (Logo + Alamat)</SelectItem>
                                                    <SelectItem value="custom_image">Kop Gambar Banner Penuh</SelectItem>
                                                    <SelectItem value="none">Tanpa Kop Surat (Kertas Polos)</SelectItem>
                                                </SelectContent>
                                            </Select>

                                            {letterheadMode === 'custom_builder' && (
                                                <div className="space-y-2 mt-2 p-3 bg-muted/40 rounded-xl border border-border">
                                                    <div>
                                                        <span className="text-[10px] text-muted-foreground">Nama PT / Instansi</span>
                                                        <Input
                                                            value={letterheadTitle}
                                                            onChange={(e) => setLetterheadTitle(e.target.value)}
                                                            className="h-8 text-xs rounded-lg"
                                                            placeholder="PT CASANUMA GRAHA UTAMA"
                                                        />
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-muted-foreground">Sub-judul / Unit Bisnis</span>
                                                        <Input
                                                            value={letterheadSubtitle}
                                                            onChange={(e) => setLetterheadSubtitle(e.target.value)}
                                                            className="h-8 text-xs rounded-lg"
                                                            placeholder="Pengembang Properti & Residensial"
                                                        />
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-muted-foreground">Alamat Kantor</span>
                                                        <Input
                                                            value={letterheadAddress}
                                                            onChange={(e) => setLetterheadAddress(e.target.value)}
                                                            className="h-8 text-xs rounded-lg"
                                                            placeholder="Jl. Sukajadi No. 123, Bandung"
                                                        />
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-muted-foreground">Kontak & Email</span>
                                                        <Input
                                                            value={letterheadContact}
                                                            onChange={(e) => setLetterheadContact(e.target.value)}
                                                            className="h-8 text-xs rounded-lg"
                                                            placeholder="Telp: (022) 1234567 | info@casanuma.com"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Teks Footer */}
                                        <div className="space-y-1.5 pt-2 border-t border-border">
                                            <Label className="text-xs font-semibold">Teks Catatan Kaki (Footer)</Label>
                                            <Input
                                                value={footerText}
                                                onChange={(e) => setFooterText(e.target.value)}
                                                placeholder="Dokumen resmi dicetak oleh CASANUMA CRM..."
                                                className="h-8 text-xs rounded-xl"
                                            />
                                        </div>

                                        {/* Set Default Toggle */}
                                        <div className="flex items-center gap-2 pt-2 border-t border-border">
                                            <Checkbox
                                                id="is-default-checkbox"
                                                checked={isDefault}
                                                onCheckedChange={(c) => setIsDefault(!!c)}
                                            />
                                            <label
                                                htmlFor="is-default-checkbox"
                                                className="text-xs font-medium cursor-pointer"
                                            >
                                                Jadikan template baku (default) kategori ini
                                            </label>
                                        </div>
                                    </div>
                                </ScrollArea>
                            )}
                        </aside>
                    )}
                </div>
            </div>

            {/* Discard Confirmation Dialog */}
            <Dialog open={discardDialogOpen} onOpenChange={setDiscardDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Tinggalkan Editor?</DialogTitle>
                        <DialogDescription>
                            Perubahan template yang belum disimpan akan hilang jika Anda keluar dari halaman ini.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setDiscardDialogOpen(false)} className="rounded-xl">
                            Batal & Lanjut Edit
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => router.visit(route('document-templates.index'))}
                            className="rounded-xl"
                        >
                            Tinggalkan Tanpa Simpan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
