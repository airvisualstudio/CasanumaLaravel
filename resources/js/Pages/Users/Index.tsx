import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState, useMemo, FormEventHandler } from 'react';
import { 
    Users, 
    UserPlus, 
    Search, 
    Shield, 
    ShieldCheck, 
    Edit2, 
    Trash2, 
    Loader2, 
    Lock, 
    Mail, 
    User as UserIcon, 
    AlertTriangle, 
    CheckCircle2, 
    X,
    Filter,
    KeyRound
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';

interface UserData {
    id: number;
    name: string;
    email: string;
    roles: string[];
    created_at: string;
}

interface PageProps {
    users: UserData[];
    availableRoles: string[];
    flash?: {
        success?: string;
        error?: string;
    };
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            roles: string[];
            permissions: string[];
        };
    };
    [key: string]: any;
}

const roleBadges: Record<string, { label: string; color: string; dotColor: string }> = {
    superadmin: {
        label: 'Super Administrator',
        color: 'border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400',
        dotColor: 'bg-purple-500',
    },
    sales_manager: {
        label: 'Sales Manager',
        color: 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400',
        dotColor: 'bg-blue-500',
    },
    sales_agent: {
        label: 'Sales Agent',
        color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        dotColor: 'bg-emerald-500',
    },
    finance: {
        label: 'Finance & KPR',
        color: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400',
        dotColor: 'bg-amber-500',
    },
};

