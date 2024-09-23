import React, { Component, type JSX } from 'react';

import {
    Fab,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Checkbox,
    CircularProgress,
} from '@mui/material';

import {
    Delete as IconDelete,
    Edit as IconEdit,
    Add as IconAdd,
    ArrowUpward as IconUp,
    ArrowDownward as IconDown,
    CameraAlt as IconTest,
} from '@mui/icons-material';

import {
    type AdminConnection,
    I18n,
    type IobTheme,
    Message as MessageDialog,
    type ThemeType,
} from '@iobroker/adapter-react-v5';

import type GenericConfig from '../Types/GenericConfig';
import type { CameraType, GenericCameraSettings, GenericConfigProps } from '../Types/GenericConfig';
import URLImageConfig from '../Types/URLImage';
import URLBasicAuthImageConfig from '../Types/URLBasicAuthImage';
import RTSPImageConfig from '../Types/RTSPImage';
import RTSPReolinkE1Config from '../Types/RTSPReolinkE1';
import RTSPEufyConfig from '../Types/RTSPEufy';
import RTSPHiKamConfig from '../Types/RTSPHiKam';
import type { CameraSettings, CamerasInstanceNative } from '../types';

const TYPES: Record<CameraType, { Config: any; name: string; translated?: boolean; rtsp?: boolean }> = {
    url: { Config: URLImageConfig as any as GenericConfig<any>, name: 'URL' },
    urlBasicAuth: {
        Config: URLBasicAuthImageConfig as unknown as GenericConfig<any>,
        name: 'URL with basic auth',
    },
    rtsp: { Config: RTSPImageConfig as unknown as GenericConfig<any>, name: 'RTSP Snapshot' },
    reolinkE1: {
        Config: RTSPReolinkE1Config as unknown as GenericConfig<any>,
        name: 'Reolink E1 Snapshot',
        rtsp: true,
    },
    eufy: { Config: RTSPEufyConfig as unknown as GenericConfig<any>, name: 'Eufy Security' },
    hikam: { Config: RTSPHiKamConfig as unknown as GenericConfig<any>, name: 'HiKam / WiWiCam', rtsp: true },
};

const styles: Record<string, React.CSSProperties> = {
    tab: {
        width: '100%',
        height: '100%',
    },
    lineDiv: {
        width: '100%',
        paddingBottom: 5,
        borderBottom: '1px dashed gray',
    },
    lineCheck: {
        display: 'inline-block',
        width: 44,
    },
    lineCheckbox: {
        marginTop: 10,
    },
    lineText: {
        display: 'inline-block',
        width: 200,
    },
    lineDesc: {
        display: 'inline-block',
        width: 'calc(100% - 644px)',
    },
    lineType: {
        display: 'inline-block',
        width: 200,
    },
    lineEdit: {
        display: 'inline-block',
        marginLeft: 10,
        marginTop: 10,
    },
    lineUp: {
        display: 'inline-block',
        marginLeft: 10,
        marginTop: 10,
    },
    lineDown: {
        display: 'inline-block',
        marginLeft: 10,
        marginTop: 10,
    },
    lineDelete: {
        display: 'inline-block',
        marginLeft: 10,
        marginTop: 10,
    },
    lineUrl: {
        marginLeft: 200,
        opacity: 0.5,
        fontSize: 'small',
        fontStyle: 'italic',
    },
    type: {
        width: '100%',
    },
    name: {
        width: 'calc(100% - 10px)',
    },
    desc: {
        width: 'calc(100% - 10px)',
    },
    lineNoButtonUp: {
        display: 'inline-block',
        width: 40,
        marginLeft: 10,
    },
    lineNoButtonDown: {
        display: 'inline-block',
        width: 40,
        marginLeft: 10,
    },
    divConfig: {
        verticalAlign: 'top',
    },
    divTestCam: {
        flex: 1,
        verticalAlign: 'top',
        display: 'flex',
        flexDirection: 'column',
    },
    buttonIcon: {
        marginTop: 6,
    },
    buttonTest: {
        marginBottom: 8,
    },
    imgTest: {
        width: '100%',
        height: 'auto',
    },
    sampleUrl: {
        display: 'block',
        marginTop: 8,
    },
    link: {
        color: 'inherit',
        textDecoration: 'underline',
    },
};

interface ServerProps {
    decrypt: (textToDecrypt: string, cb: (decryptedText: string) => void) => void;
    encrypt: (textToEncrypt: string, cb: (encryptedText: string) => void) => void;
    native: CamerasInstanceNative;
    instance: number;
    adapterName: string;
    onChange: (attr: string, value: any, cb?: () => void) => void;
    socket: AdminConnection;
    themeType: ThemeType;
    instanceAlive: boolean;
    theme: IobTheme;
}

