import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { 
    Activity, 
    ArrowUpRight, 
    CheckCircle2, 
    Clock, 
    Layers, 
    ShieldCheck, 
    Sparkles, 
    Users, 
    Zap 
} from 'lucide-react';

export default function Dashboard() {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">
                            Dashboard Overview
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Pantau performa aplikasi dan status integrasi ekosistem Anda.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href="/dashboard-test">
                            <Button size="sm" variant="outline" className="gap-1.5">
                                <Sparkles className="size-4 text-primary" />
                                Buka Playground UI
                            </Button>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Welcome Alert Card */}
                <div className="rounded-xl border border-border bg-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                        <div className="size-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="size-5" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-base font-semibold">Anda Berhasil Masuk!</h3>
                            <p className="text-xs text-muted-foreground max-w-xl">
                                Halaman dashboard ini sudah dimigrasikan penuh menggunakan styling token 
                                Shadcn UI + Tailwind v4. Semua komponen responsif dan mendukung dark mode otomatis.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                            Sistem Online
                        </span>
                    </div>
                </div>

                {/* Metric Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground">
                                Total Pengguna
                            </CardTitle>
                            <Users className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight">1,248</div>
                            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 mt-1 font-medium">
                                <ArrowUpRight className="size-3" /> +12.5% dari bulan lalu
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground">
                                Kecepatan HMR
                            </CardTitle>
                            <Zap className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight">~380ms</div>
                            <p className="text-[11px] text-muted-foreground mt-1">
                                Didukung Vite 8 + Tailwind v4
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground">
                                Keamanan Auth
                            </CardTitle>
                            <ShieldCheck className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight">Sanctum</div>
                            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                                Session & CSRF Terverifikasi
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground">
                                Backend Response
                            </CardTitle>
                            <Activity className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight">0.14ms</div>
                            <p className="text-[11px] text-muted-foreground mt-1">
                                Laravel 13 + PHP 8.5
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Additional Detail Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Layers className="size-4 text-primary" />
                                Stack Teknologi Proyek
                            </CardTitle>
                            <CardDescription>
                                Ringkasan fondasi sistem yang aktif pada repositori ini.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-muted/20 text-xs">
                                <span className="font-medium">Laravel Framework</span>
                                <span className="text-muted-foreground font-mono">v13.31.0</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-muted/20 text-xs">
                                <span className="font-medium">Inertia.js + React</span>
                                <span className="text-muted-foreground font-mono">v2.0 (React 18)</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-muted/20 text-xs">
                                <span className="font-medium">Tailwind CSS</span>
                                <span className="text-muted-foreground font-mono">v4.3.3 (Vite Plugin)</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-muted/20 text-xs">
                                <span className="font-medium">Shadcn UI Preset</span>
                                <span className="text-muted-foreground font-mono">Radix Luma (OKLCH)</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Clock className="size-4 text-primary" />
                                Log Aktivitas Terakhir
                            </CardTitle>
                            <CardDescription>
                                Riwayat perubahan arsitektur dan perbaikan sistem.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-start gap-3 text-xs">
                                <span className="size-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                <div>
                                    <p className="font-medium">Rebuild Auth & Dashboard</p>
                                    <p className="text-muted-foreground text-[11px]">Memasang Card, Input, Label, dan Checkbox Shadcn.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 text-xs">
                                <span className="size-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                <div>
                                    <p className="font-medium">Perbaikan Ziggy @routes</p>
                                    <p className="text-muted-foreground text-[11px]">Menambahkan directive @routes di app.blade.php.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 text-xs">
                                <span className="size-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                <div>
                                    <p className="font-medium">Migrasi Penuh Tailwind v4</p>
                                    <p className="text-muted-foreground text-[11px]">Memakai @tailwindcss/vite dan OKLCH palette tokens.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
