import React, { type JSX } from 'react';

import { Button, Switch, TextField } from '@mui/material';

import { I18n, SelectID } from '@iobroker/adapter-react-v5';
import GenericConfig, { type GenericCameraSettings, type GenericConfigProps } from '../Types/GenericConfig';

const styles: Record<string, React.CSSProperties> = {
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

export interface RTSPEufySettings extends GenericCameraSettings {
    ip: string;
    oid: string;
    useOid: boolean;
    eusecInstalled: boolean;
    showSelectId: boolean;
}

class RTSPEufyConfig extends GenericConfig<RTSPEufySettings> {
    constructor(props: GenericConfigProps) {
        super(props);

        // set default values
        Object.assign(this.state, {
            ip: this.state.ip || '',
            oid: this.state.oid || '',
            useOid: this.state.useOid || false,
            eusecInstalled: false,
        });
    }

    componentDidMount(): void {
        // read if eusec adapter is installed
        void this.props.socket.getAdapterInstances('eusec').then(instances => {
            if (this.state.useOid && !instances.length) {
                this.setState({ useOid: false });
            } else {
                this.setState({ eusecInstalled: !!instances.length });
            }
        });
    }

    reportSettings(): void {
        this.props.onChange({
            ip: this.state.ip,
            oid: this.state.oid,
            useOid: this.state.useOid,
        });
    }

    renderSelectID(): JSX.Element | null {
        if (!this.state.showSelectId) {
            return null;
        }
        return (
            <SelectID
                imagePrefix="../.."
                theme={this.props.theme}
                themeType={this.props.themeType}
                dialogName="RTSPReolinkE1"
                socket={this.props.socket}
                selected={this.state.oid}
                filterFunc={obj => obj._id.startsWith('eusec.') && obj._id.endsWith('.rtsp_stream_url')}
                onClose={() => this.setState({ showSelectId: false })}
                onOk={(oid: string | string[] | undefined) => {
                    if (oid && typeof oid === 'object') {
                        this.setState({ oid: oid[0], showSelectId: false }, () => this.reportSettings());
                    } else if (oid) {
                        this.setState({ oid, showSelectId: false }, () => this.reportSettings());
                    } else {
                        this.setState({ showSelectId: false }, () => this.reportSettings());
                    }
                }}
            />
        );
    }

    render(): JSX.Element {
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

export default RTSPEufyConfig;
