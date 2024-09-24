import React, { type JSX } from 'react';

import { TextField } from '@mui/material';

import { I18n } from '@iobroker/adapter-react-v5';
import GenericConfig, { type GenericCameraSettings, type GenericConfigProps } from '../Types/GenericConfig';

const styles: Record<string, React.CSSProperties> = {
    page: {
        width: '100%',
    },
    url: {
        width: '100%',
    },
};

export interface UrlBasicAuthImageSettings extends GenericCameraSettings {
    ip: string;
    password: string;
    username: string;
    url: string;
}

class UrlBasicAuthImageConfig extends GenericConfig<UrlBasicAuthImageSettings> {
    constructor(props: GenericConfigProps) {
        super(props);

        // set default values
        Object.assign(this.state, {
            ip: this.state.ip || '',
            url: this.state.url || '',
            password: this.state.password || '',
            username: this.state.username === undefined ? 'admin' : this.state.username || '',
        });
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

    render(): JSX.Element {
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
                    style={styles.username}
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
                    style={styles.password}
                    label={I18n.t('Password')}
                    value={this.state.password}
                    onChange={e => this.setState({ password: e.target.value }, () => this.reportSettings())}
                />
            </div>
        );
    }
}

export default UrlBasicAuthImageConfig;
