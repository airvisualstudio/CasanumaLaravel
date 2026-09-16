import React from 'react';

export interface LetterheadProps {
    mode: 'default_company' | 'custom_builder' | 'custom_image' | 'none';
    logoUrl?: string | null;
    title?: string | null;
    subtitle?: string | null;
    address?: string | null;
    contact?: string | null;
    imageUrl?: string | null;
    companySettings?: {
        company_name?: string | null;
        company_address?: string | null;
        company_phone?: string | null;
        company_email?: string | null;
        logo_light_url?: string | null;
    };
}

export interface PaperCanvasProps {
    widthMm: number;
    heightMm: number;
    marginTopMm: number;
    marginBottomMm: number;
    marginLeftMm: number;
    marginRightMm: number;
    orientation: 'portrait' | 'landscape';
    zoomPercent: number;
    showMarginGuides?: boolean;
    watermarkText?: string | null;
    watermarkOpacity?: number;
    letterhead: LetterheadProps;
    footerText?: string | null;
    children: React.ReactNode;
}

export default function PaperCanvas({
    widthMm,
    heightMm,
    marginTopMm,
    marginBottomMm,
    marginLeftMm,
    marginRightMm,
    orientation,
    zoomPercent = 100,
    showMarginGuides = true,
    watermarkText,
    watermarkOpacity = 10,
    letterhead,
    footerText,
    children,
}: PaperCanvasProps) {
    // 1 mm = 3.7795 px at 96 DPI
    const mmToPx = 3.7795;
    const zoomFactor = zoomPercent / 100;

    const actualWidthMm = orientation === 'landscape' ? Math.max(widthMm, heightMm) : Math.min(widthMm, heightMm);
    const actualHeightMm = orientation === 'landscape' ? Math.min(widthMm, heightMm) : Math.max(widthMm, heightMm);

    const sheetWidthPx = actualWidthMm * mmToPx * zoomFactor;
    const sheetHeightPx = actualHeightMm * mmToPx * zoomFactor;

    const padTopPx = marginTopMm * mmToPx * zoomFactor;
    const padBottomPx = marginBottomMm * mmToPx * zoomFactor;
    const padLeftPx = marginLeftMm * mmToPx * zoomFactor;
    const padRightPx = marginRightMm * mmToPx * zoomFactor;

    // Letterhead renderer
    const renderLetterhead = () => {
        if (letterhead.mode === 'none') return null;

        if (letterhead.mode === 'custom_image') {
            return (
                <div className="w-full mb-4 select-none">
                    {letterhead.imageUrl ? (
                        <img
                            src={letterhead.imageUrl}
                            alt="Kop Surat"
                            className="w-full object-contain max-h-36 rounded"
                        />
                    ) : (
                        <div className="h-20 border-2 border-dashed border-border flex items-center justify-center text-xs text-muted-foreground bg-muted/20 rounded">
                            Gambar Kop Surat Belum Diunggah
                        </div>
                    )}
                    <hr className="mt-3 border-t-2 border-black" />
                </div>
            );
        }

        const isDefault = letterhead.mode === 'default_company';
        const title = isDefault
            ? letterhead.companySettings?.company_name || 'PT CASANUMA MODERN LIVING'
            : letterhead.title || 'NAMA PERUSAHAAN / DEVELOPER';

        const subtitle = isDefault
            ? 'Pengembang Kawasan Hunian Eksklusif & Modern'
            : letterhead.subtitle || 'Real Estate & Property Development';

        const address = isDefault
            ? letterhead.companySettings?.company_address || 'Jl. Sudirman Boulevard No. 88, Kawasan Bisnis Sentral, Jakarta'
            : letterhead.address || 'Alamat Kantor & Operasional';

        const contact = isDefault
            ? `Telp: ${letterhead.companySettings?.company_phone || '(021) 555-8900'} | Email: ${letterhead.companySettings?.company_email || 'info@casanuma.com'}`
            : letterhead.contact || 'Telp: (021) XXX-XXXX | Email: kontak@perusahaan.com';

        const logo = isDefault
            ? letterhead.companySettings?.logo_light_url
            : letterhead.logoUrl;

        return (
            <div className="w-full mb-4 select-none">
                <table className="w-full border-collapse">
                    <tbody>
                        <tr>
                            {logo && (
                                <td className="w-20 align-middle pr-4 py-1">
                                    <img
                                        src={logo}
                                        alt="Logo"
                                        className="h-16 max-w-[80px] object-contain mx-auto"
                                    />
                                </td>
                            )}
                            <td className="align-middle text-center py-1">
                                <h1 className="text-base font-bold tracking-wide uppercase text-black font-serif leading-tight">
                                    {title}
                                </h1>
                                {subtitle && (
                                    <p className="text-xs font-semibold text-gray-700 tracking-normal mt-0.5">
                                        {subtitle}
                                    </p>
                                )}
                                <p className="text-[10px] text-gray-600 mt-1 leading-snug">
                                    {address}
                                </p>
                                <p className="text-[10px] text-gray-600 leading-snug">
                                    {contact}
                                </p>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div className="w-full mt-2 border-t-2 border-black" />
                <div className="w-full mt-0.5 border-t border-black" />
            </div>
        );
    };

    return (
        <div className="flex justify-center p-4 sm:p-8 overflow-auto">
            <div
                id="document-paper-sheet"
                style={{
                    width: `${sheetWidthPx}px`,
                    minHeight: `${sheetHeightPx}px`,
                    paddingTop: `${padTopPx}px`,
                    paddingBottom: `${padBottomPx}px`,
                    paddingLeft: `${padLeftPx}px`,
                    paddingRight: `${padRightPx}px`,
                    fontSize: `${13 * zoomFactor}px`,
                }}
                className={`relative bg-white text-slate-900 shadow-2xl transition-all duration-150 border border-slate-200/80 rounded-sm flex flex-col justify-between ${
                    showMarginGuides ? 'ring-1 ring-primary/20' : ''
                }`}
            >
                {/* Margin Guide Markers (visual dashed overlay inside paper) */}
                {showMarginGuides && (
                    <div
                        className="pointer-events-none absolute inset-0 border border-dashed border-sky-400/30"
                        style={{
                            top: `${padTopPx}px`,
                            bottom: `${padBottomPx}px`,
                            left: `${padLeftPx}px`,
                            right: `${padRightPx}px`,
                        }}
                    >
                        <span className="absolute -top-3.5 left-0 text-[9px] font-mono text-sky-500/70 bg-white px-1">
                            Batas Margin ({marginTopMm}mm / {marginLeftMm}mm)
                        </span>
                    </div>
                )}

                {/* Watermark Overlay */}
                {watermarkText && (
                    <div
                        className="pointer-events-none select-none absolute inset-0 overflow-hidden flex items-center justify-center z-0 print:flex"
                        aria-hidden="true"
                    >
                        <span
                            style={{
                                opacity: (watermarkOpacity ?? 10) / 100,
                                fontSize: `${64 * zoomFactor}px`,
                                letterSpacing: '0.18em',
                            }}
                            className="font-black tracking-widest text-slate-900 uppercase -rotate-45 transform whitespace-nowrap select-none"
                        >
                            {watermarkText}
                        </span>
                    </div>
                )}

                {/* Top Section: Kop Surat */}
                <div className="w-full shrink-0 relative z-10">
                    {renderLetterhead()}
                </div>

                {/* Content Section */}
                <div className="w-full grow leading-relaxed relative z-10">
                    {children}
                </div>

                {/* Bottom Section: Footer text */}
                <div className="w-full shrink-0 pt-4 mt-6 border-t border-slate-300 text-[10px] text-gray-500 flex justify-between items-center select-none relative z-10">
                    <span>{footerText || 'CASANUMA CRM — Official Document'}</span>
                    <span className="font-mono text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Halaman 1 / 1</span>
                </div>
            </div>
        </div>
    );
}
