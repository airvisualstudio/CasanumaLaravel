/**
 * Brand Theme Utility
 * Handles dynamic whitelabel primary color application across shadcn/Tailwind components.
 */

export function hexToHsl(hex: string): string {
    let cleanHex = hex.replace(/^#/, '');
    if (cleanHex.length === 3) {
        cleanHex = cleanHex.split('').map((c) => c + c).join('');
    }
    if (cleanHex.length !== 6) return '174.7 83.9% 31.6%';

    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    const d = max - min;

    let h = 0;
    let s = 0;

    if (d !== 0) {
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = ((g - b) / d) + (g < b ? 6 : 0);
                break;
            case g:
                h = ((b - r) / d) + 2;
                break;
            case b:
                h = ((r - g) / d) + 4;
                break;
        }
        h *= 60;
    }

    const hRound = Math.round(h * 10) / 10;
    const sRound = Math.round(s * 1000) / 10;
    const lRound = Math.round(l * 1000) / 10;

    return `${hRound} ${sRound}% ${lRound}%`;
}

export function getContrastForegroundHsl(hex: string): string {
    let cleanHex = hex.replace(/^#/, '');
    if (cleanHex.length === 3) {
        cleanHex = cleanHex.split('').map((c) => c + c).join('');
    }
    if (cleanHex.length !== 6) return '0 0% 100%';

    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    const luminance = r * 0.299 + g * 0.587 + b * 0.114;

    return luminance > 160 ? '0 0% 9%' : '0 0% 100%';
}

/**
 * Apply primary brand theme variables directly to document root with !important.
 * This guarantees immediate reactivity during Inertia navigation and overrides any Vite HMR stylesheets.
 */
export function applyBrandTheme(colorHexOrHsl: string | null | undefined): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    if (!colorHexOrHsl) {
        // Fallback default teal
        const defaultHsl = '174.7 83.9% 31.6%';
        const defaultFg = '0 0% 100%';
        root.style.setProperty('--primary', defaultHsl, 'important');
        root.style.setProperty('--primary-foreground', defaultFg, 'important');
        root.style.setProperty('--ring', defaultHsl, 'important');
        root.style.setProperty('--sidebar-primary', defaultHsl, 'important');
        root.style.setProperty('--sidebar-primary-foreground', defaultFg, 'important');
        root.style.setProperty('--sidebar-ring', defaultHsl, 'important');
        return;
    }

    const isHex = colorHexOrHsl.startsWith('#');
    const hsl = isHex ? hexToHsl(colorHexOrHsl) : colorHexOrHsl;
    const foreground = isHex ? getContrastForegroundHsl(colorHexOrHsl) : '0 0% 100%';

    root.style.setProperty('--primary', hsl, 'important');
    root.style.setProperty('--primary-foreground', foreground, 'important');
    root.style.setProperty('--ring', hsl, 'important');
    root.style.setProperty('--sidebar-primary', hsl, 'important');
    root.style.setProperty('--sidebar-primary-foreground', foreground, 'important');
    root.style.setProperty('--sidebar-ring', hsl, 'important');

    // Also update any dynamic inline style tag if present
    let styleTag = document.getElementById('custom-brand-theme') as HTMLStyleElement | null;
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'custom-brand-theme';
        document.head.appendChild(styleTag);
    }
    styleTag.textContent = `
        :root, html, html.dark, body {
            --primary: ${hsl} !important;
            --primary-foreground: ${foreground} !important;
            --ring: ${hsl} !important;
            --sidebar-primary: ${hsl} !important;
            --sidebar-primary-foreground: ${foreground} !important;
            --sidebar-ring: ${hsl} !important;
        }
    `;
}
