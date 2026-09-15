import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, Link } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import {
    Users,
    UserPlus,
    Plus,
    Search,
    Filter,
    Clock,
    CalendarCheck,
    AlertCircle,
    Building2,
    Columns3,
    Table as TableIcon,
    X,
    MessageSquare,
    Phone,
    ShieldAlert,
    Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent } from '@/Components/ui/card';
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
import { Textarea } from '@/Components/ui/textarea';
import { useAuthorization } from '@/hooks/useAuthorization';
import KanbanBoard from '@/Components/CRM/KanbanBoard';
import KanbanCard, { KanbanLeadItem } from '@/Components/CRM/KanbanCard';
import FollowUpTimelineDialog from '@/Components/CRM/FollowUpTimelineDialog';

interface ProjectOption {
    id: number;
    name: string;
    developer_id: number;
}

interface DeveloperOption {
    id: number;
    name: string;
}

interface SalesUserOption {
    id: number;
    name: string;
    email: string;
}

interface PipelineStats {
    total: number;
    new: number;
    contacted: number;
    survey_visit: number;
    booking: number;
    spk_akad: number;
    lost: number;
    today_reminders: number;
    overdue_reminders: number;
}

interface Props {
    leads: KanbanLeadItem[];
    projects: ProjectOption[];
    developers: DeveloperOption[];
    salesUsers: SalesUserOption[];
    stats: PipelineStats;
    filters?: {
        search?: string;
        project_id?: string;
        reminder?: string;
        sales_id?: string;
        temperature?: string;
    };
    isAgentOnly?: boolean;
}

const SOURCE_OPTIONS = [
    'Iklan Meta (Facebook/IG)',
    'Walk-in / Pameran Mall',
    'Website Casanuma',
    'Referensi / Word of Mouth',
    'TikTok Ads',
    'Spanduk / Baliho Kawasan',
    'Agen Properti Rekanan',
    'Lainnya',
];

