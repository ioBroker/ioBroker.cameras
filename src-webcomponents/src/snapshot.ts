/**
 * The picture of a camera, taken again and again, as a web component: `<iob-cameras-snapshot>`, the counterpart of
 * the native widgets "Snapshot Camera" of ioBroker.devices and "Polling Camera" of vis-2.
 *
 * One module for every host - vis-2, devices, Aura, admin (`@iobroker/web-components`). Its manifest is a file of
 * its own (`cameras-snapshot.json`, written by the build from `manifest.ts`), so a host loads this module only when
 * it shows the element.
 *
 * Like the native widget of devices it asks the adapter with the message `image`. The dialog may show another
 * camera - e.g. the same one in a higher resolution - and asks in its own interval.
 */
import { defineWebComponent } from '@iobroker/web-components/element';

import { parseCameraId, type CameraRef } from '../../src-devices/src/cameraCommon';
import { CameraElement, type PictureRequest } from './CameraElement';
import {
    COMPONENTS,
    getAngle,
    getPictureWidth,
    MIN_INTERVAL,
    SNAPSHOT_INTERVAL,
    SNAPSHOT_INTERVAL_FULL,
    type CameraSettings,
} from './constants';

interface SnapshotSettings extends CameraSettings {
    /** Ms between the answer and the next request */
    pollingInterval?: number;
    pollingIntervalFull?: number;
    noCache?: boolean;
    /** Another camera for the dialog */
    bigCamera?: string;
}

class SnapshotCamera extends CameraElement<SnapshotSettings> {
    protected override getRequest(camera: CameraRef, settings: SnapshotSettings, full: boolean): PictureRequest {
        const interval = full
            ? (settings.pollingIntervalFull ?? SNAPSHOT_INTERVAL_FULL)
            : (settings.pollingInterval ?? SNAPSHOT_INTERVAL);
        return {
            camera,
            width: getPictureWidth(settings.width, full),
            angle: getAngle(settings.rotate),
            noCache: !!settings.noCache,
            interval: Math.max(MIN_INTERVAL, interval),
        };
    }

    protected override getDialogCamera(camera: CameraRef, settings: SnapshotSettings): CameraRef {
        return parseCameraId(settings.bigCamera) || camera;
    }
}

defineWebComponent(COMPONENTS.snapshot.tag, SnapshotCamera);
