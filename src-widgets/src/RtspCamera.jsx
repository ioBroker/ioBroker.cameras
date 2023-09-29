import React, { useEffect } from 'react';
import { withStyles } from '@mui/styles';
import {
    Button,
    CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select,
} from '@mui/material';

import { Close } from '@mui/icons-material';

import Generic from './Generic';

const styles = () => ({
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
});

export const CameraField = props => {
    const [cameras, setCameras] = React.useState(null);

    useEffect(() => {
        (async () => {
            const _cameras = [];
            const instances = await props.context.socket.getAdapterInstances('cameras');
            instances.forEach(instance => {
                const instanceId = instance._id.split('.').pop();
                instance.native.cameras.filter(camera => !props.rtsp || camera.type === 'rtsp' || camera.rtsp).forEach(camera => {
                    _cameras.push({
                        enabled: camera.enabled !== false,
                        value: `${instanceId}/${camera.name}`,
                        label: `cameras.${instanceId}/${camera.name}`,
                        subLabel: `${camera.desc}/${camera.ip}`,
                    });
                });
            });
            setCameras(_cameras);
        })();
    }, [props.context.socket, props.rtsp]);

    return cameras ? <Select
        fullWidth
        variant="standard"
        value={props.data.camera || ''}
        onChange={e => props.setData({ camera: e.target.value })}
    >
        {cameras.map(camera => <MenuItem key={camera.value} value={camera.value} style={{ display: 'block', opacity: camera.enabled ? 1 : 0.5 }}>
            <div>{camera.label}</div>
            <div style={{ fontSize: 10, fontStyle: 'italic', opacity: 0.7 }}>{camera.subLabel}</div>
            {!camera.enabled ? <div
                style={{
                    fontSize: 10,
                    fontStyle: 'italic',
                    opacity: 0.7,
                    color: 'red',
                }}
            >
                {Generic.t('disabled')}
            </div> : null}
        </MenuItem>)}
    </Select> : <CircularProgress />;
};

