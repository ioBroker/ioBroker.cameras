import React from 'react';

import { TextField } from '@mui/material';

import { I18n } from '@iobroker/adapter-react-v5';
import type { CameraConfigUrlBasicAuth } from '../types';
import ConfigGeneric, { type ConfigProps } from './ConfigGeneric';

const styles: Record<'page' | 'url', React.CSSProperties> = {
    page: {
        width: '100%',
    },
    url: {
        width: '100%',
    },
};

export default class URLBasicAuthImageConfig extends ConfigGeneric<CameraConfigUrlBasicAuth> {
    constructor(props: ConfigProps<CameraConfigUrlBasicAuth>) {
        super(props);

        this.state = {
            url: this.props.settings.url || '',
            password: this.props.settings.password || '',
            username: this.props.settings.username || '',
        };
    }

    componentDidMount(): void {
        this.props.decrypt(this.state.password, password => this.setState({ password }));
    }

    reportSettings(): void {
        this.props.encrypt(this.state.password, password => {
            this.props.onChange({
                url: this.state.url,
                username: this.state.username,
                password,
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
                    label={I18n.t('Camera URL')}
                    value={this.state.url}
                    onChange={e => this.setState({ url: e.target.value }, () => this.reportSettings())}
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
            </div>
        );
    }
}
