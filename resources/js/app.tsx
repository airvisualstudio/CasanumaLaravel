import '../css/app.css';
import './bootstrap';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { applyBrandTheme } from '@/lib/theme';

const appName = import.meta.env.VITE_APP_NAME || 'CASANUMA CRM';

// Synchronize brand theme on every Inertia navigation
router.on('navigate', (event) => {
    const pageProps = event.detail.page.props as any;
    const primaryColor = pageProps?.app_settings?.primary_hsl || pageProps?.app_settings?.primary_color;
    applyBrandTheme(primaryColor);
});

createInertiaApp({
    title: (title) => title ? (title.includes(appName) ? title : `${title} - ${appName}`) : appName,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        const primaryColor = (props.initialPage.props as any)?.app_settings?.primary_hsl || (props.initialPage.props as any)?.app_settings?.primary_color;
        applyBrandTheme(primaryColor);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
