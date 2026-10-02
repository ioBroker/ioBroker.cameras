import React, { Component } from 'react';

import {
    Fab,
    Alert,
    Button,
    ButtonBase,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
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
} from '@iobroker/gui-components';

import URLImage from '../Types/URLImage';
import URLBasicAuthImage from '../Types/URLBasicAuthImage';
import RTSPImageConfig from '../Types/RTSPImage';
import RTSPReolinkE1Config from '../Types/RTSPReolinkE1';
import RTSPEufyConfig from '../Types/RTSPEufy';
import RTSPHiKamConfig from '../Types/RTSPHiKam';
import UniversalConfig from '../Types/Universal';
import type {
    CamerasAdapterConfig,
    CameraConfig,
    CameraConfigAny,
    CameraType,
    CameraConfigUniversal,
    CameraConfigReolink,
} from '../types';
import type { ConfigProps } from '../Types/ConfigGeneric';
// eslint-disable-next-line @/no-duplicate-imports,no-duplicate-imports
import type ConfigGeneric from '../Types/ConfigGeneric';
import InstarConfig from '../Types/Instar';
import UniFiConfig from '../Types/UniFi';
import TypeSelector, {
    ManufacturerIcon,
    getCameraTypeLabel,
    getManufacturerOfCamera,
    isDeprecatedType,
    type ManufacturerItem,
} from '../Components/TypeSelector';

interface IConfigGeneric extends ConfigGeneric<any> {
    readonly isRtsp: boolean;
}

const TYPES: Record<
    CameraType,
    { Config: IConfigGeneric; name: string; translated?: boolean; rtsp?: boolean; icon?: string; hideName?: boolean }
> = {
    url: { Config: URLImage as unknown as IConfigGeneric, name: 'URL' },
    urlBasicAuth: { Config: URLBasicAuthImage as unknown as IConfigGeneric, name: 'URL with basic auth' },
    rtsp: { Config: RTSPImageConfig as unknown as IConfigGeneric, name: 'RTSP Snapshot' },
    reolinkE1: { Config: RTSPReolinkE1Config as unknown as IConfigGeneric, name: 'Reolink E1 Snapshot' },
    eufy: { Config: RTSPEufyConfig as unknown as IConfigGeneric, name: 'Eufy Security' },
    hikam: { Config: RTSPHiKamConfig as unknown as IConfigGeneric, name: 'HiKam / WiWiCam' },
    universal: {
        Config: UniversalConfig as unknown as IConfigGeneric,
        // The concrete manufacturer is chosen inside the dialog, see Types/Universal.tsx
        name: 'By manufacturer',
    },
    instar: { Config: InstarConfig as unknown as IConfigGeneric, name: 'Instar' },
    unifi: { Config: UniFiConfig as unknown as IConfigGeneric, name: 'UniFi Protect', icon: 'ubiquiti.svg' },
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
        width: 300,
        flexShrink: 1,
        minWidth: 120,
    },
    lineType: {
        display: 'inline-block',
        flexGrow: 1,
        minWidth: 200,
        overflow: 'hidden',
    },
    typeLabel: {
        fontSize: '0.75rem',
        opacity: 0.7,
        marginTop: 4,
    },
    typeButton: {
        display: 'flex',
        justifyContent: 'flex-start',
        gap: 8,
        width: '100%',
        padding: '4px 0',
        borderBottom: '1px dotted gray',
    },
    typeText: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        textAlign: 'left',
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
    divSettings: {
        display: 'flex',
        flexDirection: 'column',
        // Limited, so long content of a form - like the ffmpeg command line of the expert
        // settings - wraps instead of squeezing the test image next to it
        flex: '1 1 420px',
        maxWidth: 520,
        minWidth: 0,
    },
    divTestCam: {
        // Below the settings if the dialog is too narrow for both, but never smaller than this
        flex: '1 1 360px',
        minWidth: 320,
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
    /** Like "https://192.168.1.2:8082" - protocol, address and port of the web instance */
    webInstanceUrl: string;
    editedSettings: string | null;
    editedSettingsOld: string | null;
    message: string;
    testImg: string | null;
    /** Manufacturers that have a model list in ./data/ */
    manufacturers: ManufacturerItem[];
}

export default class Cameras extends Component<CamerasProps, CamerasState> {
    constructor(props: CamerasProps) {
        super(props);

        this.state = {
            editCam: false,
            editChanged: false,
            requesting: false,
            instanceAlive: this.props.instanceAlive,
            webInstanceUrl: '',
            editedSettings: null,
            editedSettingsOld: null,
            message: '',
            testImg: null,
            manufacturers: [],
        };

        // translate all names once
        Object.keys(TYPES).forEach(type => {
            if (TYPES[type as CameraType].name && !TYPES[type as CameraType].translated) {
                TYPES[type as CameraType].translated = true;
                TYPES[type as CameraType].name = I18n.t(TYPES[type as CameraType].name);
                if (TYPES[type as CameraType].Config.isRtsp) {
                    TYPES[type as CameraType].rtsp = true;
                }
            }
        });
    }

