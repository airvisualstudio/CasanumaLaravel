import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useRef, useState, useEffect } from 'react';
import { 
    CheckCircle2, 
    Loader2, 
    Mail, 
    User, 
    Shield, 
    Briefcase, 
    Calendar, 
    Phone, 
    MapPin, 
    AlertCircle, 
    CreditCard, 
    Building, 
    Upload, 
    X, 
    Image as ImageIcon, 
    Sparkles, 
    Lock,
    Save
} from 'lucide-react';
import AvatarCropperModal from '@/Components/AvatarCropperModal';

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
    const primaryRole = user.roles?.[0] || 'sales_agent';
    const roleInfo = roleBadges[primaryRole] || { label: primaryRole, color: 'border-border bg-muted text-foreground', dotColor: 'bg-muted-foreground' };

    // Avatar cropping & compression state
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar_url || null);
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
    const [originalFileSize, setOriginalFileSize] = useState<number>(0);
    const [compressedFileSize, setCompressedFileSize] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, errors, processing, recentlySuccessful } =
        useForm<{
            _method: string;
            name: string;
            email: string;
            avatar: File | null;
            remove_avatar: boolean;
            phone: string;
            address: string;
            emergency_contact_name: string;
            emergency_contact_phone: string;
            bank_name: string;
            bank_account_number: string;
            bank_account_holder: string;
        }>({
            _method: 'patch',
            name: user.name || '',
            email: user.email || '',
            avatar: null,
            remove_avatar: false,
            phone: user.phone || '',
            address: user.address || '',
            emergency_contact_name: user.emergency_contact_name || '',
            emergency_contact_phone: user.emergency_contact_phone || '',
            bank_name: user.bank_name || '',
            bank_account_number: user.bank_account_number || '',
            bank_account_holder: user.bank_account_holder || '',
        });

    // Handle initial file selection for cropping
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setOriginalFileSize(file.size);
        const reader = new FileReader();
        reader.onload = () => {
            setRawImageSrc(reader.result as string);
            setIsCropperOpen(true);
        };
        reader.readAsDataURL(file);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleCropComplete = (croppedFile: File, previewUrl: string, compressedSize: number) => {
        setData('avatar', croppedFile);
        setData('remove_avatar', false);
        setAvatarPreview(previewUrl);
        setCompressedFileSize(compressedSize);
        setIsCropperOpen(false);
    };

    const handleRemoveAvatar = () => {
        setData('avatar', null);
        setData('remove_avatar', true);
        setAvatarPreview(null);
        setCompressedFileSize(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('profile.update'), {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    return (
        <section className={`space-y-8 ${className}`}>
            <header className="space-y-1">
                <h3 className="text-lg font-bold tracking-tight text-foreground font-heading">
                    Informasi Profil & Data Mandiri
                </h3>
                <p className="text-xs text-muted-foreground">
                    Lengkapi data kontak, alamat domisili, serta rekening bank pencairan komisi Anda secara mandiri.
                </p>
            </header>

            {/* 1. READ-ONLY ADMINISTRATIVE SECTION (LOCKED) */}
            <div className="rounded-2xl border border-border/80 bg-muted/20 overflow-hidden shadow-2xs">
                <div className="px-4 py-3 bg-muted/40 border-b border-border/60 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <div className="size-6 rounded-md bg-foreground/10 flex items-center justify-center text-foreground">
                            <Lock className="size-3.5" />
                        </div>
                        <span className="text-xs font-bold text-foreground">
                            Data Penugasan & Akses Sistem (Dikunci)
                        </span>
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground bg-background px-2.5 py-0.5 rounded-full border border-border">
                        Khusus Wewenang Superadmin
                    </span>
                </div>

                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 text-xs">
                    {/* NIK */}
                    <div className="space-y-1">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                            <Shield className="size-3 text-muted-foreground/70" />
                            <span>NIK / ID Staf</span>
                        </span>
                        <p className="font-mono font-bold text-foreground text-xs sm:text-sm">
                            {user.employee_id || <span className="text-muted-foreground italic font-normal text-xs">- Belum diatur -</span>}
                        </p>
                    </div>

                    {/* Jabatan */}
                    <div className="space-y-1">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                            <Briefcase className="size-3 text-muted-foreground/70" />
                            <span>Jabatan Resmi</span>
                        </span>
                        <p className="font-semibold text-foreground text-xs sm:text-sm truncate" title={user.position || undefined}>
                            {user.position || <span className="text-muted-foreground italic font-normal text-xs">- Belum diatur -</span>}
                        </p>
                    </div>

                    {/* Peran Sistem */}
                    <div className="space-y-1">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                            <User className="size-3 text-muted-foreground/70" />
                            <span>Role Sistem</span>
                        </span>
                        <div>
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase ${roleInfo.color}`}>
                                <span className={`size-1.5 rounded-full ${roleInfo.dotColor}`} />
                                <span>{roleInfo.label}</span>
                            </span>
                        </div>
                    </div>

                    {/* Tanggal Join */}
                    <div className="space-y-1">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                            <Calendar className="size-3 text-muted-foreground/70" />
                            <span>Tanggal Bergabung</span>
                        </span>
                        <p className="font-medium text-foreground text-xs sm:text-sm">
                            {user.join_date_formatted || user.join_date || <span className="text-muted-foreground italic text-xs">-</span>}
                        </p>
                    </div>

                    {/* Status Keaktifan */}
                    <div className="space-y-1">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                            <AlertCircle className="size-3 text-muted-foreground/70" />
                            <span>Status Akun</span>
                        </span>
                        <div>
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                user.is_active 
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                                    : 'bg-muted text-muted-foreground border border-border'
                            }`}>
                                <span className={`size-1.5 rounded-full ${user.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'}`} />
                                <span>{user.is_active ? 'Aktif' : 'Nonaktif'}</span>
                            </span>
                        </div>
                    </div>
                </div>

                <div className="px-4 py-2 border-t border-border/50 bg-background/50 text-[11px] text-muted-foreground">
                    💡 Perubahan NIK, Jabatan, Role, dan status akun dikunci dari halaman ini dan hanya dapat diperbarui oleh Super Administrator CRM.
                </div>
            </div>

            {/* 2. EDITABLE PROFILE FORM */}
            <form onSubmit={submit} className="space-y-6">
                {/* Bagian A: Foto Profil & Kredensial */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                        <User className="size-4 text-primary" />
                        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                            Foto Profil & Kontak Personal
                        </h4>
                    </div>

                    {/* Avatar Upload Dropzone with Cropper */}
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold">Foto Profil Anda (Avatar)</Label>
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
                                        title="Hapus foto"
                                    >
                                        <X className="size-3" />
                                    </button>
                                </div>
                            ) : (
                                <div className="size-16 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground shrink-0">
                                    <ImageIcon className="size-6 opacity-40" />
                                </div>
                            )}

                            <div className="space-y-1.5 flex-1">
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    accept="image/jpeg,image/png,image/jpg,image/webp"
                                    onChange={handleFileSelect}
                                    className="hidden" 
                                    id="self-avatar-upload"
                                />
                                <div className="flex flex-wrap items-center gap-2">
                                    <label 
                                        htmlFor="self-avatar-upload"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-medium cursor-pointer text-foreground shadow-2xs transition-colors"
                                    >
                                        <Upload className="size-3.5 text-primary" />
                                        <span>{avatarPreview ? 'Ganti & Crop Foto' : 'Unggah & Crop Foto'}</span>
                                    </label>

                                    {compressedFileSize && (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                            <Sparkles className="size-3" />
                                            <span>Optimal: {formatFileSize(compressedFileSize)}</span>
                                        </span>
                                    )}
                                </div>
                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                    Format: JPG, PNG, atau WebP. Gambar otomatis dipotong persegi lingkaran dan dikompresi menjadi ukuran optimal (&lt; 200KB).
                                </p>
                            </div>
                        </div>
                        {errors.avatar && (
                            <p className="text-xs font-medium text-destructive">{errors.avatar}</p>
                        )}
                    </div>

                    {/* Nama Lengkap & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-xs font-semibold">Nama Lengkap</Label>
                            <div className="relative">
                                <User className="size-4 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
                                <Input
                                    id="name"
                                    className="pl-9 text-xs"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    autoComplete="name"
                                    placeholder="Nama lengkap Anda"
                                />
                            </div>
                            {errors.name && (
                                <p className="text-xs font-medium text-destructive">{errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs font-semibold">Alamat Email</Label>
                            <div className="relative">
                                <Mail className="size-4 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
                                <Input
                                    id="email"
                                    type="email"
                                    className="pl-9 text-xs"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    autoComplete="username"
                                    placeholder="alamat.email@casanuma.com"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-xs font-medium text-destructive">{errors.email}</p>
                            )}
                        </div>
                    </div>

                    {mustVerifyEmail && user.email_verified_at === null && (
                        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400 space-y-2">
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

                    {/* WhatsApp & Alamat */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="phone" className="text-xs font-semibold">
                                Nomor WhatsApp Aktif
                            </Label>
                            <div className="relative">
                                <Phone className="size-4 text-emerald-500 absolute left-3 top-2.5 pointer-events-none" />
                                <Input
                                    id="phone"
                                    type="text"
                                    className="pl-9 text-xs"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="Contoh: 081234567890"
                                />
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                                Digunakan untuk koordinasi operasional tim CRM.
                            </p>
                            {errors.phone && (
                                <p className="text-xs font-medium text-destructive">{errors.phone}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="address" className="text-xs font-semibold">
                                Alamat Domisili
                            </Label>
                            <div className="relative">
                                <MapPin className="size-4 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
                                <Input
                                    id="address"
                                    type="text"
                                    className="pl-9 text-xs"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="Contoh: Jl. Sukajadi No. 45, Bandung"
                                />
                            </div>
                            {errors.address && (
                                <p className="text-xs font-medium text-destructive">{errors.address}</p>
                            )}
                        </div>
                    </div>

                    {/* Kontak Darurat */}
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
                                    value={data.emergency_contact_name}
                                    onChange={(e) => setData('emergency_contact_name', e.target.value)}
                                    placeholder="Contoh: Rina Melati (Istri/Keluarga)"
                                    className="h-8 text-xs"
                                />
                                {errors.emergency_contact_name && (
                                    <p className="text-xs font-medium text-destructive">{errors.emergency_contact_name}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="ec-phone" className="text-[11px] text-muted-foreground">
                                    Nomor Telepon Darurat
                                </Label>
                                <Input
                                    id="ec-phone"
                                    type="text"
                                    value={data.emergency_contact_phone}
                                    onChange={(e) => setData('emergency_contact_phone', e.target.value)}
                                    placeholder="Contoh: 081398765432"
                                    className="h-8 text-xs"
                                />
                                {errors.emergency_contact_phone && (
                                    <p className="text-xs font-medium text-destructive">{errors.emergency_contact_phone}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bagian B: Rekening Bank Pencairan Komisi */}
                <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                        <CreditCard className="size-4 text-amber-500" />
                        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                            Data Rekening Bank (Pencairan Komisi)
                        </h4>
                    </div>

                    <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
                        <CreditCard className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                        <span>
                            Pastikan data rekening bank terisi valid sesuai buku tabungan untuk kelancaran transfer komisi dari bagian Finance.
                        </span>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="self-bank-name" className="text-xs font-semibold">
                            Nama Bank
                        </Label>
                        <div className="relative">
                            <Building className="size-4 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
                            <Input
                                id="self-bank-name"
                                type="text"
                                value={data.bank_name}
                                onChange={(e) => setData('bank_name', e.target.value)}
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
                                    onClick={() => setData('bank_name', b)}
                                    className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
                                        data.bank_name === b
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                                >
                                    {b}
                                </button>
                            ))}
                        </div>
                        {errors.bank_name && (
                            <p className="text-xs font-medium text-destructive">{errors.bank_name}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="self-bank-acc" className="text-xs font-semibold">
                                Nomor Rekening
                            </Label>
                            <div className="relative">
                                <CreditCard className="size-4 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
                                <Input
                                    id="self-bank-acc"
                                    type="text"
                                    value={data.bank_account_number}
                                    onChange={(e) => setData('bank_account_number', e.target.value)}
                                    placeholder="Contoh: 8420912345"
                                    className="pl-9 text-xs font-mono"
                                />
                            </div>
                            {errors.bank_account_number && (
                                <p className="text-xs font-medium text-destructive">{errors.bank_account_number}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="self-bank-holder" className="text-xs font-semibold">
                                Nama Pemilik Rekening
                            </Label>
                            <div className="relative">
                                <User className="size-4 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
                                <Input
                                    id="self-bank-holder"
                                    type="text"
                                    value={data.bank_account_holder}
                                    onChange={(e) => setData('bank_account_holder', e.target.value)}
                                    placeholder="Contoh: NAMA LENGKAP"
                                    className="pl-9 text-xs"
                                />
                            </div>
                            {errors.bank_account_holder && (
                                <p className="text-xs font-medium text-destructive">{errors.bank_account_holder}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Submit Action */}
                <div className="flex items-center gap-4 pt-4 border-t border-border/80">
                    <Button type="submit" disabled={processing} className="gap-2 shadow-xs">
                        {processing ? (
                            <>
                                <Loader2 className="size-3.5 animate-spin" />
                                <span>Menyimpan Perubahan...</span>
                            </>
                        ) : (
                            <>
                                <Save className="size-3.5" />
                                <span>Simpan Profil Saya</span>
                            </>
                        )}
                    </Button>

                    {recentlySuccessful && (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium animate-in fade-in-50">
                            <CheckCircle2 className="size-4" />
                            <span>Perubahan data berhasil disimpan!</span>
                        </span>
                    )}
                </div>
            </form>

            {/* Modal Avatar Cropper */}
            <AvatarCropperModal
                isOpen={isCropperOpen}
                imageSrc={rawImageSrc}
                originalFileSize={originalFileSize}
                onClose={() => setIsCropperOpen(false)}
                onCropComplete={handleCropComplete}
            />
        </section>
    );
}
