import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';

import { MenuItem, Select } from '@mui/material';

import TextField from '@mui/material/TextField';

import { I18n } from '@iobroker/adapter-react-v5';

const styles = theme => ({
    page: {
        width: '100%',
    },
    ip: {
        marginRight: theme.spacing(1),
        width: 200,
    },
    username: {
        marginTop: theme.spacing(2),
        marginRight: theme.spacing(1),
        width: 200,
    },
    password: {
        marginTop: theme.spacing(2),
        width: 200,
    },
    quality: {
        marginTop: theme.spacing(2),
        width: 200,
    },
});

class RTSPReolinkE1Config extends Component {
    constructor(props) {
        super(props);

        const state = JSON.parse(JSON.stringify(this.props.settings));

        // set default values
        state.ip       = state.ip || '';
        state.password = state.password || '';
        state.username = state.username === undefined ? 'admin' : (state.username || '');
        state.timeout  = state.timeout  || 5000;
        state.quality  = state.quality  || 'low';

        this.state     = state;
    }

    componentDidMount() {
        this.props.decrypt(this.state.password,
            password => this.setState({ password }));
    }

    reportSettings() {
        this.props.encrypt(this.state.password, password => {
            this.props.onChange({
                ip:       this.state.ip,
                username: this.state.username,
                password,
                timeout:  this.state.timeout,
                quality:  this.state.quality,
            });
        });
    }

    render() {
        return <div className={this.props.classes.page}>
            <form>
                <TextField
                    variant="standard"
                    className={this.props.classes.ip}
                    label={I18n.t('Camera IP')}
                    value={this.state.ip}
                    onChange={e => this.setState({ ip: e.target.value }, () => this.reportSettings())}
                />
                <br />
                <TextField
                    variant="standard"
                    autoComplete="new-password"
                    className={this.props.classes.username}
                    label={I18n.t('Username')}
                    value={this.state.username}
                    onChange={e => this.setState({ username: e.target.value }, () => this.reportSettings())}
                />
                <TextField
                    variant="standard"
                    type="password"
                    autoComplete="new-password"
                    className={this.props.classes.password}
                    label={I18n.t('Password')}
                    value={this.state.password}
                    onChange={e => this.setState({ password: e.target.value }, () => this.reportSettings())}
                />
                <br />
                <Select
                    className={this.props.classes.quality}
                    variant="standard"
                    value={this.state.quality}
                    label={I18n.t('Quality')}
                    onChange={e => this.setState({ quality: e.target.value }, () => this.reportSettings())}
                >
                    <MenuItem value="low">{I18n.t('low quality')}</MenuItem>
                    <MenuItem value="high">{I18n.t('high quality')}</MenuItem>
                </Select>
            </form>
        </div>;
    }
}

RTSPReolinkE1Config.propTypes = {
    onChange: PropTypes.func,
    native: PropTypes.object,
    defaultTimeout: PropTypes.number,
    decode: PropTypes.func,
    encode: PropTypes.func,
};

export default withStyles(styles)(RTSPReolinkE1Config);
