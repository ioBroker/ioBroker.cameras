import React from 'react';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';

import { AppBar, Tabs, Tab } from '@mui/material';

import { Loader, I18n, GenericApp, type IobTheme, type GenericAppState } from '@iobroker/adapter-react-v5';

import TabOptions from './Tabs/Options';
import TabCameras from './Tabs/Cameras';

import enLang from './i18n/en.json';
import deLang from './i18n/de.json';
import ruLang from './i18n/ru.json';
import ptLang from './i18n/pt.json';
import nlLang from './i18n/nl.json';
import frLang from './i18n/fr.json';
import itLang from './i18n/it.json';
import esLang from './i18n/es.json';
import plLang from './i18n/pl.json';
import ukLang from './i18n/uk.json';
import zhCnLang from './i18n/zh-cn.json';
import type { GenericAppProps, GenericAppSettings } from '@iobroker/adapter-react-v5/build/types';
import type { CamerasAdapterConfig } from './types';

const styles: Record<string, any> = {
    tabContent: {
        padding: 10,
        height: 'calc(100% - 64px - 48px - 20px)',
        overflow: 'auto',
    },
    tabContentIFrame: {
        padding: 10,
        height: 'calc(100% - 64px - 48px - 20px - 38px)',
        overflow: 'auto',
    },
    selected: (theme: IobTheme): React.CSSProperties => ({
        color: theme.palette.mode === 'dark' ? undefined : '#FFF !important',
    }),
    indicator: (theme: IobTheme): React.CSSProperties => ({
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.secondary.main : '#FFF',
    }),
};

interface AppState extends GenericAppState {
    alive: boolean;
    tab: string;
}

function isIFrame(): boolean {
    try {
        return window.self !== window.top;
    } catch {
        return true;
    }
}

class App extends GenericApp<GenericAppProps, AppState> {
    private subscribed: string | null = null;

    private isIFrame = isIFrame();

    constructor(props: GenericAppProps) {
        const extendedProps: GenericAppSettings = {};
        extendedProps.adapterName = 'cameras';
        extendedProps.doNotLoadAllObjects = true;
        extendedProps.translations = {
            en: enLang,
            de: deLang,
            ru: ruLang,
            pt: ptLang,
            nl: nlLang,
            fr: frLang,
            it: itLang,
            es: esLang,
            pl: plLang,
            uk: ukLang,
            'zh-cn': zhCnLang,
        };

        if (window.location.port === '3000') {
            // extendedProps.socket = {
            //      protocol: 'http:',
            //      host: '192.168.178.45',
            //      port: 8081,
            // };
        }

        super(props, extendedProps);

        Object.assign(this.state, {
            tab: window.localStorage.getItem(`${this.adapterName || 'adapter'}-tab`) || 'options',
        });
    }

    onAliveChanged = (id: string, state: ioBroker.State | null | undefined): void => {
        if (id && this.state.alive !== !!state?.val) {
            this.setState({ alive: !!state?.val });
        }
    };

    componentWillUnmount(): void {
        if (this.subscribed) {
            this.socket.unsubscribeState(this.subscribed, this.onAliveChanged);
        }
        super.componentWillUnmount();
    }

    // called when connected with admin and loaded instance object
    async onConnectionReady(): Promise<void> {
        const state: ioBroker.State | null | undefined = await this.socket.getState(`${this.instanceId}.alive`);
        if (this.state.alive !== !!state?.val) {
            this.setState({ alive: !!state?.val });
        }

        // generate random key
        if (!this.state.native.key) {
            setTimeout(() =>
                this.updateNativeValue('key', (Math.round(Math.random() * 100000000000) / 100000).toFixed(6)),
            );
        }
        this.subscribed = `${this.instanceId}.alive`;
        this.socket.subscribeState(this.subscribed, this.onAliveChanged).catch(e => this.showError(e));
    }

    render(): React.JSX.Element {
        if (!this.state.loaded) {
            return (
                <StyledEngineProvider injectFirst>
                    <ThemeProvider theme={this.state.theme}>
                        <Loader themeType={this.state.themeType} />
                    </ThemeProvider>
                </StyledEngineProvider>
            );
        }

        return (
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={this.state.theme}>
                    <div
                        className="App"
                        style={{ background: this.state.themeType === 'dark' ? 'black' : 'white' }}
                    >
                        <AppBar position="static">
                            <Tabs
                                value={this.state.tab || 'options'}
                                onChange={(_e, tab: string) => {
                                    this.setState({ tab });
                                    window.localStorage.setItem(`${this.adapterName || 'adapter'}-tab`, tab);
                                }}
                                sx={{ '& .MuiTabs-indicator': styles.indicator }}
                            >
                                <Tab
                                    sx={{ '&.Mui-selected': styles.selected }}
                                    label={I18n.t('Options')}
                                    value="options"
                                />
                                <Tab
                                    sx={{ '&.Mui-selected': styles.selected }}
                                    label={I18n.t('Cameras')}
                                    value="cameras"
                                />
                            </Tabs>
                        </AppBar>

                        <div style={this.isIFrame ? styles.tabContentIFrame : styles.tabContent}>
                            {(this.state.tab === 'options' || !this.state.tab) && (
                                <TabOptions
                                    key="options"
                                    common={this.common!}
                                    socket={this.socket}
                                    native={this.state.native as CamerasAdapterConfig}
                                    onError={text => this.setState({ errorText: text })}
                                    onLoad={native => this.onLoadConfig(native)}
                                    instance={this.instance}
                                    theme={this.state.theme}
                                    getIpAddresses={() => this.socket.getIpAddresses(this.common!.host)}
                                    getExtendableInstances={() => this.getExtendableInstances()}
                                    onConfigError={configError => this.setConfigurationError(configError)}
                                    adapterName={this.adapterName}
                                    onChange={(attr: string, value: any, cb?: () => void): void =>
                                        this.updateNativeValue(attr, value, cb)
                                    }
                                    instanceAlive={this.state.alive}
                                />
                            )}
                            {this.state.tab === 'cameras' && (
                                <TabCameras
                                    key="cameras"
                                    theme={this.state.theme}
                                    socket={this.socket}
                                    themeType={this.state.themeType}
                                    adapterName={this.adapterName}
                                    instance={this.instance}
                                    encrypt={(value, cb) => cb(this.encrypt(value))}
                                    decrypt={(value, cb) => cb(this.decrypt(value))}
                                    instanceAlive={this.state.alive}
                                    native={this.state.native as CamerasAdapterConfig}
                                    onChange={(attr, value, cb) => this.updateNativeValue(attr, value, cb)}
                                />
                            )}
                        </div>
                        {this.renderError()}
                        {this.renderSaveCloseButtons()}
                    </div>
                </ThemeProvider>
            </StyledEngineProvider>
        );
    }
}

export default App;
