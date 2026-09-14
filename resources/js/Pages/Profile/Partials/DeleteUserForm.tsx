import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';
import { AlertTriangle, Loader2, Lock, Trash2 } from 'lucide-react';

export default function DeleteUserForm({
    className = '',
}: {
    className?: string;
}) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header className="space-y-1">
                <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="size-4.5" />
                    <h2 className="text-lg font-semibold tracking-tight">
                        Hapus Akun Permanen
                    </h2>
                </div>
                <p className="text-xs text-muted-foreground">
                    Setelah akun Anda dihapus, semua sumber daya dan datanya akan dihapus secara permanen. Sebelum menghapus akun Anda, harap unduh data apa pun yang ingin Anda pertahankan.
                </p>
            </header>

            <Button
                variant="destructive"
                size="sm"
                onClick={confirmUserDeletion}
                className="gap-2 font-medium"
            >
                <Trash2 className="size-4" />
                Hapus Akun Saya
            </Button>

            <Dialog
                open={confirmingUserDeletion}
                onOpenChange={(open) => {
                    if (!open) closeModal();
                }}
            >
                <DialogContent className="sm:max-w-lg">
                    <form onSubmit={deleteUser} className="space-y-5">
                        <DialogHeader className="space-y-2">
                            <div className="flex items-center gap-2 text-destructive">
                                <AlertTriangle className="size-5" />
                                <DialogTitle className="text-lg font-bold">
                                    Apakah Anda yakin ingin menghapus akun?
                                </DialogTitle>
                            </div>

                            <DialogDescription className="text-xs leading-relaxed text-muted-foreground">
                                Tindakan ini tidak dapat dibatalkan. Semua data, riwayat sesi, dan preferensi akun Anda akan dihapus secara permanen dari basis data. Silakan masukkan kata sandi Anda untuk mengonfirmasi.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="sr-only">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="pl-9"
                                    placeholder="Masukkan password Anda untuk konfirmasi"
                                    autoFocus
                                    aria-invalid={!!errors.password}
                                />
                                <Lock className="size-4 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
                            </div>
                            {errors.password && (
                                <p className="text-xs font-medium text-destructive">{errors.password}</p>
                            )}
                        </div>

                        <DialogFooter className="gap-2 sm:gap-2 pt-2 border-t border-border">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeModal}
                            >
                                Batal
                            </Button>

                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={processing}
                                className="gap-1.5"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="size-3.5 animate-spin mr-1" />
                                        Menghapus...
                                    </>
                                ) : (
                                    'Ya, Hapus Akun'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </section>
    );
}
