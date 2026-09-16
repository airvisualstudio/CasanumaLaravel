import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import {
    FileText,
    Plus,
    Search,
    SlidersHorizontal,
    LayoutGrid,
    List,
    Printer,
    Copy,
    Edit3,
    Trash2,
    CheckCircle2,
    Calendar,
    Sparkles,
    Eye,
    Building2,
    Layers,
    FileSpreadsheet,
    Award,
    Receipt as ReceiptIcon,
    AlertCircle,
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
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
import { useAuthorization } from '@/hooks/useAuthorization';
import { toast } from 'sonner';

interface TemplateItem {
    id: number;
    name: string;
    category: string;
    category_label: string;
    description?: string;
    paper_size: string;
    paper_size_label: string;
    orientation: string;
    dimensions_mm: { width: number; height: number };
    letterhead_mode: string;
    is_default: boolean;
    created_at: string;
    updated_at: string;
    creator?: { id: number; name: string };
    updater?: { id: number; name: string };
}

interface IndexProps {
    templates: TemplateItem[];
    filters: {
        category?: string;
        search?: string;
    };
    stats: {
        total: number;
        receipt: number;
        spr: number;
        ppjb: number;
        bast: number;
        official_letter: number;
        custom: number;
    };
}

export default function DocumentTemplatesIndex({
    templates = [],
    filters,
    stats,
}: IndexProps) {
    const { can } = useAuthorization();

    // Default to 'card' view with localStorage persistence as per AGENTS.md
    const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
    const [search, setSearch] = useState(filters.search || '');
    const [activeCategory, setActiveCategory] = useState<string>(filters.category || 'all');

    // Delete dialog state
    const [templateToDelete, setTemplateToDelete] = useState<TemplateItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const savedView = localStorage.getItem('document_templates_view_mode_v2');
        if (savedView === 'table' || savedView === 'card') {
            setViewMode(savedView);
        } else {
            setViewMode('card');
            localStorage.setItem('document_templates_view_mode_v2', 'card');
        }
    }, []);

    const toggleViewMode = (mode: 'card' | 'table') => {
        setViewMode(mode);
        localStorage.setItem('document_templates_view_mode_v2', mode);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('document-templates.index'),
            { search, category: activeCategory },
            { preserveState: true }
        );
    };

    const handleCategoryFilter = (cat: string) => {
        setActiveCategory(cat);
        router.get(
            route('document-templates.index'),
            { search, category: cat },
            { preserveState: true }
        );
    };

    const confirmDelete = () => {
        if (!templateToDelete) return;
        setIsDeleting(true);
        router.delete(route('document-templates.destroy', templateToDelete.id), {
            onSuccess: () => {
                toast.success(`Template "${templateToDelete.name}" berhasil dihapus.`);
                setTemplateToDelete(null);
                setIsDeleting(false);
            },
            onError: () => {
                toast.error('Gagal menghapus template.');
                setIsDeleting(false);
            },
        });
    };

    const getCategoryBadgeClass = (category: string) => {
        switch (category) {
            case 'receipt':
                return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
            case 'spr':
                return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
            case 'ppjb':
                return 'bg-purple-500/10 text-purple-600 border-purple-500/30';
            case 'bast':
                return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
            case 'official_letter':
                return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30';
            default:
                return 'bg-slate-500/10 text-slate-600 border-slate-500/30';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'receipt':
                return <ReceiptIcon className="size-4 text-emerald-500" />;
            case 'spr':
                return <FileSpreadsheet className="size-4 text-blue-500" />;
            case 'ppjb':
                return <Award className="size-4 text-purple-500" />;
            case 'bast':
                return <Building2 className="size-4 text-amber-500" />;
            default:
                return <FileText className="size-4 text-indigo-500" />;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Template & Editor Surat Resmi" />

            <div className="space-y-6">
                {/* Header Title & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <FileText className="size-5" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                                    Editor & Template Surat
                                </h1>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                    Kelola format kwitansi, SPR, PPJB (F4/Folio), BAST, dan surat resmi dengan kop kustom
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {can('manage-document-templates') && (
                            <Button asChild className="h-9 gap-1.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-md">
                                <Link href={route('document-templates.create')}>
                                    <Plus className="size-4" />
                                    <span>Buat Template Baru</span>
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Metric / Category Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div
                        onClick={() => handleCategoryFilter('all')}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                            activeCategory === 'all'
                                ? 'bg-primary/10 border-primary/40 shadow-sm'
                                : 'bg-card border-border hover:border-primary/20'
                        }`}
                    >
                        <span className="text-[11px] font-medium text-muted-foreground">Semua Dokumen</span>
                        <div className="text-xl font-bold text-foreground mt-0.5">{stats.total}</div>
                    </div>

                    <div
                        onClick={() => handleCategoryFilter('receipt')}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                            activeCategory === 'receipt'
                                ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm'
                                : 'bg-card border-border hover:border-emerald-500/20'
                        }`}
                    >
                        <span className="text-[11px] font-medium text-emerald-600">Kwitansi</span>
                        <div className="text-xl font-bold text-foreground mt-0.5">{stats.receipt}</div>
                    </div>

                    <div
                        onClick={() => handleCategoryFilter('spr')}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                            activeCategory === 'spr'
                                ? 'bg-blue-500/10 border-blue-500/40 shadow-sm'
                                : 'bg-card border-border hover:border-blue-500/20'
                        }`}
                    >
                        <span className="text-[11px] font-medium text-blue-600">Surat SPR</span>
                        <div className="text-xl font-bold text-foreground mt-0.5">{stats.spr}</div>
                    </div>

                    <div
                        onClick={() => handleCategoryFilter('ppjb')}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                            activeCategory === 'ppjb'
                                ? 'bg-purple-500/10 border-purple-500/40 shadow-sm'
                                : 'bg-card border-border hover:border-purple-500/20'
                        }`}
                    >
                        <span className="text-[11px] font-medium text-purple-600">PPJB (Folio)</span>
                        <div className="text-xl font-bold text-foreground mt-0.5">{stats.ppjb}</div>
                    </div>

                    <div
                        onClick={() => handleCategoryFilter('bast')}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                            activeCategory === 'bast'
                                ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                                : 'bg-card border-border hover:border-amber-500/20'
                        }`}
                    >
                        <span className="text-[11px] font-medium text-amber-600">BAST Unit</span>
                        <div className="text-xl font-bold text-foreground mt-0.5">{stats.bast}</div>
                    </div>

                    <div
                        onClick={() => handleCategoryFilter('official_letter')}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                            activeCategory === 'official_letter'
                                ? 'bg-indigo-500/10 border-indigo-500/40 shadow-sm'
                                : 'bg-card border-border hover:border-indigo-500/20'
                        }`}
                    >
                        <span className="text-[11px] font-medium text-indigo-600">Surat Resmi</span>
                        <div className="text-xl font-bold text-foreground mt-0.5">{stats.official_letter}</div>
                    </div>
                </div>

                {/* Filters & Multi-View Switcher Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border">
                    <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
                        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama template atau keterangan..."
                            className="h-9 pl-9 pr-3 text-xs rounded-xl bg-background"
                        />
                    </form>

                    <div className="flex items-center gap-2 justify-end">
                        {/* View Switcher: Card vs Table (Default Card) */}
                        <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border/50">
                            <Button
                                variant={viewMode === 'card' ? 'default' : 'ghost'}
                                size="sm"
                                className={`h-7 px-2.5 text-xs rounded-lg gap-1.5 transition-all ${
                                    viewMode === 'card' ? 'shadow-sm' : 'text-muted-foreground hover:text-foreground'
                                }`}
                                onClick={() => toggleViewMode('card')}
                                title="Tampilan Kartu (Default)"
                            >
                                <LayoutGrid className="size-3.5" />
                                <span className="hidden sm:inline">Kartu</span>
                            </Button>
                            <Button
                                variant={viewMode === 'table' ? 'default' : 'ghost'}
                                size="sm"
                                className={`h-7 px-2.5 text-xs rounded-lg gap-1.5 transition-all ${
                                    viewMode === 'table' ? 'shadow-sm' : 'text-muted-foreground hover:text-foreground'
                                }`}
                                onClick={() => toggleViewMode('table')}
                                title="Tampilan Tabel"
                            >
                                <List className="size-3.5" />
                                <span className="hidden sm:inline">Tabel</span>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Templates Listing */}
                {templates.length === 0 ? (
                    <div className="text-center py-16 px-4 bg-card rounded-2xl border border-border border-dashed space-y-3">
                        <div className="size-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto text-muted-foreground">
                            <FileText className="size-6" />
                        </div>
                        <h3 className="text-base font-semibold text-foreground">Belum Ada Template</h3>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                            Tidak ditemukan template dokumen untuk kriteria pencarian ini. Buat template pertama Anda sekarang.
                        </p>
                        {can('manage-document-templates') && (
                            <Button asChild size="sm" className="rounded-xl mt-2 gap-1.5">
                                <Link href={route('document-templates.create')}>
                                    <Plus className="size-4" />
                                    <span>Buat Template</span>
                                </Link>
                            </Button>
                        )}
                    </div>
                ) : viewMode === 'card' ? (
                    /* CARD VIEW (DEFAULT) */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {templates.map((template) => (
                            <Card
                                key={template.id}
                                className="group border-border hover:border-primary/40 hover:shadow-lg transition-all duration-200 rounded-2xl flex flex-col justify-between overflow-hidden bg-card"
                            >
                                <CardHeader className="p-4 pb-2 space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className="size-8 rounded-xl bg-muted flex items-center justify-center shrink-0">
                                                {getCategoryIcon(template.category)}
                                            </div>
                                            <div>
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[10px] font-semibold ${getCategoryBadgeClass(template.category)}`}
                                                >
                                                    {template.category_label}
                                                </Badge>
                                                {template.is_default && (
                                                    <Badge className="ml-1.5 bg-amber-500/10 text-amber-600 border-amber-500/30 text-[9px] py-0 h-4">
                                                        Default
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        <span className="text-[11px] font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">
                                            {template.paper_size_label}
                                        </span>
                                    </div>

                                    <CardTitle className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                        {template.name}
                                    </CardTitle>

                                    <CardDescription className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
                                        {template.description || 'Tidak ada deskripsi tambahan untuk template ini.'}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="p-4 pt-2 space-y-3">
                                    {/* Paper & Letterhead Specs */}
                                    <div className="p-2.5 rounded-xl bg-muted/40 text-[11px] space-y-1">
                                        <div className="flex items-center justify-between text-muted-foreground">
                                            <span>Dimensi Kertas:</span>
                                            <span className="font-semibold text-foreground font-mono">
                                                {template.dimensions_mm.width} × {template.dimensions_mm.height} mm ({template.orientation})
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-muted-foreground">
                                            <span>Format Kop Surat:</span>
                                            <span className="font-medium text-foreground capitalize">
                                                {template.letterhead_mode.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between gap-1 pt-1 border-t border-border/80">
                                        <div className="flex items-center gap-1">
                                            {/* Open PDF sample */}
                                            <Button
                                                    asChild
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                                                    title="Unduh Contoh PDF"
                                                >
                                                <a
                                                    href={route('document-templates.pdf', template.id)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <Printer className="size-3.5" />
                                                    <span className="hidden sm:inline">PDF</span>
                                                </a>
                                            </Button>

                                            {/* Duplicate template */}
                                            {can('manage-document-templates') && (
                                                <Button
                                                    asChild
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                                                    title="Duplikasi sebagai Template Baru"
                                                >
                                                    <Link href={route('document-templates.create', { from_id: template.id })}>
                                                        <Copy className="size-3.5" />
                                                        <span className="hidden sm:inline">Salin</span>
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1">
                                            {can('manage-document-templates') && (
                                                <>
                                                    <Button
                                                        asChild
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 px-2.5 text-xs rounded-lg gap-1 border-primary/30 text-primary hover:bg-primary/10"
                                                    >
                                                        <Link href={route('document-templates.edit', template.id)}>
                                                            <Edit3 className="size-3.5" />
                                                            <span>Edit</span>
                                                        </Link>
                                                    </Button>

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg"
                                                        onClick={() => setTemplateToDelete(template)}
                                                        title="Hapus Template"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    /* TABLE VIEW */
                    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40">
                                    <TableHead className="w-12 text-center font-bold">#</TableHead>
                                    <TableHead className="font-bold">Nama Template</TableHead>
                                    <TableHead className="font-bold">Kategori</TableHead>
                                    <TableHead className="font-bold">Ukuran Kertas</TableHead>
                                    <TableHead className="font-bold">Kop Surat</TableHead>
                                    <TableHead className="font-bold text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {templates.map((template, idx) => (
                                    <TableRow key={template.id} className="hover:bg-muted/30">
                                        <TableCell className="text-center font-mono text-xs text-muted-foreground">
                                            {idx + 1}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-semibold text-foreground text-sm flex items-center gap-2">
                                                <span>{template.name}</span>
                                                {template.is_default && (
                                                    <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[9px] py-0 h-4">
                                                        Default
                                                    </Badge>
                                                )}
                                            </div>
                                            {template.description && (
                                                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                                    {template.description}
                                                </p>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={`text-[11px] ${getCategoryBadgeClass(template.category)}`}
                                            >
                                                {template.category_label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-mono text-xs text-foreground font-medium">
                                                {template.paper_size_label}
                                            </span>
                                            <span className="text-[11px] text-muted-foreground block">
                                                {template.dimensions_mm.width} × {template.dimensions_mm.height} mm ({template.orientation})
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground capitalize">
                                            {template.letterhead_mode.replace('_', ' ')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    asChild
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8 text-muted-foreground hover:text-foreground"
                                                    title="Cetak Contoh PDF"
                                                >
                                                    <a
                                                        href={route('document-templates.pdf', template.id)}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        <Printer className="size-3.5" />
                                                    </a>
                                                </Button>

                                                {can('manage-document-templates') && (
                                                    <>
                                                        <Button
                                                            asChild
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-8 text-muted-foreground hover:text-foreground"
                                                            title="Duplikasi Template"
                                                        >
                                                            <Link href={route('document-templates.create', { from_id: template.id })}>
                                                                <Copy className="size-3.5" />
                                                            </Link>
                                                        </Button>

                                                        <Button
                                                            asChild
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 px-2.5 text-xs rounded-lg gap-1 border-primary/30 text-primary hover:bg-primary/10"
                                                        >
                                                            <Link href={route('document-templates.edit', template.id)}>
                                                                <Edit3 className="size-3.5" />
                                                                <span>Edit</span>
                                                            </Link>
                                                        </Button>

                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg"
                                                            onClick={() => setTemplateToDelete(template)}
                                                            title="Hapus Template"
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog using Shadcn Dialog */}
            <Dialog open={!!templateToDelete} onOpenChange={(open) => !open && setTemplateToDelete(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="size-5" />
                            <span>Hapus Template Dokumen?</span>
                        </DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus template{' '}
                            <strong className="text-foreground">"{templateToDelete?.name}"</strong>? Tindakan ini dapat dipulihkan oleh administrator jika diperlukan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setTemplateToDelete(null)}
                            disabled={isDeleting}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Menghapus...' : 'Ya, Hapus Template'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
