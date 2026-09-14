import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Lupa Password" />

            <Card className="border-border">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-xl">Reset Password</CardTitle>
                    <CardDescription>
                        Lupa password akun Anda? Masukkan alamat email yang terdaftar dan kami akan mengirimkan tautan reset password.
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
                            <Label htmlFor="email">Email Terdaftar</Label>
                            <div className="relative">
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    placeholder="nama@domain.com"
                                    className="pl-9"
                                    autoFocus
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
                                    Mengirim Link...
                                </>
                            ) : (
                                'Kirim Tautan Reset Password'
                            )}
                        </Button>

                        <div className="text-center text-xs">
                            <Link
                                href={route('login')}
                                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <ArrowLeft className="size-3.5" />
                                Kembali ke halaman login
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </GuestLayout>
    );
}
