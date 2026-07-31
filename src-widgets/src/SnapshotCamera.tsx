import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

import { Close } from '@mui/icons-material';

import type { RxRenderWidgetProps, RxWidgetInfo, VisRxWidgetProps, VisRxWidgetState } from '@iobroker/types-vis-2';
import type VisRxWidget from '@iobroker/types-vis-2/visRxWidget';

import { CameraField } from './RtspCamera';

const styles: Record<string, React.CSSProperties> = {
    camera: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        cursor: 'pointer',
    },
    fullCamera: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
    },
    imageContainer: {
        flex: 1,
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
        height: '100%',
    },
};

interface SnapshotCameraRxData {
    noCard: boolean;
    widgetTitle: string;
    pollingInterval: number;
    pollingIntervalFull: number;
    noCacheByFull: boolean;
    rotate: number;
    camera: string;
    bigCamera: string;
}

interface SnapshotCameraState extends VisRxWidgetState {
    full: boolean;
    alive: boolean;
    error: boolean;
}

export default class SnapshotCamera extends (window.visRxWidget as typeof VisRxWidget)<
    SnapshotCameraRxData,
    SnapshotCameraState
> {
    private pollingInterval: ReturnType<typeof setInterval> | null = null;
    private readonly videoRef: React.RefObject<HTMLImageElement | null>;
    private readonly fullVideoRef: React.RefObject<HTMLImageElement | null>;
    private subscribedOnAlive: string | null = null;
    private loading = false;

    constructor(props: VisRxWidgetProps) {
        super(props);
        this.videoRef = React.createRef<HTMLImageElement | null>();
        this.fullVideoRef = React.createRef<HTMLImageElement | null>();
        this.state = {
            ...this.state,
            full: false,
            alive: false,
            error: false,
        };
    }

    static getI18nPrefix(): string {
        return 'cameras_';
    }

    static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplCameras2SnapshotCamera',
            visSet: 'cameras',
            visName: 'Polling Camera',
            visWidgetLabel: 'Polling Camera',
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        {
                            name: 'noCard',
                            label: 'without_card',
                            type: 'checkbox',
                        },
                        {
                            name: 'widgetTitle',
                            label: 'name',
                            hidden: '!!data.noCard',
                        },
                        {
                            name: 'pollingInterval',
                            label: 'pollingInterval',
                            tooltip: 'tooltip_ms',
                            type: 'number',
                            default: 500,
                        },
                        {
                            name: 'pollingIntervalFull',
                            label: 'pollingIntervalFull',
                            tooltip: 'tooltip_ms',
                            type: 'number',
                            default: 300,
                        },
                        {
                            name: 'noCacheByFull',
                            label: 'noCacheByFull',
                            type: 'checkbox',
                        },
                        {
                            name: 'rotate',
                            label: 'rotate',
                            type: 'select',
                            noTranslation: true,
                            options: [
                                { value: 0, label: '0°' },
                                { value: 90, label: '90°' },
                                { value: 180, label: '180°' },
                                { value: 270, label: '270°' },
                            ],
                        },
                        {
                            label: 'Camera',
                            name: 'camera',
                            type: 'custom',
                            component: (field, data, setData, props) => (
                                <CameraField
                                    field={field}
                                    data={data}
                                    setData={setData}
                                    context={props.context}
                                />
                            ),
                        },
                        {
                            label: 'camera_in_dialog',
                            name: 'bigCamera',
                            type: 'custom',
                            component: (field, data, setData, props) => (
                                <CameraField
                                    field={field}
                                    data={data}
                                    setData={setData}
                                    context={props.context}
                                />
                            ),
                            hidden: '!data.camera',
                        },
                    ],
                },
            ],
            visDefaultStyle: {
                width: '100%',
                height: 240,
                position: 'relative',
            },
            visPrev: 'widgets/cameras/img/prev_snapshot.png',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return SnapshotCamera.getWidgetInfo();
    }

    static getNameAndInstance(value: string | null | undefined): { instanceId: string; name: string } | null {
        if (!value) {
            return null;
        }
        const pos = value.indexOf('/');
        if (pos === -1) {
            return null;
        }
        return {
            instanceId: value.substring(0, pos),
            name: value.substring(pos + 1),
        };
    }

    getImageWidth(isFull?: boolean): number {
        isFull = isFull === undefined ? this.state.full : isFull;
        if (isFull && this.fullVideoRef.current?.parentElement) {
            return this.fullVideoRef.current.parentElement.clientWidth || 0;
        }

        return this.videoRef.current?.parentElement?.clientWidth || 0;
    }

    async subscribeOnAlive(): Promise<void> {
        const data = SnapshotCamera.getNameAndInstance(this.state.rxData.camera);

        if (this.subscribedOnAlive !== (data ? data.instanceId : null)) {
            if (this.subscribedOnAlive) {
                this.props.context.socket.unsubscribeState(
                    `system.adapter.cameras.${this.subscribedOnAlive}.alive`,
                    this.onAliveChanged,
                );
                this.subscribedOnAlive = '';
            }
            if (data) {
                await this.props.context.socket.subscribeState(
                    `system.adapter.cameras.${data.instanceId}.alive`,
                    this.onAliveChanged,
                );
                this.subscribedOnAlive = data.instanceId;
            }
        }
    }

    updateImage = (): void => {
        if (this.loading) {
            return;
        }
        this.loading = true;

        const image = this.videoRef.current;
        if (image) {
            image.src = this.getUrl();
            image.onload = (): void => {
                if (image.style.opacity !== '1') {
                    image.style.opacity = '1';
                }
                if (this.state.error) {
                    this.setState({ error: false });
                }
                this.loading = false;
            };
            image.onerror = (): void => {
                if (image.style.opacity !== '0') {
                    image.style.opacity = '0';
                }
                if (!this.state.error) {
                    this.setState({ error: true });
                }
                this.loading = false;
            };
        }
        if (this.fullVideoRef.current && this.state.full) {
            this.fullVideoRef.current.src = this.getUrl(true);
        }
    };

    restartPollingInterval(): void {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
        if (this.state.alive) {
            const interval = this.state.full
                ? this.state.rxData.pollingIntervalFull
                : this.state.rxData.pollingInterval;

            this.pollingInterval = setInterval(this.updateImage, parseInt(String(interval), 10) || 500);
        }
    }

    onAliveChanged = (id: string, state: ioBroker.State | null | undefined): void => {
        const data = SnapshotCamera.getNameAndInstance(this.state.rxData.camera);
        if (data && id === `system.adapter.cameras.${data.instanceId}.alive`) {
            const alive = !!state?.val;
            if (alive !== this.state.alive) {
                this.setState({ alive }, () => this.restartPollingInterval());
            }
        }
    };

    async componentDidMount(): Promise<void> {
        super.componentDidMount();

        await this.subscribeOnAlive();
    }

    async onRxDataChanged(/* prevRxData */): Promise<void> {
        await this.subscribeOnAlive();
    }

    componentWillUnmount(): void {
        super.componentWillUnmount();
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }

        if (this.subscribedOnAlive) {
            this.props.context.socket.unsubscribeState(
                `system.adapter.cameras.${this.subscribedOnAlive}.alive`,
                this.onAliveChanged,
            );
            this.subscribedOnAlive = null;
        }
    }

    renderDialog(url: string): React.JSX.Element | null {
        if (this.state.full && this.state.rxData.bigCamera) {
            url = this.getUrl(true) || url;
        }

        return this.state.full ? (
            <Dialog
                fullWidth
                maxWidth="lg"
                open={!0}
                onClose={() => this.setState({ full: false }, () => this.restartPollingInterval())}
            >
                <DialogTitle>{this.state.rxData.widgetTitle}</DialogTitle>
                <DialogContent>
                    <div style={styles.imageContainer}>
                        <img
                            src={url}
                            ref={this.fullVideoRef}
                            style={styles.fullCamera}
                            alt={this.state.rxData.camera}
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            this.setState({ full: false }, () => this.restartPollingInterval());
                        }}
                        startIcon={<Close />}
                        color="primary"
                        variant="contained"
                    >
                        {SnapshotCamera.t('Close')}
                    </Button>
                </DialogActions>
            </Dialog>
        ) : null;
    }

    getUrl(isFull?: boolean): string {
        if (isFull && !this.state.rxData.bigCamera) {
            const url = `../cameras.${this.state.rxData.bigCamera}?`;
            const params = [
                `ts=${Date.now()}`,
                `w=${this.getImageWidth(true)}`,
                `noCache=${this.state.rxData.noCacheByFull}`,
                this.state.rxData.rotate ? `angle=${this.state.rxData.rotate}` : '',
            ];
            return url + params.filter(p => p).join('&');
        }
        if (this.state.rxData.camera) {
            const url = `../cameras.${this.state.rxData.camera}?`;
            const params = [
                `ts=${Date.now()}`,
                `w=${this.getImageWidth(isFull)}`,
                `noCache=${isFull ? this.state.rxData.noCacheByFull : false}`,
                this.state.rxData.rotate ? `angle=${this.state.rxData.rotate}` : '',
            ];
            return url + params.filter(p => p).join('&');
        }

        return '';
    }

    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element | React.JSX.Element[] | null {
        super.renderWidgetBody(props);

        const url = this.getUrl();

        const content = (
            <div
                style={styles.imageContainer}
                onClick={() => !this.state.error && this.setState({ full: true }, () => this.restartPollingInterval())}
            >
                {!this.state.alive ? (
                    <div style={{ position: 'absolute', top: 20, left: 0 }}>
                        {SnapshotCamera.t(
                            'Camera instance %s inactive',
                            (this.state.rxData.camera || '').split('/')[0],
                        )}
                    </div>
                ) : null}
                {url ? (
                    <img
                        src={url}
                        ref={this.videoRef}
                        style={styles.camera}
                        alt={this.state.rxData.camera}
                    />
                ) : (
                    SnapshotCamera.t('No camera selected')
                )}
                {this.state.alive && this.state.error ? (
                    <div
                        style={{
                            position: 'absolute',
                            top: 20,
                            left: 0,
                        }}
                    >
                        <div style={{ color: 'red' }}>{SnapshotCamera.t('Cannot load URL')}:</div>
                        <div>{this.getUrl(true)}</div>
                    </div>
                ) : null}
                {this.renderDialog(url)}
            </div>
        );

        if (this.state.rxData.noCard || props.widget.usedInWidget) {
            return content;
        }

        return this.wrapContent(content, null, {
            boxSizing: 'border-box',
            paddingBottom: 10,
            height: '100%',
        });
    }
}