    componentDidMount(): void {
        this.getWebInstances().catch(e => this.props.onError?.(e));

        void fetch('./data/manufacturers.json')
            .then(response => response.json())
            .then((manufacturers: ManufacturerItem[]) => this.setState({ manufacturers }))
            .catch(e => this.props.onError?.(`Cannot read the list of manufacturers: ${e}`));
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

    /**
     * Whether the camera delivers a video stream.
     *
     * `rtsp` is the same flag the web extension gates its stream routes on, and it is kept up to
     * date here: on every type change, and for "universal" - which can also be a plain HTTP
     * snapshot - on every change of its settings. Deriving a second answer from the type would
     * disagree with the backend for a universal camera whose protocol is not chosen yet.
     */
    static hasStream(cam: CameraConfig): boolean {
        return !!cam.rtsp && !!TYPES[cam.type]?.Config.isRtsp;
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

                // The name this page was opened with reaches the same machine too, and unlike the
                // bare IP below it can match the certificate of a web instance running with
                // "secure". Only when it really names that host - with the web instance on another
                // host of a multi-host installation it would point at the wrong machine.
                const hostname = window.location.hostname;
                const namesThisHost =
                    !!host?.common?.hostname &&
                    !!hostname.match(/[^.\d]/) &&
                    hostname.split('.')[0].toLowerCase() === host.common.hostname.toLowerCase();

                // get ips on this host
                const ip = namesThisHost ? hostname : host && Cameras.findNetworkAddressOfHost(host, hostname);

                // but for now
                webInstance.native.bind = ip || hostname;
            }
        }

