import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import I18n from '@iobroker/adapter-react-v5/i18n';
import TextField from '@mui/material/TextField';

const styles = theme => ({
    page: {
        width: '100%',
    },
    ip: {
        marginRight: theme.spacing(1),
        width: 200,
    },
    port: {
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
    urlPath: {
        marginTop: theme.spacing(2),
        marginBotton: `${theme.spacing(3)} !important`,
        width: 408,
    },
});

class RTSPImageConfig extends Component {
    constructor(props) {
        super(props);

        const state = JSON.parse(JSON.stringify(this.props.settings));

        // set default values
        state.ip       = state.ip || '';
        state.port     = state.port || '554';
        state.urlPath  = state.urlPath || '';
        state.password = state.password || '';
        state.username = state.username === undefined ? 'admin' : (state.username || '');
        state.timeout  = state.timeout  || 5000;
        state.url      = `rtsp://${state.username}:***@${state.ip}:${state.port}${state.urlPath ? (state.urlPath.startsWith('/') ? state.urlPath : `/${state.urlPath}`) : ''}`;

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
                port:     this.state.port,
                urlPath:  this.state.urlPath,
                timeout:  this.state.timeout,
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
                <TextField
                    variant="standard"
                    className={this.props.classes.port}
                    type="number"
                    label={I18n.t('Port')}
                    value={this.state.port}
                    onChange={e => this.setState({ port: e.target.value }, () => this.reportSettings())}
                />
                <br />
                <TextField
                    variant="standard"
                    className={this.props.classes.urlPath}
                    label={I18n.t('Path')}
                    value={this.state.urlPath}
                    onChange={e => this.setState({ urlPath: e.target.value }, () => this.reportSettings())}
                    helperText={this.state.url}
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
                    key="password"
                    type="password"
                    autoComplete="new-password"
                    className={this.props.classes.password}
                    label={I18n.t('Password')}
                    value={this.state.password}
                    onChange={e => this.setState({ password: e.target.value }, () => this.reportSettings())}
                />
            </form>
        </div>;
    }
}

RTSPImageConfig.propTypes = {
    onChange: PropTypes.func,
    defaultTimeout: PropTypes.number,
    decode: PropTypes.func,
    encode: PropTypes.func,
};

export default withStyles(styles)(RTSPImageConfig);