export default function LeadsPipeline({
    leads,
    projects,
    developers,
    salesUsers,
    stats,
    filters,
    isAgentOnly = false,
}: Props) {
    const { user, can, isSuperAdmin, isSalesManager, isSalesAgent } = useAuthorization();

    // Filters state
    const [search, setSearch] = useState(filters?.search || '');
    const [projectId, setProjectId] = useState<string>(filters?.project_id || 'all');
    const [reminderFilter, setReminderFilter] = useState<string>(filters?.reminder || 'all');
    const [salesFilter, setSalesFilter] = useState<string>(filters?.sales_id || 'all');
    const [temperatureFilter, setTemperatureFilter] = useState<string>(filters?.temperature || 'all');

    // Dialog state
    const [timelineDialogOpen, setTimelineDialogOpen] = useState(false);
    const [selectedLeadForTimeline, setSelectedLeadForTimeline] = useState<KanbanLeadItem | null>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    // Form create lead
    const createForm = useForm({
        name: '',
        whatsapp: '',
        email: '',
        housing_project_id: projects[0]?.id ? String(projects[0].id) : '',
        developer_id: '',
        sales_id: String(user?.id || ''),
        source: 'Walk-in / Pameran Mall',
        source_detail: '',
        lead_temperature: 'warm',
        status: 'new',
        notes: '',
        next_follow_up_date: '',
    });

    const applyFilters = (newParams: Record<string, string>) => {
        const params: Record<string, any> = {
            search: search.trim() || undefined,
            project_id: projectId !== 'all' ? projectId : undefined,
            reminder: reminderFilter !== 'all' ? reminderFilter : undefined,
            sales_id: salesFilter !== 'all' ? salesFilter : undefined,
            ...newParams,
        };

        // Clean empty keys
        Object.keys(params).forEach((key) => {
            if (params[key] === undefined || params[key] === 'all' || params[key] === '') {
                delete params[key];
            }
        });

        router.get(route('leads.pipeline'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters({ search: search.trim() });
    };

    const handleOpenTimeline = (lead: KanbanLeadItem) => {
        setSelectedLeadForTimeline(lead);
        setTimelineDialogOpen(true);
    };

    const handleCreateLead = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('leads.store'), {
            onSuccess: () => {
                setCreateDialogOpen(false);
                createForm.reset();
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold tracking-tight text-foreground">
                                Pipeline & Follow-Up CRM
                            </h2>
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold">
                                Kanban View
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Pantau pergerakan prospek, kelola jadwal tindak lanjut, dan hubungi konsumen via WhatsApp.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Switch to Table View */}
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="h-9 text-xs rounded-xl gap-1.5"
                        >
                            <Link href={route('leads.index')}>
                                <TableIcon className="size-3.5 text-muted-foreground" />
                                <span>Tampilan Tabel</span>
                            </Link>
                        </Button>

                        {/* Tambah Lead */}
                        {can('create-leads') && (
                            <Button
                                size="sm"
                                onClick={() => setCreateDialogOpen(true)}
                                className="h-9 text-xs rounded-xl gap-1.5 shadow-xs"
                            >
                                <Plus className="size-4" />
                                <span>Tambah Prospek</span>
                            </Button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Pipeline Leads & Follow-Up CRM" />

            <div className="space-y-6">
                {/* KPI Header Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3.5">
                    {/* Total Leads */}
                    <Card
                        onClick={() => {
                            setReminderFilter('all');
                            applyFilters({ reminder: 'all' });
                        }}
                        className={cn(
                            "cursor-pointer hover:border-primary/50 transition-all rounded-2xl shadow-xs",
                            reminderFilter === 'all' && "ring-2 ring-primary/25 border-primary"
                        )}
                    >
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Prospek</p>
                                <h3 className="text-2xl font-black text-foreground mt-0.5">{stats.total}</h3>
                            </div>
                            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <Users className="size-5" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Follow-up Hari Ini */}
                    <Card
                        onClick={() => {
                            const next = reminderFilter === 'today' ? 'all' : 'today';
                            setReminderFilter(next);
                            applyFilters({ reminder: next });
                        }}
                        className={cn(
                            "cursor-pointer hover:border-amber-500/50 transition-all rounded-2xl shadow-xs",
                            reminderFilter === 'today' && "ring-2 ring-amber-500/30 border-amber-500 bg-amber-500/5"
                        )}
                    >
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Jadwal Hari Ini</p>
                                    {stats.today_reminders > 0 && (
                                        <span className="size-2 rounded-full bg-amber-500 animate-ping" />
                                    )}
                                </div>
                                <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
                                    {stats.today_reminders}
                                </h3>
                            </div>
                            <div className="size-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                                <CalendarCheck className="size-5" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Overdue / Jatuh Tempo */}
                    <Card
                        onClick={() => {
                            const next = reminderFilter === 'overdue' ? 'all' : 'overdue';
                            setReminderFilter(next);
                            applyFilters({ reminder: next });
                        }}
                        className={cn(
                            "cursor-pointer hover:border-rose-500/50 transition-all rounded-2xl shadow-xs",
                            reminderFilter === 'overdue' && "ring-2 ring-rose-500/30 border-rose-500 bg-rose-500/5"
                        )}
                    >
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Overdue</p>
                                    {stats.overdue_reminders > 0 && (
                                        <span className="size-2 rounded-full bg-rose-500 animate-pulse" />
                                    )}
                                </div>
                                <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-0.5">
                                    {stats.overdue_reminders}
                                </h3>
                            </div>
                            <div className="size-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                                <AlertCircle className="size-5" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Survey Visit */}
                    <Card className="rounded-2xl shadow-xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Survey Lokasi</p>
                                <h3 className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-0.5">{stats.survey_visit}</h3>
                            </div>
                            <div className="size-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                                <Clock className="size-5" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Booking & Deal */}
                    <Card className="rounded-2xl shadow-xs col-span-2 sm:col-span-4 lg:col-span-1">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Booking & Akad</p>
                                <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                                    {stats.booking + stats.spk_akad}
                                </h3>
                            </div>
                            <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                <Sparkles className="size-5" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters Bar */}
                <Card className="rounded-2xl border-border/70 shadow-xs">
                    <CardContent className="p-3.5 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
                            {/* Search Input */}
                            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
                                <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Cari nama, WhatsApp..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-8 h-9 text-xs rounded-xl"
                                />
                            </form>

                            {/* Project Filter */}
                            <Select
                                value={projectId}
                                onValueChange={(val) => {
                                    setProjectId(val);
                                    applyFilters({ project_id: val });
                                }}
                            >
                                <SelectTrigger className="w-44 h-9 text-xs rounded-xl">
                                    <SelectValue placeholder="Semua Proyek" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Proyek</SelectItem>
                                    {projects.map((p) => (
                                        <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Reminder Schedule Filter */}
                            <Select
                                value={reminderFilter}
                                onValueChange={(val) => {
                                    setReminderFilter(val);
                                    applyFilters({ reminder: val });
                                }}
                            >
                                <SelectTrigger className="w-44 h-9 text-xs rounded-xl">
                                    <SelectValue placeholder="Jadwal Follow-Up" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Jadwal</SelectItem>
                                    <SelectItem value="today">🔔 Hari Ini ({stats.today_reminders})</SelectItem>
                                    <SelectItem value="overdue">⚠️ Overdue ({stats.overdue_reminders})</SelectItem>
                                    <SelectItem value="upcoming">📅 Mendatang</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Temperature Filter */}
                            <Select
                                value={temperatureFilter}
                                onValueChange={(val) => {
                                    setTemperatureFilter(val);
                                    applyFilters({ temperature: val });
                                }}
                            >
                                <SelectTrigger className="w-36 h-9 text-xs rounded-xl">
                                    <SelectValue placeholder="Suhu Prospek" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Suhu</SelectItem>
                                    <SelectItem value="hot">🔥 Hot</SelectItem>
                                    <SelectItem value="warm">⚡ Warm</SelectItem>
                                    <SelectItem value="cold">❄️ Cold</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Sales Filter (Manager / Superadmin only) */}
                            {!isAgentOnly && salesUsers.length > 1 && (
                                <Select
                                    value={salesFilter}
                                    onValueChange={(val) => {
                                        setSalesFilter(val);
                                        applyFilters({ sales_id: val });
                                    }}
                                >
                                    <SelectTrigger className="w-44 h-9 text-xs rounded-xl">
                                        <SelectValue placeholder="Semua Sales PIC" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Sales</SelectItem>
                                        {salesUsers.map((s) => (
                                            <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            {/* Clear Filter Button */}
                            {(search || projectId !== 'all' || reminderFilter !== 'all' || temperatureFilter !== 'all' || salesFilter !== 'all') && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSearch('');
                                        setProjectId('all');
                                        setReminderFilter('all');
                                        setSalesFilter('all');
                                        setTemperatureFilter('all');
                                        router.get(route('leads.pipeline'));
                                    }}
                                    className="h-9 text-xs text-muted-foreground hover:text-foreground rounded-xl px-2.5"
                                >
                                    <X className="size-3.5 mr-1" />
                                    Reset
                                </Button>
                            )}
                        </div>

                        {/* Drag & Drop instruction tooltip */}
                        <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-xl border">
                            <span>💡 Tarik & lepaskan (drag & drop) kartu untuk memindahkan tahapan pipeline.</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Kanban Swimlanes */}
                <KanbanBoard
                    leads={leads}
                    onOpenTimeline={handleOpenTimeline}
                    onStatusChange={() => {
                        router.reload({ only: ['stats', 'leads'] });
                    }}
                />
            </div>

            {/* Follow-up Timeline Dialog */}
            <FollowUpTimelineDialog
                open={timelineDialogOpen}
                onOpenChange={setTimelineDialogOpen}
                lead={selectedLeadForTimeline}
                onInteractionAdded={() => {
                    router.reload({ only: ['leads', 'stats'] });
                }}
            />

            {/* Create Lead Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold">Tambah Prospek Konsumen Baru</DialogTitle>
                        <DialogDescription className="text-xs">
                            Masukkan data kontak konsumen baru untuk memulai tindak lanjut pipeline.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateLead} className="space-y-3.5 pt-2">
                        <div className="space-y-1">
                            <Label className="text-xs font-medium">Nama Lengkap Konsumen <span className="text-destructive">*</span></Label>
                            <Input
                                required
                                placeholder="Contoh: Bpk. Hendra Gunawan"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                className="h-9 text-xs rounded-xl"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs font-medium">WhatsApp <span className="text-destructive">*</span></Label>
                                <Input
                                    required
                                    placeholder="0812xxxxxxxx"
                                    value={createForm.data.whatsapp}
                                    onChange={(e) => createForm.setData('whatsapp', e.target.value)}
                                    className="h-9 text-xs font-mono rounded-xl"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs font-medium">Email (Opsional)</Label>
                                <Input
                                    type="email"
                                    placeholder="email@domain.com"
                                    value={createForm.data.email}
                                    onChange={(e) => createForm.setData('email', e.target.value)}
                                    className="h-9 text-xs rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-medium">Pilihan Proyek Perumahan <span className="text-destructive">*</span></Label>
                            <Select
                                value={createForm.data.housing_project_id}
                                onValueChange={(val) => createForm.setData('housing_project_id', val)}
                            >
                                <SelectTrigger className="h-9 text-xs rounded-xl">
                                    <SelectValue placeholder="Pilih Proyek" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map((p) => (
                                        <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs font-medium">Sumber Lead</Label>
                                <Select
                                    value={createForm.data.source}
                                    onValueChange={(val) => createForm.setData('source', val)}
                                >
                                    <SelectTrigger className="h-9 text-xs rounded-xl">
                                        <SelectValue placeholder="Sumber Prospek" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SOURCE_OPTIONS.map((s) => (
                                            <SelectItem key={s} value={s}>{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs font-medium">Tahapan Awal</Label>
                                <Select
                                    value={createForm.data.status}
                                    onValueChange={(val) => createForm.setData('status', val)}
                                >
                                    <SelectTrigger className="h-9 text-xs rounded-xl">
                                        <SelectValue placeholder="Tahapan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="new">New Lead</SelectItem>
                                        <SelectItem value="contacted">Contacted</SelectItem>
                                        <SelectItem value="survey_visit">Survey Visit</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs font-medium">Detail Sub-Sumber / Campaign</Label>
                                <Input
                                    placeholder="Contoh: Meta Ads Promo DP 0%..."
                                    value={createForm.data.source_detail}
                                    onChange={(e) => createForm.setData('source_detail', e.target.value)}
                                    className="h-9 text-xs rounded-xl"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs font-medium">Suhu / Prioritas Closing</Label>
                                <Select
                                    value={createForm.data.lead_temperature}
                                    onValueChange={(val) => createForm.setData('lead_temperature', val)}
                                >
                                    <SelectTrigger className="h-9 text-xs rounded-xl">
                                        <SelectValue placeholder="Suhu Prospek" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="hot">🔥 Hot (Siap Beli)</SelectItem>
                                        <SelectItem value="warm">⚡ Warm (Menimbang)</SelectItem>
                                        <SelectItem value="cold">❄️ Cold (Dingin)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-medium">Catatan / Kebutuhan Awal</Label>
                            <Textarea
                                rows={2}
                                placeholder="Preferensi kavling, budget, dll..."
                                value={createForm.data.notes}
                                onChange={(e) => createForm.setData('notes', e.target.value)}
                                className="text-xs resize-none rounded-xl"
                            />
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setCreateDialogOpen(false)}
                                className="text-xs rounded-xl"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={createForm.processing}
                                className="text-xs rounded-xl shadow-xs"
                            >
                                {createForm.processing ? 'Menyimpan...' : 'Simpan Prospek'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
