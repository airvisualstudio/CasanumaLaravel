import { useState } from 'react';
import KanbanCard, { KanbanLeadItem } from './KanbanCard';
import LostReasonDialog from './LostReasonDialog';
import { Badge } from '@/Components/ui/badge';
import { cn } from '@/lib/utils';
import {
    UserPlus,
    PhoneCall,
    MapPin,
    CreditCard,
    FileCheck2,
    XCircle,
    Inbox,
    Plus
} from 'lucide-react';
import { toast } from '@/Components/ui/sonner';

export interface KanbanStage {
    id: string;
    title: string;
    icon: React.ElementType;
    color: string;
    headerBg: string;
    badgeColor: string;
}

export const KANBAN_STAGES: KanbanStage[] = [
    {
        id: 'new',
        title: 'New Lead',
        icon: UserPlus,
        color: 'border-blue-500/40 text-blue-600 dark:text-blue-400',
        headerBg: 'bg-blue-500/10',
        badgeColor: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
    },
    {
        id: 'contacted',
        title: 'Contacted',
        icon: PhoneCall,
        color: 'border-amber-500/40 text-amber-600 dark:text-amber-400',
        headerBg: 'bg-amber-500/10',
        badgeColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    },
    {
        id: 'survey_visit',
        title: 'Survey Visit',
        icon: MapPin,
        color: 'border-purple-500/40 text-purple-600 dark:text-purple-400',
        headerBg: 'bg-purple-500/10',
        badgeColor: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
    },
    {
        id: 'booking',
        title: 'Booking Fee',
        icon: CreditCard,
        color: 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400',
        headerBg: 'bg-emerald-500/10',
        badgeColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    },
    {
        id: 'spk_akad',
        title: 'SPK / Akad',
        icon: FileCheck2,
        color: 'border-indigo-500/40 text-indigo-600 dark:text-indigo-400',
        headerBg: 'bg-indigo-500/10',
        badgeColor: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
    },
    {
        id: 'lost',
        title: 'Lost / Batal',
        icon: XCircle,
        color: 'border-rose-500/40 text-rose-600 dark:text-rose-400',
        headerBg: 'bg-rose-500/10',
        badgeColor: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
    },
];

interface Props {
    leads: KanbanLeadItem[];
    onOpenTimeline: (lead: KanbanLeadItem) => void;
    onStatusChange?: (leadId: number, newStage: string) => void;
}

