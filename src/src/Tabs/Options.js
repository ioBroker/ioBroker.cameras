import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { TextField, Snackbar, IconButton, FormControl, Select, Button, MenuItem, InputLabel } from '@mui/material';

import { MdClose as IconClose, MdCheck as IconTest } from 'react-icons/md';

import { I18n, Logo, Message, Error as DialogError } from '@iobroker/adapter-react-v5';

const styles = {
    tab: {
        width: '100%',
        minHeight: '100%',
    },
    bind: {
        marginRight: 10,
        marginBottom: 20,
        minWidth: 200,
    },
    port: {
        width: 100,
    },
    defaultTimeout: {
        width: 150,
    },
    ffmpegPath: {
        width: 450,
    },
    link: {
        color: 'inherit',
    },
};

class Options extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showHint: false,
            toast: '',
            ips: [],
            requesting: true,
            webInstances: [],
        };
    }

    componentDidMount() {
        let ips;
        this.props
            .getIpAddresses()
            .then(_ips => (ips = _ips))
            .then(() => this.props.getExtendableInstances())
            .then(webInstances =>
                this.setState({
                    requesting: false,
                    ips,
                    webInstances: webInstances.map(item => item._id.replace('system.adapter.', '')),
                }),
            );
    }

    showError(text) {
        this.setState({ errorText: text });
    }

    renderError() {
        if (!this.state.errorText) {
            return null;
        }
        return (
            <DialogError
                text={this.state.errorText}
                title={I18n.t('Error')}
                onClose={() => this.setState({ errorText: '' })}
            />
        );
    }

    renderToast() {
        if (!this.state.toast) {
            return null;
        }
        return (
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                open={true}
                autoHideDuration={6000}
                onClose={() => this.setState({ toast: '' })}
                ContentProps={{
                    'aria-describedby': 'message-id',
                }}
                message={<span id="message-id">{this.state.toast}</span>}
                action={[
                    <IconButton
                        key="close"
                        aria-label="Close"
                        color="inherit"
                        style={styles.close}
                        onClick={() => this.setState({ toast: '' })}
                    >
                        <IconClose />
                    </IconButton>,
                ]}
            />
        );
    }

    renderHint() {
        if (this.state.showHint) {
            return (
                <Message
                    text={I18n.t('Click now Get new connection certificates to request new temporary password')}
                    onClose={() => this.setState({ showHint: false })}
                />
            );
        } else {
            return null;
        }
    }

    onTestFfmpeg() {
        let timeout = setTimeout(() => {
            timeout = null;
            this.setState({ toast: 'Timeout', requesting: false });
        }, 30000);

        this.setState({ requesting: true }, () => {
            this.props.socket
                .sendTo(`${this.props.adapterName}.${this.props.instance}`, 'ffmpeg', {
                    path: this.props.native.ffmpegPath,
                })
                .then(result => {
                    timeout && clearTimeout(timeout);
                    if (!result?.version || result.error) {
                        let error = result?.error ? result.error : I18n.t('No answer');
                        if (typeof error !== 'string') {
                            error = JSON.stringify(error);
                        }
                        this.setState({ toast: error, requesting: false });
                    } else {
                        this.setState({ toast: `${I18n.t('Success:')} ${result.version}`, requesting: false });
                    }
                });
        });
    }

    renderSettings() {
        return [
            this.state.ips && this.state.ips.length ? (
                <FormControl
                    key="bindSelect"
                    style={styles.bind}
                    variant="standard"
                >
                    <InputLabel>{I18n.t('Local IP address')}</InputLabel>
                    <Select
                        variant="standard"
                        disabled={this.state.requesting}
                        value={this.props.native.bind || ''}
                        onChange={e => this.props.onChange('bind', e.target.value)}
                    >
                        <MenuItem value="127.0.0.1">127.0.0.1</MenuItem>
                        {this.state.ips.map(ip => (
                            <MenuItem
                                key={ip}
                                value={ip}
                            >
                                {ip}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            ) : (
                <TextField
                    variant="standard"
                    disabled={this.state.requesting}
                    key="bind"
                    style={styles.bind}
                    label={I18n.t('Local IP address')}
                    value={this.props.native.bind}
                    onChange={e => this.props.onChange('bind', e.target.value)}
                />
            ),
            <TextField
                variant="standard"
                disabled={this.state.requesting}
                key="port"
                type="number"
                min={1}
                max={0xffff}
                style={styles.port}
                label={I18n.t('Local port')}
                value={this.props.native.port}
                onChange={e => this.props.onChange('port', e.target.value)}
            />,
            <br key="br1" />,
            <TextField
                variant="standard"
                disabled={this.state.requesting}
                key="defaultTimeout"
                type="number"
                min={0}
                max={10000}
                style={styles.defaultTimeout}
                label={I18n.t('Default timeout (ms)')}
                value={this.props.native.defaultTimeout}
                onChange={e => this.props.onChange('defaultTimeout', e.target.value)}
            />,
            <br key="br2" />,
            <FormControl
                key="webInstanceSelect"
                style={styles.bind}
                variant="standard"
            >
                <InputLabel>{I18n.t('WEB Instance')}</InputLabel>
                <Select
                    variant="standard"
                    disabled={this.state.requesting}
                    value={this.props.native.webInstance}
                    onChange={e => this.props.onChange('webInstance', e.target.value)}
                >
                    <MenuItem value="*">{I18n.t('All')}</MenuItem>
                    {this.state.webInstances
                        ? this.state.webInstances.map(instance => (
                              <MenuItem
                                  key={instance}
                                  value={instance}
                              >
                                  {instance}
                              </MenuItem>
                          ))
                        : null}
                </Select>
            </FormControl>,
            <br key="br3" />,
            <TextField
                variant="standard"
                disabled={this.state.requesting}
                key="ffmpegPath"
                style={styles.ffmpegPath}
                label={I18n.t('Path to ffpmeg executable')}
                value={this.props.native.ffmpegPath || ''}
                onChange={e => this.props.onChange('ffmpegPath', e.target.value)}
                helperText={I18n.t('Like /usr/bin/ffmpeg')}
            />,
            <Button
                key="ffmpegPathButton"
                color="grey"
                variant="outlined"
                onClick={() => this.onTestFfmpeg()}
                disabled={!this.props.instanceAlive || this.state.requesting}
                startIcon={<IconTest />}
            >
                {I18n.t('Test path')}
            </Button>,
            <br key="br4" />,
            <TextField
                variant="standard"
                disabled={this.state.requesting}
                key="tempPath"
                style={styles.ffmpegPath}
                label={I18n.t('Path to store temporary images')}
                value={this.props.native.tempPath || ''}
                onChange={e => this.props.onChange('tempPath', e.target.value)}
                helperText={I18n.t('If empty then in adapter folder')}
            />,
            <br key="br5" />,
            <TextField
                variant="standard"
                disabled={this.state.requesting}
                key="defaultCacheTimeout"
                style={styles.ffmpegPath}
                label={I18n.t('Default cache timeout (ms)')}
                min={0}
                max={60000}
                type="number"
                value={this.props.native.defaultCacheTimeout || ''}
                onChange={e => this.props.onChange('defaultCacheTimeout', e.target.value)}
                helperText={I18n.t(
                    'How often the cameras will be ascked for new snapshot. If 0, then by every request',
                )}
            />,
            <br key="br6" />,
            <TextField
                variant="standard"
                disabled={this.state.requesting}
                key="dateFormat"
                style={styles.ffmpegPath}
                label={I18n.t('Time format')}
                value={this.props.native.dateFormat || ''}
                onChange={e => this.props.onChange('dateFormat', e.target.value)}
                helperText={
                    <span>
                        {I18n.t('See here:')}{' '}
                        <a
                            href="https://momentjs.com/docs/#/displaying/"
                            rel="noreferrer"
                            target="_blank"
                            style={styles.link}
                        >
                            https://momentjs.com/
                        </a>
                    </span>
                }
            />,
        ];
    }

    renderMessage() {
        if (!this.state.messageText) {
            return null;
        }
        return (
            <Message
                title={I18n.t('Success')}
                onClose={() => this.setState({ messageText: '' })}
            >
                {this.state.messageText}
            </Message>
        );
    }

    render() {
        return (
            <form
                key="option"
                style={styles.tab}
            >
                <Logo
                    instance={this.props.instance}
                    common={this.props.common}
                    native={this.props.native}
                    onError={text => this.setState({ errorText: text })}
                    onLoad={this.props.onLoad}
                />
                {this.renderSettings()}
                <br />
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
    instanceAlive: PropTypes.bool,
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

export default Options;
