import React, { type JSX } from 'react';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';

import { AppBar, Tabs, Tab, type Theme } from '@mui/material';

import {
    Loader,
    I18n,
    GenericApp,
    type GenericAppState,
    type GenericAppProps,
    type GenericAppSettings,
} from '@iobroker/adapter-react-v5';

import TabOptions from './Tabs/Options';
import TabCameras from './Tabs/Cameras';

import langEn from './i18n/en.json';
import langDe from './i18n/de.json';
import langRu from './i18n/ru.json';
import langPt from './i18n/pt.json';
import langNl from './i18n/nl.json';
import langFr from './i18n/fr.json';
import langIt from './i18n/it.json';
import langEs from './i18n/es.json';
import langPl from './i18n/pl.json';
import langUk from './i18n/uk.json';
import langZhCn from './i18n/zh-cn.json';
import type { CamerasInstanceNative } from '@/types';

function inIframe(): boolean {
    try {
        return window.self !== window.top;
    } catch {
        return true;
    }
}

const styles = {
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
    selected: (theme: Theme) => ({
        color: theme.palette.mode === 'dark' ? undefined : '#FFF !important',
    }),
    indicator: (theme: Theme) => ({
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.secondary.main : '#FFF',
    }),
};

interface AppState extends GenericAppState {
    alive: boolean;
    isIFrame: boolean;
}

class App extends GenericApp<GenericAppProps, AppState> {
    private subscribed: string = '';
    private readonly isIFrame: boolean = inIframe();

    constructor(props: GenericAppProps) {
        const extendedProps: GenericAppSettings = {};
        extendedProps.adapterName = 'cameras';
        extendedProps.doNotLoadAllObjects = true;
        extendedProps.translations = {
            en: langEn,
            de: langDe,
            ru: langRu,
            pt: langPt,
            nl: langNl,
            fr: langFr,
            it: langIt,
            es: langEs,
            pl: langPl,
            uk: langUk,
            'zh-cn': langZhCn,
        };

        if (window.location.port === '3000') {
            // extendedProps.socket = {
            //      protocol: 'http:',
            //      host: '192.168.178.45',
            //      port: 8081,
            // };
        }

        super(props, extendedProps);
    }

    onAliveChanged = (id: string, state: ioBroker.State | null | undefined): void => {
        if (id && this.state.alive !== !!state?.val) {
            this.setState({ alive: !!state?.val });
        }
    };

    componentWillUnmount(): void {
        this.subscribed && this.socket.unsubscribeState(this.subscribed, this.onAliveChanged);
        super.componentWillUnmount();
    }

    // called when connected with admin and loaded instance object
    onConnectionReady(): void {
        void this.socket.getState(`${this.instanceId}.alive`).then(state => {
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
            return this.socket.subscribeState(this.subscribed, this.onAliveChanged);
        });
    }

    render(): JSX.Element {
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
                                value={this.state.selectedTab}
                                onChange={(_e, selectedTab: string): void => this.setState({ selectedTab })}
                                sx={{ '& .MuiTabs-indicator': styles.indicator }}
                            >
                                <Tab
                                    value="options"
                                    sx={{ '&.Mui-selected': styles.selected }}
                                    label={I18n.t('Options')}
                                    data-name="options"
                                />
                                <Tab
                                    value="cameras"
                                    sx={{ '&.Mui-selected': styles.selected }}
                                    label={I18n.t('Cameras')}
                                    data-name="cameras"
                                />
                            </Tabs>
                        </AppBar>

                        <div style={this.isIFrame ? styles.tabContentIFrame : styles.tabContent}>
                            {(this.state.selectedTab === 'options' || !this.state.selectedTab) && (
                                <TabOptions
                                    themeType={this.state.themeType}
                                    common={this.common}
                                    socket={this.socket}
                                    native={this.state.native as CamerasInstanceNative}
                                    onError={text => this.setState({ errorText: text })}
                                    onLoad={native => this.onLoadConfig(native)}
                                    instance={this.instance}
                                    theme={this.state.theme}
                                    getIpAddresses={() =>
                                        this.common?.host
                                            ? this.socket.getIpAddresses(this.common.host)
                                            : Promise.resolve([])
                                    }
                                    getExtendableInstances={() => this.getExtendableInstances()}
                                    adapterName={this.adapterName}
                                    onChange={(attr, value, cb) => this.updateNativeValue(attr, value, cb)}
                                    instanceAlive={this.state.alive}
                                />
                            )}
                            {this.state.selectedTab === 'cameras' && (
                                <TabCameras
                                    key="cameras"
                                    theme={this.state.theme}
                                    socket={this.socket}
                                    themeType={this.state.themeType}
                                    adapterName={this.adapterName}
                                    instance={this.instance}
                                    encrypt={(textToEncrypt: string, cb: (encryptedText: string) => void): void =>
                                        cb(this.encrypt(textToEncrypt))
                                    }
                                    decrypt={(textToDecrypt: string, cb: (decryptedText: string) => void): void =>
                                        cb(this.decrypt(textToDecrypt))
                                    }
                                    instanceAlive={this.state.alive}
                                    native={this.state.native as CamerasInstanceNative}
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
