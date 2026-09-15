import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent } from '@/Components/ui/card';
import { Progress } from '@/Components/ui/progress';
import {
    FileText,
    Image as ImageIcon,
    Upload,
    Download,
    Eye,
    Trash2,
    RefreshCw,
    ShieldCheck,
    CheckCircle2,
    Clock,
    AlertCircle,
    Loader2,
    UserCheck,
    Lock,
    FolderLock,
    HelpCircle,
} from 'lucide-react';
import CustomerDocumentPreviewDialog, { CustomerDocumentItem } from './CustomerDocumentPreviewDialog';
import { useAuthorization } from '@/hooks/useAuthorization';
import { cn } from '@/lib/utils';

export interface DocumentSlotConfig {
    type: 'ktp' | 'kk' | 'npwp' | 'buku_nikah' | 'slip_gaji' | 'rek_koran';
    title: string;
    description: string;
    badgeText: string;
    acceptedFormats: string;
}

export const DOCUMENT_SLOTS: DocumentSlotConfig[] = [
    {
        type: 'ktp',
        title: 'KTP (Kartu Tanda Penduduk)',
        description: 'Foto/scan KTP asli pemohon (atau suami-istri) yang masih berlaku.',
        badgeText: 'Wajib',
        acceptedFormats: 'PDF, JPG, PNG (Maks 10MB)',
    },
    {
        type: 'kk',
        title: 'Kartu Keluarga (KK)',
        description: 'Scan Kartu Keluarga terbaru yang mencantumkan nama pemohon.',
        badgeText: 'Wajib',
        acceptedFormats: 'PDF, JPG, PNG (Maks 10MB)',
    },
    {
        type: 'npwp',
        title: 'NPWP (Nomor Pokok Wajib Pajak)',
        description: 'Foto/kartu NPWP pemohon atau bukti validasi perpajakan.',
        badgeText: 'Wajib',
        acceptedFormats: 'PDF, JPG, PNG (Maks 10MB)',
    },
    {
        type: 'buku_nikah',
        title: 'Buku Nikah / Ket. Belum Menikah',
        description: 'Buku nikah lengkap atau surat keterangan belum menikah dari kelurahan.',
        badgeText: 'Pendukung',
        acceptedFormats: 'PDF, JPG, PNG (Maks 10MB)',
    },
    {
        type: 'slip_gaji',
        title: 'Slip Gaji (3 Bulan Terakhir)',
        description: 'Slip gaji resmi dari perusahaan atau surat keterangan penghasilan usaha.',
        badgeText: 'KPR Bank',
        acceptedFormats: 'PDF, JPG, PNG (Maks 10MB)',
    },
    {
        type: 'rek_koran',
        title: 'Rekening Koran (3 Bulan Terakhir)',
        description: 'Rekening koran tabungan aktif mencerminkan mutasi keluar-masuk dana.',
        badgeText: 'KPR Bank',
        acceptedFormats: 'PDF, JPG, PNG (Maks 10MB)',
    },
];

interface CustomerDocumentVaultDialogProps {
    open: boolean;
    onClose: () => void;
    lead: {
        id: number;
        name: string;
        whatsapp?: string | null;
        project?: { name: string } | null;
        sales_id?: number | null;
    } | null;
    bookingId?: number | null;
}

