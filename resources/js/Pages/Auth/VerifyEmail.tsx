import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { CheckCircle2, Loader2, LogOut, MailCheck } from 'lucide-react';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Verifikasi Email" />

            <Card className="border-border">
                <CardHeader className="space-y-1">
                    <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                        <MailCheck className="size-5" />
                    </div>
                    <CardTitle className="text-xl">Verifikasi Email Anda</CardTitle>
                    <CardDescription>
                        Terima kasih sudah mendaftar! Sebelum memulai, silakan klik tautan verifikasi yang baru saja kami kirimkan ke email Anda.
                    </CardDescription>
                </CardHeader>

                <form onSubmit={submit}>
                    <CardContent className="space-y-4">
                        {status === 'verification-link-sent' && (
                            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                <CheckCircle2 className="size-4 shrink-0" />
                                Tautan verifikasi baru telah dikirim ke alamat email Anda.
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="flex items-center justify-between pt-2">
                        <Button
                            type="submit"
                            size="sm"
                            disabled={processing}
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="size-3.5 animate-spin mr-1.5" />
                                    Mengirim...
                                </>
                            ) : (
                                'Kirim Ulang Email'
                            )}
                        </Button>

                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
                        >
                            <LogOut className="size-3.5" />
                            Log Out
                        </Link>
                    </CardFooter>
                </form>
            </Card>
        </GuestLayout>
    );
}
