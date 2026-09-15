import React, { useState } from 'react';
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
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import {
    FileText,
    Image as ImageIcon,
    Download,
    CheckCircle2,
    Clock,
    AlertCircle,
    Loader2,
    ShieldCheck,
    X,
    Check,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    ExternalLink,
} from 'lucide-react';
import { useAuthorization } from '@/hooks/useAuthorization';
import { cn } from '@/lib/utils';

export interface CustomerDocumentItem {
    id: number;
    lead_id: number;
    booking_id?: number | null;
    document_type: string;
    document_type_label: string;
    file_name: string;
    file_size: number;
    formatted_file_size: string;
    mime_type: string;
    status: 'pending' | 'verified' | 'rejected';
    rejection_reason?: string | null;
    verified_by?: number | null;
    verified_at?: string | null;
    uploaded_by?: number | null;
    preview_url: string;
    download_url: string;
    created_at?: string;
    uploader?: { id: number; name: string; email: string } | null;
    verifier?: { id: number; name: string; email: string } | null;
}

interface CustomerDocumentPreviewDialogProps {
    open: boolean;
    onClose: () => void;
    document: CustomerDocumentItem | null;
    onStatusChanged?: (updatedDoc: CustomerDocumentItem) => void;
}

export default function CustomerDocumentPreviewDialog({
    open,
    onClose,
    document,
    onStatusChanged,
}: CustomerDocumentPreviewDialogProps) {
    const { isSuperAdmin, isSalesManager, isFinance } = useAuthorization();
    const canValidate = isSuperAdmin || isSalesManager || isFinance;

    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [rejectionError, setRejectionError] = useState('');
    const [zoomLevel, setZoomLevel] = useState(1);

    if (!document) return null;

    const isPdf = document.mime_type.includes('pdf') || document.file_name.toLowerCase().endsWith('.pdf');
    const isImage = document.mime_type.startsWith('image/');

    const handleUpdateStatus = async (newStatus: 'pending' | 'verified' | 'rejected', reason?: string) => {
        if (newStatus === 'rejected' && (!reason || reason.trim().length === 0)) {
            setRejectionError('Alasan penolakan wajib diisi agar pengunggah dapat memperbaikinya.');
            return;
        }

        setIsUpdatingStatus(true);
        setRejectionError('');

        try {
            const csrfToken = (window as any)?.csrfToken ||
                (typeof document !== 'undefined' ? (window.document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content : '');

            const response = await fetch(route('customer-documents.status', document.id), {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({
                    status: newStatus,
                    rejection_reason: newStatus === 'rejected' ? reason : null,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setShowRejectForm(false);
                setRejectionReason('');
                if (onStatusChanged) {
                    onStatusChanged(data.document);
                }
            } else {
                setRejectionError(data.message || 'Gagal memperbarui status berkas.');
            }
        } catch (err: any) {
            setRejectionError('Terjadi kesalahan jaringan saat memperbarui status.');
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const renderStatusBadge = (status: CustomerDocumentItem['status']) => {
        switch (status) {
            case 'verified':
                return (
                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 font-semibold">
                        <CheckCircle2 className="size-3" />
                        Terverifikasi (Valid)
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 gap-1 font-semibold">
                        <AlertCircle className="size-3" />
                        Ditolak
                    </Badge>
                );
            case 'pending':
            default:
                return (
                    <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1 font-semibold">
                        <Clock className="size-3" />
                        Menunggu Verifikasi
                    </Badge>
                );
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="max-w-6xl xl:max-w-7xl w-[96vw] h-[94vh] flex flex-col p-0 overflow-hidden bg-background border-border/80 shadow-2xl">
                {/* Header */}
                <DialogHeader className="px-6 py-4 border-b bg-muted/20 flex-shrink-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                                    {isPdf ? (
                                        <FileText className="size-5 text-red-500" />
                                    ) : (
                                        <ImageIcon className="size-5 text-blue-500" />
                                    )}
                                    {document.document_type_label}
                                </DialogTitle>
                                {renderStatusBadge(document.status)}
                            </div>
                            <DialogDescription className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-foreground/80">{document.file_name}</span>
                                <span>•</span>
                                <span>{document.formatted_file_size}</span>
                                {document.uploader && (
                                    <>
                                        <span>•</span>
                                        <span>Diunggah oleh: <strong className="text-foreground">{document.uploader.name}</strong></span>
                                    </>
                                )}
                            </DialogDescription>
                        </div>

                        {/* Top quick actions */}
                        <div className="flex items-center gap-2">
                            {isImage && (
                                <div className="flex items-center gap-1 border rounded-lg p-0.5 bg-background text-xs">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-7"
                                        onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
                                        title="Perbesar"
                                    >
                                        <ZoomIn className="size-3.5" />
                                    </Button>
                                    <span className="text-[11px] font-mono px-1">{Math.round(zoomLevel * 100)}%</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-7"
                                        onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.5))}
                                        title="Perkecil"
                                    >
                                        <ZoomOut className="size-3.5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-7"
                                        onClick={() => setZoomLevel(1)}
                                        title="Reset Zoom"
                                    >
                                        <RotateCcw className="size-3.5" />
                                    </Button>
                                </div>
                            )}

                            <a
                                href={document.download_url}
                                download
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium bg-background hover:bg-muted transition-colors text-foreground"
                            >
                                <Download className="size-3.5" />
                                Unduh Berkas
                            </a>
                        </div>
                    </div>
                </DialogHeader>

                {/* Rejection Alert Box */}
                {document.status === 'rejected' && document.rejection_reason && (
                    <div className="mx-6 mt-3 p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5 flex-shrink-0">
                        <AlertCircle className="size-4 text-rose-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-semibold">Catatan Penolakan Dokumen:</p>
                            <p className="mt-0.5">{document.rejection_reason}</p>
                            {document.verifier && (
                                <p className="text-[11px] text-muted-foreground mt-1">
                                    Diverifikasi oleh: {document.verifier.name} {document.verified_at && `pada ${new Date(document.verified_at).toLocaleDateString('id-ID')}`}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Main Preview Workspace */}
                <div className="flex-1 p-4 bg-muted/10 overflow-auto flex items-center justify-center">
                    {isPdf ? (
                        <iframe
                            src={document.preview_url}
                            className="w-full h-full rounded-lg border shadow-inner bg-card"
                            title={document.document_type_label}
                        />
                    ) : isImage ? (
                        <div className="w-full h-full overflow-auto flex items-center justify-center p-2">
                            <img
                                src={document.preview_url}
                                alt={document.document_type_label}
                                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
                                className="max-h-full max-w-full object-contain rounded-lg shadow-md transition-transform duration-150"
                            />
                        </div>
                    ) : (
                        <div className="text-center p-8 space-y-3">
                            <FileText className="size-16 mx-auto text-muted-foreground/50" />
                            <p className="text-sm font-medium text-foreground">
                                Format file tidak mendukung pratinjau langsung di browser.
                            </p>
                            <a
                                href={document.download_url}
                                download
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold"
                            >
                                <Download className="size-4" />
                                Unduh untuk Melihat Berkas
                            </a>
                        </div>
                    )}
                </div>

                {/* Reject Form Modal / Expansion */}
                {showRejectForm && (
                    <div className="p-4 border-t bg-rose-500/5 border-rose-500/20 space-y-3 flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                                <AlertCircle className="size-3.5" />
                                Masukkan Alasan Penolakan Berkas:
                            </Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setShowRejectForm(false);
                                    setRejectionError('');
                                }}
                                className="h-6 text-xs text-muted-foreground"
                            >
                                Batal
                            </Button>
                        </div>
                        <Textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Contoh: Foto KTP terpotong dan NIK tidak terbaca jelas. Mohon upload ulang foto KTP asli tanpa pantulan cahaya."
                            className="text-xs min-h-[70px] bg-background"
                        />
                        {rejectionError && (
                            <p className="text-xs text-rose-500 font-medium">{rejectionError}</p>
                        )}
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowRejectForm(false)}
                                className="h-8 text-xs"
                            >
                                Batalkan
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                disabled={isUpdatingStatus}
                                onClick={() => handleUpdateStatus('rejected', rejectionReason)}
                                className="h-8 text-xs gap-1.5"
                            >
                                {isUpdatingStatus ? <Loader2 className="size-3.5 animate-spin" /> : <X className="size-3.5" />}
                                Konfirmasi Penolakan Berkas
                            </Button>
                        </div>
                    </div>
                )}

                {/* Footer with Verification Controls */}
                <DialogFooter className="px-6 py-3 border-t bg-muted/30 flex-shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs text-muted-foreground w-full sm:w-auto text-left">
                        {document.verifier && document.status === 'verified' && (
                            <span className="flex items-center gap-1 text-emerald-600 font-medium">
                                <ShieldCheck className="size-3.5" />
                                Disahkan oleh {document.verifier.name}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        {canValidate && !showRejectForm && (
                            <>
                                {document.status !== 'verified' && (
                                    <Button
                                        size="sm"
                                        disabled={isUpdatingStatus}
                                        onClick={() => handleUpdateStatus('verified')}
                                        className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                    >
                                        {isUpdatingStatus ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                                        Verifikasi Berkas (Sah)
                                    </Button>
                                )}

                                {document.status !== 'rejected' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={isUpdatingStatus}
                                        onClick={() => {
                                            setShowRejectForm(true);
                                            setRejectionReason(document.rejection_reason || '');
                                        }}
                                        className="h-8 text-xs gap-1.5 border-rose-500/30 text-rose-600 hover:bg-rose-500/10"
                                    >
                                        <AlertCircle className="size-3.5" />
                                        Tolak Berkas
                                    </Button>
                                )}

                                {document.status !== 'pending' && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        disabled={isUpdatingStatus}
                                        onClick={() => handleUpdateStatus('pending')}
                                        className="h-8 text-xs text-muted-foreground hover:text-foreground"
                                    >
                                        Reset ke Pending
                                    </Button>
                                )}
                            </>
                        )}

                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={onClose}
                            className="h-8 text-xs"
                        >
                            Tutup Pratinjau
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
