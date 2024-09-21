import React, { useEffect, type JSX } from 'react';
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

import VisRxWidget from './VisRxWidget';
import type { VisRxWidgetState, VisRxWidgetProps } from '@iobroker/types-vis-2/visRxWidget';
import type {
    RxRenderWidgetProps,
    RxWidgetInfoAttributesField,
    RxWidgetInfoCustomComponentContext,
    RxWidgetInfoCustomComponentProperties,
} from '@iobroker/types-vis-2';
import { I18n } from '@iobroker/adapter-react-v5';

export const TRANSLATION_PREFIX = 'cameras_';

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

interface RtspCameraState extends VisRxWidgetState {
    loading: boolean;
    full: boolean;
    alive: boolean;
}

interface CameraEntry {
    enabled: boolean;
    value: string;
    label: string;
    subLabel: string;
}

interface CameraFieldProps {
    data: Record<string, string>;
    field: RxWidgetInfoAttributesField;
    rtsp?: boolean;
    onDataChange: (newData: Partial<RtspCameraRxData>) => void;
    context: RxWidgetInfoCustomComponentContext;
    t: (word: string) => string;
}

export const CameraField = (props: CameraFieldProps): JSX.Element => {
    const [cameras, setCameras] = React.useState<CameraEntry[] | null>(null);
    const [camera, setCamera] = React.useState<string>(
        (props.data as unknown as Record<string, string>)[props.field.name] || '',
    );

    useEffect(() => {
        void (async () => {
            const _cameras: CameraEntry[] = [];
            const instances: ioBroker.InstanceObject[] = await props.context.socket.getAdapterInstances('cameras');
            instances.forEach(instance => {
                const instanceId = instance._id.split('.').pop();
                instance.native.cameras
                    .filter(
                        (iCamera: {
                            enabled: boolean;
                            name: string;
                            desc: string;
                            ip?: string;
                            type: string;
                            rtsp?: boolean;
                        }) => !props.rtsp || iCamera.type === 'rtsp' || iCamera.rtsp,
                    )
                    .forEach(
                        (iCamera: {
                            enabled: boolean;
                            name: string;
                            desc: string;
                            ip?: string;
                            type: string;
                            rtsp?: boolean;
                        }) => {
                            _cameras.push({
                                enabled: iCamera.enabled !== false,
                                value: `${instanceId}/${iCamera.name}`,
                                label: `cameras.${instanceId}/${iCamera.name}`,
                                subLabel: iCamera.desc ? `${iCamera.desc}/${iCamera.ip}` : iCamera.ip || '',
                            });
                        },
                    );
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
                props.onDataChange({ [props.field.name]: e.target.value });
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
                            {props.t('disabled')}
                        </div>
                    ) : null}
                </MenuItem>
            ))}
        </Select>
    ) : (
        <CircularProgress />
    );
};

class RtspCamera extends VisRxWidget<RtspCameraRxData, RtspCameraState> {
    private videoInterval: ReturnType<typeof setInterval> | null = null;

    private readonly videoRef: React.RefObject<HTMLCanvasElement>;

    private readonly fullVideoRef: React.RefObject<HTMLCanvasElement>;

    private currentCam: string | null = null;

    private useMessages: boolean | undefined;

    private subscribedOnAlive: string = '';

    constructor(props: VisRxWidgetProps) {
        super(props);
        this.videoRef = React.createRef();
        this.fullVideoRef = React.createRef();
        Object.assign(this.state, {
            full: false,
            alive: false,
        });
    }

    static getI18nPrefix(): string {
        return TRANSLATION_PREFIX;
    }

