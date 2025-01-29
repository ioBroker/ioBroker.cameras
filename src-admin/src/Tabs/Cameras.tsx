import React, { Component } from 'react';

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
    IconButton,
    Box,
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

import URLImage from '../Types/URLImage';
import URLBasicAuthImage from '../Types/URLBasicAuthImage';
import RTSPImageConfig from '../Types/RTSPImage';
import RTSPReolinkE1Config from '../Types/RTSPReolinkE1';
import RTSPEufyConfig from '../Types/RTSPEufy';
import RTSPHiKamConfig from '../Types/RTSPHiKam';
import type { CamerasAdapterConfig, CameraConfig, CameraConfigAny, CameraType } from '../types';
import type { ConfigProps } from '../Types/ConfigGeneric';
// eslint-disable-next-line @/no-duplicate-imports,no-duplicate-imports
import type ConfigGeneric from '../Types/ConfigGeneric';

interface IConfigGeneric extends ConfigGeneric<any> {
    readonly isRtsp: boolean;
}

const TYPES: Record<CameraType, { Config: IConfigGeneric; name: string; translated?: boolean; rtsp?: boolean }> = {
    url: { Config: URLImage as unknown as IConfigGeneric, name: 'URL' },
    urlBasicAuth: { Config: URLBasicAuthImage as unknown as IConfigGeneric, name: 'URL with basic auth' },
    rtsp: { Config: RTSPImageConfig as unknown as IConfigGeneric, name: 'RTSP Snapshot' },
    reolinkE1: { Config: RTSPReolinkE1Config as unknown as IConfigGeneric, name: 'Reolink E1 Snapshot' },
    eufy: { Config: RTSPEufyConfig as unknown as IConfigGeneric, name: 'Eufy Security' },
    hikam: { Config: RTSPHiKamConfig as unknown as IConfigGeneric, name: 'HiKam / WiWiCam' },
};

