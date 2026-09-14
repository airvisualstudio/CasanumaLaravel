import { PropsWithChildren, useEffect, useState } from 'react';
import { Sun, Moon, Building2 } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

export default function Guest({ children }: PropsWithChildren) {
    const { app_settings } = usePage<PageProps>().props;
    const [isDark, setIsDark] = useState(false);

    const appName = app_settings?.app_name || 'CASANUMA CRM';
    const companyName = app_settings?.company_name || 'PT Casanuma Modern Living';
    const appDescription = app_settings?.app_description || 'Sistem Informasi Manajemen Kavling & Penjualan Terpadu';

    useEffect(() => {
        // Initialize theme from localStorage or system preference
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDark(false);
            document.documentElement.classList.remove('dark');
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

    const activeLogoUrl = isDark
        ? (app_settings?.logo_dark_url || app_settings?.logo_light_url)
        : (app_settings?.logo_light_url || app_settings?.logo_dark_url);

    return (
        <div className="relative min-h-screen flex flex-col justify-center items-center bg-background text-foreground p-4 sm:p-6 transition-colors duration-300 overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute -top-40 -left-40 size-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 size-96 rounded-full bg-accent/20 blur-3xl pointer-events-none" />

            {/* Dark Mode Toggle Button */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleTheme}
                    className="rounded-full shadow-xs backdrop-blur-sm"
                    title={isDark ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'}
                >
                    {isDark ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-slate-700" />}
                </Button>
            </div>

            <div className="w-full max-w-md space-y-5 relative z-10">
                {/* Brand Header Banner */}
                <div className="flex flex-col items-center justify-center text-center gap-2 mb-1">
                    {activeLogoUrl ? (
                        <img src={activeLogoUrl} alt={appName} className="h-12 w-auto max-w-[200px] object-contain drop-shadow-xs" />
                    ) : (
                        <div className="size-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center font-bold shadow-lg shadow-primary/25 border border-primary/30">
                            <Building2 className="size-6" />
                        </div>
                    )}
                    <h1 className="text-xl font-extrabold tracking-tight font-heading text-foreground">
                        {appName}
                    </h1>
                    <p className="text-xs text-muted-foreground font-medium max-w-xs">
                        {companyName}
                    </p>
                </div>

                {/* Form Content Card */}
                <div className="w-full">
                    {children}
                </div>

                {/* Footer */}
                <div className="text-center space-y-1">
                    <p className="text-xs text-muted-foreground">
                        &copy; {new Date().getFullYear()} {companyName || appName}. All rights reserved.
                    </p>
                    <p className="text-[11px] text-muted-foreground/60">
                        {appDescription}
                    </p>
                </div>
            </div>
        </div>
    );
}