    static getWidgetInfo() {
        return {
            id: 'tplCameras2RtspCamera',
            visSet: 'cameras',
            visName: 'RTSP Camera',
            visWidgetLabel: 'RTSP Camera',
            visWidgetSetLabel: 'Cameras',
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
                            component: (
                                field: RxWidgetInfoAttributesField,
                                data: RtspCameraRxData,
                                onDataChange: (newData: Partial<RtspCameraRxData>) => void,
                                props: RxWidgetInfoCustomComponentProperties,
                            ) => (
                                <CameraField
                                    field={field}
                                    rtsp
                                    data={data as unknown as Record<string, string>}
                                    onDataChange={onDataChange}
                                    context={props.context}
                                    t={(word: string) => I18n.t(TRANSLATION_PREFIX + word)}
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

    // @ts-expect-error Fix later
    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return RtspCamera.getWidgetInfo();
    }

    static drawCamera(ref: React.RefObject<HTMLCanvasElement>, data: string) {
        const canvas = ref.current;
        if (!canvas) {
            return;
        }
        const context = canvas.getContext('2d');
        if (context) {
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
                    context.drawImage(
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
                imageObj.onerror = e => {
                    console.error(e);
                };
            } catch (e) {
                console.error(e);
            }
        }
    }

    updateStream = (_id: string, state: ioBroker.State | null | undefined) => {
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

    onCameras = (data: string | { accepted: boolean; error?: string }): void => {
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

            RtspCamera.drawCamera(this.videoRef, data as string);

            if (this.state.full) {
                RtspCamera.drawCamera(this.fullVideoRef, data as string);
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
                    if (result) {
                        const { instanceId, name } = result;
                        if (this.useMessages) {
                            await this.props.context.socket.unsubscribeFromInstance(
                                `cameras.${instanceId}`,
                                `startCamera/${name}`,
                                this.onCameras as (data: Record<string, any>) => void,
                            );
                        } else {
                            // Bluefox 2023.09.28: delete this branch after js-controller 5.0.13 will be mainstream
                            await this.props.context.socket.setState(`cameras.${instanceId}.${name}.running`, {
                                val: false,
                            });
                            await this.props.context.socket.unsubscribeState(
                                `cameras.${instanceId}.${name}.stream`,
                                this.updateStream,
                            );
                        }
                    }
                }

                // subscribe on new camera
                if (this.state.rxData.camera) {
                    this.setState({ loading: true });
                    const result = RtspCamera.getNameAndInstance(this.state.rxData.camera);
                    if (result) {
                        const { instanceId, name } = result;
                        if (this.useMessages) {
                            await this.props.context.socket.subscribeOnInstance(
                                `cameras.${instanceId}`,
                                `startCamera/${name}`,
                                { width: this.getImageWidth() },
                                this.onCameras as (data: Record<string, any>) => void,
                            );
                        } else {
                            await this.props.context.socket.subscribeState(
                                `cameras.${instanceId}.${name}.stream`,
                                this.updateStream,
                            );
                        }
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
                if (result) {
                    const { instanceId, name } = result;
                    if (!this.useMessages) {
                        await this.props.context.socket.setState(`cameras.${instanceId}.${name}.running`, {
                            val: false,
                        });
                        await this.props.context.socket.unsubscribeState(
                            `cameras.${instanceId}.${name}.stream`,
                            this.updateStream,
                        );
                    }
                }
                this.currentCam = null;
            }
        } else if (this.currentCam && this.state.alive) {
            // refresh stream
            const result = RtspCamera.getNameAndInstance(this.currentCam);
            if (result) {
                const { instanceId, name } = result;
                if (this.useMessages) {
                    await this.props.context.socket.subscribeOnInstance(
                        `cameras.${instanceId}`,
                        `startCamera/${name}`,
                        { width: this.getImageWidth() },
                        this.onCameras as (data: Record<string, any>) => void,
                    );
                } else {
                    await this.props.context.socket.setState(`cameras.${instanceId}.${name}.running`, {
                        val: true,
                        expire: 30, // expire in 30 seconds
                    });
                }
            }
        } else if (this.currentCam && !this.state.alive) {
            // not alive
            const result = RtspCamera.getNameAndInstance(this.currentCam);
            if (result) {
                const { instanceId, name } = result;
                if (!this.useMessages) {
                    await this.props.context.socket.setState(`cameras.${instanceId}.${name}.running`, { val: false });
                    await this.props.context.socket.unsubscribeState(
                        `cameras.${instanceId}.${name}.stream`,
                        this.updateStream,
                    );
                }
            }
            this.currentCam = null;
        }
    }

    getImageWidth(isFull?: boolean): number {
        isFull = isFull === undefined ? this.state.full : isFull;
        // if (parseInt(this.state.rxData.width, 10)) {
        //    return parseInt(this.state.rxData.width, 10);
        // }
        if (isFull && this.fullVideoRef.current) {
            return this.fullVideoRef.current.parentElement?.clientWidth || 0;
        }

        return this.videoRef.current?.parentElement?.clientWidth || 0;
    }

    subscribeOnAlive(): void {
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
                this.props.context.socket.subscribeState(
                    `system.adapter.cameras.${data.instanceId}.alive`,
                    this.onAliveChanged,
                );
                this.subscribedOnAlive = data.instanceId;
            }
        }
    }

    onAliveChanged = (id: string, state: ioBroker.State | null | undefined) => {
        const data = RtspCamera.getNameAndInstance(this.state.rxData.camera);
        if (data && id === `system.adapter.cameras.${data.instanceId}.alive`) {
            const alive = !!state?.val;
            if (alive !== this.state.alive) {
                this.setState({ alive }, () => this.propertiesUpdate());
            }
        }
    };

    componentDidMount() {
        super.componentDidMount();
        setTimeout(() => this.propertiesUpdate(), 100);

        this.subscribeOnAlive();

        this.videoInterval = setInterval(() => this.propertiesUpdate(), 14000);
    }

    async onRxDataChanged(/* prevRxData */) {
        this.subscribeOnAlive();
        await this.propertiesUpdate();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.videoInterval && clearInterval(this.videoInterval);
        this.videoInterval = null;

        if (this.subscribedOnAlive) {
            this.props.context.socket.unsubscribeState(
                `system.adapter.cameras.${this.subscribedOnAlive}.alive`,
                this.onAliveChanged,
            );
            this.subscribedOnAlive = '';
        }

        if (this.currentCam) {
            const result = RtspCamera.getNameAndInstance(this.currentCam);
            if (result) {
                const { instanceId, name } = result;
                if (this.useMessages) {
                    this.props.context.socket
                        .unsubscribeFromInstance(
                            `cameras.${instanceId}`,
                            `startCamera/${name}`,
                            this.onCameras as (data: Record<string, any>) => void,
                        )
                        .catch((e: Error) => console.error(e));
                }
            }
        }
    }

    renderDialog(): JSX.Element | null {
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
                        {I18n.t(`${TRANSLATION_PREFIX}Close`)}
                    </Button>
                </DialogActions>
            </Dialog>
        ) : null;
    }

    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element | null {
        super.renderWidgetBody(props);

        const content = (
            <div
                style={styles.imageContainer}
                onClick={() => this.setState({ full: true })}
            >
                {this.state.loading && this.state.alive && <CircularProgress style={styles.progress} />}
                {!this.state.alive ? (
                    <div style={{ position: 'absolute', top: 0, left: 0 }}>
                        {I18n.t(
                            `${TRANSLATION_PREFIX}Camera instance %s inactive`,
                            (this.state.rxData.camera || '').split('/')[0],
                        )}
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

export default RtspCamera;
