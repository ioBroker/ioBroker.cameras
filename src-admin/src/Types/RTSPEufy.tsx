import React from 'react';

import { Button, Switch, TextField } from '@mui/material';

import { I18n, DialogSelectID } from '@iobroker/adapter-react-v5';
import type { CameraConfigEufy } from '../types';
import ConfigGeneric, { type ConfigProps } from './ConfigGeneric';

const styles: Record<'page' | 'ip' | 'username' | 'password' | 'quality', React.CSSProperties> = {
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

export default class RTSPEufyConfig extends ConfigGeneric<
    CameraConfigEufy,
    { eusecInstalled: boolean; showSelectId: boolean }
> {
    public static isRtsp = true; // this camera can be used in RTSP snapshot

    constructor(props: ConfigProps<CameraConfigEufy>) {
        super(props);

        this.state = {
            ip: this.props.settings.ip || '',
            oid: this.props.settings.oid || '',
            useOid: this.props.settings.useOid || false,
            eusecInstalled: false,
            showSelectId: false,
        };
    }

    async componentDidMount(): Promise<void> {
        // read if eusec adapter is installed
        const instances = await this.props.socket.getAdapterInstances('eusec');
        if (this.state.useOid && !instances.length) {
            this.setState({ useOid: false });
        } else {
            this.setState({ eusecInstalled: !!instances.length });
        }
    }

    reportSettings(): void {
        this.props.onChange({
            ip: this.state.ip,
            oid: this.state.oid,
            useOid: this.state.useOid,
        });
    }

    renderSelectID(): React.JSX.Element | null {
        if (!this.state.showSelectId) {
            return null;
        }
        return (
            <DialogSelectID
                imagePrefix="../.."
                theme={this.props.theme}
                themeType={this.props.themeType}
                dialogName="RTSPReolinkE1"
                socket={this.props.socket}
                selected={this.state.oid}
                filterFunc={obj => obj._id.startsWith('eusec.') && obj._id.endsWith('.rtsp_stream_url')}
                onClose={() => this.setState({ showSelectId: false })}
                onOk={_oid => {
                    let oid: string | undefined;
                    if (Array.isArray(_oid)) {
                        oid = _oid[0];
                    } else {
                        oid = _oid || '';
                    }
                    this.setState({ oid, showSelectId: false }, () => this.reportSettings());
                }}
            />
        );
    }

    render(): React.JSX.Element {
        return (
            <div style={styles.page}>
                {this.renderSelectID()}
                <form>
                    {this.state.eusecInstalled ? (
                        <div>
                            <span>{I18n.t('From eusec adapter')}</span>
                            <Switch
                                checked={!this.state.useOid}
                                onChange={() => this.setState({ useOid: !this.state.useOid })}
                            />
                            <span>{I18n.t('By IP address')}</span>
                        </div>
                    ) : null}

                    {!this.state.useOid ? (
                        <TextField
                            variant="standard"
                            style={styles.ip}
                            label={I18n.t('Camera IP')}
                            value={this.state.ip}
                            onChange={e => this.setState({ ip: e.target.value }, () => this.reportSettings())}
                        />
                    ) : (
                        <div style={{ width: '100%', display: 'flex' }}>
                            <TextField
                                variant="standard"
                                fullWidth
                                label={I18n.t('Camera OID')}
                                value={this.state.oid}
                                onChange={e => this.setState({ oid: e.target.value }, () => this.reportSettings())}
                            />
                            <Button
                                variant="contained"
                                onClick={() => this.setState({ showSelectId: true })}
                            >
                                ...
                            </Button>
                        </div>
                    )}
                </form>
            </div>
        );
    }
}
