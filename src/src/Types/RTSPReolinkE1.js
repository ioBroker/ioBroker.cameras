import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { MenuItem, Select, TextField } from '@mui/material';

import { I18n } from '@iobroker/adapter-react-v5';

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

class RTSPReolinkE1Config extends Component {
    constructor(props) {
        super(props);

        const state = JSON.parse(JSON.stringify(this.props.settings));

        // set default values
        state.ip = state.ip || '';
        state.password = state.password || '';
        state.username = state.username === undefined ? 'admin' : state.username || '';
        state.quality = state.quality || 'low';

        this.state = state;
    }

    static getRtsp() {
        return true; // this camera can be used in RTSP snapshot
    }

    componentDidMount() {
        this.props.decrypt(this.state.password, password => this.setState({ password }));
    }

    reportSettings() {
        this.props.encrypt(this.state.password, password => {
            this.props.onChange({
                ip: this.state.ip,
                username: this.state.username,
                password,
                quality: this.state.quality,
            });
        });
    }

    render() {
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
                        onChange={e => this.setState({ quality: e.target.value }, () => this.reportSettings())}
                    >
                        <MenuItem value="low">{I18n.t('low quality')}</MenuItem>
                        <MenuItem value="high">{I18n.t('high quality')}</MenuItem>
                    </Select>
                </form>
            </div>
        );
    }
}

RTSPReolinkE1Config.propTypes = {
    onChange: PropTypes.func,
    native: PropTypes.object,
    defaultTimeout: PropTypes.number,
    decode: PropTypes.func,
    encode: PropTypes.func,
};

export default RTSPReolinkE1Config;
