import React, { useEffect } from 'react';
import {
    Card, CardContent, MenuItem, Select,
} from '@mui/material';
import { withStyles } from '@mui/styles';

import Generic from './Generic';

const styles = () => ({
    camera: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        cursor: 'pointer',
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
                        instanceId,
                        name: camera.name,
                        ip: camera.ip,
                        desc: camera.desc,
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
        {cameras.map(camera => <MenuItem key={camera.name} value={camera}>
            <div>{`cameras.${camera.instanceId}.${camera.name}`}</div>
            <div style={{ fontSize: 10, fontStyle: 'italic', opacity: 0.7 }}>{`${camera.desc}/${camera.ip}`}</div>
        </MenuItem>)}
    </Select>;
};

class RtspCamera extends Generic {
    constructor(props) {
        super(props);
        this.videoInterval = null;
        this.videoRef = React.createRef();
        this.currentCam = null;
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

    updateStream = (id, state) => {
        const canvas = this.videoRef.current;
        const context = canvas.getContext('2d');
        try {
            const imageObj = new Image();
            imageObj.src = `data:image/jpeg;base64,${state.val}`;
            imageObj.onload = () => {
                const hRatio = canvas.width  / imageObj.width;
                const vRatio =  canvas.height / imageObj.height;
                const ratio  = Math.min(hRatio, vRatio);
                const centerShiftX = (canvas.width - imageObj.width * ratio) / 2;
                const centerShiftY = (canvas.height - imageObj.height * ratio) / 2;
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.drawImage(
                    imageObj,
                    0,
                    0,
                    imageObj.width,
                    imageObj.height,
                    centerShiftX,
                    centerShiftY,
                    imageObj.width * ratio,
                    imageObj.height * ratio,
                );
            };
            imageObj.onerror = e => {
                console.error(e);
            };
        } catch (e) {
            console.error(e);
        }
    };

    async propertiesUpdate() {
        if (this.state.rxData.camera?.name !== this.currentCam?.name) {
            if (this.currentCam?.name) {
                this.props.context.socket.setState(`cameras.${this.currentCam.instanceId}.${this.currentCam.name}.running`, { val: false });
                this.props.context.socket.unsubscribeState(`cameras.${this.currentCam.instanceId}.${this.currentCam.name}.stream`, this.updateStream);
            }
            if (!this.state.rxData.camera?.name) {
                const canvas = this.videoRef.current;
                const context = canvas.getContext('2d');
                context.clearRect(0, 0, canvas.width, canvas.height);
            }
            this.props.context.socket.subscribeState(
                `cameras.${this.state.rxData.camera.instanceId}.${this.state.rxData.camera.name}.stream`,
                this.updateStream,
            );
            this.currentCam = this.state.rxData.camera;
        }
        if (this.currentCam?.name) {
            this.props.context.socket.setState(`cameras.${this.state.rxData.camera.instanceId}.${this.state.rxData.camera.name}.running`, {
                val: true,
                expire: 30,
            });
        }
    }

    componentDidMount() {
        super.componentDidMount();
        this.propertiesUpdate()
            .catch(e => console.error(e));
        this.videoInterval = setInterval(() => {
            this.propertiesUpdate();
        }, 10000);
    }

    async onRxDataChanged(/* prevRxData */) {
        await this.propertiesUpdate();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.videoInterval && clearInterval(this.videoInterval);
        this.videoInterval = null;
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);

        const content = <div
            className={this.props.classes.imageContainer}
        >
            <canvas
                id="video"
                ref={this.videoRef}
                className={this.props.classes.camera}
            ></canvas>
        </div>;

        if (this.state.rxData.noCard || props.widget.usedInWidget) {
            return content;
        }

        return this.wrapContent(content, null, {
            boxSizing: 'border-box',
            paddingBottom: 10,
            height: '100%',
        }, null, null, { Card, CardContent });
    }
}

export default withStyles(styles)(RtspCamera);
