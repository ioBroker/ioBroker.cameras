/**
 * Snapshot camera widget for ioBroker.devices.
 *
 * Pulls single pictures through the adapter's `image` message. That works from admin as well as
 * from a web instance, because it goes over the ioBroker socket instead of an HTTP route of the
 * web adapter - the Devices UI is served from admin in most installations.
 */
import { React, type WidgetGenericProps } from '@iobroker/dm-widgets';
import type { ConfigItemPanel, ConfigItemTabs } from '@iobroker/dm-utils';

import CameraWidgetBase, { type CameraWidgetSettings, type CameraWidgetState } from './CameraWidgetBase';

export interface SnapshotCameraSettings extends CameraWidgetSettings {
    /** Poll interval in milliseconds */
    pollingInterval?: number;
    /** Ask the adapter to bypass its cache */
    noCache?: boolean;
}

export class SnapshotCameraComponent extends CameraWidgetBase<SnapshotCameraSettings, CameraWidgetState> {
    private pollTimer: ReturnType<typeof setTimeout> | null = null;
    private requesting = false;
    private destroyed = false;

    constructor(props: WidgetGenericProps<SnapshotCameraSettings>) {
        super(props);
        this.destroyed = false;
    }

    static override getConfigSchema(): { name: string; schema: ConfigItemPanel | ConfigItemTabs } {
        return CameraWidgetBase.buildConfigSchema('cameras_SnapshotCamera', {
            pollingInterval: {
                type: 'number',
                label: 'cameras_pollingInterval',
                help: 'cameras_pollingInterval_help',
                default: 2000,
                min: 500,
                max: 600000,
                sm: 12,
                md: 6,
            },
            noCache: {
                type: 'checkbox',
                label: 'cameras_noCache',
                default: false,
                sm: 12,
                md: 6,
            },
        });
    }

    protected startCamera(): void {
        this.destroyed = false;
        void this.poll();
    }

    protected stopCamera(): void {
        this.destroyed = true;
        if (this.pollTimer) {
            clearTimeout(this.pollTimer);
            this.pollTimer = null;
        }
    }

    private scheduleNext(): void {
        if (this.destroyed) {
            return;
        }
        const interval = Math.max(500, parseInt(this.props.settings.pollingInterval as unknown as string, 10) || 2000);
        this.pollTimer = setTimeout(() => {
            this.pollTimer = null;
            void this.poll();
        }, interval);
    }

    /** One `image` round trip. Never runs twice in parallel, a slow camera just lowers the rate. */
    private async poll(): Promise<void> {
        if (this.destroyed || this.requesting || !this.camera) {
            return;
        }
        this.requesting = true;

        try {
            const socket = this.props.stateContext.getSocket();
            const result: { data?: string; contentType?: string; error?: string } = await socket.sendTo(
                this.camera.instance,
                'image',
                {
                    name: this.camera.name,
                    width: this.getRequestedWidth(this.state.dialogOpen),
                    angle: this.props.settings.rotate || 0,
                    noCache: !!this.props.settings.noCache,
                },
            );

            if (this.destroyed) {
                return;
            }

            if (result?.error) {
                this.setError(result.error);
            } else if (result?.data) {
                this.setFrame(result.data);
            } else {
                this.setError('No data');
            }
        } catch (e) {
            if (!this.destroyed) {
                this.setError((e as Error).toString());
            }
        } finally {
            this.requesting = false;
            this.scheduleNext();
        }
    }
}

export default SnapshotCameraComponent;
