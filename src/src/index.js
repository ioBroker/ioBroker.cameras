import React from 'react';
import ReactDOM from 'react-dom';
import { version } from '../package.json';
import { MuiThemeProvider } from '@material-ui/core/styles';
import * as serviceWorker from './serviceWorker';

import '@iobroker/adapter-react/index.css';
import theme from '@iobroker/adapter-react/Theme';
import Utils from '@iobroker/adapter-react/Components/Utils';
import App from './App';

window.adapterName = 'cameras';

console.log('iobroker.' + window.adapterName + '@' + version);
let themeName = Utils.getThemeName();

function build() {
    return ReactDOM.render(<MuiThemeProvider theme={theme(themeName)}>
        <App onThemeChange={_themeName => {
            themeName = _themeName;
            build();
        }} />
    </MuiThemeProvider>, document.getElementById('root'));
}

build();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
