import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import React, { useState, useRef, useEffect } from 'react';
import {
    FileText,
    ArrowLeft,
    Save,
    Printer,
    Eye,
    Code,
    Sliders,
    Image as ImageIcon,
    Settings,
    FileSpreadsheet,
    Maximize2,
    ZoomIn,
    ZoomOut,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Bold,
    Italic,
    Underline,
    List,
    ListOrdered,
    Table as TableIcon,
    PenTool,
    HelpCircle,
    Check,
    RotateCcw,
    Sparkles,
    Trash2,
    Upload,
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
import PaperCanvas from '@/Components/Documents/PaperCanvas';
import VariablePicker, { TokenItem } from '@/Components/Documents/VariablePicker';
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
    const [contentHtml, setContentHtml] = useState<string>(template?.content_html || '<p>Ketik isi surat atau dokumen di sini...</p>');
    const [footerText, setFooterText] = useState(template?.footer_text || '');
    const [isDefault, setIsDefault] = useState(!!template?.is_default);

    // View & UI controls
    const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
    const [sourceMode, setSourceMode] = useState(false);
    const [zoomPercent, setZoomPercent] = useState<number>(100);
    const [showGuides, setShowGuides] = useState(true);
    const [sidebarTab, setSidebarTab] = useState<'canvas' | 'letterhead' | 'info'>('canvas');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selectedBookingId, setSelectedBookingId] = useState<string>('sample');
    const [previewHtml, setPreviewHtml] = useState<string>('');
    const [isRenderingPreview, setIsRenderingPreview] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [discardDialogOpen, setDiscardDialogOpen] = useState(false);

    const editorRef = useRef<HTMLDivElement>(null);

    // Calculate mm dimensions
    const currentDimensions = React.useMemo(() => {
        if (paperSize === 'custom') {
            return { width: customWidth || 210, height: customHeight || 297 };
        }
        const preset = paperSizes[paperSize] || { width: 210, height: 297 };
        return { width: preset.width, height: preset.height };
    }, [paperSize, customWidth, customHeight, paperSizes]);

    // Keep editorRef content synced when entering edit mode or initial load
    useEffect(() => {
        if (editorRef.current && !sourceMode && viewMode === 'edit') {
            if (editorRef.current.innerHTML !== contentHtml) {
                editorRef.current.innerHTML = contentHtml;
            }
        }
    }, [viewMode, sourceMode]);

    // Live preview fetcher
    const fetchPreview = async (bookingId?: string) => {
        setIsRenderingPreview(true);
        try {
            const currentContent = editorRef.current && !sourceMode ? editorRef.current.innerHTML : contentHtml;
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
        // Sync HTML from editorRef before preview
        if (editorRef.current && !sourceMode) {
            setContentHtml(editorRef.current.innerHTML);
        }
        setViewMode('preview');
        fetchPreview(selectedBookingId);
    };

    // Format commands for rich editor
    const executeCmd = (command: string, value: string | undefined = undefined) => {
        if (editorRef.current) {
            editorRef.current.focus();
            document.execCommand(command, false, value);
            setContentHtml(editorRef.current.innerHTML);
        }
    };

    // Insert variable token
    const handleInsertToken = (token: string) => {
        if (sourceMode) {
            setContentHtml((prev) => prev + token);
            return;
        }

        if (editorRef.current) {
            editorRef.current.focus();
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                const node = document.createTextNode(token);
                range.insertNode(node);
                range.setStartAfter(node);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
            } else {
                editorRef.current.innerHTML += token;
            }
            setContentHtml(editorRef.current.innerHTML);
        }
    };

    // Insert standard styled table
    const handleInsertTable = () => {
        const tableHtml = `
            <table style="width: 100%; border-collapse: collapse; margin: 12px 0;">
                <thead>
                    <tr style="background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                        <th style="padding: 8px; text-align: left; font-size: 11px;">Keterangan / Butir</th>
                        <th style="padding: 8px; text-align: right; font-size: 11px;">Rincian / Nilai</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 8px; font-size: 11px;">Nama Konsumen</td>
                        <td style="padding: 8px; text-align: right; font-weight: bold; font-size: 11px;">{{nama_konsumen}}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 8px; font-size: 11px;">Unit & Proyek</td>
                        <td style="padding: 8px; text-align: right; font-size: 11px;">{{kode_unit}} - {{nama_proyek}}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 8px; font-size: 11px;">Nilai Transaksi</td>
                        <td style="padding: 8px; text-align: right; font-weight: bold; font-size: 11px;">{{harga_total}}</td>
                    </tr>
                </tbody>
            </table>
            <p></p>
        `;
        insertHtmlAtCursor(tableHtml);
    };

    // Insert 2-column signature block
    const handleInsertSignature = () => {
        const sigHtml = `
            <div style="margin-top: 30px; display: table; width: 100%;">
                <div style="display: table-row;">
                    <div style="display: table-cell; width: 50%; text-align: center; vertical-align: top;">
                        <p style="font-size: 11px; margin-bottom: 5px;">Pihak Pertama (Konsumen),</p>
                        <div style="height: 65px;"></div>
                        <p style="font-weight: bold; font-size: 11px; text-decoration: underline;">{{nama_konsumen}}</p>
                        <p style="font-size: 10px; color: #64748b;">NIK: {{nik_konsumen}}</p>
                    </div>
                    <div style="display: table-cell; width: 50%; text-align: center; vertical-align: top;">
                        <p style="font-size: 11px; margin-bottom: 5px;">Pihak Kedua (Developer),</p>
                        <div style="height: 65px;"></div>
                        <p style="font-weight: bold; font-size: 11px; text-decoration: underline;">{{nama_perusahaan}}</p>
                        <p style="font-size: 10px; color: #64748b;">Direktur Utama / Perwakilan Sah</p>
                    </div>
                </div>
            </div>
            <p></p>
        `;
        insertHtmlAtCursor(sigHtml);
    };

    const insertHtmlAtCursor = (html: string) => {
        if (sourceMode) {
            setContentHtml((prev) => prev + html);
            return;
        }
        if (editorRef.current) {
            editorRef.current.focus();
            document.execCommand('insertHTML', false, html);
            setContentHtml(editorRef.current.innerHTML);
        }
    };

    // File handlers
    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLetterheadLogoFile(file);
            setRemoveLetterheadLogo(false);
            const url = URL.createObjectURL(file);
            setLetterheadLogoPreview(url);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLetterheadImageFile(file);
            setRemoveLetterheadImage(false);
            const url = URL.createObjectURL(file);
            setLetterheadImagePreview(url);
        }
    };

    // Save Template
    const handleSave = () => {
        if (!name.trim()) {
            toast.error('Harap masukkan nama template!');
            return;
        }

        const currentHtml = editorRef.current && !sourceMode ? editorRef.current.innerHTML : contentHtml;

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

    // Handle export sample PDF
    const handleExportPdf = () => {
        if (!isEditMode) {
            toast.error('Harap simpan template terlebih dahulu sebelum mengunduh PDF.');
            return;
        }
        const bId = selectedBookingId !== 'sample' ? `?booking_id=${selectedBookingId}` : '';
        window.open(route('document-templates.pdf', template.id) + bId, '_blank');
    };

    return (
        <AuthenticatedLayout>
            <Head title={isEditMode ? `Edit Template: ${name}` : 'Buat Template Dokumen'} />

            <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-background">
                {/* Top Sticky Header */}
                <header className="h-16 px-4 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between gap-3 shrink-0 z-30">
                    <div className="flex items-center gap-3 min-w-0">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-9 rounded-xl shrink-0"
                            onClick={() => setDiscardDialogOpen(true)}
                        >
                            <ArrowLeft className="size-4" />
                        </Button>

                        <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ketik Nama Template..."
                                    className="text-sm sm:text-base font-bold bg-transparent hover:bg-muted/40 focus:bg-background px-2 py-0.5 rounded-lg border-transparent focus:border-border transition-all outline-none text-foreground truncate max-w-xs sm:max-w-md"
                                />
                                {isDefault && (
                                    <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px] shrink-0">
                                        Default Kategori
                                    </Badge>
                                )}
                            </div>
                            <span className="text-[11px] text-muted-foreground px-2">
                                {isEditMode ? 'Mengubah Template Tersimpan' : 'Template Dokumen Baru'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {/* Zoom buttons */}
                        <div className="hidden md:flex items-center bg-muted/50 rounded-xl p-1 border border-border/50 text-xs">
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
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-[10px] px-1.5 text-muted-foreground hover:text-foreground"
                                onClick={() => setZoomPercent(100)}
                            >
                                Reset
                            </Button>
                        </div>

                        {/* View Switcher: Edit vs Preview */}
                        <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border/50">
                            <Button
                                variant={viewMode === 'edit' ? 'default' : 'ghost'}
                                size="sm"
                                className={`h-7 px-2.5 text-xs rounded-lg gap-1.5 transition-all ${
                                    viewMode === 'edit' ? 'shadow-sm' : 'text-muted-foreground hover:text-foreground'
                                }`}
                                onClick={() => setViewMode('edit')}
                            >
                                <PenTool className="size-3.5" />
                                <span>Editor</span>
                            </Button>
                            <Button
                                variant={viewMode === 'preview' ? 'default' : 'ghost'}
                                size="sm"
                                className={`h-7 px-2.5 text-xs rounded-lg gap-1.5 transition-all ${
                                    viewMode === 'preview' ? 'shadow-sm' : 'text-muted-foreground hover:text-foreground'
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
                                title="Cetak PDF ke Tab Baru"
                            >
                                <Printer className="size-3.5" />
                                <span>Cetak PDF</span>
                            </Button>
                        )}

                        {/* Save Button */}
                        <Button
                            size="sm"
                            className="h-9 gap-1.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-md font-semibold px-4"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            <Save className="size-3.5" />
                            <span>{isSaving ? 'Menyimpan...' : 'Simpan Template'}</span>
                        </Button>

                        {/* Toggle Settings Drawer */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`size-9 rounded-xl ${sidebarOpen ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            title="Pengaturan Kertas & Kop"
                        >
                            <Sliders className="size-4" />
                        </Button>
                    </div>
                </header>

                {/* Sub-toolbar: Rich Formatting & Insertions (only in edit view) */}
                {viewMode === 'edit' ? (
                    <div className="px-4 py-2 bg-card/60 border-b border-border/80 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shrink-0">
                        <div className="flex items-center gap-1">
                            {/* Formatting buttons */}
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
                                onClick={() => executeCmd('bold')}
                                title="Tebal (Ctrl+B)"
                            >
                                <Bold className="size-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
                                onClick={() => executeCmd('italic')}
                                title="Miring (Ctrl+I)"
                            >
                                <Italic className="size-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
                                onClick={() => executeCmd('underline')}
                                title="Garis Bawah (Ctrl+U)"
                            >
                                <Underline className="size-4" />
                            </Button>

                            <div className="h-4 w-px bg-border mx-1" />

                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
                                onClick={() => executeCmd('justifyLeft')}
                                title="Rata Kiri"
                            >
                                <AlignLeft className="size-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
                                onClick={() => executeCmd('justifyCenter')}
                                title="Rata Tengah"
                            >
                                <AlignCenter className="size-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
                                onClick={() => executeCmd('justifyRight')}
                                title="Rata Kanan"
                            >
                                <AlignRight className="size-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
                                onClick={() => executeCmd('justifyFull')}
                                title="Rata Kanan-Kiri (Justify)"
                            >
                                <AlignJustify className="size-4" />
                            </Button>

                            <div className="h-4 w-px bg-border mx-1" />

                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
                                onClick={() => executeCmd('insertUnorderedList')}
                                title="Daftar Poin"
                            >
                                <List className="size-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
                                onClick={() => executeCmd('insertOrderedList')}
                                title="Daftar Nomor"
                            >
                                <ListOrdered className="size-4" />
                            </Button>

                            <div className="h-4 w-px bg-border mx-1" />

                            {/* Preset block insertions */}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 text-xs rounded-lg"
                                onClick={handleInsertTable}
                                title="Sisipkan Tabel Rincian Resmi"
                            >
                                <TableIcon className="size-3.5 text-blue-500" />
                                <span>Tabel Rincian</span>
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 text-xs rounded-lg"
                                onClick={handleInsertSignature}
                                title="Sisipkan Blok Tanda Tangan 2 Kolom"
                            >
                                <PenTool className="size-3.5 text-emerald-500" />
                                <span>Tanda Tangan</span>
                            </Button>

                            {/* Dynamic Variable Picker Popover */}
                            <VariablePicker
                                availableTokens={availableTokens}
                                onInsertToken={handleInsertToken}
                            />
                        </div>

                        {/* Toggle Source Code / Visual */}
                        <div className="flex items-center gap-1.5 shrink-0">
                            <Button
                                type="button"
                                variant={sourceMode ? 'default' : 'ghost'}
                                size="sm"
                                className="h-8 gap-1.5 text-xs rounded-lg"
                                onClick={() => {
                                    if (!sourceMode && editorRef.current) {
                                        setContentHtml(editorRef.current.innerHTML);
                                    }
                                    setSourceMode(!sourceMode);
                                }}
                            >
                                <Code className="size-3.5" />
                                <span>{sourceMode ? 'Visual Editor' : 'Kode HTML'}</span>
                            </Button>
                        </div>
                    </div>
                ) : (
                    /* Sub-toolbar when in Preview Mode */
                    <div className="px-4 py-2 bg-card/60 border-b border-border/80 flex items-center justify-between gap-3 shrink-0">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs gap-1 py-1">
                                <Sparkles className="size-3.5" />
                                Mode Pratinjau Langsung (Data Terisi)
                            </Badge>

                            <div className="flex items-center gap-2 ml-2">
                                <span className="text-xs text-muted-foreground">Uji dengan Data Booking:</span>
                                <Select
                                    value={selectedBookingId}
                                    onValueChange={(val) => {
                                        setSelectedBookingId(val);
                                        fetchPreview(val);
                                    }}
                                >
                                    <SelectTrigger className="h-8 w-64 text-xs bg-background">
                                        <SelectValue placeholder="Pilih Booking..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sample">Contoh Data Default (Sample)</SelectItem>
                                        {recentBookings.map((b) => (
                                            <SelectItem key={b.id} value={String(b.id)}>
                                                {b.booking_code} - {b.lead?.name || 'Konsumen'} ({b.unit?.unit_code || 'Unit'})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => fetchPreview(selectedBookingId)}
                            disabled={isRenderingPreview}
                        >
                            <RotateCcw className={`size-3.5 ${isRenderingPreview ? 'animate-spin' : ''}`} />
                            <span>Segarkan Pratinjau</span>
                        </Button>
                    </div>
                )}

                {/* Main Workspace Layout */}
                <div className="flex grow overflow-hidden relative">
                    {/* Left Settings Sidebar Drawer */}
                    {sidebarOpen && (
                        <aside className="w-80 border-r border-border bg-card flex flex-col shrink-0 overflow-hidden z-20 shadow-lg">
                            {/* Drawer Tabs */}
                            <div className="flex border-b border-border p-1 bg-muted/40 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setSidebarTab('canvas')}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg text-center transition-all ${
                                        sidebarTab === 'canvas'
                                            ? 'bg-background text-foreground font-semibold shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Kertas & Margin
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSidebarTab('letterhead')}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg text-center transition-all ${
                                        sidebarTab === 'letterhead'
                                            ? 'bg-background text-foreground font-semibold shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Kop Surat
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSidebarTab('info')}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg text-center transition-all ${
                                        sidebarTab === 'info'
                                            ? 'bg-background text-foreground font-semibold shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Kategori & Info
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="grow overflow-y-auto p-4 space-y-5">
                                {/* TAB 1: Kertas & Margin */}
                                {sidebarTab === 'canvas' && (
                                    <div className="space-y-4">
                                        <div>
                                            <Label className="text-xs font-semibold">Ukuran Kertas (Preset)</Label>
                                            <Select value={paperSize} onValueChange={setPaperSize}>
                                                <SelectTrigger className="mt-1 h-9 text-xs">
                                                    <SelectValue placeholder="Pilih Ukuran Kertas" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="a4">
                                                        A4 (210 × 297 mm) - Standar Surat / Kwitansi
                                                    </SelectItem>
                                                    <SelectItem value="f4">
                                                        F4 / Folio (215 × 330 mm) - Standar Akta / Notaris RI
                                                    </SelectItem>
                                                    <SelectItem value="letter">
                                                        Letter (216 × 279 mm)
                                                    </SelectItem>
                                                    <SelectItem value="legal">
                                                        Legal (216 × 356 mm)
                                                    </SelectItem>
                                                    <SelectItem value="custom">
                                                        Custom Ukuran Bebas (mm)
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {paperSize === 'custom' && (
                                            <div className="p-3 bg-muted/40 rounded-xl border border-border space-y-2">
                                                <p className="text-[11px] font-semibold text-primary">Dimensi Kustom (Milimeter)</p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <Label className="text-[10px] text-muted-foreground">Lebar (mm)</Label>
                                                        <Input
                                                            type="number"
                                                            value={customWidth}
                                                            onChange={(e) => setCustomWidth(Number(e.target.value))}
                                                            className="h-8 text-xs"
                                                            min={50}
                                                            max={500}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-[10px] text-muted-foreground">Tinggi (mm)</Label>
                                                        <Input
                                                            type="number"
                                                            value={customHeight}
                                                            onChange={(e) => setCustomHeight(Number(e.target.value))}
                                                            className="h-8 text-xs"
                                                            min={50}
                                                            max={500}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <Label className="text-xs font-semibold">Orientasi Halaman</Label>
                                            <div className="grid grid-cols-2 gap-2 mt-1">
                                                <Button
                                                    type="button"
                                                    variant={orientation === 'portrait' ? 'default' : 'outline'}
                                                    size="sm"
                                                    className="h-8 text-xs rounded-lg"
                                                    onClick={() => setOrientation('portrait')}
                                                >
                                                    Potret (Tegak)
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant={orientation === 'landscape' ? 'default' : 'outline'}
                                                    size="sm"
                                                    className="h-8 text-xs rounded-lg"
                                                    onClick={() => setOrientation('landscape')}
                                                >
                                                    Lanskap (Mendatar)
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-2 pt-2 border-t border-border">
                                            <Label className="text-xs font-semibold">Margin Halaman (mm)</Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <Label className="text-[10px] text-muted-foreground">Atas (Top)</Label>
                                                    <Input
                                                        type="number"
                                                        value={marginTop}
                                                        onChange={(e) => setMarginTop(Number(e.target.value))}
                                                        className="h-8 text-xs"
                                                        min={0}
                                                        max={100}
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-[10px] text-muted-foreground">Bawah (Bottom)</Label>
                                                    <Input
                                                        type="number"
                                                        value={marginBottom}
                                                        onChange={(e) => setMarginBottom(Number(e.target.value))}
                                                        className="h-8 text-xs"
                                                        min={0}
                                                        max={100}
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-[10px] text-muted-foreground">Kiri (Left)</Label>
                                                    <Input
                                                        type="number"
                                                        value={marginLeft}
                                                        onChange={(e) => setMarginLeft(Number(e.target.value))}
                                                        className="h-8 text-xs"
                                                        min={0}
                                                        max={100}
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-[10px] text-muted-foreground">Kanan (Right)</Label>
                                                    <Input
                                                        type="number"
                                                        value={marginRight}
                                                        onChange={(e) => setMarginRight(Number(e.target.value))}
                                                        className="h-8 text-xs"
                                                        min={0}
                                                        max={100}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-2 flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label className="text-xs font-medium">Garis Panduan Margin</Label>
                                                <p className="text-[10px] text-muted-foreground">Tampilkan garis putus batas cetak</p>
                                            </div>
                                            <Checkbox
                                                checked={showGuides}
                                                onCheckedChange={(checked) => setShowGuides(!!checked)}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* TAB 2: Kop Surat */}
                                {sidebarTab === 'letterhead' && (
                                    <div className="space-y-4">
                                        <div>
                                            <Label className="text-xs font-semibold">Mode Kop Surat</Label>
                                            <Select
                                                value={letterheadMode}
                                                onValueChange={(val: any) => setLetterheadMode(val)}
                                            >
                                                <SelectTrigger className="mt-1 h-9 text-xs">
                                                    <SelectValue placeholder="Pilih Mode Kop Surat" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="default_company">
                                                        Kop Baku Perusahaan (Otomatis dari Pengaturan)
                                                    </SelectItem>
                                                    <SelectItem value="custom_builder">
                                                        Kop Khusus (Atur Judul, Logo & Alamat Sendiri)
                                                    </SelectItem>
                                                    <SelectItem value="custom_image">
                                                        Unggah Gambar Header Penuh (Full Banner)
                                                    </SelectItem>
                                                    <SelectItem value="none">
                                                        Tanpa Kop Surat (Kertas Polos)
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {letterheadMode === 'default_company' && (
                                            <div className="p-3 bg-muted/40 rounded-xl border border-border text-xs space-y-1 text-muted-foreground">
                                                <p className="font-semibold text-foreground">
                                                    {app_settings?.company_name || 'PT CASANUMA MODERN LIVING'}
                                                </p>
                                                <p className="text-[11px]">{app_settings?.company_address || 'Alamat Perusahaan Terpusat'}</p>
                                                <p className="text-[10px] italic">
                                                    Data kop otomatis diambil dari menu Pengaturan Aplikasi.
                                                </p>
                                            </div>
                                        )}

                                        {letterheadMode === 'custom_builder' && (
                                            <div className="space-y-3">
                                                {/* Logo upload */}
                                                <div>
                                                    <Label className="text-xs">Logo Kop Surat</Label>
                                                    {letterheadLogoPreview ? (
                                                        <div className="mt-1 relative border border-border rounded-xl p-2 bg-white flex items-center justify-between">
                                                            <img
                                                                src={letterheadLogoPreview}
                                                                alt="Logo Preview"
                                                                className="h-12 max-w-[120px] object-contain"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="size-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                                                onClick={() => {
                                                                    setLetterheadLogoFile(null);
                                                                    setLetterheadLogoPreview(null);
                                                                    setRemoveLetterheadLogo(true);
                                                                }}
                                                            >
                                                                <Trash2 className="size-3.5" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <label className="mt-1 border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-colors bg-muted/20">
                                                            <Upload className="size-4 text-muted-foreground mb-1" />
                                                            <span className="text-[11px] text-muted-foreground">Unggah Logo (PNG / JPG)</span>
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                className="hidden"
                                                                onChange={handleLogoChange}
                                                            />
                                                        </label>
                                                    )}
                                                </div>

                                                <div>
                                                    <Label className="text-xs">Nama Perusahaan / Judul</Label>
                                                    <Input
                                                        value={letterheadTitle}
                                                        onChange={(e) => setLetterheadTitle(e.target.value)}
                                                        placeholder="PT KREASI HUNIAN MANDIRI"
                                                        className="h-8 text-xs mt-1"
                                                    />
                                                </div>

                                                <div>
                                                    <Label className="text-xs">Subjudul / Bidang Usaha</Label>
                                                    <Input
                                                        value={letterheadSubtitle}
                                                        onChange={(e) => setLetterheadSubtitle(e.target.value)}
                                                        placeholder="Pengembang Kawasan Hunian Syariah"
                                                        className="h-8 text-xs mt-1"
                                                    />
                                                </div>

                                                <div>
                                                    <Label className="text-xs">Alamat Kantor</Label>
                                                    <Textarea
                                                        value={letterheadAddress}
                                                        onChange={(e) => setLetterheadAddress(e.target.value)}
                                                        placeholder="Jl. Raya Utama No. 12, Kota..."
                                                        rows={2}
                                                        className="text-xs mt-1 resize-none"
                                                    />
                                                </div>

                                                <div>
                                                    <Label className="text-xs">Kontak & Website</Label>
                                                    <Input
                                                        value={letterheadContact}
                                                        onChange={(e) => setLetterheadContact(e.target.value)}
                                                        placeholder="Telp: (021) 1234567 | www.perusahaan.com"
                                                        className="h-8 text-xs mt-1"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {letterheadMode === 'custom_image' && (
                                            <div className="space-y-2">
                                                <Label className="text-xs">Unggah Gambar Banner Kop (Rasio Lebar)</Label>
                                                {letterheadImagePreview ? (
                                                    <div className="relative border border-border rounded-xl p-2 bg-white">
                                                        <img
                                                            src={letterheadImagePreview}
                                                            alt="Banner Header"
                                                            className="w-full h-24 object-contain"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="absolute top-1 right-1 size-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                                            onClick={() => {
                                                                setLetterheadImageFile(null);
                                                                setLetterheadImagePreview(null);
                                                                setRemoveLetterheadImage(true);
                                                             }}
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <label className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-muted/20">
                                                        <ImageIcon className="size-6 text-muted-foreground mb-1.5" />
                                                        <span className="text-xs font-medium text-foreground">Pilih File Banner Header</span>
                                                        <span className="text-[10px] text-muted-foreground mt-0.5">PNG, JPG, maks 3MB (Revisi lebar 2100×350px)</span>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={handleImageChange}
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* TAB 3: Kategori & Info */}
                                {sidebarTab === 'info' && (
                                    <div className="space-y-4">
                                        <div>
                                            <Label className="text-xs font-semibold">Kategori Dokumen</Label>
                                            <Select value={category} onValueChange={setCategory}>
                                                <SelectTrigger className="mt-1 h-9 text-xs">
                                                    <SelectValue placeholder="Pilih Kategori" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="receipt">Kwitansi & Pembayaran</SelectItem>
                                                    <SelectItem value="spr">Surat Pesanan Rumah (SPR)</SelectItem>
                                                    <SelectItem value="ppjb">Perjanjian Pengikatan Jual Beli (PPJB)</SelectItem>
                                                    <SelectItem value="bast">Berita Acara Serah Terima (BAST)</SelectItem>
                                                    <SelectItem value="official_letter">Surat Resmi / Pemberitahuan</SelectItem>
                                                    <SelectItem value="custom">Kategori Kustom</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label className="text-xs font-semibold">Deskripsi Template</Label>
                                            <Textarea
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                placeholder="Contoh: Digunakan untuk surat konfirmasi booking unit cluster A..."
                                                rows={3}
                                                className="text-xs mt-1 resize-none"
                                            />
                                        </div>

                                        <div>
                                            <Label className="text-xs font-semibold">Catatan Kaki (Footer Text)</Label>
                                            <Input
                                                value={footerText}
                                                onChange={(e) => setFooterText(e.target.value)}
                                                placeholder="Dokumen sah diterbitkan secara digital oleh Casanuma CRM"
                                                className="h-8 text-xs mt-1"
                                            />
                                        </div>

                                        <div className="pt-2 flex items-start gap-2">
                                            <Checkbox
                                                id="is_default_check"
                                                checked={isDefault}
                                                onCheckedChange={(checked) => setIsDefault(!!checked)}
                                                className="mt-0.5"
                                            />
                                            <div className="space-y-0.5">
                                                <Label htmlFor="is_default_check" className="text-xs font-semibold cursor-pointer">
                                                    Jadikan Template Baku (Default)
                                                </Label>
                                                <p className="text-[11px] text-muted-foreground">
                                                    Template ini akan otomatis dipilih saat mencetak dokumen pada kategori ini.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </aside>
                    )}

                    {/* Center Canvas Work Area */}
                    <main className="grow overflow-auto bg-slate-100 dark:bg-slate-950 flex flex-col items-center relative select-text">
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
                            letterhead={{
                                mode: letterheadMode,
                                logoUrl: letterheadLogoPreview,
                                title: letterheadTitle,
                                subtitle: letterheadSubtitle,
                                address: letterheadAddress,
                                contact: letterheadContact,
                                imageUrl: letterheadImagePreview,
                                companySettings: {
                                    company_name: app_settings?.company_name,
                                    company_address: app_settings?.company_address,
                                    company_phone: app_settings?.company_phone,
                                    company_email: app_settings?.company_email,
                                    logo_light_url: app_settings?.logo_light_url,
                                },
                            }}
                            footerText={footerText}
                        >
                            {/* Visual Editor Mode */}
                            {viewMode === 'edit' && !sourceMode && (
                                <div
                                    ref={editorRef}
                                    contentEditable
                                    suppressContentEditableWarning
                                    onInput={() => {
                                        if (editorRef.current) {
                                            setContentHtml(editorRef.current.innerHTML);
                                        }
                                    }}
                                    className="outline-none min-h-[350px] text-black prose prose-sm max-w-none focus:ring-1 focus:ring-primary/20 rounded p-1 leading-relaxed"
                                />
                            )}

                            {/* HTML Source Code Mode */}
                            {viewMode === 'edit' && sourceMode && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pb-1 border-b border-slate-200">
                                        <span className="font-mono">Sumber HTML Mentah</span>
                                        <span>Dukungan tag CSS & tabel standar</span>
                                    </div>
                                    <textarea
                                        value={contentHtml}
                                        onChange={(e) => setContentHtml(e.target.value)}
                                        rows={18}
                                        className="w-full font-mono text-xs bg-slate-50 text-slate-800 p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                                    />
                                </div>
                            )}

                            {/* Live Preview Mode (With actual/sample data replaced) */}
                            {viewMode === 'preview' && (
                                <div
                                    className="min-h-[350px] text-black prose prose-sm max-w-none leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: previewHtml || contentHtml }}
                                />
                            )}
                        </PaperCanvas>
                    </main>
                </div>
            </div>

            {/* Discard / Leave confirmation dialog using Shadcn Dialog */}
            <Dialog open={discardDialogOpen} onOpenChange={setDiscardDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Tinggalkan Editor?</DialogTitle>
                        <DialogDescription>
                            Perubahan yang belum Anda simpan mungkin akan hilang. Apakah Anda yakin ingin kembali ke daftar template?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setDiscardDialogOpen(false)}
                        >
                            Tetap di Editor
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => router.visit(route('document-templates.index'))}
                        >
                            Tinggalkan Halaman
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