export default function CustomerDocumentVaultDialog({
    open,
    onClose,
    lead,
    bookingId,
}: CustomerDocumentVaultDialogProps) {
    const { isSuperAdmin, isSalesManager, isFinance, isSalesAgent, user } = useAuthorization();
    const canUpload = isSuperAdmin || isSalesManager || isFinance || (isSalesAgent && (!lead?.sales_id || lead?.sales_id === user?.id));

    const [documents, setDocuments] = useState<CustomerDocumentItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);

    // Preview state
    const [previewDoc, setPreviewDoc] = useState<CustomerDocumentItem | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);

    // Delete Confirmation dialog state (shadcn Dialog, NO window.confirm)
    const [deleteTargetDoc, setDeleteTargetDoc] = useState<CustomerDocumentItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // File input refs map
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    // Fetch documents when modal opens or lead changes
    useEffect(() => {
        if (open && lead?.id) {
            fetchDocuments();
        } else {
            setDocuments([]);
            setUploadError(null);
        }
    }, [open, lead?.id]);

    const fetchDocuments = async () => {
        if (!lead?.id) return;
        setIsLoading(true);
        setUploadError(null);
        try {
            const response = await fetch(route('leads.documents.index', lead.id), {
                headers: {
                    'Accept': 'application/json',
                },
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setDocuments(data.documents || []);
            }
        } catch (err) {
            console.error('Failed to load customer documents:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileSelected = async (slotType: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !lead?.id) return;

        // Reset input value so same file can be re-selected if needed
        e.target.value = '';

        // Validation size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setUploadError('Ukuran berkas melebihi batas maksimum 10 MB.');
            return;
        }

        setUploadingSlot(slotType);
        setUploadError(null);

        const formData = new FormData();
        formData.append('document_type', slotType);
        formData.append('file', file);
        if (bookingId) {
            formData.append('booking_id', bookingId.toString());
        }

        const csrfToken = (window as any)?.csrfToken ||
            (typeof document !== 'undefined' ? (window.document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content : '');

        try {
            const response = await fetch(route('leads.documents.store', lead.id), {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Update local document list
                setDocuments((prev) => {
                    const filtered = prev.filter((d) => d.document_type !== slotType);
                    return [...filtered, data.document];
                });
            } else {
                setUploadError(data.message || 'Gagal mengunggah berkas.');
            }
        } catch (err) {
            setUploadError('Terjadi kesalahan jaringan saat mengunggah berkas.');
        } finally {
            setUploadingSlot(null);
        }
    };

    const handleDeleteDocument = async () => {
        if (!deleteTargetDoc) return;
        setIsDeleting(true);

        const csrfToken = (window as any)?.csrfToken ||
            (typeof document !== 'undefined' ? (window.document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content : '');

        try {
            const response = await fetch(route('customer-documents.destroy', deleteTargetDoc.id), {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setDocuments((prev) => prev.filter((d) => d.id !== deleteTargetDoc.id));
                setDeleteTargetDoc(null);
            } else {
                setUploadError(data.message || 'Gagal menghapus berkas.');
            }
        } catch (err) {
            setUploadError('Terjadi kesalahan jaringan saat menghapus berkas.');
        } finally {
            setIsDeleting(false);
        }
    };

    const openPreview = (doc: CustomerDocumentItem) => {
        setPreviewDoc(doc);
        setPreviewOpen(true);
    };

    const handlePreviewStatusChanged = (updatedDoc: CustomerDocumentItem) => {
        setDocuments((prev) =>
            prev.map((d) => (d.id === updatedDoc.id ? updatedDoc : d))
        );
        setPreviewDoc(updatedDoc);
    };

    // Calculate Completion
    const uploadedCount = documents.length;
    const verifiedCount = documents.filter((d) => d.status === 'verified').length;
    const rejectedCount = documents.filter((d) => d.status === 'rejected').length;
    const pendingCount = documents.filter((d) => d.status === 'pending').length;
    const progressPercent = Math.round((uploadedCount / DOCUMENT_SLOTS.length) * 100);

    return (
        <>
            <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
                <DialogContent className="max-w-5xl xl:max-w-6xl w-[95vw] max-h-[92vh] flex flex-col p-0 overflow-hidden bg-background border-border/80 shadow-2xl">
                    {/* Header */}
                    <DialogHeader className="px-6 py-4 border-b bg-muted/20 flex-shrink-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-6">
                            <div>
                                <div className="flex items-center gap-2">
                                    <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                                        <FolderLock className="size-5 text-primary" />
                                        Berkas Dokumen Konsumen (KYC Vault)
                                    </DialogTitle>
                                    <Badge variant="outline" className="text-[11px] gap-1 font-mono bg-background">
                                        <Lock className="size-3 text-emerald-600" />
                                        Private Storage
                                    </Badge>
                                </div>
                                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                    Konsumen: <strong className="text-foreground">{lead?.name}</strong>
                                    {lead?.project?.name && ` • Proyek: ${lead.project.name}`}
                                </DialogDescription>
                            </div>

                            {/* Refresh Button */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchDocuments}
                                disabled={isLoading}
                                className="h-8 text-xs gap-1.5 self-start sm:self-auto"
                            >
                                <RefreshCw className={cn('size-3.5', isLoading && 'animate-spin')} />
                                Segarkan Data
                            </Button>
                        </div>
                    </DialogHeader>

                    {/* KYC Summary Progress Bar */}
                    <div className="px-6 py-3 bg-muted/10 border-b flex-shrink-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs mb-2">
                            <span className="font-semibold text-foreground flex items-center gap-1.5">
                                Progres Kelengkapan Berkas:
                                <strong className="text-primary font-mono">{uploadedCount} dari {DOCUMENT_SLOTS.length} Slot ({progressPercent}%)</strong>
                            </span>
                            <div className="flex items-center gap-2 flex-wrap text-[11px]">
                                <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                                    <CheckCircle2 className="size-3" /> {verifiedCount} Terverifikasi
                                </span>
                                {pendingCount > 0 && (
                                    <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                                        <Clock className="size-3" /> {pendingCount} Pending
                                    </span>
                                )}
                                {rejectedCount > 0 && (
                                    <span className="inline-flex items-center gap-1 text-rose-600 font-medium">
                                        <AlertCircle className="size-3" /> {rejectedCount} Ditolak
                                    </span>
                                )}
                            </div>
                        </div>
                        <Progress value={progressPercent} className="h-2 rounded-full" />
                    </div>

                    {/* Error Banner */}
                    {uploadError && (
                        <div className="mx-6 mt-3 p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-xs flex items-center justify-between gap-2 flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="size-4 flex-shrink-0" />
                                <span>{uploadError}</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setUploadError(null)}
                                className="h-6 px-2 text-xs"
                            >
                                Tutup
                            </Button>
                        </div>
                    )}

                    {/* 6 Document Slots Grid */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
                                <Loader2 className="size-7 animate-spin text-primary" />
                                <span className="text-xs">Memuat daftar berkas dokumen...</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {DOCUMENT_SLOTS.map((slot) => {
                                    const uploadedDoc = documents.find((d) => d.document_type === slot.type);
                                    const isUploadingThis = uploadingSlot === slot.type;
                                    const isPdf = uploadedDoc?.mime_type.includes('pdf') || uploadedDoc?.file_name.toLowerCase().endsWith('.pdf');

                                    return (
                                        <Card
                                            key={slot.type}
                                            className={cn(
                                                'relative overflow-hidden transition-all duration-200 border text-card-foreground',
                                                uploadedDoc?.status === 'verified' && 'border-emerald-500/40 bg-emerald-500/[0.02]',
                                                uploadedDoc?.status === 'rejected' && 'border-rose-500/40 bg-rose-500/[0.02]',
                                                uploadedDoc?.status === 'pending' && 'border-amber-500/40 bg-amber-500/[0.02]',
                                                !uploadedDoc && 'border-border/70 hover:border-primary/40'
                                            )}
                                        >
                                            <CardContent className="p-4 space-y-3">
                                                {/* Card Header */}
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="space-y-0.5">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                                                {uploadedDoc ? (
                                                                    isPdf ? (
                                                                        <FileText className="size-4 text-red-500 flex-shrink-0" />
                                                                    ) : (
                                                                        <ImageIcon className="size-4 text-blue-500 flex-shrink-0" />
                                                                    )
                                                                ) : (
                                                                    <FileText className="size-4 text-muted-foreground/60 flex-shrink-0" />
                                                                )}
                                                                {slot.title}
                                                            </h4>
                                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                                                {slot.badgeText}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-[11px] text-muted-foreground leading-tight">
                                                            {slot.description}
                                                        </p>
                                                    </div>

                                                    {/* Status Badge */}
                                                    {uploadedDoc && (
                                                        <div className="flex-shrink-0">
                                                            {uploadedDoc.status === 'verified' && (
                                                                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] gap-1">
                                                                    <CheckCircle2 className="size-3" />
                                                                    Valid
                                                                </Badge>
                                                            )}
                                                            {uploadedDoc.status === 'rejected' && (
                                                                <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 text-[10px] gap-1">
                                                                    <AlertCircle className="size-3" />
                                                                    Ditolak
                                                                </Badge>
                                                            )}
                                                            {uploadedDoc.status === 'pending' && (
                                                                <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] gap-1">
                                                                    <Clock className="size-3" />
                                                                    Pending
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Rejection Note Warning on Card */}
                                                {uploadedDoc?.status === 'rejected' && uploadedDoc.rejection_reason && (
                                                    <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-600 dark:text-rose-300">
                                                        <span className="font-semibold block">Catatan Penolakan:</span>
                                                        <span className="line-clamp-2">{uploadedDoc.rejection_reason}</span>
                                                    </div>
                                                )}

                                                {/* Uploaded File Details & Actions */}
                                                {uploadedDoc ? (
                                                    <div className="pt-2 border-t flex flex-col gap-2">
                                                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                                            <span className="font-mono truncate max-w-[170px] text-foreground" title={uploadedDoc.file_name}>
                                                                {uploadedDoc.file_name}
                                                            </span>
                                                            <span className="font-mono">{uploadedDoc.formatted_file_size}</span>
                                                        </div>

                                                        {/* Action Buttons Toolbar */}
                                                        <div className="flex items-center justify-between gap-1 pt-1">
                                                            <div className="flex items-center gap-1.5">
                                                                {/* Direct Modal Preview */}
                                                                <Button
                                                                    size="sm"
                                                                    variant="default"
                                                                    onClick={() => openPreview(uploadedDoc)}
                                                                    className="h-7 text-xs px-2.5 gap-1 shadow-sm"
                                                                >
                                                                    <Eye className="size-3.5" />
                                                                    Pratinjau
                                                                </Button>

                                                                {/* Download */}
                                                                <a
                                                                    href={uploadedDoc.download_url}
                                                                    download
                                                                    className="inline-flex items-center gap-1 px-2.5 h-7 rounded-md border text-xs font-medium bg-background hover:bg-muted text-foreground transition-colors"
                                                                >
                                                                    <Download className="size-3.5" />
                                                                    Unduh
                                                                </a>
                                                            </div>

                                                            <div className="flex items-center gap-1">
                                                                {/* Re-upload / Ganti Berkas */}
                                                                {canUpload && (
                                                                    <>
                                                                        <input
                                                                            type="file"
                                                                            ref={(el) => (fileInputRefs.current[slot.type] = el)}
                                                                            onChange={(e) => handleFileSelected(slot.type, e)}
                                                                            accept=".pdf,image/jpeg,image/png,image/webp"
                                                                            className="hidden"
                                                                        />
                                                                        <Button
                                                                            size="icon"
                                                                            variant="ghost"
                                                                            className="size-7 text-muted-foreground hover:text-foreground"
                                                                            disabled={isUploadingThis}
                                                                            onClick={() => fileInputRefs.current[slot.type]?.click()}
                                                                            title="Ganti Berkas / Upload Ulang"
                                                                        >
                                                                            {isUploadingThis ? (
                                                                                <Loader2 className="size-3.5 animate-spin" />
                                                                            ) : (
                                                                                <RefreshCw className="size-3.5" />
                                                                            )}
                                                                        </Button>

                                                                        {/* Delete */}
                                                                        <Button
                                                                            size="icon"
                                                                            variant="ghost"
                                                                            className="size-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                                                                            onClick={() => setDeleteTargetDoc(uploadedDoc)}
                                                                            title="Hapus Berkas Ini"
                                                                        >
                                                                            <Trash2 className="size-3.5" />
                                                                        </Button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    /* Empty Slot Upload Dropzone */
                                                    <div className="pt-2 border-t">
                                                        <input
                                                            type="file"
                                                            ref={(el) => (fileInputRefs.current[slot.type] = el)}
                                                            onChange={(e) => handleFileSelected(slot.type, e)}
                                                            accept=".pdf,image/jpeg,image/png,image/webp"
                                                            className="hidden"
                                                        />
                                                        {canUpload ? (
                                                            <button
                                                                type="button"
                                                                disabled={isUploadingThis}
                                                                onClick={() => fileInputRefs.current[slot.type]?.click()}
                                                                className="w-full border-2 border-dashed rounded-lg p-3 text-center transition-colors border-border/80 hover:border-primary/50 hover:bg-primary/[0.02] cursor-pointer group"
                                                            >
                                                                {isUploadingThis ? (
                                                                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                                                        <Loader2 className="size-4 animate-spin text-primary" />
                                                                        <span>Sedang mengunggah ke private storage...</span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground group-hover:text-foreground">
                                                                        <Upload className="size-4 text-primary group-hover:scale-110 transition-transform" />
                                                                        <span className="font-medium">Klik untuk Upload Berkas</span>
                                                                        <span className="text-[10px] text-muted-foreground/70">({slot.acceptedFormats})</span>
                                                                    </div>
                                                                )}
                                                            </button>
                                                        ) : (
                                                            <p className="text-xs text-muted-foreground italic py-2 text-center">
                                                                Belum ada berkas yang diunggah.
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer Info & Privacy Guarantee */}
                    <DialogFooter className="px-6 py-3 border-t bg-muted/20 flex-shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <ShieldCheck className="size-4 text-emerald-600 flex-shrink-0" />
                            <span>Data pribadi konsumen dilindungi dengan enkripsi private storage internal.</span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClose}
                            className="h-8 text-xs"
                        >
                            Tutup Vault
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Direct Preview Sub-Modal */}
            <CustomerDocumentPreviewDialog
                open={previewOpen}
                onClose={() => {
                    setPreviewOpen(false);
                    setPreviewDoc(null);
                }}
                document={previewDoc}
                onStatusChanged={handlePreviewStatusChanged}
            />

            {/* Delete Confirmation Modal (Standard shadcn Dialog) */}
            <Dialog open={!!deleteTargetDoc} onOpenChange={(val) => !val && setDeleteTargetDoc(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="size-5" />
                            Hapus Berkas Dokumen?
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-1">
                            Apakah Anda yakin ingin menghapus berkas <strong className="text-foreground">{deleteTargetDoc?.document_type_label}</strong> ({deleteTargetDoc?.file_name})? File akan dihapus secara permanen dari private storage.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0 mt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={isDeleting}
                            onClick={() => setDeleteTargetDoc(null)}
                            className="text-xs h-8"
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            disabled={isDeleting}
                            onClick={handleDeleteDocument}
                            className="text-xs h-8 gap-1.5"
                        >
                            {isDeleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                            Ya, Hapus Berkas
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
