import React from 'react';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';

import {
    AppBar,
    Tabs,
    Tab,
} from '@mui/material';

import { Loader, I18n, GenericApp } from '@iobroker/adapter-react-v5';

import TabOptions from './Tabs/Options';
import TabCameras from './Tabs/Cameras';

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
    selected: theme => ({
        color: theme.palette.mode === 'dark' ? undefined : '#FFF !important',
    }),
    indicator: theme => ({
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.secondary.main : '#FFF',
    }),
};

class App extends GenericApp {
    constructor(props) {
        const extendedProps = {};
        extendedProps.adapterName = 'cameras';
        extendedProps.doNotLoadAllObjects = true;
        extendedProps.translations = {
            'en': require('./i18n/en'),
            'de': require('./i18n/de'),
            'ru': require('./i18n/ru'),
            'pt': require('./i18n/pt'),
            'nl': require('./i18n/nl'),
            'fr': require('./i18n/fr'),
            'it': require('./i18n/it'),
            'es': require('./i18n/es'),
            'pl': require('./i18n/pl'),
            'uk': require('./i18n/uk'),
            'zh-cn': require('./i18n/zh-cn'),
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

    onAliveChanged = (id, state) => {
        if (id && this.state.alive !== (!!state?.val)) {
            this.setState({ alive: !!state?.val });
        }
    }

    componentWillUnmount() {
        this.subscribed && this.socket.unsubscribeState(this.subscribed, this.onAliveChanged);
        super.componentWillUnmount();
    }

    // called when connected with admin and loaded instance object
    onConnectionReady() {
        this.socket.getState(`${this.instanceId}.alive`)
            .then(state => {
                if (this.state.alive !== (!!state?.val)) {
                    this.setState({ alive: !!state?.val });
                }

                // generate random key
                if (!this.state.native.key) {
                    setTimeout(() => this.updateNativeValue('key', (Math.round(Math.random() * 100000000000) / 100000).toFixed(6)));
                }
                this.subscribed = `${this.instanceId}.alive`;
                this.socket.subscribeState(this.subscribed, this.onAliveChanged);
            });
    }

    getSelectedTab() {
        const tab = this.state.selectedTab;

        if (!tab || tab === 'options') {
            return 0;
        } else
        if (tab === 'cameras') {
            return 1;
        }
    }

    render() {
        if (!this.state.loaded) {
            return <StyledEngineProvider injectFirst>
                <ThemeProvider theme={this.state.theme}>
                    <Loader themeType={this.state.themeType} />
                </ThemeProvider>
            </StyledEngineProvider>
        }

        return <StyledEngineProvider injectFirst>
            <ThemeProvider theme={this.state.theme}>
                <div className="App" style={{ background: this.state.themeType === 'dark' ? 'black' : 'white' }}>
                    <AppBar position="static">
                        <Tabs
                            value={this.getSelectedTab()}
                            onChange={(e, index) => this.selectTab(e.target.dataset.name, index)}
                            sx={{ '& .MuiTabs-indicator': styles.indicator }}
                        >
                            <Tab
                                sx={{ '&.Mui-selected': styles.selected }}
                                selected={this.state.selectedTab === 'options'}
                                label={I18n.t('Options')}
                                data-name="options"
                            />
                            <Tab
                                sx={{ '&.Mui-selected': styles.selected }}
                                selected={this.state.selectedTab === 'cameras'}
                                label={I18n.t('Cameras')}
                                data-name="cameras"
                            />
                        </Tabs>
                    </AppBar>

                    <div style={this.isIFrame ? styles.tabContentIFrame : styles.tabContent}>
                        {(this.state.selectedTab === 'options' || !this.state.selectedTab) && <TabOptions
                            key="options"
                            common={this.common}
                            socket={this.socket}
                            native={this.state.native}
                            encrypt={(value, cb) => cb(this.encrypt(value))}
                            decrypt={(value, cb) => cb(this.decrypt(value))}
                            onError={text => this.setState({ errorText: text })}
                            onLoad={native => this.onLoadConfig(native)}
                            instance={this.instance}
                            theme={this.state.theme}
                            getIpAddresses={() => this.socket.getIpAddresses(this.common.host)}
                            getExtendableInstances={() => this.getExtendableInstances()}
                            onConfigError={configError => this.setConfigurationError(configError)}
                            adapterName={this.adapterName}
                            onChange={(attr, value, cb) => this.updateNativeValue(attr, value, cb)}
                            instanceAlive={this.state.alive}
                        />}
                        {this.state.selectedTab === 'cameras' && <TabCameras
                            key="cameras"
                            theme={this.state.theme}
                            socket={this.socket}
                            themeType={this.state.themeType}
                            adapterName={ this.adapterName }
                            instance={this.instance}
                            encrypt={(value, cb) => cb(this.encrypt(value))}
                            decrypt={(value, cb) => cb(this.decrypt(value))}
                            instanceAlive={this.state.alive}
                            native={this.state.native}
                            onChange={(attr, value, cb) => this.updateNativeValue(attr, value, cb)}
                        />}
                    </div>
                    {this.renderError()}
                    {this.renderSaveCloseButtons()}
                </div>
            </ThemeProvider>
        </StyledEngineProvider>
    }
}

export default App;
