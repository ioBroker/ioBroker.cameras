/**
 * Dev entry point, only used by `npm start` (vite dev server).
 *
 * The bundle that ioBroker.devices loads is produced by Module Federation from Components.tsx —
 * this file and index.html play no part in it. Rendering the widgets standalone is not useful
 * without the host: WidgetGeneric is only a compilable mirror here, the real implementation is
 * injected by the host at runtime.
 */
import Components from './Components';

const container = document.getElementById('root');
if (container) {
    container.innerHTML = `<pre style="font-family: monospace; padding: 16px">
This bundle is loaded by ioBroker.devices via Module Federation.

Exposed components:
${Object.keys(Components)
    .map(name => `  - ${name}`)
    .join('\n')}

Build it with "npm run build" and let the devices adapter load
admin/dm-widgets/customDevices.js.
</pre>`;
}
