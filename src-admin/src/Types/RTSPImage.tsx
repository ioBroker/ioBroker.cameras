import React from 'react';

import { TextField, Checkbox, FormControlLabel, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

import { I18n } from '@iobroker/gui-components';
import type { CameraConfigRtsp } from '../types';
import ConfigGeneric, { type ConfigProps } from './ConfigGeneric';

const styles: Record<string, any> = {
    page: {
        width: '100%',
    },
    url: {
        width: 408,
    },
    protocol: {
        marginTop: 16,
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
        // One long line otherwise, which widens the whole column
        wordBreak: 'break-all',
    },
};

/** Standard port of RTSPS. A camera may use another one, like UniFi Protect with 7441 */
const RTSPS_PORT = '322';

/** Address, port and path as one URL, without the login - that has fields of its own */
function buildUrl(ip: string, port: string | number, urlPath: string, secure?: boolean): string {
    if (!ip) {
        return '';
    }
    const path = urlPath ? (urlPath.startsWith('/') ? urlPath : `/${urlPath}`) : '';
    // The backend leaves out only the RTSP default port, see buildCommand() in src/cameras/rtspCommon.ts
    const showPort = port && (secure || parseInt(port as string, 10) !== 554);
    return `${secure ? 'rtsps' : 'rtsp'}://${ip}${showPort ? `:${port}` : ''}${path}`;
}

/**
 * Split a pasted link like "rtsp://admin:secret@192.168.1.10:554/stream1" into the stored fields.
 * Returns null while the text is no usable address yet.
 */
function parseUrl(text: string): {
    ip: string;
    port: string;
    urlPath: string;
    secure: boolean;
    username?: string;
    password?: string;
} | null {
    const m = text
        .trim()
        .match(/^(?:(rtsps?):\/\/)?(?:([^:@/]*)(?::([^@/]*))?@)?(\[[^\]]+]|[^:/?#\s]+)(?::(\d*))?([/?#].*)?$/i);
    if (!m) {
        return null;
    }
    const secure = m[1]?.toLowerCase() === 'rtsps';
    const decode = (value: string): string => {
        try {
            return decodeURIComponent(value);
        } catch {
            return value;
        }
    };
    return {
        ip: m[4],
        port: m[5] || (secure ? RTSPS_PORT : '554'),
        urlPath: m[6] || '',
        secure,
        username: m[2] !== undefined ? decode(m[2]) : undefined,
        password: m[3] !== undefined ? decode(m[3]) : undefined,
    };
}

export default class RTSPImageConfig extends ConfigGeneric<CameraConfigRtsp, { url: string; expertMode: boolean }> {
    public static isRtsp = true; // this camera can be used in RTSP snapshot

    constructor(props: ConfigProps<CameraConfigRtsp>) {
        super(props);

        this.state = {
            ip: this.props.settings.ip || '',
            port: this.props.settings.port || '554',
            urlPath: this.props.settings.urlPath || '',
            password: this.props.settings.password || '',
            username: this.props.settings.username === undefined ? 'admin' : this.props.settings.username || '',
            // The text of the URL field. Kept as typed, the stored fields are parsed from it
            url: buildUrl(
                this.props.settings.ip || '',
                this.props.settings.port || '554',
                this.props.settings.urlPath || '',
                this.props.settings.secure,
            ),
            secure: !!this.props.settings.secure,
            keyFramesOnly: !!this.props.settings.keyFramesOnly,
            originalHeight: this.props.settings.originalHeight || '',
            originalWidth: this.props.settings.originalWidth || '',
            prefix: this.props.settings.prefix || '',
            suffix: this.props.settings.suffix || '',
            // Same default as RtspCamera in the backend
            protocol: this.props.settings.protocol || 'tcp',
            // Open when one of its settings is used, so nothing is hidden that changes the result
            expertMode:
                !!this.props.settings.prefix ||
                !!this.props.settings.suffix ||
                !!this.props.settings.keyFramesOnly ||
                !!this.props.settings.originalWidth ||
                !!this.props.settings.originalHeight,
        };
    }

    componentDidMount(): void {
        this.props.decrypt(this.state.password || '', password => this.setState({ password }));
    }

    reportSettings(): void {
        this.props.encrypt(this.state.password || '', password => {
            this.props.onChange({
                ip: this.state.ip,
                username: this.state.username,
                password,
                port: this.state.port,
                urlPath: this.state.urlPath,
                prefix: this.state.prefix,
                suffix: this.state.suffix,
                protocol: this.state.protocol,
                secure: this.state.secure,
                keyFramesOnly: this.state.keyFramesOnly,
                originalWidth: this.state.originalWidth,
                originalHeight: this.state.originalHeight,
            });
        });
    }

    onUrlChange(url: string): void {
        const parsed = parseUrl(url);
        if (!parsed) {
            this.setState({ url, ip: '' }, () => this.reportSettings());
            return;
        }
        const { username, password, ...address } = parsed;
        if (username !== undefined) {
            // A pasted login goes to its own fields - the password must not stay readable in the URL
            this.setState(
                {
                    ...address,
                    username,
                    password: password || '',
                    url: buildUrl(address.ip, address.port, address.urlPath, address.secure),
                },
                () => this.reportSettings(),
            );
        } else {
            this.setState({ ...address, url }, () => this.reportSettings());
        }
    }

    buildCommand(
        options: Omit<
            CameraConfigRtsp,
            'name' | 'type' | 'desc' | 'timeout' | 'cacheTimeout' | 'addTime' | 'id' | 'title' | 'enabled' | 'rtsp'
        >,
    ): string[] {
        const parameters = ['-y'];
        options.prefix && parameters.push(options.prefix);
        if (options.keyFramesOnly) {
            parameters.push('-skip_frame');
            parameters.push('nokey');
        }
        parameters.push('-rtsp_transport');
        // RTSPS runs over TCP only, like in src/cameras/rtspCommon.ts
        parameters.push(options.secure ? 'tcp' : options.protocol || 'tcp');
        parameters.push('-i');
        const scheme = options.secure ? 'rtsps://' : 'rtsp://';
        parameters.push(
            // Same form as buildCommand() in src/cameras/rtspCommon.ts, with the password masked
            buildUrl(options.ip, options.port, options.urlPath, options.secure).replace(
                scheme,
                `${scheme}${options.username ? `${encodeURIComponent(options.username)}:${options.password ? '***' : ''}@` : ''}`,
            ),
        );
        parameters.push('-loglevel');
        parameters.push('error');
        if (options.originalWidth && options.originalHeight) {
            // Keep in sync with buildCommand() in src/cameras/rtspCommon.ts - this is only the
            // preview of the command line, but it must show what the adapter really executes
            parameters.push('-vf');
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

    render(): React.JSX.Element {
        return (
            <div style={styles.page}>
                <form>
                    <TextField
                        variant="standard"
                        style={styles.url}
                        label={I18n.t('RTSP URL')}
                        placeholder="rtsp://192.168.1.10:554/stream1"
                        value={this.state.url}
                        error={!!this.state.url && !parseUrl(this.state.url)}
                        helperText={I18n.t('rtsp_url_hint')}
                        onChange={e => this.onUrlChange(e.target.value)}
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
                                checked={this.state.expertMode}
                                onChange={e => this.setState({ expertMode: e.target.checked })}
                            />
                        }
                        label={I18n.t('Expert settings')}
                    />
                    {this.state.expertMode ? <br /> : null}
                    {this.state.expertMode ? (
                        <FormControl
                            style={styles.protocol}
                            variant="standard"
                        >
                            <InputLabel>{I18n.t('Transport')}</InputLabel>
                            <Select
                                variant="standard"
                                // RTSPS runs over TCP only
                                disabled={this.state.secure}
                                value={this.state.secure ? 'tcp' : this.state.protocol || 'tcp'}
                                onChange={e => this.setState({ protocol: e.target.value }, () => this.reportSettings())}
                            >
                                <MenuItem value="tcp">TCP</MenuItem>
                                <MenuItem value="udp">UDP</MenuItem>
                            </Select>
                        </FormControl>
                    ) : null}
                    {this.state.expertMode ? <br /> : null}
                    {this.state.expertMode ? (
                        <FormControlLabel
                            style={styles.expertMode}
                            control={
                                <Checkbox
                                    checked={!!this.state.keyFramesOnly}
                                    onChange={e =>
                                        this.setState({ keyFramesOnly: e.target.checked }, () => this.reportSettings())
                                    }
                                />
                            }
                            label={I18n.t('Key frames only (against grey images with H.265)')}
                        />
                    ) : null}
                    {this.state.expertMode ? <br /> : null}
                    {this.state.expertMode ? (
                        <TextField
                            variant="standard"
                            style={styles.width}
                            label={I18n.t('Width')}
                            helperText={I18n.t('in pixels')}
                            error={!!this.state.originalHeight && !this.state.originalWidth}
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
                            error={!this.state.originalHeight && !!this.state.originalWidth}
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
