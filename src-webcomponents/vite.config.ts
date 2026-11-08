import { checkManifest, getReactImportPath, REACT_SPECIFIERS } from '@iobroker/web-components';
import type { Plugin, UserConfig } from 'vite';

// the label of a native devices widget is the name of its web component
import ioPackage from '../io-package.json' with { type: 'json' };
// with the extension: Vite may load its config natively, without a bundler that would add it
import { COMPONENTS, isComponentKey, MODULE_FOLDER, type ComponentKey } from './src/constants.ts';
import { buildManifest, type DeviceWidget } from './src/manifest.ts';

/**
 * The web components of the adapter, one build each (`build.mjs`): `vite build --mode rtsp` writes
 * `build/cameras-rtsp.js` and its manifest `cameras-rtsp.json`, `--mode snapshot` the ones of the snapshot camera.
 * `tasks.js` copies them into `admin/webcomponents/`, from where every host - vis-2, devices, Aura, admin - loads
 * them as `/adapter/cameras/webcomponents/` (`common.webComponents`). Each module is one file with everything it
 * needs: a host imports exactly one URL per component, and nothing is shared but the socket.
 */

/**
 * Writes the manifest next to the module, checked like a host checks it
 *
 * @param key the component
 */
function manifestFile(key: ComponentKey): Plugin {
    const fileName = `${COMPONENTS[key].file}.json`;
    return {
        name: 'cameras-web-component-manifest',
        generateBundle() {
            const manifest = buildManifest(key, ioPackage.common.deviceWidgets.components as DeviceWidget[]);
            const problem = checkManifest(manifest);
            if (problem) {
                this.error(`${fileName}: ${problem}`);
            }
            this.emitFile({
                type: 'asset',
                fileName,
                source: `${JSON.stringify(manifest, null, 4)}\n`,
            });
        },
    };
}

export default ({ mode }: { mode: string }): UserConfig => {
    if (!isComponentKey(mode)) {
        throw new Error(`Build one component at a time: vite build --mode <${Object.keys(COMPONENTS).join('|')}>`);
    }
    const component = COMPONENTS[mode];
    // The components draw with plain DOM and import no React. Should one ever do, it takes the React of the
    // host (`lib/esm/react-19.js` beside `adapter/`, relative to the module) instead of bundling a second one
    const reactImport = getReactImportPath(`${MODULE_FOLDER}/${component.file}.js`);

    return {
        plugins: [manifestFile(mode)],
        define: {
            'process.env.NODE_ENV': JSON.stringify('production'),
        },
        build: {
            target: 'es2022',
            outDir: './build',
            // the other component lies there already; build.mjs empties the folder before the first one
            emptyOutDir: false,
            lib: {
                entry: component.entry,
                formats: ['es'],
                fileName: (): string => `${component.file}.js`,
            },
            rollupOptions: {
                external: [...REACT_SPECIFIERS],
                output: {
                    paths: Object.fromEntries(REACT_SPECIFIERS.map(specifier => [specifier, reactImport])),
                    // one file: a host imports exactly one URL
                    codeSplitting: false,
                    // library mode keeps whitespace for the bundler of a consumer; this module is loaded as it is
                    minify: true,
                },
            },
        },
    };
};
