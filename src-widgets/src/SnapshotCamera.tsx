import React, { type JSX } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

import { Close } from '@mui/icons-material';

import { CameraField, TRANSLATION_PREFIX } from './RtspCamera';
import VisRxWidget from './VisRxWidget';
import type { VisRxWidgetState, VisRxWidgetProps } from '@iobroker/types-vis-2/visRxWidget';
import type {
    RxRenderWidgetProps,
    RxWidgetInfoAttributesField,
    RxWidgetInfoCustomComponentProperties,
} from '@iobroker/types-vis-2';
import { I18n } from '@iobroker/adapter-react-v5';
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
    loading: boolean;
    full: boolean;
    alive: boolean;
    error: boolean;
}

class SnapshotCamera extends VisRxWidget<SnapshotCameraRxData, SnapshotCameraState> {
    private readonly videoRef: React.RefObject<HTMLImageElement>;

    private readonly fullVideoRef: React.RefObject<HTMLImageElement>;

    private loading: boolean = false;

    private subscribedOnAlive: string = '';

    private pollingInterval: ReturnType<typeof setTimeout> | null = null;

    constructor(props: VisRxWidgetProps) {
        super(props);
        this.videoRef = React.createRef();
        this.fullVideoRef = React.createRef();
        Object.assign(this.state, {
            full: false,
            alive: false,
            error: false,
        });
    }

    static getWidgetInfo() {
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
                            component: (
                                field: RxWidgetInfoAttributesField,
                                data: SnapshotCameraRxData,
                                onDataChange: (newData: Partial<SnapshotCameraRxData>) => void,
                                props: RxWidgetInfoCustomComponentProperties,
                            ) => (
                                <CameraField
                                    field={field}
                                    data={data as unknown as Record<string, string>}
                                    onDataChange={onDataChange}
                                    context={props.context}
                                    t={(word: string) => I18n.t(TRANSLATION_PREFIX + word)}
                                />
                            ),
                        },
                        {
                            label: 'camera_in_dialog',
                            name: 'bigCamera',
                            type: 'custom',
                            component: (
                                field: RxWidgetInfoAttributesField,
                                data: SnapshotCameraRxData,
                                onDataChange: (newData: Partial<SnapshotCameraRxData>) => void,
                                props: RxWidgetInfoCustomComponentProperties,
                            ) => (
                                <CameraField
                                    field={field}
                                    data={data as unknown as Record<string, string>}
                                    onDataChange={onDataChange}
                                    context={props.context}
                                    t={(word: string) => I18n.t(TRANSLATION_PREFIX + word)}
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

    // @ts-expect-error Fix later
    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return SnapshotCamera.getWidgetInfo();
    }

    static getNameAndInstance(value: string): { instanceId: string; name: string } | null {
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
        if (isFull && this.fullVideoRef.current) {
            return this.fullVideoRef.current?.parentElement?.clientWidth || 0;
        }

        return this.videoRef.current?.parentElement?.clientWidth || 0;
    }

    subscribeOnAlive(): void {
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
                this.props.context.socket.subscribeState(
                    `system.adapter.cameras.${data.instanceId}.alive`,
                    this.onAliveChanged,
                );
                this.subscribedOnAlive = data.instanceId;
            }
        }
    }

    updateImage = (): void => {
        if (!this.loading) {
            this.loading = true;
            if (this.videoRef.current) {
                this.videoRef.current.src = this.getUrl();
                this.videoRef.current.onload = e => {
                    const image: HTMLImageElement = e.currentTarget as HTMLImageElement;
                    if (image && image.style.opacity !== '1') {
                        image.style.opacity = '1';
                    }
                    this.state.error && this.setState({ error: false });
                    this.loading = false;
                };
                this.videoRef.current.onerror = e => {
                    // @ts-expect-error fix later
                    const image: HTMLImageElement = e.target as HTMLImageElement;
                    if (image && image.style.opacity !== '0') {
                        image.style.opacity = '0';
                    }
                    !this.state.error && this.setState({ error: true });

                    this.loading = false;
                };
            }
            if (this.fullVideoRef.current && this.state.full) {
                this.fullVideoRef.current.src = this.getUrl(true);
            }
        }
    };

    restartPollingInterval() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
        if (this.state.alive) {
            this.pollingInterval = setInterval(
                this.updateImage,
                parseInt(
                    this.state.full
                        ? (this.state.rxData.pollingIntervalFull as unknown as string)
                        : (this.state.rxData.pollingInterval as unknown as string),
                    10,
                ) || 500,
            );
        }
    }

    onAliveChanged = (id: string, state: ioBroker.State | null | undefined) => {
        const data = SnapshotCamera.getNameAndInstance(this.state.rxData.camera);
        if (data && id === `system.adapter.cameras.${data.instanceId}.alive`) {
            const alive = !!state?.val;
            if (alive !== this.state.alive) {
                this.setState({ alive }, () => this.restartPollingInterval());
            }
        }
    };

    componentDidMount() {
        super.componentDidMount();

        this.subscribeOnAlive();
    }

    onRxDataChanged(/* prevRxData */) {
        this.subscribeOnAlive();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.pollingInterval && clearInterval(this.pollingInterval);
        this.pollingInterval = null;

        if (this.subscribedOnAlive) {
            this.props.context.socket.unsubscribeState(
                `system.adapter.cameras.${this.subscribedOnAlive}.alive`,
                this.onAliveChanged,
            );
            this.subscribedOnAlive = '';
        }
    }

    renderDialog(url: string): JSX.Element | null {
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
                        {I18n.t(`${TRANSLATION_PREFIX}Close`)}
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

    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element | null {
        super.renderWidgetBody(props);

        const url = this.getUrl();

        const content = (
            <div
                style={styles.imageContainer}
                onClick={() => !this.state.error && this.setState({ full: true }, () => this.restartPollingInterval())}
            >
                {!this.state.alive ? (
                    <div style={{ position: 'absolute', top: 20, left: 0 }}>
                        {I18n.t(
                            `${TRANSLATION_PREFIX}Camera instance %s inactive`,
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
                    I18n.t(`${TRANSLATION_PREFIX}No camera selected`)
                )}
                {this.state.alive && this.state.error ? (
                    <div
                        style={{
                            position: 'absolute',
                            top: 20,
                            left: 0,
                        }}
                    >
                        <div style={{ color: 'red' }}>{I18n.t(`${TRANSLATION_PREFIX}Cannot load URL`)}:</div>
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

export default SnapshotCamera;
