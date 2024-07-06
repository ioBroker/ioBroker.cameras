import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
    Button,
    Switch,
    TextField,
} from '@mui/material';

import { I18n, SelectID } from '@iobroker/adapter-react-v5';

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

class RTSPEufyConfig extends Component {
    constructor(props) {
        super(props);

        const state = JSON.parse(JSON.stringify(this.props.settings));

        // set default values
        state.ip       = state.ip || '';
        state.oid      = state.oid || '';
        state.useOid   = state.useOid || false;
        state.eusecInstalled = false;

        this.state     = state;
    }

    componentDidMount() {
        // read if eusec adapter is installed
        this.props.socket.getAdapterInstances('eusec')
            .then(instances => {
                if (this.state.useOid && !instances.length) {
                    this.setState({ useOid: false });
                } else {
                    this.setState({ eusecInstalled: !!instances.length });
                }
            });
    }

    reportSettings() {
        this.props.onChange({
            ip:      this.state.ip,
            oid:     this.state.oid,
            useOid:  this.state.useOid,
        });
    }

    renderSelectID() {
        if (!this.state.showSelectId) {
            return null;
        }
        return <SelectID
            imagePrefix="../.."
            themeType={this.props.themeType}
            dialogName="RTSPReolinkE1"
            socket={this.props.socket}
            selected={this.state.oid}
            filterFunc={obj => obj._id.startsWith('eusec.') && obj._id.endsWith('.rtsp_stream_url')}
            statesOnly={true}
            onClose={() => this.setState({ showSelectId: false })}
            onOk={oid => {
                this.setState({ oid, showSelectId: false }, () => this.reportSettings());
            }}
        />
    }

    render() {
        return <div style={styles.page}>
            {this.renderSelectID()}
            <form>
                {this.state.eusecInstalled ? <div>
                    <span>{I18n.t('From eusec adapter')}</span>
                    <Switch
                        checked={!this.state.useOid}
                        onChange={() => this.setState({ useOid: !this.state.useOid })}
                    />
                    <span>{I18n.t('By IP address')}</span>
                </div> : null}

                {!this.state.useOid ? <TextField
                    variant="standard"
                    style={styles.ip}
                    label={I18n.t('Camera IP')}
                    value={this.state.ip}
                    onChange={e => this.setState({ ip: e.target.value }, () => this.reportSettings())}
                /> : <div style={{ width: '100%', display: 'flex' }}>
                    <TextField
                        variant="standard"
                        fullWidth
                        label={I18n.t('Camera OID')}
                        value={this.state.oid}
                        onChange={e => this.setState({ oid: e.target.value }, () => this.reportSettings())}
                    />
                    <Button variant="contained" onClick={() => this.setState({ showSelectId: true })}>...</Button>
                </div>}
            </form>
        </div>;
    }
}

RTSPEufyConfig.propTypes = {
    socket: PropTypes.object,
    onChange: PropTypes.func,
    native: PropTypes.object,
    defaultTimeout: PropTypes.number,
    decode: PropTypes.func,
    encode: PropTypes.func,
    themeType: PropTypes.string,
};

export default RTSPEufyConfig;