export default function UsersIndex({ users, availableRoles }: PageProps) {
    const { auth, flash, errors: pageErrors } = usePage<PageProps>().props;
    const currentUserId = auth.user.id;

    // Search & Filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');

    // Dialog states
    const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [userToDelete, setUserToDelete] = useState<UserData | null>(null);

    // Form handling for Add/Edit
    const {
        data: formData,
        setData: setFormData,
        post,
        put,
        processing: formProcessing,
        errors: formErrors,
        reset: resetForm,
        clearErrors: clearFormErrors,
    } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'sales_agent',
    });

    // Form handling for Delete
    const {
        delete: destroyUser,
        processing: deleteProcessing,
    } = useForm();

    // Filtered users
    const filteredUsers = useMemo(() => {
        return users.filter((u) => {
            const matchesSearch = 
                u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.email.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesRole = 
                selectedRoleFilter === 'all' || 
                u.roles.includes(selectedRoleFilter);

            return matchesSearch && matchesRole;
        });
    }, [users, searchQuery, selectedRoleFilter]);

    // Role count summary
    const roleCounts = useMemo(() => {
        const counts: Record<string, number> = {
            all: users.length,
            superadmin: 0,
            sales_manager: 0,
            sales_agent: 0,
            finance: 0,
        };
        users.forEach((u) => {
            u.roles.forEach((r) => {
                if (counts[r] !== undefined) {
                    counts[r]++;
                }
            });
        });
        return counts;
    }, [users]);

    const openAddDialog = () => {
        setEditingUser(null);
        clearFormErrors();
        resetForm();
        setFormData({
            name: '',
            email: '',
            password: '',
            role: 'sales_agent',
        });
        setIsFormDialogOpen(true);
    };

    const openEditDialog = (user: UserData) => {
        setEditingUser(user);
        clearFormErrors();
        resetForm();
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.roles[0] || 'sales_agent',
        });
        setIsFormDialogOpen(true);
    };

    const closeFormDialog = () => {
        setIsFormDialogOpen(false);
        setEditingUser(null);
        clearFormErrors();
        resetForm();
    };

    const handleFormSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        if (editingUser) {
            put(route('users.update', editingUser.id), {
                preserveScroll: true,
                onSuccess: () => closeFormDialog(),
            });
        } else {
            post(route('users.store'), {
                preserveScroll: true,
                onSuccess: () => closeFormDialog(),
            });
        }
    };

    const confirmDelete = (user: UserData) => {
        setUserToDelete(user);
    };

    const handleDeleteUser = () => {
        if (!userToDelete) return;

        destroyUser(route('users.destroy', userToDelete.id), {
            preserveScroll: true,
            onSuccess: () => setUserToDelete(null),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Manajemen Pengguna - CASANUMA CRM" />

            <div className="space-y-6 transition-all duration-300">
                {/* 1. Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                                <Users className="size-5" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-heading">
                                    Manajemen Pengguna & Hak Akses
                                </h1>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                    Kelola akun karyawan, pembagian peran Spatie RBAC, dan kredensial sistem CRM.
                                </p>
                            </div>
                        </div>
                    </div>

                    <Button onClick={openAddDialog} className="gap-2 shadow-xs shrink-0">
                        <UserPlus className="size-4" />
                        <span>Tambah Pengguna</span>
                    </Button>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2.5 animate-in fade-in-50">
                        <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-medium">{flash.success}</span>
                    </div>
                )}
                {(flash?.error || pageErrors.error) && (
                    <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive flex items-center gap-2.5 animate-in fade-in-50">
                        <AlertTriangle className="size-4 shrink-0" />
                        <span className="font-medium">{flash?.error || pageErrors.error}</span>
                    </div>
                )}

                {/* 2. Role Filter Tabs & Search */}
                <Card className="border-border/80 shadow-xs">
                    <CardContent className="p-4 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            {/* Role Filter Buttons */}
                            <div className="flex flex-wrap items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => setSelectedRoleFilter('all')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                        selectedRoleFilter === 'all'
                                            ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                                            : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                                >
                                    Semua ({roleCounts.all})
                                </button>
                                {availableRoles.map((role) => {
                                    const info = roleBadges[role] || { label: role, dotColor: 'bg-primary' };
                                    const count = roleCounts[role] || 0;
                                    const isActive = selectedRoleFilter === role;

                                    return (
                                        <button
                                            key={role}
                                            type="button"
                                            onClick={() => setSelectedRoleFilter(role)}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                                isActive
                                                    ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                                                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                                            }`}
                                        >
                                            <span className={`size-2 rounded-full ${isActive ? 'bg-primary-foreground' : info.dotColor}`} />
                                            <span>{info.label}</span>
                                            <span className={`text-[10px] ${isActive ? 'opacity-80' : 'text-muted-foreground'}`}>
                                                ({count})
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Search Input */}
                            <div className="relative w-full md:w-64">
                                <Search className="size-4 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
                                <Input
                                    type="text"
                                    placeholder="Cari nama atau email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 h-9 text-xs"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="size-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. User Data Table */}
                <Card className="border-border/80 shadow-md overflow-hidden">
                    <CardHeader className="p-5 pb-3 border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base font-semibold">
                                Daftar Pengguna Aktif
                            </CardTitle>
                            <CardDescription className="text-xs text-muted-foreground">
                                Menampilkan {filteredUsers.length} dari total {users.length} pengguna terdaftar
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                            <ShieldCheck className="size-4 text-primary" />
                            <span>Otorisasi: Spatie RBAC</span>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow>
                                    <TableHead className="w-[300px]">Pengguna</TableHead>
                                    <TableHead>Peran (Role)</TableHead>
                                    <TableHead className="hidden sm:table-cell">Terdaftar Sejak</TableHead>
                                    <TableHead className="hidden md:table-cell">Status</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => {
                                        const isSelf = user.id === currentUserId;
                                        const primaryRole = user.roles[0] || 'sales_agent';
                                        const roleMeta = roleBadges[primaryRole] || {
                                            label: primaryRole,
                                            color: 'border-border bg-muted text-muted-foreground',
                                            dotColor: 'bg-muted-foreground',
                                        };

                                        return (
                                            <TableRow key={user.id} className="hover:bg-muted/20">
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-9 rounded-full bg-primary/15 text-primary font-bold text-xs flex items-center justify-center border border-primary/20 shrink-0">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="truncate">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-foreground text-sm truncate">
                                                                    {user.name}
                                                                </span>
                                                                {isSelf && (
                                                                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-primary/40 bg-primary/10 text-primary">
                                                                        Anda
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <span className="text-xs text-muted-foreground truncate block">
                                                                {user.email}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {user.roles.map((r) => {
                                                            const badge = roleBadges[r] || {
                                                                label: r,
                                                                color: 'border-border bg-muted text-muted-foreground',
                                                            };
                                                            return (
                                                                <span
                                                                    key={r}
                                                                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${badge.color}`}
                                                                >
                                                                    {badge.label}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell text-xs text-muted-foreground font-mono">
                                                    {user.created_at}
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        Aktif
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-sm"
                                                            onClick={() => openEditDialog(user)}
                                                            title={`Edit ${user.name}`}
                                                            className="text-muted-foreground hover:text-foreground"
                                                        >
                                                            <Edit2 className="size-3.5" />
                                                        </Button>

                                                        <Button
                                                            variant="ghost"
                                                            size="icon-sm"
                                                            onClick={() => confirmDelete(user)}
                                                            disabled={isSelf}
                                                            title={isSelf ? 'Anda tidak dapat menghapus akun sendiri' : `Hapus ${user.name}`}
                                                            className="text-muted-foreground hover:text-destructive disabled:opacity-30"
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center text-muted-foreground text-xs">
                                            <div className="flex flex-col items-center justify-center gap-1.5">
                                                <Users className="size-6 text-muted-foreground/50 mb-1" />
                                                <p className="font-semibold text-foreground">Tidak ada pengguna ditemukan</p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    Coba sesuaikan kata kunci pencarian atau filter peran yang dipilih.
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* 4. Dialog Form Tambah / Edit Pengguna (Standard shadcn Dialog) */}
                <Dialog open={isFormDialogOpen} onOpenChange={(open) => !open && closeFormDialog()}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                                    {editingUser ? <Edit2 className="size-5" /> : <UserPlus className="size-5" />}
                                </div>
                                <div>
                                    <DialogTitle className="text-lg font-bold">
                                        {editingUser ? 'Perbarui Data Pengguna' : 'Tambah Pengguna Baru'}
                                    </DialogTitle>
                                    <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                        {editingUser 
                                            ? `Mengubah kredensial dan alokasi peran untuk ${editingUser.name}.`
                                            : 'Masukkan data pengguna baru dan tentukan peran akses CRM.'}
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <form onSubmit={handleFormSubmit} className="space-y-4 pt-1">
                            {/* Nama Lengkap */}
                            <div className="space-y-1.5">
                                <Label htmlFor="user-name" className="text-xs font-semibold">
                                    Nama Lengkap <span className="text-destructive">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="user-name"
                                        type="text"
                                        placeholder="Contoh: Budi Santoso"
                                        value={formData.name}
                                        onChange={(e) => setFormData('name', e.target.value)}
                                        className="pl-9 text-xs"
                                        autoFocus
                                        aria-invalid={!!formErrors.name}
                                    />
                                    <UserIcon className="size-4 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
                                </div>
                                {formErrors.name && (
                                    <p className="text-xs font-medium text-destructive">{formErrors.name}</p>
                                )}
                            </div>

                            {/* Alamat Email */}
                            <div className="space-y-1.5">
                                <Label htmlFor="user-email" className="text-xs font-semibold">
                                    Alamat Email <span className="text-destructive">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="user-email"
                                        type="email"
                                        placeholder="Contoh: budi@casanuma.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData('email', e.target.value)}
                                        className="pl-9 text-xs"
                                        aria-invalid={!!formErrors.email}
                                    />
                                    <Mail className="size-4 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
                                </div>
                                {formErrors.email && (
                                    <p className="text-xs font-medium text-destructive">{formErrors.email}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="user-password" className="text-xs font-semibold">
                                        Kata Sandi {editingUser ? '(Opsional)' : <span className="text-destructive">*</span>}
                                    </Label>
                                    {editingUser && (
                                        <span className="text-[10px] text-muted-foreground">
                                            Kosongkan jika tidak diubah
                                        </span>
                                    )}
                                </div>
                                <div className="relative">
                                    <Input
                                        id="user-password"
                                        type="password"
                                        placeholder={editingUser ? 'Biarkan kosong untuk mempertahankan password lama' : 'Minimal 8 karakter'}
                                        value={formData.password}
                                        onChange={(e) => setFormData('password', e.target.value)}
                                        className="pl-9 text-xs"
                                        aria-invalid={!!formErrors.password}
                                    />
                                    <Lock className="size-4 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
                                </div>
                                {formErrors.password && (
                                    <p className="text-xs font-medium text-destructive">{formErrors.password}</p>
                                )}
                            </div>

                            {/* Pilihan Peran (Spatie RBAC) */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">
                                    Penugasan Peran (Spatie Role) <span className="text-destructive">*</span>
                                </Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {availableRoles.map((role) => {
                                        const isSelected = formData.role === role;
                                        const meta = roleBadges[role] || { label: role, color: '' };

                                        return (
                                            <div
                                                key={role}
                                                onClick={() => setFormData('role', role)}
                                                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                                                    isSelected
                                                        ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                                                        : 'border-border/70 hover:border-border bg-card'
                                                }`}
                                            >
                                                <div className={`size-4 rounded-full border mt-0.5 flex items-center justify-center ${
                                                    isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'
                                                }`}>
                                                    {isSelected && <div className="size-1.5 rounded-full bg-white" />}
                                                </div>
                                                <div className="space-y-0.5 leading-tight">
                                                    <p className="text-xs font-semibold text-foreground">
                                                        {meta.label}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground font-mono">
                                                        role: {role}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {formErrors.role && (
                                    <p className="text-xs font-medium text-destructive">{formErrors.role}</p>
                                )}
                            </div>

                            <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t border-border">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={closeFormDialog}
                                    disabled={formProcessing}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={formProcessing}
                                    className="gap-2"
                                >
                                    {formProcessing && <Loader2 className="size-3.5 animate-spin" />}
                                    <span>{editingUser ? 'Simpan Perubahan' : 'Buat Akun Pengguna'}</span>
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* 5. Dialog Konfirmasi Hapus Pengguna (Standard shadcn Dialog) */}
                <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader className="gap-2">
                            <div className="flex items-center gap-2 text-destructive">
                                <AlertTriangle className="size-5" />
                                <DialogTitle className="text-lg font-bold">
                                    Konfirmasi Hapus Pengguna
                                </DialogTitle>
                            </div>
                            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                                Apakah Anda yakin ingin menghapus akun pengguna berikut secara permanen? Tindakan ini tidak dapat dibatalkan.
                            </DialogDescription>
                        </DialogHeader>

                        {userToDelete && (
                            <div className="p-3.5 rounded-xl border border-destructive/20 bg-destructive/5 space-y-1.5 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Nama:</span>
                                    <span className="font-semibold text-foreground">{userToDelete.name}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Email:</span>
                                    <span className="font-mono text-foreground">{userToDelete.email}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Peran:</span>
                                    <span className="font-medium text-primary uppercase text-[11px]">
                                        {userToDelete.roles.join(', ')}
                                    </span>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setUserToDelete(null)}
                                disabled={deleteProcessing}
                            >
                                Batal
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDeleteUser}
                                disabled={deleteProcessing}
                                className="gap-2"
                            >
                                {deleteProcessing && <Loader2 className="size-3.5 animate-spin" />}
                                <span>Ya, Hapus Pengguna</span>
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AuthenticatedLayout>
    );
}
