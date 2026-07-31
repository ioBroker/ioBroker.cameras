import React, { useEffect } from 'react';
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Select,
} from '@mui/material';

import { Close } from '@mui/icons-material';

import type {
    RxRenderWidgetProps,
    RxWidgetInfo,
    RxWidgetInfoAttributesField,
    RxWidgetInfoCustomComponentContext,
    VisRxWidgetProps,
    VisRxWidgetState,
    WidgetData,
} from '@iobroker/types-vis-2';
import type VisRxWidget from '@iobroker/types-vis-2/visRxWidget';
import { CameraConfigAny, CameraInstarConfig } from '../../src/types';

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

interface RtspCameraRxData {
    noCard: boolean;
    widgetTitle: string;
    width: number;
    camera: string;
}
/** Camera selector, shared by the RTSP and the snapshot widget */
export const CameraField = (props: {
    data: WidgetData;
    field: RxWidgetInfoAttributesField;
    context: RxWidgetInfoCustomComponentContext;
    rtsp?: boolean;
    setData: (newData: WidgetData) => void;
}) => {
    const [cameras, setCameras] = React.useState<null | Array<{
        enabled: boolean;
        value: string;
        label: string;
        subLabel: string;
    }>>(null);
    const [camera, setCamera] = React.useState<string>((props.data[props.field.name || 'camera'] as string) || '');

    useEffect(() => {
        (async () => {
            const _cameras: {
                enabled: boolean;
                value: string;
                label: string;
                subLabel: string;
            }[] = [];
            const instances = await props.context.socket.getAdapterInstances('cameras');
            instances.forEach(instance => {
                const instanceId = instance._id.split('.').pop();
                (instance.native.cameras as CameraConfigAny[])
                    .filter(iCamera => !props.rtsp || iCamera.type === 'rtsp' || iCamera.rtsp)
                    .forEach(iCamera => {
                        _cameras.push({
                            enabled: iCamera.enabled !== false,
                            value: `${instanceId}/${iCamera.name}`,
                            label: `cameras.${instanceId}/${iCamera.name}`,
                            subLabel: iCamera.desc
                                ? `${iCamera.desc}/${(iCamera as CameraInstarConfig).ip || (iCamera as CameraInstarConfig).type || ''}`
                                : (iCamera as CameraInstarConfig).ip || (iCamera as CameraInstarConfig).type || '',
                        });
                    });
            });
            setCameras(_cameras);
        })();
    }, [props.context.socket, props.rtsp]);

    return cameras ? (
        <Select
            fullWidth
            variant="standard"
            value={camera}
            onChange={e => {
                props.setData({ [props.field.name || 'camera']: e.target.value });
                setCamera(e.target.value);
            }}
        >
            {cameras.map(iCamera => (
                <MenuItem
                    key={iCamera.value}
                    value={iCamera.value}
                    style={{ display: 'block', opacity: iCamera.enabled ? 1 : 0.5 }}
                >
                    <div>{iCamera.label}</div>
                    <div style={{ fontSize: 10, fontStyle: 'italic', opacity: 0.7 }}>{iCamera.subLabel}</div>
                    {!iCamera.enabled ? (
                        <div
                            style={{
                                fontSize: 10,
                                fontStyle: 'italic',
                                opacity: 0.7,
                                color: 'red',
                            }}
                        >
                            {RtspCamera.t('disabled')}
                        </div>
                    ) : null}
                </MenuItem>
            ))}
        </Select>
    ) : (
        <CircularProgress />
    );
};

interface RtspCameraState extends VisRxWidgetState {
    full: boolean;
    alive: boolean;
    loading: boolean;
}

export default class RtspCamera extends (window.visRxWidget as typeof VisRxWidget)<RtspCameraRxData, RtspCameraState> {
    private videoInterval: null | ReturnType<typeof setInterval> = null;
    private readonly videoRef: React.RefObject<HTMLCanvasElement | null>;
    private readonly fullVideoRef: React.RefObject<HTMLCanvasElement | null>;
    private currentCam: null | string = null;
    private subscribedOnAlive: null | string = null;
    private useMessages: boolean | undefined;

    constructor(props: VisRxWidgetProps) {
        super(props);
        this.videoRef = React.createRef<HTMLCanvasElement | null>();
        this.fullVideoRef = React.createRef<HTMLCanvasElement | null>();
        this.state = {
            ...this.state,
            full: false,
            alive: false,
            loading: false,
        };
    }

    static getI18nPrefix() {
        return 'cameras_';
    }

