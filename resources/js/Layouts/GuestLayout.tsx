import { Link } from '@inertiajs/react';
import { PropsWithChildren, useState } from 'react';
import { Sparkles, Sun, Moon } from 'lucide-react';
import { Button } from '@/Components/ui/button';

export default function Guest({ children }: PropsWithChildren) {
    const [isDark, setIsDark] = useState(false);

    const toggleTheme = () => {
        setIsDark(!isDark);
        if (!isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-background text-foreground p-4 sm:p-6 transition-colors duration-200">
            {/* Dark mode toggle fixed top right */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle theme">
                    {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
                </Button>
            </div>

            <div className="w-full max-w-md space-y-6">
                <div className="flex flex-col items-center space-y-2 text-center">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="size-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold border border-primary/20 group-hover:scale-105 transition-transform">
                            <Sparkles className="size-5" />
                        </div>
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">Selamat Datang</h1>
                    <p className="text-xs text-muted-foreground">
                        Silakan login ke akun Anda untuk melanjutkan
                    </p>
                </div>

                <div className="w-full">
                    {children}
                </div>

                <p className="text-center text-xs text-muted-foreground">
                    &copy; {new Date().getFullYear()} Laravel + Breeze + Shadcn UI
                </p>
            </div>
        </div>
    );
}
