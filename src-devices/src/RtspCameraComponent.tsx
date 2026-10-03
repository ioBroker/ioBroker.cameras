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
    /** Keeps the subscription alive, see {@link scheduleRenew} */
    private renewTimer: ReturnType<typeof setInterval> | null = null;

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
            .subscribeOnInstance(
                instance,
                this.subscribedTo,
                { width: this.getRequestedWidth(this.state.dialogOpen) },
                this.onFrame,
            )
            .then(result => this.scheduleRenew(result?.heartbeat))
            .catch((e: Error) => {
                this.subscribedTo = null;
                this.setError(e.toString());
            });

        // The stream needs a moment - show a still picture in the meantime
        if (this.props.settings.snapshotWhenOffline !== false) {
            void this.loadSnapshot();
        }
    }

    /**
     * The adapter answers every subscription with the interval the client has to re-subscribe
     * within. A client that misses it is dropped by js-controller with reason "timeout", and the
     * adapter then stops the stream - so without this the tile froze on its last frame after a
     * minute, silently: the send error happens on the adapter side and never reaches the browser.
     * Renewed at half the heartbeat, so a single lost request is not fatal.
     *
     * @param heartbeat interval from the subscribe answer, in ms. Without one there is nothing to renew
     */
    private scheduleRenew(heartbeat?: number): void {
        if (this.renewTimer) {
            clearInterval(this.renewTimer);
            this.renewTimer = null;
        }
        if (this.destroyed || !heartbeat) {
            return;
        }
        this.renewTimer = setInterval(() => this.renewSubscription(), Math.max(5000, Math.round(heartbeat / 2)));
    }

    /**
     * Subscribing again is what renewing is: the adapter refreshes the timestamp of an existing
     * subscription instead of adding a second one, and it restarts ffmpeg only if the width really
     * changed - so this is cheap enough to run on a timer.
     */
    private renewSubscription(): void {
        if (this.destroyed || !this.camera || !this.subscribedTo) {
            return;
        }
        this.props.stateContext
            .getSocket()
            .subscribeOnInstance(
                this.camera.instance,
                this.subscribedTo,
                { width: this.getRequestedWidth(this.state.dialogOpen) },
                this.onFrame,
            )
            .catch((e: Error) => console.warn(`Cannot renew camera subscription: ${e.toString()}`));
    }

    /**
     * The adapter scales the stream to the width of the last subscribe request, so opening the dialog
     * has to ask again - a renewed request with a different width restarts ffmpeg with the new scale,
     * which is what the periodic renewal above does for the heartbeat. Without this the dialog showed
     * the tile picture blown up, as nothing else ever asks for a bigger one here. This runs as a
     * `setState` callback, so `state.dialogOpen` is already the new value.
     */
    protected override onDialogToggled(_dialogOpen: boolean): void {
        this.renewSubscription();
    }

    protected stopCamera(): void {
        this.destroyed = true;
        const socket = this.props.stateContext.getSocket();

        if (this.renewTimer) {
            clearInterval(this.renewTimer);
            this.renewTimer = null;
        }

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
                width: this.getRequestedWidth(this.state.dialogOpen),
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