    static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplCameras2RtspCamera',
            visSet: 'cameras',
            visName: 'RTSP Camera',
            visWidgetLabel: 'RTSP Camera',
            visSetLabel: 'Cameras',
            visSetColor: '#9f0026',
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
                            name: 'width',
                            label: 'videoWidth',
                            type: 'number',
                            tooltip: 'tooltip_videoWidth',
                        },
                        {
                            label: 'Camera',
                            name: 'camera',
                            type: 'custom',
                            component: (field, data, setData, props) => (
                                <CameraField
                                    field={field}
                                    rtsp
                                    data={data}
                                    setData={setData}
                                    context={props.context}
                                />
                            ),
                        },
                    ],
                },
            ],
            visDefaultStyle: {
                width: '100%',
                height: 240,
                position: 'relative',
            },
            visPrev: 'widgets/cameras/img/prev_camera.png',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return RtspCamera.getWidgetInfo();
    }

    static drawCamera(ref: React.RefObject<HTMLCanvasElement | null>, data: string) {
        const canvas = ref.current;
        if (!canvas) {
            return;
        }
        const context = canvas.getContext('2d');
        try {
            const imageObj = new Image();
            imageObj.src = `data:image/jpeg;base64,${data}`;
            imageObj.onload = () => {
                canvas.width = imageObj.width;
                canvas.height = imageObj.height;
                // const hRatio = canvas.width  / imageObj.width;
                // const vRatio = canvas.height / imageObj.height;
                // const ratio  = Math.min(hRatio, vRatio);
                // const centerShiftX = (canvas.width - imageObj.width * ratio) / 2;
                // const centerShiftY = (canvas.height - imageObj.height * ratio) / 2;
                // context.clearRect(0, 0, canvas.width, canvas.height);
                context?.drawImage(
                    imageObj,
                    0,
                    0,
                    imageObj.width,
                    imageObj.height,
                    // centerShiftX,
                    // centerShiftY,
                    // imageObj.width * ratio,
                    // imageObj.height * ratio,
                );
            };
            imageObj.onerror = e => console.error(e);
        } catch (e) {
            console.error(e);
        }
    }

    updateStream = (id: string, state: ioBroker.State | null | undefined): void => {
        if (state?.val) {
            if (this.state.loading) {
                this.setState({ loading: false });
            }

            RtspCamera.drawCamera(this.videoRef, state.val as string);

            if (this.state.full) {
                RtspCamera.drawCamera(this.fullVideoRef, state.val as string);
            }
        }
    };

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

    onCameras = (data: { accepted?: boolean; error?: string } | string | null | undefined): void => {
        if (data) {
            // if it is success or error object
            if (typeof data === 'object' && (data.accepted || data.error)) {
                if (data.error) {
                    console.error(data.error);
                }
                return;
            }

            if (this.state.loading) {
                this.setState({ loading: false });
            }

            if (typeof data === 'string') {
                RtspCamera.drawCamera(this.videoRef, data);

                if (this.state.full) {
                    RtspCamera.drawCamera(this.fullVideoRef, data);
                }
            }
        }
    };

    async propertiesUpdate(): Promise<void> {
        if (this.useMessages === undefined) {
            this.useMessages = await this.props.context.socket.checkFeatureSupported('INSTANCE_MESSAGES');
        }
        if (this.state.rxData.camera !== this.currentCam) {
            // check if camera instance is alive
            if (this.state.alive) {
                // this.width = this.getImageWidth();
                // if we were subscribed, unsubscribe
                if (this.currentCam) {
                    const result = RtspCamera.getNameAndInstance(this.currentCam);
                    if (!result) {
                        return;
                    }
                    const { instanceId, name } = result;
                    if (this.useMessages) {
                        await this.props.context.socket.unsubscribeFromInstance(
                            `cameras.${instanceId}`,
                            `startCamera/${name}`,
                            this.onCameras,
                        );
                    } else {
                        // Bluefox 2023.09.28: delete this branch after js-controller 5.0.13 will be mainstream
                        await this.props.context.socket.setState(`cameras.${instanceId}.${name}.running`, {
                            val: false,
                        });
                        this.props.context.socket.unsubscribeState(
                            `cameras.${instanceId}.${name}.stream`,
                            this.updateStream,
                        );
                    }
                }

                // subscribe on new camera
                if (this.state.rxData.camera) {
                    this.setState({ loading: true });
                    const result = RtspCamera.getNameAndInstance(this.state.rxData.camera);
                    if (!result) {
                        return;
                    }
                    const { instanceId, name } = result;
                    if (this.useMessages) {
                        await this.props.context.socket.subscribeOnInstance(
                            `cameras.${instanceId}`,
                            `startCamera/${name}`,
                            { width: this.getImageWidth() },
                            this.onCameras,
                        );
                    } else {
                        await this.props.context.socket.subscribeState(
                            `cameras.${instanceId}.${name}.stream`,
                            this.updateStream,
                        );
                    }
                } else {
                    const canvas = this.videoRef.current;
                    if (canvas) {
                        const context = canvas.getContext('2d');
                        context?.clearRect(0, 0, canvas.width, canvas.height);
                    }
                }
                this.currentCam = this.state.rxData.camera;
            } else if (this.currentCam) {
                // not alive
                const result = RtspCamera.getNameAndInstance(this.currentCam);
                if (!result) {
                    return;
                }
                const { instanceId, name } = result;
                if (!this.useMessages) {
                    await this.props.context.socket.setState(`cameras.${instanceId}.${name}.running`, { val: false });
                    this.props.context.socket.unsubscribeState(
                        `cameras.${instanceId}.${name}.stream`,
                        this.updateStream,
                    );
                }
                this.currentCam = null;
            }
        } else if (this.currentCam && this.state.alive) {
            // refresh stream
            const result = RtspCamera.getNameAndInstance(this.currentCam);
            if (!result) {
                return;
            }
            const { instanceId, name } = result;
            if (this.useMessages) {
                await this.props.context.socket.subscribeOnInstance(
                    `cameras.${instanceId}`,
                    `startCamera/${name}`,
                    { width: this.getImageWidth() },
                    this.onCameras,
                );
            } else {
                await this.props.context.socket.setState(`cameras.${instanceId}.${name}.running`, {
                    val: true,
                    expire: 30, // expire in 30 seconds
                });
            }
        } else if (this.currentCam && !this.state.alive) {
            // not alive
            const result = RtspCamera.getNameAndInstance(this.currentCam);
            if (!result) {
                return;
            }
            const { instanceId, name } = result;
            if (!this.useMessages) {
                await this.props.context.socket.setState(`cameras.${instanceId}.${name}.running`, { val: false });
                this.props.context.socket.unsubscribeState(`cameras.${instanceId}.${name}.stream`, this.updateStream);
            }
            this.currentCam = null;
        }
    }

    getImageWidth(isFull?: boolean): number {
        isFull = isFull === undefined ? this.state.full : isFull;
        // if (parseInt(this.state.rxData.width, 10)) {
        //    return parseInt(this.state.rxData.width, 10);
        // }
        if (isFull && this.fullVideoRef.current?.parentElement) {
            return this.fullVideoRef.current.parentElement.clientWidth || 0;
        }

        return this.videoRef.current?.parentElement?.clientWidth || 0;
    }

    async subscribeOnAlive(): Promise<void> {
        const data = RtspCamera.getNameAndInstance(this.state.rxData.camera);

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

    onAliveChanged = (id: string, state: any): void => {
        const data = RtspCamera.getNameAndInstance(this.state.rxData.camera);
        if (data && id === `system.adapter.cameras.${data.instanceId}.alive`) {
            const alive = !!state?.val;
            if (alive !== this.state.alive) {
                this.setState({ alive }, () => this.propertiesUpdate());
            }
        }
    };

    async componentDidMount(): Promise<void> {
        super.componentDidMount();
        setTimeout(() => this.propertiesUpdate(), 100);

        await this.subscribeOnAlive();

        this.videoInterval = setInterval(() => this.propertiesUpdate(), 14000);
    }

    async onRxDataChanged(/* prevRxData */): Promise<void> {
        await this.subscribeOnAlive();
        await this.propertiesUpdate();
    }

    async componentWillUnmount(): Promise<void> {
        super.componentWillUnmount();
        if (this.videoInterval) {
            clearInterval(this.videoInterval);
            this.videoInterval = null;
        }

        if (this.subscribedOnAlive) {
            this.props.context.socket.unsubscribeState(
                `system.adapter.cameras.${this.subscribedOnAlive}.alive`,
                this.onAliveChanged,
            );
            this.subscribedOnAlive = null;
        }

        if (this.currentCam) {
            const result = RtspCamera.getNameAndInstance(this.currentCam);
            if (!result) {
                return;
            }
            const { instanceId, name } = result;
            if (this.useMessages) {
                this.props.context.socket
                    .unsubscribeFromInstance(`cameras.${instanceId}`, `startCamera/${name}`, this.onCameras)
                    .catch(e => console.error(e));
            }
        }
    }

    renderDialog(): React.JSX.Element | null {
        return this.state.full ? (
            <Dialog
                fullWidth
                maxWidth="lg"
                open={!0}
                onClose={() => this.setState({ full: false })}
            >
                <DialogTitle>{this.state.rxData.widgetTitle}</DialogTitle>
                <DialogContent>
                    <div style={styles.imageContainer}>
                        <canvas
                            ref={this.fullVideoRef}
                            style={styles.fullCamera}
                        ></canvas>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            this.setState({ full: false });
                        }}
                        startIcon={<Close />}
                        color="primary"
                        variant="contained"
                    >
                        {RtspCamera.t('Close')}
                    </Button>
                </DialogActions>
            </Dialog>
        ) : null;
    }

    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element | React.JSX.Element[] | null {
        super.renderWidgetBody(props);

        const content = (
            <div
                style={styles.imageContainer}
                onClick={() => this.setState({ full: true })}
            >
                {this.state.loading && this.state.alive && <CircularProgress style={styles.progress} />}
                {!this.state.alive ? (
                    <div style={{ position: 'absolute', top: 0, left: 0 }}>
                        {RtspCamera.t('Camera instance %s inactive', (this.state.rxData.camera || '').split('/')[0])}
                    </div>
                ) : null}
                <canvas
                    ref={this.videoRef}
                    style={styles.camera}
                ></canvas>
                {this.renderDialog()}
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