interface ServerState {
    editCam: string;
    editChanged: boolean;
    requesting: boolean;
    instanceAlive: boolean;
    webInstanceHost: string;
    message: string | undefined;
    editedSettings: string;
    editedSettingsOld: string;
    testImg: string | null;
}

class Server extends Component<ServerProps, ServerState> {
    constructor(props: ServerProps) {
        super(props);

        this.state = {
            editCam: '',
            editChanged: false,
            requesting: false,
            instanceAlive: this.props.instanceAlive,
            webInstanceHost: '',
            message: '',
            testImg: null,
            editedSettings: '',
            editedSettingsOld: '',
        };

        // translate all names once
        Object.keys(TYPES).forEach((type: string) => {
            if (TYPES[type as CameraType].name && !TYPES[type as CameraType].translated) {
                TYPES[type as CameraType].translated = true;
                TYPES[type as CameraType].name = I18n.t(TYPES[type as CameraType].name);
            }
        });
    }

    componentDidMount(): void {
        this.getWebInstances();
    }

    static ip2int(ip: string): number {
        return ip.split('.').reduce((ipInt, octet) => (ipInt << 8) + parseInt(octet, 10), 0) >>> 0;
    }

    static findNetworkAddressOfHost(obj: ioBroker.HostObject | null | undefined, localIp: string): string | null {
        const networkInterfaces = obj?.native?.hardware?.networkInterfaces;
        if (!networkInterfaces) {
            return null;
        }

        let hostIp: string | null = null;
        Object.keys(networkInterfaces).forEach(inter => {
            networkInterfaces[inter]?.forEach(ip => {
                if (ip.internal) {
                    return;
                } else if (localIp.includes(':') && ip.family !== 'IPv6') {
                    return;
                } else if (localIp.includes('.') && !localIp.match(/[^.\d]/) && ip.family !== 'IPv4') {
                    return;
                }
                if (localIp === '127.0.0.0' || localIp === 'localhost' || localIp.match(/[^.\d]/)) {
                    // if DNS name
                    hostIp = ip.address;
                } else {
                    if (
                        ip.family === 'IPv4' &&
                        localIp.includes('.') &&
                        (Server.ip2int(localIp) & Server.ip2int(ip.netmask)) ===
                            (Server.ip2int(ip.address) & Server.ip2int(ip.netmask))
                    ) {
                        hostIp = ip.address;
                    } else {
                        hostIp = ip.address;
                    }
                }
            });
        });

        if (!hostIp) {
            Object.keys(networkInterfaces).forEach(inter => {
                networkInterfaces[inter]?.forEach(ip => {
                    if (ip.internal) {
                        return;
                    } else if (localIp.includes(':') && ip.family !== 'IPv6') {
                        return;
                    } else if (localIp.includes('.') && !localIp.match(/[^.\d]/) && ip.family !== 'IPv4') {
                        return;
                    }
                    if (localIp === '127.0.0.0' || localIp === 'localhost' || localIp.match(/[^.\d]/)) {
                        // if DNS name
                        hostIp = ip.address;
                    } else {
                        hostIp = ip.address;
                    }
                });
            });
        }

        if (!hostIp) {
            Object.keys(networkInterfaces).forEach(inter => {
                networkInterfaces[inter]?.forEach(ip => {
                    if (ip.internal) {
                        return;
                    }
                    hostIp = ip.address;
                });
            });
        }

        return hostIp;
    }

    getWebInstances(): void {
        void this.props.socket.getAdapterInstances('web').then(async list => {
            let webInstance;
            if (this.props.native.webInstance === '*') {
                webInstance = list[0];
            } else {
                const instance = this.props.native.webInstance;
                webInstance = list.find(obj => obj._id.endsWith(instance));
            }
            if (webInstance) {
                webInstance.native = webInstance.native || {};
                if (!webInstance.native.bind || webInstance.native.bind === '0.0.0.0') {
                    // get current host
                    const host: ioBroker.HostObject | null | undefined = await this.props.socket.getObject(
                        `system.host.${webInstance.common.host}`,
                    );
                    // get ips on this host
                    const ip = Server.findNetworkAddressOfHost(host, window.location.hostname);

                    // but for now
                    webInstance.native.bind = ip || window.location.hostname;
                }
            }

            webInstance &&
                this.setState({ webInstanceHost: `${webInstance.native.bind}:${webInstance.native.port || 8082}` });
        });
    }

