import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, FileText, CheckCircle2, Award, XCircle, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover';
import { usePage, router } from '@inertiajs/react';
import { PageProps, InAppNotification } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export default function NotificationBell() {
    const { notifications: initialNotifications } = usePage<PageProps>().props;
    const [open, setOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(initialNotifications?.unread_count || 0);
    const [notifications, setNotifications] = useState<InAppNotification[]>(initialNotifications?.recent || []);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialNotifications) {
            setUnreadCount(initialNotifications.unread_count);
            setNotifications(initialNotifications.recent);
        }
    }, [initialNotifications]);

    // Poll for notifications every 30 seconds
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const response = await fetch('/notifications', {
                    headers: { credentials: 'same-origin', Accept: 'application/json' },
                });
                if (response.ok) {
                    const data = await response.json();
                    setNotifications(data.notifications || []);
                    setUnreadCount(data.unread_count || 0);
                }
            } catch (err) {
                // Silently ignore polling errors
            }
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const handleMarkAllRead = async () => {
        try {
            setLoading(true);
            const token = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
            const res = await fetch('/notifications/mark-all-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': token || '',
                    Accept: 'application/json',
                },
            });
            if (res.ok) {
                setUnreadCount(0);
                setNotifications((prev) =>
                    prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationClick = async (notif: InAppNotification) => {
        // Mark as read
        if (!notif.read_at) {
            try {
                const token = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
                await fetch(`/notifications/${notif.id}/read`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': token || '',
                        Accept: 'application/json',
                    },
                });
                setUnreadCount((c) => Math.max(0, c - 1));
                setNotifications((prev) =>
                    prev.map((n) => (n.id === notif.id ? { ...n, read_at: new Date().toISOString() } : n))
                );
            } catch {
                // Continue navigation even if mark read failed
            }
        }

        setOpen(false);

        if (notif.data?.action_url) {
            router.visit(notif.data.action_url);
        }
    };

    const getIcon = (iconName?: string, status?: string) => {
        switch (iconName || status) {
            case 'FileText':
            case 'submitted':
                return <FileText className="size-4 text-amber-500" />;
            case 'CheckCircle2':
            case 'finance_approved':
                return <CheckCircle2 className="size-4 text-blue-500" />;
            case 'Award':
            case 'manager_approved':
                return <Award className="size-4 text-emerald-500" />;
            case 'XCircle':
            case 'rejected':
                return <XCircle className="size-4 text-red-500" />;
            default:
                return <Bell className="size-4 text-primary" />;
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative size-9 text-muted-foreground hover:text-foreground hover:bg-muted"
                    title="Notifikasi Sistem"
                >
                    <Bell className="size-4.5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-xs animate-pulse">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent
                align="end"
                className="w-80 sm:w-96 p-0 border border-border/80 shadow-lg rounded-xl overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-3.5 border-b border-border/60 bg-muted/20">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">Notifikasi Sistem</span>
                        {unreadCount > 0 && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-mono">
                                {unreadCount} baru
                            </Badge>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllRead}
                            disabled={loading}
                            className="h-6 text-[11px] text-muted-foreground hover:text-primary gap-1 px-1.5"
                        >
                            <CheckCheck className="size-3" />
                            <span>Tandai Semua Dibaca</span>
                        </Button>
                    )}
                </div>

                {/* Notification List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-border/40">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="size-10 rounded-full bg-muted/60 flex items-center justify-center mx-auto mb-2 text-muted-foreground">
                                <Bell className="size-5 opacity-40" />
                            </div>
                            <p className="text-xs font-medium text-foreground">Belum ada notifikasi</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                Aktivitas dan approval kwitansi terbaru akan muncul di sini.
                            </p>
                        </div>
                    ) : (
                        notifications.map((notif) => {
                            const isUnread = !notif.read_at;
                            return (
                                <button
                                    key={notif.id}
                                    onClick={() => handleNotificationClick(notif)}
                                    className={`w-full text-left p-3 flex items-start gap-3 transition-colors hover:bg-muted/50 ${
                                        isUnread ? 'bg-primary/5 dark:bg-primary/10' : ''
                                    }`}
                                >
                                    <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5 border border-border/60">
                                        {getIcon(notif.data?.icon, notif.data?.status)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-1">
                                            <p className={`text-xs truncate ${isUnread ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>
                                                {notif.data?.title || 'Pemberitahuan'}
                                            </p>
                                            {isUnread && (
                                                <span className="size-1.5 rounded-full bg-rose-500 shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                                            {notif.data?.message}
                                        </p>
                                        {notif.data?.formatted_amount && (
                                            <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                                                {notif.data.formatted_amount}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground/70 mt-1">
                                            <Clock className="size-2.5" />
                                            <span>
                                                {formatDistanceToNow(new Date(notif.created_at), {
                                                    addSuffix: true,
                                                    locale: idLocale,
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                    <div className="p-2 border-t border-border/60 bg-muted/10 text-center">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setOpen(false);
                                router.visit(route('receipts.index'));
                            }}
                            className="w-full h-7 text-[11px] text-primary hover:text-primary gap-1"
                        >
                            <span>Buka Modul Kwitansi</span>
                            <ExternalLink className="size-3" />
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
