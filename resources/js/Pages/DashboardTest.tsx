import { Head, Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from '@/Components/ui/dropdown-menu';
import { useState } from 'react';
import { 
    CheckCircle2, 
    Sparkles, 
    ArrowLeft, 
    Zap, 
    Flame, 
    ShieldCheck, 
    Moon, 
    Sun,
    ExternalLink,
    User as UserIcon,
    Settings,
    CreditCard,
    LogOut,
    MoreHorizontal,
    Share2,
    Copy,
    Trash2,
    SlidersHorizontal,
    Mail,
    PlusCircle,
    ChevronDown
} from 'lucide-react';

interface DashboardTestProps {
    user: string;
    status: string;
}

export default function DashboardTest({ user, status }: DashboardTestProps) {
    const [count, setCount] = useState(0);
    const [isDark, setIsDark] = useState(false);

    // Dropdown Checkbox states
    const [showStatusBar, setShowStatusBar] = useState(true);
    const [showActivityBar, setShowActivityBar] = useState(false);
    const [showPanel, setShowPanel] = useState(true);

    // Dropdown Radio state
    const [position, setPosition] = useState('bottom');

    const toggleTheme = () => {
        setIsDark(!isDark);
        if (!isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
            <Head title="Dashboard Test - Shadcn UI & Dropdown" />

            {/* Top Navigation */}
            <header className="border-b border-border/60 bg-card/60 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold">
                            <Sparkles className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-base font-semibold tracking-tight">Laravel + Shadcn UI Test</h1>
                            <p className="text-xs text-muted-foreground">Radix UI + Tailwind v4 + Inertia</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle Dark Mode">
                            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
                        </Button>

                        {/* Top Nav User Dropdown Sample */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <div className="size-5 rounded-full bg-primary/20 text-primary font-bold text-[10px] flex items-center justify-center">
                                        {user.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-medium">{user}</span>
                                    <ChevronDown className="size-3.5 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem>
                                        <UserIcon />
                                        <span>Profil</span>
                                        <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <CreditCard />
                                        <span>Billing & Plan</span>
                                        <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Settings />
                                        <span>Pengaturan</span>
                                        <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                    <LogOut />
                                    <span>Log out</span>
                                    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Link href="/">
                            <Button variant="ghost" size="sm" className="gap-1.5">
                                <ArrowLeft className="size-3.5" />
                                Home
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
                {/* Status Hero Card */}
                <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 className="size-3.5" />
                                Environment Verified
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                                Halo, <span className="text-primary underline decoration-primary/30">{user}</span>! 👋
                            </h2>
                            <p className="text-muted-foreground text-sm max-w-xl">
                                Status: <span className="font-medium text-foreground">{status}</span>. 
                                Sistem sudah siap pakai Laravel + Vite + Tailwind v4 + Shadcn UI (Radix Dropdown & Button).
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2.5">
                            <Button onClick={() => setCount((c) => c + 1)} className="gap-2">
                                <Zap className="size-4" />
                                Test Counter: {count}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* SHADCN DROPDOWN SHOWCASE SECTION */}
                <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-4">
                        <div>
                            <h3 className="text-xl font-bold tracking-tight">🎯 Shadcn Dropdown Menu Samples</h3>
                            <p className="text-sm text-muted-foreground">
                                Menggunakan <code className="text-xs bg-muted px-1.5 py-0.5 rounded">@/Components/ui/dropdown-menu</code> berbasis Radix UI + Tailwind v4.
                            </p>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-md bg-muted text-muted-foreground font-medium self-start sm:self-auto">
                            Radix Luma Theme
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Sample 1: Action Menu with Submenu */}
                        <div className="p-5 rounded-xl border border-border/70 bg-muted/20 space-y-4 flex flex-col justify-between">
                            <div className="space-y-1.5">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sample 1</span>
                                <h4 className="text-base font-semibold">Action Menu + Submenu</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Menu aksi umum dengan shortcut, separator, submenu bertingkat, dan item destructive.
                                </p>
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between">
                                        <span>Kelola Konten</span>
                                        <MoreHorizontal className="size-4 text-muted-foreground" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56">
                                    <DropdownMenuLabel>Aksi Cepat</DropdownMenuLabel>
                                    <DropdownMenuItem>
                                        <Copy />
                                        <span>Duplikasi</span>
                                        <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
                                    </DropdownMenuItem>
                                    
                                    {/* Submenu example */}
                                    <DropdownMenuSub>
                                        <DropdownMenuSubTrigger>
                                            <Share2 />
                                            <span>Bagikan</span>
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuPortal>
                                            <DropdownMenuSubContent>
                                                <DropdownMenuItem>
                                                    <Mail />
                                                    <span>Kirim Email</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <PlusCircle />
                                                    <span>Salin Link Publik</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuSubContent>
                                        </DropdownMenuPortal>
                                    </DropdownMenuSub>

                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                        <Trash2 />
                                        <span>Hapus Item</span>
                                        <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Sample 2: Checkbox Filters */}
                        <div className="p-5 rounded-xl border border-border/70 bg-muted/20 space-y-4 flex flex-col justify-between">
                            <div className="space-y-1.5">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sample 2</span>
                                <h4 className="text-base font-semibold">Checkbox Toggles</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Multi-select checkbox untuk filter atau konfigurasi view interface.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="secondary" className="w-full justify-between">
                                            <span>Filter Tampilan</span>
                                            <SlidersHorizontal className="size-4 text-muted-foreground" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56">
                                        <DropdownMenuLabel>Opsi Visibilitas</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuCheckboxItem
                                            checked={showStatusBar}
                                            onCheckedChange={setShowStatusBar}
                                        >
                                            Status Bar
                                        </DropdownMenuCheckboxItem>
                                        <DropdownMenuCheckboxItem
                                            checked={showActivityBar}
                                            onCheckedChange={setShowActivityBar}
                                        >
                                            Activity Bar
                                        </DropdownMenuCheckboxItem>
                                        <DropdownMenuCheckboxItem
                                            checked={showPanel}
                                            onCheckedChange={setShowPanel}
                                        >
                                            Bottom Panel
                                        </DropdownMenuCheckboxItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <div className="text-[11px] text-muted-foreground flex gap-1.5 flex-wrap">
                                    <span>Aktif:</span>
                                    {showStatusBar && <span className="bg-primary/10 text-primary px-1.5 py-0.2 rounded font-medium">Status</span>}
                                    {showActivityBar && <span className="bg-primary/10 text-primary px-1.5 py-0.2 rounded font-medium">Activity</span>}
                                    {showPanel && <span className="bg-primary/10 text-primary px-1.5 py-0.2 rounded font-medium">Panel</span>}
                                </div>
                            </div>
                        </div>

                        {/* Sample 3: Radio Group */}
                        <div className="p-5 rounded-xl border border-border/70 bg-muted/20 space-y-4 flex flex-col justify-between">
                            <div className="space-y-1.5">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sample 3</span>
                                <h4 className="text-base font-semibold">Radio Selection</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Single-choice selection group untuk opsi seperti posisi, layout, atau sorting.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-full justify-between">
                                            <span className="capitalize">Posisi: {position}</span>
                                            <ChevronDown className="size-4 text-muted-foreground" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56">
                                        <DropdownMenuLabel>Pilih Posisi Panel</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
                                            <DropdownMenuRadioItem value="top">Top Header</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="bottom">Bottom Dock</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="right">Right Sidebar</DropdownMenuRadioItem>
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <p className="text-[11px] text-muted-foreground">
                                    Posisi terpilih saat ini: <strong className="text-foreground capitalize">{position}</strong>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shadcn Button Showcase */}
                <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold tracking-tight">Shadcn Button Variants</h3>
                        <p className="text-sm text-muted-foreground">
                            Varian tombol standar dari <code className="text-xs bg-muted px-1.5 py-0.5 rounded">@/Components/ui/button</code>.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">Default Variant</p>
                            <Button variant="default" className="w-full">
                                Default Button
                            </Button>
                        </div>

                        <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">Secondary Variant</p>
                            <Button variant="secondary" className="w-full">
                                Secondary Button
                            </Button>
                        </div>

                        <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">Outline Variant</p>
                            <Button variant="outline" className="w-full">
                                Outline Button
                            </Button>
                        </div>

                        <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">Destructive Variant</p>
                            <Button variant="destructive" className="w-full">
                                Destructive Button
                            </Button>
                        </div>

                        <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">Ghost Variant</p>
                            <Button variant="ghost" className="w-full">
                                Ghost Button
                            </Button>
                        </div>

                        <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">Link Variant</p>
                            <Button variant="link" className="w-full">
                                Link Button
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Button Sizes & Icon Showcase */}
                <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold tracking-tight">Button Sizes & Icons</h3>
                        <p className="text-sm text-muted-foreground">
                            Eksplorasi ukuran tombol (xs, sm, default, lg, icon).
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Button size="xs" variant="secondary">Size XS</Button>
                        <Button size="sm" variant="secondary">Size SM</Button>
                        <Button size="default">Size Default</Button>
                        <Button size="lg" className="gap-2">
                            <Flame className="size-4" />
                            Size LG with Icon
                        </Button>
                        <Button size="icon" variant="outline">
                            <ShieldCheck className="size-4" />
                        </Button>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link href="/login" className="block">
                        <div className="p-5 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors group">
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-sm">Laravel Breeze Auth (Login)</span>
                                <ExternalLink className="size-4 text-muted-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Coba halaman otentikasi bawaan Breeze.
                            </p>
                        </div>
                    </Link>

                    <Link href="/dashboard" className="block">
                        <div className="p-5 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors group">
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-sm">Main Dashboard (/dashboard)</span>
                                <ExternalLink className="size-4 text-muted-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Halaman dashboard utama yang dilindungi middleware auth.
                            </p>
                        </div>
                    </Link>
                </div>
            </main>
        </div>
    );
}
