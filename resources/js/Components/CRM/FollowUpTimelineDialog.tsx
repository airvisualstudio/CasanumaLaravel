import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Badge } from '@/Components/ui/badge';
import { Calendar } from '@/Components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Calendar as CalendarIcon,
    Clock,
    MessageSquare,
    Phone,
    Users,
    Mail,
    Send,
    ExternalLink,
    AlertCircle,
    CheckCircle2,
    CalendarCheck,
    Loader2,
    PlusCircle,
    History,
    Sparkles,
    Home,
    CreditCard,
    ShieldCheck,
    HeartHandshake,
    Lock,
    CornerDownRight,
    ChevronDown,
    ChevronUp,
    MessageCircle,
    ShieldAlert,
    Archive,
} from 'lucide-react';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { toast } from '@/Components/ui/sonner';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';

export interface LeadInteractionNoteData {
    id: number;
    lead_interaction_id: number;
    user_id: number;
    content: string;
    formatted_created_at?: string;
    author_role_badge?: string;
    user?: {
        id: number;
        name: string;
        email?: string;
    } | null;
    created_at?: string;
}

export interface InteractionItem {
    id: number;
    lead_id: number;
    user_id?: number | null;
    channel: 'whatsapp' | 'phone' | 'meeting' | 'email' | 'other';
    channel_label?: string;
    stage_at_interaction: string;
    notes: string;
    interaction_date: string;
    formatted_interaction_date?: string;
    next_follow_up_date?: string | null;
    next_follow_up_note?: string | null;
    is_reminder_completed?: boolean;
    sales_user?: {
        id: number;
        name: string;
        email?: string;
    } | null;
    internal_notes?: LeadInteractionNoteData[];
    created_at?: string;
}

export interface LeadSummary {
    id: number;
    name: string;
    whatsapp: string;
    status: string;
    next_follow_up_date?: string | null;
    formatted_next_follow_up?: string | null;
    next_follow_up_status?: 'overdue' | 'today' | 'upcoming' | null;
    whatsapp_url?: string | null;
    project?: {
        id: number;
        name: string;
    } | null;
    active_booking?: {
        id: number;
        booking_code: string;
        status: string;
        payment_scheme?: string;
        total_price?: number;
        unit?: {
            id: number;
            unit_code: string;
            block: string;
            unit_number: string;
            base_price: number;
            status: string;
            cluster?: {
                id: number;
                name: string;
            } | null;
        } | null;
    } | null;
    sales?: {
        id: number;
        name: string;
    } | null;
    slik_status?: 'clear' | 'ragu' | 'blacklist' | string | null;
    job_type?: string | null;
    company_name?: string | null;
    monthly_income?: number | string | null;
    formatted_monthly_income?: string | null;
    marital_status?: string | null;
    spouse_name?: string | null;
    spouse_nik?: string | null;
    max_budget?: number | string | null;
    formatted_max_budget?: string | null;
    preferred_unit_type?: string | null;
    lead_temperature?: 'hot' | 'warm' | 'cold' | string | null;
    lead_temperature_badge?: {
        label: string;
        full_label: string;
        color: string;
        status: string;
    } | null;
    source?: string | null;
    source_detail?: string | null;
    sla_status?: {
        is_overdue: boolean;
        days_passed: number;
        days_remaining: number;
        label: string;
        color: string;
    } | null;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lead: LeadSummary | null;
    onInteractionAdded?: () => void;
}

