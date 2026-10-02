import React from 'react';

import {
    Button,
    FormControl,
    FormControlLabel,
    InputLabel,
    LinearProgress,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    TextField,
} from '@mui/material';

import { I18n, DialogSelectID, Utils } from '@iobroker/gui-components';
import type { CameraConfigEufy } from '../types';
import ConfigGeneric, { type ConfigProps } from './ConfigGeneric';

const styles: Record<'page' | 'ip' | 'camera' | 'oidRow' | 'hint', React.CSSProperties> = {
    page: {
        width: '100%',
    },
    ip: {
        marginRight: 8,
        width: 200,
    },
    camera: {
        minWidth: 300,
    },
    oidRow: {
        width: '100%',
        display: 'flex',
        gap: 8,
        alignItems: 'flex-end',
        marginTop: 16,
    },
    hint: {
        // Without a width of its own a long hint widens the column and pushes the test image away
        maxWidth: 400,
        fontSize: 'smaller',
        opacity: 0.7,
        marginTop: 8,
    },
};

/** A device of the eusec adapter, like `eusec.0.<station>.cameras.<serial>` */
interface EusecCamera {
    /** ID of the `rtsp_stream_url` state - the adapter only creates it for devices with RTSP */
    oid: string;
    name: string;
    /** eusec creates `rtsp_stream` and `rtsp_stream_url` only for devices that support RTSP */
    supportsRtsp: boolean;
    /**
     * A camera without RTSP that eusec can stream through the station (`start_stream`). The
     * backend starts that stream for every image, see EufyCamera.ensureLivestream()
     */
    livestream: boolean;
    /** The adapter fills the link only while RTSP is enabled for the camera */
    hasUrl: boolean;
}

export default class RTSPEufyConfig extends ConfigGeneric<
    CameraConfigEufy,
    { eusecInstalled: boolean; showSelectId: boolean; cameras: EusecCamera[] | null }
