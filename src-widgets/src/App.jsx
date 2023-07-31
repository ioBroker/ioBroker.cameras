import React from 'react';
import { withStyles } from '@mui/styles';

import WidgetDemoApp from '@iobroker/vis-2-widgets-react-dev/widgetDemoApp';
import { I18n } from '@iobroker/adapter-react-v5';

import { Checkbox } from '@mui/material';
import translations from './translations';
import RtspCamera from './RtspCamera';

const styles = theme => ({
    app: {
        backgroundColor: theme?.palette?.background.default,
        color: theme?.palette?.text.primary,
        height: '100%',
        width: '100%',
        overflow: 'auto',
        display: 'flex',
    },
});

class App extends WidgetDemoApp {
    constructor(props) {
        super(props);

        this.state.disabled = JSON.parse(window.localStorage.getItem('disabled')) || {};

        // init translations
        I18n.extendTranslations(translations);

        this.socket.registerConnectionHandler(this.onConnectionChanged);
    }

    onConnectionChanged = isConnected => {
        if (isConnected) {
            this.socket.getSystemConfig()
                .then(systemConfig => this.setState({ systemConfig }));
        }
    };

    renderWidget() {
        const widgets = {
            camera: <RtspCamera
                key="Camera"
                context={{
                    socket: this.socket,
                    systemConfig: this.state.systemConfig,
                }}
                style={{
                    width: 400,
                    height: 180,
                }}
                data={{
                    name: 'Camera',
                    camera: 'cam2',
                }}
                adapterName="cameras"
                instance={0}
            />,
        };

        return <div className={this.props.classes.app}>
            <div>
                {Object.keys(widgets).map(key => <div key={key} style={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox
                        checked={!this.state.disabled[key]}
                        onChange={e => {
                            const disabled = JSON.parse(JSON.stringify(this.state.disabled));
                            disabled[key] = !e.target.checked;
                            window.localStorage.setItem('disabled', JSON.stringify(disabled));
                            this.setState({ disabled });
                        }}
                    />
                    {key}
                </div>)}
            </div>
            {Object.keys(widgets).map(key => (this.state.disabled[key] ? null : widgets[key]))}
        </div>;
    }
}

export default withStyles(styles)(App);
