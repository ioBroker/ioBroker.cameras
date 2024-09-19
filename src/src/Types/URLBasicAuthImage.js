import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { TextField } from '@mui/material';

import { I18n } from '@iobroker/adapter-react-v5';

const styles = {
    page: {
        width: '100%',
    },
    url: {
        width: '100%',
    },
};

class Config extends Component {
    constructor(props) {
        super(props);

        const state = JSON.parse(JSON.stringify(this.props.settings));

        // set default values
        state.url = state.url || '';
        state.password = state.password || '';
        state.username = state.username || '';

        this.state = state;
    }

    componentDidMount() {
        this.props.decrypt(this.state.password, password => this.setState({ password }));
    }

    reportSettings() {
        this.props.encrypt(this.state.password, password => {
            this.props.onChange({
                url: this.state.url,
                username: this.state.username,
                password,
            });
        });
    }

    render() {
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

Config.propTypes = {
    onChange: PropTypes.func,
    defaultTimeout: PropTypes.number,
    decode: PropTypes.func,
    encode: PropTypes.func,
};

export default Config;
