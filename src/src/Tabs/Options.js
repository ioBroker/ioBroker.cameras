import React, {Component} from 'react';
import {withStyles} from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import DialogMessage from '@iobroker/adapter-react/Dialogs/Message';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';

import {MdClose as IconClose} from 'react-icons/md';

import I18n from '@iobroker/adapter-react/i18n';
import Logo from './Logo';
import Message from '@iobroker/adapter-react/Dialogs/Message';
import DialogError from "@iobroker/adapter-react/Dialogs/Error";

const styles = theme => ({
    tab: {
        width: '100%',
        minHeight: '100%'
    },
    input: {
        minWidth: 300
    },
    button: {
        marginRight: 20,
    },
    card: {
        maxWidth: 345,
        textAlign: 'center'
    },
    media: {
        height: 180,
    },
    column: {
        display: 'inline-block',
        verticalAlign: 'top',
        marginRight: 20
    },
    columnLogo: {
        width: 350,
        marginRight: 0
    },
    columnSettings: {
        width: 'calc(100% - 370px)',
    },
    typeSelector: {
        marginBottom: 20
    },
    serverURL: {
        width: '30%',
        minWidth: 300,
        marginRight: 20,
    },
    certSelector: {
        width: 200,
        marginRight: 20,
        marginBottom: 24,
    },
    certSecurityMode: {
        width: 200,
        marginRight: 20,
        marginBottom: 24,
    },
    certSecurityPolicy: {
        width: 200,
        marginRight: 20,
        marginBottom: 24,
    },
    basic: {
        width: 200,
        marginRight: 20,
        marginBottom: 24,
    }
});

class Options extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showHint: false,
            toast: '',
            isInstanceAlive: false,
            certificates: null,
            requesting: false,
            passwordRepeat: this.props.native.basicUserPassword
        };

        this.textPasswordMismatch = I18n.t('Password repeat mismatch');

        this.props.socket.getObject(`system.adapter.${this.props.adapterName}.${this.props.instance}`)
            .then(obj =>
                this.props.socket.getState(`system.adapter.${this.props.adapterName}.${this.props.instance}.alive`)
                    .then(state =>
                        this.props.socket.getCertificates()
                            .then(certificates =>
                                this.setState({certificates, isInstanceAlive: obj && obj.common && obj.common.enabled && state && state.val}))));

    }

    showError(text) {
        this.setState({errorText: text});
    }

    renderError() {
        if (!this.state.errorText) {
            return null;
        }
        return (<DialogError text={this.state.errorText} title={I18n.t('Error')} onClose={() => this.setState({errorText: ''})}/>);
    }

    renderToast() {
        if (!this.state.toast) return null;
        return (
            <Snackbar
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
            />);
    }

    renderHint() {
        if (this.state.showHint) {
            return (<Message text={I18n.t('Click now Get new connection certificates to request new temporary password')} onClose={() => this.setState({showHint: false})}/>);
        } else {
            return null;
        }
    }

    renderSettings() {
        return [
            (<TextField
                disabled={this.state.requesting}
                key="bind"
                className={this.props.classes.bind}
                label={I18n.t('Local IP address')}
                value={this.props.native.bind}
                onChange={e => this.props.onChange('bind', e.target.value)}
            />),
            (<TextField
                disabled={this.state.requesting}
                key="bind"
                type="number"
                min={1}
                max={0xFFFF}
                className={this.props.classes.port}
                label={I18n.t('Local port')}
                value={this.props.native.port}
                onChange={e => this.props.onChange('port', e.target.value)}
            />),
            (<TextField
                disabled={this.state.requesting}
                key="defaultTimeout"
                type="number"
                min={0}
                max={10000}
                className={this.props.classes.defaultTimeout}
                label={I18n.t('Default timeout')}
                value={this.props.native.defaultTimeout}
                onChange={e => this.props.onChange('defaultTimeout', e.target.value)}
            />),
        ];
    }

    renderMessage() {
        if (!this.state.messageText) {
            return null;
        }
        return (<DialogMessage title={I18n.t('Success')} onClose={() => this.setState({messageText: ''})}>{this.state.messageText}</DialogMessage>)
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
        return (
            <form className={this.props.classes.tab}>
                <Logo
                    instance={this.props.instance}
                    common={this.props.common}
                    native={this.props.native}
                    onError={text => this.setState({errorText: text})}
                    onLoad={this.props.onLoad}
                />
                {this.renderSettings()}<br/>
                {this.renderHint()}
                {this.renderToast()}
                {this.renderMessage()}
                {this.renderError()}
            </form>
        );
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
    socket: PropTypes.object.isRequired,
};

export default withStyles(styles)(Options);
