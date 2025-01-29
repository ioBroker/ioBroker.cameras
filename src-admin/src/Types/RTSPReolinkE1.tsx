import React from 'react';

import { MenuItem, Select, TextField } from '@mui/material';

import { I18n } from '@iobroker/adapter-react-v5';
import ConfigGeneric, { type ConfigProps } from './ConfigGeneric';
import type { CameraConfigReolink } from '../types';

const styles = {
    page: {
        width: '100%',
    },
    ip: {
        marginRight: 8,
        width: 200,
    },
    username: {
        marginTop: 16,
        marginRight: 8,
        width: 200,
    },
    password: {
        marginTop: 16,
        width: 200,
    },
    quality: {
        marginTop: 16,
        width: 200,
    },
};

export default class RTSPReolinkE1Config extends ConfigGeneric<CameraConfigReolink> {
    public static isRtsp = true; // this camera can be used in RTSP snapshot

    constructor(props: ConfigProps<CameraConfigReolink>) {
        super(props);

        this.state = {
            ip: this.props.settings.ip || '',
            password: this.props.settings.password || '',
            username: this.props.settings.username === undefined ? 'admin' : this.props.settings.username || '',
            quality: this.props.settings.quality || 'low',
        };
    }

    componentDidMount(): void {
        this.props.decrypt(this.state.password || '', password => this.setState({ password }));
    }

    reportSettings(): void {
        this.props.encrypt(this.state.password || '', password => {
            this.props.onChange({
                ip: this.state.ip,
                username: this.state.username,
                password,
                quality: this.state.quality,
            });
        });
    }

    render(): React.JSX.Element {
        return (
            <div style={styles.page}>
                <form>
                    <TextField
                        variant="standard"
                        style={styles.ip}
                        label={I18n.t('Camera IP')}
                        value={this.state.ip}
                        onChange={e => this.setState({ ip: e.target.value }, () => this.reportSettings())}
                    />
                    <br />
                    <TextField
                        variant="standard"
                        autoComplete="new-password"
                        style={styles.username}
                        label={I18n.t('Username')}
                        value={this.state.username}
                        onChange={e => this.setState({ username: e.target.value }, () => this.reportSettings())}
                    />
                    <TextField
                        variant="standard"
                        type="password"
                        autoComplete="new-password"
                        style={styles.password}
                        label={I18n.t('Password')}
                        value={this.state.password}
                        onChange={e => this.setState({ password: e.target.value }, () => this.reportSettings())}
                    />
                    <br />
                    <Select
                        style={styles.quality}
                        variant="standard"
                        value={this.state.quality}
                        label={I18n.t('Quality')}
                        onChange={e =>
                            this.setState({ quality: e.target.value as 'low' | 'high' }, () => this.reportSettings())
                        }
                    >
                        <MenuItem value="low">{I18n.t('low quality')}</MenuItem>
                        <MenuItem value="high">{I18n.t('high quality')}</MenuItem>
                    </Select>
                </form>
            </div>
        );
    }
}
