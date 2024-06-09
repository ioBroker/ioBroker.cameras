import React from 'react';
import { withStyles } from '@mui/styles';
import {
    Button,
    Dialog, DialogActions, DialogContent, DialogTitle,
} from '@mui/material';

import { Close } from '@mui/icons-material';

import Generic from './Generic';
import { CameraField } from './RtspCamera';

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

class SnapshotCamera extends Generic {
    constructor(props) {
        super(props);
        this.videoInterval = null;
        this.videoRef = React.createRef();
        this.fullVideoRef = React.createRef();
        this.currentCam = null;
        this.state.full = false;
        this.state.alive = false;
        this.state.error = false;
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
                            component: (field, data, setData, props) => <CameraField
                                field={field}
                                data={data}
                                setData={setData}
                                context={props.context}
                            />,
                        },
                        {
                            label: 'camera_in_dialog',
                            name: 'bigCamera',
                            type: 'custom',
                            component: (field, data, setData, props) => <CameraField
                                field={field}
                                data={data}
                                setData={setData}
                                context={props.context}
                            />,
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
    getWidgetInfo() {
        return SnapshotCamera.getWidgetInfo();
    }

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

    getImageWidth(isFull) {
        isFull = isFull === undefined ? this.state.full : isFull;
        if (isFull && this.fullVideoRef.current) {
            return this.fullVideoRef.current?.parentElement.clientWidth || 0;
        }

        return this.videoRef.current?.parentElement.clientWidth || 0;
    }

    async subscribeOnAlive() {
        const data = SnapshotCamera.getNameAndInstance(this.state.rxData.camera);

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

    updateImage = () => {
        if (!this.loading) {
            this.loading = true;
            if (this.videoRef.current) {
                this.videoRef.current.src = this.getUrl();
                this.videoRef.current.onload = e => {
                    if (e.target && !e.target.style.opacity !== '1') {
                        e.target.style.opacity = '1';
                    }
                    this.state.error && this.setState({ error: false });
                    this.loading = false;
                };
                this.videoRef.current.onerror = e => {
                    if (e.target && e.target.style.opacity !== '0') {
                        e.target.style.opacity = '0';
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
            this.pollingInterval = setInterval(this.updateImage, parseInt(this.state.full ? this.state.rxData.pollingIntervalFull : this.state.rxData.pollingInterval, 10) || 500);
        }
    }

    onAliveChanged = (id, state) => {
        const data = SnapshotCamera.getNameAndInstance(this.state.rxData.camera);
        if (data && id === `system.adapter.cameras.${data.instanceId}.alive`) {
            const alive = !!(state?.val);
            if (alive !== this.state.alive) {
                this.setState({ alive }, () => this.restartPollingInterval());
            }
        }
    };

    componentDidMount() {
        super.componentDidMount();

        this.subscribeOnAlive();
    }

    async onRxDataChanged(/* prevRxData */) {
        await this.subscribeOnAlive();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.pollingInterval && clearInterval(this.pollingInterval);
        this.pollingInterval = null;

        if (this.subsribedOnAlive) {
            this.props.context.socket.unsubscribeState(`system.adapter.cameras.${this.subsribedOnAlive}.alive`, this.onAliveChanged);
            this.subsribedOnAlive = null;
        }
    }

    renderDialog(url) {
        if (this.state.full && this.state.rxData.bigCamera) {
            url = this.getUrl(true) || url;
        }

        return this.state.full ? <Dialog
            fullWidth
            maxWidth="lg"
            open={!0}
            onClose={() => this.setState({ full: false }, () => this.restartPollingInterval())}
        >
            <DialogTitle>{this.state.rxData.widgetTitle}</DialogTitle>
            <DialogContent>
                <div className={this.props.classes.imageContainer}>
                    <img
                        src={url}
                        ref={this.fullVideoRef}
                        className={this.props.classes.fullCamera}
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
                    {Generic.t('Close')}
                </Button>
            </DialogActions>
        </Dialog> : null;
    }

    getUrl(isFull) {
        if (isFull && !this.state.rxData.bigCamera) {
            const url = `../cameras.${this.state.rxData.bigCamera}?`;
            const params = [
                `ts=${Date.now()}`,
                `w=${this.getImageWidth(true)}`,
                `noCache=${this.state.rxData.noCacheByFull}`,
                this.state.rxData.rotate ? `angle=${this.state.rxData.rotate}` : '',
            ];
            return url + params.filter(p => p).join('&');
        } else if (this.state.rxData.camera) {
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

    renderWidgetBody(props) {
        super.renderWidgetBody(props);

        const url = this.getUrl();

        const content = <div
            className={this.props.classes.imageContainer}
            onClick={() => !this.state.error && this.setState({ full: true }, () => this.restartPollingInterval())}
        >
            {!this.state.alive ? <div
                style={{ position: 'absolute', top: 20, left: 0 }}
            >
                {Generic.t('Camera instance %s inactive', (this.state.rxData.camera || '').split('/')[0])}
            </div> : null}
            {url ? <img
                src={url}
                ref={this.videoRef}
                className={this.props.classes.camera}
                alt={this.state.rxData.camera}
            /> : Generic.t('No camera selected')}
            {this.state.alive && this.state.error ? <div
                style={{
                    position: 'absolute',
                    top: 20,
                    left: 0,
                }}
            >
                <div style={{ color: 'red' }}>
                    {Generic.t('Cannot load URL')}
                    :
                </div>
                <div>{this.getUrl(true)}</div>
            </div> : null}
            {this.renderDialog(url)}
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

export default withStyles(styles)(SnapshotCamera);
