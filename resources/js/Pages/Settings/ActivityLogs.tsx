import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useMemo, FormEventHandler } from 'react';
import {
    Activity,
    Bot,
    Search,
    Shield,
    ShieldCheck,
    CheckCircle2,
    AlertTriangle,
    X,
    RotateCcw,
    Send,
    Eye,
    EyeOff,
    Sparkles,
    Clock,
    User as UserIcon,
    Globe,
    Terminal,
    Info,
    ExternalLink,
    HelpCircle,
    Check,
    Loader2,
    Layers,
    Bell,
    Users
} from 'lucide-react';
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
import { toast } from '@/Components/ui/sonner';

interface LogItem {
    id: number;
    action: string;
    description: string;
    subject_type?: string | null;
    subject_id?: number | null;
    properties?: Record<string, any> | null;
    ip_address?: string | null;
    user_agent?: string | null;
    created_at_formatted: string;
    created_at_human: string;
    user?: {
        id: number;
        name: string;
        email: string;
        avatar_url?: string | null;
        roles: string[];
    } | null;
}

interface ActivityLogsProps {
    logs: {
        data: LogItem[];
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
        total: number;
        current_page: number;
        last_page: number;
    };
    filters: {
        search: string;
        action: string;
    };
    availableActions: string[];
    kpi: {
        total_logs: number;
        today_logs: number;
        active_users_today: number;
    };
    telegramConfig: {
        bot_token: string;
        chat_id: string;
        notifications_enabled: boolean;
    };
}