    renderMessage(): JSX.Element | null {
        if (this.state.message) {
            const text = this.state.message.split('\n').map((item, i) => <p key={i}>{item}</p>);

            return (
                <MessageDialog
                    // @ts-expect-error fixed in next adapter-v5
                    text={text}
                    onClose={() => this.setState({ message: '' })}
                />
            );
        }

        return null;
    }

    static getDerivedStateFromProps(props: ServerProps, state: ServerState): Partial<ServerState> | null {
        if (state.instanceAlive !== props.instanceAlive) {
            return { instanceAlive: props.instanceAlive };
        }
        return null;
    }

    onTest(): void {
        const settings = JSON.parse(this.state.editedSettings || this.state.editedSettingsOld);

        let timeout: ReturnType<typeof setTimeout> | null = setTimeout(
            () => {
                timeout = null;
                this.setState({ message: 'Timeout', requesting: false });
            },
            parseInt(settings.timeout || this.props.native.defaultTimeout, 10) || 1000,
        );

        this.setState({ requesting: true, testImg: null }, () => {
            void this.props.socket
                .sendTo(`${this.props.adapterName}.${this.props.instance}`, 'test', settings)
                .then(result => {
                    timeout && clearTimeout(timeout);
                    if (!result || !result.body || result.error) {
                        let error = result && result.error ? result.error : I18n.t('No answer');
                        if (typeof error !== 'string') {
                            error = JSON.stringify(error);
                        }
                        // hide password
                        error = error.replace(/\/\/([^:]+):[^@]+@/, '//$1:xxx@');

                        this.setState({ message: error, requesting: false });
                    } else {
                        this.setState({ testImg: result.body, requesting: false });
                    }
                });
        });
    }

    onCameraSettingsChanged(settings: CameraSettings): void {
        const oldSettings: CameraSettings = JSON.parse(this.state.editedSettingsOld);
        // apply changes
        settings = Object.assign(oldSettings, settings);
        const editedSettings: string = JSON.stringify(settings);

        if (this.state.editedSettingsOld === editedSettings) {
            this.setState({ editChanged: false, editedSettings: '' });
        } else if (this.state.editedSettingsOld !== editedSettings) {
            this.setState({ editChanged: true, editedSettings });
        }
    }

