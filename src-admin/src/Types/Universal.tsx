import React from 'react';

import {
    TextField,
    Autocomplete,
    Alert,
    Box,
    LinearProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    createFilterOptions,
} from '@mui/material';

import { I18n } from '@iobroker/gui-components';
import type { CameraConfigUniversal } from '../types';
import ConfigGeneric, { type ConfigProps } from './ConfigGeneric';

type UniversalConfigItem = {
    models: string[];
    variant: 'FFMPEG' | 'VLC' | 'MJPEG' | 'JPEG';
    protocol: 'rtsp://' | 'http://';
    path: string;
    /** Default port for this connection, 0 if the source did not provide one */
    port?: number;
};

/** One URL path of the manufacturer, with all models that use it */
type PathItem = {
    protocol: 'http://' | 'rtsp://';
    path: string;
    /** Default port, 0 if the source did not provide one */
    port: number;
    /** Lower case model names */
    models: string[];
    /**
     * The adapter takes a snapshot from an RTSP stream with ffmpeg, but fetches an HTTP path with
     * one plain request: that only works for a single JPEG, a never-ending MJPEG or video stream
     * runs into the timeout.
     */
    supported: boolean;
};

type ModelItem = {
    /** Lower case */
    model: string;
    /** Keys of PathItem, the most used first */
    paths: string[];
};

const pathKey = (protocol: string, path: string): string => `${protocol}${path}`;

// The big manufacturers have more than thousand models
const filterModels = createFilterOptions<ModelItem>({ limit: 100 });

