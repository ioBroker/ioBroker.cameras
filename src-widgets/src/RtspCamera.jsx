import React from 'react';
import { withStyles } from '@mui/styles';
import Hls from 'hls.js';

import Generic from './Generic';

const styles = () => ({
    camera: {
        width: '100%', height: '100%', objectFit: 'contain', cursor: 'pointer',
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

class RtspCamera extends Generic {
    constructor(props) {
        super(props);
        this.videoInterval = null;
        this.videoRef = React.createRef();
        this.state.videoUrl = null;
    }

    static getWidgetInfo() {
        return {
            id: 'tplCameras2RtspCamera',
            visSet: 'vis-2-widgets-cameras',
            visName: 'Rtsp Camera',
            visWidgetLabel: 'Rtsp Camera',
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
                            name: 'rtsp',
                            label: 'RTSP url',
                        },
                    ],
                },
            ],
            visDefaultStyle: {
                width: '100%',
                height: 240,
                position: 'relative',
            },
            visPrev: 'widgets/vis-2-widgets-material/img/prev_camera.png',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return RtspCamera.getWidgetInfo();
    }

    async propertiesUpdate() {
        if (this.state.rxData.rtsp) {
            const player = await this.props.context.socket.sendTo('cameras.0', 'webStreaming', { rtsp: this.state.rxData.rtsp });
            if (Hls.isSupported() && this.state.rxData.rtsp !== this.state.videoUrl) {
                this.props.context.socket.sendTo('cameras.0', 'stopWebStreaming', { rtsp: this.state.videoUrl });
                this.setState({ videoUrl: this.state.rxData.rtsp });
                const video = this.videoRef.current;
                const hls = new Hls();
                // bind them together
                hls.attachMedia(video);
                hls.on(Hls.Events.MEDIA_ATTACHED, () => {
                    console.log('video and hls.js are now bound together !');
                    hls.loadSource(player.url);
                });
            }
        } else {
            this.videoRef.current.src = '';
            if (this.state.videoUrl) {
                this.props.context.socket.sendTo('cameras.0', 'stopWebStreaming', { rtsp: this.state.videoUrl });
                this.setState({ videoUrl: null });
            }
        }
    }

    async componentDidMount() {
        super.componentDidMount();
        this.videoInterval = setInterval(async () => {
            this.propertiesUpdate();
        }, 20000);
        await this.propertiesUpdate();
    }

    async onRxDataChanged(/* prevRxData */) {
        await this.propertiesUpdate();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);

        const content = <div
            className={this.props.classes.imageContainer}
        >
            <video
                ref={this.videoRef}
                id="video"
                autoPlay="true"
                controls="controls"
                type="application/x-mpegURL"
                className={this.props.classes.camera}
                onPlay={() => {
                    // this.propertiesUpdate();
                }}
                onPause={() => {
                    // setTimeout(() => {
                    //     this.props.context.socket.sendTo(`cameras.${this.props.instance}`, 'stopWebStreaming', { rtsp: this.state.rxData.rtsp });
                    // }, 10000);
                }}
            ></video>
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