const actionBadges: Record<string, { label: string; color: string }> = {
    user_create: {
        label: 'Tambah User',
        color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    user_update: {
        label: 'Edit User',
        color: 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    user_delete: {
        label: 'Hapus User',
        color: 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400',
    },
    status_toggle: {
        label: 'Ubah Status',
        color: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
    password_reset: {
        label: 'Reset Password',
        color: 'border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400',
    },
    profile_update: {
        label: 'Profil Mandiri',
        color: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    },
    telegram_config: {
        label: 'Setting Telegram',
        color: 'border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400',
    },
    telegram_test: {
        label: 'Test Bot',
        color: 'border-teal-500/30 bg-teal-500/10 text-teal-600 dark:text-teal-400',
    },
};

export default function ActivityLogsIndex({
    logs,
    filters,
    availableActions,
    kpi,
    telegramConfig,
}: ActivityLogsProps) {
    const [activeTab, setActiveTab] = useState<'logs' | 'telegram'>('logs');

    // Search and filter state
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedAction, setSelectedAction] = useState(filters.action || 'all');
    const [selectedLogForDetail, setSelectedLogForDetail] = useState<LogItem | null>(null);

    // Telegram Settings Form
    const {
        data: tgData,
        setData: setTgData,
        post: postTg,
        processing: tgProcessing,
        errors: tgErrors,
    } = useForm({
        bot_token: telegramConfig.bot_token || '',
        chat_id: telegramConfig.chat_id || '',
        notifications_enabled: telegramConfig.notifications_enabled,
    });

    const [showBotToken, setShowBotToken] = useState(false);
    const [testProcessing, setTestProcessing] = useState(false);

    // Submit Telegram Settings
    const handleSaveTelegram: FormEventHandler = (e) => {
        e.preventDefault();

        postTg(route('settings.telegram.update'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Pengaturan Telegram berhasil disimpan ke database!');
            },
            onError: () => {
                toast.error('Gagal menyimpan pengaturan Telegram. Periksa format input.');
            },
        });
    };

    // Test Telegram Connection
    const handleTestConnection = () => {
        if (!tgData.bot_token) {
            toast.error('Harap masukkan Bot Token Telegram sebelum melakukan tes koneksi.');
            return;
        }

        if (!tgData.chat_id) {
            toast.error('Harap masukkan Chat ID Telegram sebelum melakukan tes koneksi.');
            return;
        }

        setTestProcessing(true);

        router.post(
            route('settings.telegram.test'),
            {
                bot_token: tgData.bot_token,
                chat_id: tgData.chat_id,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setTestProcessing(false);
                    toast.success('Tes koneksi Telegram berhasil! Pesan uji coba terkirim.');
                },
                onError: (errors: any) => {
                    setTestProcessing(false);
                    toast.error(errors.error || 'Gagal terhubung ke bot Telegram.');
                },
                onFinish: () => {
                    setTestProcessing(false);
                },
            }
        );
    };

    // Filter Logs
    const handleFilterApply = () => {
        router.get(
            route('settings.activity-logs.index'),
            {
                search: searchQuery,
                action: selectedAction,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setSelectedAction('all');
        router.get(
            route('settings.activity-logs.index'),
            {},
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const isConnected = !!(telegramConfig.bot_token && telegramConfig.chat_id);

    return (
        <AuthenticatedLayout>
            <Head title="Activity Logs & Telegram - CASANUMA CRM" />

            <div className="space-y-6 transition-all duration-300">
                {/* 1. Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                                <Activity className="size-5" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-heading">
                                    Activity Logs & Integrasi Telegram
                                </h1>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                    Audit trail riwayat aktivitas pengguna dan konfigurasi notifikasi bot Telegram otomatis.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs Switcher */}
                    <div className="flex items-center gap-1.5 p-1 rounded-xl border border-border bg-muted/30 shrink-0">
                        <button
                            type="button"
                            onClick={() => setActiveTab('logs')}
                            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                activeTab === 'logs'
                                    ? 'bg-background text-foreground shadow-xs'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Clock className="size-3.5" />
                            <span>Activity Logs ({logs.total})</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('telegram')}
                            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                activeTab === 'telegram'
                                    ? 'bg-background text-foreground shadow-xs'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Bot className="size-3.5 text-sky-500" />
                            <span>Integrasi Telegram</span>
                            {isConnected && (
                                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                            )}
                        </button>
                    </div>
                </div>

                {/* 2. Top Summary KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <Card className="border-border/80 shadow-2xs">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <Activity className="size-5" />
                            </div>
                            <div>
                                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Total Log Sistem</p>
                                <p className="text-xl font-bold text-foreground font-heading">{kpi.total_logs}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/80 shadow-2xs">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                <Clock className="size-5" />
                            </div>
                            <div>
                                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Aktivitas Hari Ini</p>
                                <p className="text-xl font-bold text-foreground font-heading">{kpi.today_logs}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/80 shadow-2xs">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                <Users className="size-5" />
                            </div>
                            <div>
                                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Staf Aktif Hari Ini</p>
                                <p className="text-xl font-bold text-foreground font-heading">{kpi.active_users_today}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/80 shadow-2xs">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                                isConnected ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                            }`}>
                                <Bot className="size-5" />
                            </div>
                            <div>
                                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Bot Telegram</p>
                                <p className="text-sm font-bold text-foreground font-heading">
                                    {isConnected ? (
                                        <span className="text-emerald-600 dark:text-emerald-400">Terkonfigurasi</span>
                                    ) : (
                                        <span className="text-amber-600 dark:text-amber-400">Belum Disetting</span>
                                    )}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 3. TAB 1: ACTIVITY LOGS AUDIT TRAIL */}
                {activeTab === 'logs' && (
                    <div className="space-y-4 animate-in fade-in-50 duration-200">
                        {/* Filter & Search Toolbar */}
                        <Card className="border-border/80 shadow-xs">
                            <CardContent className="p-4">
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleFilterApply();
                                    }}
                                    className="flex flex-col sm:flex-row items-center gap-3"
                                >
                                    <div className="relative flex-1 w-full">
                                        <Search className="size-4 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
                                        <Input
                                            type="text"
                                            placeholder="Cari aksi, deskripsi, nama user, atau IP address..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-9 h-9 text-xs"
                                        />
                                        {searchQuery && (
                                            <button
                                                type="button"
                                                onClick={() => setSearchQuery('')}
                                                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                                            >
                                                <X className="size-3.5" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <Select
                                            value={selectedAction}
                                            onValueChange={(val) => setSelectedAction(val)}
                                        >
                                            <SelectTrigger className="w-full sm:w-[190px] h-9 text-xs bg-background">
                                                <SelectValue placeholder="Kategori Aksi" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Semua Kategori Aksi</SelectItem>
                                                {availableActions.map((actionKey) => (
                                                    <SelectItem key={actionKey} value={actionKey}>
                                                        {actionBadges[actionKey]?.label || actionKey}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Button type="submit" size="sm" className="h-9 px-3 text-xs gap-1.5">
                                            <Search className="size-3.5" />
                                            <span>Filter</span>
                                        </Button>

                                        {(searchQuery || selectedAction !== 'all') && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleResetFilters}
                                                className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1"
                                                title="Reset filter"
                                            >
                                                <RotateCcw className="size-3.5" />
                                                <span>Reset</span>
                                            </Button>
                                        )}
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Activity Logs Table */}
                        <Card className="border-border/80 shadow-md overflow-hidden">
                            <CardHeader className="p-5 pb-3 border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-base font-semibold">
                                        Rekam Jejak Operasional Sistem (Audit Trail)
                                    </CardTitle>
                                    <CardDescription className="text-xs text-muted-foreground">
                                        Menampilkan {logs.data.length} dari {logs.total} total log aktivitas tercatat
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                                    <ShieldCheck className="size-4 text-primary" />
                                    <span>Hak Akses: Superadmin</span>
                                </div>
                            </CardHeader>

                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader className="bg-muted/30">
                                        <TableRow>
                                            <TableHead className="w-[200px]">Pengguna / Aktor</TableHead>
                                            <TableHead className="w-[140px]">Kategori Aksi</TableHead>
                                            <TableHead>Deskripsi Aktivitas</TableHead>
                                            <TableHead className="hidden md:table-cell w-[140px]">IP & Perangkat</TableHead>
                                            <TableHead className="w-[170px]">Waktu Eksekusi</TableHead>
                                            <TableHead className="text-right w-[80px]">Data</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {logs.data.length > 0 ? (
                                            logs.data.map((log) => {
                                                const badgeInfo = actionBadges[log.action] || {
                                                    label: log.action,
                                                    color: 'border-border bg-muted text-muted-foreground',
                                                };

                                                return (
                                                    <TableRow key={log.id} className="hover:bg-muted/30">
                                                        <TableCell className="font-medium">
                                                            {log.user ? (
                                                                <div className="flex items-center gap-2.5">
                                                                    {log.user.avatar_url ? (
                                                                        <img
                                                                            src={log.user.avatar_url}
                                                                            alt={log.user.name}
                                                                            className="size-7 rounded-full object-cover border border-border"
                                                                        />
                                                                    ) : (
                                                                        <div className="size-7 rounded-full bg-primary/10 text-primary font-bold text-[11px] flex items-center justify-center border border-primary/20">
                                                                            {log.user.name.charAt(0).toUpperCase()}
                                                                        </div>
                                                                    )}
                                                                    <div className="min-w-0 leading-tight">
                                                                        <p className="text-xs font-semibold text-foreground truncate">
                                                                            {log.user.name}
                                                                        </p>
                                                                        <p className="text-[10px] text-muted-foreground truncate">
                                                                            {log.user.email}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                    <Terminal className="size-4 text-muted-foreground" />
                                                                    <span>Sistem Otomatis</span>
                                                                </div>
                                                            )}
                                                        </TableCell>

                                                        <TableCell>
                                                            <Badge
                                                                variant="outline"
                                                                className={`text-[11px] font-medium ${badgeInfo.color}`}
                                                            >
                                                                {badgeInfo.label}
                                                            </Badge>
                                                        </TableCell>

                                                        <TableCell className="text-xs text-foreground/90">
                                                            <p className="line-clamp-2 leading-relaxed font-normal">
                                                                {log.description}
                                                            </p>
                                                        </TableCell>

                                                        <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                                                            <div className="space-y-0.5 font-mono text-[11px]">
                                                                <p>{log.ip_address || '127.0.0.1'}</p>
                                                            </div>
                                                        </TableCell>

                                                        <TableCell className="text-xs text-muted-foreground">
                                                            <div className="space-y-0.5">
                                                                <p className="font-semibold text-foreground text-[11px]">
                                                                    {log.created_at_human}
                                                                </p>
                                                                <p className="text-[10px] text-muted-foreground font-mono">
                                                                    {log.created_at_formatted}
                                                                </p>
                                                            </div>
                                                        </TableCell>

                                                        <TableCell className="text-right">
                                                            {log.properties ? (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => setSelectedLogForDetail(log)}
                                                                    className="size-7 p-0 text-primary hover:bg-primary/10"
                                                                    title="Lihat metadata JSON"
                                                                >
                                                                    <Info className="size-3.5" />
                                                                </Button>
                                                            ) : (
                                                                <span className="text-xs text-muted-foreground opacity-30">-</span>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                                    <div className="flex flex-col items-center justify-center gap-2">
                                                        <Activity className="size-8 text-muted-foreground/40" />
                                                        <p className="text-sm font-medium">Belum ada riwayat aktivitas yang sesuai filter.</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>

                                {/* Pagination Controls */}
                                {logs.last_page > 1 && (
                                    <div className="p-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                                        <span>
                                            Halaman {logs.current_page} dari {logs.last_page}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            {logs.links.map((link, idx) => (
                                                <Button
                                                    key={idx}
                                                    variant={link.active ? 'default' : 'outline'}
                                                    size="sm"
                                                    disabled={!link.url}
                                                    onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true })}
                                                    className="h-7 px-2.5 text-xs"
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* 4. TAB 2: INTEGRASI TELEGRAM BOT */}
                {activeTab === 'telegram' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in-50 duration-200">
                        {/* Form Card (2 Cols) */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="border-border/80 shadow-md">
                                <CardHeader className="p-5 pb-3 border-b border-border/50 bg-muted/10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="size-9 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold">
                                                <Bot className="size-5" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-base font-semibold">
                                                    Konfigurasi Kredensial Bot Telegram
                                                </CardTitle>
                                                <CardDescription className="text-xs text-muted-foreground">
                                                    Kredensial disimpan aman langsung di basis data PostgreSQL (`system_settings`).
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={
                                                isConnected
                                                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600'
                                                    : 'border-amber-500/30 bg-amber-500/10 text-amber-600'
                                            }
                                        >
                                            {isConnected ? 'Terkoneksi' : 'Belum Dikonfigurasi'}
                                        </Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-5 space-y-5">
                                    <form onSubmit={handleSaveTelegram} className="space-y-4">
                                        {/* Telegram Bot Token Input */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="bot-token" className="text-xs font-semibold">
                                                Telegram Bot Token <span className="text-destructive">*</span>
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="bot-token"
                                                    type={showBotToken ? 'text' : 'password'}
                                                    placeholder="Contoh: 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                                                    value={tgData.bot_token}
                                                    onChange={(e) => setTgData('bot_token', e.target.value)}
                                                    className="pr-10 text-xs font-mono"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowBotToken(!showBotToken)}
                                                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                                                >
                                                    {showBotToken ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                                </button>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground">
                                                Didapatkan saat membuat bot baru di Telegram via <span className="font-semibold text-foreground">@BotFather</span>.
                                            </p>
                                            {tgErrors.bot_token && (
                                                <p className="text-xs font-medium text-destructive">{tgErrors.bot_token}</p>
                                            )}
                                        </div>

                                        {/* Telegram Chat ID Input */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="chat-id" className="text-xs font-semibold">
                                                Target Chat ID / Group ID <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="chat-id"
                                                type="text"
                                                placeholder="Contoh: 123456789 (Pribadi) atau -1001234567890 (Grup)"
                                                value={tgData.chat_id}
                                                onChange={(e) => setTgData('chat_id', e.target.value)}
                                                className="text-xs font-mono"
                                                required
                                            />
                                            <p className="text-[11px] text-muted-foreground">
                                                ID akun Telegram Anda atau ID grup tempat bot diundang.
                                            </p>
                                            {tgErrors.chat_id && (
                                                <p className="text-xs font-medium text-destructive">{tgErrors.chat_id}</p>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleTestConnection}
                                                disabled={testProcessing || !tgData.bot_token || !tgData.chat_id}
                                                className="gap-2 text-xs border-sky-500/40 text-sky-600 hover:bg-sky-500/10 dark:text-sky-400"
                                            >
                                                {testProcessing ? (
                                                    <Loader2 className="size-3.5 animate-spin" />
                                                ) : (
                                                    <Send className="size-3.5" />
                                                )}
                                                <span>{testProcessing ? 'Menguji Koneksi...' : 'Test Connection'}</span>
                                            </Button>

                                            <Button
                                                type="submit"
                                                disabled={tgProcessing}
                                                className="gap-2 text-xs"
                                            >
                                                {tgProcessing ? (
                                                    <Loader2 className="size-3.5 animate-spin" />
                                                ) : (
                                                    <Check className="size-3.5" />
                                                )}
                                                <span>Simpan Pengaturan</span>
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Activity Notice */}
                            <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-4 text-xs text-foreground/80 space-y-2">
                                <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-semibold">
                                    <Sparkles className="size-4" />
                                    <span>Otomatisasi Notifikasi Masa Depan</span>
                                </div>
                                <p className="text-[11px] leading-relaxed text-muted-foreground">
                                    Setelah bot terhubung, CASANUMA CRM dapat secara otomatis mengirimkan pesan real-time ke grup Telegram Anda saat ada <strong>Leads Baru</strong>, <strong>Booking Fee Unit Masuk</strong>, atau <strong>Pencairan Komisi Disetujui</strong>.
                                </p>
                            </div>
                        </div>

                        {/* Setup Guide Card (1 Col) */}
                        <div className="space-y-4">
                            <Card className="border-border/80 shadow-sm bg-muted/20">
                                <CardHeader className="p-4 pb-2 border-b border-border/40">
                                    <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                        <HelpCircle className="size-4 text-primary" />
                                        <span>Panduan Buat Bot Telegram</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 text-xs space-y-4 leading-relaxed text-muted-foreground">
                                    <div className="space-y-1">
                                        <p className="font-semibold text-foreground">1. Buat Bot Baru:</p>
                                        <p className="text-[11px]">
                                            Buka aplikasi Telegram, cari akun resmi <code className="text-foreground font-mono font-semibold bg-background px-1 py-0.5 rounded border">@BotFather</code> dan kirim pesan <code className="text-foreground font-mono">/newbot</code>.
                                        </p>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="font-semibold text-foreground">2. Salin Bot Token:</p>
                                        <p className="text-[11px]">
                                            Setelah selesai, BotFather akan memberikan HTTP API Token seperti:
                                            <br />
                                            <code className="text-[10px] text-primary font-mono break-all bg-background px-1.5 py-1 rounded block mt-1 border">
                                                7123456789:AAF_example_token_casanuma
                                            </code>
                                        </p>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="font-semibold text-foreground">3. Dapatkan Chat ID:</p>
                                        <p className="text-[11px]">
                                            Kirim pesan ke bot <code className="text-foreground font-mono font-semibold bg-background px-1 py-0.5 rounded border">@userinfobot</code> untuk mengetahui Chat ID Anda, atau tambahkan bot ke grup dan gunakan bot ID finder.
                                        </p>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="font-semibold text-foreground">4. Uji Koneksi:</p>
                                        <p className="text-[11px]">
                                            Pastikan Anda sudah klik <strong>/start</strong> di bot Telegram Anda terlebih dahulu sebelum menekan tombol <strong>Test Connection</strong>.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Detail Metadata Log (shadcn Dialog) */}
            <Dialog open={!!selectedLogForDetail} onOpenChange={(open) => !open && setSelectedLogForDetail(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader className="gap-2">
                        <div className="flex items-center gap-2.5">
                            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                                <Terminal className="size-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-base font-bold">
                                    Detail Metadata Aktivitas
                                </DialogTitle>
                                <DialogDescription className="text-xs">
                                    ID Log: #{selectedLogForDetail?.id} • {selectedLogForDetail?.action}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-3 pt-2">
                        <div className="rounded-xl border border-border/80 bg-muted/20 p-3 text-xs space-y-1">
                            <p className="font-semibold text-foreground">Deskripsi:</p>
                            <p className="text-muted-foreground leading-relaxed">{selectedLogForDetail?.description}</p>
                        </div>

                        {selectedLogForDetail?.properties && (
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Payload Data (JSON):</Label>
                                <pre className="p-3 rounded-xl bg-muted/60 border border-border text-[11px] font-mono overflow-x-auto max-h-56 leading-normal text-foreground">
                                    {JSON.stringify(selectedLogForDetail.properties, null, 2)}
                                </pre>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2.5 rounded-lg border border-border/60 bg-card">
                                <span className="text-[10px] text-muted-foreground uppercase font-medium">IP Address</span>
                                <p className="font-mono text-xs font-semibold">{selectedLogForDetail?.ip_address || '-'}</p>
                            </div>
                            <div className="p-2.5 rounded-lg border border-border/60 bg-card">
                                <span className="text-[10px] text-muted-foreground uppercase font-medium">Waktu Eksekusi</span>
                                <p className="text-xs font-semibold">{selectedLogForDetail?.created_at_formatted}</p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setSelectedLogForDetail(null)}
                            className="w-full sm:w-auto text-xs"
                        >
                            Tutup
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