const styles: Record<string, any> = {
    page: {
        width: '100%',
    },
    ip: {
        marginRight: 8,
        width: 200,
    },
    port: {
        marginRight: 8,
        width: 120,
    },
    size: {
        marginTop: 16,
        marginRight: 8,
        width: 120,
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
    pathRow: {
        display: 'flex',
        gap: 8,
        alignItems: 'flex-start',
        marginTop: 16,
        marginBottom: 16,
    },
    protocol: {
        width: 100,
        marginTop: 0,
    },
    pathOption: {
        fontFamily: 'monospace',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    pathInfo: {
        opacity: 0.7,
        fontSize: 'smaller',
        whiteSpace: 'nowrap',
    },
};

export default class Universal extends ConfigGeneric<
    CameraConfigUniversal,
    {
        manufacturer: string;
        loaded: boolean;
        paths: PathItem[];
        models: ModelItem[];
    }
> {
    public static isRtsp = true; // this camera can be used in RTSP snapshot

    constructor(props: ConfigProps<CameraConfigUniversal>) {
        super(props);

        this.state = {
            ip: this.props.settings.ip || '',
            port: this.props.settings.port || '554',
            urlPath: this.props.settings.urlPath || '',
            password: this.props.settings.password || '',
            username: this.props.settings.username === undefined ? 'admin' : this.props.settings.username || '',
            urlProtocol: this.props.settings.urlProtocol || '',
            manufacturer: this.props.settings.manufacturer || '',
            model: this.props.settings.model || '',
            loaded: false,
            paths: [],
            channel: this.props.settings.channel || 0,
            // Only used by the paths that carry a [WIDTH]/[HEIGHT] placeholder
            width: this.props.settings.width || 640,
            height: this.props.settings.height || 480,
            models: [],
        };
    }

    componentDidMount(): void {
        this.props.decrypt(this.state.password || '', password => this.setState({ password }));

        // The manufacturer is chosen in the dialog around this one, which mounts it again on a change
        if (this.state.manufacturer) {
            this.loadManufacturer(this.state.manufacturer);
        }
    }

    /** Read the model/URL table of one manufacturer and group it by URL path */
    loadManufacturer(manufacturer: string): void {
        void fetch(`./data/${manufacturer}.json`)
            .then(response => response.json())
            .then((list: UniversalConfigItem[]): void => {
                const byKey: Record<string, PathItem> = {};
                for (const item of list) {
                    const key = pathKey(item.protocol, item.path);
                    byKey[key] ||= {
                        protocol: item.protocol,
                        path: item.path,
                        port: 0,
                        models: [],
                        supported: false,
                    };
                    const entry = byKey[key];
                    entry.port ||= item.port || 0;
                    entry.supported ||= item.protocol === 'rtsp://' || item.variant === 'JPEG';
                    for (const model of item.models) {
                        const m = model.toLowerCase();
                        if (!entry.models.includes(m)) {
                            entry.models.push(m);
                        }
                    }
                }
                // The paths the adapter can read first, then by how many models use them
                const paths = Object.values(byKey).sort(
                    (a, b) => Number(b.supported) - Number(a.supported) || b.models.length - a.models.length,
                );

                const byModel: Record<string, ModelItem> = {};
                for (const p of paths) {
                    for (const model of p.models) {
                        byModel[model] ||= { model, paths: [] };
                        byModel[model].paths.push(pathKey(p.protocol, p.path));
                    }
                }
                const models = Object.values(byModel).sort((a, b) => a.model.localeCompare(b.model));

                this.setState({ paths, models, loaded: true });
            })
            .catch(e => window.alert(`Cannot read config data for "${manufacturer}": ${e}`));
    }

    /** Take over protocol, path and default port of a known path */
    selectPath(item: PathItem, model?: string): void {
        this.setState(
            {
                urlPath: item.path,
                urlProtocol: item.protocol,
                port: item.port || (item.protocol === 'http://' ? '80' : '554'),
                model: model ?? this.state.model,
            },
            () => this.reportSettings(),
        );
    }

    reportSettings(): void {
        this.props.encrypt(this.state.password || '', password => {
            this.props.onChange({
                ip: this.state.ip,
                username: this.state.username,
                password,
                port: this.state.port,
                urlPath: this.state.urlPath,
                urlProtocol: this.state.urlProtocol,
                manufacturer: this.state.manufacturer,
                model: this.state.model || '',
                channel: this.state.channel || 0,
                width: this.state.width || 640,
                height: this.state.height || 480,
            });
        });
    }

    render(): React.JSX.Element {
        return (
            <div style={styles.page}>
                {this.state.manufacturer && !this.state.loaded ? <LinearProgress /> : null}
                {this.state.loaded ? this.renderModelSearch() : null}
                {this.state.loaded ? this.renderPathSelector() : null}
                {this.state.loaded ? this.renderConnectionFields() : null}
            </div>
        );
    }

    /** Optional: the model only narrows the list of paths and picks the most used one of them */
    renderModelSearch(): React.JSX.Element {
        const selected = this.state.models.find(m => m.model === this.state.model.toLowerCase()) || null;

        return (
            <Autocomplete
                autoHighlight
                value={selected}
                options={this.state.models}
                filterOptions={filterModels}
                fullWidth
                getOptionLabel={option => option.model}
                isOptionEqualToValue={(option, value) => option.model === value.model}
                onChange={(_event, value) => {
                    if (!value) {
                        this.setState({ model: '' }, () => this.reportSettings());
                        return;
                    }
                    const items = value.paths
                        .map(key => this.state.paths.find(p => pathKey(p.protocol, p.path) === key))
                        .filter(p => !!p);
                    const best = items.find(p => p.supported) || items[0];
                    if (best) {
                        this.selectPath(best, value.model);
                    }
                }}
                renderInput={params => (
                    <TextField
                        {...params}
                        variant="standard"
                        label={I18n.t('Search model (optional)')}
                        helperText={
                            selected && selected.paths.length > 1
                                ? I18n.t('This model knows %s paths, see the list below', selected.paths.length)
                                : ''
                        }
                    />
                )}
            />
        );
    }

    static getKindLabel(item: { protocol: string; supported: boolean }): string {
        if (item.protocol === 'rtsp://') {
            return I18n.t('RTSP stream');
        }
        return item.supported ? I18n.t('Snapshot (JPEG)') : I18n.t('HTTP stream (not supported)');
    }

    renderPathSelector(): React.JSX.Element {
        const model = this.state.models.find(m => m.model === this.state.model.toLowerCase());
        // With a model only its paths, otherwise all paths the adapter can read
        let options = model
            ? this.state.paths.filter(p => model.paths.includes(pathKey(p.protocol, p.path)))
            : this.state.paths.filter(p => p.supported);
        const current =
            this.state.paths.find(p => p.protocol === this.state.urlProtocol && p.path === this.state.urlPath) || null;
        if (current && !options.includes(current)) {
            options = [current, ...options];
        }

        return (
            <>
                <div style={styles.pathRow}>
                    <FormControl
                        variant="standard"
                        style={styles.protocol}
                    >
                        <InputLabel>{I18n.t('Protocol')}</InputLabel>
                        <Select
                            variant="standard"
                            value={this.state.urlProtocol || ''}
                            onChange={e => {
                                const urlProtocol = e.target.value;
                                // The port follows as long as it is only the default of the other protocol
                                let port = this.state.port;
                                if (urlProtocol === 'http://' && String(port) === '554') {
                                    port = '80';
                                } else if (urlProtocol === 'rtsp://' && String(port) === '80') {
                                    port = '554';
                                }
                                this.setState({ urlProtocol, port }, () => this.reportSettings());
                            }}
                        >
                            <MenuItem value="rtsp://">RTSP</MenuItem>
                            <MenuItem value="http://">HTTP</MenuItem>
                        </Select>
                    </FormControl>
                    <Autocomplete
                        freeSolo
                        autoHighlight
                        style={{ flex: 1 }}
                        options={options}
                        value={current || this.state.urlPath}
                        inputValue={this.state.urlPath}
                        // Show the whole list when opened on a chosen path, filter only while typing
                        filterOptions={(opts, state) =>
                            current && state.inputValue === current.path
                                ? opts
                                : opts.filter(o => o.path.toLowerCase().includes(state.inputValue.toLowerCase()))
                        }
                        getOptionLabel={option => (typeof option === 'string' ? option : option.path)}
                        isOptionEqualToValue={(option, value) =>
                            typeof value !== 'string' &&
                            option.protocol === value.protocol &&
                            option.path === value.path
                        }
                        onInputChange={(_event, urlPath, reason) => {
                            if (reason === 'input') {
                                // A path of its own: keep the protocol, RTSP if none was chosen yet
                                this.setState({ urlPath, urlProtocol: this.state.urlProtocol || 'rtsp://' }, () =>
                                    this.reportSettings(),
                                );
                            }
                        }}
                        onChange={(_event, value) => {
                            if (value && typeof value !== 'string') {
                                this.selectPath(value);
                            }
                        }}
                        renderOption={(props, option) => {
                            const { key, ...optionProps } = props;
                            return (
                                <Box
                                    component="li"
                                    key={pathKey(option.protocol, option.path)}
                                    {...optionProps}
                                    style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}
                                >
                                    <span style={styles.pathOption}>{option.path || '/'}</span>
                                    <span style={styles.pathInfo}>
                                        {Universal.getKindLabel(option)} · {I18n.t('%s models', option.models.length)}
                                    </span>
                                </Box>
                            );
                        }}
                        renderInput={params => (
                            <TextField
                                {...params}
                                variant="standard"
                                label={I18n.t('Stream / path')}
                                helperText={this.buildPreviewUrl() || I18n.t('path_list_hint')}
                            />
                        )}
                    />
                </div>
                {current && !current.supported ? (
                    <Alert
                        severity="warning"
                        // Without a width of its own the warning widens the column and pushes the test image away
                        style={{ marginBottom: 16, maxWidth: 500 }}
                    >
                        {I18n.t('unsupported_path_hint')}
                    </Alert>
                ) : null}
            </>
        );
    }

    /**
     * The URL the adapter will request, with the password masked. Built like in
     * src/cameras/UniversalCamera.ts, so the user sees the result before saving.
     */
    buildPreviewUrl(): string {
        if (!this.state.urlProtocol) {
            return '';
        }
        const path = this.state.urlPath.replace(
            /\[(CHANNEL|WIDTH|HEIGHT|AUTH|USERNAME|PASWORD|PASSWORD)]/g,
            (_placeholder: string, name: string): string => {
                switch (name) {
                    case 'CHANNEL':
                        return this.state.channel?.toString() || '0';
                    case 'WIDTH':
                        return this.state.width?.toString() || '640';
                    case 'HEIGHT':
                        return this.state.height?.toString() || '480';
                    case 'USERNAME':
                        return this.state.username || '';
                    default:
                        return '***';
                }
            },
        );
        const ip = this.state.ip || '<IP>';
        const port = parseInt(this.state.port as string, 10);
        if (this.state.urlProtocol === 'http://') {
            return `http://${ip}${!port || port === 80 ? '' : `:${port}`}${path}`;
        }
        const login = this.state.username ? `${encodeURIComponent(this.state.username)}:***@` : '';
        return `rtsp://${login}${ip}:${port || 554}${path.startsWith('/') ? path : `/${path}`}`;
    }

    renderConnectionFields(): React.JSX.Element {
        return (
            <>
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
                    label={I18n.t('Port')}
                    // The path only pre-fills this, a camera behind a port forwarding needs its own
                    value={this.state.port}
                    onChange={e => this.setState({ port: e.target.value }, () => this.reportSettings())}
                />
                <div>
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
                </div>
                <div>
                    {this.state.urlPath.includes('[CHANNEL]') ? (
                        <TextField
                            variant="standard"
                            style={styles.size}
                            label={I18n.t('Channel')}
                            value={this.state.channel}
                            onChange={e => this.setState({ channel: e.target.value }, () => this.reportSettings())}
                        />
                    ) : null}
                    {this.state.urlPath.includes('[WIDTH]') ? (
                        <TextField
                            variant="standard"
                            style={styles.size}
                            label={I18n.t('Width')}
                            value={this.state.width}
                            onChange={e => this.setState({ width: e.target.value }, () => this.reportSettings())}
                        />
                    ) : null}
                    {this.state.urlPath.includes('[HEIGHT]') ? (
                        <TextField
                            variant="standard"
                            style={styles.size}
                            label={I18n.t('Height')}
                            value={this.state.height}
                            onChange={e => this.setState({ height: e.target.value }, () => this.reportSettings())}
                        />
                    ) : null}
                </div>
            </>
        );
    }
}
