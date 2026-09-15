import React, { useState } from 'react';
import { router } from '@inertiajs/react';
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
import { Button } from '@/Components/ui/button';
import { Label } from '@/Components/ui/label';
import { toast } from '@/Components/ui/sonner';
import { AlertTriangle, ArrowRightLeft, Loader2, ShieldAlert, UserCheck, Users } from 'lucide-react';

interface ActiveSalesPerson {
    id: number;
    name: string;
    email: string;
}

interface UserForHandover {
    id: number;
    name: string;
    email: string;
    leads_count?: number;
    roles: string[];
}

interface HandoverLeadsDialogProps {
    user: UserForHandover | null;
    activeSales: ActiveSalesPerson[];
    isOpen: boolean;
    onClose: () => void;
}

export default function HandoverLeadsDialog({
    user,
    activeSales,
    isOpen,
    onClose,
}: HandoverLeadsDialogProps) {
    const [targetSalesId, setTargetSalesId] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    if (!user) return null;

    const availableRecipients = activeSales.filter((s) => s.id !== user.id);
    const leadsCount = user.leads_count ?? 0;

    const handleHandoverAndDeactivate = (reassign: boolean) => {
        if (reassign && !targetSalesId) {
            setErrorMsg('Silakan pilih salah satu sales penerima sebelum melakukan handover.');
            return;
        }

        setErrorMsg(null);
        setIsSubmitting(true);

        router.post(
            route('users.deactivate-and-handover', user.id),
            {
                target_sales_id: reassign ? Number(targetSalesId) : null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSubmitting(false);
                    setTargetSalesId('');
                    onClose();
                    toast.success(
                        reassign
                            ? `Akun ${user.name} berhasil dinonaktifkan & ${leadsCount} prospek dialihkan!`
                            : `Akun ${user.name} dinonaktifkan & prospek dilepas ke Unassigned Pool.`
                    );
                },
                onError: (errors: Record<string, string>) => {
                    setIsSubmitting(false);
                    const err = errors.target_sales_id || errors.error || 'Gagal memproses handover dan penonaktifan.';
                    setErrorMsg(err);
                    toast.error(err);
                },
            }
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader className="gap-2">
                    <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-500">
                        <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                            <ArrowRightLeft className="size-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold text-foreground">
                                Handover Prospek & Nonaktifkan Akun
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Amankan data pelanggan dari sales yang nonaktif atau resign agar penanganan follow-up tidak terputus.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* User Summary Card */}
                    <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Staf Nonaktif:</span>
                            <span className="font-semibold text-foreground">{user.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Email Akun:</span>
                            <span className="font-mono text-muted-foreground">{user.email}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-border/40">
                            <span className="text-muted-foreground flex items-center gap-1">
                                <Users className="size-3.5 text-primary" />
                                <span>Jumlah Prospek Aktif:</span>
                            </span>
                            <span className="font-bold text-sm text-amber-600 dark:text-amber-400">
                                {leadsCount} Konsumen
                            </span>
                        </div>
                    </div>

                    {/* Alert Explanation */}
                    <div className="flex items-start gap-2.5 p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 text-amber-800 dark:text-amber-300 text-xs">
                        <ShieldAlert className="size-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                        <div className="space-y-1">
                            <p className="font-medium">Perlindungan Data Konsumen & Riwayat Transaksi</p>
                            <p className="text-[11px] leading-relaxed text-muted-foreground">
                                Seluruh riwayat chat, booking, dan timeline follow-up masa lalu milik {user.name} tetap utuh di database. Seluruh {leadsCount} prospek aktif akan dialihkan dan dicatat otomatis ke riwayat aktivitas.
                            </p>
                        </div>
                    </div>

                    {/* Target Sales Selection */}
                    {leadsCount > 0 ? (
                        <div className="space-y-2">
                            <Label htmlFor="target-sales-select" className="text-xs font-semibold">
                                Oper Seluruh Prospek ke Sales Aktif:
                            </Label>
                            <Select
                                value={targetSalesId}
                                onValueChange={(val) => {
                                    setTargetSalesId(val);
                                    setErrorMsg(null);
                                }}
                            >
                                <SelectTrigger id="target-sales-select" className="w-full text-xs h-10">
                                    <SelectValue placeholder="Pilih sales aktif penerima prospek..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableRecipients.map((agent) => (
                                        <SelectItem key={agent.id} value={agent.id.toString()}>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{agent.name}</span>
                                                <span className="text-[11px] text-muted-foreground">({agent.email})</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errorMsg && (
                                <p className="text-xs font-medium text-destructive">{errorMsg}</p>
                            )}
                            <p className="text-[11px] text-muted-foreground">
                                Penerima akan mendapatkan notifikasi penyerahan prospek di timeline lead masing-masing.
                            </p>
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground italic">
                            Pengguna ini tidak memiliki prospek aktif saat ini. Anda dapat langsung menonaktifkan akun.
                        </p>
                    )}
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2 pt-3 border-t border-border">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto"
                    >
                        Batal
                    </Button>

                    {leadsCount > 0 && (
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => handleHandoverAndDeactivate(false)}
                            disabled={isSubmitting}
                            className="w-full sm:w-auto text-xs text-muted-foreground hover:text-foreground"
                            title="Lepas prospek ke unassigned pool tanpa sales tertentu"
                        >
                            Nonaktifkan Saja (Lepas ke Pool)
                        </Button>
                    )}

                    <Button
                        type="button"
                        onClick={() => handleHandoverAndDeactivate(leadsCount > 0)}
                        disabled={isSubmitting || (leadsCount > 0 && !targetSalesId)}
                        className="w-full sm:w-auto gap-2 bg-amber-600 hover:bg-amber-700 text-white"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="size-3.5 animate-spin" />
                                <span>Memproses Handover...</span>
                            </>
                        ) : leadsCount > 0 ? (
                            <>
                                <ArrowRightLeft className="size-3.5" />
                                <span>Oper Prospek & Nonaktifkan</span>
                            </>
                        ) : (
                            <>
                                <UserCheck className="size-3.5" />
                                <span>Nonaktifkan Akun</span>
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