export default function KanbanBoard({
    leads: initialLeads,
    onOpenTimeline,
    onStatusChange,
}: Props) {
    const [leads, setLeads] = useState<KanbanLeadItem[]>(initialLeads);
    const [draggedLead, setDraggedLead] = useState<KanbanLeadItem | null>(null);
    const [activeDropStage, setActiveDropStage] = useState<string | null>(null);

    // Lost Reason modal state
    const [lostModalOpen, setLostModalOpen] = useState(false);
    const [pendingLostLead, setPendingLostLead] = useState<KanbanLeadItem | null>(null);
    const [submittingLost, setSubmittingLost] = useState(false);

    // Sync with parent props
    useState(() => {
        setLeads(initialLeads);
    });

    // Update internal state when props change
    if (initialLeads !== leads && !draggedLead && !pendingLostLead) {
        setLeads(initialLeads);
    }

    const handleDragStart = (e: React.DragEvent, lead: KanbanLeadItem) => {
        setDraggedLead(lead);
        e.dataTransfer.setData('text/plain', String(lead.id));
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, stageId: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (activeDropStage !== stageId) {
            setActiveDropStage(stageId);
        }
    };

    const handleDragLeave = (stageId: string) => {
        if (activeDropStage === stageId) {
            setActiveDropStage(null);
        }
    };

    const handleDrop = async (e: React.DragEvent, targetStage: string) => {
        e.preventDefault();
        setActiveDropStage(null);

        if (!draggedLead) return;
        const currentStage = draggedLead.status;

        if (currentStage === targetStage) {
            setDraggedLead(null);
            return;
        }

        const leadToMove = draggedLead;
        setDraggedLead(null);

        // If target stage is Lost, intercept and require reason via dialog
        if (targetStage === 'lost') {
            setPendingLostLead(leadToMove);
            setLostModalOpen(true);
            return;
        }

        // Optimistic update in UI
        const previousLeads = [...leads];
        setLeads((prev) =>
            prev.map((l) => (l.id === leadToMove.id ? { ...l, status: targetStage } : l))
        );

        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
            const res = await fetch(route('leads.update-status', leadToMove.id), {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({ status: targetStage }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                const targetStageName = KANBAN_STAGES.find((s) => s.id === targetStage)?.title || targetStage;
                toast.success(`${leadToMove.name} dipindahkan ke ${targetStageName}`);
                if (onStatusChange) {
                    onStatusChange(leadToMove.id, targetStage);
                }
            } else {
                // Rollback
                setLeads(previousLeads);
                toast.error(data.message || 'Gagal memperbarui tahapan');
            }
        } catch (err) {
            console.error('Error updating stage:', err);
            setLeads(previousLeads);
            toast.error('Gagal terhubung ke server');
        }
    };

    const handleConfirmLost = async (reason: string) => {
        if (!pendingLostLead) return;

        setSubmittingLost(true);
        const leadToMove = pendingLostLead;
        const previousLeads = [...leads];

        // Optimistic update
        setLeads((prev) =>
            prev.map((l) => (l.id === leadToMove.id ? { ...l, status: 'lost' } : l))
        );

        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
            const res = await fetch(route('leads.update-status', leadToMove.id), {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({ status: 'lost', reason }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                toast.success(`${leadToMove.name} dipindahkan ke Lost / Batal dengan alasan tercatat.`);
                setLostModalOpen(false);
                setPendingLostLead(null);
                if (onStatusChange) {
                    onStatusChange(leadToMove.id, 'lost');
                }
            } else {
                setLeads(previousLeads);
                toast.error(data.message || 'Gagal memperbarui status ke Lost');
            }
        } catch (err) {
            console.error('Error setting lost stage:', err);
            setLeads(previousLeads);
            toast.error('Terjadi kesalahan jaringan');
        } finally {
            setSubmittingLost(false);
        }
    };

    const handleCancelLost = () => {
        setPendingLostLead(null);
        setLostModalOpen(false);
    };

    return (
        <div className="flex gap-4 overflow-x-auto pb-6 pt-1 [scrollbar-width:thin] min-h-[720px] items-stretch">
            {KANBAN_STAGES.map((stage) => {
                const stageLeads = leads.filter((l) => {
                    if (stage.id === 'lost') {
                        return l.status === 'lost' || l.status === 'rejected';
                    }
                    return l.status === stage.id;
                });

                const StageIcon = stage.icon;
                const isTarget = activeDropStage === stage.id;

                return (
                    <div
                        key={stage.id}
                        onDragOver={(e) => handleDragOver(e, stage.id)}
                        onDragLeave={() => handleDragLeave(stage.id)}
                        onDrop={(e) => handleDrop(e, stage.id)}
                        className={cn(
                            "w-80 shrink-0 flex flex-col rounded-3xl border bg-muted/25 transition-all duration-200",
                            isTarget ? "border-primary bg-primary/5 ring-2 ring-primary/20 scale-[1.01]" : "border-border/70",
                            stage.id === 'lost' && "bg-rose-500/[0.02]"
                        )}
                    >
                        {/* Swimlane Column Header */}
                        <div className={cn(
                            "p-3.5 border-b border-border/60 rounded-t-3xl flex items-center justify-between",
                            stage.headerBg
                        )}>
                            <div className="flex items-center gap-2">
                                <div className={cn("size-7 rounded-xl border flex items-center justify-center bg-background/80 shadow-2xs", stage.color)}>
                                    <StageIcon className="size-3.5" />
                                </div>
                                <h3 className="text-xs font-bold tracking-tight text-foreground">
                                    {stage.title}
                                </h3>
                            </div>

                            <Badge variant="outline" className={cn("text-xs font-bold px-2 py-0.5", stage.badgeColor)}>
                                {stageLeads.length}
                            </Badge>
                        </div>

                        {/* Cards Container */}
                        <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[400px]">
                            {stageLeads.length === 0 ? (
                                <div className={cn(
                                    "h-48 border border-dashed rounded-2xl flex flex-col items-center justify-center p-4 text-center transition-colors",
                                    isTarget ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground/60"
                                )}>
                                    <Inbox className="size-8 stroke-[1.5] mb-2 opacity-50" />
                                    <p className="text-xs font-medium">Belum ada prospek</p>
                                    <p className="text-[10px] mt-0.5 opacity-80">Drag kartu lead ke kolom ini</p>
                                </div>
                            ) : (
                                stageLeads.map((lead) => (
                                    <KanbanCard
                                        key={lead.id}
                                        lead={lead}
                                        onOpenTimeline={onOpenTimeline}
                                        onDragStart={handleDragStart}
                                        isDragging={draggedLead?.id === lead.id}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                );
            })}

            {/* Lost Reason Mandatory Dialog */}
            <LostReasonDialog
                open={lostModalOpen}
                onOpenChange={setLostModalOpen}
                leadName={pendingLostLead?.name || ''}
                onConfirm={handleConfirmLost}
                onCancel={handleCancelLost}
                loading={submittingLost}
            />
        </div>
    );
}
