import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import GenericApp from '@iobroker/adapter-react/GenericApp';
import Loader from '@iobroker/adapter-react/Components/Loader'

import I18n from '@iobroker/adapter-react/i18n';
import TabOptions from './Tabs/Options';
import TabCameras from './Tabs/Cameras';

const styles = theme => ({
    root: {},
    tabContent: {
        padding: 10,
        height: 'calc(100% - 64px - 48px - 20px)',
        overflow: 'auto'
    },
    tabContentIFrame: {
        padding: 10,
        height: 'calc(100% - 64px - 48px - 20px - 38px)',
        overflow: 'auto'
    }
});

class App extends GenericApp {
    constructor(props) {
        const extendedProps = {};
        extendedProps.encryptedFields = ['password'];
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
            'zh-cn': require('./i18n/zh-cn'),
        };

        super(props, extendedProps);
    }

    // called when connected with admin and loaded instance object
    onConnectionReady() {
        // generate random key
        if (!this.state.native.key) {
            setTimeout(() => this.updateNativeValue('key', (Math.round(Math.random() * 100000000000) / 100000).toFixed(6)));
        }
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
            return (<Loader theme={this.state.themeType}/>);
        }

        return (
            <div className="App">
                <AppBar position="static">
                    <Tabs value={this.getSelectedTab()} onChange={(e, index) => this.selectTab(e.target.parentNode.dataset.name, index)}>
                        <Tab selected={this.state.selectedTab === 'options'} label={I18n.t('Options')} data-name="options" />
                        <Tab selected={this.state.selectedTab === 'cameras'} label={I18n.t('Cameras')} data-name="cameras" />
                    </Tabs>
                </AppBar>

                <div className={this.isIFrame ? this.props.classes.tabContentIFrame : this.props.classes.tabContent}>
                    {(this.state.selectedTab === 'options' || !this.state.selectedTab) && (<TabOptions
                        key="options"
                        common={this.common}
                        socket={this.socket}
                        native={this.state.native}
                        onError={text => this.setState({errorText: text})}
                        onLoad={native => this.onLoadConfig(native)}
                        instance={this.instance}
                        getIpAddresses={() => this.getIpAddresses()}
                        onConfigError={configError => this.setConfigurationError(configError)}
                        adapterName={this.adapterName}
                        onChange={(attr, value, cb) => this.updateNativeValue(attr, value, cb)}
                    />)}
                    {this.state.selectedTab === 'cameras' && (<TabCameras
                        key="cameras"
                        native={this.state.native}
                        onChange={(attr, value, cb) => this.updateNativeValue(attr, value, cb)}
                    />)}
                </div>
                {this.renderError()}
                {this.renderSaveCloseButtons()}
            </div>
        );
    }
}

export default withStyles(styles)(App);
