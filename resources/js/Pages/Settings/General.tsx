import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import React, { FormEventHandler, useRef, useState, useEffect } from 'react';
import { 
    Settings, 
    Building2, 
    Upload, 
    Trash2, 
    Save, 
    Loader2, 
    CheckCircle2, 
    Sun, 
    Moon, 
    Sparkles, 
    Eye, 
    ShieldCheck, 
    Image as ImageIcon,
    FileImage,
    Globe,
    Info,
    Palette,
    RotateCcw,
    Check,
    LayoutTemplate
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { toast } from '@/Components/ui/sonner';
import { AppSettings } from '@/types';
import { applyBrandTheme } from '@/lib/theme';

interface GeneralSettingsProps {
    settings: AppSettings;
}

const colorPresets = [
    { label: 'Casanuma Rose', hex: '#e11d48' },
    { label: 'Royal Blue', hex: '#2563eb' },
    { label: 'Emerald Green', hex: '#059669' },
    { label: 'Deep Indigo', hex: '#4f46e5' },
    { label: 'Modern Teal', hex: '#0f766e' },
    { label: 'Warm Amber', hex: '#d97706' },
    { label: 'Purple Violet', hex: '#7c3aed' },
    { label: 'Dark Slate', hex: '#334155' },
];

export default function GeneralSettings({ settings }: GeneralSettingsProps) {
    const lightLogoInputRef = useRef<HTMLInputElement>(null);
    const darkLogoInputRef = useRef<HTMLInputElement>(null);
    const faviconInputRef = useRef<HTMLInputElement>(null);
    const loginBgInputRef = useRef<HTMLInputElement>(null);

    // Preview state
    const [lightLogoPreview, setLightLogoPreview] = useState<string | null>(settings.logo_light_url || null);
    const [darkLogoPreview, setDarkLogoPreview] = useState<string | null>(settings.logo_dark_url || null);
    const [faviconPreview, setFaviconPreview] = useState<string | null>(settings.favicon_url || null);
    const [loginBgPreview, setLoginBgPreview] = useState<string | null>(settings.login_background_url || null);

    // Inertia form
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        app_name: settings.app_name || 'CASANUMA CRM',
        company_name: settings.company_name || 'PT Casanuma Modern Living',
        app_description: settings.app_description || '',
        primary_color: settings.primary_color || '',
        logo_light: null as File | null,
        logo_dark: null as File | null,
        favicon: null as File | null,
        login_background: null as File | null,
        remove_logo_light: false,
        remove_logo_dark: false,
        remove_favicon: false,
        remove_login_background: false,
        remove_primary_color: false,
    });

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        type: 'logo_light' | 'logo_dark' | 'favicon' | 'login_background'
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Size check: login_bg max 4MB, favicon 1MB, logos 2MB
        const maxSize = type === 'login_background' ? 4 * 1024 * 1024 : (type === 'favicon' ? 1 * 1024 * 1024 : 2 * 1024 * 1024);
        if (file.size > maxSize) {
            toast.error(`Ukuran file melebihi batas maksimal (${type === 'login_background' ? '4MB' : (type === 'favicon' ? '1MB' : '2MB')}).`);
            e.target.value = '';
            return;
        }

        const previewUrl = URL.createObjectURL(file);

        if (type === 'logo_light') {
            setData((prev) => ({ ...prev, logo_light: file, remove_logo_light: false }));
            setLightLogoPreview(previewUrl);
        } else if (type === 'logo_dark') {
            setData((prev) => ({ ...prev, logo_dark: file, remove_logo_dark: false }));
            setDarkLogoPreview(previewUrl);
        } else if (type === 'favicon') {
            setData((prev) => ({ ...prev, favicon: file, remove_favicon: false }));
            setFaviconPreview(previewUrl);
        } else if (type === 'login_background') {
            setData((prev) => ({ ...prev, login_background: file, remove_login_background: false }));
            setLoginBgPreview(previewUrl);
        }
    };

    const handleRemoveFile = (type: 'logo_light' | 'logo_dark' | 'favicon' | 'login_background') => {
        if (type === 'logo_light') {
            setData((prev) => ({ ...prev, logo_light: null, remove_logo_light: true }));
            setLightLogoPreview(null);
            if (lightLogoInputRef.current) lightLogoInputRef.current.value = '';
        } else if (type === 'logo_dark') {
            setData((prev) => ({ ...prev, logo_dark: null, remove_logo_dark: true }));
            setDarkLogoPreview(null);
            if (darkLogoInputRef.current) darkLogoInputRef.current.value = '';
        } else if (type === 'favicon') {
            setData((prev) => ({ ...prev, favicon: null, remove_favicon: true }));
            setFaviconPreview(null);
            if (faviconInputRef.current) faviconInputRef.current.value = '';
        } else if (type === 'login_background') {
            setData((prev) => ({ ...prev, login_background: null, remove_login_background: true }));
            setLoginBgPreview(null);
            if (loginBgInputRef.current) loginBgInputRef.current.value = '';
        }
    };

    const handleSelectColorPreset = (hex: string) => {
        setData((prev) => ({ ...prev, primary_color: hex, remove_primary_color: false }));
        applyBrandTheme(hex);
    };

    const handleResetColor = () => {
        setData((prev) => ({ ...prev, primary_color: '', remove_primary_color: true }));
        applyBrandTheme(null);
    };

    const handleColorInput = (hex: string) => {
        setData('primary_color', hex);
        if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
            applyBrandTheme(hex);
        }
    };

    useEffect(() => {
        if (settings.primary_color || settings.primary_hsl) {
            applyBrandTheme(settings.primary_color || settings.primary_hsl);
        }
    }, [settings.primary_color, settings.primary_hsl]);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('settings.general.update'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                applyBrandTheme(data.primary_color || null);
                toast.success('Pengaturan identitas aplikasi & branding berhasil disimpan!');
            },
            onError: () => {
                toast.error('Gagal menyimpan pengaturan. Silakan periksa kembali formulir.');
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Branding & Identitas Aplikasi - ${data.app_name || 'CASANUMA CRM'}`} />

            <div className="space-y-6 pb-12">
                {/* 1. Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-border/60">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                                <Settings className="size-4" />
                            </div>
                            <h1 className="text-xl font-bold tracking-tight text-foreground font-heading">
                                Pengaturan Umum & Branding
                            </h1>
                            <Badge variant="outline" className="text-[10px] font-semibold border-primary/30 text-primary bg-primary/5">
                                Whitelabeling
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Kelola identitas visual, warna tema brand, logo mode terang/gelap, favicon, serta background banner halaman login.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="gap-1 font-mono text-xs">
                            <ShieldCheck className="size-3.5 text-primary" />
                            <span>Role: Superadmin</span>
                        </Badge>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left 2 Columns: Settings Form Inputs */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Card 1: Informasi Dasar Aplikasi */}
                            <Card className="border-border/80 shadow-xs">
                                <CardHeader className="p-5 pb-4 border-b border-border/50 bg-muted/10">
                                    <div className="flex items-center gap-2.5">
                                        <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                            <Building2 className="size-4" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm font-bold text-foreground">
                                                Identitas Aplikasi & Perusahaan
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                                Informasi ini akan muncul di seluruh header, title browser, sidebar, dan dokumen resmi.
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-5 space-y-4">
                                    {/* Nama Aplikasi */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="app_name" className="text-xs font-semibold">
                                            Nama Aplikasi / Portal CRM <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="app_name"
                                            value={data.app_name}
                                            onChange={(e) => setData('app_name', e.target.value)}
                                            placeholder="Contoh: CASANUMA CRM"
                                            className="text-xs font-medium"
                                            required
                                        />
                                        {errors.app_name && (
                                            <p className="text-xs font-medium text-destructive">{errors.app_name}</p>
                                        )}
                                        <p className="text-[11px] text-muted-foreground">
                                            Ditampilkan pada Title Tab Browser, Header Sidebar, dan Halaman Login.
                                        </p>
                                    </div>

                                    {/* Nama Perusahaan / PT */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="company_name" className="text-xs font-semibold">
                                            Nama Perusahaan / Developer Properti <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="company_name"
                                            value={data.company_name}
                                            onChange={(e) => setData('company_name', e.target.value)}
                                            placeholder="Contoh: PT Casanuma Modern Living"
                                            className="text-xs"
                                            required
                                        />
                                        {errors.company_name && (
                                            <p className="text-xs font-medium text-destructive">{errors.company_name}</p>
                                        )}
                                        <p className="text-[11px] text-muted-foreground">
                                            Nama entitas pengembang atau developer yang tertera di footer dan copyright.
                                        </p>
                                    </div>

                                    {/* Deskripsi Singkat */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="app_description" className="text-xs font-semibold">
                                            Deskripsi Singkat Sistem
                                        </Label>
                                        <Textarea
                                            id="app_description"
                                            value={data.app_description}
                                            onChange={(e) => setData('app_description', e.target.value)}
                                            placeholder="Contoh: Sistem Manajemen Penjualan Kavling & Properti Terpadu"
                                            className="text-xs min-h-20"
                                            rows={3}
                                        />
                                        {errors.app_description && (
                                            <p className="text-xs font-medium text-destructive">{errors.app_description}</p>
                                        )}
                                        <p className="text-[11px] text-muted-foreground">
                                            Deskripsi pendukung yang ditampilkan di bawah form login dan banner samping.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Card 2: Primary Brand Color (Color Picker) */}
                            <Card className="border-border/80 shadow-xs">
                                <CardHeader className="p-5 pb-4 border-b border-border/50 bg-muted/10">
                                    <div className="flex items-center gap-2.5">
                                        <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                            <Palette className="size-4" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm font-bold text-foreground">
                                                Warna Utama Brand (Primary Color)
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                                Ubah warna aksen brand secara menyeluruh di seluruh tombol, badge, link, dan sidebar CRM.
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-5 space-y-4">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                        {/* Color Picker Box */}
                                        <div className="flex items-center gap-3">
                                            <div className="relative size-12 rounded-xl border-2 border-border/80 shadow-xs overflow-hidden flex items-center justify-center cursor-pointer shrink-0">
                                                <input
                                                    type="color"
                                                    value={data.primary_color || '#e11d48'}
                                                    onChange={(e) => handleColorInput(e.target.value)}
                                                    className="absolute -inset-2 size-16 cursor-pointer opacity-0"
                                                    id="primary_color_picker"
                                                />
                                                <div 
                                                    className="size-full rounded-lg"
                                                    style={{ backgroundColor: data.primary_color || '#e11d48' }}
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <Label htmlFor="primary_color_input" className="text-xs font-semibold">
                                                    Kode Warna (HEX)
                                                </Label>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        id="primary_color_input"
                                                        value={data.primary_color}
                                                        onChange={(e) => handleColorInput(e.target.value)}
                                                        placeholder="#e11d48 (Default)"
                                                        className="w-36 text-xs font-mono uppercase"
                                                    />
                                                    {data.primary_color && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={handleResetColor}
                                                            className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1 px-2"
                                                            title="Kembalikan ke warna default tema"
                                                        >
                                                            <RotateCcw className="size-3" />
                                                            <span>Reset Default</span>
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {errors.primary_color && (
                                        <p className="text-xs font-medium text-destructive">{errors.primary_color}</p>
                                    )}

                                    {/* Palette Presets */}
                                    <div className="space-y-1.5 pt-1">
                                        <p className="text-[11px] font-semibold text-muted-foreground">
                                            Pilihan Warna Brand Populer:
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {colorPresets.map((preset) => (
                                                <button
                                                    key={preset.hex}
                                                    type="button"
                                                    onClick={() => handleSelectColorPreset(preset.hex)}
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                                                        data.primary_color?.toLowerCase() === preset.hex.toLowerCase()
                                                            ? 'border-foreground shadow-xs ring-2 ring-primary/30 font-bold'
                                                            : 'border-border/80 hover:border-foreground/50'
                                                    }`}
                                                >
                                                    <span 
                                                        className="size-3 rounded-full border border-black/20"
                                                        style={{ backgroundColor: preset.hex }}
                                                    />
                                                    <span>{preset.label}</span>
                                                    {data.primary_color?.toLowerCase() === preset.hex.toLowerCase() && (
                                                        <Check className="size-3 text-primary ml-0.5" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
                                        💡 Sistem otomatis mengatur kontras teks tombol (hitam/putih) agar selalu nyaman dibaca sesuai standar aksesibilitas WCAG.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Card 3: Visual Assets (Logo & Favicon) */}
                            <Card className="border-border/80 shadow-xs">
                                <CardHeader className="p-5 pb-4 border-b border-border/50 bg-muted/10">
                                    <div className="flex items-center gap-2.5">
                                        <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                            <FileImage className="size-4" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm font-bold text-foreground">
                                                Logo Aplikasi & Favicon Browser
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                                Upload logo dalam varian mode terang (Light) dan gelap (Dark) untuk visibilitas optimal.
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-5 space-y-6">
                                    {/* Logo Light Mode */}
                                    <div className="space-y-2 p-4 rounded-xl border border-border/70 bg-muted/5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                                                <Sun className="size-4 text-amber-500" />
                                                <span>Logo Mode Terang (Light Mode)</span>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground font-mono">
                                                Maks. 2MB (PNG, SVG, JPG, WebP)
                                            </span>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                                            <div className="size-24 rounded-xl bg-white border border-zinc-200 flex items-center justify-center p-2 shadow-xs shrink-0">
                                                {lightLogoPreview ? (
                                                    <img
                                                        src={lightLogoPreview}
                                                        alt="Logo Light Preview"
                                                        className="max-h-full max-w-full object-contain"
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center text-zinc-400 text-center">
                                                        <ImageIcon className="size-6 mb-1 opacity-60" />
                                                        <span className="text-[9px]">Default Logo</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 space-y-2 text-center sm:text-left">
                                                <input
                                                    type="file"
                                                    ref={lightLogoInputRef}
                                                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                                                    onChange={(e) => handleFileChange(e, 'logo_light')}
                                                    className="hidden"
                                                    id="logo_light_input"
                                                />
                                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => lightLogoInputRef.current?.click()}
                                                        className="h-8 text-xs gap-1.5"
                                                    >
                                                        <Upload className="size-3.5" />
                                                        <span>{lightLogoPreview ? 'Ganti Logo Light' : 'Pilih Logo Light'}</span>
                                                    </Button>

                                                    {lightLogoPreview && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemoveFile('logo_light')}
                                                            className="h-8 text-xs text-destructive hover:bg-destructive/10 gap-1 px-2.5"
                                                        >
                                                            <Trash2 className="size-3" />
                                                            <span>Hapus (Gunakan Default)</span>
                                                        </Button>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-muted-foreground">
                                                    Disarankan berlatar belakang transparan (format PNG atau SVG) dengan orientasi horizontal.
                                                </p>
                                                {errors.logo_light && (
                                                    <p className="text-xs font-medium text-destructive">{errors.logo_light}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Logo Dark Mode */}
                                    <div className="space-y-2 p-4 rounded-xl border border-border/70 bg-muted/5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                                                <Moon className="size-4 text-indigo-400" />
                                                <span>Logo Mode Gelap (Dark Mode)</span>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground font-mono">
                                                Maks. 2MB (PNG, SVG, JPG, WebP)
                                            </span>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                                            <div className="size-24 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center p-2 shadow-xs shrink-0">
                                                {darkLogoPreview ? (
                                                    <img
                                                        src={darkLogoPreview}
                                                        alt="Logo Dark Preview"
                                                        className="max-h-full max-w-full object-contain"
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center text-zinc-500 text-center">
                                                        <ImageIcon className="size-6 mb-1 opacity-60" />
                                                        <span className="text-[9px]">Default Logo</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 space-y-2 text-center sm:text-left">
                                                <input
                                                    type="file"
                                                    ref={darkLogoInputRef}
                                                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                                                    onChange={(e) => handleFileChange(e, 'logo_dark')}
                                                    className="hidden"
                                                    id="logo_dark_input"
                                                />
                                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => darkLogoInputRef.current?.click()}
                                                        className="h-8 text-xs gap-1.5"
                                                    >
                                                        <Upload className="size-3.5" />
                                                        <span>{darkLogoPreview ? 'Ganti Logo Dark' : 'Pilih Logo Dark'}</span>
                                                    </Button>

                                                    {darkLogoPreview && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemoveFile('logo_dark')}
                                                            className="h-8 text-xs text-destructive hover:bg-destructive/10 gap-1 px-2.5"
                                                        >
                                                            <Trash2 className="size-3" />
                                                            <span>Hapus (Gunakan Default)</span>
                                                        </Button>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-muted-foreground">
                                                    Gunakan logo dengan grafis terang (putih/emas/aksen cerah) agar kontras di latar gelap.
                                                </p>
                                                {errors.logo_dark && (
                                                    <p className="text-xs font-medium text-destructive">{errors.logo_dark}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Favicon Browser */}
                                    <div className="space-y-2 p-4 rounded-xl border border-border/70 bg-muted/5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                                                <Globe className="size-4 text-emerald-500" />
                                                <span>Favicon Tab Browser</span>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground font-mono">
                                                Maks. 1MB (ICO, PNG, SVG)
                                            </span>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                                            <div className="size-16 rounded-xl bg-card border border-border flex items-center justify-center p-2 shadow-xs shrink-0">
                                                {faviconPreview ? (
                                                    <img
                                                        src={faviconPreview}
                                                        alt="Favicon Preview"
                                                        className="size-8 object-contain"
                                                    />
                                                ) : (
                                                    <div 
                                                        className="size-8 rounded-lg font-bold text-xs flex items-center justify-center text-white"
                                                        style={{ backgroundColor: data.primary_color || '#e11d48' }}
                                                    >
                                                        {data.app_name ? data.app_name.charAt(0).toUpperCase() : 'C'}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 space-y-2 text-center sm:text-left">
                                                <input
                                                    type="file"
                                                    ref={faviconInputRef}
                                                    accept="image/x-icon,image/png,image/svg+xml"
                                                    onChange={(e) => handleFileChange(e, 'favicon')}
                                                    className="hidden"
                                                    id="favicon_input"
                                                />
                                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => faviconInputRef.current?.click()}
                                                        className="h-8 text-xs gap-1.5"
                                                    >
                                                        <Upload className="size-3.5" />
                                                        <span>{faviconPreview ? 'Ganti Favicon' : 'Pilih Favicon'}</span>
                                                    </Button>

                                                    {faviconPreview && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemoveFile('favicon')}
                                                            className="h-8 text-xs text-destructive hover:bg-destructive/10 gap-1 px-2.5"
                                                        >
                                                            <Trash2 className="size-3" />
                                                            <span>Hapus</span>
                                                        </Button>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-muted-foreground">
                                                    Ikon kecil persegi (16×16 atau 32×32 piksel) yang tampil di tab navigasi peramban web.
                                                </p>
                                                {errors.favicon && (
                                                    <p className="text-xs font-medium text-destructive">{errors.favicon}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Card 4: Background Halaman Login (Side Banner) */}
                            <Card className="border-border/80 shadow-xs">
                                <CardHeader className="p-5 pb-4 border-b border-border/50 bg-muted/10">
                                    <div className="flex items-center gap-2.5">
                                        <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                            <LayoutTemplate className="size-4" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm font-bold text-foreground">
                                                Background & Banner Sisi Samping Login
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                                Upload foto arsitektur perumahan atau kavling untuk ditampilkan di sisi samping card login (layout split-screen desktop).
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-5 space-y-4">
                                    <div className="space-y-2 p-4 rounded-xl border border-border/70 bg-muted/5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                                                <ImageIcon className="size-4 text-primary" />
                                                <span>Gambar Banner / Hero Login</span>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground font-mono">
                                                Maks. 4MB (JPG, PNG, WebP)
                                            </span>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                                            {/* Preview Box Banner */}
                                            <div className="w-full sm:w-44 h-28 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden shadow-xs shrink-0 relative">
                                                {loginBgPreview ? (
                                                    <>
                                                        <img
                                                            src={loginBgPreview}
                                                            alt="Login Banner Preview"
                                                            className="size-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2">
                                                            <span className="text-[9px] text-white font-medium">Split Banner Aktif</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center text-zinc-500 text-center p-2">
                                                        <ImageIcon className="size-6 mb-1 opacity-60" />
                                                        <span className="text-[9px]">Belum Ada Gambar Banner</span>
                                                        <span className="text-[8px] text-zinc-600">(Mode Standar Centered)</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 space-y-2 text-center sm:text-left">
                                                <input
                                                    type="file"
                                                    ref={loginBgInputRef}
                                                    accept="image/png,image/jpeg,image/webp"
                                                    onChange={(e) => handleFileChange(e, 'login_background')}
                                                    className="hidden"
                                                    id="login_background_input"
                                                />
                                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => loginBgInputRef.current?.click()}
                                                        className="h-8 text-xs gap-1.5"
                                                    >
                                                        <Upload className="size-3.5" />
                                                        <span>{loginBgPreview ? 'Ganti Banner Login' : 'Pilih Gambar Banner'}</span>
                                                    </Button>

                                                    {loginBgPreview && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemoveFile('login_background')}
                                                            className="h-8 text-xs text-destructive hover:bg-destructive/10 gap-1 px-2.5"
                                                        >
                                                            <Trash2 className="size-3" />
                                                            <span>Hapus Banner</span>
                                                        </Button>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                                    Disarankan menggunakan foto perumahan/kavling beresolusi tinggi (min. 1200×900 px) dengan orientasi landscape atau portrait.
                                                </p>
                                                {errors.login_background && (
                                                    <p className="text-xs font-medium text-destructive">{errors.login_background}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right 1 Column: Live Preview & Submit Card */}
                        <div className="space-y-6">
                            {/* Live Preview Card */}
                            <Card className="border-border/80 shadow-xs sticky top-20">
                                <CardHeader className="p-4 pb-3 border-b border-border/50 bg-muted/10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Eye className="size-4 text-primary" />
                                            <CardTitle className="text-xs font-bold uppercase tracking-wider">
                                                Pratinjau Tampilan (Live)
                                            </CardTitle>
                                        </div>
                                        <Badge variant="outline" className="text-[9px] font-mono">
                                            Simulasi
                                        </Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-4 space-y-4">
                                    {/* Preview 1: Sidebar Header in Dark Mode */}
                                    <div className="space-y-1.5">
                                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                            <Moon className="size-3 text-indigo-400" />
                                            <span>Sidebar Header (Dark Mode)</span>
                                        </span>
                                        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white flex items-center gap-2.5">
                                            {darkLogoPreview ? (
                                                <img src={darkLogoPreview} alt="Preview Dark" className="h-7 w-auto max-w-[100px] object-contain" />
                                            ) : (
                                                <div 
                                                    className="size-8 rounded-lg text-white flex items-center justify-center font-bold text-xs shrink-0"
                                                    style={{ backgroundColor: data.primary_color || '#e11d48' }}
                                                >
                                                    <Building2 className="size-4" />
                                                </div>
                                            )}
                                            <div className="truncate">
                                                <p className="font-extrabold text-xs tracking-tight truncate">
                                                    {data.app_name || 'CASANUMA CRM'}
                                                </p>
                                                <p className="text-[9px] text-zinc-400 truncate">
                                                    {data.company_name || 'PT Casanuma Modern Living'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Preview 2: Sidebar Header in Light Mode */}
                                    <div className="space-y-1.5">
                                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                            <Sun className="size-3 text-amber-500" />
                                            <span>Sidebar Header (Light Mode)</span>
                                        </span>
                                        <div className="p-3 rounded-xl bg-white border border-zinc-200 text-zinc-900 flex items-center gap-2.5 shadow-2xs">
                                            {lightLogoPreview ? (
                                                <img src={lightLogoPreview} alt="Preview Light" className="h-7 w-auto max-w-[100px] object-contain" />
                                            ) : (
                                                <div 
                                                    className="size-8 rounded-lg text-white flex items-center justify-center font-bold text-xs shrink-0"
                                                    style={{ backgroundColor: data.primary_color || '#e11d48' }}
                                                >
                                                    <Building2 className="size-4" />
                                                </div>
                                            )}
                                            <div className="truncate">
                                                <p className="font-extrabold text-xs tracking-tight truncate">
                                                    {data.app_name || 'CASANUMA CRM'}
                                                </p>
                                                <p className="text-[9px] text-zinc-500 truncate">
                                                    {data.company_name || 'PT Casanuma Modern Living'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Preview 3: Login Split-Screen Banner Mockup */}
                                    <div className="space-y-1.5">
                                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                            <LayoutTemplate className="size-3 text-primary" />
                                            <span>Simulasi Halaman Login (Desktop)</span>
                                        </span>
                                        <div className="h-24 rounded-xl border border-border/80 overflow-hidden flex shadow-xs">
                                            {/* Side Banner Mock */}
                                            <div className="w-1/2 relative bg-zinc-950 flex flex-col justify-between p-2 text-white overflow-hidden">
                                                {loginBgPreview ? (
                                                    <img src={loginBgPreview} alt="Banner Mock" className="absolute inset-0 size-full object-cover opacity-60" />
                                                ) : (
                                                    <div 
                                                        className="absolute inset-0 opacity-40" 
                                                        style={{ backgroundColor: data.primary_color || '#e11d48' }}
                                                    />
                                                )}
                                                <div className="relative z-10 text-[8px] font-bold truncate">
                                                    {data.app_name || 'CASANUMA'}
                                                </div>
                                                <div className="relative z-10 text-[7px] text-zinc-300 leading-tight truncate">
                                                    {loginBgPreview ? 'Side Banner Aktif' : 'Default Glow'}
                                                </div>
                                            </div>

                                            {/* Login Form Mock */}
                                            <div className="w-1/2 bg-card p-2 flex flex-col items-center justify-center text-center space-y-1">
                                                <div className="size-3 rounded-full bg-primary/20" />
                                                <span className="text-[8px] font-semibold">Masuk CRM</span>
                                                <div 
                                                    className="w-12 h-2 rounded text-[6px] text-white flex items-center justify-center font-bold"
                                                    style={{ backgroundColor: data.primary_color || '#e11d48' }}
                                                >
                                                    Login
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Preview 4: Browser Tab Mockup */}
                                    <div className="space-y-1.5">
                                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                            <Globe className="size-3 text-emerald-500" />
                                            <span>Browser Tab Simulation</span>
                                        </span>
                                        <div className="p-2 rounded-lg bg-muted/40 border border-border/80 flex items-center gap-2 text-xs">
                                            <div className="size-4 rounded-xs flex items-center justify-center shrink-0">
                                                {faviconPreview ? (
                                                    <img src={faviconPreview} alt="Favicon" className="size-3.5 object-contain" />
                                                ) : (
                                                    <span 
                                                        className="size-3 rounded-full block" 
                                                        style={{ backgroundColor: data.primary_color || '#e11d48' }}
                                                    />
                                                )}
                                            </div>
                                            <span className="text-[11px] font-medium text-foreground truncate">
                                                Dashboard - {data.app_name || 'CASANUMA CRM'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="pt-3 border-t border-border/60 space-y-2">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full gap-2 shadow-xs font-semibold"
                                            style={{ backgroundColor: data.primary_color || undefined }}
                                        >
                                            {processing ? (
                                                <>
                                                    <Loader2 className="size-3.5 animate-spin" />
                                                    <span>Menyimpan Pengaturan...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="size-3.5" />
                                                    <span>Simpan Perubahan Branding</span>
                                                </>
                                            )}
                                        </Button>

                                        {recentlySuccessful && (
                                            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1.5 font-medium animate-in fade-in-50">
                                                <CheckCircle2 className="size-3.5 shrink-0" />
                                                <span>Pengaturan branding berhasil diperbarui!</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 text-[11px] text-muted-foreground flex items-start gap-2">
                                        <Info className="size-4 text-primary shrink-0 mt-0.5" />
                                        <p className="leading-relaxed">
                                            Warna dan branding baru otomatis langsung aktif di seluruh sistem begitu disimpan tanpa perlu kompilasi ulang.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
