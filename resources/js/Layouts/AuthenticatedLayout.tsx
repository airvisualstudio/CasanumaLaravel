import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useEffect, useState } from 'react';
import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { 
    Building2,
    Sun, 
    Moon, 
    User as UserIcon, 
    LogOut, 
    LayoutDashboard, 
    Menu, 
    X,
    ChevronDown,
    Home,
    Users,
    CreditCard,
    Shield,
    Wallet,
    CheckCircle2,
    Settings,
    UserCog,
    KeyRound,
    Building,
    FileSpreadsheet,
    UserPlus,
    CalendarCheck,
    Layers,
    ChevronRight,
    Sparkles,
    Database,
    LucideIcon,
    PanelLeftClose,
    PanelLeftOpen
} from 'lucide-react';
import { useAuthorization } from '@/hooks/useAuthorization';
import { Toaster, toast } from '@/Components/ui/sonner';

interface AuthenticatedLayoutProps {
    header?: ReactNode;
}

interface NavItem {
    label: string;
    icon: LucideIcon;
    href?: string;
    active?: boolean;
    action?: () => void;
    visible: boolean;
}

interface NavGroup {
    groupName: string;
    visible: boolean;
    items: NavItem[];
}

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<AuthenticatedLayoutProps>) {
    const { user, can, isSuperAdmin } = useAuthorization();
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
    const [isDark, setIsDark] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDark(false);
            document.documentElement.classList.remove('dark');
        }

        const savedCollapsed = localStorage.getItem('casanuma_sidebar_collapsed');
        if (savedCollapsed === 'true') {
            setCollapsed(true);
        }
    }, []);

    const toggleTheme = () => {
        const nextState = !isDark;
        setIsDark(nextState);
        if (nextState) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    const toggleCollapsed = () => {
        const nextState = !collapsed;
        setCollapsed(nextState);
        localStorage.setItem('casanuma_sidebar_collapsed', String(nextState));
    };

    const isCurrent = (name: string) => {
        try {
            return route().current(name);
        } catch {
            return false;
        }
    };

    const roleConfig: Record<string, { label: string; color: string; badge: string }> = {
        superadmin: {
            label: 'Super Admin',
            color: 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/30',
            badge: 'bg-purple-600 text-white'
        },
        sales_manager: {
            label: 'Sales Manager',
            color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/30',
            badge: 'bg-blue-600 text-white'
        },
        sales_agent: {
            label: 'Sales Agent',
            color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
            badge: 'bg-emerald-600 text-white'
        },
        finance: {
            label: 'Finance Staff',
            color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30',
            badge: 'bg-amber-600 text-white'
        },
    };

    const primaryRole = user?.roles?.[0] || 'sales_agent';
    const currentRoleInfo = roleConfig[primaryRole] || {
        label: primaryRole,
        color: 'text-primary bg-primary/10 border-primary/25',
        badge: 'bg-primary text-primary-foreground'
    };

    const [pendingMenu, setPendingMenu] = useState<string | null>(null);

    const handleMenuClick = (menuName: string) => {
        setPendingMenu(menuName);
    };

    // Navigation groups definition
    const navGroups: NavGroup[] = [
        {
            groupName: 'Utama',
            visible: true,
            items: [
                {
                    label: 'Dashboard',
                    icon: LayoutDashboard,
                    href: route('dashboard'),
                    active: isCurrent('dashboard'),
                    visible: true,
                },
            ],
        },
        {
            groupName: 'Kavling & Properti',
            visible: can('view-units'),
            items: [
                {
                    label: 'Unit & Kavling',
                    icon: Home,
                    action: () => handleMenuClick('Unit & Kavling'),
                    visible: can('view-units'),
                },
                {
                    label: 'Cluster & Site Plan',
                    icon: Building,
                    action: () => handleMenuClick('Cluster & Site Plan'),
                    visible: can('create-units') || can('edit-units'),
                },
            ],
        },
        {
            groupName: 'Penjualan & Leads',
            visible: can('view-leads') || can('view-bookings'),
            items: [
                {
                    label: 'Pipeline Leads CRM',
                    icon: Users,
                    action: () => handleMenuClick('Pipeline Leads CRM'),
                    visible: can('view-leads'),
                },
                {
                    label: 'Follow Up & Aktivitas',
                    icon: CalendarCheck,
                    action: () => handleMenuClick('Follow Up & Aktivitas'),
                    visible: can('view-leads'),
                },
                {
                    label: 'Distribusi Leads',
                    icon: UserPlus,
                    action: () => handleMenuClick('Distribusi Leads'),
                    visible: can('assign-leads'),
                },
                {
                    label: 'Booking Fee & SPR',
                    icon: CreditCard,
                    action: () => handleMenuClick('Booking Fee & SPR'),
                    visible: can('view-bookings'),
                },
            ],
        },
        {
            groupName: 'Keuangan & Kas',
            visible: can('view-finance'),
            items: [
                {
                    label: 'Verifikasi Pembayaran',
                    icon: CheckCircle2,
                    action: () => handleMenuClick('Verifikasi Pembayaran'),
                    visible: can('verify-payments'),
                },
                {
                    label: 'Pemberkasan KPR Bank',
                    icon: FileSpreadsheet,
                    action: () => handleMenuClick('Pemberkasan KPR Bank'),
                    visible: can('view-finance'),
                },
                {
                    label: 'Laporan Arus Kas',
                    icon: Wallet,
                    action: () => handleMenuClick('Laporan Arus Kas'),
                    visible: can('view-financial-summary'),
                },
            ],
        },
        {
            groupName: 'Administrasi & Sistem',
            visible: isSuperAdmin || can('manage-users'),
            items: [
                {
                    label: 'Manajemen Pengguna',
                    icon: UserCog,
                    href: route('users.index'),
                    active: isCurrent('users.*'),
                    visible: can('manage-users'),
                },
                {
                    label: 'Hak Akses Role (Spatie)',
                    icon: KeyRound,
                    action: () => handleMenuClick('Hak Akses Role'),
                    visible: can('manage-roles'),
                },
                {
                    label: 'Pengaturan Sistem',
                    icon: Settings,
                    action: () => handleMenuClick('Pengaturan Sistem'),
                    visible: can('manage-settings'),
                },
            ],
        },
    ];

    // Filter out groups that have no visible items
    const visibleNavGroups = navGroups.filter(
        (group) => group.visible && group.items.some((item) => item.visible)
    );

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row transition-colors duration-200">
            {/* Mobile Sidebar Backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-background/80 backdrop-blur-xs lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* SIDEBAR (Desktop Sticky Full-Height & Collapsible to Icon-Only) */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 h-screen max-h-screen border-r border-border/70 bg-card flex flex-col transition-all duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:max-h-screen lg:shrink-0 lg:translate-x-0 ${
                    collapsed ? 'lg:w-[72px]' : 'lg:w-64'
                } ${
                    sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
                }`}
            >
                {/* Brand Header - Pinned at top */}
                {/* Brand Header - Pinned at top */}
                <div className={`h-16 border-b border-border/60 flex items-center shrink-0 transition-all duration-300 ${
                    collapsed ? 'justify-center px-0' : 'justify-between px-5'
                }`}>
                    {!collapsed ? (
                        <>
                            <Link href={route('dashboard')} className="flex items-center gap-2.5 group overflow-hidden">
                                <div className="size-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center font-bold shadow-md shadow-primary/20 border border-primary/30 group-hover:scale-105 transition-transform shrink-0">
                                    <Building2 className="size-5" />
                                </div>
                                <div className="flex flex-col truncate">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-extrabold text-sm tracking-tight font-heading">
                                            CASANUMA
                                        </span>
                                        <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider rounded bg-primary/15 text-primary border border-primary/25">
                                            CRM
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground leading-tight truncate">
                                        Database Perumahan
                                    </span>
                                </div>
                            </Link>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="lg:hidden size-8"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <X className="size-4" />
                            </Button>
                        </>
                    ) : (
                        <Link href={route('dashboard')} title="CASANUMA CRM - Dashboard" className="flex items-center justify-center">
                            <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center font-bold shadow-md shadow-primary/20 border border-primary/30 hover:scale-105 transition-transform">
                                <Building2 className="size-5" />
                            </div>
                        </Link>
                    )}
                </div>

                {/* Role Badge Banner in Sidebar - Pinned below header */}
                {!collapsed ? (
                    <div className="p-3 mx-3 my-2 rounded-xl border border-border/60 bg-muted/40 shrink-0 transition-all">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <Shield className="size-3.5 text-primary" />
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                    Role Aktif:
                                </span>
                            </div>
                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${currentRoleInfo.color}`}>
                                {currentRoleInfo.label}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="my-2.5 flex justify-center items-center shrink-0 w-full" title={`Role Aktif: ${currentRoleInfo.label}`}>
                        <div className={`size-10 rounded-xl flex items-center justify-center border shadow-2xs ${currentRoleInfo.color}`}>
                            <Shield className="size-5" />
                        </div>
                    </div>
                )}

                {/* Dynamic Navigation Menus - Independently Scrollable ("Bisa di-roll") */}
                <div className={`flex-1 min-h-0 overflow-y-auto overscroll-contain py-2 space-y-3 ${
                    collapsed 
                        ? 'px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden' 
                        : 'px-3 custom-scrollbar'
                }`}>
                    {visibleNavGroups.map((group, groupIdx) => {
                        const visibleItems = group.items.filter((item) => item.visible);
                        if (visibleItems.length === 0) return null;

                        return (
                            <div key={groupIdx} className="space-y-1">
                                {!collapsed ? (
                                    <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                                        {group.groupName}
                                    </p>
                                ) : (
                                    <div className="my-2 border-t border-border/60 mx-4" title={group.groupName} />
                                )}
                                <div className="space-y-1">
                                    {visibleItems.map((item, itemIdx) => {
                                        const Icon = item.icon;
                                        const isItemActive = 'active' in item && item.active;

                                        if (item.href) {
                                            return (
                                                <Link
                                                    key={itemIdx}
                                                    href={item.href}
                                                    onClick={() => setSidebarOpen(false)}
                                                    title={collapsed ? item.label : undefined}
                                                    className={`flex items-center rounded-xl text-xs font-medium transition-all ${
                                                        collapsed 
                                                            ? 'justify-center size-10 mx-auto' 
                                                            : 'w-full gap-3 px-3 py-2'
                                                    } ${
                                                        isItemActive
                                                            ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                                                            : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                                                    }`}
                                                >
                                                    <Icon className="size-4.5 shrink-0" />
                                                    {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                                                </Link>
                                            );
                                        }

                                        return (
                                            <button
                                                key={itemIdx}
                                                type="button"
                                                onClick={() => {
                                                    setSidebarOpen(false);
                                                    item.action?.();
                                                }}
                                                title={collapsed ? item.label : undefined}
                                                className={`flex items-center rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-all ${
                                                    collapsed 
                                                        ? 'justify-center size-10 mx-auto' 
                                                        : 'w-full gap-3 px-3 py-2 text-left'
                                                }`}
                                            >
                                                <Icon className="size-4.5 shrink-0" />
                                                {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Sidebar Footer (User Account & Theme Toggle) - Pinned at bottom */}
                <div className={`border-t border-border/60 bg-muted/20 shrink-0 mt-auto ${
                    collapsed ? 'p-2 flex flex-col items-center gap-2' : 'p-3 space-y-2'
                }`}>
                    {!collapsed ? (
                        <>
                            <div className="flex items-center justify-between px-2">
                                <Link 
                                    href={route('profile.edit')}
                                    className="flex items-center gap-2 truncate group hover:opacity-85 transition-opacity"
                                    title="Buka Pengaturan Profil & Password"
                                >
                                    {user?.avatar_url ? (
                                        <img
                                            src={user.avatar_url}
                                            alt={user.name}
                                            className="size-7 rounded-full object-cover border border-primary/30 shrink-0"
                                        />
                                    ) : (
                                        <div className="size-7 rounded-full bg-primary/15 text-primary font-bold text-xs flex items-center justify-center border border-primary/20 shrink-0">
                                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                    <div className="truncate text-left">
                                        <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">{user?.name}</p>
                                        <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                                    </div>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
                                    onClick={toggleTheme}
                                    title={isDark ? 'Mode Terang' : 'Mode Gelap'}
                                >
                                    {isDark ? <Sun className="size-3.5 text-amber-400" /> : <Moon className="size-3.5" />}
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-1.5 pt-1">
                                <Link href={route('profile.edit')} className="w-full">
                                    <Button variant="ghost" size="sm" className="w-full justify-center gap-1.5 text-[11px] h-7 px-2 text-muted-foreground hover:text-foreground">
                                        <Settings className="size-3" />
                                        <span>Settings</span>
                                    </Button>
                                </Link>
                                <Link href={route('logout')} method="post" as="button" className="w-full">
                                    <Button variant="ghost" size="sm" className="w-full justify-center gap-1.5 text-[11px] h-7 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive">
                                        <LogOut className="size-3" />
                                        <span>Keluar</span>
                                    </Button>
                                </Link>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link
                                href={route('profile.edit')}
                                title={`Profil: ${user?.name} (Buka Pengaturan)`}
                                className="hover:scale-105 transition-transform"
                            >
                                {user?.avatar_url ? (
                                    <img
                                        src={user.avatar_url}
                                        alt={user.name}
                                        className="size-8 rounded-full object-cover border border-primary/30"
                                    />
                                ) : (
                                    <div 
                                        className="size-8 rounded-full bg-primary/15 text-primary font-bold text-xs flex items-center justify-center border border-primary/20"
                                    >
                                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                )}
                            </Link>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-muted-foreground hover:text-foreground"
                                onClick={toggleTheme}
                                title={isDark ? 'Mode Terang' : 'Mode Gelap'}
                            >
                                {isDark ? <Sun className="size-3.5 text-amber-400" /> : <Moon className="size-3.5" />}
                            </Button>
                            <Link href={route('logout')} method="post" as="button" title="Keluar (Logout)">
                                <Button variant="ghost" size="icon" className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive">
                                    <LogOut className="size-4" />
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Navbar */}
                <header className="h-16 border-b border-border/60 bg-card/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
                    {/* Left: Mobile Toggle, Desktop Collapse Toggle & Page Title */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Mobile Drawer Toggle */}
                        <Button
                            variant="outline"
                            size="icon"
                            className="lg:hidden size-9"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="size-5" />
                        </Button>

                        {/* Desktop Sidebar Collapse Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hidden lg:flex size-9 text-muted-foreground hover:text-foreground hover:bg-muted"
                            onClick={toggleCollapsed}
                            title={collapsed ? "Perluas Sidebar" : "Minimize Sidebar (Icon Only)"}
                        >
                            {collapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
                        </Button>

                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground font-heading">
                                CASANUMA Portal
                            </span>
                            <span className="text-muted-foreground text-xs hidden sm:inline">/</span>
                            <span className="text-xs text-muted-foreground hidden sm:inline">
                                Multi-Role CRM
                            </span>
                        </div>
                    </div>

                    {/* Right: PostgreSQL Status Badge & User Dropdown */}
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                            <Database className="size-3" />
                            <span>PostgreSQL Connected</span>
                        </div>

                        {/* User Profile Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2 pl-2 pr-2.5 py-1.5 h-auto">
                                    {user?.avatar_url ? (
                                        <img
                                            src={user.avatar_url}
                                            alt={user.name}
                                            className="size-6 rounded-full object-cover border border-primary/30 shrink-0"
                                        />
                                    ) : (
                                        <div className="size-6 rounded-full bg-primary/15 text-primary font-bold text-[11px] flex items-center justify-center border border-primary/20 shrink-0">
                                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                    <div className="hidden sm:flex flex-col items-start text-left">
                                        <span className="max-w-[100px] truncate text-xs font-semibold leading-tight">
                                            {user?.name || 'User'}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground font-medium leading-tight">
                                            {currentRoleInfo.label}
                                        </span>
                                    </div>
                                    <ChevronDown className="size-3 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-60" align="end">
                                <DropdownMenuLabel>
                                    <div className="flex flex-col space-y-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-semibold text-foreground">{user?.name}</p>
                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${currentRoleInfo.color}`}>
                                                {currentRoleInfo.label}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <Link href={route('profile.edit')}>
                                        <DropdownMenuItem className="cursor-pointer gap-2">
                                            <Settings className="size-4 text-muted-foreground" />
                                            <span>Settings / Profil Akun</span>
                                        </DropdownMenuItem>
                                    </Link>
                                    <Link href={route('profile.edit') + '#password'}>
                                        <DropdownMenuItem className="cursor-pointer gap-2">
                                            <KeyRound className="size-4 text-amber-500" />
                                            <span>Ganti Password Sendiri</span>
                                        </DropdownMenuItem>
                                    </Link>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <Link href={route('logout')} method="post" as="button" className="w-full">
                                    <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive w-full cursor-pointer gap-2">
                                        <LogOut className="size-4" />
                                        <span>Keluar (Logout)</span>
                                    </DropdownMenuItem>
                                </Link>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Subheader if provided */}
                {header && (
                    <div className="border-b border-border/40 bg-card/40 px-4 py-4 sm:px-6 lg:px-8">
                        {header}
                    </div>
                )}

                {/* Main Content Area */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300">
                    <div className="w-full max-w-[1550px] mx-auto transition-all duration-300">
                        {children}
                    </div>
                </main>
            </div>

            {/* Standard shadcn Dialog for Menu Navigation */}
            <Dialog open={!!pendingMenu} onOpenChange={(open) => !open && setPendingMenu(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="gap-3">
                        <div className="flex items-center gap-3">
                            <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <Sparkles className="size-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-bold">
                                    Menu {pendingMenu}
                                </DialogTitle>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Navigasi & Arsitektur CRM
                                </p>
                            </div>
                        </div>
                        <DialogDescription className="text-xs sm:text-sm text-foreground/80 leading-relaxed pt-1">
                            Menu navigasi <strong className="text-foreground">"{pendingMenu}"</strong> telah terdaftar dalam arsitektur role Spatie dan siap dikembangkan lebih lanjut sesuai alur kerja operasional.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5 text-xs text-muted-foreground flex items-center justify-between">
                        <span>Aksesibilitas Role:</span>
                        <span className="font-semibold text-primary">{currentRoleInfo.label}</span>
                    </div>

                    <DialogFooter className="gap-2.5 sm:gap-3 pt-1">
                        <Button onClick={() => setPendingMenu(null)} className="w-full sm:w-auto font-medium">
                            Mengerti
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* shadcn Sonner Toast Notification Center */}
            <Toaster richColors position="top-right" closeButton />
        </div>
    );
}