const STAGE_LABELS: Record<string, { label: string; color: string }> = {
    new: { label: 'New Lead', color: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30' },
    contacted: { label: 'Contacted', color: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30' },
    survey_visit: { label: 'Survey Visit', color: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30' },
    booking: { label: 'Booking Fee', color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' },
    spk_akad: { label: 'SPK / Akad', color: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30' },
    lost: { label: 'Lost / Batal', color: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30' },
    rejected: { label: 'Lost / Batal', color: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30' },
};

const CHANNEL_CONFIG = {
    whatsapp: { label: 'WhatsApp Chat', icon: MessageSquare, color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30' },
    phone: { label: 'Telepon / Call', icon: Phone, color: 'text-blue-600 bg-blue-500/10 border-blue-500/30' },
    meeting: { label: 'Janji Temu / Survey', icon: Users, color: 'text-purple-600 bg-purple-500/10 border-purple-500/30' },
    email: { label: 'Email', icon: Mail, color: 'text-amber-600 bg-amber-500/10 border-amber-500/30' },
    other: { label: 'Lainnya', icon: History, color: 'text-slate-600 bg-slate-500/10 border-slate-500/30' },
};

export default function FollowUpTimelineDialog({
    open,
    onOpenChange,
    lead,
    onInteractionAdded,
}: Props) {
    const [interactions, setInteractions] = useState<InteractionItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'timeline' | 'add'>('timeline');

    // Internal Notes state
    const [canManageNotes, setCanManageNotes] = useState(false);
    const [openThreads, setOpenThreads] = useState<Record<number, boolean>>({});
    const [replyText, setReplyText] = useState<Record<number, string>>({});
    const [submittingNoteId, setSubmittingNoteId] = useState<number | null>(null);

    // Form state
    const [channel, setChannel] = useState<'whatsapp' | 'phone' | 'meeting' | 'email' | 'other'>('whatsapp');
    const [notes, setNotes] = useState('');
    const [interactionDate, setInteractionDate] = useState<Date>(new Date());
    const [interactionTime, setInteractionTime] = useState(format(new Date(), 'HH:mm'));
    const [updateStage, setUpdateStage] = useState<string>('none');
    const [nextFollowUpDate, setNextFollowUpDate] = useState<Date | undefined>(undefined);
    const [nextFollowUpTime, setNextFollowUpTime] = useState('10:00');
    const [nextFollowUpNote, setNextFollowUpNote] = useState('');

    useEffect(() => {
        if (open && lead?.id) {
            fetchInteractions();
            // Reset form
            setNotes('');
            setChannel('whatsapp');
            setInteractionDate(new Date());
            setInteractionTime(format(new Date(), 'HH:mm'));
            setUpdateStage(lead.status || 'none');
            setNextFollowUpDate(undefined);
            setNextFollowUpTime('10:00');
            setNextFollowUpNote('');
            setActiveTab('timeline');
        }
    }, [open, lead?.id]);

    const fetchInteractions = async () => {
        if (!lead?.id) return;
        setLoading(true);
        try {
            const res = await fetch(route('leads.interactions.index', lead.id), {
                headers: { credentials: 'same-origin', Accept: 'application/json' },
            });
            if (res.ok) {
                const data = await res.json();
                const fetched: InteractionItem[] = data.interactions || [];
                setInteractions(fetched);
                setCanManageNotes(Boolean(data.can_manage_notes));

                // Auto open threads with notes
                const initialOpen: Record<number, boolean> = {};
                fetched.forEach((item) => {
                    if (item.internal_notes && item.internal_notes.length > 0) {
                        initialOpen[item.id] = true;
                    }
                });
                setOpenThreads(initialOpen);
            }
        } catch (err) {
            console.error('Error fetching lead interactions:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleThread = (interactionId: number) => {
        setOpenThreads((prev) => ({
            ...prev,
            [interactionId]: !prev[interactionId],
        }));
    };

    const handleSendNote = async (interactionId: number) => {
        const content = replyText[interactionId]?.trim();
        if (!content || !lead?.id) return;

        setSubmittingNoteId(interactionId);
        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            const res = await fetch(route('leads.interactions.notes.store', [lead.id, interactionId]), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({ content }),
            });

            const data = await res.json();
            if (res.ok && data.note) {
                toast.success('Catatan arahan berhasil dikirim');
                setInteractions((prev) =>
                    prev.map((item) => {
                        if (item.id === interactionId) {
                            const currentNotes = item.internal_notes || [];
                            return {
                                ...item,
                                internal_notes: [...currentNotes, data.note],
                            };
                        }
                        return item;
                    })
                );
                setReplyText((prev) => ({ ...prev, [interactionId]: '' }));
                setOpenThreads((prev) => ({ ...prev, [interactionId]: true }));
            } else {
                toast.error(data.message || 'Gagal mengirim catatan');
            }
        } catch (err) {
            console.error('Error sending note:', err);
            toast.error('Terjadi kesalahan jaringan');
        } finally {
            setSubmittingNoteId(null);
        }
    };

    const getInitials = (name?: string): string => {
        if (!name) return 'U';
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[1][0]).toUpperCase();
    };

    const getRoleBadgeConfig = (badge?: string) => {
        switch (badge) {
            case 'Superadmin':
                return {
                    badgeClass: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30 font-semibold',
                    avatarClass: 'bg-purple-600 text-white',
                };
            case 'Sales Manager':
                return {
                    badgeClass: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 font-semibold',
                    avatarClass: 'bg-indigo-600 text-white',
                };
            case 'Sales PIC':
                return {
                    badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-semibold',
                    avatarClass: 'bg-emerald-600 text-white',
                };
            default:
                return {
                    badgeClass: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30',
                    avatarClass: 'bg-slate-600 text-white',
                };
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!lead?.id) return;
        if (!notes.trim()) {
            toast.error('Catatan hasil interaksi wajib diisi');
            return;
        }

        setSubmitting(true);

        // Combine date + time
        const combinedInteractionDate = new Date(interactionDate);
        const [ih, im] = interactionTime.split(':');
        combinedInteractionDate.setHours(Number(ih) || 0, Number(im) || 0, 0);

        let combinedNextDate: string | null = null;
        if (nextFollowUpDate) {
            const nd = new Date(nextFollowUpDate);
            const [nh, nm] = nextFollowUpTime.split(':');
            nd.setHours(Number(nh) || 0, Number(nm) || 0, 0);
            combinedNextDate = format(nd, 'yyyy-MM-dd HH:mm:ss');
        }

        const payload: Record<string, any> = {
            channel,
            notes: notes.trim(),
            interaction_date: format(combinedInteractionDate, 'yyyy-MM-dd HH:mm:ss'),
            next_follow_up_date: combinedNextDate,
            next_follow_up_note: nextFollowUpNote.trim() || null,
        };

        if (updateStage && updateStage !== 'none' && updateStage !== lead.status) {
            payload.update_stage = updateStage;
        }

        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
            const res = await fetch(route('leads.interactions.store', lead.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                toast.success('Catatan follow-up berhasil dicatat!');
                setNotes('');
                setNextFollowUpDate(undefined);
                setNextFollowUpNote('');
                setActiveTab('timeline');
                fetchInteractions();
                if (onInteractionAdded) {
                    onInteractionAdded();
                } else {
                    router.reload({ only: ['leads', 'stats'] });
                }
            } else {
                toast.error(data.message || 'Gagal menyimpan catatan');
            }
        } catch (err) {
            console.error(err);
            toast.error('Terjadi kesalahan saat menyimpan catatan');
        } finally {
            setSubmitting(false);
        }
    };

    if (!lead) return null;

    const currentStage = STAGE_LABELS[lead.status] || { label: lead.status, color: 'bg-muted text-muted-foreground' };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-card to-muted/40 p-6 border-b border-border/80">
                    <DialogHeader>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                                        {lead.name}
                                    </DialogTitle>
                                    {lead.lead_temperature_badge && (
                                        <Badge variant="outline" className={cn("text-[11px] font-bold px-2 py-0.5", lead.lead_temperature_badge.color)}>
                                            {lead.lead_temperature_badge.full_label}
                                        </Badge>
                                    )}
                                    <Badge variant="outline" className={cn("text-xs font-semibold px-2 py-0.5", currentStage.color)}>
                                        {currentStage.label}
                                    </Badge>
                                    {lead.sla_status && (
                                        <Badge variant="outline" className={cn("text-[10px] font-mono px-2 py-0.5", lead.sla_status.color)}>
                                            {lead.sla_status.label}
                                        </Badge>
                                    )}
                                </div>
                                <DialogDescription className="text-xs text-muted-foreground flex flex-wrap items-center gap-3">
                                    <span className="flex items-center gap-1 font-mono text-foreground/80">
                                        <Phone className="size-3 text-primary" />
                                        {lead.whatsapp}
                                    </span>
                                    {lead.project && (
                                        <span>• Minat Proyek: <strong className="text-foreground">{lead.project.name}</strong></span>
                                    )}
                                    {lead.sales && (
                                        <span>• Sales PIC: <strong className="text-foreground">{lead.sales.name}</strong></span>
                                    )}
                                    {lead.source && (
                                        <span>• Sumber: <strong className="text-foreground">{lead.source}</strong>{lead.source_detail ? ` (${lead.source_detail})` : ''}</span>
                                    )}
                                </DialogDescription>
                            </div>

                            {/* Quick WhatsApp Action Button */}
                            {lead.whatsapp_url && (
                                <Button
                                    type="button"
                                    size="sm"
                                    asChild
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs gap-1.5 h-8 px-3 rounded-lg text-xs"
                                >
                                    <a href={lead.whatsapp_url} target="_blank" rel="noopener noreferrer">
                                        <MessageSquare className="size-3.5 fill-current" />
                                        Chat WhatsApp
                                        <ExternalLink className="size-3 opacity-75" />
                                    </a>
                                </Button>
                            )}
                        </div>

                        {/* Reminder status banner if scheduled */}
                        {lead.formatted_next_follow_up && (
                            <div className={cn(
                                "mt-3.5 px-3 py-2 rounded-xl text-xs flex items-center justify-between border",
                                lead.next_follow_up_status === 'overdue'
                                    ? "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
                                    : lead.next_follow_up_status === 'today'
                                        ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 font-semibold"
                                        : "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300"
                            )}>
                                <div className="flex items-center gap-2">
                                    <CalendarCheck className="size-4" />
                                    <span>
                                        Jadwal Follow-up:{' '}
                                        <strong>{lead.formatted_next_follow_up}</strong>
                                    </span>
                                </div>
                                <span className="uppercase text-[10px] tracking-wider font-bold">
                                    {lead.next_follow_up_status === 'overdue' ? 'Overdue' : lead.next_follow_up_status === 'today' ? 'Hari Ini' : 'Akan Datang'}
                                </span>
                            </div>
                        )}

                        {/* Held/Booked Unit Card */}
                        {lead.active_booking?.unit && (
                            <div className="mt-2.5 px-3.5 py-2 rounded-xl text-xs flex items-center justify-between border border-primary/30 bg-primary/5 text-foreground">
                                <div className="flex items-center gap-2">
                                    <Home className="size-4 text-primary flex-shrink-0" />
                                    <span>
                                        Kavling Terpilih: <strong className="font-semibold text-foreground">Blok {lead.active_booking.unit.unit_code}</strong> ({lead.active_booking.unit.cluster?.name || 'Cluster'})
                                    </span>
                                </div>
                                <Badge variant="outline" className="font-mono text-[10px] text-primary bg-background border-primary/30 font-medium">
                                    {lead.active_booking.booking_code}
                                </Badge>
                            </div>
                        )}

                        {/* KPR & Financial Readiness Ribbon */}
                        {(lead.slik_status || lead.job_type || lead.max_budget || lead.preferred_unit_type) && (
                            <div className="mt-2.5 px-3 py-2 rounded-xl text-xs border border-border/80 bg-muted/40 flex flex-wrap items-center justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    {lead.slik_status === 'clear' ? (
                                        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] gap-1 font-semibold">
                                            <ShieldCheck className="size-3" />
                                            SLIK Clear (Kol 1)
                                        </Badge>
                                    ) : lead.slik_status === 'ragu' ? (
                                        <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] gap-1 font-semibold">
                                            <ShieldCheck className="size-3" />
                                            SLIK Ragu (Kol 2)
                                        </Badge>
                                    ) : lead.slik_status === 'blacklist' ? (
                                        <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px] gap-1 font-semibold">
                                            <ShieldCheck className="size-3" />
                                            SLIK Blacklist
                                        </Badge>
                                    ) : null}

                                    {lead.job_type && (
                                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                            <CreditCard className="size-3 text-primary" />
                                            {lead.job_type}
                                            {lead.company_name ? ` (${lead.company_name})` : ''}
                                        </span>
                                    )}

                                    {lead.formatted_monthly_income && (
                                        <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                            • Gaji {lead.formatted_monthly_income}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                    {lead.preferred_unit_type && (
                                        <span>Minat: <strong className="text-foreground">{lead.preferred_unit_type}</strong></span>
                                    )}
                                    {lead.formatted_max_budget && (
                                        <span>• Max Budget: <strong className="text-primary">{lead.formatted_max_budget}</strong></span>
                                    )}
                                    {lead.spouse_name && (
                                        <span className="flex items-center gap-1">
                                            • <HeartHandshake className="size-3 text-pink-500" />
                                            Join {lead.spouse_name}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </DialogHeader>

                    {/* Tab Switcher */}
                    <div className="flex gap-2 mt-4">
                        <Button
                            type="button"
                            size="sm"
                            variant={activeTab === 'timeline' ? 'default' : 'outline'}
                            onClick={() => setActiveTab('timeline')}
                            className="h-8 text-xs gap-1.5 rounded-lg"
                        >
                            <History className="size-3.5" />
                            Riwayat Timeline ({interactions.length})
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant={activeTab === 'add' ? 'default' : 'outline'}
                            onClick={() => setActiveTab('add')}
                            className="h-8 text-xs gap-1.5 rounded-lg"
                        >
                            <PlusCircle className="size-3.5" />
                            Catat Follow-Up Baru
                        </Button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 max-h-[55vh]">
                    {activeTab === 'timeline' ? (
                        <div>
                            {loading ? (
                                <div className="py-12 flex flex-col items-center justify-center text-muted-foreground gap-2">
                                    <Loader2 className="size-6 animate-spin text-primary" />
                                    <p className="text-xs">Memuat riwayat interaksi...</p>
                                </div>
                            ) : interactions.length === 0 ? (
                                <div className="text-center py-12 px-4 border border-dashed rounded-2xl bg-muted/20">
                                    <div className="mx-auto size-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 text-primary">
                                        <History className="size-6" />
                                    </div>
                                    <h4 className="font-semibold text-foreground text-sm">Belum Ada Riwayat Follow-Up</h4>
                                    <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                                        Catat interaksi pertama Anda dengan calon konsumen ini via WhatsApp, Telepon, atau Janji Temu.
                                    </p>
                                    <Button
                                        size="sm"
                                        onClick={() => setActiveTab('add')}
                                        className="mt-4 text-xs gap-1.5 rounded-lg"
                                    >
                                        <PlusCircle className="size-3.5" />
                                        Mulai Catat Interaksi
                                    </Button>
                                </div>
                            ) : (
                                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                                    {interactions.map((item, idx) => {
                                        const chConfig = CHANNEL_CONFIG[item.channel] || CHANNEL_CONFIG.other;
                                        const ChannelIcon = chConfig.icon;
                                        const stageInfo = STAGE_LABELS[item.stage_at_interaction] || { label: item.stage_at_interaction, color: 'bg-muted' };

                                        const isAuditLog = item.notes?.includes('🛡️ Audit Log');
                                        const isPoolAction = item.notes?.includes('🗄️') || item.notes?.includes('♻️');

                                        return (
                                            <div key={item.id} className="relative group">
                                                {/* Timeline Icon Node */}
                                                <div className={cn(
                                                    "absolute -left-6 top-0.5 size-6 rounded-full border flex items-center justify-center shadow-xs bg-background",
                                                    isAuditLog
                                                        ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                                        : isPoolAction
                                                            ? "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                                            : chConfig.color
                                                )}>
                                                    {isAuditLog ? (
                                                        <ShieldAlert className="size-3" />
                                                    ) : isPoolAction ? (
                                                        <Archive className="size-3" />
                                                    ) : (
                                                        <ChannelIcon className="size-3" />
                                                    )}
                                                </div>

                                                {/* Card */}
                                                <div className={cn(
                                                    "bg-card border rounded-2xl p-4 shadow-xs transition-colors",
                                                    isAuditLog
                                                        ? "border-amber-500/40 bg-amber-500/5 hover:border-amber-500/60"
                                                        : isPoolAction
                                                            ? "border-rose-500/40 bg-rose-500/5 hover:border-rose-500/60"
                                                            : "border-border/80 hover:border-primary/40"
                                                )}>
                                                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                                        <div className="flex items-center gap-2">
                                                            {isAuditLog ? (
                                                                <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300 font-bold gap-1">
                                                                    <ShieldAlert className="size-2.5" />
                                                                    Audit Keamanan
                                                                </Badge>
                                                            ) : isPoolAction ? (
                                                                <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-rose-500/15 border-rose-500/40 text-rose-700 dark:text-rose-300 font-bold gap-1">
                                                                    <Archive className="size-2.5" />
                                                                    Workspace Pool
                                                                </Badge>
                                                            ) : (
                                                                <span className="text-xs font-bold text-foreground">
                                                                    {chConfig.label}
                                                                </span>
                                                            )}

                                                            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", stageInfo.color)}>
                                                                {stageInfo.label}
                                                            </Badge>
                                                        </div>

                                                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                                            <Clock className="size-3" />
                                                            <span>{item.formatted_interaction_date || item.interaction_date}</span>
                                                        </div>
                                                    </div>

                                                    {/* Notes */}
                                                    {isAuditLog ? (
                                                        <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl">
                                                            <p className="text-xs text-amber-950 dark:text-amber-200 font-medium whitespace-pre-wrap leading-relaxed">
                                                                {item.notes}
                                                            </p>
                                                        </div>
                                                    ) : isPoolAction ? (
                                                        <div className="bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
                                                            <p className="text-xs text-rose-950 dark:text-rose-200 font-medium whitespace-pre-wrap leading-relaxed">
                                                                {item.notes}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed bg-muted/30 p-2.5 rounded-xl">
                                                            {item.notes}
                                                        </p>
                                                    )}

                                                    {/* Next follow up info if present */}
                                                    {item.next_follow_up_date && (
                                                        <div className="mt-3 flex items-center gap-2 text-xs text-primary bg-primary/5 border border-primary/20 px-2.5 py-1.5 rounded-lg">
                                                            <CalendarCheck className="size-3.5 shrink-0" />
                                                            <span className="truncate">
                                                                Tindak Lanjut Berikutnya: <strong>{format(parseISO(item.next_follow_up_date), 'dd MMMM yyyy, HH:mm', { locale: idLocale })}</strong>
                                                                {item.next_follow_up_note && ` (${item.next_follow_up_note})`}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Sales Author */}
                                                    <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                                                        <span>
                                                            Oleh: <strong className="text-foreground">{item.sales_user?.name || 'Sales Casanuma'}</strong>
                                                        </span>
                                                        <span className="text-[10px] opacity-70">#{interactions.length - idx}</span>
                                                    </div>

                                                    {/* Internal Notes / Komentar & Evaluasi Tim */}
                                                    {canManageNotes && (
                                                        <div className="mt-3 pt-2.5 border-t border-dashed border-border/70">
                                                            {/* Thread Header Toggle */}
                                                            <div className="flex items-center justify-between">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleThread(item.id)}
                                                                    className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors focus:outline-hidden"
                                                                >
                                                                    <MessageCircle className="size-3.5 text-primary" />
                                                                    <span>Catatan & Arahan Tim</span>
                                                                    {item.internal_notes && item.internal_notes.length > 0 ? (
                                                                        <Badge variant="secondary" className="ml-1 h-4 px-1.5 text-[10px] font-bold bg-primary/10 text-primary border-primary/20">
                                                                            {item.internal_notes.length}
                                                                        </Badge>
                                                                    ) : (
                                                                        <span className="text-[10px] text-muted-foreground font-normal ml-0.5">
                                                                            (Beri Arahan)
                                                                        </span>
                                                                    )}
                                                                    {openThreads[item.id] ? (
                                                                        <ChevronUp className="size-3 text-muted-foreground ml-0.5" />
                                                                    ) : (
                                                                        <ChevronDown className="size-3 text-muted-foreground ml-0.5" />
                                                                    )}
                                                                </button>

                                                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                                    <Lock className="size-2.5 opacity-60" />
                                                                    Internal Only
                                                                </span>
                                                            </div>

                                                            {/* Thread Expanded Content */}
                                                            {openThreads[item.id] && (
                                                                <div className="mt-2.5 space-y-2.5 rounded-xl bg-muted/40 p-2.5 border border-border/60">
                                                                    {/* Note Items */}
                                                                    {item.internal_notes && item.internal_notes.length > 0 ? (
                                                                        <div className="space-y-2">
                                                                            {item.internal_notes.map((note) => {
                                                                                const roleConfig = getRoleBadgeConfig(note.author_role_badge);
                                                                                return (
                                                                                    <div
                                                                                        key={note.id}
                                                                                        className="text-xs bg-background/95 p-2.5 rounded-lg border border-border/70 shadow-2xs space-y-1.5"
                                                                                    >
                                                                                        <div className="flex items-center justify-between gap-2">
                                                                                            <div className="flex items-center gap-1.5">
                                                                                                <div
                                                                                                    className={cn(
                                                                                                        "size-5.5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0",
                                                                                                        roleConfig.avatarClass
                                                                                                    )}
                                                                                                >
                                                                                                    {getInitials(note.user?.name)}
                                                                                                </div>
                                                                                                <span className="font-semibold text-foreground text-[11.5px]">
                                                                                                    {note.user?.name || 'User'}
                                                                                                </span>
                                                                                                {note.author_role_badge && (
                                                                                                    <Badge
                                                                                                        variant="outline"
                                                                                                        className={cn("text-[9px] px-1.5 py-0", roleConfig.badgeClass)}
                                                                                                    >
                                                                                                        {note.author_role_badge}
                                                                                                    </Badge>
                                                                                                )}
                                                                                            </div>
                                                                                            <span className="text-[10px] text-muted-foreground font-mono">
                                                                                                {note.formatted_created_at}
                                                                                            </span>
                                                                                        </div>
                                                                                        <p className="text-foreground/90 pl-7 text-[11.5px] leading-relaxed whitespace-pre-wrap">
                                                                                            {note.content}
                                                                                        </p>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    ) : (
                                                                        <p className="text-[11px] text-muted-foreground italic px-1">
                                                                            Belum ada arahan internal pada aktivitas follow-up ini.
                                                                        </p>
                                                                    )}

                                                                    {/* Reply Input Form */}
                                                                    <div className="flex gap-2 items-center pt-1">
                                                                        <Input
                                                                            placeholder="Tulis arahan manager atau tanggapan sales..."
                                                                            value={replyText[item.id] || ''}
                                                                            onChange={(e) =>
                                                                                setReplyText((prev) => ({
                                                                                    ...prev,
                                                                                    [item.id]: e.target.value,
                                                                                }))
                                                                            }
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                                                    e.preventDefault();
                                                                                    handleSendNote(item.id);
                                                                                }
                                                                            }}
                                                                            disabled={submittingNoteId === item.id}
                                                                            className="h-8 text-xs bg-background"
                                                                        />
                                                                        <Button
                                                                            type="button"
                                                                            size="sm"
                                                                            disabled={submittingNoteId === item.id || !replyText[item.id]?.trim()}
                                                                            onClick={() => handleSendNote(item.id)}
                                                                            className="h-8 px-3 text-xs gap-1.5 shrink-0 bg-primary text-primary-foreground"
                                                                        >
                                                                            {submittingNoteId === item.id ? (
                                                                                <Loader2 className="size-3 animate-spin" />
                                                                            ) : (
                                                                                <Send className="size-3" />
                                                                            )}
                                                                            <span>Kirim</span>
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Form Catat Follow-up */
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            {/* Saluran & Tahapan */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium">Kanal / Media Komunikasi</Label>
                                    <Select
                                        value={channel}
                                        onValueChange={(val: any) => setChannel(val)}
                                    >
                                        <SelectTrigger className="h-9 text-xs">
                                            <SelectValue placeholder="Pilih media follow-up" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="whatsapp">💬 WhatsApp Chat</SelectItem>
                                            <SelectItem value="phone">📞 Telepon / Call</SelectItem>
                                            <SelectItem value="meeting">🤝 Janji Temu / Kunjungan Survey</SelectItem>
                                            <SelectItem value="email">✉️ Email</SelectItem>
                                            <SelectItem value="other">📝 Catatan Lainnya</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium">Perbarui Tahapan Pipeline (Opsional)</Label>
                                    <Select
                                        value={updateStage}
                                        onValueChange={setUpdateStage}
                                    >
                                        <SelectTrigger className="h-9 text-xs">
                                            <SelectValue placeholder="Pilih tahapan baru" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Tetap di tahapan saat ini ({currentStage.label})</SelectItem>
                                            <SelectItem value="new">New Lead</SelectItem>
                                            <SelectItem value="contacted">Contacted</SelectItem>
                                            <SelectItem value="survey_visit">Survey Visit</SelectItem>
                                            <SelectItem value="booking">Booking Fee</SelectItem>
                                            <SelectItem value="spk_akad">SPK / Akad</SelectItem>
                                            <SelectItem value="lost">Lost / Batal</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Waktu Interaksi */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium">Tanggal Interaksi</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="w-full justify-start text-left font-normal h-9 text-xs pl-3 border-input bg-background"
                                            >
                                                <CalendarIcon className="mr-2 size-3.5 text-muted-foreground" />
                                                {interactionDate ? (
                                                    format(interactionDate, "dd MMMM yyyy", { locale: idLocale })
                                                ) : (
                                                    <span>Pilih tanggal</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 z-50" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={interactionDate}
                                                onSelect={(d) => d && setInteractionDate(d)}
                                                autoFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium">Waktu (Jam:Menit)</Label>
                                    <Select
                                        value={interactionTime}
                                        onValueChange={setInteractionTime}
                                    >
                                        <SelectTrigger className="h-9 text-xs font-mono">
                                            <SelectValue placeholder="Pilih jam" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-48">
                                            {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'].map((t) => (
                                                <SelectItem key={t} value={t} className="font-mono text-xs">{t}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Catatan Hasil Interaksi */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">
                                    Catatan Hasil Follow-up <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    rows={3}
                                    placeholder="Tuliskan respon calon pembeli, preferensi tipe unit/lokasi, keberatan harga, atau jadwal janji temu survey lokasi..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="text-xs resize-none"
                                />
                            </div>

                            {/* Jadwal Follow-up Selanjutnya (Planning & Reminder) */}
                            <div className="border border-border/80 rounded-2xl p-3.5 bg-muted/20 space-y-3">
                                <div className="flex items-center gap-2">
                                    <CalendarCheck className="size-4 text-primary" />
                                    <h5 className="text-xs font-bold text-foreground">
                                        Rencana Jadwal Follow-up Berikutnya
                                    </h5>
                                    <Badge variant="secondary" className="text-[10px] ml-auto">
                                        Pengingat Sales
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-[11px] text-muted-foreground">Pilih Tanggal Pengingat</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal h-8 text-xs pl-3 border-input bg-background",
                                                        !nextFollowUpDate && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 size-3 text-muted-foreground" />
                                                    {nextFollowUpDate ? (
                                                        format(nextFollowUpDate, "dd MMMM yyyy", { locale: idLocale })
                                                    ) : (
                                                        <span>Set tanggal tindak lanjut</span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 z-50" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={nextFollowUpDate}
                                                    onSelect={setNextFollowUpDate}
                                                    autoFocus
                                                />
                                                {nextFollowUpDate && (
                                                    <div className="p-2 border-t flex justify-end">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-xs h-7 text-destructive"
                                                            onClick={() => setNextFollowUpDate(undefined)}
                                                        >
                                                            Hapus Jadwal
                                                        </Button>
                                                    </div>
                                                )}
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-[11px] text-muted-foreground">Jam Pengingat</Label>
                                        <Select
                                            value={nextFollowUpTime}
                                            onValueChange={setNextFollowUpTime}
                                            disabled={!nextFollowUpDate}
                                        >
                                            <SelectTrigger className="h-8 text-xs font-mono">
                                                <SelectValue placeholder="Pilih jam" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-48">
                                                {['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map((t) => (
                                                    <SelectItem key={t} value={t} className="font-mono text-xs">{t}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {nextFollowUpDate && (
                                    <div className="space-y-1">
                                        <Label className="text-[11px] text-muted-foreground">Catatan Agenda Pengingat</Label>
                                        <Textarea
                                            rows={2}
                                            placeholder="Contoh: Kirim brosur tipe 45, konfirmasi kehadiran survey jam 2 siang..."
                                            value={nextFollowUpNote}
                                            onChange={(e) => setNextFollowUpNote(e.target.value)}
                                            className="text-xs resize-none"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end gap-2 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setActiveTab('timeline')}
                                    disabled={submitting}
                                    className="text-xs rounded-xl"
                                >
                                    Kembali ke Riwayat
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={submitting || !notes.trim()}
                                    className="text-xs rounded-xl gap-1.5 shadow-xs"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="size-3.5 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="size-3.5" />
                                            Simpan Catatan Follow-Up
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
