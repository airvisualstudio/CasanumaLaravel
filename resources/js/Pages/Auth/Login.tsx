import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Checkbox } from '@/Components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { ArrowRight, Loader2, Lock, Mail } from 'lucide-react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
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
            <Head title="Log in" />

            <Card className="border-border">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-xl">Masuk ke Akun</CardTitle>
                    <CardDescription>
                        Masukkan email dan kata sandi Anda di bawah ini
                    </CardDescription>
                </CardHeader>

                <form onSubmit={submit}>
                    <CardContent className="space-y-4">
                        {status && (
                            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                {status}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    placeholder="nama@domain.com"
                                    className="pl-9"
                                    autoComplete="username"
                                    autoFocus
                                    aria-invalid={!!errors.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                <Mail className="size-4 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
                            </div>
                            {errors.email && (
                                <p className="text-xs font-medium text-destructive">{errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
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
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    placeholder="••••••••"
                                    className="pl-9"
                                    autoComplete="current-password"
                                    aria-invalid={!!errors.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                <Lock className="size-4 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
                            </div>
                            {errors.password && (
                                <p className="text-xs font-medium text-destructive">{errors.password}</p>
                            )}
                        </div>

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
                                Ingat saya di perangkat ini
                            </Label>
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-4 pt-2">
                        <Button
                            type="submit"
                            className="w-full gap-2 font-medium"
                            disabled={processing}
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    Masuk Sekarang
                                    <ArrowRight className="size-4" />
                                </>
                            )}
                        </Button>

                        <div className="text-center text-xs text-muted-foreground">
                            Belum punya akun?{' '}
                            <Link
                                href={route('register')}
                                className="font-medium text-primary hover:underline"
                            >
                                Buat akun baru
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </GuestLayout>
    );
}