class RtspCamera extends Generic {
    constructor(props) {
        super(props);
        this.videoInterval = null;
        this.videoRef = React.createRef();
        this.fullVideoRef = React.createRef();
        this.currentCam = null;
        this.state.full = false;
        this.state.alive = false;
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
                            component: (field, data, setData, props) => <CameraField
                                field={field}
                                rtsp
                                data={data}
                                setData={setData}
                                context={props.context}
                            />,
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
    getWidgetInfo() {
        return RtspCamera.getWidgetInfo();
    }

    static drawCamera(ref, data) {
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

    updateStream = (id, state) => {
        if (state?.val) {
            if (this.state.loading) {
                this.setState({ loading: false });
            }

            RtspCamera.drawCamera(this.videoRef, state.val);
            if (this.state.full) {
                RtspCamera.drawCamera(this.fullVideoRef, state.val);
            }
        }
    };

    static getNameAndInstance(value) {
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

    onCameras = data => {
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
            RtspCamera.drawCamera(this.videoRef, data);
            if (this.state.full) {
                RtspCamera.drawCamera(this.fullVideoRef, data);
            }
        }
    };

    async propertiesUpdate() {
        if (this.useMessages === undefined) {
            this.useMessages = await this.props.context.socket.checkFeatureSupported('INSTANCE_MESSAGES');
        }
        if (this.state.rxData.camera !== this.currentCam) {
            // check if camera instance is alive
            if (this.state.alive) {
                // this.width = this.getImageWidth();
                // if we were subscribed, unsubscribe
                if (this.currentCam) {
                    const { instanceId, name } = RtspCamera.getNameAndInstance(this.currentCam);
                    if (this.useMessages) {
                        await this.props.context.socket.unsubscribeFromInstance(`cameras.${instanceId}`, `startCamera/${name}`, this.onCameras);
                    } else {
                        // Bluefox 2023.09.28: delete this branch after js-controller 5.0.13 will be mainstream
                        await this.props.context.socket.setState(`cameras.${instanceId}.${name}.running`, { val: false });
                        await this.props.context.socket.unsubscribeState(`cameras.${instanceId}.${name}.stream`, this.updateStream);
                    }
                }

                // subscribe on new camera
                if (this.state.rxData.camera) {
                    this.setState({ loading: true });
                    const { instanceId, name } = RtspCamera.getNameAndInstance(this.state.rxData.camera);
                    if (this.useMessages) {
                        await this.props.context.socket.subscribeOnInstance(`cameras.${instanceId}`, `startCamera/${name}`, { width: this.getImageWidth() }, this.onCameras);
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
                        context.clearRect(0, 0, canvas.width, canvas.height);
                    }
                }
                this.currentCam = this.state.rxData.camera;
            } else if (this.currentCam) {
                // not alive
                const { instanceId, name } = RtspCamera.getNameAndInstance(this.currentCam);
                if (!this.useMessages) {
                    await this.props.context.socket.setState(`cameras.${instanceId}.${name}.running`, { val: false });
                    await this.props.context.socket.unsubscribeState(`cameras.${instanceId}.${name}.stream`, this.updateStream);
                }
                this.currentCam = null;
            }
        } else if (this.currentCam && this.state.alive) {
            // refresh stream
            const { instanceId, name } = RtspCamera.getNameAndInstance(this.currentCam);
            if (this.useMessages) {
                await this.props.context.socket.subscribeOnInstance(`cameras.${instanceId}`, `startCamera/${name}`, { width: this.getImageWidth() }, this.onCameras);
            } else {
                await this.props.context.socket.setState(`cameras.${instanceId}.${name}.running`, {
                    val: true,
                    expire: 30, // expire in 30 seconds
                });
            }
        } else if (this.currentCam && !this.state.alive) {
            // not alive
            const { instanceId, name } = RtspCamera.getNameAndInstance(this.currentCam);
            if (!this.useMessages) {
                await this.props.context.socket.setState(`cameras.${instanceId}.${name}.running`, { val: false });
                await this.props.context.socket.unsubscribeState(`cameras.${instanceId}.${name}.stream`, this.updateStream);
            }
            this.currentCam = null;
        }
    }

    getImageWidth() {
        // if (parseInt(this.state.rxData.width, 10)) {
        //    return parseInt(this.state.rxData.width, 10);
        // }
        if (this.state.full) {
            return this.fullVideoRef.current?.parentElement.clientWidth || 0;
        }

        return this.videoRef.current?.parentElement.clientWidth || 0;
    }

    async subscribeOnAlive() {
        const data = RtspCamera.getNameAndInstance(this.state.rxData.camera);

        if (this.subsribedOnAlive !== (data ? data.instanceId : null)) {
            if (this.subsribedOnAlive) {
                this.props.context.socket.unsubscribeState(`system.adapter.cameras.${this.subsribedOnAlive}.alive`, this.onAliveChanged);
                this.subsribedOnAlive = '';
            }
            if (data) {
                this.props.context.socket.subscribeState(`system.adapter.cameras.${data.instanceId}.alive`, this.onAliveChanged);
                this.subsribedOnAlive = data.instanceId;
            }
        }
    }

    onAliveChanged = (id, state) => {
        const data = RtspCamera.getNameAndInstance(this.state.rxData.camera);
        if (data && id === `system.adapter.cameras.${data.instanceId}.alive`) {
            const alive = !!(state?.val);
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
        await this.subscribeOnAlive();
        await this.propertiesUpdate();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.videoInterval && clearInterval(this.videoInterval);
        this.videoInterval = null;

        if (this.subsribedOnAlive) {
            this.props.context.socket.unsubscribeState(`system.adapter.cameras.${this.subsribedOnAlive}.alive`, this.onAliveChanged);
            this.subsribedOnAlive = null;
        }

        if (this.currentCam) {
            const { instanceId, name } = RtspCamera.getNameAndInstance(this.currentCam);
            if (this.useMessages) {
                this.props.context.socket.unsubscribeFromInstance(`cameras.${instanceId}`, `startCamera/${name}`, this.onCameras)
                    .catch(e => console.error(e));
            }
        }
    }

    renderDialog() {
        return this.state.full ? <Dialog
            fullWidth
            maxWidth="lg"
            open={!0}
            onClose={() => this.setState({ full: false })}
        >
            <DialogTitle>{this.state.rxData.widgetTitle}</DialogTitle>
            <DialogContent>
                <div className={this.props.classes.imageContainer}>
                    <canvas
                        ref={this.fullVideoRef}
                        className={this.props.classes.fullCamera}
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
                    {Generic.t('Close')}
                </Button>
            </DialogActions>
        </Dialog> : null;
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);

        const content = <div
            className={this.props.classes.imageContainer}
            onClick={() => this.setState({ full: true })}
        >
            {this.state.loading && this.state.alive && <CircularProgress className={this.props.classes.progress} />}
            {!this.state.alive ? <div
                style={{ position: 'absolute', top: 0, left: 0 }}
            >
                {Generic.t('Camera instance %s inactive', (this.state.rxData.camera || '').split('/')[0])}
            </div> : null}
            <canvas
                ref={this.videoRef}
                className={this.props.classes.camera}
            ></canvas>
            {this.renderDialog()}
        </div>;

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

export default withStyles(styles)(RtspCamera);