    renderConfigDialog(): JSX.Element | null {
        if (this.state.editCam) {
            const cam: CameraSettings = JSON.parse(this.state.editedSettings || this.state.editedSettingsOld);
            const Config: React.FC<GenericConfigProps> = TYPES[cam.type].Config;

            return (
                <Dialog
                    maxWidth="lg"
                    fullWidth
                    open={!0}
                    onClose={() => this.state.editCam && this.setState({ editCam: '', editChanged: false })}
                >
                    <DialogTitle>
                        {I18n.t('Edit camera %s [%s]', cam.name, cam.type)} - {cam.desc}
                    </DialogTitle>
                    <DialogContent>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <div style={styles.divConfig}>
                                <Config
                                    theme={this.props.theme}
                                    native={this.props.native}
                                    socket={this.props.socket}
                                    settings={cam}
                                    themeType={this.props.themeType}
                                    onChange={(settings: Record<string, any>) =>
                                        this.onCameraSettingsChanged(settings as CameraSettings)
                                    }
                                    encrypt={(value: string, cb: (text: string) => void) =>
                                        this.props.encrypt(value, cb)
                                    }
                                    decrypt={(value: string, cb: (text: string) => void) =>
                                        this.props.decrypt(value, cb)
                                    }
                                />
                                <br />
                                <TextField
                                    variant="standard"
                                    style={styles.username}
                                    label={I18n.t('Request timeout (ms)')}
                                    value={cam.timeout === undefined ? '' : cam.timeout}
                                    helperText={I18n.t('If empty or 0, use default settings.')}
                                    onChange={e => {
                                        const settings = JSON.parse(JSON.stringify(cam));
                                        settings.timeout = e.target.value;
                                        this.onCameraSettingsChanged(settings);
                                    }}
                                />
                                <br />
                                <TextField
                                    variant="standard"
                                    style={styles.username}
                                    label={I18n.t('Cache timeout (ms)')}
                                    value={cam.cacheTimeout === undefined ? '' : cam.cacheTimeout}
                                    helperText={I18n.t('If empty, use default settings. If 0, cache disabled')}
                                    onChange={e => {
                                        const settings = JSON.parse(JSON.stringify(cam));
                                        settings.cacheTimeout = e.target.value;
                                        this.onCameraSettingsChanged(settings);
                                    }}
                                />
                                <br />
                                <FormControlLabel
                                    label={I18n.t('Add time to screenshot')}
                                    control={
                                        <Checkbox
                                            checked={cam.addTime || false}
                                            onChange={e => {
                                                const settings = JSON.parse(JSON.stringify(cam));
                                                settings.addTime = e.target.checked;
                                                this.onCameraSettingsChanged(settings);
                                            }}
                                        />
                                    }
                                />
                                <br />
                                <TextField
                                    variant="standard"
                                    style={styles.username}
                                    label={I18n.t('Add title')}
                                    value={cam.title === undefined ? '' : cam.title}
                                    onChange={e => {
                                        const settings = JSON.parse(JSON.stringify(cam));
                                        settings.title = e.target.value;
                                        this.onCameraSettingsChanged(settings);
                                    }}
                                />
                                <div style={styles.sampleUrl}>
                                    {I18n.t('Web URL')}
                                    :&nbsp;
                                    <a
                                        style={styles.link}
                                        href={`http://${this.state.webInstanceHost}/${this.props.adapterName}.${this.props.instance}/${cam.name}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        URL: http://{this.state.webInstanceHost}/{this.props.adapterName}.
                                        {this.props.instance}/{cam.name}
                                    </a>
                                </div>
                            </div>
                            <div style={styles.divTestCam}>
                                <Button
                                    disabled={this.state.requesting || !this.state.instanceAlive}
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    style={styles.buttonTest}
                                    onClick={() => this.onTest()}
                                    startIcon={<IconTest />}
                                >
                                    {I18n.t('Test')}
                                </Button>
                                {this.state.testImg ? (
                                    <img
                                        alt="test"
                                        style={styles.imgTest}
                                        src={this.state.testImg}
                                    />
                                ) : null}
                                {this.state.requesting ? <CircularProgress /> : null}
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            disabled={!this.state.editChanged}
                            variant="contained"
                            onClick={() => {
                                const cameras: CameraSettings[] = JSON.parse(JSON.stringify(this.props.native.cameras));
                                if (this.state.editedSettings) {
                                    cameras[parseInt(this.state.editCam, 10)] = JSON.parse(this.state.editedSettings);
                                    this.props.onChange('cameras', cameras, () =>
                                        this.setState({ editCam: '', editChanged: false }),
                                    );
                                } else {
                                    this.setState({ editCam: '', editChanged: false });
                                }
                            }}
                            color="primary"
                        >
                            {I18n.t('Apply')}
                        </Button>
                        <Button
                            color="grey"
                            variant="contained"
                            onClick={() => this.setState({ editCam: '', editChanged: false })}
                        >
                            {I18n.t('Cancel')}
                        </Button>
                    </DialogActions>
                </Dialog>
            );
        }
        return null;
    }

    renderCameraButtons(i: number): JSX.Element[] {
        return [
            <Fab
                size="small"
                key="edit"
                style={styles.lineEdit}
                onClick={() => {
                    const editedSettingsOld = JSON.stringify(this.props.native.cameras[i]);
                    this.setState({ editCam: i.toString(), editedSettingsOld, editedSettings: '', testImg: '' });
                }}
            >
                <IconEdit style={styles.buttonIcon} />
            </Fab>,

            i ? (
                <Fab
                    size="small"
                    key="up"
                    style={styles.lineUp}
                    onClick={() => {
                        const cameras: CameraSettings[] = JSON.parse(JSON.stringify(this.props.native.cameras));
                        const cam = cameras[i];
                        cameras.splice(i, 1);
                        cameras.splice(i - 1, 0, cam);
                        this.props.onChange('cameras', cameras);
                    }}
                >
                    <IconUp style={styles.buttonIcon} />
                </Fab>
            ) : (
                <div
                    key="upEmpty"
                    style={styles.lineNoButtonUp}
                >
                    &nbsp;
                </div>
            ),

            i !== this.props.native.cameras.length - 1 ? (
                <Fab
                    size="small"
                    key="down"
                    style={styles.lineDown}
                    onClick={() => {
                        const cameras: CameraSettings[] = JSON.parse(JSON.stringify(this.props.native.cameras));
                        const cam = cameras[i];
                        cameras.splice(i, 1);
                        cameras.splice(i + 1, 0, cam);
                        this.props.onChange('cameras', cameras);
                    }}
                >
                    <IconDown style={styles.buttonIcon} />
                </Fab>
            ) : (
                <div
                    key="downEmpty"
                    style={styles.lineNoButtonDown}
                >
                    &nbsp;
                </div>
            ),

            <Fab
                size="small"
                key="delete"
                style={styles.lineDelete}
                onClick={() => {
                    const cameras: CameraSettings[] = JSON.parse(JSON.stringify(this.props.native.cameras));
                    cameras.splice(i, 1);
                    this.props.onChange('cameras', cameras);
                }}
            >
                <IconDelete style={styles.buttonIcon} />
            </Fab>,
        ];
    }

    renderCamera(cam: CameraSettings, i: number): JSX.Element {
        const error = !!this.props.native.cameras.find((c, ii: number) => c.name === cam.name && ii !== i);
        this.props.native.cameras.forEach((cam, i: number) => {
            if (!cam.id) {
                cam.id = Date.now() + i;
            }
        });

        let description = cam.url || '';
        if (description) {
            // remove password
            const m = description.match(/^https?:\/\/([^@]+)@/);
            if (m && m[1]) {
                description = description.replace(`${m[1]}@`, '');
            }
        }

        return (
            <div
                key={`cam${cam.id}`}
                style={{ ...styles.lineDiv, opacity: cam.enabled === false ? 0.5 : 1 }}
            >
                <div style={styles.lineCheck}>
                    <Checkbox
                        style={styles.lineCheckbox}
                        checked={cam.enabled !== false}
                        onChange={() => {
                            const cameras: CameraSettings[] = JSON.parse(JSON.stringify(this.props.native.cameras));
                            cameras[i].enabled = cameras[i].enabled === undefined ? false : !cameras[i].enabled;
                            this.props.onChange('cameras', cameras);
                        }}
                    />
                </div>
                <div style={styles.lineText}>
                    <TextField
                        variant="standard"
                        style={styles.name}
                        label={I18n.t('Name')}
                        error={error}
                        value={cam.name || ''}
                        helperText={error ? I18n.t('Duplicate name') : ''}
                        onChange={e => {
                            const cameras: CameraSettings[] = JSON.parse(JSON.stringify(this.props.native.cameras));
                            cameras[i].name = e.target.value.replace(/[^-_\da-zA-Z]/g, '_');
                            this.props.onChange('cameras', cameras);
                        }}
                    />
                </div>
                <div style={styles.lineDesc}>
                    <TextField
                        variant="standard"
                        style={styles.desc}
                        label={I18n.t('Description')}
                        value={cam.desc || ''}
                        onChange={e => {
                            const cameras: CameraSettings[] = JSON.parse(JSON.stringify(this.props.native.cameras));
                            cameras[i].desc = e.target.value;
                            this.props.onChange('cameras', cameras);
                        }}
                    />
                </div>
                <div style={styles.lineType}>
                    <FormControl
                        style={styles.type}
                        variant="standard"
                    >
                        <InputLabel>{I18n.t('Type')}</InputLabel>
                        <Select
                            variant="standard"
                            value={cam.type || ''}
                            onChange={e => {
                                const cameras: GenericCameraSettings[] = JSON.parse(
                                    JSON.stringify(this.props.native.cameras),
                                );
                                const camera = cameras[i];
                                cameras[i] = {
                                    id: camera.id,
                                    type: e.target.value as CameraType,
                                    desc: camera.desc,
                                    name: camera.name,
                                    enabled: camera.enabled,
                                    ip: camera.ip,
                                    rtsp: TYPES[e.target.value as CameraType].rtsp,
                                };
                                this.props.onChange('cameras', cameras);
                            }}
                        >
                            {Object.keys(TYPES).map(type => (
                                <MenuItem
                                    key={type}
                                    value={type}
                                >
                                    {TYPES[type as CameraType].name || type}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>
                {this.renderCameraButtons(i)}
                {description ? <div style={styles.lineUrl}>{description}</div> : null}
            </div>
        );
    }

    render(): JSX.Element {
        return (
            <div style={styles.tab}>
                <Fab
                    size="small"
                    title={I18n.t('Add new camera')}
                    onClick={() => {
                        const cameras: GenericCameraSettings[] = JSON.parse(JSON.stringify(this.props.native.cameras));
                        let i = 1;
                        while (cameras.find(cam => cam.name === `cam${i}`)) {
                            i++;
                        }
                        cameras.push({ name: `cam${i}`, type: 'url', id: Date.now() });
                        this.props.onChange('cameras', cameras);
                    }}
                >
                    <IconAdd />
                </Fab>
                {this.props.native.cameras
                    ? this.props.native.cameras.map((cam, i: number) => this.renderCamera(cam, i))
                    : null}
                {this.renderConfigDialog()}
                {this.renderMessage()}
            </div>
        );
    }
}

export default Server;
