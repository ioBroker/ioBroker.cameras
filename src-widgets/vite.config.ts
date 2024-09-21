import federation from '@originjs/vite-plugin-federation';
import type { UserConfig } from 'vite';
import topLevelAwait from 'vite-plugin-top-level-await';

export interface RollupLog {
    binding?: string;
    cause?: unknown;
    code?: string;
    exporter?: string;
    frame?: string;
    hook?: string;
    id?: string;
    ids?: string[];
    loc?: {
        column: number;
        file?: string;
        line: number;
    };
    message: string;
    meta?: any;
    names?: string[];
    plugin?: string;
    pluginCode?: unknown;
    pos?: number;
    reexporter?: string;
    stack?: string;
    url?: string;
}

export default {
    plugins: [
        topLevelAwait({
            // The export name of top-level await promise for each chunk module
            promiseExportName: 'vis2CameraWidgets',
            // The function to generate import names of top-level await promise in each chunk module
            promiseImportName: i => `vis2CameraWidgets_${i}`
        }),
        federation({
            name: 'vis2CameraWidgets',
            filename: 'customWidgets.js',
            exposes: {
                './RtspCamera': './src/RtspCamera',
                './SnapshotCamera': './src/SnapshotCamera',
                './translations': './src/translations',
            },
            shared: [
                '@iobroker/adapter-react-v5',
                '@iobroker/adapter-react-v5/i18n/de.json',
                '@iobroker/adapter-react-v5/i18n/en.json',
                '@iobroker/adapter-react-v5/i18n/es.json',
                '@iobroker/adapter-react-v5/i18n/ru.json',
                '@iobroker/adapter-react-v5/i18n/nl.json',
                '@iobroker/adapter-react-v5/i18n/it.json',
                '@iobroker/adapter-react-v5/i18n/pl.json',
                '@iobroker/adapter-react-v5/i18n/pt.json',
                '@iobroker/adapter-react-v5/i18n/fr.json',
                '@iobroker/adapter-react-v5/i18n/uk.json',
                '@iobroker/adapter-react-v5/i18n/zh-cn.json',
                '@mui/icons-material',
                '@mui/material',
                '@mui/system',
                'prop-types',
                'react',
                'react-ace',
                'react-dom',
                'react-dom/client',
            ],
        }),
    ],
    build: {
        modulePreload: false,
        target: 'es2015',
        minify: false,
        cssCodeSplit: false,
        outDir: 'build',
        sourcemap: true,
        rollupOptions: {
            onwarn: (warning: RollupLog, warn: (log: RollupLog) => void) => {
                if (warning.code === 'MODULE_LEVEL_DIRECTIVE' || warning.code === 'SOURCEMAP_ERROR') {
                    return;
                }
                if (warning.message?.includes('_socket/info.js')) {
                    return;
                }
                warn(warning);
            },
        },
    },
    base: './',
    server: {
        port: 3000,
    },
} satisfies UserConfig;
