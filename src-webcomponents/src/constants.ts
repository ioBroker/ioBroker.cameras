/**
 * What the build and the elements share: the components, where their files go, and the defaults of the settings.
 *
 * Read by `vite.config.ts` too, so the imports of the files it loads carry their extension.
 */
import type { WebComponentSettings } from '@iobroker/web-components';

/** The folder of the modules and manifests in the admin folder; `common.webComponents` names the manifests in it */
export const MODULE_FOLDER = 'webcomponents';

/**
 * The web components, by the key `build.mjs` builds each of them with (`vite build --mode <key>`).
 *
 * `deviceWidget` is the native widget of ioBroker.devices that shows the same: its label in
 * `common.deviceWidgets.components` is the name of the component, so that vis-2 and devices show only one of both.
 */
export const COMPONENTS = {
    rtsp: {
        tag: 'iob-cameras-rtsp',
        /** `admin/webcomponents/cameras-rtsp.js` and `.json` */
        file: 'cameras-rtsp',
        entry: './src/rtsp.ts',
        deviceWidget: 'RtspCameraComponent',
    },
    snapshot: {
        tag: 'iob-cameras-snapshot',
        file: 'cameras-snapshot',
        entry: './src/snapshot.ts',
        deviceWidget: 'SnapshotCameraComponent',
    },
} as const;

export type ComponentKey = keyof typeof COMPONENTS;

/**
 * Whether a text names a component
 *
 * @param key e.g. the mode of the Vite build
 */
export function isComponentKey(key: string): key is ComponentKey {
    return Object.prototype.hasOwnProperty.call(COMPONENTS, key);
}

/** Width the adapter scales the picture of the tile to, if the settings name none */
export const DEFAULT_WIDTH = 640;

/** The dialog asks for at least this width */
export const FULL_WIDTH = 1280;

/**
 * The live picture asks for the next frame this long after the answer to the last one. While the adapter streams
 * the camera anyway (a native widget shows it), the answer is the newest frame of that stream; otherwise every
 * request takes a snapshot, which takes as long as it takes - one request after the other, never in parallel.
 */
export const LIVE_INTERVAL = 500;

/** Defaults of the snapshot camera, as the native widget of ioBroker.devices has them */
export const SNAPSHOT_INTERVAL = 2000;
export const SNAPSHOT_INTERVAL_FULL = 500;
export const MIN_INTERVAL = 100;

/** The settings both components have */
export interface CameraSettings extends WebComponentSettings {
    /** A state of the camera, e.g. `cameras.0.cam1.running` */
    camera?: string;
    /** Shown above the picture */
    title?: string;
    /** In px; 0: as the camera sends it */
    width?: number;
    /** `0`, `90`, `180` or `270` */
    rotate?: string;
}

/**
 * The width to ask the adapter for
 *
 * @param width the setting
 * @param full for the dialog
 */
export function getPictureWidth(width: number | undefined, full: boolean): number {
    const tile = width === undefined ? DEFAULT_WIDTH : Math.max(0, Math.round(width));
    return full && tile ? Math.max(FULL_WIDTH, tile) : tile;
}

/**
 * The angle the adapter turns the picture by
 *
 * @param rotate the setting
 */
export function getAngle(rotate: string | undefined): number {
    const angle = parseInt(rotate || '0', 10);
    return angle === 90 || angle === 180 || angle === 270 ? angle : 0;
}
