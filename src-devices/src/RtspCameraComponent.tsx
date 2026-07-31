/**
 * RTSP live camera widget for ioBroker.devices.
 *
 * Subscribes to the adapter instance with the message type `startCamera/<name>`. The adapter
 * then pushes JPEG frames through `sendToUI` for as long as somebody is subscribed - the same
 * mechanism the vis-2 widget uses, and it works from admin as well as from a web instance.
 *
 * Whether those frames come from ffmpeg or from go2rtc is decided in the adapter; the widget
 * never notices the difference.
 */
import { React, type WidgetGenericProps } from '@iobroker/dm-widgets';
import type { ConfigItemPanel, ConfigItemTabs } from '@iobroker/dm-utils';

import CameraWidgetBase, { type CameraWidgetSettings, type CameraWidgetState } from './CameraWidgetBase';

export interface RtspCameraSettings extends CameraWidgetSettings {
    /** Fall back to a still picture when the instance is not running */
    snapshotWhenOffline?: boolean;
}

export class RtspCameraComponent extends CameraWidgetBase<RtspCameraSettings, CameraWidgetState> {
    /** Set while a subscription is active, so unmount can undo exactly what was done */
    private subscribedTo: string | null = null;
    private aliveId: string | null = null;
    private destroyed = false;

    constructor(props: WidgetGenericProps<RtspCameraSettings>) {
        super(props);
        this.destroyed = false;
    }

    static override getConfigSchema(): { name: string; schema: ConfigItemPanel | ConfigItemTabs } {
        return CameraWidgetBase.buildConfigSchema('cameras_RtspCamera', {
            snapshotWhenOffline: {
                type: 'checkbox',
                label: 'cameras_snapshotWhenOffline',
                help: 'cameras_snapshotWhenOffline_help',
                default: true,
                sm: 12,
                md: 6,
            },
        });
    }

    /** Frames pushed by the adapter. Errors arrive as an object instead of a string. */
    private onFrame = (data: { accepted?: boolean; error?: string } | string | null | undefined): void => {
        if (this.destroyed || !data) {
            return;
        }
        if (typeof data === 'object') {
            if (data.error) {
                this.setError(data.error);
            }
            return;
        }
        this.setFrame(data);
    };

    private onAliveChanged = (_id: string, state: ioBroker.State | null | undefined): void => {
        if (this.destroyed) {
            return;
        }
        if (!state?.val) {
            this.setError(CameraWidgetBase.t('cameras_instance_inactive'));
        } else if (!this.subscribedTo) {
            // Instance came back - resubscribe
            this.startCamera();
        }
    };

    protected startCamera(): void {
        this.destroyed = false;
        if (!this.camera || this.subscribedTo) {
            return;
        }

        const socket = this.props.stateContext.getSocket();
        const { instance, name } = this.camera;

        this.aliveId = `system.adapter.${instance}.alive`;
        void socket.subscribeState(this.aliveId, this.onAliveChanged);

        this.subscribedTo = `startCamera/${name}`;
        socket
            .subscribeOnInstance(instance, this.subscribedTo, { width: this.getRequestedWidth() }, this.onFrame)
            .catch((e: Error) => {
                this.subscribedTo = null;
                this.setError(e.toString());
            });

        // The stream needs a moment - show a still picture in the meantime
        if (this.props.settings.snapshotWhenOffline !== false) {
            void this.loadSnapshot();
        }
    }

    protected stopCamera(): void {
        this.destroyed = true;
        const socket = this.props.stateContext.getSocket();

        if (this.aliveId) {
            socket.unsubscribeState(this.aliveId, this.onAliveChanged);
            this.aliveId = null;
        }

        if (this.camera && this.subscribedTo) {
            socket
                .unsubscribeFromInstance(this.camera.instance, this.subscribedTo, this.onFrame)
                .catch((e: Error) => console.warn(`Cannot unsubscribe camera: ${e.toString()}`));
            this.subscribedTo = null;
        }
    }

    /** A single picture, so the tile is not empty until the first stream frame arrives */
    private async loadSnapshot(): Promise<void> {
        if (!this.camera) {
            return;
        }
        try {
            const socket = this.props.stateContext.getSocket();
            const result: { data?: string; error?: string } = await socket.sendTo(this.camera.instance, 'image', {
                name: this.camera.name,
                width: this.getRequestedWidth(),
                angle: this.props.settings.rotate || 0,
            });
            // Do not overwrite a live frame that arrived in the meantime
            if (!this.destroyed && result?.data && !this.state.frame) {
                this.setFrame(result.data);
            }
        } catch {
            // The stream may still work - stay quiet
        }
    }
}

export default RtspCameraComponent;
