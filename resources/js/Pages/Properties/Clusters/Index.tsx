import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState, useMemo, useRef, FormEventHandler } from 'react';
import {
    Building,
    Home,
    Layers,
    Plus,
    Search,
    Edit2,
    Trash2,
    Loader2,
    CheckCircle2,
    AlertTriangle,
    Upload,
    FileText,
    ExternalLink,
    X,
    Filter,
    Bed,
    Bath,
    Zap,
    Maximize2,
    Check
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

interface ProjectItem {
    id: number;
    name: string;
}

interface ClusterData {
    id: number;
    housing_project_id: number;
    name: string;
    code?: string | null;
    description?: string | null;
    is_active: boolean;
    units_count?: number;
    project?: {
        id: number;
        name: string;
    } | null;
    created_at?: string;
}

interface UnitTypeData {
    id: number;
    housing_project_id: number;
    cluster_id?: number | null;
    name: string;
    surface_area: number | string;
    building_area: number | string;
    bedrooms: number;
    bathrooms: number;
    electricity?: string | null;
    brochure_file?: string | null;
    brochure_url?: string | null;
    description?: string | null;
    units_count?: number;
    project?: {
        id: number;
        name: string;
    } | null;
    cluster?: {
        id: number;
        name: string;
    } | null;
    created_at?: string;
}

interface Props {
    clusters: ClusterData[];
    unitTypes: UnitTypeData[];
    projects: ProjectItem[];
    filters?: {
        search?: string;
        project_id?: string;
        tab?: string;
    };
}

export default function ClustersIndex({ clusters, unitTypes, projects, filters }: Props) {
    const { can } = useAuthorization();
    const [activeTab, setActiveTab] = useState<'clusters' | 'unit_types'>(
        (filters?.tab as 'clusters' | 'unit_types') || 'clusters'
    );

    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>(filters?.project_id || 'all');

    // Dialog state - Cluster
    const [clusterDialogOpen, setClusterDialogOpen] = useState(false);
    const [editingCluster, setEditingCluster] = useState<ClusterData | null>(null);

    // Dialog state - Unit Type
    const [unitTypeDialogOpen, setUnitTypeDialogOpen] = useState(false);
    const [editingUnitType, setEditingUnitType] = useState<UnitTypeData | null>(null);

    // Delete confirmation dialog
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{
        type: 'cluster' | 'unit_type';
        id: number;
        name: string;
    } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Form Cluster
    const clusterForm = useForm({
        housing_project_id: projects[0]?.id?.toString() || '',
        name: '',
        code: '',
        description: '',
        is_active: true,
    });

    // Form Unit Type
    const unitTypeForm = useForm<{
        housing_project_id: string;
        cluster_id: string;
        name: string;
        surface_area: string;
        building_area: string;
        bedrooms: string;
        bathrooms: string;
        electricity: string;
        description: string;
        brochure_file: File | null;
    }>({
        housing_project_id: projects[0]?.id?.toString() || '',
        cluster_id: 'none',
        name: '',
        surface_area: '',
        building_area: '',
        bedrooms: '2',
        bathrooms: '1',
        electricity: '1300 VA',
        description: '',
        brochure_file: null,
    });

    const brochureInputRef = useRef<HTMLInputElement>(null);
    const [selectedBrochureName, setSelectedBrochureName] = useState<string | null>(null);

    // Filtered clusters for unit type modal dropdown
    const modalProjectClusters = useMemo(() => {
        const pId = parseInt(unitTypeForm.data.housing_project_id);
        if (!pId) return [];
        return clusters.filter(c => c.housing_project_id === pId);
    }, [unitTypeForm.data.housing_project_id, clusters]);

    // Filtered lists
    const filteredClusters = useMemo(() => {
        return clusters.filter(c => {
            const matchesSearch = searchQuery === '' ||
                c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (c.code && c.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (c.project?.name && c.project.name.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesProject = selectedProjectFilter === 'all' ||
                c.housing_project_id.toString() === selectedProjectFilter;

            return matchesSearch && matchesProject;
        });
    }, [clusters, searchQuery, selectedProjectFilter]);

    const filteredUnitTypes = useMemo(() => {
        return unitTypes.filter(ut => {
            const matchesSearch = searchQuery === '' ||
                ut.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (ut.project?.name && ut.project.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (ut.cluster?.name && ut.cluster.name.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesProject = selectedProjectFilter === 'all' ||
                ut.housing_project_id.toString() === selectedProjectFilter;

            return matchesSearch && matchesProject;
        });
    }, [unitTypes, searchQuery, selectedProjectFilter]);

    // Handlers Cluster
    const handleOpenCreateCluster = () => {
        setEditingCluster(null);
        clusterForm.reset();
        clusterForm.setData({
            housing_project_id: selectedProjectFilter !== 'all' ? selectedProjectFilter : (projects[0]?.id?.toString() || ''),
            name: '',
            code: '',
            description: '',
            is_active: true,
        });
        clusterForm.clearErrors();
        setClusterDialogOpen(true);
    };

    const handleOpenEditCluster = (cluster: ClusterData) => {
        setEditingCluster(cluster);
        clusterForm.setData({
            housing_project_id: cluster.housing_project_id.toString(),
            name: cluster.name,
            code: cluster.code || '',
            description: cluster.description || '',
            is_active: cluster.is_active,
        });
        clusterForm.clearErrors();
        setClusterDialogOpen(true);
    };

    const handleSubmitCluster: FormEventHandler = (e) => {
        e.preventDefault();
        if (editingCluster) {
            clusterForm.put(route('clusters.update', editingCluster.id), {
                onSuccess: () => setClusterDialogOpen(false),
            });
        } else {
            clusterForm.post(route('clusters.store'), {
                onSuccess: () => setClusterDialogOpen(false),
            });
        }
    };

    // Handlers Unit Type
    const handleOpenCreateUnitType = () => {
        setEditingUnitType(null);
        setSelectedBrochureName(null);
        unitTypeForm.reset();
        unitTypeForm.setData({
            housing_project_id: selectedProjectFilter !== 'all' ? selectedProjectFilter : (projects[0]?.id?.toString() || ''),
            cluster_id: 'none',
            name: '',
            surface_area: '',
            building_area: '',
            bedrooms: '2',
            bathrooms: '1',
            electricity: '1300 VA',
            description: '',
            brochure_file: null,
        });
        unitTypeForm.clearErrors();
        setUnitTypeDialogOpen(true);
    };

    const handleOpenEditUnitType = (unitType: UnitTypeData) => {
        setEditingUnitType(unitType);
        setSelectedBrochureName(null);
        unitTypeForm.setData({
            housing_project_id: unitType.housing_project_id.toString(),
            cluster_id: unitType.cluster_id ? unitType.cluster_id.toString() : 'none',
            name: unitType.name,
            surface_area: String(unitType.surface_area),
            building_area: String(unitType.building_area),
            bedrooms: String(unitType.bedrooms),
            bathrooms: String(unitType.bathrooms),
            electricity: unitType.electricity || '1300 VA',
            description: unitType.description || '',
            brochure_file: null,
        });
        unitTypeForm.clearErrors();
        setUnitTypeDialogOpen(true);
    };

    const handleSubmitUnitType: FormEventHandler = (e) => {
        e.preventDefault();
        const payload: Record<string, any> = {
            ...unitTypeForm.data,
            cluster_id: unitTypeForm.data.cluster_id === 'none' ? '' : unitTypeForm.data.cluster_id,
        };

        if (editingUnitType) {
            router.post(route('unit-types.update', editingUnitType.id), {
                _method: 'PUT',
                ...payload,
            }, {
                onSuccess: () => setUnitTypeDialogOpen(false),
            });
        } else {
            unitTypeForm.transform((data) => ({
                ...data,
                cluster_id: data.cluster_id === 'none' ? '' : data.cluster_id,
            }));
            unitTypeForm.post(route('unit-types.store'), {
                onSuccess: () => setUnitTypeDialogOpen(false),
            });
        }
    };

    // Delete Handlers
    const confirmDelete = (type: 'cluster' | 'unit_type', id: number, name: string) => {
        setItemToDelete({ type, id, name });
        setDeleteDialogOpen(true);
    };

    const handleDelete = () => {
        if (!itemToDelete) return;
        setIsDeleting(true);

        const targetRoute = itemToDelete.type === 'cluster'
            ? route('clusters.destroy', itemToDelete.id)
            : route('unit-types.destroy', itemToDelete.id);

        router.delete(targetRoute, {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteDialogOpen(false);
                setItemToDelete(null);
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Cluster & Tipe Unit - Master Properti" />

            <div className="space-y-6">
                {/* Header Page */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                            <Layers className="size-6 text-primary" />
                            Cluster & Tipe Unit
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Kelola pembagian blok cluster kawasan dan spesifikasi tipe unit rumah perumahan.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {can('create-units') && (
                            <Button
                                onClick={activeTab === 'clusters' ? handleOpenCreateCluster : handleOpenCreateUnitType}
                                className="h-10 px-4 gap-2 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 font-medium"
                            >
                                <Plus className="size-4" />
                                {activeTab === 'clusters' ? 'Tambah Cluster' : 'Tambah Tipe Unit'}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Main Tabs Navigation */}
                <div className="flex border-b border-border">
                    <button
                        onClick={() => setActiveTab('clusters')}
                        className={cn(
                            'flex items-center gap-2 py-3 px-5 border-b-2 text-sm font-medium transition-colors',
                            activeTab === 'clusters'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        )}
                    >
                        <Building className="size-4" />
                        Daftar Cluster Kawasan
                        <Badge variant="secondary" className="ml-1 text-xs">
                            {clusters.length}
                        </Badge>
                    </button>

                    <button
                        onClick={() => setActiveTab('unit_types')}
                        className={cn(
                            'flex items-center gap-2 py-3 px-5 border-b-2 text-sm font-medium transition-colors',
                            activeTab === 'unit_types'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        )}
                    >
                        <Home className="size-4" />
                        Katalog Tipe Unit
                        <Badge variant="secondary" className="ml-1 text-xs">
                            {unitTypes.length}
                        </Badge>
                    </button>

                    <button
                        onClick={() => router.get(route('siteplan.index'))}
                        className="flex items-center gap-2 py-3 px-5 border-b-2 text-sm font-medium border-transparent text-muted-foreground hover:text-primary transition-colors ml-auto group"
                    >
                        <Layers className="size-4 text-primary group-hover:scale-110 transition-transform" />
                        <span className="font-semibold text-primary">Buka Peta Interactive Siteplan</span>
                        <ExternalLink className="size-3.5 text-primary" />
                    </button>
                </div>

                {/* Filter and Search Bar */}
                <Card className="shadow-none border-border/80">
                    <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder={activeTab === 'clusters' ? 'Cari cluster atau proyek...' : 'Cari tipe unit (contoh: 36/60)...'}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 h-10 w-full bg-background"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="size-4" />
                                    </button>
                                )}
                            </div>

                            <div className="w-full sm:w-64">
                                <Select
                                    value={selectedProjectFilter}
                                    onValueChange={setSelectedProjectFilter}
                                >
                                    <SelectTrigger className="h-10 bg-background">
                                        <SelectValue placeholder="Filter Berdasarkan Proyek" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Proyek Perumahan</SelectItem>
                                        {projects.map((p) => (
                                            <SelectItem key={p.id} value={p.id.toString()}>
                                                {p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tab Content 1: Clusters Table */}
                {activeTab === 'clusters' && (
                    <Card className="shadow-none border-border/80">
                        <CardHeader className="px-6 py-4 border-b border-border/70 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-semibold">Data Cluster Kawasan</CardTitle>
                                <CardDescription className="text-xs">
                                    Total {filteredClusters.length} cluster terdaftar
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                                        <TableHead className="w-[80px]">No</TableHead>
                                        <TableHead>Nama Cluster</TableHead>
                                        <TableHead>Proyek Perumahan</TableHead>
                                        <TableHead>Kode</TableHead>
                                        <TableHead>Jumlah Unit</TableHead>
                                        <TableHead>Deskripsi</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-[110px] text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredClusters.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                                                Tidak ada data cluster yang sesuai kriteria pencarian.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredClusters.map((cluster, idx) => (
                                            <TableRow key={cluster.id} className="hover:bg-muted/30">
                                                <TableCell className="font-mono text-xs text-muted-foreground">
                                                    {idx + 1}
                                                </TableCell>
                                                <TableCell className="font-medium text-foreground">
                                                    {cluster.name}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="font-normal bg-background">
                                                        {cluster.project?.name || '-'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                                                        {cluster.code || '-'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-xs font-semibold text-foreground">
                                                        {cluster.units_count ?? 0} Unit
                                                    </span>
                                                </TableCell>
                                                <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                                                    {cluster.description || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={cluster.is_active ? 'default' : 'secondary'}
                                                        className={cluster.is_active ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20' : ''}
                                                    >
                                                        {cluster.is_active ? 'Aktif' : 'Non-Aktif'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {can('edit-units') && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleOpenEditCluster(cluster)}
                                                                className="size-8 text-muted-foreground hover:text-foreground"
                                                            >
                                                                <Edit2 className="size-3.5" />
                                                            </Button>
                                                        )}
                                                        {can('delete-units') && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => confirmDelete('cluster', cluster.id, cluster.name)}
                                                                className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            >
                                                                <Trash2 className="size-3.5" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Tab Content 2: Unit Types Table */}
                {activeTab === 'unit_types' && (
                    <Card className="shadow-none border-border/80">
                        <CardHeader className="px-6 py-4 border-b border-border/70 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-semibold">Katalog Tipe Unit Properti</CardTitle>
                                <CardDescription className="text-xs">
                                    Total {filteredUnitTypes.length} spesifikasi tipe unit terdaftar
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                                        <TableHead className="w-[80px]">No</TableHead>
                                        <TableHead>Nama Tipe</TableHead>
                                        <TableHead>Proyek / Cluster</TableHead>
                                        <TableHead>Luas (LT / LB)</TableHead>
                                        <TableHead>Fasilitas Ruang</TableHead>
                                        <TableHead>Listrik</TableHead>
                                        <TableHead>Brosur / Denah</TableHead>
                                        <TableHead>Total Unit</TableHead>
                                        <TableHead className="w-[110px] text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUnitTypes.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                                                Tidak ada data tipe unit yang sesuai kriteria.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredUnitTypes.map((unitType, idx) => (
                                            <TableRow key={unitType.id} className="hover:bg-muted/30">
                                                <TableCell className="font-mono text-xs text-muted-foreground">
                                                    {idx + 1}
                                                </TableCell>
                                                <TableCell className="font-medium text-foreground">
                                                    <span className="text-sm font-semibold">{unitType.name}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <Badge variant="outline" className="text-xs font-normal">
                                                            {unitType.project?.name || '-'}
                                                        </Badge>
                                                        {unitType.cluster && (
                                                            <div className="text-[11px] text-muted-foreground">
                                                                Cluster: {unitType.cluster.name}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5 text-xs">
                                                        <Maximize2 className="size-3.5 text-muted-foreground" />
                                                        <span>LT: <strong>{unitType.surface_area} m²</strong></span>
                                                        <span className="text-muted-foreground">/</span>
                                                        <span>LB: <strong>{unitType.building_area} m²</strong></span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3 text-xs">
                                                        <span className="flex items-center gap-1 text-muted-foreground">
                                                            <Bed className="size-3.5 text-primary" /> {unitType.bedrooms} KT
                                                        </span>
                                                        <span className="flex items-center gap-1 text-muted-foreground">
                                                            <Bath className="size-3.5 text-primary" /> {unitType.bathrooms} KM
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Zap className="size-3.5 text-amber-500" />
                                                        <span>{unitType.electricity || '-'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {unitType.brochure_url ? (
                                                        <a
                                                            href={unitType.brochure_url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                                                        >
                                                            <FileText className="size-3.5" />
                                                            Unduh File
                                                            <ExternalLink className="size-2.5" />
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-xs font-semibold text-foreground">
                                                        {unitType.units_count ?? 0} Unit
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {can('edit-units') && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleOpenEditUnitType(unitType)}
                                                                className="size-8 text-muted-foreground hover:text-foreground"
                                                            >
                                                                <Edit2 className="size-3.5" />
                                                            </Button>
                                                        )}
                                                        {can('delete-units') && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => confirmDelete('unit_type', unitType.id, unitType.name)}
                                                                className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            >
                                                                <Trash2 className="size-3.5" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Modal Dialog: Cluster Form */}
            <Dialog open={clusterDialogOpen} onOpenChange={setClusterDialogOpen}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-background">
                    <DialogHeader className="px-6 py-5 border-b border-border/80">
                        <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                            <Building className="size-5 text-primary" />
                            {editingCluster ? 'Edit Data Cluster' : 'Tambah Cluster Kawasan'}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            {editingCluster
                                ? 'Perbarui informasi cluster kawasan perumahan.'
                                : 'Input blok kawasan cluster baru yang terintegrasi dengan proyek perumahan.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmitCluster} className="flex flex-col flex-1 overflow-hidden">
                        <div className="px-6 py-5 max-h-[68vh] overflow-y-auto space-y-4 custom-scrollbar overscroll-contain">
                            <div className="space-y-1.5">
                                <Label htmlFor="cluster_project">Proyek Perumahan *</Label>
                                <Select
                                    value={clusterForm.data.housing_project_id}
                                    onValueChange={(val) => clusterForm.setData('housing_project_id', val)}
                                >
                                    <SelectTrigger id="cluster_project" className="h-10">
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
                                {clusterForm.errors.housing_project_id && (
                                    <p className="text-xs text-destructive">{clusterForm.errors.housing_project_id}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="sm:col-span-2 space-y-1.5">
                                    <Label htmlFor="cluster_name">Nama Cluster *</Label>
                                    <Input
                                        id="cluster_name"
                                        placeholder="Contoh: Cluster Lavender"
                                        value={clusterForm.data.name}
                                        onChange={(e) => clusterForm.setData('name', e.target.value)}
                                        className="h-10"
                                        required
                                    />
                                    {clusterForm.errors.name && (
                                        <p className="text-xs text-destructive">{clusterForm.errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="cluster_code">Kode / Singkatan</Label>
                                    <Input
                                        id="cluster_code"
                                        placeholder="Contoh: LVN"
                                        value={clusterForm.data.code}
                                        onChange={(e) => clusterForm.setData('code', e.target.value)}
                                        className="h-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="cluster_description">Deskripsi Singkat</Label>
                                <Textarea
                                    id="cluster_description"
                                    placeholder="Penjelasan keunggulan posisi cluster atau tema arsitektur..."
                                    value={clusterForm.data.description}
                                    onChange={(e) => clusterForm.setData('description', e.target.value)}
                                    rows={3}
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="cluster_is_active"
                                    checked={clusterForm.data.is_active}
                                    onChange={(e) => clusterForm.setData('is_active', e.target.checked)}
                                    className="rounded border-input text-primary focus:ring-primary size-4"
                                />
                                <Label htmlFor="cluster_is_active" className="text-sm font-normal cursor-pointer">
                                    Cluster aktif dan terbuka untuk penjualan unit
                                </Label>
                            </div>
                        </div>

                        <DialogFooter className="px-6 py-4 border-t border-border/80 bg-muted/20 sm:justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setClusterDialogOpen(false)}
                                disabled={clusterForm.processing}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={clusterForm.processing}
                                className="bg-primary text-primary-foreground gap-2"
                            >
                                {clusterForm.processing && <Loader2 className="size-4 animate-spin" />}
                                {editingCluster ? 'Simpan Perubahan' : 'Tambah Cluster'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Dialog: Unit Type Form */}
            <Dialog open={unitTypeDialogOpen} onOpenChange={setUnitTypeDialogOpen}>
                <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-background">
                    <DialogHeader className="px-6 py-5 border-b border-border/80">
                        <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                            <Home className="size-5 text-primary" />
                            {editingUnitType ? 'Edit Spesifikasi Tipe Unit' : 'Tambah Tipe Unit Baru'}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            {editingUnitType
                                ? 'Perbarui detail ukuran, ruangan, daya listrik, dan file brosur tipe unit.'
                                : 'Input master spesifikasi rumah yang akan menjadi acuan unit-unit kavling.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmitUnitType} className="flex flex-col flex-1 overflow-hidden">
                        <div className="px-6 py-5 max-h-[68vh] overflow-y-auto space-y-5 custom-scrollbar overscroll-contain">
                            {/* Project & Cluster Linkage */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="ut_project">Proyek Perumahan *</Label>
                                    <Select
                                        value={unitTypeForm.data.housing_project_id}
                                        onValueChange={(val) => {
                                            unitTypeForm.setData({
                                                ...unitTypeForm.data,
                                                housing_project_id: val,
                                                cluster_id: 'none',
                                            });
                                        }}
                                    >
                                        <SelectTrigger id="ut_project" className="h-10">
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
                                    {unitTypeForm.errors.housing_project_id && (
                                        <p className="text-xs text-destructive">{unitTypeForm.errors.housing_project_id}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="ut_cluster">Spesifik ke Cluster (Opsional)</Label>
                                    <Select
                                        value={unitTypeForm.data.cluster_id}
                                        onValueChange={(val) => unitTypeForm.setData('cluster_id', val)}
                                    >
                                        <SelectTrigger id="ut_cluster" className="h-10">
                                            <SelectValue placeholder="Berlaku untuk semua cluster" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Semua Cluster (Global Proyek)</SelectItem>
                                            {modalProjectClusters.map((c) => (
                                                <SelectItem key={c.id} value={c.id.toString()}>
                                                    {c.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Name & Electricity */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="sm:col-span-2 space-y-1.5">
                                    <Label htmlFor="ut_name">Nama Tipe Rumah *</Label>
                                    <Input
                                        id="ut_name"
                                        placeholder="Contoh: Tipe 36/60, Tipe Scandinavian 45/84"
                                        value={unitTypeForm.data.name}
                                        onChange={(e) => unitTypeForm.setData('name', e.target.value)}
                                        className="h-10"
                                        required
                                    />
                                    {unitTypeForm.errors.name && (
                                        <p className="text-xs text-destructive">{unitTypeForm.errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="ut_electricity">Daya Listrik</Label>
                                    <Input
                                        id="ut_electricity"
                                        placeholder="1300 VA / 2200 VA"
                                        value={unitTypeForm.data.electricity}
                                        onChange={(e) => unitTypeForm.setData('electricity', e.target.value)}
                                        className="h-10"
                                    />
                                </div>
                            </div>

                            {/* Dimensions & Rooms */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-muted/30 border border-border/60">
                                <div className="space-y-1.5">
                                    <Label htmlFor="ut_surface_area" className="text-xs font-semibold">Luas Tanah (m²) *</Label>
                                    <Input
                                        id="ut_surface_area"
                                        type="number"
                                        step="0.01"
                                        placeholder="Contoh: 60"
                                        value={unitTypeForm.data.surface_area}
                                        onChange={(e) => unitTypeForm.setData('surface_area', e.target.value)}
                                        className="h-9"
                                        required
                                    />
                                    {unitTypeForm.errors.surface_area && (
                                        <p className="text-[11px] text-destructive">{unitTypeForm.errors.surface_area}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="ut_building_area" className="text-xs font-semibold">Luas Bangunan (m²) *</Label>
                                    <Input
                                        id="ut_building_area"
                                        type="number"
                                        step="0.01"
                                        placeholder="Contoh: 36"
                                        value={unitTypeForm.data.building_area}
                                        onChange={(e) => unitTypeForm.setData('building_area', e.target.value)}
                                        className="h-9"
                                        required
                                    />
                                    {unitTypeForm.errors.building_area && (
                                        <p className="text-[11px] text-destructive">{unitTypeForm.errors.building_area}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="ut_bedrooms" className="text-xs font-semibold">Kamar Tidur *</Label>
                                    <Input
                                        id="ut_bedrooms"
                                        type="number"
                                        min="0"
                                        value={unitTypeForm.data.bedrooms}
                                        onChange={(e) => unitTypeForm.setData('bedrooms', e.target.value)}
                                        className="h-9"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="ut_bathrooms" className="text-xs font-semibold">Kamar Mandi *</Label>
                                    <Input
                                        id="ut_bathrooms"
                                        type="number"
                                        min="0"
                                        value={unitTypeForm.data.bathrooms}
                                        onChange={(e) => unitTypeForm.setData('bathrooms', e.target.value)}
                                        className="h-9"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Brochure Upload */}
                            <div className="space-y-1.5">
                                <Label>File Brosur / Denah (PDF / Gambar maks 10MB)</Label>
                                <div className="flex items-center gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => brochureInputRef.current?.click()}
                                        className="h-10 gap-2 border-dashed"
                                    >
                                        <Upload className="size-4 text-muted-foreground" />
                                        Pilih File Brosur
                                    </Button>
                                    <input
                                        ref={brochureInputRef}
                                        type="file"
                                        accept=".pdf,image/png,image/jpeg,image/jpg"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0] || null;
                                            unitTypeForm.setData('brochure_file', file);
                                            setSelectedBrochureName(file ? file.name : null);
                                        }}
                                    />
                                    {selectedBrochureName ? (
                                        <span className="text-xs text-primary font-medium flex items-center gap-1.5">
                                            <FileText className="size-3.5" />
                                            {selectedBrochureName}
                                        </span>
                                    ) : editingUnitType?.brochure_url ? (
                                        <a
                                            href={editingUnitType.brochure_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 underline"
                                        >
                                            <FileText className="size-3.5" />
                                            File saat ini tersimpan (Klik untuk melihat)
                                        </a>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">Belum ada file dipilih</span>
                                    )}
                                </div>
                                {unitTypeForm.errors.brochure_file && (
                                    <p className="text-xs text-destructive">{unitTypeForm.errors.brochure_file}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <Label htmlFor="ut_description">Deskripsi & Spesifikasi Material</Label>
                                <Textarea
                                    id="ut_description"
                                    placeholder="Contoh: Pondasi batu kali, struktur beton bertulang, dinding bata ringan, lantai granit 60x60, atap baja ringan..."
                                    value={unitTypeForm.data.description}
                                    onChange={(e) => unitTypeForm.setData('description', e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </div>

                        <DialogFooter className="px-6 py-4 border-t border-border/80 bg-muted/20 sm:justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setUnitTypeDialogOpen(false)}
                                disabled={unitTypeForm.processing}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={unitTypeForm.processing}
                                className="bg-primary text-primary-foreground gap-2"
                            >
                                {unitTypeForm.processing && <Loader2 className="size-4 animate-spin" />}
                                {editingUnitType ? 'Simpan Perubahan' : 'Tambah Tipe Unit'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md bg-background">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="size-5" />
                            Konfirmasi Hapus Data
                        </DialogTitle>
                        <DialogDescription className="text-sm pt-2">
                            Apakah Anda yakin ingin menghapus {itemToDelete?.type === 'cluster' ? 'cluster' : 'tipe unit'}{' '}
                            <strong className="text-foreground">{itemToDelete?.name}</strong>?
                            Tindakan ini tidak dapat dibatalkan jika data sedang digunakan.
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
