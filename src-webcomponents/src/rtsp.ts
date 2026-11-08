/**
 * The live picture of a camera as a web component: `<iob-cameras-rtsp>`, the counterpart of the native widgets
 * "RTSP Camera" of vis-2 and ioBroker.devices.
 *
 * One module for every host - vis-2, devices, Aura, admin (`@iobroker/web-components`). Its manifest is a file of
 * its own (`cameras-rtsp.json`, written by the build from `manifest.ts`), so a host loads this module only when it
 * shows the element.
 *
 * The native widgets get the frames pushed as instance messages, which a web component cannot subscribe to. This
 * one asks for the next picture right after the last one arrived (see {@link LIVE_INTERVAL}): while the adapter
 * streams the camera anyway, that is the newest frame of the stream, otherwise a fresh snapshot.
 */
import { defineWebComponent } from '@iobroker/web-components/element';

import type { CameraRef } from '../../src-devices/src/cameraCommon';
import { CameraElement, type PictureRequest } from './CameraElement';
import { COMPONENTS, getAngle, getPictureWidth, LIVE_INTERVAL, type CameraSettings } from './constants';

class RtspCamera extends CameraElement<CameraSettings> {
    protected override getRequest(camera: CameraRef, settings: CameraSettings, full: boolean): PictureRequest {
        return {
            camera,
            width: getPictureWidth(settings.width, full),
            angle: getAngle(settings.rotate),
            // several viewers of one camera share what the adapter has cached
            noCache: false,
            interval: LIVE_INTERVAL,
        };
    }
}

defineWebComponent(COMPONENTS.rtsp.tag, RtspCamera);
