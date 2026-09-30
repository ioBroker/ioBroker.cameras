import React from 'react';

import {
    Button,
    Checkbox,
    CircularProgress,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Select,
    TextField,
} from '@mui/material';

import { I18n } from '@iobroker/gui-components';
import ConfigGeneric, { type ConfigProps } from './ConfigGeneric';
import type { CameraConfigUnifi } from '../types';

const styles = {
    page: {
        width: '100%',
    },
    field: {
        marginTop: 16,
        marginRight: 8,
        width: 300,
    },
    button: {
        marginTop: 24,
    },
    secure: {
        marginTop: 16,
    },
};

interface UnifiCamera {
    id: string;
    name: string;
    state?: string;
}

interface UnifiState {
    cameras: UnifiCamera[] | null;
    loading: boolean;
    error: string;
}

export default class UniFiConfig extends ConfigGeneric<CameraConfigUnifi, UnifiState> {
    public static isRtsp = true; // this camera can be used in RTSP snapshot

    constructor(props: ConfigProps<CameraConfigUnifi>) {
        super(props);

        this.state = {
            ip: this.props.settings.ip || '',
            apiKey: this.props.settings.apiKey || '',
            cameraId: this.props.settings.cameraId || '',
            token: this.props.settings.token || '',
            quality: this.props.settings.quality || 'high',
            secure: !!this.props.settings.secure,
            port: this.props.settings.port || '',
            cameras: null,
            loading: false,
            error: '',
        };
    }

    componentDidMount(): void {
        this.props.decrypt(this.state.apiKey || '', apiKey => this.setState({ apiKey }));
    }

    reportSettings(): void {
        this.props.encrypt(this.state.apiKey || '', apiKey => {
            this.props.onChange({
                ip: this.state.ip,
                apiKey,
                cameraId: this.state.cameraId,
                token: this.state.token,
                quality: this.state.quality,
                secure: this.state.secure,
                port: this.state.port,
            });
        });
    }

    async loadCameras(): Promise<void> {
        this.setState({ loading: true, error: '' });
        try {
            const result: { cameras?: UnifiCamera[]; error?: string } = await this.props.socket.sendTo(
                this.props.instanceId || '',
                'unifiCameras',
                { ip: this.state.ip, apiKey: this.state.apiKey },
            );
            if (result?.error || !result?.cameras) {
                this.setState({ loading: false, cameras: null, error: result?.error || I18n.t('No answer') });
            } else {
                const cameras = result.cameras;
                // Only one camera - nothing to choose
                const cameraId = this.state.cameraId || (cameras.length === 1 ? cameras[0].id : '');
                this.setState({ loading: false, cameras, cameraId }, () => this.reportSettings());
            }
        } catch (e) {
            this.setState({ loading: false, error: (e as Error).toString() });
        }
    }

    renderCameraSelect(): React.JSX.Element {
        const cameras = this.state.cameras || [];
        // Keep a stored camera selectable before the list was loaded
        if (this.state.cameraId && !cameras.find(cam => cam.id === this.state.cameraId)) {
            cameras.push({ id: this.state.cameraId, name: this.state.cameraId });
        }

        return (
            <FormControl
                style={styles.field}
                variant="standard"
            >
                <InputLabel>{I18n.t('Camera')}</InputLabel>
                <Select
                    variant="standard"
                    value={this.state.cameraId || ''}
                    onChange={e => this.setState({ cameraId: e.target.value }, () => this.reportSettings())}
                >
                    {cameras.map(cam => (
                        <MenuItem
                            key={cam.id}
                            value={cam.id}
                        >
                            {cam.name}
                            {cam.state && cam.state !== 'CONNECTED' ? ` (${cam.state})` : ''}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        );
    }

    render(): React.JSX.Element {
        return (
            <div style={styles.page}>
                <form>
                    <TextField
                        variant="standard"
                        style={styles.field}
                        label={I18n.t('UniFi console IP')}
                        helperText={I18n.t('Address of the console or NVR that runs Protect')}
                        value={this.state.ip}
                        onChange={e => this.setState({ ip: e.target.value }, () => this.reportSettings())}
                    />
                    <br />
                    <FormControlLabel
                        style={styles.secure}
                        control={
                            <Checkbox
                                checked={!!this.state.secure}
                                onChange={e => this.setState({ secure: e.target.checked }, () => this.reportSettings())}
                            />
                        }
                        label={I18n.t('Use RTSPS (port 7441)')}
                    />
                    <br />
                    <TextField
                        variant="standard"
                        style={styles.field}
                        label={I18n.t('RTSP port (optional)')}
                        placeholder={this.state.secure ? '7441' : '7447'}
                        helperText={I18n.t('unifi_port_help')}
                        value={this.state.port}
                        onChange={e =>
                            this.setState({ port: e.target.value.replace(/\D/g, '') }, () => this.reportSettings())
                        }
                    />
                    <br />
                    <TextField
                        variant="standard"
                        type="password"
                        autoComplete="new-password"
                        style={styles.field}
                        label={I18n.t('API key (optional)')}
                        helperText={I18n.t('unifi_api_key_help')}
                        value={this.state.apiKey}
                        onChange={e => this.setState({ apiKey: e.target.value }, () => this.reportSettings())}
                    />
                    <Button
                        style={styles.button}
                        variant="outlined"
                        disabled={!this.state.ip || !this.state.apiKey || this.state.loading || !this.props.instanceId}
                        onClick={() => this.loadCameras()}
                        startIcon={this.state.loading ? <CircularProgress size={16} /> : null}
                    >
                        {I18n.t('Load cameras')}
                    </Button>
                    {this.state.error ? <div style={{ color: 'red', marginTop: 8 }}>{this.state.error}</div> : null}
                    <br />
                    {this.state.apiKey ? this.renderCameraSelect() : null}
                    {this.state.apiKey ? <br /> : null}
                    <TextField
                        variant="standard"
                        style={styles.field}
                        label={this.state.apiKey ? I18n.t('Stream token (fallback)') : I18n.t('Stream token')}
                        helperText={I18n.t('unifi_token_help')}
                        value={this.state.token}
                        onChange={e =>
                            // Accept the whole link as copied from Protect
                            this.setState(
                                {
                                    token: e.target.value
                                        .trim()
                                        .replace(/^rtsps?:\/\/[^/]+\//, '')
                                        .replace(/\?.*$/, ''),
                                },
                                () => this.reportSettings(),
                            )
                        }
                    />
                    <br />
                    <FormControl
                        style={styles.field}
                        variant="standard"
                    >
                        <InputLabel>{I18n.t('Quality')}</InputLabel>
                        <Select
                            variant="standard"
                            value={this.state.quality}
                            onChange={e =>
                                this.setState({ quality: e.target.value as 'high' | 'medium' | 'low' }, () =>
                                    this.reportSettings(),
                                )
                            }
                        >
                            <MenuItem value="high">{I18n.t('high quality')}</MenuItem>
                            <MenuItem value="medium">{I18n.t('medium quality')}</MenuItem>
                            <MenuItem value="low">{I18n.t('low quality')}</MenuItem>
                        </Select>
                    </FormControl>
                </form>
            </div>
        );
    }
}
