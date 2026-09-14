import React, { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { 
    Crop as CropIcon, 
    ZoomIn, 
    ZoomOut, 
    RotateCcw, 
    Sparkles, 
    Check, 
    Loader2 
} from 'lucide-react';

interface AvatarCropperModalProps {
    isOpen: boolean;
    imageSrc: string | null;
    originalFileSize?: number;
    onClose: () => void;
    onCropComplete: (file: File, previewUrl: string, compressedSize: number) => void;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });

async function getCroppedImg(
    imageSrc: string,
    pixelCrop: Area,
    outputSize = 512,
    quality = 0.85
): Promise<{ blob: Blob; file: File }> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Canvas 2D context not available');
    }

    canvas.width = outputSize;
    canvas.height = outputSize;

    // Smooth image rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        outputSize,
        outputSize
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    reject(new Error('Canvas rendering failed'));
                    return;
                }
                const file = new File([blob], 'avatar.jpg', {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                });
                resolve({ blob, file });
            },
            'image/jpeg',
            quality
        );
    });
}

const formatBytes = (bytes: number) => {
    if (!bytes || bytes <= 0) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

export default function AvatarCropperModal({
    isOpen,
    imageSrc,
    originalFileSize = 0,
    onClose,
    onCropComplete,
}: AvatarCropperModalProps) {
    const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState<number>(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCropComplete = useCallback((_croppedArea: Area, areaPixels: Area) => {
        setCroppedAreaPixels(areaPixels);
    }, []);

    const handleSave = async () => {
        if (!imageSrc || !croppedAreaPixels) return;

        try {
            setIsProcessing(true);
            const { blob, file } = await getCroppedImg(imageSrc, croppedAreaPixels, 512, 0.85);
            const previewUrl = URL.createObjectURL(blob);
            onCropComplete(file, previewUrl, blob.size);
            onClose();
        } catch (error) {
            console.error('Error cropping image:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReset = () => {
        setCrop({ x: 0, y: 0 });
        setZoom(1);
    };

    if (!isOpen || !imageSrc) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isProcessing && onClose()}>
            <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
                <DialogHeader className="p-5 pb-3 border-b border-border bg-muted/20">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                            <CropIcon className="size-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold">
                                Sesuaikan & Crop Foto Profil
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Geser dan zoom gambar secara mulus untuk memposisikan wajah di dalam lingkaran avatar.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-5 space-y-4">
                    {/* Buttery Smooth Cropper Canvas Viewport */}
                    <div className="relative w-full h-72 sm:h-80 bg-zinc-950 rounded-2xl overflow-hidden border-2 border-border/80 shadow-inner">
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            cropShape="round"
                            showGrid={false}
                            onCropChange={setCrop}
                            onCropComplete={handleCropComplete}
                            onZoomChange={setZoom}
                            minZoom={1}
                            maxZoom={3}
                            style={{
                                containerStyle: {
                                    width: '100%',
                                    height: '100%',
                                    position: 'relative',
                                },
                            }}
                        />
                    </div>

                    {/* Smooth Zoom Slider & Controls */}
                    <div className="space-y-2 p-3 rounded-xl border border-border/80 bg-muted/20">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-foreground flex items-center gap-1.5">
                                <ZoomIn className="size-3.5 text-primary" />
                                <span>Zoom: {zoom.toFixed(1)}x</span>
                            </span>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="text-[11px] text-primary hover:underline flex items-center gap-1 font-medium"
                            >
                                <RotateCcw className="size-3" />
                                <span>Reset Posisi</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-2.5">
                            <ZoomOut className="size-3.5 text-muted-foreground shrink-0" />
                            <input
                                type="range"
                                min={1}
                                max={3}
                                step={0.05}
                                value={zoom}
                                onChange={(e) => setZoom(parseFloat(e.target.value))}
                                className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
                            />
                            <ZoomIn className="size-3.5 text-muted-foreground shrink-0" />
                        </div>
                    </div>

                    {/* Auto-compression Notification Badge */}
                    <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                            <Sparkles className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Auto-Kompresi Ultra Ringan Aktif</span>
                        </div>
                        <p className="text-[11px] text-emerald-700/90 dark:text-emerald-300/90 leading-relaxed">
                            {originalFileSize > 2 * 1024 * 1024 ? (
                                <>
                                    Ukuran asli <strong>{formatBytes(originalFileSize)}</strong> (&gt; 2MB). Sistem otomatis memotong dan mengompres foto menjadi <strong>512×512 piksel (&lt; 150 KB)</strong> berkualitas HD!
                                </>
                            ) : (
                                <>
                                    Foto akan dipotong rapi dan dioptimalkan menjadi <strong>512×512 piksel HD</strong> berukuran ringan untuk loading instan di CRM.
                                </>
                            )}
                        </p>
                    </div>
                </div>

                <DialogFooter className="gap-2.5 sm:gap-3 p-4 border-t border-border bg-muted/20">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isProcessing}
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={isProcessing}
                        className="gap-2 shadow-xs"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="size-3.5 animate-spin" />
                                <span>Mengompres Foto...</span>
                            </>
                        ) : (
                            <>
                                <Check className="size-4" />
                                <span>Terapkan & Kompres Foto</span>
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
