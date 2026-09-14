import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Checkbox } from '@/Components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, UserCheck } from 'lucide-react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword?: boolean;
}) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Masuk Portal - CASANUMA CRM" />

            <Card className="border-border/80 shadow-xl shadow-primary/5 backdrop-blur-xs">
                <CardHeader className="flex flex-col items-center text-center space-y-1.5 pb-4">
                    <CardTitle className="text-xl font-bold tracking-tight">Masuk ke Portal CRM</CardTitle>
                    <CardDescription className="text-xs sm:text-sm max-w-xs mx-auto">
                        Gunakan email & kata sandi terdaftar untuk mengakses data kavling dan leads
                    </CardDescription>
                </CardHeader>

                <form onSubmit={submit}>
                    <CardContent className="space-y-4">
                        {status && (
                            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                <UserCheck className="size-4 shrink-0" />
                                <span>{status}</span>
                            </div>
                        )}

                        {/* Email Input */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-semibold text-foreground/90">
                                Email Address
                            </Label>
                            <div className="relative">
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    placeholder="nama@casanuma.com"
                                    className="pl-9 pr-3 text-sm focus-visible:ring-primary/20"
                                    autoComplete="username"
                                    autoFocus
                                    aria-invalid={!!errors.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                <Mail className="size-4 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
                            </div>
                            {errors.email && (
                                <p className="text-xs font-medium text-destructive mt-1">{errors.email}</p>
                            )}
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-xs font-semibold text-foreground/90">
                                    Password
                                </Label>
                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-xs text-muted-foreground hover:text-primary transition-colors hover:underline"
                                    >
                                        Lupa password?
                                    </Link>
                                )}
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={data.password}
                                    placeholder="••••••••"
                                    className="pl-9 pr-10 text-sm focus-visible:ring-primary/20"
                                    autoComplete="current-password"
                                    aria-invalid={!!errors.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                <Lock className="size-4 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                                    title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                                >
                                    {showPassword ? (
                                        <EyeOff className="size-4" />
                                    ) : (
                                        <Eye className="size-4" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs font-medium text-destructive mt-1">{errors.password}</p>
                            )}
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center space-x-2 pt-1">
                            <Checkbox
                                id="remember"
                                checked={data.remember}
                                onCheckedChange={(checked) =>
                                    setData('remember', checked === true)
                                }
                            />
                            <Label
                                htmlFor="remember"
                                className="text-xs font-normal text-muted-foreground cursor-pointer select-none"
                            >
                                Ingat sesi login di perangkat ini
                            </Label>
                        </div>

                        {/* Quick Demo Accounts for Development */}
                        <div className="pt-3 border-t border-border/50">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider text-center mb-2">
                                ⚡ Quick Test Login:
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setData((prev) => ({
                                            ...prev,
                                            email: 'admin@casanuma.com',
                                            password: 'password',
                                        }));
                                    }}
                                    className="px-2 py-1.5 rounded-lg border border-border bg-card/70 hover:bg-primary/10 hover:border-primary/40 text-[11px] font-medium text-foreground text-center transition-all cursor-pointer"
                                >
                                    Admin
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setData((prev) => ({
                                            ...prev,
                                            email: 'manager@casanuma.com',
                                            password: 'password',
                                        }));
                                    }}
                                    className="px-2 py-1.5 rounded-lg border border-border bg-card/70 hover:bg-primary/10 hover:border-primary/40 text-[11px] font-medium text-foreground text-center transition-all cursor-pointer"
                                >
                                    Manager
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setData((prev) => ({
                                            ...prev,
                                            email: 'sales@casanuma.com',
                                            password: 'password',
                                        }));
                                    }}
                                    className="px-2 py-1.5 rounded-lg border border-border bg-card/70 hover:bg-primary/10 hover:border-primary/40 text-[11px] font-medium text-foreground text-center transition-all cursor-pointer"
                                >
                                    Sales
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setData((prev) => ({
                                            ...prev,
                                            email: 'finance@casanuma.com',
                                            password: 'password',
                                        }));
                                    }}
                                    className="px-2 py-1.5 rounded-lg border border-border bg-card/70 hover:bg-primary/10 hover:border-primary/40 text-[11px] font-medium text-foreground text-center transition-all cursor-pointer"
                                >
                                    Finance
                                </button>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-4 pt-2">
                        <Button
                            type="submit"
                            size="lg"
                            className="w-full gap-2 font-semibold shadow-md shadow-primary/20 hover:shadow-lg transition-all"
                            disabled={processing}
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    <span>Memverifikasi Akses...</span>
                                </>
                            ) : (
                                <>
                                    <span>Masuk ke Dashboard</span>
                                    <ArrowRight className="size-4" />
                                </>
                            )}
                        </Button>

                        <div className="text-center text-xs text-muted-foreground">
                            Belum punya akses akun?{' '}
                            <Link
                                href={route('register')}
                                className="font-semibold text-primary hover:underline"
                            >
                                Daftar akun sales
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </GuestLayout>
    );
}
