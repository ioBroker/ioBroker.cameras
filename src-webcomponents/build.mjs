/**
 * Builds the web components, each on its own, so that each is one module file with everything it needs:
 * `build/cameras-rtsp.js`, `build/cameras-snapshot.js` and their manifests. One Vite build with several entries
 * would move what they share into a chunk of its own, and a host imports exactly one URL per component.
 *
 * Run by `tasks.js --wc` (`npm run build-wc` in the root), or here with `npm run build`.
 */
import { rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

/** The keys of `COMPONENTS` in `src/constants.ts`; `vite.config.ts` refuses any other */
const COMPONENTS = ['rtsp', 'snapshot'];

/** This folder: the paths of the config are relative to it, wherever the build is started from */
const root = fileURLToPath(new URL('.', import.meta.url));

rmSync(new URL('./build', import.meta.url), { recursive: true, force: true });

for (const mode of COMPONENTS) {
    await build({ root, configFile: `${root}vite.config.ts`, mode });
}
