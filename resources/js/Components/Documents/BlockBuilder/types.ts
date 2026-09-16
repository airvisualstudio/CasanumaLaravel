export type BlockType =
    | 'doc_header'
    | 'customer_dossier'
    | 'unit_spec'
    | 'cost_summary'
    | 'payment_schedule'
    | 'clauses'
    | 'callout_box'
    | 'signatures_two'
    | 'signatures_three'
    | 'custom_text';

export interface BaseBlock {
    id: string;
    type: BlockType;
    title: string;
}

export interface DocHeaderBlock extends BaseBlock {
    type: 'doc_header';
    data: {
        title: string;
        docNumber: string;
        docDate: string;
        preamble: string;
    };
}

export interface CustomerDossierBlock extends BaseBlock {
    type: 'customer_dossier';
    data: {
        sectionTitle: string;
        showNik: boolean;
        showPhone: boolean;
        showAddress: boolean;
        showOccupation: boolean;
        customFields?: { label: string; token: string }[];
    };
}

export interface UnitSpecBlock extends BaseBlock {
    type: 'unit_spec';
    data: {
        sectionTitle: string;
        showProject: boolean;
        showCluster: boolean;
        showUnitCode: boolean;
        showBuildingType: boolean;
        showLandBuildingSize: boolean;
        showElectricityWater: boolean;
    };
}

export interface CostSummaryBlock extends BaseBlock {
    type: 'cost_summary';
    data: {
        sectionTitle: string;
        showAgreementPrice: boolean;
        showBookingFee: boolean;
        showDownPayment: boolean;
        showKprLoan: boolean;
        showSpelling: boolean;
        customItems?: { label: string; token: string }[];
    };
}

export interface PaymentScheduleItem {
    stage: string;
    description: string;
    dueDate: string;
    amount: string;
}

export interface PaymentScheduleBlock extends BaseBlock {
    type: 'payment_schedule';
    data: {
        sectionTitle: string;
        items: PaymentScheduleItem[];
    };
}

export interface ClausesBlock extends BaseBlock {
    type: 'clauses';
    data: {
        sectionTitle: string;
        clauses: string[];
    };
}

export interface CalloutBoxBlock extends BaseBlock {
    type: 'callout_box';
    data: {
        variant: 'info' | 'warning' | 'neutral';
        title: string;
        content: string;
    };
}

export interface SignaturesTwoBlock extends BaseBlock {
    type: 'signatures_two';
    data: {
        party1Role: string;
        party1Name: string;
        party1Subtext: string;
        party1Materai: boolean;
        party2Role: string;
        party2Name: string;
        party2Subtext: string;
        party2Qr: boolean;
    };
}

export interface SignaturesThreeBlock extends BaseBlock {
    type: 'signatures_three';
    data: {
        party1Role: string;
        party1Name: string;
        party1Subtext: string;
        party2Role: string;
        party2Name: string;
        party2Subtext: string;
        party2Qr: boolean;
        party3Role: string;
        party3Name: string;
        party3Subtext: string;
    };
}

export interface CustomTextBlock extends BaseBlock {
    type: 'custom_text';
    data: {
        contentHtml: string;
    };
}

export type DocumentBlock =
    | DocHeaderBlock
    | CustomerDossierBlock
    | UnitSpecBlock
    | CostSummaryBlock
    | PaymentScheduleBlock
    | ClausesBlock
    | CalloutBoxBlock
    | SignaturesTwoBlock
    | SignaturesThreeBlock
    | CustomTextBlock;

/**
 * Generate clean HTML from block items for rendering and printing in DomPDF.
 */
