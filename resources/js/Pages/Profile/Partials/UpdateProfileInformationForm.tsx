import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { CheckCircle2, Loader2, Mail, User } from 'lucide-react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}: {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                    Informasi Profil
                </h2>
                <p className="text-xs text-muted-foreground">
                    Perbarui informasi nama dan alamat email akun Anda.
                </p>
            </header>

            <form onSubmit={submit} className="space-y-4 max-w-xl">
                <div className="space-y-2">
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <div className="relative">
                        <Input
                            id="name"
                            className="pl-9"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoComplete="name"
                            aria-invalid={!!errors.name}
                        />
                        <User className="size-4 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
                    </div>
                    {errors.name && (
                        <p className="text-xs font-medium text-destructive">{errors.name}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Alamat Email</Label>
                    <div className="relative">
                        <Input
                            id="email"
                            type="email"
                            className="pl-9"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                            aria-invalid={!!errors.email}
                        />
                        <Mail className="size-4 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
                    </div>
                    {errors.email && (
                        <p className="text-xs font-medium text-destructive">{errors.email}</p>
                    )}
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400 space-y-2">
                        <p>Alamat email Anda belum diverifikasi.</p>
                        <Link
                            href={route('verification.send')}
                            method="post"
                            as="button"
                            className="underline hover:text-foreground font-medium"
                        >
                            Klik di sini untuk mengirim ulang email verifikasi.
                        </Link>
                        {status === 'verification-link-sent' && (
                            <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                                Tautan verifikasi baru telah dikirim ke alamat email Anda.
                            </p>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4 pt-2">
                    <Button type="submit" disabled={processing} size="sm">
                        {processing ? (
                            <>
                                <Loader2 className="size-3.5 animate-spin mr-1.5" />
                                Menyimpan...
                            </>
                        ) : (
                            'Simpan Perubahan'
                        )}
                    </Button>

                    {recentlySuccessful && (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                            <CheckCircle2 className="size-3.5" />
                            Tersimpan
                        </span>
                    )}
                </div>
            </form>
        </section>
    );
}