const styles: Record<string, any> = {
    tab: {
        width: '100%',
        height: '100%',
    },
    lineDiv: {
        width: '100%',
        paddingTop: 5,
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
        flexGrow: 1,
    },
    lineType: {
        display: 'inline-block',
        width: 200,
    },
    lineEdit: {
        display: 'inline-block',
        marginTop: 10,
    },
    lineUp: {
        display: 'inline-block',
        marginTop: 10,
    },
    lineDown: {
        display: 'inline-block',
        marginTop: 10,
    },
    lineDelete: {
        display: 'inline-block',
        marginTop: 10,
    },
    lineUrl: (theme: IobTheme): React.CSSProperties => ({
        marginLeft: '48px',
        fontSize: 'small',
        fontStyle: 'italic',
        color: theme.palette.text.disabled,
    }),
    lineNoButtonUp: {
        display: 'inline-block',
        width: 34,
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

interface CamerasProps {
    decrypt: (text: string, callback: (decrypted: string) => void) => void;
    encrypt: (text: string, callback: (encrypted: string) => void) => void;
    native: CamerasAdapterConfig;
    instanceAlive: boolean;
    instance: number;
    adapterName: string;
    onError?: (error: string) => void;
    onLoad?: () => void;
    onChange: (attr: string, value: any, cb?: () => void) => void;
    socket: AdminConnection;
    themeType: ThemeType;
    theme: IobTheme;
}

interface CamerasState {
    editCam: number | false;
    editChanged: boolean;
    requesting: boolean;
    instanceAlive: boolean;
    webInstanceHost: string;
    editedSettings: string | null;
    editedSettingsOld: string | null;
    message: string;
    testImg: string | null;
}

export default class Cameras extends Component<CamerasProps, CamerasState> {
    constructor(props: CamerasProps) {
        super(props);

        this.state = {
            editCam: false,
            editChanged: false,
            requesting: false,
            instanceAlive: this.props.instanceAlive,
            webInstanceHost: '',
            editedSettings: null,
            editedSettingsOld: null,
            message: '',
            testImg: null,
        };

        // translate all names once
        Object.keys(TYPES).forEach((type: CameraType): void => {
            if (TYPES[type].name && !TYPES[type].translated) {
                TYPES[type].translated = true;
                TYPES[type].name = I18n.t(TYPES[type].name);
                if (TYPES[type].Config.isRtsp) {
                    TYPES[type].rtsp = true;
                }
            }
        });
    }

    componentDidMount(): void {
        this.getWebInstances().catch(e => this.props.onError?.(e));
    }

    static ip2int(ip: string): number {
        return ip.split('.').reduce((ipInt, octet) => (ipInt << 8) + parseInt(octet, 10), 0) >>> 0;
    }

    static findNetworkAddressOfHost(obj: ioBroker.HostObject, localIp: string): string | undefined {
        const networkInterfaces = obj?.native?.hardware?.networkInterfaces;
        if (!networkInterfaces) {
            return;
        }

        let hostIp: string | undefined;
        Object.keys(networkInterfaces).forEach(inter => {
            networkInterfaces[inter]?.forEach(ip => {
                if (ip.internal) {
                    return;
                }
                if (localIp.includes(':') && ip.family !== 'IPv6') {
                    return;
                }
                if (localIp.includes('.') && !localIp.match(/[^.\d]/) && ip.family !== 'IPv4') {
                    return;
                }
                if (localIp === '127.0.0.0' || localIp === 'localhost' || localIp.match(/[^.\d]/)) {
                    // if DNS name
                    hostIp = ip.address;
                } else {
                    if (
                        ip.family === 'IPv4' &&
                        localIp.includes('.') &&
                        (Cameras.ip2int(localIp) & Cameras.ip2int(ip.netmask)) ===
                            (Cameras.ip2int(ip.address) & Cameras.ip2int(ip.netmask))
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
                    }
                    if (localIp.includes(':') && ip.family !== 'IPv6') {
                        return;
                    }
                    if (localIp.includes('.') && !localIp.match(/[^.\d]/) && ip.family !== 'IPv4') {
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

    async getWebInstances(): Promise<void> {
        const list = await this.props.socket.getAdapterInstances('web');
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
                const host = await this.props.socket.getObject(`system.host.${webInstance.common.host}`);
                // get ips on this host
                const ip = host && Cameras.findNetworkAddressOfHost(host, window.location.hostname);

                // but for now
                webInstance.native.bind = ip || window.location.hostname;
            }
        }

        if (webInstance) {
            this.setState({ webInstanceHost: `${webInstance.native.bind}:${webInstance.native.port || 8082}` });
        }
    }

    renderMessage(): React.JSX.Element | null {
        if (this.state.message) {
            const text = this.state.message.split('\n').map((item, i) => <p key={i}>{item}</p>);

            return (
                <MessageDialog
                    text={text}
                    onClose={() => this.setState({ message: '' })}
                />
            );
        }

        return null;
    }

    static getDerivedStateFromProps(props: CamerasProps, state: CamerasState): Partial<CamerasState> | null {
        if (state.instanceAlive !== props.instanceAlive) {
            return { instanceAlive: props.instanceAlive };
        }

        return null;
    }

    onTest(): void {
        const settings: CameraConfig = JSON.parse(this.state.editedSettings || this.state.editedSettingsOld || '{}');

        let timeout: ReturnType<typeof setTimeout> | null = setTimeout(
            () => {
                timeout = null;
                this.setState({ message: 'Timeout', requesting: false });
            },
            parseInt((settings.timeout as string) || (this.props.native.defaultTimeout as string), 10) || 5_000,
        );

        this.setState({ requesting: true, testImg: null }, async () => {
            const result = await this.props.socket.sendTo(
                `${this.props.adapterName}.${this.props.instance}`,
                'test',
                settings,
            );

            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
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
    }

    onCameraSettingsChanged(settings: CameraConfig): void {
        const oldSettings: CameraConfig = JSON.parse(this.state.editedSettingsOld || '{}');
        // apply changes
        settings = Object.assign(oldSettings, settings);
        const editedSettings = JSON.stringify(settings);

        if (this.state.editedSettingsOld === editedSettings) {
            this.setState({ editChanged: false, editedSettings: null });
        } else if (this.state.editedSettingsOld !== editedSettings) {
            this.setState({ editChanged: true, editedSettings });
        }
    }

    renderConfigDialog(): React.JSX.Element | null {
        if (this.state.editCam !== false) {
            const cam: CameraConfig = JSON.parse(this.state.editedSettings || this.state.editedSettingsOld || '{}');
            const Config: React.FC<ConfigProps<CameraConfig>> = (TYPES[cam.type] || TYPES.url)
                .Config as unknown as React.FC<ConfigProps<CameraConfig>>;

            return (
                <Dialog
                    maxWidth="lg"
                    fullWidth
                    open={!0}
                    onClose={() => this.state.editCam !== null && this.setState({ editCam: false, editChanged: false })}
                >
                    <DialogTitle>
                        {I18n.t('Edit camera %s [%s]', cam.name, cam.type)} - {cam.desc}
                    </DialogTitle>
                    <DialogContent>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <div style={styles.divConfig}>
                                <Config
                                    native={this.props.native}
                                    socket={this.props.socket}
                                    settings={cam}
                                    themeType={this.props.themeType}
                                    theme={this.props.theme}
                                    onChange={(settings: CameraConfig): void => this.onCameraSettingsChanged(settings)}
                                    encrypt={(value: string, cb: (encrypted: string) => void) =>
                                        this.props.encrypt(value, cb)
                                    }
                                    decrypt={(value: string, cb: (decrypted: string) => void) =>
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
                                        const settings: CameraConfig = JSON.parse(JSON.stringify(cam));
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
                                        const settings: CameraConfig = JSON.parse(JSON.stringify(cam));
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
                                                const settings: CameraConfig = JSON.parse(JSON.stringify(cam));
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
                                        const settings: CameraConfig = JSON.parse(JSON.stringify(cam));
                                        settings.title = e.target.value;
                                        this.onCameraSettingsChanged(settings);
                                    }}
                                />
                                <div style={styles.sampleUrl}>
                                    {I18n.t('Local URL')}
                                    :&nbsp;
                                    <a
                                        style={styles.link}
                                        href={`http://${this.props.native.bind}:${this.props.native.port}/${cam.name}?key=${this.props.native.key}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        URL: http://{this.props.native.bind}:{this.props.native.port}/{cam.name}?key=
                                        {this.props.native.key}
                                    </a>
                                </div>
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
                                const cameras: CameraConfigAny[] = JSON.parse(
                                    JSON.stringify(this.props.native.cameras),
                                );
                                if (this.state.editedSettings) {
                                    cameras[this.state.editCam as number] = JSON.parse(this.state.editedSettings);
                                    this.props.onChange('cameras', cameras, () =>
                                        this.setState({ editCam: false, editChanged: false }),
                                    );
                                } else {
                                    this.setState({ editCam: false, editChanged: false });
                                }
                            }}
                            color="primary"
                        >
                            {I18n.t('Apply')}
                        </Button>
                        <Button
                            color="grey"
                            variant="contained"
                            onClick={() => this.setState({ editCam: false, editChanged: false })}
                        >
                            {I18n.t('Cancel')}
                        </Button>
                    </DialogActions>
                </Dialog>
            );
        }
        return null;
    }

    renderCameraButtons(cam: CameraConfig, i: number): React.JSX.Element {
        return (
            <div style={{ display: 'flex', gap: 8, width: 160 }}>
                <IconButton
                    size="small"
                    key="edit"
                    style={styles.lineEdit}
                    onClick={() =>
                        this.setState({
                            editCam: i,
                            editedSettingsOld: JSON.stringify(cam),
                            editedSettings: null,
                            testImg: null,
                        })
                    }
                >
                    <IconEdit style={styles.buttonIcon} />
                </IconButton>

                {i ? (
                    <IconButton
                        size="small"
                        key="up"
                        style={styles.lineUp}
                        onClick={() => {
                            const cameras: CameraConfigAny[] = JSON.parse(JSON.stringify(this.props.native.cameras));
                            const cam = cameras[i];
                            cameras.splice(i, 1);
                            cameras.splice(i - 1, 0, cam);
                            this.props.onChange('cameras', cameras);
                        }}
                    >
                        <IconUp style={styles.buttonIcon} />
                    </IconButton>
                ) : (
                    <div
                        key="upEmpty"
                        style={styles.lineNoButtonUp}
                    >
                        &nbsp;
                    </div>
                )}

                {i !== this.props.native.cameras.length - 1 ? (
                    <IconButton
                        size="small"
                        key="down"
                        style={styles.lineDown}
                        onClick={() => {
                            const cameras: CameraConfigAny[] = JSON.parse(JSON.stringify(this.props.native.cameras));
                            const cam = cameras[i];
                            cameras.splice(i, 1);
                            cameras.splice(i + 1, 0, cam);
                            this.props.onChange('cameras', cameras);
                        }}
                    >
                        <IconDown style={styles.buttonIcon} />
                    </IconButton>
                ) : (
                    <div
                        key="downEmpty"
                        style={styles.lineNoButtonDown}
                    >
                        &nbsp;
                    </div>
                )}

                <IconButton
                    size="small"
                    key="delete"
                    style={styles.lineDelete}
                    onClick={() => {
                        const cameras: CameraConfigAny[] = JSON.parse(JSON.stringify(this.props.native.cameras));
                        cameras.splice(i, 1);
                        this.props.onChange('cameras', cameras);
                    }}
                >
                    <IconDelete style={styles.buttonIcon} />
                </IconButton>
            </div>
        );
    }

    renderCamera(cam: CameraConfigAny, i: number): React.JSX.Element {
        const error = this.props.native.cameras.find((c, ii) => c.name === cam.name && ii !== i);
        this.props.native.cameras.forEach((cam, i) => {
            if (!cam.id) {
                cam.id = Date.now() + i;
            }
        });

        let description = (cam as any).url || '';
        if (description) {
            // remove password
            const m = description.match(/^https?:\/\/([^@]+)@/);
            if (m && m[1]) {
                description = description.replace(`${m[1]}@`, '');
            }
        }

        return (
            <div
                style={{ ...styles.lineDiv, opacity: cam.enabled === false ? 0.5 : 1 }}
                key={`cam${cam.id}`}
            >
                <div style={{ display: 'flex', gap: 8 }}>
                    <div style={styles.lineCheck}>
                        <Checkbox
                            style={styles.lineCheckbox}
                            checked={cam.enabled !== false}
                            onChange={() => {
                                const cameras: CameraConfigAny[] = JSON.parse(
                                    JSON.stringify(this.props.native.cameras),
                                );
                                cameras[i].enabled = cameras[i].enabled === undefined ? false : !cameras[i].enabled;
                                this.props.onChange('cameras', cameras);
                            }}
                        />
                    </div>
                    <div style={styles.lineText}>
                        <TextField
                            fullWidth
                            variant="standard"
                            style={styles.name}
                            label={I18n.t('Name')}
                            error={!!error}
                            value={cam.name || ''}
                            helperText={error ? I18n.t('Duplicate name') : ''}
                            onChange={e => {
                                const cameras: CameraConfigAny[] = JSON.parse(
                                    JSON.stringify(this.props.native.cameras),
                                );
                                cameras[i].name = e.target.value.replace(/[^-_\da-zA-Z]/g, '_');
                                this.props.onChange('cameras', cameras);
                            }}
                        />
                    </div>
                    <div style={styles.lineDesc}>
                        <TextField
                            fullWidth
                            variant="standard"
                            style={styles.desc}
                            label={I18n.t('Description')}
                            value={cam.desc || ''}
                            onChange={e => {
                                const cameras: CameraConfigAny[] = JSON.parse(
                                    JSON.stringify(this.props.native.cameras),
                                );
                                cameras[i].desc = e.target.value;
                                this.props.onChange('cameras', cameras);
                            }}
                        />
                    </div>
                    <div style={styles.lineType}>
                        <FormControl
                            fullWidth
                            style={styles.type}
                            variant="standard"
                        >
                            <InputLabel>{I18n.t('Type')}</InputLabel>
                            <Select
                                variant="standard"
                                value={cam.type || ''}
                                onChange={e => {
                                    const cameras: CameraConfig[] = JSON.parse(
                                        JSON.stringify(this.props.native.cameras),
                                    );
                                    const camera = cameras[i];
                                    cameras[i] = {
                                        type: e.target.value as CameraType,
                                        desc: camera.desc,
                                        name: camera.name,
                                        enabled: camera.enabled,
                                        // @ts-expect-error try to keep the ip address
                                        ip: (camera as any).ip,
                                        rtsp: !!TYPES[e.target.value as CameraType].rtsp,
                                    };
                                    this.props.onChange('cameras', cameras);
                                }}
                            >
                                {Object.keys(TYPES).map(
                                    (type: CameraType): React.JSX.Element => (
                                        <MenuItem
                                            key={type}
                                            value={type}
                                        >
                                            {TYPES[type].name || type}
                                        </MenuItem>
                                    ),
                                )}
                            </Select>
                        </FormControl>
                    </div>
                    {this.renderCameraButtons(cam, i)}
                </div>
                {description ? <Box sx={styles.lineUrl}>{description}</Box> : null}
            </div>
        );
    }

    render(): React.JSX.Element {
        return (
            <div style={styles.tab}>
                <Fab
                    size="small"
                    title={I18n.t('Add new camera')}
                    onClick={() => {
                        const cameras: CameraConfigAny[] = JSON.parse(JSON.stringify(this.props.native.cameras));
                        let i = 1;

                        while (cameras.find(cam => cam.name === `cam${i}`)) {
                            i++;
                        }
                        cameras.push({ name: `cam${i}`, type: 'url', id: Date.now(), rtsp: !!TYPES.url.rtsp, url: '' });
                        this.props.onChange('cameras', cameras);
                    }}
                >
                    <IconAdd />
                </Fab>
                {this.props.native.cameras
                    ? this.props.native.cameras.map((cam, i) => this.renderCamera(cam, i))
                    : null}
                {this.renderConfigDialog()}
                {this.renderMessage()}
            </div>
        );
    }
}