export function blocksToHtml(blocks: DocumentBlock[]): string {
    return blocks
        .map((block) => {
            switch (block.type) {
                case 'doc_header': {
                    const { title, docNumber, docDate, preamble } = block.data;
                    return `
<div class="doc-block doc-block-header" style="margin-bottom: 20px; text-align: center;">
    <h2 style="font-size: 16px; font-weight: 800; text-transform: uppercase; margin: 0 0 6px; letter-spacing: 0.5px; color: #0f172a;">${title || 'SURAT PERJANJIAN'}</h2>
    <p style="font-size: 11px; margin: 0 0 10px; color: #475569;">
        Nomor: <strong>${docNumber || '{{nomor_surat}}'}</strong> &nbsp;&nbsp;|&nbsp;&nbsp; Tanggal: <strong>${docDate || '{{tanggal_transaksi}}'}</strong>
    </p>
    ${preamble ? `<p style="font-size: 11px; text-align: justify; line-height: 1.6; margin: 0; color: #334155;">${preamble}</p>` : ''}
</div>`;
                }

                case 'customer_dossier': {
                    const { sectionTitle, showNik, showPhone, showAddress, showOccupation, customFields } = block.data;
                    let rows = `
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; width: 35%; color: #334155;">Nama Lengkap</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; font-weight: bold; color: #0f172a;">{{nama_konsumen}}</td>
        </tr>`;

                    if (showNik) {
                        rows += `
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; color: #334155;">Nomor KTP / NIK</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; font-family: monospace; color: #0f172a;">{{nik_konsumen}}</td>
        </tr>`;
                    }
                    if (showPhone) {
                        rows += `
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; color: #334155;">Nomor Telepon / WhatsApp</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; color: #0f172a;">{{telepon_konsumen}}</td>
        </tr>`;
                    }
                    if (showAddress) {
                        rows += `
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; color: #334155;">Alamat Domisili</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; color: #0f172a;">{{alamat_konsumen}}</td>
        </tr>`;
                    }
                    if (showOccupation) {
                        rows += `
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; color: #334155;">Pekerjaan / Instansi</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; color: #0f172a;">{{pekerjaan_konsumen}}</td>
        </tr>`;
                    }
                    if (customFields && customFields.length > 0) {
                        customFields.forEach((cf) => {
                            rows += `
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; color: #334155;">${cf.label}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; color: #0f172a;">${cf.token}</td>
        </tr>`;
                        });
                    }

                    return `
<div class="doc-block doc-block-dossier" style="margin-bottom: 16px;">
    <table style="width: 100%; border-collapse: collapse;">
        <thead>
            <tr style="background-color: #f1f5f9;">
                <th colspan="2" style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left; font-size: 11px; font-weight: bold; text-transform: uppercase; color: #0f172a;">
                    ${sectionTitle || 'DATA PEMESAN (KONSUMEN)'}
                </th>
            </tr>
        </thead>
        <tbody>
            ${rows}
        </tbody>
    </table>
</div>`;
                }

                case 'unit_spec': {
                    const { sectionTitle, showProject, showCluster, showUnitCode, showBuildingType, showLandBuildingSize, showElectricityWater } = block.data;
                    let rows = '';

                    if (showProject) {
                        rows += `
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; width: 35%; color: #334155;">Proyek Perumahan</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; font-weight: bold; color: #0f172a;">{{nama_proyek}}</td>
        </tr>`;
                    }
                    if (showCluster) {
                        rows += `
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; color: #334155;">Cluster</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; color: #0f172a;">{{nama_cluster}}</td>
        </tr>`;
                    }
                    if (showUnitCode) {
                        rows += `
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; color: #334155;">Nomor Kavling / Unit</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; font-weight: bold; color: #0f172a;">{{nomor_kavling}}</td>
        </tr>`;
                    }
                    if (showBuildingType) {
                        rows += `
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; color: #334155;">Tipe Rumah</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; color: #0f172a;">{{tipe_unit}}</td>
        </tr>`;
                    }
                    if (showLandBuildingSize) {
                        rows += `
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; color: #334155;">Luas Tanah / Bangunan</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; color: #0f172a;">LT: {{luas_tanah}} m² &nbsp;/&nbsp; LB: {{luas_bangunan}} m²</td>
        </tr>`;
                    }
                    if (showElectricityWater) {
                        rows += `
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; color: #334155;">Fasilitas & Daya Listrik</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; color: #0f172a;">PLN 2.200 VA &amp; Air Bersih PDAM / Submersible</td>
        </tr>`;
                    }

                    return `
<div class="doc-block doc-block-unitspec" style="margin-bottom: 16px;">
    <table style="width: 100%; border-collapse: collapse;">
        <thead>
            <tr style="background-color: #f1f5f9;">
                <th colspan="2" style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left; font-size: 11px; font-weight: bold; text-transform: uppercase; color: #0f172a;">
                    ${sectionTitle || 'DATA UNIT & SPESIFIKASI KAVLING'}
                </th>
            </tr>
        </thead>
        <tbody>
            ${rows}
        </tbody>
    </table>
</div>`;
                }

                case 'cost_summary': {
                    const { sectionTitle, showAgreementPrice, showBookingFee, showDownPayment, showKprLoan, showSpelling } = block.data;
                    let rows = '';

                    if (showAgreementPrice) {
                        rows += `
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; width: 55%; color: #334155;">Harga Kesepakatan (Inc. PPN)</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; text-align: right; font-weight: bold; color: #0f172a;">{{harga_total}}</td>
        </tr>`;
                    }
                    if (showBookingFee) {
                        rows += `
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; color: #334155;">Tanda Jadi (Booking Fee)</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; text-align: right; color: #0f172a;">{{nominal_booking}}</td>
        </tr>`;
                    }
                    if (showDownPayment) {
                        rows += `
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; color: #334155;">Uang Muka (Down Payment)</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; text-align: right; color: #0f172a;">{{nominal_dp}}</td>
        </tr>`;
                    }
                    if (showKprLoan) {
                        rows += `
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; color: #334155;">Sisa Pelunasan / Plafon KPR</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; text-align: right; font-weight: bold; color: #0f172a;">{{plafon_kpr}}</td>
        </tr>`;
                    }
                    if (showSpelling) {
                        rows += `
        <tr style="background-color: #f8fafc;">
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 10px; font-style: italic; color: #475569;" colspan="2">
                Terbilang: <strong>{{nominal_terbilang}}</strong>
            </td>
        </tr>`;
                    }

                    return `
<div class="doc-block doc-block-cost" style="margin-bottom: 16px;">
    <table style="width: 100%; border-collapse: collapse;">
        <thead>
            <tr style="background-color: #f1f5f9;">
                <th colspan="2" style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left; font-size: 11px; font-weight: bold; text-transform: uppercase; color: #0f172a;">
                    ${sectionTitle || 'RINCIAN HARGA & PEMBAYARAN'}
                </th>
            </tr>
        </thead>
        <tbody>
            ${rows}
        </tbody>
    </table>
</div>`;
                }

                case 'payment_schedule': {
                    const { sectionTitle, items } = block.data;
                    const rows = (items || []).map((item, idx) => `
        <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; text-align: center; color: #334155;">${idx + 1}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; font-weight: bold; color: #0f172a;">${item.stage}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; color: #334155;">${item.description}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; text-align: center; color: #334155;">${item.dueDate}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; text-align: right; font-weight: bold; color: #0f172a;">${item.amount}</td>
        </tr>
                    `).join('');

                    return `
<div class="doc-block doc-block-schedule" style="margin-bottom: 16px;">
    <table style="width: 100%; border-collapse: collapse;">
        <thead>
            <tr style="background-color: #f1f5f9;">
                <th colspan="5" style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left; font-size: 11px; font-weight: bold; text-transform: uppercase; color: #0f172a;">
                    ${sectionTitle || 'JADWAL ANGSURAN & TERMIN PEMBAYARAN'}
                </th>
            </tr>
            <tr style="background-color: #f8fafc; font-size: 10px; color: #475569;">
                <th style="border: 1px solid #cbd5e1; padding: 5px; width: 5%;">No</th>
                <th style="border: 1px solid #cbd5e1; padding: 5px; width: 25%; text-align: left;">Tahap</th>
                <th style="border: 1px solid #cbd5e1; padding: 5px; width: 35%; text-align: left;">Keterangan</th>
                <th style="border: 1px solid #cbd5e1; padding: 5px; width: 15%;">Jatuh Tempo</th>
                <th style="border: 1px solid #cbd5e1; padding: 5px; width: 20%; text-align: right;">Nominal</th>
            </tr>
        </thead>
        <tbody>
            ${rows}
        </tbody>
    </table>
</div>`;
                }

                case 'clauses': {
                    const { sectionTitle, clauses } = block.data;
                    const listItems = (clauses || [])
                        .map((c) => `<li style="font-size: 10.5px; line-height: 1.5; margin-bottom: 6px; color: #334155; text-align: justify;">${c}</li>`)
                        .join('');

                    return `
<div class="doc-block doc-block-clauses" style="margin-bottom: 16px;">
    <h4 style="font-size: 11px; font-weight: bold; text-transform: uppercase; margin: 0 0 8px; color: #0f172a;">
        ${sectionTitle || 'SYARAT & KETENTUAN KHUSUS'}
    </h4>
    <ol style="margin: 0; padding-left: 20px;">
        ${listItems}
    </ol>
</div>`;
                }

                case 'callout_box': {
                    const { variant, title, content } = block.data;
                    const bg = variant === 'warning' ? '#fefce8' : variant === 'info' ? '#eff6ff' : '#f8fafc';
                    const border = variant === 'warning' ? '#fde047' : variant === 'info' ? '#bfdbfe' : '#cbd5e1';
                    const text = variant === 'warning' ? '#854d0e' : variant === 'info' ? '#1e40af' : '#1e293b';

                    return `
<div class="doc-block doc-block-callout" style="margin-bottom: 16px; background-color: ${bg}; border-left: 4px solid ${border}; border-top: 1px solid ${border}; border-right: 1px solid ${border}; border-bottom: 1px solid ${border}; border-radius: 4px; padding: 10px 14px;">
    ${title ? `<p style="font-size: 11px; font-weight: bold; margin: 0 0 4px; color: ${text}; text-transform: uppercase;">${title}</p>` : ''}
    <p style="font-size: 10.5px; line-height: 1.5; margin: 0; color: ${text};">${content}</p>
</div>`;
                }

                case 'signatures_two': {
                    const { party1Role, party1Name, party1Subtext, party1Materai, party2Role, party2Name, party2Subtext, party2Qr } = block.data;

                    const materaiBox = party1Materai
                        ? `<div style="display: inline-block; border: 1px dashed #94a3b8; border-radius: 4px; padding: 6px 12px; margin-bottom: 8px; font-size: 9px; color: #64748b; background-color: #f8fafc;">MATERAI<br/>Rp 10.000</div>`
                        : `<div style="height: 55px;"></div>`;

                    const qrSlot = party2Qr
                        ? `<div style="margin: 4px auto 8px;">{{qr_manager}}</div>`
                        : `<div style="height: 55px;"></div>`;

                    return `
<div class="doc-block doc-block-signatures" style="margin-top: 24px; margin-bottom: 12px;">
    <table style="width: 100%; border: none; border-collapse: collapse;">
        <tbody>
            <tr>
                <td style="width: 50%; border: none; text-align: center; vertical-align: top; padding: 8px;">
                    <p style="font-size: 11px; margin: 0 0 10px; color: #334155;">${party1Role || 'Pihak Pertama (Konsumen)'},</p>
                    ${materaiBox}
                    <p style="font-weight: bold; font-size: 11px; text-decoration: underline; margin: 0; color: #0f172a;">${party1Name || '{{nama_konsumen}}'}</p>
                    <p style="font-size: 10px; color: #64748b; margin: 2px 0 0;">${party1Subtext || 'NIK: {{nik_konsumen}}'}</p>
                </td>
                <td style="width: 50%; border: none; text-align: center; vertical-align: top; padding: 8px;">
                    <p style="font-size: 11px; margin: 0 0 10px; color: #334155;">${party2Role || 'Disetujui Oleh (Sales Manager)'},</p>
                    ${qrSlot}
                    <p style="font-weight: bold; font-size: 11px; text-decoration: underline; margin: 0; color: #0f172a;">${party2Name || '{{nama_manager}}'}</p>
                    <p style="font-size: 10px; color: #64748b; margin: 2px 0 0;">${party2Subtext || '{{nama_perusahaan}}'}</p>
                </td>
            </tr>
        </tbody>
    </table>
</div>`;
                }

                case 'signatures_three': {
                    const { party1Role, party1Name, party1Subtext, party2Role, party2Name, party2Subtext, party2Qr, party3Role, party3Name, party3Subtext } = block.data;

                    const qrSlot = party2Qr
                        ? `<div style="margin: 4px auto 8px;">{{qr_manager}}</div>`
                        : `<div style="height: 50px;"></div>`;

                    return `
<div class="doc-block doc-block-signatures-three" style="margin-top: 24px; margin-bottom: 12px;">
    <table style="width: 100%; border: none; border-collapse: collapse;">
        <tbody>
            <tr>
                <td style="width: 33.3%; border: none; text-align: center; vertical-align: top; padding: 6px;">
                    <p style="font-size: 10px; margin: 0 0 8px; color: #334155;">${party1Role || 'Pihak Pertama (Konsumen)'}</p>
                    <div style="height: 50px;"></div>
                    <p style="font-weight: bold; font-size: 10.5px; text-decoration: underline; margin: 0; color: #0f172a;">${party1Name || '{{nama_konsumen}}'}</p>
                    <p style="font-size: 9px; color: #64748b; margin: 2px 0 0;">${party1Subtext || 'Konsumen'}</p>
                </td>
                <td style="width: 33.3%; border: none; text-align: center; vertical-align: top; padding: 6px;">
                    <p style="font-size: 10px; margin: 0 0 8px; color: #334155;">${party2Role || 'Pihak Kedua (Developer)'}</p>
                    ${qrSlot}
                    <p style="font-weight: bold; font-size: 10.5px; text-decoration: underline; margin: 0; color: #0f172a;">${party2Name || '{{nama_manager}}'}</p>
                    <p style="font-size: 9px; color: #64748b; margin: 2px 0 0;">${party2Subtext || '{{nama_perusahaan}}'}</p>
                </td>
                <td style="width: 33.3%; border: none; text-align: center; vertical-align: top; padding: 6px;">
                    <p style="font-size: 10px; margin: 0 0 8px; color: #334155;">${party3Role || 'Saksi / Notaris PPAT'}</p>
                    <div style="height: 50px;"></div>
                    <p style="font-weight: bold; font-size: 10.5px; text-decoration: underline; margin: 0; color: #0f172a;">${party3Name || '(....................................)'}</p>
                    <p style="font-size: 9px; color: #64748b; margin: 2px 0 0;">${party3Subtext || 'Pejabat Pembuat Akta Tanah'}</p>
                </td>
            </tr>
        </tbody>
    </table>
</div>`;
                }

                case 'custom_text': {
                    return `
<div class="doc-block doc-block-custom-text" style="margin-bottom: 16px; font-size: 11px; line-height: 1.6; color: #334155;">
    ${block.data.contentHtml || '<p>Paragraf teks kustom.</p>'}
</div>`;
                }

                default:
                    return '';
            }
        })
        .join('\n');
}

