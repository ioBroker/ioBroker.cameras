import React, { Component } from 'react';

import { TextField, Snackbar, IconButton, FormControl, Select, Button, MenuItem, InputLabel } from '@mui/material';

import { MdClose as IconClose, MdCheck as IconTest } from 'react-icons/md';

import {
    I18n,
    Logo,
    DialogMessage,
    DialogError,
    type AdminConnection,
    type IobTheme,
} from '@iobroker/adapter-react-v5';
import type { CamerasAdapterConfig } from '../types';
import InfoBox from '../components/InfoBox';

const styles: Record<string, React.CSSProperties> = {
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
        width: 464,
    },
    link: {
        color: 'inherit',
    },
};

interface OptionsProps {
    common: ioBroker.InstanceCommon;
    native: CamerasAdapterConfig;
    instanceAlive: boolean;
    instance: number;
    adapterName: string;
    onError: (error: string) => void;
    onConfigError: (error: string) => void;
    onLoad: (config: CamerasAdapterConfig) => void;
    onChange: (attr: string, value: number | string) => void;
    getIpAddresses: () => Promise<string[]>;
    getExtendableInstances: () => Promise<ioBroker.InstanceObject[]>;
    socket: AdminConnection;
    theme: IobTheme;
}

interface OptionsState {
    showHint: boolean;
    toast: string;
    ips: string[];
    requesting: boolean;
    webInstances: string[];
    errorText?: string;
    messageText?: string;
}

class Options extends Component<OptionsProps, OptionsState> {
    constructor(props: OptionsProps) {
        super(props);

        this.state = {
            showHint: false,
            toast: '',
            ips: [],
            requesting: true,
            webInstances: [],
        };
    }

    async componentDidMount(): Promise<void> {
        const ips: string[] = await this.props.getIpAddresses();
        const webInstances = await this.props.getExtendableInstances();
        this.setState({
            requesting: false,
            ips,
            webInstances: webInstances.map(item => item._id.replace('system.adapter.', '')),
        });
    }

    renderError(): React.JSX.Element | null {
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

    renderToast(): React.JSX.Element | null {
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

    renderHint(): React.JSX.Element | null {
        if (this.state.showHint) {
            return (
                <DialogMessage
                    text={I18n.t('Click now Get new connection certificates to request new temporary password')}
                    onClose={() => this.setState({ showHint: false })}
                />
            );
        }
        return null;
    }

    onTestFfmpeg(): void {
        let timeout: ReturnType<typeof setTimeout> | null = setTimeout(() => {
            timeout = null;
            this.setState({ toast: 'Timeout', requesting: false });
        }, 30000);

        this.setState({ requesting: true }, async () => {
            const result = await this.props.socket.sendTo(
                `${this.props.adapterName}.${this.props.instance}`,
                'ffmpeg',
                {
                    path: this.props.native.ffmpegPath,
                },
            );
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
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
    }

    renderSettings(): React.JSX.Element {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <InfoBox
                    key="info1"
                    type="info"
                    closeable
                    style={{ color: this.props.theme.palette.mode === 'dark' ? '#FFF' : '#000' }}
                    storeId="cameras.port"
                >
                    {I18n.t('port_explanation')}
                </InfoBox>
                {/* this.state.ips?.length ? (
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
                )*/}
                <div style={{ display: 'flex', gap: 8 }}>
                    <TextField
                        variant="standard"
                        disabled={this.state.requesting}
                        key="port"
                        type="number"
                        slotProps={{
                            htmlInput: {
                                min: 1,
                                max: 0xffff,
                            },
                        }}
                        style={styles.port}
                        label={I18n.t('Local port')}
                        value={this.props.native.port}
                        onChange={e => this.props.onChange('port', e.target.value)}
                    />
                    <TextField
                        variant="standard"
                        disabled={this.state.requesting}
                        key="defaultTimeout"
                        type="number"
                        slotProps={{
                            htmlInput: {
                                min: 1,
                                max: 10000,
                            },
                        }}
                        style={styles.defaultTimeout}
                        label={I18n.t('Default timeout (ms)')}
                        value={this.props.native.defaultTimeout}
                        onChange={e => this.props.onChange('defaultTimeout', e.target.value)}
                    />
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
                    </FormControl>
                </div>
                <InfoBox
                    key="info1"
                    type="info"
                    closeable
                    style={{ color: this.props.theme.palette.mode === 'dark' ? '#FFF' : '#000' }}
                    storeId="cameras.ffmpeg"
                >
                    {I18n.t('ffmpeg_explanation')}
                </InfoBox>
                <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                    <TextField
                        variant="standard"
                        disabled={this.state.requesting}
                        key="ffmpegPath"
                        style={styles.ffmpegPath}
                        label={I18n.t('Path to ffpmeg executable')}
                        value={this.props.native.ffmpegPath || ''}
                        onChange={e => this.props.onChange('ffmpegPath', e.target.value)}
                        helperText={I18n.t('Like /usr/bin/ffmpeg')}
                    />
                    <Button
                        key="ffmpegPathButton"
                        color="grey"
                        variant="outlined"
                        onClick={() => this.onTestFfmpeg()}
                        disabled={!this.props.instanceAlive || this.state.requesting}
                        startIcon={<IconTest />}
                    >
                        {I18n.t('Test path')}
                    </Button>
                </div>
                <TextField
                    variant="standard"
                    disabled={this.state.requesting}
                    key="tempPath"
                    style={styles.ffmpegPath}
                    label={I18n.t('Path to store temporary images')}
                    value={this.props.native.tempPath || ''}
                    onChange={e => this.props.onChange('tempPath', e.target.value)}
                    helperText={I18n.t('If empty then in adapter folder')}
                />
                <TextField
                    variant="standard"
                    disabled={this.state.requesting}
                    key="defaultCacheTimeout"
                    style={styles.ffmpegPath}
                    label={I18n.t('Default cache timeout (ms)')}
                    slotProps={{
                        htmlInput: {
                            min: 0,
                            max: 60000,
                        },
                    }}
                    type="number"
                    value={this.props.native.defaultCacheTimeout || ''}
                    onChange={e => this.props.onChange('defaultCacheTimeout', e.target.value)}
                    helperText={I18n.t(
                        'How often the cameras will be asked for new snapshot. If 0, then by every request',
                    )}
                />
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
                />
            </div>
        );
    }

    renderMessage(): React.JSX.Element | null {
        if (!this.state.messageText) {
            return null;
        }
        return (
            <DialogMessage
                title={I18n.t('Success')}
                onClose={() => this.setState({ messageText: '' })}
                text={this.state.messageText}
            />
        );
    }

    render(): React.JSX.Element {
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
                {this.renderHint()}
                {this.renderToast()}
                {this.renderMessage()}
                {this.renderError()}
            </form>
        );
    }
}

export default Options;
