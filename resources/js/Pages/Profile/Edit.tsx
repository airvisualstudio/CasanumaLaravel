import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { Card, CardContent } from '@/Components/ui/card';
import { KeyRound, User } from 'lucide-react';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                                <User className="size-4" />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-heading">
                                Pengaturan Akun & Profil
                            </h2>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Kelola informasi profil, alamat email, dan pembaruan kata sandi akun Anda.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <a
                            href="#profile-info"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <User className="size-3.5" />
                            <span>Info Profil</span>
                        </a>
                        <a
                            href="#password"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-medium text-amber-600 dark:text-amber-400 transition-colors"
                        >
                            <KeyRound className="size-3.5" />
                            <span>Ganti Password</span>
                        </a>
                    </div>
                </div>
            }
        >
            <Head title="Pengaturan Profil - CASANUMA CRM" />

            <div className="space-y-6 max-w-4xl">
                <Card id="profile-info" className="border-border/80 shadow-2xs scroll-mt-24">
                    <CardContent className="pt-6">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                        />
                    </CardContent>
                </Card>

                <Card id="password" className="border-border/80 shadow-2xs scroll-mt-24">
                    <CardContent className="pt-6">
                        <UpdatePasswordForm />
                    </CardContent>
                </Card>

                <Card className="border-destructive/30 shadow-2xs scroll-mt-24">
                    <CardContent className="pt-6">
                        <DeleteUserForm />
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