/**
 * Standard Starter Presets for Block Builder
 */
export function getInitialBlocksForCategory(category: string): DocumentBlock[] {
    switch (category) {
        case 'spr':
            return [
                {
                    id: 'b-header',
                    type: 'doc_header',
                    title: 'Header & Nomor Surat',
                    data: {
                        title: 'SURAT PESANAN RUMAH (SPR)',
                        docNumber: '{{nomor_spr}}',
                        docDate: '{{tanggal_transaksi}}',
                        preamble: 'Pada hari ini telah disepakati pemesanan unit hunian properti antara Konsumen dan Pengembang dengan ketentuan sebagai berikut:',
                    },
                },
                {
                    id: 'b-dossier',
                    type: 'customer_dossier',
                    title: 'Data Pemesan (Konsumen)',
                    data: {
                        sectionTitle: 'A. DATA PEMESAN (KONSUMEN)',
                        showNik: true,
                        showPhone: true,
                        showAddress: true,
                        showOccupation: false,
                    },
                },
                {
                    id: 'b-unit',
                    type: 'unit_spec',
                    title: 'Spesifikasi Unit Kavling',
                    data: {
                        sectionTitle: 'B. DATA UNIT & SPESIFIKASI KAVLING',
                        showProject: true,
                        showCluster: true,
                        showUnitCode: true,
                        showBuildingType: true,
                        showLandBuildingSize: true,
                        showElectricityWater: true,
                    },
                },
                {
                    id: 'b-cost',
                    type: 'cost_summary',
                    title: 'Rincian Biaya Transaksi',
                    data: {
                        sectionTitle: 'C. RINCIAN HARGA & PEMBAYARAN',
                        showAgreementPrice: true,
                        showBookingFee: true,
                        showDownPayment: true,
                        showKprLoan: true,
                        showSpelling: true,
                    },
                },
                {
                    id: 'b-clauses',
                    type: 'clauses',
                    title: 'Ketentuan Pembatalan & KPR',
                    data: {
                        sectionTitle: 'D. KETENTUAN KHUSUS PEMESANAN',
                        clauses: [
                            'Uang Tanda Jadi (Booking Fee) mengikat pemesanan unit kavling dan tidak dapat ditarik kembali apabila terjadi pembatalan sepihak dari pemesan.',
                            'Berkas persyaratan KPR perbankan wajib dilengkapi selambat-lambatnya 14 (empat belas) hari kerja terhitung sejak penandatanganan SPR ini.',
                            'Apabila terjadi penurunan plafon KPR oleh pihak Bank, konsumen bersedia menambah kekurangan Uang Muka (DP) sesuai jadwal termin.',
                            'Surat Pesanan Rumah ini sah mengikat setelah ditandatangani kedua belah pihak.',
                        ],
                    },
                },
                {
                    id: 'b-sign',
                    type: 'signatures_two',
                    title: 'Grid Tanda Tangan & QR',
                    data: {
                        party1Role: 'Pihak Pertama (Konsumen)',
                        party1Name: '{{nama_konsumen}}',
                        party1Subtext: 'NIK: {{nik_konsumen}}',
                        party1Materai: true,
                        party2Role: 'Disetujui Oleh (Sales Manager)',
                        party2Name: '{{nama_manager}}',
                        party2Subtext: '{{nama_perusahaan}}',
                        party2Qr: true,
                    },
                },
            ];

        case 'receipt':
            return [
                {
                    id: 'b-header',
                    type: 'doc_header',
                    title: 'Header Kwitansi',
                    data: {
                        title: 'KWITANSI PEMBAYARAN RESMI',
                        docNumber: '{{nomor_kwitansi}}',
                        docDate: '{{tanggal_transaksi}}',
                        preamble: 'Telah diterima pembayaran transaksi properti dengan rincian sah berikut:',
                    },
                },
                {
                    id: 'b-dossier',
                    type: 'customer_dossier',
                    title: 'Diterima Dari',
                    data: {
                        sectionTitle: 'SUDAH TERIMA DARI',
                        showNik: true,
                        showPhone: true,
                        showAddress: false,
                        showOccupation: false,
                    },
                },
                {
                    id: 'b-cost',
                    type: 'cost_summary',
                    title: 'Rincian Nominal Diterima',
                    data: {
                        sectionTitle: 'RINCIAN PEMBAYARAN',
                        showAgreementPrice: false,
                        showBookingFee: true,
                        showDownPayment: false,
                        showKprLoan: false,
                        showSpelling: true,
                    },
                },
                {
                    id: 'b-callout',
                    type: 'callout_box',
                    title: 'Catatan Keabsahan Kwitansi',
                    data: {
                        variant: 'neutral',
                        title: 'CATATAN KEABSAHAN',
                        content: 'Kwitansi ini adalah bukti pembayaran sah dari PT Casanuma Modern Living apabila dilengkapi stempel digital dan verifikasi QR Code terdaftar.',
                    },
                },
                {
                    id: 'b-sign',
                    type: 'signatures_two',
                    title: 'Tanda Tangan Bagian Finance',
                    data: {
                        party1Role: 'Pembayar / Konsumen',
                        party1Name: '{{nama_konsumen}}',
                        party1Subtext: 'Konsumen',
                        party1Materai: false,
                        party2Role: 'Kasir / Bagian Keuangan',
                        party2Name: '{{nama_pembuat}}',
                        party2Subtext: 'Finance Dept',
                        party2Qr: true,
                    },
                },
            ];

        default:
            return [
                {
                    id: 'b-header',
                    type: 'doc_header',
                    title: 'Header Surat Resmi',
                    data: {
                        title: 'SURAT KETERANGAN RESMI',
                        docNumber: '{{nomor_surat}}',
                        docDate: '{{tanggal_transaksi}}',
                        preamble: 'Dengan ini Manajemen Pengembang Perumahan menerangkan bahwa:',
                    },
                },
                {
                    id: 'b-dossier',
                    type: 'customer_dossier',
                    title: 'Pihak Terkait',
                    data: {
                        sectionTitle: 'DATA PIHAK BERSANGKUTAN',
                        showNik: true,
                        showPhone: true,
                        showAddress: true,
                        showOccupation: false,
                    },
                },
                {
                    id: 'b-custom',
                    type: 'custom_text',
                    title: 'Isi Pernyataan / Keterangan',
                    data: {
                        contentHtml: '<p>Telah melunasi seluruh kewajiban administrasi kavling dan berhak untuk menerima fasilitas serah terima kunci (BAST) tepat waktu sesuai jadwal pembangunan.</p>',
                    },
                },
                {
                    id: 'b-sign',
                    type: 'signatures_two',
                    title: 'Tanda Tangan Pejabat Pengembang',
                    data: {
                        party1Role: 'Pihak Pertama',
                        party1Name: '{{nama_konsumen}}',
                        party1Subtext: 'Penerima',
                        party1Materai: false,
                        party2Role: 'Direktur Operasional',
                        party2Name: '{{nama_manager}}',
                        party2Subtext: '{{nama_perusahaan}}',
                        party2Qr: true,
                    },
                },
            ];
    }
}