        if (webInstance) {
            this.setState({
                webInstanceUrl: `${webInstance.native.secure ? 'https' : 'http'}://${webInstance.native.bind}:${webInstance.native.port || 8082}`,
            });
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
            (parseInt((settings.timeout as string) || (this.props.native.defaultTimeout as string), 10) || 5_000) *
                // A grey H.265 snapshot is taken a second time from a key frame, see GenericRtspCamera.takeSnapshot()
                (TYPES[settings.type]?.rtsp ? 2 : 1) +
                // A Eufy camera without RTSP is first woken up through the station (up to 25 s,
                // EufyCamera.ensureLivestream), then its first frame may take another 20 s
                (settings.type === 'eufy' ? 60_000 : 0),
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
                this.setState({ testImg: result.body, requesting: false, message: '' });
            }
        });
    }

    onCameraSettingsChanged(settings: CameraConfig): void {
        // Apply the changes to the edited state, not to the stored one: the type may have been
        // changed in the dialog already, and the type forms only report their own fields
        const current: CameraConfig = JSON.parse(this.state.editedSettings || this.state.editedSettingsOld || '{}');
        settings = Object.assign(current, settings);

        // custom solution for universal camera
        if (settings.type === 'universal') {
            settings.rtsp = (settings as CameraConfigUniversal).urlProtocol === 'rtsp://';
        }

        this.setEditedSettings(settings);
    }

    setEditedSettings(settings: CameraConfig): void {
        const editedSettings = JSON.stringify(settings);
        if (this.state.editedSettingsOld === editedSettings) {
            this.setState({ editChanged: false, editedSettings: null });
        } else {
            this.setState({ editChanged: true, editedSettings });
        }
    }

    /** Settings that do not depend on the type and survive a change of it */
    static getCommonSettings(cam: CameraConfig): CameraConfig {
        return {
            name: cam.name,
            desc: cam.desc,
            id: cam.id,
            enabled: cam.enabled,
            timeout: cam.timeout,
            cacheTimeout: cam.cacheTimeout,
            addTime: cam.addTime,
            title: cam.title,
            type: cam.type,
            rtsp: cam.rtsp,
        };
    }

    onTypeSelected(cam: CameraConfig, manufacturer: string, type: CameraType): void {
        if (cam.type === type && getManufacturerOfCamera(cam) === manufacturer) {
            return;
        }
        this.setState({ testImg: null });

        // Back to the stored type: restore its settings completely. Only looking at another type
        // must not cost the API key, token or path - they are not carried over to other types
        const stored: CameraConfig = JSON.parse(this.state.editedSettingsOld || '{}');
        if (stored.type === type && getManufacturerOfCamera(stored) === manufacturer) {
            this.setEditedSettings({ ...stored, ...Cameras.getCommonSettings(cam), type, rtsp: stored.rtsp });
            return;
        }

        const settings: Record<string, any> = {
            ...Cameras.getCommonSettings(cam),
            type,
            // A universal camera has a stream only after a model with an RTSP path was chosen
            rtsp: type === 'universal' ? false : !!TYPES[type].rtsp,
        };
        // Keep the address and the login - mostly the same camera is just configured another way
        const old = cam as Record<string, any>;
        ['ip', 'username', 'password'].forEach(attr => {
            if (old[attr] !== undefined) {
                settings[attr] = old[attr];
            }
        });
        if (type === 'universal') {
            settings.manufacturer = manufacturer;
        }
        this.setEditedSettings(settings as CameraConfig);
    }

    /** Move a camera of a deprecated type to the type that replaces it */
    onConvertDeprecated(cam: CameraConfig): void {
        if (cam.type === 'reolinkE1') {
            const reolink = cam as CameraConfigReolink;
            const settings: CameraConfigUniversal = {
                ...Cameras.getCommonSettings(cam),
                type: 'universal',
                rtsp: true,
                manufacturer: 'reolink',
                // Listed in reolink.json with both paths that the E1 type used
                model: 'e1 pro',
                urlProtocol: 'rtsp://',
                urlPath: reolink.quality === 'high' ? '/h264Preview_01_main' : '/h264Preview_01_sub',
                ip: reolink.ip,
                port: 554,
                username: reolink.username,
                password: reolink.password,
            };
            this.setEditedSettings(settings);
        }
    }

    isNewCamera(): boolean {
        return this.state.editCam === (this.props.native.cameras?.length || 0);
    }

    onAddCamera(): void {
        const cameras = this.props.native.cameras || [];
        let i = 1;
        while (cameras.find(cam => cam.name === `cam${i}`)) {
            i++;
        }
        // The type is chosen in the dialog. The camera is only added to the list with "Apply"
        const cam = { name: `cam${i}`, type: '', id: Date.now(), rtsp: false } as unknown as CameraConfig;
        this.setState({
            editCam: cameras.length,
            editedSettingsOld: JSON.stringify(cam),
            editedSettings: null,
            editChanged: false,
            testImg: null,
        });
    }

    renderConfigDialog(): React.JSX.Element | null {
        if (this.state.editCam !== false) {
            const cam: CameraConfig = JSON.parse(this.state.editedSettings || this.state.editedSettingsOld || '{}');
            const isNew = this.isNewCamera();
            const manufacturer = getManufacturerOfCamera(cam);
            // Nothing to configure before the manufacturer (and for "universal" its model list) is known
            const typeChosen = !!TYPES[cam.type] && !!manufacturer;
            const Config: React.FC<ConfigProps<CameraConfig>> = (TYPES[cam.type] || TYPES.url)
                .Config as unknown as React.FC<ConfigProps<CameraConfig>>;
            const duplicateName = !!this.props.native.cameras?.find(
                (c, i) => c.name === cam.name && i !== this.state.editCam,
            );

            return (
                <Dialog
                    maxWidth="lg"
                    fullWidth
                    open={!0}
                    onClose={() => this.state.editCam !== null && this.setState({ editCam: false, editChanged: false })}
                >
                    <DialogTitle>
                        {isNew ? I18n.t('Add new camera') : I18n.t('Edit camera %s [%s]', cam.name, cam.type)}
                        {!isNew && cam.desc ? ` - ${cam.desc}` : ''}
                    </DialogTitle>
                    <DialogContent>
                        {isNew ? (
                            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 8 }}>
                                <TextField
                                    variant="standard"
                                    style={{ width: 200 }}
                                    label={I18n.t('Name')}
                                    error={duplicateName || !cam.name}
                                    helperText={duplicateName ? I18n.t('Duplicate name') : ''}
                                    value={cam.name || ''}
                                    onChange={e =>
                                        this.onCameraSettingsChanged({
                                            ...cam,
                                            name: e.target.value.replace(/[^-_\da-zA-Z]/g, '_'),
                                        })
                                    }
                                />
                                <TextField
                                    variant="standard"
                                    style={{ flex: 1, minWidth: 250 }}
                                    label={I18n.t('Description')}
                                    value={cam.desc || ''}
                                    onChange={e => this.onCameraSettingsChanged({ ...cam, desc: e.target.value })}
                                />
                            </div>
                        ) : null}
                        <TypeSelector
                            cam={cam}
                            manufacturers={this.state.manufacturers}
                            onChange={(manufacturer, type) => this.onTypeSelected(cam, manufacturer, type)}
                        />
                        {isDeprecatedType(cam.type) ? (
                            <Alert
                                severity="warning"
                                style={{ marginBottom: 16 }}
                                action={
                                    <Button
                                        color="inherit"
                                        size="small"
                                        onClick={() => this.onConvertDeprecated(cam)}
                                    >
                                        {I18n.t('Convert')}
                                    </Button>
                                }
                            >
                                {I18n.t('deprecated_type_hint')}
                            </Alert>
                        ) : null}
                        {typeChosen ? (
                            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                <div style={styles.divSettings}>
                                    <Config
                                        // The forms read the settings only once - mount a new one for another type
                                        key={`${cam.type}_${manufacturer}`}
                                        native={this.props.native}
                                        socket={this.props.socket}
                                        instanceId={`${this.props.adapterName}.${this.props.instance}`}
                                        instanceAlive={this.state.instanceAlive}
                                        settings={cam}
                                        themeType={this.props.themeType}
                                        theme={this.props.theme}
                                        onChange={settings => this.onCameraSettingsChanged(settings as CameraConfig)}
                                        encrypt={(value: string, cb: (encrypted: string) => void) =>
                                            this.props.encrypt(value, cb)
                                        }
                                        decrypt={(value: string, cb: (decrypted: string) => void) =>
                                            this.props.decrypt(value, cb)
                                        }
                                    />
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
                                    <TextField
                                        variant="standard"
                                        fullWidth
                                        label={I18n.t('Add title')}
                                        value={cam.title === undefined ? '' : cam.title}
                                        onChange={e => {
                                            const settings: CameraConfig = JSON.parse(JSON.stringify(cam));
                                            settings.title = e.target.value;
                                            this.onCameraSettingsChanged(settings);
                                        }}
                                    />
                                    {/*<div style={styles.sampleUrl}>
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
                                </div>*/}
                                    <div style={styles.sampleUrl}>
                                        {I18n.t('Web URL')}
                                        :&nbsp;
                                        <a
                                            style={styles.link}
                                            href={`${this.state.webInstanceUrl}/${this.props.adapterName}.${this.props.instance}/${cam.name}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {this.state.webInstanceUrl}/{this.props.adapterName}.{this.props.instance}/
                                            {cam.name}
                                        </a>
                                    </div>
                                    {/* stream.mjpeg is served by go2rtc only - without it the route answers with a still image */}
                                    {this.props.native.useGo2rtc && Cameras.hasStream(cam) ? (
                                        <div style={styles.sampleUrl}>
                                            {I18n.t('Stream URL')}
                                            :&nbsp;
                                            <a
                                                style={styles.link}
                                                href={`${this.state.webInstanceUrl}/${this.props.adapterName}.${this.props.instance}/${cam.name}/stream.mjpeg`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {this.state.webInstanceUrl}/{this.props.adapterName}.
                                                {this.props.instance}/{cam.name}/stream.mjpeg
                                            </a>
                                        </div>
                                    ) : null}
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
                        ) : null}
                    </DialogContent>
                    <DialogActions>
                        <Button
                            disabled={!this.state.editChanged || !typeChosen || (isNew && (!cam.name || duplicateName))}
                            variant="contained"
                            onClick={() => {
                                const cameras: CameraConfigAny[] = JSON.parse(
                                    JSON.stringify(this.props.native.cameras || []),
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

    onEditCamera(cam: CameraConfig, i: number): void {
        this.setState({
            editCam: i,
            editedSettingsOld: JSON.stringify(cam),
            editedSettings: null,
            editChanged: false,
            testImg: null,
        });
    }

    renderCameraButtons(cam: CameraConfig, i: number): React.JSX.Element {
        return (
            <div style={{ display: 'flex', gap: 8, width: 160 }}>
                <IconButton
                    size="small"
                    key="edit"
                    style={styles.lineEdit}
                    onClick={() => this.onEditCamera(cam, i)}
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
                        <div style={styles.typeLabel}>{I18n.t('Type')}</div>
                        <ButtonBase
                            style={styles.typeButton}
                            title={I18n.t('Edit camera %s [%s]', cam.name, cam.type)}
                            onClick={() => this.onEditCamera(cam, i)}
                        >
                            <ManufacturerIcon
                                manufacturer={getManufacturerOfCamera(cam)}
                                size={20}
                            />
                            <span style={styles.typeText}>{getCameraTypeLabel(cam, this.state.manufacturers)}</span>
                        </ButtonBase>
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
                    onClick={() => this.onAddCamera()}
                >
                    <IconAdd />
                </Fab>
                {this.props.native.cameras?.map((cam, i) => this.renderCamera(cam, i)) || null}
                {this.renderConfigDialog()}
                {this.renderMessage()}
            </div>
        );
    }
}
