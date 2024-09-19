import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { TextField, Checkbox, FormControlLabel, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

import { I18n } from '@iobroker/adapter-react-v5';

const styles = {
    page: {
        width: '100%',
    },
    ip: {
        marginRight: 8,
        width: 200,
    },
    port: {
        marginRight: 8,
        width: 200,
    },
    protocol: {
        width: 70,
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
    urlPath: {
        marginTop: 16,
        marginBotton: `24px !important`,
        width: 408,
    },
    width: {
        marginTop: 16,
        marginRight: 8,
        width: 90,
    },
    height: {
        marginTop: 16,
        width: 90,
    },
    expertMode: {
        marginTop: 16,
    },
    suffix: {
        marginTop: 16,
        width: 200,
    },
    prefix: {
        marginTop: 16,
        marginRight: 8,
        width: 200,
    },
    ffmpgDiv: {
        marginTop: 16,
    },
    ffmpgLabel: {
        fontSize: 'smaller',
        fontWeight: 'bold',
    },
    ffmpgCommand: {
        fontFamily: 'monospace',
        fontSize: 'smaller',
    },
};

class RTSPImageConfig extends Component {
    constructor(props) {
        super(props);

        const state = JSON.parse(JSON.stringify(this.props.settings));

        // set default values
        state.ip = state.ip || '';
        state.port = state.port || '554';
        state.urlPath = state.urlPath || '';
        state.password = state.password || '';
        state.username = state.username === undefined ? 'admin' : state.username || '';
        state.url = `rtsp://${state.username ? `${state.username}:***@` : ''}${state.ip}:${state.port}${state.urlPath ? (state.urlPath.startsWith('/') ? state.urlPath : `/${state.urlPath}`) : ''}`;
        state.originalWidth = state.originalWidth || '';
        state.originalHeight = state.originalHeight || '';
        state.prefix = state.prefix || '';
        state.suffix = state.suffix || '';
        state.protocol = state.protocol || 'udp';

        this.state = state;
    }

    static getRtsp() {
        return true; // this camera can be used in RTSP snapshot
    }

    componentDidMount() {
        this.props.decrypt(this.state.password, password => this.setState({ password }));
    }

    reportSettings() {
        this.props.encrypt(this.state.password, password => {
            this.props.onChange({
                ip: this.state.ip,
                username: this.state.username,
                password,
                port: this.state.port,
                urlPath: this.state.urlPath,
                prefix: this.state.prefix,
                suffix: this.state.suffix,
                protocol: this.state.protocol,
                originalWidth: this.state.originalWidth,
                originalHeight: this.state.originalHeight,
            });
        });
    }

    buildCommand(options) {
        const parameters = ['-y'];
        options.prefix && parameters.push(options.prefix);
        parameters.push('-rtsp_transport');
        parameters.push(options.protocol || 'udp');
        parameters.push('-i');
        parameters.push(
            `rtsp://${options.username ? options.username + (options.password ? ':***' : '') : ''}@${options.ip}:${options.port || 554}${options.urlPath ? (options.urlPath.startsWith('/') ? options.urlPath : `/${options.urlPath}`) : ''}`,
        );
        parameters.push('-loglevel');
        parameters.push('error');
        if (options.originalWidth && options.originalHeight) {
            parameters.push(`scale=${options.originalWidth}:${options.originalHeight}`);
        }
        parameters.push('-vframes');
        parameters.push('1');
        options.suffix && parameters.push(options.suffix);
        parameters.push(
            `${this.props.native.tempPath ? `${this.props.native.tempPath}/` : ''}${options.ip.replace(/[.:]/g, '_')}.jpg`,
        );
        return parameters;
    }

    render() {
        return (
            <div style={styles.page}>
                <form>
                    <TextField
                        variant="standard"
                        style={styles.ip}
                        label={I18n.t('Camera IP')}
                        value={this.state.ip}
                        onChange={e => this.setState({ ip: e.target.value }, () => this.reportSettings())}
                    />
                    <TextField
                        variant="standard"
                        style={styles.port}
                        type="number"
                        label={I18n.t('Port')}
                        value={this.state.port}
                        onChange={e => this.setState({ port: e.target.value }, () => this.reportSettings())}
                    />
                    <FormControl
                        style={styles.protocol}
                        variant="standart"
                    >
                        <InputLabel>{I18n.t('Protocol')}</InputLabel>
                        <Select
                            variant="standard"
                            value={this.state.protocol || 'udp'}
                            onChange={e => this.setState({ protocol: e.target.value }, () => this.reportSettings())}
                        >
                            <MenuItem value="udp">UDP</MenuItem>
                            <MenuItem value="tcp">TCP</MenuItem>
                        </Select>
                    </FormControl>
                    <br />
                    <TextField
                        variant="standard"
                        style={styles.urlPath}
                        label={I18n.t('Path')}
                        value={this.state.urlPath}
                        onChange={e => this.setState({ urlPath: e.target.value }, () => this.reportSettings())}
                        helperText={this.state.url}
                    />
                    <br />
                    <TextField
                        variant="standard"
                        autoComplete="new-password"
                        style={styles.username}
                        label={I18n.t('Username')}
                        value={this.state.username}
                        onChange={e => this.setState({ username: e.target.value }, () => this.reportSettings())}
                    />
                    <TextField
                        variant="standard"
                        type="password"
                        autoComplete="new-password"
                        style={styles.password}
                        label={I18n.t('Password')}
                        value={this.state.password}
                        onChange={e => this.setState({ password: e.target.value }, () => this.reportSettings())}
                    />
                    <br />
                    <FormControlLabel
                        style={styles.expertMode}
                        control={
                            <Checkbox
                                checked={!!this.state.expertMode}
                                onChange={e => this.setState({ expertMode: e.target.checked })}
                            />
                        }
                        label={I18n.t('Expert settings')}
                    />
                    {this.state.expertMode ? <br /> : null}
                    {this.state.expertMode ? (
                        <TextField
                            variant="standard"
                            style={styles.width}
                            label={I18n.t('Width')}
                            helperText={I18n.t('in pixels')}
                            error={this.state.originalHeight && !this.state.originalWidth}
                            value={this.state.originalWidth}
                            onChange={e =>
                                this.setState({ originalWidth: e.target.value }, () => this.reportSettings())
                            }
                        />
                    ) : null}
                    {this.state.expertMode ? (
                        <div style={{ display: 'inline-block', marginTop: 40, marginRight: 8 }}>x</div>
                    ) : null}
                    {this.state.expertMode ? (
                        <TextField
                            variant="standard"
                            style={styles.height}
                            label={I18n.t('Height')}
                            error={!this.state.originalHeight && this.state.originalWidth}
                            helperText={I18n.t('in pixels')}
                            value={this.state.originalHeight}
                            onChange={e =>
                                this.setState({ originalHeight: e.target.value }, () => this.reportSettings())
                            }
                        />
                    ) : null}
                    {this.state.expertMode ? <br /> : null}
                    {this.state.expertMode ? (
                        <TextField
                            variant="standard"
                            style={styles.prefix}
                            label={I18n.t('Prefix in command')}
                            value={this.state.prefix}
                            onChange={e => this.setState({ prefix: e.target.value }, () => this.reportSettings())}
                        />
                    ) : null}
                    {this.state.expertMode ? (
                        <TextField
                            variant="standard"
                            style={styles.suffix}
                            label={I18n.t('Suffix in command')}
                            value={this.state.suffix}
                            onChange={e => this.setState({ suffix: e.target.value }, () => this.reportSettings())}
                        />
                    ) : null}
                    {this.state.expertMode ? <br /> : null}
                    {this.state.expertMode ? <br /> : null}
                    {this.state.expertMode ? (
                        <div style={styles.ffmpgDiv}>
                            <span style={styles.ffmpgLabel}>{I18n.t('ffmpeg command')}: </span>
                            <span style={styles.ffmpgCommand}>ffmpeg {this.buildCommand(this.state).join(' ')}</span>
                        </div>
                    ) : null}
                </form>
            </div>
        );
    }
}

RTSPImageConfig.propTypes = {
    onChange: PropTypes.func,
    native: PropTypes.object,
    defaultTimeout: PropTypes.number,
    decode: PropTypes.func,
    encode: PropTypes.func,
};

export default RTSPImageConfig;
