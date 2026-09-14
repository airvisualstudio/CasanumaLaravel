import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { 
    Building2, 
    Users, 
    CreditCard, 
    CheckCircle2, 
    Shield, 
    ArrowRight,
    Home,
    Building,
    UserCog,
    KeyRound,
    Wallet,
    FileSpreadsheet,
    UserPlus,
    CalendarCheck,
    Sparkles,
    ShieldCheck,
    Settings
} from 'lucide-react';
import { useAuthorization } from '@/hooks/useAuthorization';

export default function Dashboard() {
    const { user, can, isSuperAdmin, isSalesManager, isSalesAgent, isFinance } = useAuthorization();

    const roleInfo = {
        superadmin: {
            title: 'Super Administrator',
            desc: 'Akses penuh ke seluruh konfigurasi sistem, database perumahan, pengelolaan role pengguna, dan analitik bisnis global.',
            themeColor: 'border-purple-500/30 bg-purple-500/5 text-purple-600 dark:text-purple-400',
            badgeBg: 'bg-purple-600 text-white',
        },
        sales_manager: {
            title: 'Sales Manager',
            desc: 'Supervisi pipeline penjualan, monitoring kinerja sales agent, distribusi alokasi leads baru, dan persetujuan pengajuan booking kavling.',
            themeColor: 'border-blue-500/30 bg-blue-500/5 text-blue-600 dark:text-blue-400',
            badgeBg: 'bg-blue-600 text-white',
        },
        sales_agent: {
            title: 'Sales Agent',
            desc: 'Pengelolaan prospek leads pribadi, update progres follow-up konsumen, cek ketersediaan kavling unit, dan pembuatan tanda jadi (booking fee).',
            themeColor: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400',
            badgeBg: 'bg-emerald-600 text-white',
        },
        finance: {
            title: 'Finance & KPR Staff',
            desc: 'Validasi bukti pembayaran booking & DP, penerbitan tanda terima SPR, pemantauan berkas KPR bank, dan rekonsiliasi arus kas perumahan.',
            themeColor: 'border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400',
            badgeBg: 'bg-amber-600 text-white',
        },
    };

    const primaryRole = user?.roles?.[0] || 'sales_agent';
    const activeRole = roleInfo[primaryRole as keyof typeof roleInfo] || roleInfo.sales_agent;

    const [selectedModule, setSelectedModule] = useState<{
        title: string;
        desc: string;
        action: string;
        actionText: string;
        icon: React.ElementType;
        iconColor: string;
    } | null>(null);

    const handleActionClick = (module: typeof moduleCards[0]) => {
        if ('href' in module && (module as any).href) {
            router.visit((module as any).href);
            return;
        }
        setSelectedModule(module);
    };

    // Full catalog of module cards corresponding to system capabilities
    const moduleCards = [
        {
            title: 'Unit & Kavling',
            desc: 'Pantau stok kavling, tipe rumah (LB/LT), dan ketersediaan unit per cluster.',
            icon: Home,
            iconColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
            actionText: 'Buka Modul Unit',
            visible: can('view-units'),
            action: 'Katalog Unit & Kavling',
            href: route('units.index'),
        },
        {
            title: 'Cluster & Site Plan',
            desc: 'Visual denah master cluster, status kavling, dan pembagian blok perumahan.',
            icon: Building,
            iconColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
            actionText: 'Buka Site Plan',
            visible: can('create-units') || can('edit-units'),
            action: 'Cluster & Site Plan',
            href: route('clusters.index'),
        },
        {
            title: 'Pipeline Leads CRM',
            desc: 'Catat data prospek baru, update status follow-up konsumen, dan jadwalkan survei.',
            icon: Users,
            iconColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
            actionText: 'Buka Pipeline Leads',
            visible: can('view-leads'),
            action: 'Pipeline Leads',
            href: route('leads.index'),
        },
        {
            title: 'Distribusi Leads Tim',
            desc: 'Alokasikan kontak calon pembeli yang masuk dari iklan digital ke sales agent aktif.',
            icon: UserPlus,
            iconColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
            actionText: 'Buka Distribusi',
            visible: can('assign-leads'),
            action: 'Distribusi Leads',
        },
        {
            title: 'Booking Fee & SPR',
            desc: 'Reservasi kavling, input bukti bayar tanda jadi, dan pembuatan form SPR konsumen.',
            icon: CreditCard,
            iconColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
            actionText: 'Buka Modul Booking',
            visible: can('view-bookings'),
            action: 'Booking & SPR',
            href: route('bookings.index'),
        },
        {
            title: 'Verifikasi Pembayaran',
            desc: 'Validasi bukti transfer booking & uang muka kavling sebelum status unit diubah ke akad.',
            icon: Wallet,
            iconColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
            actionText: 'Buka Verifikasi Kas',
            visible: can('verify-payments'),
            action: 'Verifikasi Pembayaran',
        },
        {
            title: 'Pemberkasan KPR Bank',
            desc: 'Monitor kelengkapan dokumen KPR konsumen, status BI Checking (SLIK), dan SP3K bank rekanan.',
            icon: FileSpreadsheet,
            iconColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
            actionText: 'Buka Berkas KPR',
            visible: can('view-finance'),
            action: 'Pemberkasan KPR Bank',
        },
        {
            title: 'Laporan Arus Kas',
            desc: 'Rekapitulasi total omzet booking, penerimaan kas uang muka, dan proyeksi pencairan KPR.',
            icon: CheckCircle2,
            iconColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
            actionText: 'Buka Laporan Kas',
            visible: can('view-financial-summary'),
            action: 'Laporan Arus Kas',
        },
        {
            title: 'Kelola Pengguna & Role',
            desc: 'Tambah akun karyawan baru, atur pembagian hak akses Spatie, dan monitor log sistem.',
            icon: UserCog,
            iconColor: 'bg-red-500/10 text-red-600 dark:text-red-400',
            actionText: 'Buka Manajemen User',
            visible: can('manage-users'),
            action: 'Manajemen Pengguna',
            href: route('users.index'),
        },
        {
            title: 'Pengaturan Sistem',
            desc: 'Konfigurasi parameter CRM, integrasi database, dan preferensi aplikasi perumahan.',
            icon: Settings,
            iconColor: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
            actionText: 'Buka Pengaturan',
            visible: isSuperAdmin,
            action: 'Pengaturan Sistem',
            href: route('settings.general.index'),
        },
    ];

    const visibleModules = moduleCards.filter((c) => c.visible);

    // Adaptive grid column sizing so cards fluidly fill the screen without leaving empty gaps
    const gridColsClass = 
        visibleModules.length === 1 
            ? 'grid-cols-1' 
            : visibleModules.length === 2 
            ? 'grid-cols-1 md:grid-cols-2' 
            : visibleModules.length === 3 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4';

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-heading">
                            Workspace CRM Terpadu
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Sistem Manajemen Unit Perumahan, Pipeline Leads, dan Transaksi Booking.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded-lg border ${activeRole.themeColor}`}>
                            {activeRole.title}
                        </span>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard - CASANUMA CRM" />

            <div className="space-y-6 transition-all duration-300">
                {/* 1. Welcome & Role Authority Banner (Fluid Width) */}
                <Card className="border-border/80 shadow-md backdrop-blur-xs overflow-hidden relative transition-all duration-300 py-0 gap-0">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
                    
                    <CardHeader className="p-6 pb-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                                <Sparkles className="size-4" />
                                <span>Selamat Datang Kembali</span>
                            </div>
                            <span className="text-[11px] text-muted-foreground font-medium">
                                Akun Terdaftar: <span className="text-foreground font-semibold">{user?.email}</span>
                            </span>
                        </div>
                        <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight mt-1">
                            Halo, {user?.name}! 👋
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm text-foreground/80 max-w-3xl mt-1">
                            {activeRole.desc}
                        </CardDescription>
                    </CardHeader>

                    <div className="border-t border-border/50 px-6 py-3.5 flex flex-wrap items-center gap-5 text-xs text-muted-foreground bg-muted/10">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="size-4 text-primary" />
                            <span>Role Terdaftar: <strong className="text-foreground font-medium">{user?.roles?.join(', ') || '-'}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="size-4 text-emerald-500" />
                            <span>Hak Akses: <strong className="text-foreground font-medium">{user?.permissions?.length || 0} Permissions Aktif</strong></span>
                        </div>
                    </div>
                </Card>

                {/* 2. Modul Akses Cepat Sesuai Role (Fluid Responsive Grid) */}
                <div className="transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                            Modul Kerja Anda ({visibleModules.length} Modul Aktif)
                        </h2>
                        <span className="text-xs text-muted-foreground">
                            Tampilan dinamis adaptif
                        </span>
                    </div>

                    <div className={`grid ${gridColsClass} gap-4.5 transition-all duration-300`}>
                        {visibleModules.map((module, idx) => {
                            const Icon = module.icon;

                            return (
                                <Card 
                                    key={idx} 
                                    className="hover:border-primary/50 transition-all duration-200 shadow-xs hover:shadow-md group cursor-pointer flex flex-col justify-between"
                                    onClick={() => handleActionClick(module)}
                                >
                                    <CardHeader className="p-5 pb-3">
                                        <div className={`size-11 rounded-xl ${module.iconColor} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shrink-0`}>
                                            <Icon className="size-5" />
                                        </div>
                                        <CardTitle className="text-base font-semibold leading-tight">
                                            {module.title}
                                        </CardTitle>
                                        <CardDescription className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                            {module.desc}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-5 pt-0 mt-auto">
                                        <div className="flex items-center text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform">
                                            <span>{module.actionText}</span>
                                            <ArrowRight className="size-3.5 ml-1.5" />
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* 3. Daftar Hak Akses Aktif (Permissions Badges) */}
                <Card className="border-border/70 shadow-xs transition-all duration-300">
                    <CardHeader className="p-4 pb-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <KeyRound className="size-4 text-primary" />
                                <CardTitle className="text-sm font-semibold">
                                    Daftar Permission Aktif untuk Akun Ini
                                </CardTitle>
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                                Dikelola via <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">spatie/laravel-permission</code>
                            </span>
                        </div>
                        <CardDescription className="text-xs">
                            Sidebar dan kartu modul secara otomatis menyesuaikan tampilan berdasarkan permissions berikut:
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                        <div className="flex flex-wrap gap-1.5">
                            {user?.permissions && user.permissions.length > 0 ? (
                                user.permissions.map((perm) => (
                                    <span
                                        key={perm}
                                        className="px-2 py-0.5 text-[11px] font-mono rounded-md bg-muted text-foreground border border-border/80"
                                    >
                                        ✓ {perm}
                                    </span>
                                ))
                            ) : isSuperAdmin ? (
                                <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                    ★ Super Administrator (Bypass all permissions - Akses Penuh)
                                </span>
                            ) : (
                                <span className="text-xs text-muted-foreground italic">
                                    Belum ada permission khusus yang terdaftar.
                                </span>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 4. Dialog Integrasi Modul (Standard shadcn Dialog) */}
                <Dialog open={!!selectedModule} onOpenChange={(open) => !open && setSelectedModule(null)}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader className="gap-3">
                            <div className="flex items-center gap-3">
                                {selectedModule && (
                                    <div className={`size-12 rounded-2xl ${selectedModule.iconColor} flex items-center justify-center shrink-0`}>
                                        <selectedModule.icon className="size-6" />
                                    </div>
                                )}
                                <div>
                                    <DialogTitle className="text-lg font-bold">
                                        {selectedModule?.title}
                                    </DialogTitle>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Integrasi Fitur & Arsitektur CRM
                                    </p>
                                </div>
                            </div>
                            <DialogDescription className="text-xs sm:text-sm text-foreground/80 leading-relaxed pt-1">
                                Aksi <strong className="text-foreground">"{selectedModule?.action}"</strong> siap dihubungkan ke formulir backend, alur otorisasi role <strong className="text-primary">{activeRole.title}</strong>, dan basis data PostgreSQL CASANUMA CRM.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5 text-xs text-muted-foreground space-y-2">
                            <div className="flex items-start justify-between gap-3">
                                <span className="shrink-0">Tujuan Modul:</span>
                                <span className="font-medium text-foreground text-right">{selectedModule?.desc}</span>
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-border/50">
                                <span>Status Komponen:</span>
                                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="size-3.5" />
                                    Siap Dihubungkan
                                </span>
                            </div>
                        </div>

                        <DialogFooter className="gap-2.5 sm:gap-3 pt-1">
                            <Button onClick={() => setSelectedModule(null)} className="w-full sm:w-auto font-medium">
                                Mengerti
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AuthenticatedLayout>
    );
}
