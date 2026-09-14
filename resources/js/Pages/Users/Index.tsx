import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useState, useMemo, FormEventHandler, useRef, useEffect } from 'react';
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
    KeyRound,
    Phone,
    MapPin,
    Building,
    CreditCard,
    Calendar as CalendarIcon,
    Briefcase,
    UserCheck,
    UserX,
    ExternalLink,
    Eye,
    Upload,
    Check,
    Image as ImageIcon,
    Sparkles,
    AlertCircle,
    Crop as CropIcon,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    Copy,
    EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Calendar } from '@/Components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover';
import AvatarCropperModal from '@/Components/AvatarCropperModal';
import { toast } from '@/Components/ui/sonner';

interface UserData {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
    avatar_url?: string | null;
    phone?: string | null;
    address?: string | null;
    emergency_contact_name?: string | null;
    emergency_contact_phone?: string | null;
    employee_id?: string | null;
    position?: string | null;
    join_date?: string | null;
    join_date_formatted?: string | null;
    is_active: boolean;
    bank_name?: string | null;
    bank_account_number?: string | null;
    bank_account_holder?: string | null;
    roles: string[];
    created_at: string;
}

interface UsersIndexProps {
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

const popularBanks = ['BCA', 'Mandiri', 'BRI', 'BNI', 'BSI', 'CIMB Niaga', 'Permata', 'BTN'];

type FormTab = 'account' | 'personal' | 'work' | 'finance';

// Dedicated resilient avatar component with graceful fallback
function UserAvatar({ 
    user, 
    className = "size-10", 
    textClassName = "text-xs" 
}: { 
    user: UserData; 
    className?: string; 
    textClassName?: string;
}) {
    const [imgError, setImgError] = useState(false);

    // Reset error if avatar_url changes
    useEffect(() => {
        setImgError(false);
    }, [user.avatar_url]);

    if (user.avatar_url && !imgError) {
        return (
            <img 
                src={user.avatar_url} 
                alt={user.name} 
                onError={() => setImgError(true)}
                className={`${className} rounded-full object-cover border border-border/80 shrink-0 shadow-2xs`}
            />
        );
    }

    return (
        <div className={`${className} rounded-full bg-linear-to-br from-primary/20 to-primary/5 text-primary font-bold ${textClassName} flex items-center justify-center border border-primary/20 shrink-0 shadow-2xs`}>
            {user.name ? user.name.charAt(0).toUpperCase() : '?'}
        </div>
    );
}

export default function UsersIndex({ users, availableRoles }: UsersIndexProps) {
    const { auth, flash, errors: pageErrors } = usePage<UsersIndexProps>().props;
    const currentUserId = auth.user.id;

    // Search & Filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
    const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

    // Dialog states
    const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<FormTab>('account');
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
    const [userToView, setUserToView] = useState<UserData | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    // Cropping & Compression states
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
    const [originalFileSize, setOriginalFileSize] = useState<number>(0);
    const [compressedFileSize, setCompressedFileSize] = useState<number | null>(null);

    // Force Reset Password states (Superadmin)
    const [userToResetPassword, setUserToResetPassword] = useState<UserData | null>(null);
    const [resetPasswordData, setResetPasswordData] = useState({
        password: '',
        password_confirmation: '',
    });
    const [resetPasswordErrors, setResetPasswordErrors] = useState<Record<string, string>>({});
    const [resetPasswordProcessing, setResetPasswordProcessing] = useState(false);
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [passwordCopied, setPasswordCopied] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form handling for Add/Edit
    const {
        data: formData,
        setData: setFormData,
        post,
        processing: formProcessing,
        errors: formErrors,
        reset: resetForm,
        clearErrors: clearFormErrors,
    } = useForm<{
        name: string;
        email: string;
        password: string;
        role: string;
        avatar: File | null;
        remove_avatar: boolean;
        phone: string;
        address: string;
        emergency_contact_name: string;
        emergency_contact_phone: string;
        employee_id: string;
        position: string;
        join_date: string;
        is_active: boolean;
        bank_name: string;
        bank_account_number: string;
        bank_account_holder: string;
    }>({
        name: '',
        email: '',
        password: '',
        role: 'sales_agent',
        avatar: null,
        remove_avatar: false,
        phone: '',
        address: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        employee_id: '',
        position: '',
        join_date: '',
        is_active: true,
        bank_name: '',
        bank_account_number: '',
        bank_account_holder: '',
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
                u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (u.employee_id && u.employee_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (u.position && u.position.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (u.phone && u.phone.includes(searchQuery));

            const matchesRole = 
                selectedRoleFilter === 'all' || 
                u.roles.includes(selectedRoleFilter);

            const matchesStatus = 
                selectedStatusFilter === 'all' ||
                (selectedStatusFilter === 'active' && u.is_active) ||
                (selectedStatusFilter === 'inactive' && !u.is_active);

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, searchQuery, selectedRoleFilter, selectedStatusFilter]);

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

    const activeUsersCount = useMemo(() => users.filter(u => u.is_active).length, [users]);

    const openAddDialog = () => {
        setEditingUser(null);
        clearFormErrors();
        resetForm();
        setAvatarPreview(null);
        setCompressedFileSize(null);
        setActiveTab('account');
        setFormData({
            name: '',
            email: '',
            password: '',
            role: 'sales_agent',
            avatar: null,
            remove_avatar: false,
            phone: '',
            address: '',
            emergency_contact_name: '',
            emergency_contact_phone: '',
            employee_id: '',
            position: '',
            join_date: new Date().toISOString().split('T')[0],
            is_active: true,
            bank_name: 'BCA',
            bank_account_number: '',
            bank_account_holder: '',
        });
        setIsFormDialogOpen(true);
    };

    const openEditDialog = (user: UserData) => {
        setEditingUser(user);
        clearFormErrors();
        resetForm();
        setAvatarPreview(user.avatar_url || null);
        setCompressedFileSize(null);
        setActiveTab('account');
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.roles[0] || 'sales_agent',
            avatar: null,
            remove_avatar: false,
            phone: user.phone || '',
            address: user.address || '',
            emergency_contact_name: user.emergency_contact_name || '',
            emergency_contact_phone: user.emergency_contact_phone || '',
            employee_id: user.employee_id || '',
            position: user.position || '',
            join_date: user.join_date || '',
            is_active: user.is_active,
            bank_name: user.bank_name || '',
            bank_account_number: user.bank_account_number || '',
            bank_account_holder: user.bank_account_holder || user.name,
        });
        setIsFormDialogOpen(true);
    };

    const closeFormDialog = () => {
        setIsFormDialogOpen(false);
        setEditingUser(null);
        setAvatarPreview(null);
        setCompressedFileSize(null);
        clearFormErrors();
        resetForm();
    };

    // Triggered when file input changes -> Opens Cropper Dialog
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedMimeTypes.includes(file.type)) {
            toast.error('Format berkas tidak didukung. Harap pilih foto berformat JPG atau PNG.');
            e.target.value = '';
            return;
        }

