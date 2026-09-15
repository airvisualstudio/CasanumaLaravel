import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState, useMemo, FormEventHandler } from 'react';
import {
    Home,
    Building2,
    Layers,
    Plus,
    Search,
    Edit2,
    Trash2,
    Loader2,
    AlertTriangle,
    X,
    Filter,
    CheckCircle2,
    Clock,
    Lock,
    PauseCircle,
    MapPin,
    DollarSign,
    Building,
    FileText,
    Sparkles,
    Eye,
    UserCheck,
    Phone,
    LayoutGrid,
    List,
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

interface ProjectOption {
    id: number;
    name: string;
}

interface ClusterOption {
    id: number;
    housing_project_id: number;
    name: string;
    project?: {
        id: number;
        name: string;
    } | null;
}

interface UnitTypeOption {
    id: number;
    housing_project_id: number;
    name: string;
    surface_area: number | string;
    building_area: number | string;
    project?: {
        id: number;
        name: string;
    } | null;
}

interface HousingUnitData {
    id: number;
    cluster_id: number;
    unit_type_id: number;
    block: string;
    unit_number: string;
    unit_code: string;
    base_price: number | string;
    formatted_price: string;
    status: 'available' | 'booked' | 'sold' | 'hold';
    svg_element_id?: string | null;
    notes?: string | null;
    cluster?: {
        id: number;
        name: string;
        project?: {
            id: number;
            name: string;
        } | null;
    } | null;
    unit_type?: {
        id: number;
        name: string;
        surface_area: number | string;
        building_area: number | string;
        bedrooms: number;
        bathrooms: number;
        brochure_file?: string | null;
    } | null;
    active_booking?: {
        id: number;
        booking_code: string;
        status: string;
        payment_scheme?: string;
        lead?: {
            id: number;
            name: string;
            whatsapp?: string;
            email?: string;
        } | null;
        sales?: {
            id: number;
            name: string;
            email?: string;
        } | null;
    } | null;
    created_at?: string;
}

interface PaginatedUnits {
    data: HousingUnitData[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

interface InventoryStats {
    total: number;
    available: number;
    booked: number;
    sold: number;
    hold: number;
    total_value: number;
}

interface Props {
    units: PaginatedUnits;
    projects: ProjectOption[];
    clusters: ClusterOption[];
    unitTypes: UnitTypeOption[];
    stats: InventoryStats;
    filters?: {
        search?: string;
        project_id?: string;
        cluster_id?: string;
        unit_type_id?: string;
        status?: string;
    };
}

export default function UnitsIndex({
    units,
    projects,
    clusters,
    unitTypes,
    stats,
    filters,
}: Props) {
    const { can, isSuperAdmin } = useAuthorization();
    const hasUnitActions = isSuperAdmin || can('edit-units') || can('delete-units');

    // Filters state
    const [search, setSearch] = useState(filters?.search || '');
    const [projectId, setProjectId] = useState<string>(filters?.project_id || 'all');
    const [clusterId, setClusterId] = useState<string>(filters?.cluster_id || 'all');
    const [unitTypeId, setUnitTypeId] = useState<string>(filters?.unit_type_id || 'all');
    const [statusFilter, setStatusFilter] = useState<string>(filters?.status || 'all');

    // View Mode (Table View vs Card View) with localStorage persistence - default 'card'
    const [viewMode, setViewMode] = useState<'table' | 'card'>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('units_view_mode_v2') as 'table' | 'card') || 'card';
        }
        return 'card';
    });

    const handleToggleViewMode = (mode: 'table' | 'card') => {
        setViewMode(mode);
        if (typeof window !== 'undefined') {
            localStorage.setItem('units_view_mode_v2', mode);
        }
    };

    // Dialog state
    const [unitDialogOpen, setUnitDialogOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState<HousingUnitData | null>(null);

    // Delete dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [unitToDelete, setUnitToDelete] = useState<HousingUnitData | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Quick status change dialog
    const [statusChangeDialogOpen, setStatusChangeDialogOpen] = useState(false);
    const [targetUnitForStatus, setTargetUnitForStatus] = useState<HousingUnitData | null>(null);
    const [selectedNewStatus, setSelectedNewStatus] = useState<string>('available');

    // Unit Form
    const unitForm = useForm({
        cluster_id: '',
        unit_type_id: '',
        block: '',
        unit_number: '',
        unit_code: '',
        base_price: '',
        status: 'available',
        svg_element_id: '',
        notes: '',
    });

    // Filter clusters by chosen project in modal (optional)
    const [modalProjectId, setModalProjectId] = useState<string>(
        projects[0]?.id?.toString() || ''
    );

    const availableModalClusters = useMemo(() => {
        const pId = parseInt(modalProjectId);
        if (!pId) return clusters;
        return clusters.filter(c => c.housing_project_id === pId);
    }, [clusters, modalProjectId]);

    const availableModalUnitTypes = useMemo(() => {
        const pId = parseInt(modalProjectId);
        if (!pId) return unitTypes;
        return unitTypes.filter(ut => ut.housing_project_id === pId);
    }, [unitTypes, modalProjectId]);

    // Format currency helper
    const formatRp = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val);
    };

    // Apply Filters
    const handleApplyFilter = () => {
        router.get(
            route('units.index'),
            {
                search: search || undefined,
                project_id: projectId !== 'all' ? projectId : undefined,
                cluster_id: clusterId !== 'all' ? clusterId : undefined,
                unit_type_id: unitTypeId !== 'all' ? unitTypeId : undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleResetFilters = () => {
        setSearch('');
        setProjectId('all');
        setClusterId('all');
        setUnitTypeId('all');
        setStatusFilter('all');
        router.get(route('units.index'));
    };

    // Open Create Modal
    const handleOpenCreate = () => {
        setEditingUnit(null);
        const defaultCluster = clusters[0]?.id?.toString() || '';
        const defaultUnitType = unitTypes[0]?.id?.toString() || '';
        const defaultProject = clusters[0]?.housing_project_id?.toString() || projects[0]?.id?.toString() || '';

        setModalProjectId(defaultProject);
        unitForm.reset();
        unitForm.setData({
            cluster_id: defaultCluster,
            unit_type_id: defaultUnitType,
            block: '',
            unit_number: '',
            unit_code: '',
            base_price: '',
            status: 'available',
            svg_element_id: '',
            notes: '',
        });
        unitForm.clearErrors();
        setUnitDialogOpen(true);
    };

    // Open Edit Modal
    const handleOpenEdit = (unit: HousingUnitData) => {
        setEditingUnit(unit);
        const currentCluster = clusters.find(c => c.id === unit.cluster_id);
        if (currentCluster) {
            setModalProjectId(currentCluster.housing_project_id.toString());
        }

        unitForm.setData({
            cluster_id: unit.cluster_id.toString(),
            unit_type_id: unit.unit_type_id.toString(),
            block: unit.block,
            unit_number: unit.unit_number,
            unit_code: unit.unit_code,
            base_price: String(unit.base_price),
            status: unit.status,
            svg_element_id: unit.svg_element_id || '',
            notes: unit.notes || '',
        });
        unitForm.clearErrors();
        setUnitDialogOpen(true);
    };

    const handleSubmitUnit: FormEventHandler = (e) => {
        e.preventDefault();
        if (editingUnit) {
            unitForm.put(route('units.update', editingUnit.id), {
                onSuccess: () => setUnitDialogOpen(false),
            });
        } else {
            unitForm.post(route('units.store'), {
                onSuccess: () => setUnitDialogOpen(false),
            });
        }
    };

    // Delete Unit
    const confirmDelete = (unit: HousingUnitData) => {
        setUnitToDelete(unit);
        setDeleteDialogOpen(true);
    };

    const handleDelete = () => {
        if (!unitToDelete) return;
        setIsDeleting(true);

        router.delete(route('units.destroy', unitToDelete.id), {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteDialogOpen(false);
                setUnitToDelete(null);
            },
        });
    };

    // Quick Status Change
    const openQuickStatusChange = (unit: HousingUnitData) => {
        setTargetUnitForStatus(unit);
        setSelectedNewStatus(unit.status);
        setStatusChangeDialogOpen(true);
    };

    const handleSaveStatusChange = () => {
        if (!targetUnitForStatus) return;
        router.patch(route('units.update-status', targetUnitForStatus.id), {
            status: selectedNewStatus,
        }, {
            onSuccess: () => {
                setStatusChangeDialogOpen(false);
                setTargetUnitForStatus(null);
            }
        });
    };

    // Status Badge Component
    const renderStatusBadge = (status: string) => {
        switch (status) {
            case 'available':
                return (
                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1">
                        <CheckCircle2 className="size-3" />
                        Available
                    </Badge>
                );
            case 'booked':
                return (
                    <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 gap-1">
                        <Clock className="size-3" />
                        Booked
                    </Badge>
                );
            case 'sold':
                return (
                    <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 gap-1">
                        <Lock className="size-3" />
                        Sold
                    </Badge>
                );
            case 'hold':
                return (
                    <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1">
                        <PauseCircle className="size-3" />
                        Hold
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Unit & Kavling - Master Properti" />

            <div className="space-y-6">
                {/* Header Page */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                            <Home className="size-6 text-primary" />
                            Unit & Kavling
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Manajemen inventori kavling rumah, harga dasar, status penjualan, dan ID peta site plan SVG.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {can('create-units') && (
                            <Button
                                onClick={handleOpenCreate}
                                className="h-10 px-4 gap-2 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 font-medium"
                            >
                                <Plus className="size-4" />
                                Tambah Unit Kavling
                            </Button>
                        )}
                    </div>
                </div>

                {/* Inventory Summary KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    <Card className="shadow-none border-border/80">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Total Kavling</p>
                                <h3 className="text-2xl font-bold text-foreground mt-1">{stats.total}</h3>
                                <p className="text-[11px] text-muted-foreground mt-0.5">Semua unit properti</p>
                            </div>
                            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Home className="size-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-none border-border/80 border-l-4 border-l-emerald-500">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Available (Tersedia)</p>
                                <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.available}</h3>
                                <p className="text-[11px] text-muted-foreground mt-0.5">Siap dipasarkan</p>
                            </div>
                            <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="size-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-none border-border/80 border-l-4 border-l-blue-500">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Booked (Tanda Jadi)</p>
                                <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.booked}</h3>
                                <p className="text-[11px] text-muted-foreground mt-0.5">Dalam proses berkas</p>
                            </div>
                            <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <Clock className="size-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-none border-border/80 border-l-4 border-l-rose-500">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Sold (Akad Terjual)</p>
                                <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{stats.sold}</h3>
                                <p className="text-[11px] text-muted-foreground mt-0.5">Selesai akad / cash</p>
                            </div>
                            <div className="size-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
                                <Lock className="size-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-none border-border/80 border-l-4 border-l-amber-500 col-span-2 sm:col-span-1">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Hold (Ditahan)</p>
                                <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.hold}</h3>
                                <p className="text-[11px] text-muted-foreground mt-0.5">Spesial / blok developer</p>
                            </div>
                            <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                <PauseCircle className="size-5" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter & Search Panel */}
                <Card className="shadow-none border-border/80">
                    <CardContent className="p-4 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                            <div className="relative sm:col-span-2 lg:col-span-2">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari Blok / No / Kode / SVG ID..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
                                    className="pl-9 h-10 bg-background"
                                />
                                {search && (
                                    <button
                                        onClick={() => setSearch('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="size-4" />
                                    </button>
                                )}
                            </div>

                            <div>
                                <Select value={projectId} onValueChange={setProjectId}>
                                    <SelectTrigger className="h-10 bg-background">
                                        <SelectValue placeholder="Proyek" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Proyek</SelectItem>
                                        {projects.map((p) => (
                                            <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Select value={clusterId} onValueChange={setClusterId}>
                                    <SelectTrigger className="h-10 bg-background">
                                        <SelectValue placeholder="Cluster" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Cluster</SelectItem>
                                        {clusters.map((c) => (
                                            <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="h-10 bg-background">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        <SelectItem value="available">Available</SelectItem>
                                        <SelectItem value="booked">Booked</SelectItem>
                                        <SelectItem value="sold">Sold</SelectItem>
                                        <SelectItem value="hold">Hold</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={handleApplyFilter}
                                    className="h-10 flex-1 bg-primary text-primary-foreground gap-1.5"
                                >
                                    <Filter className="size-3.5" />
                                    Filter
                                </Button>
                                {(search || projectId !== 'all' || clusterId !== 'all' || statusFilter !== 'all') && (
                                    <Button
                                        variant="outline"
                                        onClick={handleResetFilters}
                                        className="h-10 px-3 text-xs"
                                    >
                                        Reset
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Units Datatable Card */}
                <Card className="shadow-none border-border/80">
                    <CardHeader className="px-6 py-4 border-b border-border/70 flex flex-row items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-base font-semibold">Daftar Kavling & Unit Rumah</CardTitle>
                            <CardDescription className="text-xs">
                                Menampilkan {units.data.length} dari total {units.total} unit
                            </CardDescription>
                        </div>

                        {/* View Mode Switcher: Table View vs Card View */}
                        <div className="flex items-center bg-muted/80 p-0.5 rounded-lg border border-border/60 shrink-0">
                            <button
                                type="button"
                                onClick={() => handleToggleViewMode('table')}
                                className={cn(
                                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer",
                                    viewMode === 'table'
                                        ? "bg-background text-foreground shadow-xs ring-1 ring-border/50"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                                title="Tampilan Tabel"
                            >
                                <List className="size-3.5" />
                                <span className="hidden sm:inline">Tabel</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleToggleViewMode('card')}
                                className={cn(
                                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer",
                                    viewMode === 'card'
                                        ? "bg-background text-foreground shadow-xs ring-1 ring-border/50"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                                title="Tampilan Kartu"
                            >
                                <LayoutGrid className="size-3.5" />
                                <span className="hidden sm:inline">Kartu</span>
                            </button>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {viewMode === 'card' ? (
                            <div className="p-5">
                                {units.data.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        Tidak ada unit kavling yang sesuai dengan pencarian / filter.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {units.data.map((unit) => (
                                            <Card key={unit.id} className="overflow-hidden border border-border/80 hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between">
                                                <div className="p-4 space-y-3">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div>
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                {can('edit-units') ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleOpenEdit(unit)}
                                                                        className="font-bold text-base text-foreground tracking-tight hover:text-primary hover:underline transition-colors text-left cursor-pointer"
                                                                        title="Klik untuk edit data unit ini"
                                                                    >
                                                                        {unit.unit_code}
                                                                    </button>
                                                                ) : (
                                                                    <h4 className="font-bold text-base text-foreground tracking-tight">
                                                                        {unit.unit_code}
                                                                    </h4>
                                                                )}
                                                                {can('edit-units') ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openQuickStatusChange(unit)}
                                                                        className="cursor-pointer transition-opacity hover:opacity-80"
                                                                        title="Klik untuk ubah status cepat"
                                                                    >
                                                                        {renderStatusBadge(unit.status)}
                                                                    </button>
                                                                ) : (
                                                                    renderStatusBadge(unit.status)
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                                Blok {unit.block} No. {unit.unit_number}
                                                            </p>
                                                        </div>
                                                        {unit.svg_element_id && (
                                                            <span className="font-mono text-[10px] bg-muted text-primary px-1.5 py-0.5 rounded border border-primary/20 shrink-0 flex items-center gap-1" title="SVG Siteplan ID">
                                                                <Sparkles className="size-2.5" />
                                                                {unit.svg_element_id}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="bg-muted/40 p-2.5 rounded-xl space-y-1.5 text-xs">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-muted-foreground">Cluster:</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setClusterId(unit.cluster_id.toString());
                                                                    router.get(route('properties.units.index'), { cluster_id: unit.cluster_id.toString() }, { preserveState: true });
                                                                }}
                                                                className="font-semibold text-foreground truncate max-w-[130px] hover:text-primary hover:underline cursor-pointer text-right"
                                                                title="Filter berdasarkan cluster ini"
                                                            >
                                                                {unit.cluster?.name || '-'}
                                                            </button>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-muted-foreground">Tipe Rumah:</span>
                                                            {unit.unit_type_id ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setUnitTypeId(unit.unit_type_id!.toString());
                                                                        router.get(route('properties.units.index'), { unit_type_id: unit.unit_type_id!.toString() }, { preserveState: true });
                                                                    }}
                                                                    className="font-medium text-foreground hover:text-primary hover:underline cursor-pointer text-right truncate max-w-[140px]"
                                                                    title="Filter berdasarkan tipe rumah ini"
                                                                >
                                                                    {unit.unit_type?.name || '-'}
                                                                </button>
                                                            ) : (
                                                                <span className="font-medium text-foreground">{unit.unit_type?.name || '-'}</span>
                                                            )}
                                                        </div>
                                                        {unit.unit_type && (
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-muted-foreground">Luas Tanah/Bgn:</span>
                                                                <span className="font-medium text-foreground">LT {unit.unit_type.surface_area}m² / LB {unit.unit_type.building_area}m²</span>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between items-center pt-1.5 border-t border-border/50">
                                                            <span className="text-muted-foreground">Harga Dasar:</span>
                                                            <span className="font-bold text-foreground font-mono">{unit.formatted_price}</span>
                                                        </div>
                                                    </div>

                                                    {unit.active_booking ? (
                                                        <div
                                                            onClick={() => router.get(route('bookings.index'), { search: unit.active_booking!.booking_code })}
                                                            className="p-2.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors text-xs space-y-1.5 cursor-pointer group/booking"
                                                            title="Klik untuk buka transaksi booking & SPR ini"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-1.5 font-semibold text-foreground truncate max-w-[150px] group-hover/booking:text-primary transition-colors">
                                                                    <UserCheck className="size-3.5 text-primary shrink-0" />
                                                                    <span title={unit.active_booking.lead?.name || 'Konsumen'}>
                                                                        {unit.active_booking.lead?.name || 'Konsumen Terdaftar'}
                                                                    </span>
                                                                </div>
                                                                <Badge variant="outline" className="font-mono text-[9px] px-1 py-0 bg-background text-primary/80 border-primary/30">
                                                                    {unit.active_booking.booking_code}
                                                                </Badge>
                                                            </div>
                                                            {unit.active_booking.lead?.whatsapp && (
                                                                <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                                                                    <Phone className="size-2.5 text-emerald-500" />
                                                                    <a
                                                                        href={`https://wa.me/${unit.active_booking.lead.whatsapp}`}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        className="text-emerald-600 dark:text-emerald-400 hover:underline"
                                                                        title="Chat langsung via WhatsApp"
                                                                    >
                                                                        {unit.active_booking.lead.whatsapp}
                                                                    </a>
                                                                </div>
                                                            )}
                                                            {unit.active_booking.sales && (
                                                                <div className="text-[10px] text-muted-foreground">
                                                                    Sales PIC: <strong className="text-foreground">{unit.active_booking.sales.name}</strong>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : unit.status === 'available' ? (
                                                        <div className="text-center py-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                                                            ✓ Unit Kavling Siap Dipesan
                                                        </div>
                                                    ) : null}
                                                </div>

                                                {hasUnitActions && (
                                                    <div className="p-3 bg-muted/20 border-t border-border/60 flex items-center justify-end gap-1.5">
                                                        {can('edit-units') && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleOpenEdit(unit)}
                                                                className="h-8 text-xs gap-1.5"
                                                            >
                                                                <Edit2 className="size-3.5" />
                                                                <span>Edit</span>
                                                            </Button>
                                                        )}
                                                        {can('delete-units') && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => confirmDelete(unit)}
                                                                className="size-8 text-destructive hover:bg-destructive/10"
                                                                title="Hapus Unit"
                                                            >
                                                                <Trash2 className="size-3.5" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                                        <TableHead className="w-[70px]">No</TableHead>
                                        <TableHead>Kode & Blok Unit</TableHead>
                                        <TableHead>Cluster & Proyek</TableHead>
                                        <TableHead>Tipe Rumah</TableHead>
                                        <TableHead>Harga Dasar (Cash/KPR)</TableHead>
                                        <TableHead>Status Unit</TableHead>
                                        <TableHead>Konsumen & Sales (PIC)</TableHead>
                                        <TableHead>SVG Element ID</TableHead>
                                        {hasUnitActions && (
                                            <TableHead className="w-[120px] text-right">Aksi</TableHead>
                                        )}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {units.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={hasUnitActions ? 9 : 8} className="text-center py-12 text-muted-foreground">
                                                Tidak ada unit kavling yang sesuai dengan pencarian / filter.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        units.data.map((unit, idx) => (
                                            <TableRow key={unit.id} className="hover:bg-muted/30">
                                                <TableCell className="font-mono text-xs text-muted-foreground">
                                                    {(units.current_page - 1) * units.per_page + idx + 1}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-sm text-foreground">
                                                            {unit.unit_code}
                                                        </span>
                                                        <span className="text-[11px] text-muted-foreground">
                                                            Blok {unit.block} No. {unit.unit_number}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-xs font-semibold text-foreground">
                                                            {unit.cluster?.name || '-'}
                                                        </span>
                                                        <span className="text-[11px] text-muted-foreground">
                                                            {unit.cluster?.project?.name || '-'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-0.5">
                                                        <Badge variant="outline" className="w-fit text-xs font-normal">
                                                            {unit.unit_type?.name || '-'}
                                                        </Badge>
                                                        {unit.unit_type && (
                                                            <span className="text-[11px] text-muted-foreground">
                                                                LT {unit.unit_type.surface_area}m² / LB {unit.unit_type.building_area}m²
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-semibold text-sm text-foreground">
                                                        {unit.formatted_price}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {can('edit-units') ? (
                                                        <button
                                                            onClick={() => openQuickStatusChange(unit)}
                                                            className="cursor-pointer transition-opacity hover:opacity-80"
                                                            title="Klik untuk ubah status cepat"
                                                        >
                                                            {renderStatusBadge(unit.status)}
                                                        </button>
                                                    ) : (
                                                        <div className="cursor-default">
                                                            {renderStatusBadge(unit.status)}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {unit.active_booking ? (
                                                        <div className="flex flex-col gap-0.5">
                                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                                                <UserCheck className="size-3.5 text-primary flex-shrink-0" />
                                                                <span title={unit.active_booking.lead?.name || 'Konsumen'}>
                                                                    {unit.active_booking.lead?.name || 'Konsumen Terdaftar'}
                                                                </span>
                                                            </div>
                                                            {unit.active_booking.lead?.whatsapp && (
                                                                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                                                    <Phone className="size-2.5" />
                                                                    {unit.active_booking.lead.whatsapp}
                                                                </span>
                                                            )}
                                                            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-muted-foreground">
                                                                <Badge variant="outline" className="font-mono text-[9px] px-1 py-0 bg-background text-primary/80 border-primary/30">
                                                                    {unit.active_booking.booking_code}
                                                                </Badge>
                                                                {unit.active_booking.sales && (
                                                                    <span>• Sales: <strong className="text-foreground">{unit.active_booking.sales.name}</strong></span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : unit.status === 'available' ? (
                                                        <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/5 font-normal">
                                                            Siap Dipesan
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground italic">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {unit.svg_element_id ? (
                                                        <span className="inline-flex items-center gap-1 font-mono text-xs bg-muted text-primary px-2 py-0.5 rounded border border-primary/20">
                                                            <Sparkles className="size-3 text-primary" />
                                                            {unit.svg_element_id}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground italic">Belum dipetakan</span>
                                                    )}
                                                </TableCell>
                                                {hasUnitActions && (
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            {can('edit-units') && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleOpenEdit(unit)}
                                                                    className="size-8 text-muted-foreground hover:text-foreground"
                                                                >
                                                                    <Edit2 className="size-3.5" />
                                                                </Button>
                                                            )}
                                                            {can('delete-units') && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => confirmDelete(unit)}
                                                                    className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                >
                                                                    <Trash2 className="size-3.5" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination links */}
                {units.last_page > 1 && (
                    <div className="flex items-center justify-between pt-2">
                        <p className="text-xs text-muted-foreground">
                            Halaman {units.current_page} dari {units.last_page}
                        </p>
                        <div className="flex items-center gap-1">
                            {units.links.map((link, i) => {
                                if (!link.url) {
                                    return (
                                        <span
                                            key={i}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className="px-3 py-1.5 text-xs text-muted-foreground/50 border border-border/40 rounded opacity-50 cursor-not-allowed"
                                        />
                                    );
                                }
                                return (
                                    <button
                                        key={i}
                                        onClick={() => router.get(link.url!, {}, { preserveState: true, preserveScroll: true })}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={cn(
                                            'px-3 py-1.5 text-xs rounded border transition-colors',
                                            link.active
                                                ? 'bg-primary text-primary-foreground border-primary font-medium'
                                                : 'border-border text-foreground hover:bg-muted'
                                        )}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Dialog: Unit Form */}
            <Dialog open={unitDialogOpen} onOpenChange={setUnitDialogOpen}>
                <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-background">
                    <DialogHeader className="px-6 py-5 border-b border-border/80">
                        <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                            <Home className="size-5 text-primary" />
                            {editingUnit ? 'Edit Data Unit Kavling' : 'Tambah Unit Kavling Baru'}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            {editingUnit
                                ? 'Perbarui blok, tipe rumah, harga dasar, atau relasi SVG map siteplan.'
                                : 'Input unit kavling baru ke dalam cluster proyek perumahan.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmitUnit} className="flex flex-col flex-1 overflow-hidden">
                        <div className="px-6 py-5 max-h-[68vh] overflow-y-auto space-y-5 custom-scrollbar overscroll-contain">
                            {/* Project Selector for Modal Filtering */}
                            <div className="space-y-1.5">
                                <Label htmlFor="modal_project_selector">Proyek Perumahan *</Label>
                                <Select
                                    value={modalProjectId}
                                    onValueChange={(val) => {
                                        setModalProjectId(val);
                                        // Auto reset cluster to first available in this project
                                        const pId = parseInt(val);
                                        const projectClusters = clusters.filter(c => c.housing_project_id === pId);
                                        const projectUnitTypes = unitTypes.filter(ut => ut.housing_project_id === pId);
                                        unitForm.setData({
                                            ...unitForm.data,
                                            cluster_id: projectClusters[0]?.id?.toString() || '',
                                            unit_type_id: projectUnitTypes[0]?.id?.toString() || '',
                                        });
                                    }}
                                >
                                    <SelectTrigger id="modal_project_selector" className="h-10">
                                        <SelectValue placeholder="Pilih Proyek" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projects.map((p) => (
                                            <SelectItem key={p.id} value={p.id.toString()}>
                                                {p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Cluster & Unit Type Linkage */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="unit_cluster">Cluster *</Label>
                                    <Select
                                        value={unitForm.data.cluster_id}
                                        onValueChange={(val) => unitForm.setData('cluster_id', val)}
                                    >
                                        <SelectTrigger id="unit_cluster" className="h-10">
                                            <SelectValue placeholder="Pilih Cluster" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableModalClusters.map((c) => (
                                                <SelectItem key={c.id} value={c.id.toString()}>
                                                    {c.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {unitForm.errors.cluster_id && (
                                        <p className="text-xs text-destructive">{unitForm.errors.cluster_id}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="unit_type">Tipe Rumah *</Label>
                                    <Select
                                        value={unitForm.data.unit_type_id}
                                        onValueChange={(val) => unitForm.setData('unit_type_id', val)}
                                    >
                                        <SelectTrigger id="unit_type" className="h-10">
                                            <SelectValue placeholder="Pilih Tipe Rumah" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableModalUnitTypes.map((ut) => (
                                                <SelectItem key={ut.id} value={ut.id.toString()}>
                                                    {ut.name} (LT {ut.surface_area}m² / LB {ut.building_area}m²)
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {unitForm.errors.unit_type_id && (
                                        <p className="text-xs text-destructive">{unitForm.errors.unit_type_id}</p>
                                    )}
                                </div>
                            </div>

                            {/* Block, Unit Number & Unit Code */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="unit_block">Blok *</Label>
                                    <Input
                                        id="unit_block"
                                        placeholder="Contoh: A1"
                                        value={unitForm.data.block}
                                        onChange={(e) => {
                                            const newBlock = e.target.value.toUpperCase();
                                            unitForm.setData({
                                                ...unitForm.data,
                                                block: newBlock,
                                                unit_code: newBlock && unitForm.data.unit_number ? `${newBlock}/${unitForm.data.unit_number}` : unitForm.data.unit_code,
                                            });
                                        }}
                                        className="h-10"
                                        required
                                    />
                                    {unitForm.errors.block && (
                                        <p className="text-xs text-destructive">{unitForm.errors.block}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="unit_number">Nomor Kavling *</Label>
                                    <Input
                                        id="unit_number"
                                        placeholder="Contoh: 05"
                                        value={unitForm.data.unit_number}
                                        onChange={(e) => {
                                            const newNum = e.target.value;
                                            unitForm.setData({
                                                ...unitForm.data,
                                                unit_number: newNum,
                                                unit_code: unitForm.data.block && newNum ? `${unitForm.data.block}/${newNum}` : unitForm.data.unit_code,
                                            });
                                        }}
                                        className="h-10"
                                        required
                                    />
                                    {unitForm.errors.unit_number && (
                                        <p className="text-xs text-destructive">{unitForm.errors.unit_number}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="unit_code">Kode Unit Lengkap</Label>
                                    <Input
                                        id="unit_code"
                                        placeholder="Contoh: A1/05"
                                        value={unitForm.data.unit_code}
                                        onChange={(e) => unitForm.setData('unit_code', e.target.value)}
                                        className="h-10 font-mono"
                                    />
                                </div>
                            </div>

                            {/* Base Price & Status */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="unit_price">Harga Dasar (Price) *</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                                            Rp
                                        </span>
                                        <Input
                                            id="unit_price"
                                            type="number"
                                            step="100000"
                                            placeholder="Contoh: 450000000"
                                            value={unitForm.data.base_price}
                                            onChange={(e) => unitForm.setData('base_price', e.target.value)}
                                            className="h-10 pl-9"
                                            required
                                        />
                                    </div>
                                    {unitForm.errors.base_price && (
                                        <p className="text-xs text-destructive">{unitForm.errors.base_price}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="unit_status">Status Penjualan *</Label>
                                    <Select
                                        value={unitForm.data.status}
                                        onValueChange={(val) => unitForm.setData('status', val)}
                                    >
                                        <SelectTrigger id="unit_status" className="h-10">
                                            <SelectValue placeholder="Pilih Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="available">Available (Tersedia)</SelectItem>
                                            <SelectItem value="booked">Booked (Tanda Jadi)</SelectItem>
                                            <SelectItem value="sold">Sold (Terjual)</SelectItem>
                                            <SelectItem value="hold">Hold (Ditahan)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* SVG Element ID - Siteplan Map Key */}
                            <div className="space-y-1.5 p-4 rounded-lg bg-primary/5 border border-primary/20">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="unit_svg_id" className="text-xs font-semibold text-primary flex items-center gap-1.5">
                                        <Sparkles className="size-3.5" />
                                        SVG Element ID (Peta Site Plan Interaktif)
                                    </Label>
                                    <span className="text-[11px] text-muted-foreground">Unique identifier pada file SVG</span>
                                </div>
                                <Input
                                    id="unit_svg_id"
                                    placeholder="Contoh: lot-a1-05 atau kav-32"
                                    value={unitForm.data.svg_element_id}
                                    onChange={(e) => unitForm.setData('svg_element_id', e.target.value)}
                                    className="h-10 bg-background font-mono text-sm"
                                />
                                <p className="text-[11px] text-muted-foreground">
                                    ID unik ini akan dicocokkan otomatis dengan atribut ID path/polygon saat file denah siteplan SVG diunggah.
                                </p>
                                {unitForm.errors.svg_element_id && (
                                    <p className="text-xs text-destructive">{unitForm.errors.svg_element_id}</p>
                                )}
                            </div>

                            {/* Notes */}
                            <div className="space-y-1.5">
                                <Label htmlFor="unit_notes">Catatan Tambahan (Opsional)</Label>
                                <Textarea
                                    id="unit_notes"
                                    placeholder="Kelebihan tanah sudut (hook), hadap timur taman, dsb..."
                                    value={unitForm.data.notes}
                                    onChange={(e) => unitForm.setData('notes', e.target.value)}
                                    rows={2}
                                />
                            </div>
                        </div>

                        <DialogFooter className="px-6 py-4 border-t border-border/80 bg-muted/20 sm:justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setUnitDialogOpen(false)}
                                disabled={unitForm.processing}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={unitForm.processing}
                                className="bg-primary text-primary-foreground gap-2"
                            >
                                {unitForm.processing && <Loader2 className="size-4 animate-spin" />}
                                {editingUnit ? 'Simpan Perubahan' : 'Tambah Unit'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Quick Status Change */}
            <Dialog open={statusChangeDialogOpen} onOpenChange={setStatusChangeDialogOpen}>
                <DialogContent className="sm:max-w-md bg-background">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold">
                            Ubah Status Unit {targetUnitForStatus?.unit_code}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Perbarui status kavling secara instan tanpa membuka form edit lengkap.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-3">
                        <Label>Pilih Status Baru</Label>
                        <Select value={selectedNewStatus} onValueChange={setSelectedNewStatus}>
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="Pilih status baru" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="available">Available (Tersedia)</SelectItem>
                                <SelectItem value="booked">Booked (Tanda Jadi)</SelectItem>
                                <SelectItem value="sold">Sold (Terjual)</SelectItem>
                                <SelectItem value="hold">Hold (Ditahan)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter className="sm:justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setStatusChangeDialogOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleSaveStatusChange}
                            className="bg-primary text-primary-foreground"
                        >
                            Perbarui Status
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md bg-background">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="size-5" />
                            Hapus Unit Kavling
                        </DialogTitle>
                        <DialogDescription className="text-sm pt-2">
                            Apakah Anda yakin ingin menghapus unit kavling{' '}
                            <strong className="text-foreground">{unitToDelete?.unit_code}</strong>?
                            Data transaksi yang terhubung mungkin akan terdampak.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-end gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={isDeleting}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="gap-2"
                        >
                            {isDeleting && <Loader2 className="size-4 animate-spin" />}
                            Ya, Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
