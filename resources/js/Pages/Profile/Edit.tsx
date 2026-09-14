import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { Card, CardContent } from '@/Components/ui/card';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">
                        Profil Akun
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Kelola data profil, alamat email, dan keamanan kata sandi Anda.
                    </p>
                </div>
            }
        >
            <Head title="Profile" />

            <div className="space-y-6 max-w-4xl">
                <Card className="border-border">
                    <CardContent className="pt-6">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                        />
                    </CardContent>
                </Card>

                <Card className="border-border">
                    <CardContent className="pt-6">
                        <UpdatePasswordForm />
                    </CardContent>
                </Card>

                <Card className="border-destructive/30">
                    <CardContent className="pt-6">
                        <DeleteUserForm />
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