        // Izinkan foto mentah dari kamera/HP hingga 20MB untuk kemudian di-crop & otomatis dikompres ke < 150KB
        const maxRawSizeBytes = 20 * 1024 * 1024; // 20MB
        if (file.size > maxRawSizeBytes) {
            toast.error('Ukuran foto mentah melebihi 20MB. Silakan pilih foto dengan ukuran di bawah 20MB.');
            e.target.value = '';
            return;
        }

        setOriginalFileSize(file.size);

        const reader = new FileReader();
        reader.onload = (event) => {
            setRawImageSrc(event.target?.result as string);
            setIsCropperOpen(true);
        };
        reader.readAsDataURL(file);

        // Reset input value so same file can be re-selected if cancelled
        e.target.value = '';
    };

    const handleCropperComplete = (file: File, previewUrl: string, compressedSize: number) => {
        setFormData('avatar', file);
        setFormData('remove_avatar', false);
        setAvatarPreview(previewUrl);
        setCompressedFileSize(compressedSize);
        toast.success('Foto berhasil dipotong dan siap disimpan!');
    };

    const handleRemoveAvatar = () => {
        setFormData('avatar', null);
        setFormData('remove_avatar', true);
        setAvatarPreview(null);
        setCompressedFileSize(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        toast.info('Foto avatar dihapus. Sistem akan menggunakan avatar inisial nama.');
    };

    const handleFormSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        if (editingUser) {
            post(route('users.update', editingUser.id), {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    closeFormDialog();
                    toast.success(`Data pengguna ${formData.name} berhasil diperbarui!`);
                },
                onError: () => {
                    toast.error('Gagal memperbarui pengguna. Silakan periksa formulir.');
                },
            });
        } else {
            post(route('users.store'), {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    closeFormDialog();
                    toast.success(`Pengguna ${formData.name} berhasil ditambahkan!`);
                },
                onError: () => {
                    toast.error('Gagal menambahkan pengguna. Silakan periksa formulir.');
                },
            });
        }
    };

    const handleToggleStatus = (user: UserData) => {
        const nextStatus = !user.is_active;
        router.patch(route('users.toggle-status', user.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Status akun ${user.name} diubah menjadi ${nextStatus ? 'Aktif' : 'Nonaktif'}.`);
            },
            onError: () => {
                toast.error('Gagal memperbarui status akun.');
            },
        });
    };

    const confirmDelete = (user: UserData) => {
        setUserToDelete(user);
    };

    const handleDeleteUser = () => {
        if (!userToDelete) return;
        const targetName = userToDelete.name;

        destroyUser(route('users.destroy', userToDelete.id), {
            preserveScroll: true,
            onSuccess: () => {
                setUserToDelete(null);
                toast.success(`Pengguna ${targetName} berhasil dihapus.`);
            },
            onError: () => {
                toast.error('Gagal menghapus pengguna.');
            },
        });
    };

    const cleanWaNumber = (phone?: string | null) => {
        if (!phone) return null;
        let cleaned = phone.replace(/\D/g, '');
        if (cleaned.startsWith('0')) {
            cleaned = '62' + cleaned.substring(1);
        }
        return cleaned;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const openResetPasswordDialog = (user: UserData) => {
        setUserToResetPassword(user);
        setResetPasswordData({
            password: '',
            password_confirmation: '',
        });
        setResetPasswordErrors({});
        setShowResetPassword(false);
        setPasswordCopied(false);
    };

    const generateRandomPassword = () => {
        const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%';
        let generated = 'Casa-';
        for (let i = 0; i < 8; i++) {
            generated += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setResetPasswordData({
            password: generated,
            password_confirmation: generated,
        });
        setResetPasswordErrors({});
        setShowResetPassword(true);
    };

    const handleCopyPassword = () => {
        if (resetPasswordData.password) {
            navigator.clipboard.writeText(resetPasswordData.password);
            setPasswordCopied(true);
            toast.success('Password sementara berhasil disalin ke clipboard!');
            setTimeout(() => setPasswordCopied(false), 2000);
        }
    };

    const handleResetPasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userToResetPassword) return;

        setResetPasswordProcessing(true);
        setResetPasswordErrors({});

        router.patch(
            route('users.reset-password', userToResetPassword.id),
            resetPasswordData,
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Password untuk ${userToResetPassword.name} berhasil direset!`);
                    setUserToResetPassword(null);
                    setResetPasswordData({ password: '', password_confirmation: '' });
                    setResetPasswordProcessing(false);
                },
                onError: (errs) => {
                    setResetPasswordErrors(errs);
                    setResetPasswordProcessing(false);
                    toast.error('Gagal mereset password. Pastikan memenuhi standar keamanan.');
                },
            }
        );
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
                                    Manajemen Pengguna & Profil Staf
                                </h1>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                    Kelola kredensial, info kerja (NIK/Jabatan), kontak darurat, serta data rekening pencairan komisi.
                                </p>
                            </div>
                        </div>
                    </div>

                    <Button onClick={openAddDialog} className="gap-2 shadow-xs shrink-0">
                        <UserPlus className="size-4" />
                        <span>Tambah Pengguna</span>
                    </Button>
                </div>

                {/* 2. Top Summary KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <Card className="border-border/80 shadow-2xs">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <Users className="size-5" />
                            </div>
                            <div>
                                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Total User</p>
                                <p className="text-xl font-bold text-foreground font-heading">{users.length}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/80 shadow-2xs">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                <UserCheck className="size-5" />
                            </div>
                            <div>
                                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Status Aktif</p>
                                <p className="text-xl font-bold text-foreground font-heading">
                                    {activeUsersCount} <span className="text-xs font-normal text-muted-foreground">/ {users.length}</span>
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/80 shadow-2xs">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                <Briefcase className="size-5" />
                            </div>
                            <div>
                                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Tim Penjualan</p>
                                <p className="text-xl font-bold text-foreground font-heading">
                                    {(roleCounts.sales_manager || 0) + (roleCounts.sales_agent || 0)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/80 shadow-2xs">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                <CreditCard className="size-5" />
                            </div>
                            <div>
                                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Tim Finance</p>
                                <p className="text-xl font-bold text-foreground font-heading">
                                    {roleCounts.finance || 0}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 3. Filter & Search Controls Above Table */}
                <Card className="border-border/80 shadow-xs">
                    <CardContent className="p-4 space-y-3">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            {/* Search Input for Name / Email */}
                            <div className="relative flex-1">
                                <Search className="size-4 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
                                <Input
                                    type="text"
                                    placeholder="Cari nama, email, NIK, jabatan, atau no WhatsApp..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 h-9 text-xs"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                                    >
                                        <X className="size-3.5" />
                                    </button>
                                )}
                            </div>

                            {/* Filter Dropdowns (Role & Status) */}
                            <div className="flex flex-wrap items-center gap-2">
                                {/* Role Select Filter */}
                                <Select
                                    value={selectedRoleFilter}
                                    onValueChange={(val: any) => setSelectedRoleFilter(val)}
                                >
                                    <SelectTrigger className="w-[175px] h-9 text-xs bg-background">
                                        <SelectValue placeholder="Semua Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Role ({roleCounts.all})</SelectItem>
                                        {availableRoles.map((role) => (
                                            <SelectItem key={role} value={role}>
                                                {roleBadges[role]?.label || role} ({roleCounts[role] || 0})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Status Select Filter */}
                                <Select
                                    value={selectedStatusFilter}
                                    onValueChange={(val: any) => setSelectedStatusFilter(val)}
                                >
                                    <SelectTrigger className="w-[145px] h-9 text-xs bg-background">
                                        <SelectValue placeholder="Status Akun" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        <SelectItem value="active">Hanya Aktif ({activeUsersCount})</SelectItem>
                                        <SelectItem value="inactive">Hanya Nonaktif ({users.length - activeUsersCount})</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Reset button if filter active */}
                                {(searchQuery !== '' || selectedRoleFilter !== 'all' || selectedStatusFilter !== 'all') && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setSelectedRoleFilter('all');
                                            setSelectedStatusFilter('all');
                                        }}
                                        className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1"
                                        title="Reset semua filter"
                                    >
                                        <RotateCcw className="size-3.5" />
                                        <span>Reset</span>
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Quick Role Filter Pills */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/40">
                            <span className="text-[11px] text-muted-foreground font-medium mr-1 hidden sm:inline">Pintasan Role:</span>
                            <button
                                type="button"
                                onClick={() => setSelectedRoleFilter('all')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
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
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
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
                    </CardContent>
                </Card>

                {/* 4. User Data Table */}
                <Card className="border-border/80 shadow-md overflow-hidden py-0 gap-0">
                    <CardHeader className="px-5 py-4 !pb-4 border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base font-semibold">
                                Direktori Staf & Pengguna CRM
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
                                    <TableHead className="w-[280px]">Profil Pengguna</TableHead>
                                    <TableHead>Peran & Jabatan</TableHead>
                                    <TableHead className="hidden md:table-cell">Kontak & Domisili</TableHead>
                                    <TableHead className="hidden lg:table-cell">Rekening Komisi</TableHead>
                                    <TableHead>Status</TableHead>
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
                                        const waLink = cleanWaNumber(user.phone);

                                        return (
                                            <TableRow key={user.id} className="hover:bg-muted/20 transition-colors">
                                                {/* Profil: UserAvatar, Nama, NIK, Email */}
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-3">
                                                        <UserAvatar user={user} className="size-10" textClassName="text-xs" />
                                                        <div className="truncate">
                                                            <div className="flex items-center gap-1.5">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setUserToView(user)}
                                                                    className="font-semibold text-foreground text-sm truncate hover:text-primary transition-colors text-left"
                                                                >
                                                                    {user.name}
                                                                </button>
                                                                {isSelf && (
                                                                    <Badge variant="outline" className="text-[10px] py-0 px-1 border-primary/40 bg-primary/10 text-primary shrink-0">
                                                                        Anda
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                {user.employee_id && (
                                                                    <span className="font-mono text-[11px] text-primary/80 font-medium">
                                                                        {user.employee_id}
                                                                    </span>
                                                                )}
                                                                <span className="truncate">{user.email}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Peran & Jabatan */}
                                                <TableCell>
                                                    <div className="space-y-1">
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
                                                        <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                                                            <Briefcase className="size-3 shrink-0 text-muted-foreground/70" />
                                                            <span>{user.position || 'Staf Operasional'}</span>
                                                        </p>
                                                    </div>
                                                </TableCell>

                                                {/* Kontak & Domisili */}
                                                <TableCell className="hidden md:table-cell">
                                                    <div className="space-y-1 text-xs">
                                                        {user.phone ? (
                                                            waLink ? (
                                                                <a
                                                                    href={`https://wa.me/${waLink}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
                                                                    title="Buka Chat WhatsApp"
                                                                >
                                                                    <Phone className="size-3 text-emerald-500" />
                                                                    <span>{user.phone}</span>
                                                                    <ExternalLink className="size-2.5 opacity-60" />
                                                                </a>
                                                            ) : (
                                                                <span className="text-foreground">{user.phone}</span>
                                                            )
                                                        ) : (
                                                            <span className="text-muted-foreground italic text-[11px]">- Belum ada WA -</span>
                                                        )}
                                                        {user.address && (
                                                            <p className="text-[11px] text-muted-foreground truncate max-w-[180px] flex items-center gap-1" title={user.address}>
                                                                <MapPin className="size-3 shrink-0 text-muted-foreground/70" />
                                                                <span className="truncate">{user.address}</span>
                                                            </p>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                {/* Rekening Komisi */}
                                                <TableCell className="hidden lg:table-cell">
                                                    {user.bank_account_number ? (
                                                        <div className="space-y-0.5 text-xs">
                                                            <div className="flex items-center gap-1.5 font-medium text-foreground">
                                                                <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-bold uppercase border border-border">
                                                                    {user.bank_name || 'BANK'}
                                                                </span>
                                                                <span className="font-mono text-xs">{user.bank_account_number}</span>
                                                            </div>
                                                            <p className="text-[11px] text-muted-foreground truncate max-w-[160px]">
                                                                a/n {user.bank_account_holder || user.name}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs italic">- Belum diisi -</span>
                                                    )}
                                                </TableCell>

                                                {/* Status Aktif / Nonaktif */}
                                                <TableCell>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleStatus(user)}
                                                        disabled={isSelf}
                                                        title={isSelf ? 'Tidak dapat menonaktifkan akun sendiri' : 'Klik untuk ubah status aktif/nonaktif'}
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                                                            user.is_active
                                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                                                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                                        } ${isSelf ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                                                    >
                                                        <span className={`size-1.5 rounded-full ${user.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'}`} />
                                                        <span>{user.is_active ? 'Aktif' : 'Nonaktif'}</span>
                                                    </button>
                                                </TableCell>

                                                {/* Aksi */}
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-sm"
                                                            onClick={() => setUserToView(user)}
                                                            title={`Lihat Detail ${user.name}`}
                                                            className="text-muted-foreground hover:text-primary"
                                                        >
                                                            <Eye className="size-3.5" />
                                                        </Button>

                                                        <Button
                                                            variant="ghost"
                                                            size="icon-sm"
                                                            onClick={() => openResetPasswordDialog(user)}
                                                            title={`Reset Password ${user.name}`}
                                                            className="text-muted-foreground hover:text-amber-500"
                                                        >
                                                            <KeyRound className="size-3.5" />
                                                        </Button>

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
                                        <TableCell colSpan={6} className="h-36 text-center text-muted-foreground text-xs">
                                            <div className="flex flex-col items-center justify-center gap-1.5">
                                                <Users className="size-7 text-muted-foreground/50 mb-1" />
                                                <p className="font-semibold text-foreground text-sm">Tidak ada staf atau pengguna ditemukan</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Coba sesuaikan kata kunci pencarian atau filter status dan peran.
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* 5. Dialog Form Tambah / Edit Pengguna (Bertab Modern) */}
                <Dialog open={isFormDialogOpen} onOpenChange={(open) => !open && closeFormDialog()}>
                    <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
                        <DialogHeader className="px-5 pt-4 pb-2 border-b border-border bg-muted/20">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                                    {editingUser ? <Edit2 className="size-5" /> : <UserPlus className="size-5" />}
                                </div>
                                <div>
                                    <DialogTitle className="text-lg font-bold">
                                        {editingUser ? `Edit Staf: ${editingUser.name}` : 'Tambah Pengguna & Staf Baru'}
                                    </DialogTitle>
                                    <DialogDescription className="text-xs">
                                        Lengkapi kredensial login, profil pribadi, jabatan kerja, dan data rekening komisi.
                                    </DialogDescription>
                                </div>
                            </div>

                            {/* Tab Switcher Header */}
                            <div className="flex items-center gap-1 pt-2 border-t border-border/50 mt-2.5">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('account')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                        activeTab === 'account'
                                            ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                                >
                                    <KeyRound className="size-3.5" />
                                    <span>1. Akun & Role</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('personal')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                        activeTab === 'personal'
                                            ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                                >
                                    <UserIcon className="size-3.5" />
                                    <span>2. Info Pribadi</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('work')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                        activeTab === 'work'
                                            ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                                >
                                    <Briefcase className="size-3.5" />
                                    <span>3. Data Kerja</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('finance')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                        activeTab === 'finance'
                                            ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                                >
                                    <CreditCard className="size-3.5" />
                                    <span>4. Rekening Bank</span>
                                </button>
                            </div>
                        </DialogHeader>

                        <form onSubmit={handleFormSubmit}>
                            <div className="px-5 pt-3 pb-5 max-h-[60vh] overflow-y-auto space-y-4 custom-scrollbar">
                                {/* TAB 1: AKUN & ROLE */}
                                {activeTab === 'account' && (
                                    <div className="space-y-4 animate-in fade-in-50">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="user-name" className="text-xs font-semibold">
                                                Nama Lengkap <span className="text-destructive">*</span>
                                            </Label>
                                            <div className="relative">
                                                <UserIcon className="size-4 text-muted-foreground absolute left-3 top-2.5" />
                                                <Input
                                                    id="user-name"
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData('name', e.target.value)}
                                                    placeholder="Contoh: Rian Pratama"
                                                    className="pl-9 text-xs"
                                                    required
                                                />
                                            </div>
                                            {formErrors.name && (
                                                <p className="text-xs font-medium text-destructive">{formErrors.name}</p>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="user-email" className="text-xs font-semibold">
                                                Alamat Email Login <span className="text-destructive">*</span>
                                            </Label>
                                            <div className="relative">
                                                <Mail className="size-4 text-muted-foreground absolute left-3 top-2.5" />
                                                <Input
                                                    id="user-email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData('email', e.target.value)}
                                                    placeholder="nama@casanuma.com"
                                                    className="pl-9 text-xs"
                                                    required
                                                />
                                            </div>
                                            {formErrors.email && (
                                                <p className="text-xs font-medium text-destructive">{formErrors.email}</p>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="user-password" className="text-xs font-semibold">
                                                    Password {editingUser ? '(Kosongkan jika tidak diubah)' : <span className="text-destructive">*</span>}
                                                </Label>
                                                {editingUser && (
                                                    <span className="text-[11px] text-muted-foreground">Opsional saat edit</span>
                                                )}
                                            </div>
                                            <div className="relative">
                                                <Lock className="size-4 text-muted-foreground absolute left-3 top-2.5" />
                                                <Input
                                                    id="user-password"
                                                    type="password"
                                                    value={formData.password}
                                                    onChange={(e) => setFormData('password', e.target.value)}
                                                    placeholder={editingUser ? '••••••••' : 'Minimal 8 karakter'}
                                                    className="pl-9 text-xs"
                                                    required={!editingUser}
                                                />
                                            </div>
                                            {formErrors.password && (
                                                <p className="text-xs font-medium text-destructive">{formErrors.password}</p>
                                            )}
                                        </div>

                                        {/* Role Assignment Card Picker */}
                                        <div className="space-y-2 pt-2 border-t border-border/60">
                                            <Label className="text-xs font-semibold">
                                                Pilih Peran Utama (Spatie RBAC) <span className="text-destructive">*</span>
                                            </Label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {availableRoles.map((roleKey) => {
                                                    const isSelected = formData.role === roleKey;
                                                    const info = roleBadges[roleKey] || { label: roleKey };

                                                    return (
                                                        <div
                                                            key={roleKey}
                                                            onClick={() => setFormData('role', roleKey)}
                                                            className={`cursor-pointer rounded-xl border p-3 flex items-start gap-3 transition-all ${
                                                                isSelected
                                                                    ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-xs'
                                                                    : 'border-border/80 bg-card hover:bg-muted/40'
                                                            }`}
                                                        >
                                                            <div className={`size-4 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                                                                isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'
                                                            }`}>
                                                                {isSelected && <div className="size-1.5 rounded-full bg-white" />}
                                                            </div>
                                                            <div className="space-y-0.5">
                                                                <p className="text-xs font-bold text-foreground">{info.label}</p>
                                                                <p className="text-[11px] text-muted-foreground leading-snug">
                                                                    {roleKey === 'superadmin' && 'Akses penuh seluruh sistem & user.'}
                                                                    {roleKey === 'sales_manager' && 'Supervisi tim sales & approval.'}
                                                                    {roleKey === 'sales_agent' && 'Input leads & tanda jadi kavling.'}
                                                                    {roleKey === 'finance' && 'Validasi bayar & berkas KPR.'}
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
                                    </div>
                                )}

                                {/* TAB 2: INFO PRIBADI */}
                                {activeTab === 'personal' && (
                                    <div className="space-y-4 animate-in fade-in-50">
                                        {/* Avatar Upload Dropzone with Crop & Compress */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-xs font-semibold">Foto Profil Staf (Avatar)</Label>
                                                <span className="text-[11px] text-muted-foreground">
                                                    Dilengkapi fitur crop & kompresi otomatis
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-4 p-3.5 rounded-xl border border-dashed border-border bg-muted/20">
                                                {avatarPreview ? (
                                                    <div className="relative group shrink-0">
                                                        <img 
                                                            src={avatarPreview} 
                                                            alt="Avatar Preview" 
                                                            className="size-16 rounded-full object-cover border-2 border-primary shadow-sm"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={handleRemoveAvatar}
                                                            className="absolute -top-1 -right-1 size-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-xs hover:scale-110 transition-transform cursor-pointer"
                                                            title="Hapus foto (Kembali ke inisial)"
                                                        >
                                                            <X className="size-3" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="size-16 rounded-full bg-linear-to-br from-primary/20 to-primary/5 text-primary font-bold text-xl flex items-center justify-center border-2 border-dashed border-primary/30 shrink-0 shadow-2xs">
                                                        {formData.name ? formData.name.charAt(0).toUpperCase() : <UserIcon className="size-6 opacity-40 text-muted-foreground" />}
                                                    </div>
                                                )}

                                                <div className="space-y-1.5 flex-1">
                                                    <input 
                                                        type="file" 
                                                        ref={fileInputRef}
                                                        accept="image/jpeg,image/png,image/jpg"
                                                        onChange={handleFileSelect}
                                                        className="hidden" 
                                                        id="avatar-upload"
                                                    />
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <label 
                                                            htmlFor="avatar-upload"
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-medium cursor-pointer text-foreground shadow-2xs transition-colors"
                                                        >
                                                            <Upload className="size-3.5 text-primary" />
                                                            <span>{avatarPreview ? 'Ganti & Crop Foto' : 'Unggah & Crop Foto'}</span>
                                                        </label>

                                                        {avatarPreview && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={handleRemoveAvatar}
                                                                className="h-7 text-xs text-destructive hover:bg-destructive/10 gap-1 px-2.5"
                                                            >
                                                                <Trash2 className="size-3" />
                                                                <span>Hapus Foto (Gunakan Inisial)</span>
                                                            </Button>
                                                        )}

                                                        {compressedFileSize && (
                                                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                                                <Sparkles className="size-3" />
                                                                <span>Optimal: {formatFileSize(compressedFileSize)}</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                                        Pilih foto dari komputer atau kamera HP (hingga 20MB). Foto dapat di-crop dan otomatis dikompresi menjadi ukuran optimal (&lt; 150 KB).
                                                    </p>
                                                </div>
                                            </div>
                                            {formErrors.avatar && (
                                                <p className="text-xs font-medium text-destructive">{formErrors.avatar}</p>
                                            )}
                                        </div>

                                        {/* No WhatsApp Aktif */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="user-phone" className="text-xs font-semibold">
                                                Nomor WhatsApp Aktif
                                            </Label>
                                            <div className="relative">
                                                <Phone className="size-4 text-emerald-500 absolute left-3 top-2.5" />
                                                <Input
                                                    id="user-phone"
                                                    type="text"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData('phone', e.target.value)}
                                                    placeholder="Contoh: 081234567890"
                                                    className="pl-9 text-xs"
                                                />
                                            </div>
                                            <p className="text-[11px] text-muted-foreground">
                                                Akan digunakan untuk komunikasi tim dan tombol pintasan WhatsApp.
                                            </p>
                                            {formErrors.phone && (
                                                <p className="text-xs font-medium text-destructive">{formErrors.phone}</p>
                                            )}
                                        </div>

                                        {/* Alamat Domisili */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="user-address" className="text-xs font-semibold">
                                                Alamat Domisili / Tempat Tinggal
                                            </Label>
                                            <div className="relative">
                                                <MapPin className="size-4 text-muted-foreground absolute left-3 top-2.5" />
                                                <textarea
                                                    id="user-address"
                                                    value={formData.address}
                                                    onChange={(e) => setFormData('address', e.target.value)}
                                                    placeholder="Contoh: Komplek Larasati Residence Blok B-12, Bandung Barat"
                                                    rows={2}
                                                    className="w-full pl-9 pr-3 py-2 text-xs rounded-md border border-input bg-transparent text-foreground shadow-2xs focus:outline-hidden focus:ring-1 focus:ring-ring"
                                                />
                                            </div>
                                            {formErrors.address && (
                                                <p className="text-xs font-medium text-destructive">{formErrors.address}</p>
                                            )}
                                        </div>

                                        {/* Emergency Contact */}
                                        <div className="p-3.5 rounded-xl border border-border/80 bg-muted/10 space-y-3">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                                <AlertCircle className="size-3.5 text-amber-500" />
                                                <span>Kontak Darurat (Emergency Contact)</span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <Label htmlFor="ec-name" className="text-[11px] text-muted-foreground">
                                                        Nama Kontak Darurat
                                                    </Label>
                                                    <Input
                                                        id="ec-name"
                                                        type="text"
                                                        value={formData.emergency_contact_name}
                                                        onChange={(e) => setFormData('emergency_contact_name', e.target.value)}
                                                        placeholder="Contoh: Ratna Dewi (Istri)"
                                                        className="h-8 text-xs"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label htmlFor="ec-phone" className="text-[11px] text-muted-foreground">
                                                        Nomor Telepon Darurat
                                                    </Label>
                                                    <Input
                                                        id="ec-phone"
                                                        type="text"
                                                        value={formData.emergency_contact_phone}
                                                        onChange={(e) => setFormData('emergency_contact_phone', e.target.value)}
                                                        placeholder="Contoh: 081324567899"
                                                        className="h-8 text-xs"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 3: DATA PEKERJAAN */}
                                {activeTab === 'work' && (
                                    <div className="space-y-4 animate-in fade-in-50">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="emp-id" className="text-xs font-semibold">
                                                    NIK / ID Karyawan
                                                </Label>
                                                <div className="relative">
                                                    <Shield className="size-4 text-muted-foreground absolute left-3 top-2.5" />
                                                    <Input
                                                        id="emp-id"
                                                        type="text"
                                                        value={formData.employee_id}
                                                        onChange={(e) => setFormData('employee_id', e.target.value)}
                                                        placeholder="Contoh: CSN-SLS-008"
                                                        className="pl-9 text-xs font-mono"
                                                    />
                                                </div>
                                                {formErrors.employee_id && (
                                                    <p className="text-xs font-medium text-destructive">{formErrors.employee_id}</p>
                                                )}
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="user-position" className="text-xs font-semibold">
                                                    Jabatan / Posisi Resmi
                                                </Label>
                                                <div className="relative">
                                                    <Briefcase className="size-4 text-muted-foreground absolute left-3 top-2.5" />
                                                    <Input
                                                        id="user-position"
                                                        type="text"
                                                        value={formData.position}
                                                        onChange={(e) => setFormData('position', e.target.value)}
                                                        placeholder="Contoh: Senior Property Advisor"
                                                        className="pl-9 text-xs"
                                                    />
                                                </div>
                                                {formErrors.position && (
                                                    <p className="text-xs font-medium text-destructive">{formErrors.position}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="user-join" className="text-xs font-semibold">
                                                Tanggal Bergabung (Join Date)
                                            </Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        id="user-join"
                                                        type="button"
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal h-9 text-xs pl-3 border-input bg-background",
                                                            !formData.join_date && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 size-4 text-muted-foreground" />
                                                        {formData.join_date ? (
                                                            (() => {
                                                                try {
                                                                    return format(parseISO(formData.join_date), "dd MMMM yyyy", { locale: idLocale });
                                                                } catch {
                                                                    return formData.join_date;
                                                                }
                                                            })()
                                                        ) : (
                                                            <span>Pilih tanggal bergabung</span>
                                                        )}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0 z-50" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={formData.join_date ? parseISO(formData.join_date) : undefined}
                                                        onSelect={(date) => {
                                                            if (date) {
                                                                setFormData('join_date', format(date, 'yyyy-MM-dd'));
                                                            } else {
                                                                setFormData('join_date', '');
                                                            }
                                                        }}
                                                        autoFocus
                                                    />
                                                    {formData.join_date && (
                                                        <div className="p-2 border-t border-border flex justify-end">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-xs h-7 px-2 text-muted-foreground hover:text-destructive"
                                                                onClick={() => setFormData('join_date', '')}
                                                            >
                                                                Hapus Tanggal
                                                            </Button>
                                                        </div>
                                                    )}
                                                </PopoverContent>
                                            </Popover>
                                            {formErrors.join_date && (
                                                <p className="text-xs font-medium text-destructive">{formErrors.join_date}</p>
                                            )}
                                        </div>

                                        {/* Status Akun Toggle Switch */}
                                        <div className="p-4 rounded-xl border border-border/80 bg-muted/20 flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <p className="text-xs font-bold text-foreground">Status Keaktifan Akun</p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    Jika nonaktif, pengguna tidak dapat login ke sistem CRM.
                                                </p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.is_active}
                                                    onChange={(e) => setFormData('is_active', e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-muted peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 4: REKENING BANK */}
                                {activeTab === 'finance' && (
                                    <div className="space-y-4 animate-in fade-in-50">
                                        <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
                                            <CreditCard className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                                            <span>
                                                Data bank ini digunakan bagian Finance untuk pencairan komisi penjualan unit dan reimbursement operasional.
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="bank-name" className="text-xs font-semibold">
                                                Nama Bank
                                            </Label>
                                            <div className="relative">
                                                <Building className="size-4 text-muted-foreground absolute left-3 top-2.5" />
                                                <Input
                                                    id="bank-name"
                                                    type="text"
                                                    value={formData.bank_name}
                                                    onChange={(e) => setFormData('bank_name', e.target.value)}
                                                    placeholder="Contoh: BCA / Mandiri / BNI"
                                                    className="pl-9 text-xs"
                                                />
                                            </div>
                                            {/* Quick Bank Chips */}
                                            <div className="flex flex-wrap gap-1.5 pt-1">
                                                {popularBanks.map((b) => (
                                                    <button
                                                        key={b}
                                                        type="button"
                                                        onClick={() => setFormData('bank_name', b)}
                                                        className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                                                            formData.bank_name === b
                                                                ? 'bg-primary text-primary-foreground border-primary'
                                                                : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                                                        }`}
                                                    >
                                                        {b}
                                                    </button>
                                                ))}
                                            </div>
                                            {formErrors.bank_name && (
                                                <p className="text-xs font-medium text-destructive">{formErrors.bank_name}</p>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="bank-account" className="text-xs font-semibold">
                                                Nomor Rekening
                                            </Label>
                                            <div className="relative">
                                                <CreditCard className="size-4 text-muted-foreground absolute left-3 top-2.5" />
                                                <Input
                                                    id="bank-account"
                                                    type="text"
                                                    value={formData.bank_account_number}
                                                    onChange={(e) => setFormData('bank_account_number', e.target.value)}
                                                    placeholder="Contoh: 8420912345"
                                                    className="pl-9 text-xs font-mono"
                                                />
                                            </div>
                                            {formErrors.bank_account_number && (
                                                <p className="text-xs font-medium text-destructive">{formErrors.bank_account_number}</p>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="bank-holder" className="text-xs font-semibold">
                                                Nama Pemilik Rekening (Sesuai Buku Tabungan)
                                            </Label>
                                            <div className="relative">
                                                <UserIcon className="size-4 text-muted-foreground absolute left-3 top-2.5" />
                                                <Input
                                                    id="bank-holder"
                                                    type="text"
                                                    value={formData.bank_account_holder}
                                                    onChange={(e) => setFormData('bank_account_holder', e.target.value)}
                                                    placeholder="Contoh: Rian Pratama"
                                                    className="pl-9 text-xs"
                                                />
                                            </div>
                                            {formErrors.bank_account_holder && (
                                                <p className="text-xs font-medium text-destructive">{formErrors.bank_account_holder}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Standard DialogFooter with comfortable spacing */}
                            <DialogFooter className="gap-2.5 sm:gap-3 p-4 border-t border-border bg-muted/20">
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
                                    <span>{editingUser ? 'Simpan Perubahan' : 'Buat Profil Staf'}</span>
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* 6. Dialog Modal Crop & Compress Foto Avatar (Powered by react-easy-crop) */}
                <AvatarCropperModal
                    isOpen={isCropperOpen}
                    imageSrc={rawImageSrc}
                    originalFileSize={originalFileSize}
                    onClose={() => {
                        setIsCropperOpen(false);
                        setRawImageSrc(null);
                    }}
                    onCropComplete={handleCropperComplete}
                />

                {/* 7. Dialog Detail Dossier Staf (Modal Profil Lengkap) */}
                <Dialog open={!!userToView} onOpenChange={(open) => !open && setUserToView(null)}>
                    <DialogContent className="sm:max-w-xl p-0 overflow-hidden">
                        {userToView && (
                            <>
                                <DialogHeader className="p-5 pb-4 border-b border-border bg-linear-to-r from-muted/30 to-muted/10">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3.5">
                                            <UserAvatar user={userToView} className="size-14" textClassName="text-lg" />
                                            <div>
                                                <DialogTitle className="text-lg font-bold text-foreground">
                                                    {userToView.name}
                                                </DialogTitle>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                                    <span>{userToView.position || 'Staf Casanuma'}</span>
                                                    <span>•</span>
                                                    <span className="font-mono text-primary font-medium">{userToView.employee_id || 'Tanpa NIK'}</span>
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    {userToView.roles.map(r => (
                                                        <span key={r} className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${roleBadges[r]?.color || 'bg-muted'}`}>
                                                            {roleBadges[r]?.label || r}
                                                        </span>
                                                    ))}
                                                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                                                        userToView.is_active ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-muted text-muted-foreground'
                                                    }`}>
                                                        {userToView.is_active ? '● Aktif' : '○ Nonaktif'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </DialogHeader>

                                <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                    {/* 1. Informasi Kontak & Pribadi */}
                                    <div className="rounded-xl border border-border/80 p-4 space-y-2.5">
                                        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                                            <UserIcon className="size-3.5 text-primary" />
                                            <span>Informasi Pribadi & Kontak</span>
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                                            <div>
                                                <p className="text-[11px] text-muted-foreground">Email Login</p>
                                                <p className="font-medium text-foreground">{userToView.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-[11px] text-muted-foreground">WhatsApp Aktif</p>
                                                {userToView.phone ? (
                                                    <a
                                                        href={`https://wa.me/${cleanWaNumber(userToView.phone)}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                                                    >
                                                        <span>{userToView.phone}</span>
                                                        <ExternalLink className="size-3" />
                                                    </a>
                                                ) : (
                                                    <p className="text-muted-foreground italic">-</p>
                                                )}
                                            </div>
                                            <div className="sm:col-span-2">
                                                <p className="text-[11px] text-muted-foreground">Alamat Tinggal</p>
                                                <p className="font-medium text-foreground">{userToView.address || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[11px] text-muted-foreground">Kontak Darurat</p>
                                                <p className="font-medium text-foreground">{userToView.emergency_contact_name || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[11px] text-muted-foreground">No. Telepon Darurat</p>
                                                <p className="font-medium text-foreground">{userToView.emergency_contact_phone || '-'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. Informasi Kepegawaian */}
                                    <div className="rounded-xl border border-border/80 p-4 space-y-2.5">
                                        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                                            <Briefcase className="size-3.5 text-primary" />
                                            <span>Data Kepegawaian</span>
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                                            <div>
                                                <p className="text-[11px] text-muted-foreground">NIK / ID Karyawan</p>
                                                <p className="font-mono font-semibold text-primary">{userToView.employee_id || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[11px] text-muted-foreground">Jabatan</p>
                                                <p className="font-medium text-foreground">{userToView.position || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[11px] text-muted-foreground">Tanggal Bergabung</p>
                                                <p className="font-medium text-foreground">{userToView.join_date_formatted || userToView.join_date || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[11px] text-muted-foreground">Terdaftar di Sistem</p>
                                                <p className="font-medium text-foreground">{userToView.created_at}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. Data Rekening Komisi */}
                                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2.5">
                                        <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                            <CreditCard className="size-3.5" />
                                            <span>Data Rekening Pencairan Komisi</span>
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                                            <div>
                                                <p className="text-[11px] text-muted-foreground">Nama Bank</p>
                                                <p className="font-bold text-foreground">{userToView.bank_name || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[11px] text-muted-foreground">Nomor Rekening</p>
                                                <p className="font-mono font-semibold text-foreground">{userToView.bank_account_number || '-'}</p>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <p className="text-[11px] text-muted-foreground">Atas Nama Rekening</p>
                                                <p className="font-medium text-foreground">{userToView.bank_account_holder || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter className="gap-2.5 sm:gap-3 p-4 border-t border-border bg-muted/20">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setUserToView(null)}
                                    >
                                        Tutup
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            const u = userToView;
                                            setUserToView(null);
                                            openResetPasswordDialog(u);
                                        }}
                                        className="gap-2 text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400"
                                    >
                                        <KeyRound className="size-3.5" />
                                        <span>Reset Password</span>
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            const u = userToView;
                                            setUserToView(null);
                                            openEditDialog(u);
                                        }}
                                        className="gap-2"
                                    >
                                        <Edit2 className="size-3.5" />
                                        <span>Edit Profil</span>
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </DialogContent>
                </Dialog>

                {/* 8. Dialog Konfirmasi Hapus Pengguna (Standard shadcn Dialog) */}
                <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader className="gap-2">
                            <div className="flex items-center gap-2 text-destructive">
                                <AlertTriangle className="size-5" />
                                <DialogTitle className="text-base font-bold text-destructive">
                                    Konfirmasi Hapus Pengguna
                                </DialogTitle>
                            </div>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Tindakan ini tidak dapat dibatalkan. Akun pengguna dan aksesnya ke sistem CASANUMA CRM akan dihapus secara permanen.
                            </DialogDescription>
                        </DialogHeader>

                        {userToDelete && (
                            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3.5 space-y-2 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Nama:</span>
                                    <span className="font-semibold text-foreground">{userToDelete.name}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Email:</span>
                                    <span className="font-mono text-muted-foreground">{userToDelete.email}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Peran:</span>
                                    <span className="font-medium text-primary uppercase text-[11px]">
                                        {userToDelete.roles.join(', ')}
                                    </span>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="gap-2.5 sm:gap-3 pt-2 border-t border-border">
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

                {/* 9. Dialog Force Reset Password (Superadmin Only - Standard shadcn Dialog) */}
                <Dialog open={!!userToResetPassword} onOpenChange={(open) => !open && setUserToResetPassword(null)}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader className="gap-2">
                            <div className="flex items-center gap-2 text-primary">
                                <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                    <KeyRound className="size-5" />
                                </div>
                                <div>
                                    <DialogTitle className="text-base font-bold">
                                        Reset Password Pengguna
                                    </DialogTitle>
                                    <DialogDescription className="text-xs text-muted-foreground">
                                        Atur password baru untuk staf jika mereka lupa akses login.
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        {userToResetPassword && (
                            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                                <div className="p-3 rounded-xl border border-border/80 bg-muted/20 space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">Nama Pengguna:</span>
                                        <span className="font-semibold text-foreground">{userToResetPassword.name}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">Email Login:</span>
                                        <span className="font-mono text-muted-foreground">{userToResetPassword.email}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">Peran / Role:</span>
                                        <span className="font-semibold uppercase text-[11px] text-primary">{userToResetPassword.roles.join(', ')}</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="reset-new-password" className="text-xs font-semibold">
                                                Password Baru
                                            </Label>
                                            <button
                                                type="button"
                                                onClick={generateRandomPassword}
                                                className="text-[11px] font-medium text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
                                            >
                                                <Sparkles className="size-3" />
                                                <span>Generate Acak</span>
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <Lock className="size-4 text-muted-foreground absolute left-3 top-2.5" />
                                            <Input
                                                id="reset-new-password"
                                                type={showResetPassword ? 'text' : 'password'}
                                                value={resetPasswordData.password}
                                                onChange={(e) => setResetPasswordData({ ...resetPasswordData, password: e.target.value })}
                                                placeholder="Minimal 8 karakter"
                                                className="pl-9 pr-16 text-xs font-mono"
                                            />
                                            <div className="absolute right-1.5 top-1.5 flex items-center gap-1">
                                                {resetPasswordData.password && (
                                                    <button
                                                        type="button"
                                                        onClick={handleCopyPassword}
                                                        title="Salin Password"
                                                        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
                                                    >
                                                        {passwordCopied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => setShowResetPassword(!showResetPassword)}
                                                    title={showResetPassword ? 'Sembunyikan' : 'Lihat'}
                                                    className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
                                                >
                                                    {showResetPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                                                </button>
                                            </div>
                                        </div>
                                        {resetPasswordErrors.password && (
                                            <p className="text-xs font-medium text-destructive">{resetPasswordErrors.password}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="reset-confirm-password" className="text-xs font-semibold">
                                            Konfirmasi Password Baru
                                        </Label>
                                        <div className="relative">
                                            <Lock className="size-4 text-muted-foreground absolute left-3 top-2.5" />
                                            <Input
                                                id="reset-confirm-password"
                                                type={showResetPassword ? 'text' : 'password'}
                                                value={resetPasswordData.password_confirmation}
                                                onChange={(e) => setResetPasswordData({ ...resetPasswordData, password_confirmation: e.target.value })}
                                                placeholder="Ketik ulang password baru"
                                                className="pl-9 text-xs font-mono"
                                            />
                                        </div>
                                        {resetPasswordErrors.password_confirmation && (
                                            <p className="text-xs font-medium text-destructive">{resetPasswordErrors.password_confirmation}</p>
                                        )}
                                    </div>
                                </div>

                                <DialogFooter className="gap-2.5 sm:gap-3 pt-3 border-t border-border">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setUserToResetPassword(null)}
                                        disabled={resetPasswordProcessing}
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={resetPasswordProcessing}
                                        className="gap-2"
                                    >
                                        {resetPasswordProcessing ? (
                                            <>
                                                <Loader2 className="size-3.5 animate-spin" />
                                                <span>Menyimpan...</span>
                                            </>
                                        ) : (
                                            <>
                                                <KeyRound className="size-3.5" />
                                                <span>Simpan Password Baru</span>
                                            </>
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AuthenticatedLayout>
    );
}
