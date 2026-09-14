import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';
import { Button } from '@/Components/ui/button';
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
    Sparkles, 
    Sun, 
    Moon, 
    User as UserIcon, 
    LogOut, 
    LayoutDashboard, 
    Menu, 
    X,
    ChevronDown,
    FlaskConical
} from 'lucide-react';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;
    const [isDark, setIsDark] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleTheme = () => {
        setIsDark(!isDark);
        if (!isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const isCurrent = (name: string) => {
        try {
            return route().current(name);
        } catch {
            return false;
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
            {/* Top Navbar */}
            <nav className="border-b border-border/60 bg-card/70 backdrop-blur-md sticky top-0 z-40">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        {/* Logo & Desktop Nav */}
                        <div className="flex items-center gap-8">
                            <Link href="/" className="flex items-center gap-2 group">
                                <div className="size-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold border border-primary/20 group-hover:scale-105 transition-transform">
                                    <Sparkles className="size-4.5" />
                                </div>
                                <span className="font-bold text-sm tracking-tight hidden sm:inline-block">
                                    NamaProjek
                                </span>
                            </Link>

                            <div className="hidden sm:flex sm:items-center sm:gap-1">
                                <Link href={route('dashboard')}>
                                    <Button
                                        variant={isCurrent('dashboard') ? 'secondary' : 'ghost'}
                                        size="sm"
                                        className="gap-2 font-medium"
                                    >
                                        <LayoutDashboard className="size-4" />
                                        Dashboard
                                    </Button>
                                </Link>
                                <Link href="/dashboard-test">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="gap-2 font-medium text-muted-foreground hover:text-foreground"
                                    >
                                        <FlaskConical className="size-4" />
                                        Shadcn Test
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Right side actions */}
                        <div className="hidden sm:flex sm:items-center sm:gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleTheme}
                                title="Toggle Theme"
                            >
                                {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
                            </Button>

                            {/* User Profile Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-2.5">
                                        <div className="size-6 rounded-full bg-primary/15 text-primary font-bold text-xs flex items-center justify-center">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="max-w-[120px] truncate text-xs font-medium">
                                            {user.name}
                                        </span>
                                        <ChevronDown className="size-3.5 text-muted-foreground" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end">
                                    <DropdownMenuLabel>
                                        <div className="flex flex-col space-y-0.5">
                                            <p className="text-xs font-semibold text-foreground">{user.name}</p>
                                            <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <Link href={route('profile.edit')}>
                                            <DropdownMenuItem>
                                                <UserIcon className="size-4" />
                                                <span>Profil Akun</span>
                                            </DropdownMenuItem>
                                        </Link>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator />
                                    <Link href={route('logout')} method="post" as="button" className="w-full">
                                        <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive w-full cursor-pointer">
                                            <LogOut className="size-4" />
                                            <span>Keluar (Logout)</span>
                                        </DropdownMenuItem>
                                    </Link>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Mobile menu button */}
                        <div className="flex items-center gap-2 sm:hidden">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleTheme}
                            >
                                {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {mobileMenuOpen && (
                    <div className="sm:hidden border-t border-border p-4 space-y-3 bg-card">
                        <div className="space-y-1">
                            <Link href={route('dashboard')} className="block">
                                <Button variant={isCurrent('dashboard') ? 'secondary' : 'ghost'} className="w-full justify-start gap-2">
                                    <LayoutDashboard className="size-4" />
                                    Dashboard
                                </Button>
                            </Link>
                            <Link href="/dashboard-test" className="block">
                                <Button variant="ghost" className="w-full justify-start gap-2">
                                    <FlaskConical className="size-4" />
                                    Shadcn Test
                                </Button>
                            </Link>
                            <Link href={route('profile.edit')} className="block">
                                <Button variant="ghost" className="w-full justify-start gap-2">
                                    <UserIcon className="size-4" />
                                    Profil
                                </Button>
                            </Link>
                        </div>
                        <div className="pt-2 border-t border-border">
                            <Link href={route('logout')} method="post" as="button" className="w-full">
                                <Button variant="destructive" className="w-full justify-start gap-2">
                                    <LogOut className="size-4" />
                                    Keluar
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* Header section */}
            {header && (
                <header className="border-b border-border/40 bg-card/40">
                    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            {/* Main view container */}
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}
