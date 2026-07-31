/**
 * Helpers shared by both camera widgets.
 *
 * The Devices settings dialog lets the user pick a *state* below the `cameras` namespace
 * (every camera owns `<name>.running` and `<name>.stream`). That is a plain `objectId` field,
 * which works without a dynamic list, and instance plus camera name are derived from the id.
 */

export interface CameraRef {
    /** Instance number as string, e.g. "0" */
    instanceId: string;
    /** Camera name as configured in the adapter, e.g. "cam1" */
    name: string;
    /** Full instance id, e.g. "cameras.0" */
    instance: string;
}

/**
 * Turn `cameras.0.cam1.running` into `{ instanceId: '0', name: 'cam1' }`.
 * Also accepts `cameras.0.cam1` and `0/cam1` (the format used by the vis widgets).
 */
export function parseCameraId(id: string | undefined | null): CameraRef | null {
    if (!id) {
        return null;
    }

    // Format of the vis widgets: "<instance>/<camera>"
    if (id.includes('/')) {
        const [instanceId, name] = id.split('/');
        if (!instanceId || !name) {
            return null;
        }
        return { instanceId, name, instance: `cameras.${instanceId}` };
    }

    const parts = id.split('.');
    if (parts[0] !== 'cameras' || parts.length < 3) {
        return null;
    }

    const instanceId = parts[1];
    // cameras.0.<name>            -> name is the last part
    // cameras.0.<name>.running    -> drop the trailing state name
    const rest = parts.slice(2);
    if (rest.length > 1 && (rest[rest.length - 1] === 'running' || rest[rest.length - 1] === 'stream')) {
        rest.pop();
    }
    const name = rest.join('.');
    if (!name) {
        return null;
    }

    return { instanceId, name, instance: `cameras.${instanceId}` };
}

/** Base64 payload from the adapter -> data URL for an <img> */
export function toDataUrl(base64: string, contentType = 'image/jpeg'): string {
    return `data:${contentType};base64,${base64}`;
}

/** Draw a base64 JPEG onto a canvas, resizing the canvas to the image */
export function drawBase64(canvas: HTMLCanvasElement | null, base64: string): void {
    if (!canvas) {
        return;
    }
    const context = canvas.getContext('2d');
    if (!context) {
        return;
    }
    const image = new Image();
    image.onload = (): void => {
        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0, image.width, image.height);
    };
    image.onerror = (e): void => console.warn(`Cannot draw camera frame: ${e as unknown as string}`);
    image.src = toDataUrl(base64);
}
