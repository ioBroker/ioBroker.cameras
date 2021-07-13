import React, {Component} from 'react';
import { withStyles} from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import DialogMessage from '@iobroker/adapter-react/Dialogs/Message';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import FormControl from '@material-ui/core/FormControl';
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";

import {MdClose as IconClose} from 'react-icons/md';

import I18n from '@iobroker/adapter-react/i18n';
import Logo from '@iobroker/adapter-react/Components/Logo';
import Message from '@iobroker/adapter-react/Dialogs/Message';
import DialogError from "@iobroker/adapter-react/Dialogs/Error";

const styles = theme => ({
    tab: {
        width: '100%',
        minHeight: '100%'
    },
    bind: {
        marginRight: 10,
        marginBottom: 20,
        minWidth: 200,
    },
    port: {
        width: 100
    },
    defaultTimeout: {
        width: 150
    }
});

class Options extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showHint: false,
            toast: '',
            ips: [],
            requesting: true,
            webInstances: []
        };

    }

    componentDidMount() {
        let ips;
        this.props.getIpAddresses()
            .then(_ips => ips = _ips)
            .then(() => this.props.getExtendableInstances())
            .then(webInstances =>
                this.setState({requesting: false, ips, webInstances: webInstances.map(item =>
                        item._id.replace('system.adapter.', ''))}));
    }

    showError(text) {
        this.setState({errorText: text});
    }

    renderError() {
        if (!this.state.errorText) {
            return null;
        }
        return <DialogError text={this.state.errorText} title={I18n.t('Error')} onClose={() => this.setState({errorText: ''})}/>;
    }

    renderToast() {
        if (!this.state.toast) {
            return null;
        }
        return <Snackbar
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }}
            open={true}
            autoHideDuration={6000}
            onClose={() => this.setState({toast: ''})}
            ContentProps={{
                'aria-describedby': 'message-id',
            }}
            message={<span id="message-id">{this.state.toast}</span>}
            action={[
                <IconButton
                    key="close"
                    aria-label="Close"
                    color="inherit"
                    className={this.props.classes.close}
                    onClick={() => this.setState({toast: ''})}
                >
                    <IconClose />
                </IconButton>,
            ]}
        />;
    }

    renderHint() {
        if (this.state.showHint) {
            return <Message text={I18n.t('Click now Get new connection certificates to request new temporary password')} onClose={() => this.setState({showHint: false})}/>;
        } else {
            return null;
        }
    }

    renderSettings() {
        return [
            this.state.ips && this.state.ips.length ?
                <FormControl key="bindSelect"  className={this.props.classes.bind}>
                    <InputLabel>{ I18n.t('Local IP address') }</InputLabel>
                    <Select
                         disabled={ this.state.requesting }
                         value={ this.props.native.bind || '' }
                         onChange={ e => this.props.onChange('bind', e.target.value) }
                    >
                        <MenuItem value="127.0.0.1">127.0.0.1</MenuItem>
                        { this.state.ips.map(ip => <MenuItem key={ip} value={ ip }>{ ip }</MenuItem>) }
                    </Select></FormControl> :
                <TextField
                    disabled={this.state.requesting}
                    key="bind"
                    className={this.props.classes.bind}
                    label={I18n.t('Local IP address')}
                    value={this.props.native.bind}
                    onChange={e => this.props.onChange('bind', e.target.value)}
                />,
            <TextField
                disabled={this.state.requesting}
                key="port"
                type="number"
                min={1}
                max={0xFFFF}
                className={this.props.classes.port}
                label={I18n.t('Local port')}
                value={this.props.native.port}
                onChange={e => this.props.onChange('port', e.target.value)}
            />,
            <br key="br1"/>,
            <TextField
                disabled={this.state.requesting}
                key="defaultTimeout"
                type="number"
                min={0}
                max={10000}
                className={this.props.classes.defaultTimeout}
                label={I18n.t('Default timeout (ms)')}
                value={this.props.native.defaultTimeout}
                onChange={e => this.props.onChange('defaultTimeout', e.target.value)}
            />,
            <br key="br2"/>,
            <FormControl key="webInstanceSelect"  className={this.props.classes.bind}>
                <InputLabel>{I18n.t('WEB Instance')}</InputLabel>
                <Select
                    disabled={this.state.requesting}
                    value={this.props.native.webInstance}
                    onChange={e => this.props.onChange('webInstance', e.target.value)}
                >
                    <MenuItem value="*">{I18n.t('All')}</MenuItem>
                    {this.state.webInstances ? this.state.webInstances.map(instance => <MenuItem key={instance} value={instance}>{instance}</MenuItem>) : null}
                </Select></FormControl>
        ];
    }

    renderMessage() {
        if (!this.state.messageText) {
            return null;
        }
        return <DialogMessage title={I18n.t('Success')} onClose={() => this.setState({messageText: ''})}>{this.state.messageText}</DialogMessage>
    }

    checkConnection() {
        this.setState({requesting: true}, () =>
            this.props.socket.sendTo(this.props.adapterName + '.' + this.props.instance, 'test', this.props.native, data => {
                if (data.error) {
                    this.setState({requesting: false}, () => this.showError(I18n.t(data.error)));
                } else {
                    this.setState({messageText: data.result, requesting: false});
                }
            }));
    }

    render() {
        return <form key="option" className={ this.props.classes.tab }>
            <Logo
                instance={ this.props.instance }
                common={ this.props.common }
                native={ this.props.native }
                onError={text => this.setState({errorText: text}) }
                onLoad={ this.props.onLoad }
            />
            { this.renderSettings() }
            <br/>
            { this.renderHint() }
            { this.renderToast() }
            { this.renderMessage() }
            { this.renderError() }
        </form>;
    }
}

Options.propTypes = {
    common: PropTypes.object.isRequired,
    native: PropTypes.object.isRequired,
    instance: PropTypes.number.isRequired,
    adapterName: PropTypes.string.isRequired,
    onError: PropTypes.func,
    onConfigError: PropTypes.func,
    onLoad: PropTypes.func,
    onChange: PropTypes.func,
    getIpAddresses: PropTypes.func,
    getExtendableInstances: PropTypes.func,
    socket: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
};

export default withStyles(styles)(Options);