> {
    public static isRtsp = true; // this camera can be used in RTSP snapshot

    constructor(props: ConfigProps<CameraConfigEufy>) {
        super(props);

        this.state = {
            ip: this.props.settings.ip || '',
            oid: this.props.settings.oid || '',
            useOid: this.props.settings.useOid || false,
            eusecInstalled: false,
            showSelectId: false,
            cameras: null,
        };
    }

    async componentDidMount(): Promise<void> {
        // read if eusec adapter is installed
        const instances = await this.props.socket.getAdapterInstances('eusec');
        if (!instances.length) {
            if (this.state.useOid) {
                this.setState({ useOid: false }, () => this.reportSettings());
            }
            return;
        }
        // A new camera: the adapter is the easier way, it knows the address and the login
        const isNew = !this.state.ip && !this.state.oid;
        this.setState({ eusecInstalled: true, useOid: isNew || this.state.useOid }, () => {
            if (isNew) {
                this.reportSettings();
            }
        });
        await this.loadCameras();
    }

    async loadCameras(): Promise<void> {
        try {
            const [devices, states] = await Promise.all([
                this.props.socket.getObjectViewSystem('device', 'eusec.', 'eusec.香'),
                this.props.socket.getObjectViewSystem('state', 'eusec.', 'eusec.香'),
            ]);
            const cameras: EusecCamera[] = [];
            for (const [id, obj] of Object.entries(devices)) {
                const parts = id.split('.');
                // Stations are devices as well: eusec.0.<station>. Their devices lie below a channel
                // named after their kind: eusec.0.<station>.<cameras|doorbells|...>.<serial>
                if (parts.length < 5) {
                    continue;
                }
                const oid = `${id}.rtsp_stream_url`;
                const supportsRtsp = !!states[oid] || !!states[`${id}.rtsp_stream`];
                const livestream = !supportsRtsp && !!states[`${id}.start_stream`];
                // Locks, sensors and keypads are no cameras - but a camera without any stream is
                // shown, so the user sees why it cannot be used
                if (!supportsRtsp && !livestream && !/camera|doorbell/i.test(parts[parts.length - 2])) {
                    continue;
                }
                cameras.push({
                    oid,
                    // The name the user gave the camera in the Eufy app
                    name: obj.common?.name
                        ? Utils.getObjectNameFromObj(obj, I18n.getLanguage())
                        : parts[parts.length - 1],
                    supportsRtsp,
                    livestream,
                    hasUrl: false,
                });
            }
            const withUrl = cameras.filter(cam => states[cam.oid]).map(cam => cam.oid);
            const values = withUrl.length ? await this.props.socket.getForeignStates(withUrl) : {};
            cameras.forEach(cam => (cam.hasUrl = !!values[cam.oid]?.val));
            // The usable ones first
            const usable = (cam: EusecCamera): boolean => cam.supportsRtsp || cam.livestream;
            cameras.sort((a, b) => Number(usable(b)) - Number(usable(a)) || a.name.localeCompare(b.name));
            this.setState({ cameras });
        } catch (e) {
            console.error(`Cannot read the cameras of the eusec adapter: ${e as Error}`);
            this.setState({ cameras: [] });
        }
    }

    reportSettings(): void {
        this.props.onChange({
            ip: this.state.ip,
            oid: this.state.oid,
            useOid: this.state.useOid,
        });
    }

    renderSelectID(): React.JSX.Element | null {
        if (!this.state.showSelectId) {
            return null;
        }
        return (
            <DialogSelectID
                imagePrefix="../.."
                theme={this.props.theme}
                themeType={this.props.themeType}
                dialogName="RTSPReolinkE1"
                socket={this.props.socket}
                selected={this.state.oid}
                filterFunc={obj => obj._id.startsWith('eusec.') && obj._id.endsWith('.rtsp_stream_url')}
                onClose={() => this.setState({ showSelectId: false })}
                onOk={_oid => {
                    let oid: string | undefined;
                    if (Array.isArray(_oid)) {
                        oid = _oid[0];
                    } else {
                        oid = _oid || '';
                    }
                    this.setState({ oid, showSelectId: false }, () => this.reportSettings());
                }}
            />
        );
    }

    renderAdapterMode(): React.JSX.Element {
        if (!this.state.cameras) {
            return <LinearProgress />;
        }
        const cameras = [...this.state.cameras];
        // Keep a stored ID selectable even if the adapter does not list it (any more)
        if (this.state.oid && !cameras.find(cam => cam.oid === this.state.oid)) {
            cameras.push({
                oid: this.state.oid,
                name: this.state.oid,
                supportsRtsp: true,
                livestream: false,
                hasUrl: true,
            });
        }
        const selected = cameras.find(cam => cam.oid === this.state.oid);

        return (
            <>
                {cameras.length ? (
                    <FormControl
                        variant="standard"
                        style={styles.camera}
                    >
                        <InputLabel>{I18n.t('Camera')}</InputLabel>
                        <Select
                            variant="standard"
                            value={this.state.oid || ''}
                            onChange={e => this.setState({ oid: e.target.value }, () => this.reportSettings())}
                        >
                            {cameras.map(cam => (
                                <MenuItem
                                    key={cam.oid}
                                    value={cam.oid}
                                    // Without any stream there is nothing to take a snapshot from
                                    disabled={!cam.supportsRtsp && !cam.livestream}
                                >
                                    {cam.name}
                                    {cam.livestream
                                        ? ` (${I18n.t('live via station')})`
                                        : !cam.supportsRtsp
                                          ? ` (${I18n.t('no stream')})`
                                          : cam.hasUrl
                                            ? ''
                                            : ` (${I18n.t('RTSP not enabled')})`}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                ) : (
                    <div style={styles.hint}>{I18n.t('No cameras found in the eusec adapter')}</div>
                )}
                {selected?.livestream ? <div style={styles.hint}>{I18n.t('eusec_livestream_hint')}</div> : null}
                {selected && !selected.livestream && !selected.hasUrl ? (
                    <div style={styles.hint}>{I18n.t('eusec_rtsp_hint')}</div>
                ) : null}
                {cameras.length && !cameras.some(cam => cam.supportsRtsp || cam.livestream) ? (
                    <div style={styles.hint}>{I18n.t('eusec_no_rtsp_hint')}</div>
                ) : null}
                <div style={styles.oidRow}>
                    <TextField
                        variant="standard"
                        fullWidth
                        label={I18n.t('Camera OID')}
                        value={this.state.oid}
                        onChange={e => this.setState({ oid: e.target.value }, () => this.reportSettings())}
                    />
                    <Button
                        variant="outlined"
                        onClick={() => this.setState({ showSelectId: true })}
                    >
                        ...
                    </Button>
                </div>
            </>
        );
    }

    render(): React.JSX.Element {
        return (
            <div style={styles.page}>
                {this.renderSelectID()}
                <form>
                    {this.state.eusecInstalled ? (
                        <RadioGroup
                            row
                            value={this.state.useOid ? 'adapter' : 'ip'}
                            onChange={e =>
                                this.setState({ useOid: e.target.value === 'adapter' }, () => this.reportSettings())
                            }
                        >
                            <FormControlLabel
                                value="adapter"
                                control={<Radio />}
                                label={I18n.t('From eusec adapter')}
                            />
                            <FormControlLabel
                                value="ip"
                                control={<Radio />}
                                label={I18n.t('By IP Address')}
                            />
                        </RadioGroup>
                    ) : null}
                    {this.state.useOid ? (
                        this.renderAdapterMode()
                    ) : (
                        <TextField
                            variant="standard"
                            style={styles.ip}
                            label={I18n.t('Camera IP')}
                            // Browsers like to fill in an address saved for another field
                            autoComplete="off"
                            value={this.state.ip}
                            onChange={e => this.setState({ ip: e.target.value }, () => this.reportSettings())}
                        />
                    )}
                </form>
            </div>
        );
    }
}
