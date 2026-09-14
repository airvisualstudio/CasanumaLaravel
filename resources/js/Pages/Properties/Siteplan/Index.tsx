import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import {
    Layers,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    Maximize2,
    Upload,
    Building2,
    Home,
    CheckCircle2,
    Clock,
    Lock,
    PauseCircle,
    FileText,
    ExternalLink,
    DollarSign,
    Sparkles,
    UserCheck,
    CreditCard,
    Plus,
    X,
    Info,
    Calendar
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
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
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { useAuthorization } from '@/hooks/useAuthorization';

interface ProjectItem {
    id: number;
    name: string;
    siteplan_svg?: string | null;
}

interface ClusterItem {
    id: number;
    housing_project_id: number;
    name: string;
    siteplan_svg?: string | null;
}

interface HousingUnitSiteplan {
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
    unit_type?: {
        name: string;
        surface_area: number | string;
        building_area: number | string;
        bedrooms: number;
        bathrooms: number;
        brochure_file?: string | null;
    } | null;
    cluster?: {
        id: number;
        name: string;
        housing_project_id: number;
    } | null;
    active_booking?: {
        id: number;
        booking_code: string;
        payment_scheme: string;
        booking_fee: number | string;
        transaction_date: string;
        lead?: {
            id: number;
            name: string;
            whatsapp: string;
            email?: string | null;
        } | null;
        sales?: {
            id: number;
            name: string;
            email: string;
        } | null;
    } | null;
}

interface LeadOption {
    id: number;
    name: string;
    whatsapp: string;
    housing_project_id: number;
}

interface SalesUserOption {
    id: number;
    name: string;
}

interface Props {
    projects: ProjectItem[];
    clusters: ClusterItem[];
    activeProject?: ProjectItem | null;
    activeCluster?: ClusterItem | null;
    svgUrl?: string | null;
    units: HousingUnitSiteplan[];
    leads: LeadOption[];
    salesUsers: SalesUserOption[];
    filters: {
        project_id?: number | string | null;
        cluster_id?: number | string | null;
    };
}

export default function SiteplanIndex({
    projects,
    clusters,
    activeProject,
    activeCluster,
    svgUrl,
    units,
    leads,
    salesUsers,
    filters,
}: Props) {
    const { can } = useAuthorization();

    // Selection filters
    const [selectedProjectId, setSelectedProjectId] = useState<string>(
        activeProject?.id?.toString() || projects[0]?.id?.toString() || ''
    );
    const [selectedClusterId, setSelectedClusterId] = useState<string>(
        activeCluster?.id?.toString() || (clusters[0]?.id?.toString() ?? 'all')
    );

    // Selected Unit Modal Details
    const [selectedUnit, setSelectedUnit] = useState<HousingUnitSiteplan | null>(null);
    const [unitDetailOpen, setUnitDetailOpen] = useState(false);

    // Quick Booking Modal from Map
    const [quickBookingOpen, setQuickBookingOpen] = useState(false);
    const quickBookingForm = useForm({
        lead_id: leads[0]?.id?.toString() || '',
        housing_unit_id: '',
        sales_id: salesUsers[0]?.id?.toString() || '',
        payment_scheme: 'kpr',
        booking_fee: '5000000',
        transaction_date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    // Upload SVG Dialog
    const [uploadSvgOpen, setUploadSvgOpen] = useState(false);
    const uploadForm = useForm<{
        target_type: 'cluster' | 'project';
        target_id: string;
        svg_file: File | null;
    }>({
        target_type: 'cluster',
        target_id: activeCluster?.id?.toString() || '',
        svg_file: null,
    });
    const svgInputRef = useRef<HTMLInputElement>(null);

    // Filter clusters when project selection changes
    const projectClusters = useMemo(() => {
        const pId = parseInt(selectedProjectId);
        if (!pId) return clusters;
        return clusters.filter(c => c.housing_project_id === pId);
    }, [clusters, selectedProjectId]);

    // Handle Project / Cluster switch
    const handleSwitchProjectOrCluster = (pId: string, cId: string) => {
        router.get(
            route('siteplan.index'),
            {
                project_id: pId,
                cluster_id: cId !== 'all' ? cId : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    // Raw SVG content state
    const [rawSvgContent, setRawSvgContent] = useState<string | null>(null);
    const [isLoadingSvg, setIsLoadingSvg] = useState(false);
    const svgContainerRef = useRef<HTMLDivElement>(null);

    // Map units by svg_element_id for O(1) fast lookup
    const unitBySvgId = useMemo(() => {
        const map = new Map<string, HousingUnitSiteplan>();
        units.forEach(u => {
            if (u.svg_element_id) {
                map.set(u.svg_element_id.toLowerCase().trim(), u);
            }
        });
        return map;
    }, [units]);

    // Load or generate SVG
    useEffect(() => {
        if (svgUrl) {
            setIsLoadingSvg(true);
            fetch(svgUrl)
                .then(res => res.text())
                .then(text => {
                    setRawSvgContent(text);
                    setIsLoadingSvg(false);
                })
                .catch(() => {
                    setRawSvgContent(null);
                    setIsLoadingSvg(false);
                });
        } else {
            // Default demo interactive SVG map if none uploaded yet
            setRawSvgContent(generateDefaultSiteplanSvg());
        }
    }, [svgUrl]);

    // Apply styles and click handlers to SVG elements
    useEffect(() => {
        if (!svgContainerRef.current) return;

        const container = svgContainerRef.current;
        const svgElement = container.querySelector('svg');
        if (!svgElement) return;

        svgElement.setAttribute('width', '100%');
        svgElement.setAttribute('height', '100%');
        svgElement.style.maxWidth = '100%';
        svgElement.style.maxHeight = '72vh';

        // Select all candidate lot elements (rect, path, polygon, g) with an ID
        const candidates = svgElement.querySelectorAll('[id]');

        candidates.forEach((el) => {
            const elId = el.getAttribute('id')?.toLowerCase().trim();
            if (!elId) return;

            const unit = unitBySvgId.get(elId);

            if (unit) {
                const targetElement = el as SVGElement;
                targetElement.style.cursor = 'pointer';
                targetElement.style.transition = 'all 0.2s ease';

                // Color matching based on unit status
                let fillColor = '#10b981'; // default emerald for available
                let strokeColor = '#059669';

                if (unit.status === 'booked') {
                    fillColor = '#f59e0b'; // amber
                    strokeColor = '#d97706';
                } else if (unit.status === 'sold') {
                    fillColor = '#ef4444'; // rose/red
                    strokeColor = '#dc2626';
                } else if (unit.status === 'hold') {
                    fillColor = '#64748b'; // slate
                    strokeColor = '#475569';
                }

                targetElement.style.fill = fillColor;
                targetElement.style.stroke = strokeColor;
                targetElement.style.strokeWidth = '2px';

                // Hover effects
                targetElement.onmouseenter = () => {
                    targetElement.style.opacity = '0.75';
                    targetElement.style.filter = 'drop-shadow(0 0 6px rgba(0,0,0,0.3))';
                };
                targetElement.onmouseleave = () => {
                    targetElement.style.opacity = '1';
                    targetElement.style.filter = 'none';
                };

                // Click event -> open modal
                targetElement.onclick = (e) => {
                    e.stopPropagation();
                    setSelectedUnit(unit);
                    setUnitDetailOpen(true);
                };
            }
        });
    }, [rawSvgContent, unitBySvgId]);

    // Open Quick Booking from Unit Detail modal
    const handleStartBookingFromUnit = (unit: HousingUnitSiteplan) => {
        setUnitDetailOpen(false);
        quickBookingForm.setData({
            lead_id: leads[0]?.id?.toString() || '',
            housing_unit_id: unit.id.toString(),
            sales_id: salesUsers[0]?.id?.toString() || '',
            payment_scheme: 'kpr',
            booking_fee: '5000000',
            transaction_date: new Date().toISOString().split('T')[0],
            notes: '',
        });
        setQuickBookingOpen(true);
    };

    const handleSubmitQuickBooking = (e: React.FormEvent) => {
        e.preventDefault();
        quickBookingForm.post(route('bookings.store'), {
            onSuccess: () => {
                setQuickBookingOpen(false);
                router.reload();
            },
        });
    };

    const handleUploadSvgSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        uploadForm.post(route('siteplan.upload-svg'), {
            onSuccess: () => setUploadSvgOpen(false),
        });
    };

    // KPI Counters from units
    const summary = useMemo(() => {
        return {
            total: units.length,
            available: units.filter(u => u.status === 'available').length,
            booked: units.filter(u => u.status === 'booked').length,
            sold: units.filter(u => u.status === 'sold').length,
            hold: units.filter(u => u.status === 'hold').length,
        };
    }, [units]);

    return (
        <AuthenticatedLayout>
            <Head title="Interactive Siteplan Map - Master Kawasan" />

            <div className="space-y-5">
                {/* Header Page */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                            <Layers className="size-6 text-primary" />
                            Interactive Siteplan Map
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Peta denah visual interaktif masterplan kawasan dengan pan & zoom, status pewarnaan otomatis, dan detail kavling.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Button
                            variant="outline"
                            onClick={() => router.get(route('bookings.index'))}
                            className="h-10 gap-2"
                        >
                            <CreditCard className="size-4" />
                            Daftar Booking
                        </Button>

                        {can('create-units') && (
                            <Button
                                onClick={() => {
                                    uploadForm.setData({
                                        target_type: activeCluster ? 'cluster' : 'project',
                                        target_id: (activeCluster?.id || activeProject?.id || '').toString(),
                                        svg_file: null,
                                    });
                                    setUploadSvgOpen(true);
                                }}
                                className="h-10 gap-2 bg-primary text-primary-foreground shadow-sm font-medium"
                            >
                                <Upload className="size-4" />
                                Upload File SVG Denah
                            </Button>
                        )}
                    </div>
                </div>

                {/* Filter and Legend Bar */}
                <Card className="shadow-none border-border/80">
                    <CardContent className="p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Selector Proyek & Cluster */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                            <div className="w-full sm:w-60">
                                <Select
                                    value={selectedProjectId}
                                    onValueChange={(val) => {
                                        setSelectedProjectId(val);
                                        const pClusters = clusters.filter(c => c.housing_project_id === parseInt(val));
                                        const nextCluster = pClusters[0]?.id?.toString() || 'all';
                                        setSelectedClusterId(nextCluster);
                                        handleSwitchProjectOrCluster(val, nextCluster);
                                    }}
                                >
                                    <SelectTrigger className="h-10 bg-background">
                                        <SelectValue placeholder="Pilih Proyek Perumahan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projects.map((p) => (
                                            <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="w-full sm:w-60">
                                <Select
                                    value={selectedClusterId}
                                    onValueChange={(val) => {
                                        setSelectedClusterId(val);
                                        handleSwitchProjectOrCluster(selectedProjectId, val);
                                    }}
                                >
                                    <SelectTrigger className="h-10 bg-background">
                                        <SelectValue placeholder="Pilih Cluster Kawasan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Cluster</SelectItem>
                                        {projectClusters.map((c) => (
                                            <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Interactive Status Legend */}
                        <div className="flex items-center flex-wrap gap-4 text-xs font-medium">
                            <div className="flex items-center gap-1.5">
                                <span className="size-3 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
                                <span>Available ({summary.available})</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="size-3 rounded-full bg-amber-500 ring-2 ring-amber-500/20" />
                                <span>Booked ({summary.booked})</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="size-3 rounded-full bg-rose-500 ring-2 ring-rose-500/20" />
                                <span>Sold ({summary.sold})</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="size-3 rounded-full bg-slate-500 ring-2 ring-slate-500/20" />
                                <span>Hold ({summary.hold})</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* SVG Viewer Container Card */}
                <Card className="shadow-none border-border/80 overflow-hidden relative bg-muted/15">
                    <TransformWrapper
                        initialScale={1}
                        minScale={0.5}
                        maxScale={4}
                        centerOnInit
                        wheel={{ step: 0.1 }}
                    >
                        {({ zoomIn, zoomOut, resetTransform }) => (
                            <>
                                {/* Floating Floating Zoom Controls Toolbar */}
                                <div className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-background/90 backdrop-blur-md p-1.5 rounded-xl border border-border/80 shadow-md">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => zoomIn()}
                                        className="size-8 text-foreground hover:bg-muted"
                                        title="Perbesar (Zoom In)"
                                    >
                                        <ZoomIn className="size-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => zoomOut()}
                                        className="size-8 text-foreground hover:bg-muted"
                                        title="Perkecil (Zoom Out)"
                                    >
                                        <ZoomOut className="size-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => resetTransform()}
                                        className="size-8 text-foreground hover:bg-muted"
                                        title="Pusatkan Ulang (Reset View)"
                                    >
                                        <RotateCcw className="size-4" />
                                    </Button>
                                </div>

                                {/* Watermark & Hint Badge */}
                                <div className="absolute bottom-4 left-4 z-20 pointer-events-none flex items-center gap-2">
                                    <Badge variant="secondary" className="bg-background/80 backdrop-blur border text-[11px] font-normal gap-1">
                                        <Sparkles className="size-3 text-primary" />
                                        Gunakan mousewheel untuk zoom, drag untuk menggeser peta, klik kavling untuk detail.
                                    </Badge>
                                </div>

                                {/* SVG Render Area */}
                                <TransformComponent
                                    wrapperClass="!w-full !h-[68vh] cursor-grab active:cursor-grabbing flex items-center justify-center"
                                    contentClass="!w-full !h-full flex items-center justify-center p-6"
                                >
                                    <div
                                        ref={svgContainerRef}
                                        className="w-full h-full flex items-center justify-center transition-all duration-300 select-none"
                                        dangerouslySetInnerHTML={{ __html: rawSvgContent || '' }}
                                    />
                                </TransformComponent>
                            </>
                        )}
                    </TransformWrapper>
                </Card>
            </div>

            {/* Modal Dialog: Unit Detail from Map Click */}
            <Dialog open={unitDetailOpen} onOpenChange={setUnitDetailOpen}>
                <DialogContent className="sm:max-w-lg bg-background">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                <Home className="size-5 text-primary" />
                                Kavling {selectedUnit?.unit_code}
                            </DialogTitle>
                            {selectedUnit && (
                                <Badge
                                    className={
                                        selectedUnit.status === 'available'
                                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                            : selectedUnit.status === 'booked'
                                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                            : selectedUnit.status === 'sold'
                                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                                            : 'bg-slate-500/15 text-slate-600 dark:text-slate-400'
                                    }
                                >
                                    {selectedUnit.status.toUpperCase()}
                                </Badge>
                            )}
                        </div>
                        <DialogDescription className="text-xs text-muted-foreground">
                            {selectedUnit?.cluster?.name} - {activeProject?.name} (ID Peta: {selectedUnit?.svg_element_id || '-'})
                        </DialogDescription>
                    </DialogHeader>

                    {selectedUnit && (
                        <div className="py-3 space-y-4 text-sm">
                            {/* Specifications */}
                            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-muted/30 border border-border/70">
                                <div>
                                    <p className="text-xs text-muted-foreground">Tipe Rumah</p>
                                    <p className="font-semibold text-foreground mt-0.5">{selectedUnit.unit_type?.name || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Luas Tanah / Bangunan</p>
                                    <p className="font-semibold text-foreground mt-0.5">
                                        LT {selectedUnit.unit_type?.surface_area}m² / LB {selectedUnit.unit_type?.building_area}m²
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Kamar Tidur / Mandi</p>
                                    <p className="font-semibold text-foreground mt-0.5">
                                        {selectedUnit.unit_type?.bedrooms} KT / {selectedUnit.unit_type?.bathrooms} KM
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Harga Dasar (Price)</p>
                                    <p className="font-bold text-primary mt-0.5 text-base">{selectedUnit.formatted_price}</p>
                                </div>
                            </div>

                            {/* Active Booking Details if Booked */}
                            {selectedUnit.status === 'booked' && selectedUnit.active_booking && (
                                <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                                            <Clock className="size-3.5" />
                                            Informasi Tanda Jadi (Booking)
                                        </span>
                                        <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-300">
                                            {selectedUnit.active_booking.booking_code}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                                        <div>
                                            <span className="text-muted-foreground">Konsumen:</span>
                                            <p className="font-semibold text-foreground">
                                                {selectedUnit.active_booking.lead?.name || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">WhatsApp:</span>
                                            <p className="font-semibold text-foreground">
                                                {selectedUnit.active_booking.lead?.whatsapp || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Skema Bayar:</span>
                                            <p className="font-semibold text-foreground uppercase">
                                                {selectedUnit.active_booking.payment_scheme}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Sales In Charge:</span>
                                            <p className="font-semibold text-foreground">
                                                {selectedUnit.active_booking.sales?.name || '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedUnit.notes && (
                                <p className="text-xs text-muted-foreground italic">
                                    Catatan: {selectedUnit.notes}
                                </p>
                            )}
                        </div>
                    )}

                    <DialogFooter className="sm:justify-between gap-2 pt-2">
                        <Button variant="outline" onClick={() => setUnitDetailOpen(false)}>
                            Tutup
                        </Button>

                        {selectedUnit?.status === 'available' && can('create-bookings') && (
                            <Button
                                onClick={() => handleStartBookingFromUnit(selectedUnit)}
                                className="bg-primary text-primary-foreground gap-2"
                            >
                                <CreditCard className="size-4" />
                                Booking Unit Ini Sekarang
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Dialog: Quick Booking Form */}
            <Dialog open={quickBookingOpen} onOpenChange={setQuickBookingOpen}>
                <DialogContent className="sm:max-w-lg bg-background">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                            <CreditCard className="size-5 text-primary" />
                            Booking Kavling {selectedUnit?.unit_code}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Pilih konsumen pemesan untuk mengunci kavling ini dari peta siteplan.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmitQuickBooking} className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="qb_lead">Pilih Calon Pembeli (Konsumen Prospek) *</Label>
                            <Select
                                value={quickBookingForm.data.lead_id}
                                onValueChange={(val) => quickBookingForm.setData('lead_id', val)}
                            >
                                <SelectTrigger id="qb_lead" className="h-10">
                                    <SelectValue placeholder="Pilih Konsumen" />
                                </SelectTrigger>
                                <SelectContent>
                                    {leads.map((l) => (
                                        <SelectItem key={l.id} value={l.id.toString()}>{l.name} ({l.whatsapp})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="qb_scheme">Skema Pembayaran *</Label>
                                <Select
                                    value={quickBookingForm.data.payment_scheme}
                                    onValueChange={(val) => quickBookingForm.setData('payment_scheme', val as any)}
                                >
                                    <SelectTrigger id="qb_scheme" className="h-10">
                                        <SelectValue placeholder="Pilih Skema" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="kpr">KPR Bank</SelectItem>
                                        <SelectItem value="cash">Cash Keras</SelectItem>
                                        <SelectItem value="cash_bertahap">Cash Bertahap</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="qb_fee">Booking Fee (Rp) *</Label>
                                <Input
                                    id="qb_fee"
                                    type="number"
                                    step="100000"
                                    value={quickBookingForm.data.booking_fee}
                                    onChange={(e) => quickBookingForm.setData('booking_fee', e.target.value)}
                                    className="h-10 font-mono"
                                    required
                                />
                            </div>
                        </div>

                        <DialogFooter className="sm:justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => setQuickBookingOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={quickBookingForm.processing} className="bg-primary text-primary-foreground gap-1.5">
                                Konfirmasi Booking
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Dialog: Upload SVG Masterplan */}
            <Dialog open={uploadSvgOpen} onOpenChange={setUploadSvgOpen}>
                <DialogContent className="sm:max-w-md bg-background">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold flex items-center gap-2">
                            <Upload className="size-5 text-primary" />
                            Upload File Denah Siteplan SVG
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Unggah berkas gambar vektor format .svg ber-ID elemen yang sesuai dengan kavling.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleUploadSvgSubmit} className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label>Target Penempatan</Label>
                            <Select
                                value={uploadForm.data.target_type}
                                onValueChange={(val) => {
                                    uploadForm.setData({
                                        ...uploadForm.data,
                                        target_type: val as any,
                                        target_id: val === 'cluster'
                                            ? (activeCluster?.id?.toString() || clusters[0]?.id?.toString() || '')
                                            : (activeProject?.id?.toString() || projects[0]?.id?.toString() || ''),
                                    });
                                }}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Pilih Target" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cluster">Cluster ({activeCluster?.name || 'Pilih Cluster'})</SelectItem>
                                    <SelectItem value="project">Proyek ({activeProject?.name || 'Pilih Proyek'})</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label>Pilih File .SVG</Label>
                            <input
                                ref={svgInputRef}
                                type="file"
                                accept=".svg,image/svg+xml"
                                className="w-full text-xs file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    uploadForm.setData('svg_file', file);
                                }}
                                required
                            />
                        </div>

                        <DialogFooter className="sm:justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => setUploadSvgOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={uploadForm.processing} className="bg-primary text-primary-foreground">
                                Upload SVG
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}

// Helper: Generates an aesthetic demo Siteplan SVG with matching lot IDs (lot-a1-01, lot-a1-02, lot-a2-05, lot-a2-06, lot-ph1-10, lot-ph1-11)
function generateDefaultSiteplanSvg(): string {
    return `<svg viewBox="0 0 1000 650" xmlns="http://www.w3.org/2000/svg" class="w-full h-full drop-shadow-xl select-none">
        <defs>
            <linearGradient id="grassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#1e293b"/>
                <stop offset="100%" stop-color="#0f172a"/>
            </linearGradient>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" stroke-width="0.5" opacity="0.4"/>
            </pattern>
        </defs>

        <!-- Base Background -->
        <rect width="1000" height="650" rx="16" fill="url(#grassGrad)"/>
        <rect width="1000" height="650" rx="16" fill="url(#grid)"/>

        <!-- Main Road (Boulevard) -->
        <path d="M 50 325 Q 500 310 950 325" fill="none" stroke="#475569" stroke-width="48" stroke-linecap="round"/>
        <path d="M 50 325 Q 500 310 950 325" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="12,12"/>

        <!-- Secondary Cluster Roads -->
        <path d="M 320 325 L 320 120" fill="none" stroke="#334155" stroke-width="32"/>
        <path d="M 680 325 L 680 530" fill="none" stroke="#334155" stroke-width="32"/>

        <!-- Clubhouse / Park Zone -->
        <circle cx="500" cy="180" r="55" fill="#14532d" stroke="#22c55e" stroke-width="2" opacity="0.6"/>
        <text x="500" y="185" fill="#86efac" font-size="13" font-weight="bold" font-family="sans-serif" text-anchor="middle">CENTRAL PARK</text>

        <!-- Cluster Lavender Section (Top) -->
        <text x="180" y="80" fill="#93c5fd" font-size="16" font-weight="bold" font-family="sans-serif">CLUSTER LAVENDER</text>

        <!-- Lot A1-01 -->
        <rect id="lot-a1-01" x="120" y="110" width="80" height="85" rx="8" fill="#10b981" stroke="#059669" stroke-width="2"/>
        <text x="160" y="155" fill="#ffffff" font-size="12" font-weight="bold" font-family="sans-serif" text-anchor="middle" pointer-events="none">A1/01</text>

        <!-- Lot A1-02 -->
        <rect id="lot-a1-02" x="210" y="110" width="80" height="85" rx="8" fill="#f59e0b" stroke="#d97706" stroke-width="2"/>
        <text x="250" y="155" fill="#ffffff" font-size="12" font-weight="bold" font-family="sans-serif" text-anchor="middle" pointer-events="none">A1/02</text>

        <!-- Lot A2-05 -->
        <rect id="lot-a2-05" x="120" y="210" width="80" height="85" rx="8" fill="#10b981" stroke="#059669" stroke-width="2"/>
        <text x="160" y="255" fill="#ffffff" font-size="12" font-weight="bold" font-family="sans-serif" text-anchor="middle" pointer-events="none">A2/05</text>

        <!-- Lot A2-06 -->
        <rect id="lot-a2-06" x="210" y="210" width="80" height="85" rx="8" fill="#ef4444" stroke="#dc2626" stroke-width="2"/>
        <text x="250" y="255" fill="#ffffff" font-size="12" font-weight="bold" font-family="sans-serif" text-anchor="middle" pointer-events="none">A2/06</text>

        <!-- Cluster Pine Hills Section (Bottom) -->
        <text x="750" y="420" fill="#fcd34d" font-size="16" font-weight="bold" font-family="sans-serif">CLUSTER PINE HILLS</text>

        <!-- Lot PH1-10 -->
        <rect id="lot-ph1-10" x="720" y="445" width="95" height="95" rx="8" fill="#10b981" stroke="#059669" stroke-width="2"/>
        <text x="767" y="497" fill="#ffffff" font-size="12" font-weight="bold" font-family="sans-serif" text-anchor="middle" pointer-events="none">PH1/10</text>

        <!-- Lot PH1-11 -->
        <rect id="lot-ph1-11" x="830" y="445" width="95" height="95" rx="8" fill="#64748b" stroke="#475569" stroke-width="2"/>
        <text x="877" y="497" fill="#ffffff" font-size="12" font-weight="bold" font-family="sans-serif" text-anchor="middle" pointer-events="none">PH1/11</text>
    </svg>`;
}
