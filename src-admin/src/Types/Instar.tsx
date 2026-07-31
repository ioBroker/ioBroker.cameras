import React from 'react';

import { MenuItem, Select, TextField } from '@mui/material';

import { I18n } from '@iobroker/gui-components';
import type { CameraInstarConfig } from '../types';
import ConfigGeneric, { type ConfigProps } from './ConfigGeneric';

const styles: Record<'page' | 'url' | 'quality', React.CSSProperties> = {
    page: {
        width: '100%',
    },
    url: {
        width: '100%',
    },
    quality: {
        marginTop: 16,
        width: 200,
    },
};

export default class InstarConfig extends ConfigGeneric<CameraInstarConfig> {
    constructor(props: ConfigProps<CameraInstarConfig>) {
        super(props);

        this.state = {
            ip: this.props.settings.ip || '',
            password: this.props.settings.password || '',
            username: this.props.settings.username || '',
            quality: this.props.settings.quality || 'high',
        };
    }

    componentDidMount(): void {
        this.props.decrypt(this.state.password, password => this.setState({ password }));
    }

    reportSettings(): void {
        this.props.encrypt(this.state.password, password => {
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
                <TextField
                    variant="standard"
                    key="url"
                    style={styles.url}
                    label={I18n.t('Camera IP')}
                    value={this.state.ip}
                    onChange={e => this.setState({ ip: e.target.value }, () => this.reportSettings())}
                />
                <br />
                <TextField
                    variant="standard"
                    key="username"
                    autoComplete="off"
                    label={I18n.t('Username')}
                    value={this.state.username}
                    onChange={e => this.setState({ username: e.target.value }, () => this.reportSettings())}
                />
                <br />
                <TextField
                    variant="standard"
                    key="password"
                    type="password"
                    autoComplete="off"
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
            </div>
        );
    }
}
