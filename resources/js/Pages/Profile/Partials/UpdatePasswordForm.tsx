import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';
import { CheckCircle2, Loader2, Lock } from 'lucide-react';
import { toast } from '@/Components/ui/sonner';

export default function UpdatePasswordForm({
    className = '',
}: {
    className?: string;
}) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                toast.success('Password berhasil diperbarui!');
            },
            onError: (errors) => {
                toast.error('Gagal memperbarui password. Silakan periksa formulir.');
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                    Perbarui Password
                </h2>
                <p className="text-xs text-muted-foreground">
                    Pastikan akun Anda menggunakan password yang panjang dan acak untuk menjaga keamanan.
                </p>
            </header>

            <form onSubmit={updatePassword} className="space-y-4 max-w-xl">
                <div className="space-y-2">
                    <Label htmlFor="current_password">Password Saat Ini</Label>
                    <div className="relative">
                        <Input
                            id="current_password"
                            ref={currentPasswordInput}
                            value={data.current_password}
                            onChange={(e) => setData('current_password', e.target.value)}
                            type="password"
                            className="pl-9"
                            autoComplete="current-password"
                            aria-invalid={!!errors.current_password}
                        />
                        <Lock className="size-4 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
                    </div>
                    {errors.current_password && (
                        <p className="text-xs font-medium text-destructive">{errors.current_password}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Password Baru</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            type="password"
                            className="pl-9"
                            autoComplete="new-password"
                            aria-invalid={!!errors.password}
                        />
                        <Lock className="size-4 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
                    </div>
                    {errors.password && (
                        <p className="text-xs font-medium text-destructive">{errors.password}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password_confirmation">Konfirmasi Password Baru</Label>
                    <div className="relative">
                        <Input
                            id="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            type="password"
                            className="pl-9"
                            autoComplete="new-password"
                            aria-invalid={!!errors.password_confirmation}
                        />
                        <Lock className="size-4 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
                    </div>
                    {errors.password_confirmation && (
                        <p className="text-xs font-medium text-destructive">
                            {errors.password_confirmation}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-4 pt-2">
                    <Button type="submit" disabled={processing} size="sm">
                        {processing ? (
                            <>
                                <Loader2 className="size-3.5 animate-spin mr-1.5" />
                                Memperbarui...
                            </>
                        ) : (
                            'Perbarui Password'
                        )}
                    </Button>

                    {recentlySuccessful && (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                            <CheckCircle2 className="size-3.5" />
                            Password berhasil diperbarui
                        </span>
                    )}
                </div>
            </form>
        </section>
    );
}
