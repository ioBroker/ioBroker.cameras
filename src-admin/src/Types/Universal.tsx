import React from 'react';

import { TextField, Autocomplete, Box, LinearProgress } from '@mui/material';

import { I18n } from '@iobroker/gui-components';
import type { CameraConfigUniversal } from '../types';
import ConfigGeneric, { type ConfigProps } from './ConfigGeneric';

type UniversalConfigItem = {
    models: string[];
    variant: 'FFMPEG' | 'VLC' | 'MJPEG';
    protocol: 'rtsp://' | 'http://';
    path: string;
    /** Default port for this connection, 0 if the source did not provide one */
    port?: number;
};

type ManufacturerItem = {
    /** File name of the data file in ./data/, e.g. "hikvision" */
    id: string;
    /** Label shown in the dropdown, e.g. "Hikvision" */
    name: string;
};

type ModelItem = {
    model: string;
    urlPath: string;
    uniqueModel: boolean;
    urlProtocol: 'http://' | 'rtsp://' | '';
    port: number;
};

const styles: Record<string, any> = {
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
    urlPath: {
        marginTop: 16,
        marginBotton: `24px !important`,
        width: 408,
    },
};

export default class Universal extends ConfigGeneric<
    CameraConfigUniversal,
    {
        manufacturer: string;
        manufacturers: ManufacturerItem[];
        list: UniversalConfigItem[];
        icon: string;
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
            manufacturers: [],
            model: this.props.settings.model || '',
            list: [],
            channel: this.props.settings.channel || 0,
            models: [],
            icon: '',
        };
    }

    componentDidMount(): void {
        this.props.decrypt(this.state.password || '', password => this.setState({ password }));

        void fetch('./data/manufacturers.json')
            .then(response => response.json())
            .then((manufacturers: ManufacturerItem[]) => this.setState({ manufacturers }))
            .catch(e => window.alert(`Cannot read the list of manufacturers: ${e}`));

        if (this.state.manufacturer) {
            this.loadManufacturer(this.state.manufacturer);
        }
    }

    /** Read the model/URL table and the logo of one manufacturer */
    loadManufacturer(manufacturer: string): void {
        void fetch(`./data/${manufacturer}.json`)
            .then(response => response.json())
            .then((list: UniversalConfigItem[]): void => {
                const models: ModelItem[] = [
                    {
                        model: '',
                        urlPath: '',
                        uniqueModel: true,
                        urlProtocol: '',
                        port: 0,
                    },
                ];
                for (const item of list) {
                    item.models.forEach(model => {
                        const m = model.toLowerCase();
                        const sameName = models.find(it => it.model.toLowerCase() === m);
                        if (sameName) {
                            sameName.uniqueModel = false;
                        }
                        if (!models.find(it => it.model === m && it.urlPath === item.path)) {
                            models.push({
                                model: model.toLowerCase(),
                                urlPath: item.path,
                                uniqueModel: !sameName,
                                urlProtocol: item.protocol,
                                port: item.port || 0,
                            });
                        }
                    });
                }
                models.sort((a, b) => {
                    if (a.model === b.model) {
                        return a.urlPath.localeCompare(b.urlPath);
                    }
                    return a.model.localeCompare(b.model);
                });

                this.setState({ list, models });
            })
            .catch(e => window.alert(`Cannot read config data for "${manufacturer}": ${e}`));

        // Find icon svg, png or jpg. fetch() also resolves on 404, so the status must be checked
        const findIcon = async (): Promise<string> => {
            for (const extension of ['svg', 'png', 'jpg']) {
                const url = `./data/${manufacturer}.${extension}`;
                try {
                    const response = await fetch(url);
                    if (response.ok) {
                        return url;
                    }
                } catch {
                    // try the next extension
                }
            }
            return '';
        };

        void findIcon().then(icon => this.setState({ icon }));
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
            });
        });
    }

    render(): React.JSX.Element {
        if (!this.state.manufacturers.length) {
            return <LinearProgress />;
        }

        const selectedManufacturer =
            this.state.manufacturers.find(it => it.id === this.state.manufacturer) || null;

        return (
            <div style={styles.page}>
                {this.state.icon ? (
                    <img
                        src={this.state.icon}
                        alt="logo"
                        style={{ height: 32, width: 'auto' }}
                    />
                ) : null}
                <Autocomplete
                    autoHighlight
                    value={selectedManufacturer}
                    options={this.state.manufacturers}
                    fullWidth
                    getOptionLabel={option => option.name}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderOption={(props, option) => {
                        const { key, ...optionProps } = props;
                        return (
                            <Box
                                component="li"
                                key={option.id}
                                {...optionProps}
                                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                            >
                                <img
                                    src={`./data/${option.id}.svg`}
                                    alt=""
                                    style={{ width: 24, height: 24, flexShrink: 0 }}
                                    // A manufacturer may ship a .png/.jpg instead - do not show a broken image
                                    onError={e => ((e.target as HTMLImageElement).style.visibility = 'hidden')}
                                />
                                <span>{option.name}</span>
                            </Box>
                        );
                    }}
                    onChange={(_event, newValue) =>
                        this.setState(
                            {
                                manufacturer: newValue?.id || '',
                                // The models of the previous manufacturer are meaningless now
                                model: '',
                                urlPath: '',
                                urlProtocol: '',
                                list: [],
                                models: [],
                                icon: '',
                            },
                            () => {
                                if (newValue) {
                                    this.loadManufacturer(newValue.id);
                                }
                                this.reportSettings();
                            },
                        )
                    }
                    renderInput={params => (
                        <TextField
                            {...params}
                            variant="standard"
                            label={I18n.t('Manufacturer')}
                        />
                    )}
                />
                {this.state.manufacturer && !this.state.models.length ? <LinearProgress /> : null}
                {this.state.models.length ? this.renderModelSelector() : null}
                {this.state.models.length ? this.renderConnectionFields() : null}
            </div>
        );
    }

    renderModelSelector(): React.JSX.Element {
        const selectedModel =
            this.state.models.find(it => it.model === this.state.model && it.urlPath === this.state.urlPath) ||
            this.state.models[0];

        return (
            <>
                <Autocomplete
                    autoHighlight
                    value={selectedModel}
                    options={this.state.models}
                    fullWidth
                    loading={this.state.models.length === 0}
                    getOptionLabel={option => option.model}
                    renderOption={(props, option) => {
                        const { key, ...optionProps } = props;
                        return (
                            <Box
                                component="li"
                                key={option.model + option.urlPath}
                                {...optionProps}
                                style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}
                            >
                                <span style={{ whiteSpace: 'nowrap' }}>{option.model}</span>
                                {!option.uniqueModel ? (
                                    <span
                                        style={{
                                            opacity: 0.7,
                                            whiteSpace: 'nowrap',
                                            textOverflow: 'ellipsis',
                                            fontSize: 'smaller',
                                        }}
                                    >{` [${option.urlPath}]`}</span>
                                ) : null}
                            </Box>
                        );
                    }}
                    onChange={(_event, newValue) =>
                        this.setState(
                            {
                                model: newValue?.model || '',
                                urlPath: newValue?.urlPath || '',
                                urlProtocol: newValue?.urlProtocol || '',
                                // Take the default port of the model, otherwise the protocol default
                                port:
                                    newValue?.port ||
                                    (newValue?.urlProtocol === 'http://' ? '80' : '554'),
                            },
                            () => this.reportSettings(),
                        )
                    }
                    renderInput={params => (
                        <TextField
                            {...params}
                            variant="standard"
                            label={I18n.t('Camera model')}
                            helperText={selectedModel.urlPath}
                        />
                    )}
                />
            </>
        );
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
                {this.state.urlPath.includes('[CHANNEL]') ? (
                    <TextField
                        variant="standard"
                        style={styles.ip}
                        label={I18n.t('Channel')}
                        value={this.state.channel}
                        onChange={e => this.setState({ channel: e.target.value }, () => this.reportSettings())}
                    />
                ) : null}
            </>
        );
    }
}
