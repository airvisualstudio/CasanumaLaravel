import { PropsWithChildren, useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/Components/ui/button';

export default function Guest({ children }: PropsWithChildren) {
    const [isDark, setIsDark] = useState(false);

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

            <div className="w-full max-w-md space-y-6 relative z-10">
                {/* Form Content Card */}
                <div className="w-full">
                    {children}
                </div>

                {/* Footer */}
                <div className="text-center space-y-1">
                    <p className="text-xs text-muted-foreground">
                        &copy; {new Date().getFullYear()} CASANUMA CRM. All rights reserved.
                    </p>
                    <p className="text-[11px] text-muted-foreground/60">
                        Sistem Informasi Manajemen Kavling & Penjualan Terpadu
                    </p>
                </div>
            </div>
        </div>
    );
}
