import { useState } from 'react';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Phone,
    MessageSquare,
    ExternalLink,
    CalendarCheck,
    Clock,
    User,
    Building2,
    History,
    AlertCircle,
    GripVertical,
    CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LeadSummary } from './FollowUpTimelineDialog';

export interface KanbanLeadItem extends LeadSummary {
    source?: string;
    notes?: string | null;
    created_at?: string;
    developer?: {
        id: number;
        name: string;
    } | null;
    latest_interaction?: {
        id: number;
        channel: string;
        notes: string;
        interaction_date: string;
        sales_user?: {
            id: number;
            name: string;
        } | null;
    } | null;
}

interface Props {
    lead: KanbanLeadItem;
    onOpenTimeline: (lead: KanbanLeadItem) => void;
    onDragStart: (e: React.DragEvent, lead: KanbanLeadItem) => void;
    isDragging?: boolean;
}

export default function KanbanCard({
    lead,
    onOpenTimeline,
    onDragStart,
    isDragging = false,
}: Props) {
    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, lead)}
            className={cn(
                "group relative bg-card rounded-2xl border border-border/80 shadow-xs hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing hover:border-primary/50 overflow-hidden",
                isDragging && "opacity-40 scale-95 border-dashed border-primary"
            )}
        >
            {/* Top Indicator Strip based on Follow-up Status */}
            {lead.next_follow_up_status === 'overdue' && (
                <div className="h-1 w-full bg-rose-500" />
            )}
            {lead.next_follow_up_status === 'today' && (
                <div className="h-1 w-full bg-amber-500" />
            )}
            {lead.next_follow_up_status === 'upcoming' && (
                <div className="h-1 w-full bg-blue-500" />
            )}

            <div className="p-3.5 space-y-2.5">
                {/* Header: Lead Name & Grip */}
                <div className="flex items-start justify-between gap-1.5">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                {lead.name}
                            </h4>
                            {lead.lead_temperature_badge && (
                                <span className={cn("text-[9px] font-bold px-1.5 py-0.2 rounded border", lead.lead_temperature_badge.color)}>
                                    {lead.lead_temperature_badge.label}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono mt-0.5">
                            <Phone className="size-3 text-primary/70 shrink-0" />
                            <span className="truncate">{lead.whatsapp}</span>
                        </div>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground cursor-grab p-0.5">
                        <GripVertical className="size-3.5" />
                    </div>
                </div>

                {/* SLA indicator if applicable */}
                {lead.sla_status && (
                    <div className={cn("text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center justify-between border", lead.sla_status.color)}>
                        <div className="flex items-center gap-1">
                            <Clock className="size-3 shrink-0" />
                            <span>{lead.sla_status.label}</span>
                        </div>
                        {lead.sla_status.is_overdue && (
                            <span className="text-[9px] font-bold uppercase tracking-wider">Timeout</span>
                        )}
                    </div>
                )}

                {/* Project / Cluster Tag */}
                {lead.project && (
                    <div className="flex items-center gap-1.5 text-[11px] text-foreground/80 bg-muted/40 px-2 py-1 rounded-lg border border-border/40">
                        <Building2 className="size-3 text-muted-foreground shrink-0" />
                        <span className="truncate font-medium">{lead.project.name}</span>
                    </div>
                )}

                {/* Source Badge & Sales PIC */}
                <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                    <span className="truncate max-w-[140px] font-medium bg-muted px-1.5 py-0.5 rounded" title={lead.source_detail ? `${lead.source} (${lead.source_detail})` : lead.source}>
                        {lead.source || 'Walk-in'}
                        {lead.source_detail ? ` • ${lead.source_detail}` : ''}
                    </span>

                    {lead.sales && (
                        <span className="truncate max-w-[100px] text-right">
                            PIC: <strong className="text-foreground">{lead.sales.name}</strong>
                        </span>
                    )}
                </div>

                {/* Reminder Alert Badge if scheduled */}
                {lead.formatted_next_follow_up && (
                    <div className={cn(
                        "text-[10px] font-medium px-2 py-1 rounded-lg flex items-center gap-1.5 border",
                        lead.next_follow_up_status === 'overdue'
                            ? "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300 animate-pulse"
                            : lead.next_follow_up_status === 'today'
                                ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 font-bold"
                                : "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300"
                    )}>
                        <CalendarCheck className="size-3 shrink-0" />
                        <span className="truncate">
                            {lead.next_follow_up_status === 'overdue' && '⚠️ Telat: '}
                            {lead.next_follow_up_status === 'today' && '🔔 Hari ini: '}
                            {lead.formatted_next_follow_up}
                        </span>
                    </div>
                )}

                {/* Card Quick Actions */}
                <div className="flex items-center gap-1.5 pt-1">
                    {/* Quick WhatsApp Action */}
                    {lead.whatsapp_url ? (
                        <Button
                            type="button"
                            size="sm"
                            asChild
                            className="flex-1 h-7 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg gap-1 px-2 shadow-2xs"
                        >
                            <a href={lead.whatsapp_url} target="_blank" rel="noopener noreferrer">
                                <MessageSquare className="size-3 fill-current" />
                                <span>WA</span>
                                <ExternalLink className="size-2.5 opacity-60" />
                            </a>
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            size="sm"
                            disabled
                            className="flex-1 h-7 text-[11px] rounded-lg opacity-50"
                        >
                            No WA
                        </Button>
                    )}

                    {/* Timeline & Follow-up Log Action */}
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => onOpenTimeline(lead)}
                        className="flex-1 h-7 text-[11px] rounded-lg gap-1 px-2 border-border/80 hover:bg-muted"
                    >
                        <History className="size-3 text-primary" />
                        <span>Follow Up</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
