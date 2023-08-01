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
    time: {
        textAlign: 'right',
        width: '100%',
        paddingTop: 20,
        fontSize: 12,
        opacity: 0.8,
        fontStyle: 'italic',
        position: 'absolute',
        bottom: 3,
        right: 3,
    },
    imageContainer: {
        flex: 1,
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
        height: '100%',
    },
});

const CameraField = props => {
    const [cameras, setCameras] = React.useState([]);

    useEffect(() => {
        (async () => {
            const _cameras = [];
            const instances = await props.context.socket.getAdapterInstances('cameras');
            instances.forEach(instance => {
                const instanceId = instance._id.split('.').pop();
                instance.native.cameras.filter(camera => camera.type === 'rtsp').forEach(camera => {
                    _cameras.push({
                        value: `${instanceId}/${camera.name}`,
                        label: `cameras.${instanceId}/${camera.name}`,
                        subLabel: `${camera.desc}/${camera.ip}`,
                    });
                });
            });
            setCameras(_cameras);
        })();
    }, [props.context.socket]);

    return <Select
        fullWidth
        variant="standard"
        value={props.data.camera || ''}
        onChange={e => props.setData({ camera: e.target.value })}
    >
        {cameras.map(camera => <MenuItem key={camera.value} value={camera.value} style={{ display: 'block' }}>
            <div>{camera.label}</div>
            <div style={{ fontSize: 10, fontStyle: 'italic', opacity: 0.7 }}>{camera.subLabel}</div>
        </MenuItem>)}
    </Select>;
};

class RtspCamera extends Generic {
    constructor(props) {
        super(props);
        this.videoInterval = null;
        this.videoRef = React.createRef();
        this.fullVideoRef = React.createRef();
        this.currentCam = null;
        this.state.full = false;
    }

    static getWidgetInfo() {
        return {
            id: 'tplCameras2RtspCamera',
            visSet: 'vis-2-widgets-cameras',
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
            this.width = this.getImageWidth();
            if (this.currentCam) {
                const { instanceId, name } = RtspCamera.getNameAndInstance(this.currentCam);
                if (this.useMessages) {
                    await this.props.context.socket.unsubscribeFromInstance(`cameras.${instanceId}`, `startCamera/${name}`, this.onCameras);
                } else {
                    await this.props.context.socket.setState(`cameras.${instanceId}.${name}.running`, { val: false });
                    await this.props.context.socket.unsubscribeState(`cameras.${instanceId}.${name}.stream`, this.updateStream);
                }
            }
            if (this.state.rxData.camera) {
                this.setState({ loading: true });
                const { instanceId, name } = RtspCamera.getNameAndInstance(this.state.rxData.camera);
                if (this.useMessages) {
                    await this.props.context.socket.subscribeOnInstance(`cameras.${instanceId}`, `startCamera/${name}`, { width: this.width }, this.onCameras);
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
            // refresh stream
            const { instanceId, name } = RtspCamera.getNameAndInstance(this.currentCam);
            if (this.useMessages) {
                await this.props.context.socket.subscribeOnInstance(`cameras.${instanceId}`, `startCamera/${name}`, { width: this.width }, this.onCameras);
            } else {
                await this.props.context.socket.setState(`cameras.${instanceId}.${name}.running`, {
                    val: true,
                    expire: 30, // expire in 30 seconds
                });
            }
        }
    }

    getImageWidth() {
        if (parseInt(this.state.rxData.width, 10)) {
            return parseInt(this.state.rxData.width, 10);
        }
        // if (this.state.full) {
        //     return this.fullVideoRef.current?.parentElement.clientWidth || 0;
        // }

        return this.videoRef.current?.parentElement.clientWidth || 0;
    }

    componentDidMount() {
        super.componentDidMount();
        setTimeout(() => this.propertiesUpdate(), 100);

        this.videoInterval = setInterval(() => this.propertiesUpdate(), 14000);
    }

    async onRxDataChanged(/* prevRxData */) {
        await this.propertiesUpdate();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.videoInterval && clearInterval(this.videoInterval);
        this.videoInterval = null;

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
                        id="full-video"
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
            {this.state.loading && <CircularProgress className={this.props.classes.progress} />}
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
