import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState, useMemo, useRef, FormEventHandler } from 'react';
import { 
    Building2, 
    Home, 
    Layers, 
    Plus, 
    Search, 
    Edit2, 
    Trash2, 
    Loader2, 
    MapPin, 
    Phone, 
    CreditCard, 
    CheckCircle2, 
    AlertTriangle, 
    Upload, 
    Image as ImageIcon, 
    ExternalLink, 
    X,
    Filter,
    Building,
    Check,
    Briefcase
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import { useAuthorization } from '@/hooks/useAuthorization';

interface DeveloperData {
    id: number;
    name: string;
    npwp?: string | null;
    office_address?: string | null;
    phone?: string | null;
    logo?: string | null;
    logo_url?: string | null;
    bank_name?: string | null;
    bank_account_number?: string | null;
    bank_account_holder?: string | null;
    is_active: boolean;
    projects_count?: number;
    created_at?: string;
}

interface HousingProjectData {
    id: number;
    developer_id: number;
    name: string;
    city: string;
    address?: string | null;
    area_size?: number | string | null;
    area_unit: string;
    banner_image?: string | null;
    banner_image_url?: string | null;
    formatted_area?: string;
    description?: string | null;
    status: 'planning' | 'active' | 'sold_out';
    developer?: {
        id: number;
        name: string;
        logo?: string | null;
    } | null;
    created_at?: string;
}

interface StatsData {
    total_developers: number;
    active_developers: number;
    total_projects: number;
    active_projects: number;
    total_area_sqm: number;
}

interface PropertiesIndexProps {
    developers: DeveloperData[];
    projects: HousingProjectData[];
    stats: StatsData;
    activeTab?: string;
}

export default function PropertiesIndex({
    developers,
    projects,
    stats,
    activeTab: initialTab = 'developers',
}: PropertiesIndexProps) {
    const { can } = useAuthorization();
    const [activeTab, setActiveTab] = useState<'developers' | 'projects'>(
        initialTab === 'projects' ? 'projects' : 'developers'
    );

    // Search & Filter State
    const [devSearch, setDevSearch] = useState('');
    const [projSearch, setProjSearch] = useState('');
    const [projStatusFilter, setProjStatusFilter] = useState<string>('all');
    const [projDevFilter, setProjDevFilter] = useState<string>('all');

    // Dialog States
    const [devModalOpen, setDevModalOpen] = useState(false);
    const [editingDev, setEditingDev] = useState<DeveloperData | null>(null);

    const [projModalOpen, setProjModalOpen] = useState(false);
    const [editingProj, setEditingProj] = useState<HousingProjectData | null>(null);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{
        type: 'developer' | 'project';
        id: number;
        name: string;
    } | null>(null);

    // File input refs
    const devLogoInputRef = useRef<HTMLInputElement>(null);
    const projBannerInputRef = useRef<HTMLInputElement>(null);

    // Previews
    const [devLogoPreview, setDevLogoPreview] = useState<string | null>(null);
    const [projBannerPreview, setProjBannerPreview] = useState<string | null>(null);

    // Developer Form
    const devForm = useForm({
        name: '',
        npwp: '',
        office_address: '',
        phone: '',
        bank_name: '',
        bank_account_number: '',
        bank_account_holder: '',
        is_active: true,
        logo: null as File | null,
    });

    // Project Form
    const projForm = useForm({
        developer_id: '',
        name: '',
        city: '',
        address: '',
        area_size: '',
        area_unit: 'm²',
        description: '',
        status: 'active' as 'planning' | 'active' | 'sold_out',
        banner_image: null as File | null,
    });

    // ----------------------------------------------------
    // Filtering logic
    // ----------------------------------------------------
    const filteredDevelopers = useMemo(() => {
        const query = devSearch.toLowerCase().trim();
        if (!query) return developers;

        return developers.filter((dev) =>
            dev.name.toLowerCase().includes(query) ||
            (dev.npwp && dev.npwp.toLowerCase().includes(query)) ||
            (dev.office_address && dev.office_address.toLowerCase().includes(query)) ||
            (dev.phone && dev.phone.toLowerCase().includes(query)) ||
            (dev.bank_name && dev.bank_name.toLowerCase().includes(query))
        );
    }, [developers, devSearch]);

    const filteredProjects = useMemo(() => {
        const query = projSearch.toLowerCase().trim();
        return projects.filter((proj) => {
            const matchesQuery =
                !query ||
                proj.name.toLowerCase().includes(query) ||
                proj.city.toLowerCase().includes(query) ||
                (proj.address && proj.address.toLowerCase().includes(query)) ||
                (proj.developer && proj.developer.name.toLowerCase().includes(query));

            const matchesStatus =
                projStatusFilter === 'all' || proj.status === projStatusFilter;

            const matchesDev =
                projDevFilter === 'all' || String(proj.developer_id) === projDevFilter;

            return matchesQuery && matchesStatus && matchesDev;
        });
    }, [projects, projSearch, projStatusFilter, projDevFilter]);

    // ----------------------------------------------------
    // Developer Handlers
    // ----------------------------------------------------
    const handleOpenCreateDev = () => {
        setEditingDev(null);
        setDevLogoPreview(null);
        devForm.reset();
        devForm.clearErrors();
        devForm.setData({
            name: '',
            npwp: '',
            office_address: '',
            phone: '',
            bank_name: '',
            bank_account_number: '',
            bank_account_holder: '',
            is_active: true,
            logo: null,
        });
        setDevModalOpen(true);
    };

    const handleOpenEditDev = (dev: DeveloperData) => {
        setEditingDev(dev);
        setDevLogoPreview(dev.logo_url || null);
        devForm.clearErrors();
        devForm.setData({
            name: dev.name,
            npwp: dev.npwp || '',
            office_address: dev.office_address || '',
            phone: dev.phone || '',
            bank_name: dev.bank_name || '',
            bank_account_number: dev.bank_account_number || '',
            bank_account_holder: dev.bank_account_holder || '',
            is_active: dev.is_active,
            logo: null,
        });
        setDevModalOpen(true);
    };

    const handleDevLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            devForm.setData('logo', file);
            const reader = new FileReader();
            reader.onload = () => {
                setDevLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmitDev: FormEventHandler = (e) => {
        e.preventDefault();

        if (editingDev) {
            // Update
            devForm.post(route('developers.update', editingDev.id), {
                forceFormData: true,
                onSuccess: () => {
                    setDevModalOpen(false);
                },
            });
        } else {
            // Create
            devForm.post(route('developers.store'), {
                forceFormData: true,
                onSuccess: () => {
                    setDevModalOpen(false);
                },
            });
        }
    };

    // ----------------------------------------------------
    // Project Handlers
    // ----------------------------------------------------
    const handleOpenCreateProj = () => {
        setEditingProj(null);
        setProjBannerPreview(null);
        projForm.reset();
        projForm.clearErrors();
        projForm.setData({
            developer_id: developers.length > 0 ? String(developers[0].id) : '',
            name: '',
            city: '',
            address: '',
            area_size: '',
            area_unit: 'm²',
            description: '',
            status: 'active',
            banner_image: null,
        });
        setProjModalOpen(true);
    };

    const handleOpenEditProj = (proj: HousingProjectData) => {
        setEditingProj(proj);
        setProjBannerPreview(proj.banner_image_url || null);
        projForm.clearErrors();
        projForm.setData({
            developer_id: String(proj.developer_id),
            name: proj.name,
            city: proj.city,
            address: proj.address || '',
            area_size: proj.area_size !== null && proj.area_size !== undefined ? String(proj.area_size) : '',
            area_unit: proj.area_unit || 'm²',
            description: proj.description || '',
            status: proj.status,
            banner_image: null,
        });
        setProjModalOpen(true);
    };

    const handleProjBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            projForm.setData('banner_image', file);
            const reader = new FileReader();
            reader.onload = () => {
                setProjBannerPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmitProj: FormEventHandler = (e) => {
        e.preventDefault();

        if (editingProj) {
            projForm.post(route('housing-projects.update', editingProj.id), {
                forceFormData: true,
                onSuccess: () => {
                    setProjModalOpen(false);
                },
            });
        } else {
            projForm.post(route('housing-projects.store'), {
                forceFormData: true,
                onSuccess: () => {
                    setProjModalOpen(false);
                },
            });
        }
    };

    // ----------------------------------------------------
    // Delete Confirmation Handlers
    // ----------------------------------------------------
    const handleConfirmDelete = () => {
        if (!itemToDelete) return;

        if (itemToDelete.type === 'developer') {
            router.delete(route('developers.destroy', itemToDelete.id), {
                onSuccess: () => {
                    setDeleteModalOpen(false);
                    setItemToDelete(null);
                },
            });
        } else {
            router.delete(route('housing-projects.destroy', itemToDelete.id), {
                onSuccess: () => {
                    setDeleteModalOpen(false);
                    setItemToDelete(null);
                },
            });
        }
    };

    // Format number helper
    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('id-ID').format(num);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Master Properti & Kawasan" />

            <div className="space-y-6 pb-12">
                {/* Header & Breadcrumb */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                            <span>Kavling & Properti</span>
                            <span>/</span>
                            <span className="text-primary">Master Data</span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                            <span className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                                <Building2 className="w-5 h-5" />
                            </span>
                            Master Developer & Proyek Perumahan
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Kelola badan usaha Developer (PT) dan Kawasan Proyek Perumahan sebagai fondasi klaster dan unit rumah.
                        </p>
                    </div>

                    {/* Quick Action */}
                    <div className="flex items-center gap-2.5">
                        {can('create-units') && (
                            activeTab === 'developers' ? (
                                <Button
                                    onClick={handleOpenCreateDev}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Tambah Developer PT
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleOpenCreateProj}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                                    disabled={developers.length === 0}
                                    title={developers.length === 0 ? 'Buat Developer PT terlebih dahulu' : ''}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Tambah Proyek Baru
                                </Button>
                            )
                        )}
                    </div>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="border-border/60 bg-card/60 backdrop-blur shadow-xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Total Developer (PT)</p>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <span className="text-2xl font-bold tracking-tight text-foreground">
                                        {stats.total_developers}
                                    </span>
                                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                        ({stats.active_developers} Aktif)
                                    </span>
                                </div>
                            </div>
                            <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                <Briefcase className="w-5 h-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 bg-card/60 backdrop-blur shadow-xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Total Kawasan Proyek</p>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <span className="text-2xl font-bold tracking-tight text-foreground">
                                        {stats.total_projects}
                                    </span>
                                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                        ({stats.active_projects} Berjalan)
                                    </span>
                                </div>
                            </div>
                            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                <Home className="w-5 h-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 bg-card/60 backdrop-blur shadow-xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Akumulasi Luas Kawasan</p>
                                <div className="flex items-baseline gap-1 mt-1">
                                    <span className="text-2xl font-bold tracking-tight text-foreground">
                                        {formatNumber(Math.round(stats.total_area_sqm))}
                                    </span>
                                    <span className="text-xs text-muted-foreground font-semibold">m²</span>
                                </div>
                            </div>
                            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                <Layers className="w-5 h-5" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs Switcher */}
                <div className="flex items-center gap-2 border-b border-border/80 pb-px">
                    <button
                        type="button"
                        onClick={() => setActiveTab('developers')}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer rounded-t-lg",
                            activeTab === 'developers'
                                ? "border-primary text-primary bg-primary/5"
                                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
                        )}
                    >
                        <Building2 className="w-4 h-4" />
                        <span>Developer / PT Pengembang</span>
                        <Badge
                            variant="secondary"
                            className={cn(
                                "ml-1 text-xs px-2 py-0.5",
                                activeTab === 'developers'
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                            )}
                        >
                            {developers.length}
                        </Badge>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('projects')}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer rounded-t-lg",
                            activeTab === 'projects'
                                ? "border-primary text-primary bg-primary/5"
                                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
                        )}
                    >
                        <Home className="w-4 h-4" />
                        <span>Kawasan Proyek Perumahan</span>
                        <Badge
                            variant="secondary"
                            className={cn(
                                "ml-1 text-xs px-2 py-0.5",
                                activeTab === 'projects'
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                            )}
                        >
                            {projects.length}
                        </Badge>
                    </button>
                </div>

                {/* TAB 1: DEVELOPER (PT) */}
                {activeTab === 'developers' && (
                    <div className="space-y-4">
                        {/* Search & Filter Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="relative w-full sm:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari nama PT, NPWP, alamat..."
                                    value={devSearch}
                                    onChange={(e) => setDevSearch(e.target.value)}
                                    className="pl-9 bg-card border-border/80"
                                />
                                {devSearch && (
                                    <button
                                        onClick={() => setDevSearch('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            <div className="text-xs text-muted-foreground">
                                Menampilkan <span className="font-semibold text-foreground">{filteredDevelopers.length}</span> dari {developers.length} Developer PT
                            </div>
                        </div>

                        {/* Developers Table */}
                        <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="w-12 text-center">#</TableHead>
                                        <TableHead>Developer / PT</TableHead>
                                        <TableHead>NPWP</TableHead>
                                        <TableHead>Kontak & Alamat</TableHead>
                                        <TableHead>Rekening Operasional</TableHead>
                                        <TableHead className="text-center">Kawasan Proyek</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                        {can('create-units') && (
                                            <TableHead className="w-28 text-right pr-4">Aksi</TableHead>
                                        )}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredDevelopers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={can('create-units') ? 8 : 7} className="h-44 text-center">
                                                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                                    <Building2 className="w-8 h-8 opacity-40" />
                                                    <p className="text-sm font-medium">
                                                        {devSearch ? 'Tidak ada developer yang cocok dengan pencarian.' : 'Belum ada data Developer (PT).'}
                                                    </p>
                                                    {can('create-units') && !devSearch && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={handleOpenCreateDev}
                                                            className="mt-1"
                                                        >
                                                            <Plus className="w-3.5 h-3.5 mr-1" />
                                                            Tambah Developer Pertama
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredDevelopers.map((dev, index) => (
                                            <TableRow key={dev.id} className="hover:bg-muted/40 transition-colors">
                                                <TableCell className="text-center font-medium text-xs text-muted-foreground">
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        {dev.logo_url ? (
                                                            <img
                                                                src={dev.logo_url}
                                                                alt={dev.name}
                                                                className="w-10 h-10 rounded-lg object-contain border border-border/80 bg-white p-1 shrink-0"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                                                                {dev.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                                                                {dev.name}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                ID: DEV-{String(dev.id).padStart(3, '0')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-xs font-mono text-muted-foreground">
                                                        {dev.npwp || '-'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1 max-w-xs">
                                                        {dev.phone && (
                                                            <div className="flex items-center gap-1.5 text-xs text-foreground">
                                                                <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                                                <span>{dev.phone}</span>
                                                            </div>
                                                        )}
                                                        {dev.office_address ? (
                                                            <div className="flex items-start gap-1.5 text-xs text-muted-foreground line-clamp-2">
                                                                <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                                                <span>{dev.office_address}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground">-</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {dev.bank_account_number ? (
                                                        <div className="space-y-0.5">
                                                            <div className="flex items-center gap-1.5">
                                                                <Badge variant="outline" className="text-[10px] font-semibold px-1.5 py-0 uppercase">
                                                                    {dev.bank_name || 'BANK'}
                                                                </Badge>
                                                                <span className="text-xs font-mono font-medium text-foreground">
                                                                    {dev.bank_account_number}
                                                                </span>
                                                            </div>
                                                            <p className="text-[11px] text-muted-foreground">
                                                                a/n {dev.bank_account_holder || '-'}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge
                                                        variant="secondary"
                                                        className="font-semibold text-xs bg-primary/10 text-primary border-primary/20"
                                                    >
                                                        {dev.projects_count ?? 0} Proyek
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {dev.is_active ? (
                                                        <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[11px]">
                                                            Aktif
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="text-muted-foreground text-[11px]">
                                                            Nonaktif
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                {can('create-units') && (
                                                    <TableCell className="text-right pr-4">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                onClick={() => handleOpenEditDev(dev)}
                                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                                title="Edit Developer"
                                                            >
                                                                <Edit2 className="w-3.5 h-3.5" />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                onClick={() => {
                                                                    setItemToDelete({
                                                                        type: 'developer',
                                                                        id: dev.id,
                                                                        name: dev.name,
                                                                    });
                                                                    setDeleteModalOpen(true);
                                                                }}
                                                                className="h-8 w-8 text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-500/10"
                                                                title="Hapus Developer"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}

                {/* TAB 2: PROYEK PERUMAHAN */}
                {activeTab === 'projects' && (
                    <div className="space-y-4">
                        {/* Search & Filter Bar */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
                                <div className="relative w-full sm:w-72">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Cari nama proyek, kota..."
                                        value={projSearch}
                                        onChange={(e) => setProjSearch(e.target.value)}
                                        className="pl-9 bg-card border-border/80"
                                    />
                                    {projSearch && (
                                        <button
                                            onClick={() => setProjSearch('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>

                                {/* Status Filter using shadcn Select */}
                                <div className="w-full sm:w-44">
                                    <Select
                                        value={projStatusFilter}
                                        onValueChange={setProjStatusFilter}
                                    >
                                        <SelectTrigger className="bg-card border-border/80">
                                            <SelectValue placeholder="Status Proyek" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Status</SelectItem>
                                            <SelectItem value="active">Penjualan Aktif</SelectItem>
                                            <SelectItem value="planning">Perencanaan</SelectItem>
                                            <SelectItem value="sold_out">Sold Out (Habis)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Developer Filter using shadcn Select */}
                                <div className="w-full sm:w-48">
                                    <Select
                                        value={projDevFilter}
                                        onValueChange={setProjDevFilter}
                                    >
                                        <SelectTrigger className="bg-card border-border/80">
                                            <SelectValue placeholder="Semua Developer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Developer PT</SelectItem>
                                            {developers.map((dev) => (
                                                <SelectItem key={dev.id} value={String(dev.id)}>
                                                    {dev.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="text-xs text-muted-foreground">
                                Menampilkan <span className="font-semibold text-foreground">{filteredProjects.length}</span> dari {projects.length} Kawasan Proyek
                            </div>
                        </div>

                        {/* Projects Table */}
                        <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="w-12 text-center">#</TableHead>
                                        <TableHead className="w-56">Kawasan Proyek</TableHead>
                                        <TableHead>Developer Pengembang</TableHead>
                                        <TableHead>Kota & Lokasi</TableHead>
                                        <TableHead>Total Luas</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                        {can('create-units') && (
                                            <TableHead className="w-28 text-right pr-4">Aksi</TableHead>
                                        )}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredProjects.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={can('create-units') ? 7 : 6} className="h-44 text-center">
                                                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                                    <Home className="w-8 h-8 opacity-40" />
                                                    <p className="text-sm font-medium">
                                                        {projSearch || projStatusFilter !== 'all' || projDevFilter !== 'all'
                                                            ? 'Tidak ada proyek yang cocok dengan filter.'
                                                            : 'Belum ada data Kawasan Proyek Perumahan.'}
                                                    </p>
                                                    {can('create-units') && !projSearch && developers.length > 0 && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={handleOpenCreateProj}
                                                            className="mt-1"
                                                        >
                                                            <Plus className="w-3.5 h-3.5 mr-1" />
                                                            Tambah Proyek Pertama
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredProjects.map((proj, index) => (
                                            <TableRow key={proj.id} className="hover:bg-muted/40 transition-colors">
                                                <TableCell className="text-center font-medium text-xs text-muted-foreground">
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-14 h-10 rounded-lg overflow-hidden bg-muted border border-border/80 shrink-0 relative">
                                                            {proj.banner_image_url ? (
                                                                <img
                                                                    src={proj.banner_image_url}
                                                                    alt={proj.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                                                                    <Home className="w-4 h-4" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-foreground text-sm">
                                                                {proj.name}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                ID: PRJ-{String(proj.id).padStart(3, '0')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                                                        <span className="font-medium text-xs text-foreground">
                                                            {proj.developer?.name || 'Developer Unknown'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-0.5 max-w-xs">
                                                        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                                            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                                                            <span>{proj.city}</span>
                                                        </div>
                                                        {proj.address && (
                                                            <p className="text-[11px] text-muted-foreground line-clamp-1">
                                                                {proj.address}
                                                            </p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-xs font-semibold text-foreground">
                                                        <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                                                        <span>{proj.formatted_area || '-'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {proj.status === 'active' && (
                                                        <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[11px]">
                                                            Penjualan Aktif
                                                        </Badge>
                                                    )}
                                                    {proj.status === 'planning' && (
                                                        <Badge className="bg-amber-600 hover:bg-amber-600 text-white text-[11px]">
                                                            Perencanaan
                                                        </Badge>
                                                    )}
                                                    {proj.status === 'sold_out' && (
                                                        <Badge variant="secondary" className="text-muted-foreground text-[11px]">
                                                            Sold Out
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                {can('create-units') && (
                                                    <TableCell className="text-right pr-4">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                onClick={() => handleOpenEditProj(proj)}
                                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                                title="Edit Proyek"
                                                            >
                                                                <Edit2 className="w-3.5 h-3.5" />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                onClick={() => {
                                                                    setItemToDelete({
                                                                        type: 'project',
                                                                        id: proj.id,
                                                                        name: proj.name,
                                                                    });
                                                                    setDeleteModalOpen(true);
                                                                }}
                                                                className="h-8 w-8 text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-500/10"
                                                                title="Hapus Proyek"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}

                {/* ========================================================= */}
                {/* DIALOG 1: TAMBAH / EDIT DEVELOPER (PT)                    */}
                {/* ========================================================= */}
                <Dialog open={devModalOpen} onOpenChange={setDevModalOpen}>
                    <DialogContent className="sm:max-w-3xl p-0 overflow-hidden rounded-2xl border border-border/80 shadow-2xl bg-card">
                        <DialogHeader className="px-6 py-5 border-b border-border/80 bg-muted/20">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <DialogTitle className="text-lg font-bold">
                                        {editingDev ? 'Edit Data Developer (PT)' : 'Tambah Developer (PT) Baru'}
                                    </DialogTitle>
                                    <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                        Masukkan identitas badan hukum developer, kontak operasional kantor, dan nomor rekening perbankan.
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <form onSubmit={handleSubmitDev}>
                            <div className="px-6 py-5 max-h-[72vh] overflow-y-auto space-y-5 [scrollbar-width:thin]">
                                {/* Section 1: Identitas Legal & Operasional */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        <Building className="w-3.5 h-3.5 text-primary" />
                                        <span>Identitas Perusahaan / PT</span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="dev_name" className="text-xs font-semibold">
                                                Nama PT / Pengembang <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="dev_name"
                                                placeholder="Contoh: PT Casanuma Modern Living"
                                                value={devForm.data.name}
                                                onChange={(e) => devForm.setData('name', e.target.value)}
                                                className="h-10 text-sm"
                                                required
                                            />
                                            {devForm.errors.name && (
                                                <p className="text-xs text-destructive">{devForm.errors.name}</p>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="dev_npwp" className="text-xs font-semibold">
                                                NPWP Perusahaan
                                            </Label>
                                            <Input
                                                id="dev_npwp"
                                                placeholder="Contoh: 01.892.456.7-428.000"
                                                value={devForm.data.npwp}
                                                onChange={(e) => devForm.setData('npwp', e.target.value)}
                                                className="h-10 text-sm font-mono"
                                            />
                                            {devForm.errors.npwp && (
                                                <p className="text-xs text-destructive">{devForm.errors.npwp}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="dev_phone" className="text-xs font-semibold">
                                                No. Telp / WhatsApp Kantor
                                            </Label>
                                            <Input
                                                id="dev_phone"
                                                placeholder="Contoh: 022-86813400 atau 08123456789"
                                                value={devForm.data.phone}
                                                onChange={(e) => devForm.setData('phone', e.target.value)}
                                                className="h-10 text-sm"
                                            />
                                            {devForm.errors.phone && (
                                                <p className="text-xs text-destructive">{devForm.errors.phone}</p>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold">
                                                Status Keaktifan
                                            </Label>
                                            <div className="flex items-center gap-3 h-10 px-3 rounded-lg border border-border/70 bg-muted/10">
                                                <button
                                                    type="button"
                                                    onClick={() => devForm.setData('is_active', !devForm.data.is_active)}
                                                    className={cn(
                                                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden",
                                                        devForm.data.is_active ? "bg-primary" : "bg-muted"
                                                    )}
                                                >
                                                    <span
                                                        className={cn(
                                                            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
                                                            devForm.data.is_active ? "translate-x-5" : "translate-x-0"
                                                        )}
                                                    />
                                                </button>
                                                <span className="text-xs font-medium text-foreground">
                                                    {devForm.data.is_active ? 'Developer Aktif' : 'Developer Nonaktif'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="dev_address" className="text-xs font-semibold">
                                            Alamat Kantor Operasional
                                        </Label>
                                        <Textarea
                                            id="dev_address"
                                            placeholder="Jl. Boulevard Utama No. 88, Kawasan Niaga Kota Baru Parahyangan, Bandung Barat"
                                            value={devForm.data.office_address}
                                            onChange={(e) => devForm.setData('office_address', e.target.value)}
                                            rows={2}
                                            className="text-sm"
                                        />
                                        {devForm.errors.office_address && (
                                            <p className="text-xs text-destructive">{devForm.errors.office_address}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Section 2: Logo Developer */}
                                <div className="space-y-2 pt-1 border-t border-border/60">
                                    <Label className="text-xs font-semibold">
                                        Logo Developer / PT
                                    </Label>
                                    <div className="flex items-center gap-4 p-3 rounded-xl border border-border/70 bg-muted/10">
                                        <div className="w-16 h-16 rounded-xl border border-border/80 bg-background flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                                            {devLogoPreview ? (
                                                <img
                                                    src={devLogoPreview}
                                                    alt="Preview"
                                                    className="w-full h-full object-contain p-1"
                                                />
                                            ) : (
                                                <Building2 className="w-7 h-7 text-muted-foreground/30" />
                                            )}
                                        </div>
                                        <div className="space-y-1.5">
                                            <input
                                                ref={devLogoInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleDevLogoChange}
                                            />
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => devLogoInputRef.current?.click()}
                                                    className="h-8 text-xs bg-background"
                                                >
                                                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                                                    {devLogoPreview ? 'Ganti Logo PT' : 'Pilih File Logo'}
                                                </Button>
                                                {devLogoPreview && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setDevLogoPreview(null);
                                                            devForm.setData('logo', null);
                                                        }}
                                                        className="h-8 text-xs text-muted-foreground hover:text-destructive"
                                                    >
                                                        Hapus
                                                    </Button>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-muted-foreground">
                                                Format PNG, JPG, atau WebP (transparan lebih disukai). Maksimal 2MB.
                                            </p>
                                        </div>
                                    </div>
                                    {devForm.errors.logo && (
                                        <p className="text-xs text-destructive">{devForm.errors.logo}</p>
                                    )}
                                </div>

                                {/* Section 3: Rekening Operasional */}
                                <div className="rounded-xl border border-border/80 p-4 bg-muted/20 space-y-3.5">
                                    <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                                        <CreditCard className="w-4 h-4 text-primary" />
                                        <span>Rekening Operasional Transaksi Developer</span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="bank_name" className="text-xs font-medium">
                                                Nama Bank
                                            </Label>
                                            <Input
                                                id="bank_name"
                                                placeholder="BCA, Mandiri, BRI..."
                                                value={devForm.data.bank_name}
                                                onChange={(e) => devForm.setData('bank_name', e.target.value)}
                                                className="h-9 text-xs bg-background"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="bank_acc_no" className="text-xs font-medium">
                                                Nomor Rekening
                                            </Label>
                                            <Input
                                                id="bank_acc_no"
                                                placeholder="7720991823"
                                                value={devForm.data.bank_account_number}
                                                onChange={(e) => devForm.setData('bank_account_number', e.target.value)}
                                                className="h-9 text-xs font-mono bg-background"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="bank_acc_holder" className="text-xs font-medium">
                                                Atas Nama Rekening
                                            </Label>
                                            <Input
                                                id="bank_acc_holder"
                                                placeholder="PT Casanuma Modern Living"
                                                value={devForm.data.bank_account_holder}
                                                onChange={(e) => devForm.setData('bank_account_holder', e.target.value)}
                                                className="h-9 text-xs bg-background"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="px-6 py-4 border-t border-border/80 bg-muted/20 flex items-center justify-end gap-2.5">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setDevModalOpen(false)}
                                    disabled={devForm.processing}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={devForm.processing}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                                >
                                    {devForm.processing && (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    )}
                                    {editingDev ? 'Simpan Perubahan' : 'Tambah Developer'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* ========================================================= */}
                {/* DIALOG 2: TAMBAH / EDIT PROYEK PERUMAHAN                  */}
                {/* ========================================================= */}
                <Dialog open={projModalOpen} onOpenChange={setProjModalOpen}>
                    <DialogContent className="sm:max-w-3xl p-0 overflow-hidden rounded-2xl border border-border/80 shadow-2xl bg-card">
                        <DialogHeader className="px-6 py-5 border-b border-border/80 bg-muted/20">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                                    <Home className="w-5 h-5" />
                                </div>
                                <div>
                                    <DialogTitle className="text-lg font-bold">
                                        {editingProj ? 'Edit Kawasan Proyek' : 'Tambah Proyek Perumahan Baru'}
                                    </DialogTitle>
                                    <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                        Daftarkan nama kawasan proyek, relasi developer PT pengembang, lokasi kota, dan total luas lahan.
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <form onSubmit={handleSubmitProj}>
                            <div className="px-6 py-5 max-h-[72vh] overflow-y-auto space-y-5 [scrollbar-width:thin]">
                                {/* Section 1: Relasi & Status */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        <Layers className="w-3.5 h-3.5 text-primary" />
                                        <span>Data Master Kawasan</span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold">
                                                Developer / PT Pengembang <span className="text-destructive">*</span>
                                            </Label>
                                            <Select
                                                value={projForm.data.developer_id}
                                                onValueChange={(val) => projForm.setData('developer_id', val)}
                                            >
                                                <SelectTrigger className="h-10 text-sm">
                                                    <SelectValue placeholder="Pilih Developer PT" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {developers.map((dev) => (
                                                        <SelectItem key={dev.id} value={String(dev.id)}>
                                                            {dev.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {projForm.errors.developer_id && (
                                                <p className="text-xs text-destructive">{projForm.errors.developer_id}</p>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold">
                                                Status Proyek <span className="text-destructive">*</span>
                                            </Label>
                                            <Select
                                                value={projForm.data.status}
                                                onValueChange={(val: 'planning' | 'active' | 'sold_out') =>
                                                    projForm.setData('status', val)
                                                }
                                            >
                                                <SelectTrigger className="h-10 text-sm">
                                                    <SelectValue placeholder="Pilih Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">Penjualan Aktif</SelectItem>
                                                    <SelectItem value="planning">Perencanaan (Coming Soon)</SelectItem>
                                                    <SelectItem value="sold_out">Sold Out (Habis)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {projForm.errors.status && (
                                                <p className="text-xs text-destructive">{projForm.errors.status}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="proj_name" className="text-xs font-semibold">
                                                Nama Kawasan Proyek <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="proj_name"
                                                placeholder="Contoh: Casanuma Highland Resort & Residence"
                                                value={projForm.data.name}
                                                onChange={(e) => projForm.setData('name', e.target.value)}
                                                className="h-10 text-sm"
                                                required
                                            />
                                            {projForm.errors.name && (
                                                <p className="text-xs text-destructive">{projForm.errors.name}</p>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="proj_city" className="text-xs font-semibold">
                                                Kota / Wilayah Lokasi <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="proj_city"
                                                placeholder="Contoh: Bandung Barat"
                                                value={projForm.data.city}
                                                onChange={(e) => projForm.setData('city', e.target.value)}
                                                className="h-10 text-sm"
                                                required
                                            />
                                            {projForm.errors.city && (
                                                <p className="text-xs text-destructive">{projForm.errors.city}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                        <div className="sm:col-span-2 space-y-1.5">
                                            <Label htmlFor="proj_area" className="text-xs font-semibold">
                                                Total Luas Kawasan
                                            </Label>
                                            <Input
                                                id="proj_area"
                                                type="number"
                                                step="0.01"
                                                placeholder="Contoh: 45000"
                                                value={projForm.data.area_size}
                                                onChange={(e) => projForm.setData('area_size', e.target.value)}
                                                className="h-10 text-sm"
                                            />
                                            {projForm.errors.area_size && (
                                                <p className="text-xs text-destructive">{projForm.errors.area_size}</p>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold">
                                                Satuan Luas
                                            </Label>
                                            <Select
                                                value={projForm.data.area_unit}
                                                onValueChange={(val) => projForm.setData('area_unit', val)}
                                            >
                                                <SelectTrigger className="h-10 text-sm">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="m²">m² (Meter Persegi)</SelectItem>
                                                    <SelectItem value="Ha">Ha (Hektar)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="proj_address" className="text-xs font-semibold">
                                            Alamat Lengkap Lokasi Proyek
                                        </Label>
                                        <Textarea
                                            id="proj_address"
                                            placeholder="Jl. Kolonel Masturi KM 4.5, Desa Cisarua, Lembang, Kab. Bandung Barat"
                                            value={projForm.data.address}
                                            onChange={(e) => projForm.setData('address', e.target.value)}
                                            rows={2}
                                            className="text-sm"
                                        />
                                        {projForm.errors.address && (
                                            <p className="text-xs text-destructive">{projForm.errors.address}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Section 2: Banner Image */}
                                <div className="space-y-2 pt-1 border-t border-border/60">
                                    <Label className="text-xs font-semibold">
                                        Banner / Foto Gerbang / Masterplan Proyek
                                    </Label>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 rounded-xl border border-border/70 bg-muted/10">
                                        <div className="w-full sm:w-52 h-28 rounded-xl border border-border/80 bg-background flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                                            {projBannerPreview ? (
                                                <img
                                                    src={projBannerPreview}
                                                    alt="Banner Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center text-muted-foreground/40 gap-1.5">
                                                    <ImageIcon className="w-7 h-7" />
                                                    <span className="text-[11px] font-medium">Preview Banner Proyek</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-1.5">
                                            <input
                                                ref={projBannerInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleProjBannerChange}
                                            />
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => projBannerInputRef.current?.click()}
                                                    className="h-8 text-xs bg-background"
                                                >
                                                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                                                    {projBannerPreview ? 'Ganti Banner' : 'Upload Foto Banner'}
                                                </Button>
                                                {projBannerPreview && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setProjBannerPreview(null);
                                                            projForm.setData('banner_image', null);
                                                        }}
                                                        className="h-8 text-xs text-muted-foreground hover:text-destructive"
                                                    >
                                                        Hapus
                                                    </Button>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-muted-foreground">
                                                Format JPG, PNG, atau WebP resolusi landscape (16:9 disarankan). Maksimal 5MB.
                                            </p>
                                        </div>
                                    </div>
                                    {projForm.errors.banner_image && (
                                        <p className="text-xs text-destructive">{projForm.errors.banner_image}</p>
                                    )}
                                </div>

                                {/* Section 3: Deskripsi */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="proj_desc" className="text-xs font-semibold">
                                        Deskripsi Singkat & Keunggulan Kawasan
                                    </Label>
                                    <Textarea
                                        id="proj_desc"
                                        placeholder="Kawasan hunian premium bernuansa villa resort dengan hawa sejuk pegunungan dan pemandangan lembah kota Bandung..."
                                        value={projForm.data.description}
                                        onChange={(e) => projForm.setData('description', e.target.value)}
                                        rows={2}
                                        className="text-sm"
                                    />
                                </div>
                            </div>

                            <DialogFooter className="px-6 py-4 border-t border-border/80 bg-muted/20 flex items-center justify-end gap-2.5">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setProjModalOpen(false)}
                                    disabled={projForm.processing}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={projForm.processing}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                                >
                                    {projForm.processing && (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    )}
                                    {editingProj ? 'Simpan Perubahan' : 'Tambah Proyek'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* ========================================================= */}
                {/* DIALOG 3: KONFIRMASI HAPUS (SHADCN DIALOG)                */}
                {/* ========================================================= */}
                <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                    <DialogContent className="sm:max-w-md p-6 rounded-2xl border border-border/80 shadow-2xl bg-card">
                        <DialogHeader>
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-2">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <DialogTitle className="text-center text-lg font-bold">
                                Konfirmasi Hapus Data
                            </DialogTitle>
                            <DialogDescription className="text-center pt-1 text-xs text-muted-foreground">
                                Apakah Anda yakin ingin menghapus {itemToDelete?.type === 'developer' ? 'Developer PT' : 'Kawasan Proyek'}{' '}
                                <span className="font-semibold text-foreground">"{itemToDelete?.name}"</span>?
                                {itemToDelete?.type === 'developer' && (
                                    <p className="text-destructive font-medium text-xs mt-2">
                                        Peringatan: Seluruh proyek yang terkait dengan developer ini juga akan ikut terhapus.
                                    </p>
                                )}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex gap-2.5 sm:justify-center pt-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setDeleteModalOpen(false);
                                    setItemToDelete(null);
                                }}
                            >
                                Batal
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleConfirmDelete}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                Ya, Hapus Data
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AuthenticatedLayout>
    );
}
