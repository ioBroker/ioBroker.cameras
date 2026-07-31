import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    // The built UI is served from `admin/` inside the adapter, so asset URLs must stay relative
    base: './',
    build: {
        outDir: 'build',
    },
    resolve: {
        // React and emotion must end up in the bundle exactly once, otherwise MUI's theme
        // context breaks when a dependency resolves its own copy
        dedupe: ['react', 'react-dom', '@emotion/react', '@emotion/styled', '@emotion/cache'],
    },
    server: {
        port: 3000,
        proxy: {
            '/files': 'http://localhost:8081',
            '/adapter': 'http://localhost:8081',
            '/session': 'http://localhost:8081',
            '/log': 'http://localhost:8081',
            '/lib': 'http://localhost:8081',
        },
    },
});
