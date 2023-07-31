import React from 'react';
import { Card, CardContent } from '@mui/material';
import { withStyles } from '@mui/styles';
import Hls from 'hls.js';

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

class RtspCamera extends Generic {
    constructor(props) {
        super(props);
        this.videoInterval = null;
        this.videoRef = React.createRef();
        this.videoUrl = null;
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
                            name: 'camera',
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
            visPrev: 'widgets/cameras/img/prev_camera.png',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return RtspCamera.getWidgetInfo();
    }

    async propertiesUpdate() {
        if (this.state.rxData.camera) {
            const player = await this.props.context.socket.sendTo('cameras.0', 'webStreaming', { camera: this.state.rxData.camera });
            if (Hls.isSupported() && this.state.rxData.camera !== this.videoUrl) {
                this.props.context.socket.sendTo('cameras.0', 'stopWebStreaming', { camera: this.videoUrl });
                this.videoUrl = this.state.rxData.camera;
                const videoEl = this.videoRef.current;
                const hls = new Hls();
                // bind them together
                hls.attachMedia(videoEl);
                hls.on(Hls.Events.MEDIA_ATTACHED, () => {
                    console.log(`video and hls.js are now bound together! Loading ${player.url}`);
                    hls.loadSource(player.url);
                });
            }
        } else {
            this.videoRef.current.src = '';
            if (this.videoUrl) {
                this.props.context.socket.sendTo('cameras.0', 'stopWebStreaming', { camera: this.videoUrl });
                this.videoUrl = null;
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
        this.videoInterval && clearInterval(this.videoInterval);
        this.videoInterval = null;

        if (this.videoRef.current) {
            this.videoRef.current.src = '';
        }
        if (this.videoUrl) {
            this.props.context.socket.sendTo('cameras.0', 'stopWebStreaming', { camera: this.videoUrl });
            this.videoUrl = null;
        }
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);

        const content = <div
            className={this.props.classes.imageContainer}
        >
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
                id="video"
                autoPlay
                controls="controls"
                type="application/x-mpegURL"
                ref={this.videoRef}
                className={this.props.classes.camera}
                onPlay={() => {
                    // this.propertiesUpdate();
                }}
                onPause={() => {
                    // setTimeout(() => {
                    //     this.props.context.socket.sendTo(`cameras.${this.props.instance}`, 'stopWebStreaming', { rtsp: this.state.rxData.rtsp });
                    // }, 10000);
                }}
            >
                Your browser does not support the video tag.
            </video>
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
