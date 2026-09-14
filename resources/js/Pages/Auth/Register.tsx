import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { ArrowRight, Loader2, Lock, Mail, User } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <Card className="border-border">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-xl">Buat Akun Baru</CardTitle>
                    <CardDescription>
                        Isi form di bawah ini untuk memulai akun Anda
                    </CardDescription>
                </CardHeader>

                <form onSubmit={submit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Lengkap</Label>
                            <div className="relative">
                                <Input
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    placeholder="John Doe"
                                    className="pl-9"
                                    autoComplete="name"
                                    autoFocus
                                    required
                                    aria-invalid={!!errors.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                <User className="size-4 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
                            </div>
                            {errors.name && (
                                <p className="text-xs font-medium text-destructive">{errors.name}</p>
                            )}
                        </div>

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
                                    required
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
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    placeholder="Minimal 8 karakter"
                                    className="pl-9"
                                    autoComplete="new-password"
                                    required
                                    aria-invalid={!!errors.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                <Lock className="size-4 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
                            </div>
                            {errors.password && (
                                <p className="text-xs font-medium text-destructive">{errors.password}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                            <div className="relative">
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    placeholder="Ulangi password di atas"
                                    className="pl-9"
                                    autoComplete="new-password"
                                    required
                                    aria-invalid={!!errors.password_confirmation}
                                    onChange={(e) =>
                                        setData('password_confirmation', e.target.value)
                                    }
                                />
                                <Lock className="size-4 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
                            </div>
                            {errors.password_confirmation && (
                                <p className="text-xs font-medium text-destructive">
                                    {errors.password_confirmation}
                                </p>
                            )}
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
                                    Mendaftarkan...
                                </>
                            ) : (
                                <>
                                    Daftar Akun
                                    <ArrowRight className="size-4" />
                                </>
                            )}
                        </Button>

                        <div className="text-center text-xs text-muted-foreground">
                            Sudah punya akun?{' '}
                            <Link
                                href={route('login')}
                                className="font-medium text-primary hover:underline"
                            >
                                Masuk di sini
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </GuestLayout>
    );
}
