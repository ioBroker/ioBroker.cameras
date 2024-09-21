import type { UserConfig } from 'vite';

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
    build: {
        outDir: 'build',
        sourcemap: true,
        rollupOptions: {
            onwarn: (warning: RollupLog, warn: (log: RollupLog) => void) => {
                if (warning.code === 'MODULE_LEVEL_DIRECTIVE' || warning.code === 'SOURCEMAP_ERROR') {
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
