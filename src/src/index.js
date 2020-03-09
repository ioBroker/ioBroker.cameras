import React from 'react';
import ReactDOM from 'react-dom';
import { MuiThemeProvider} from '@material-ui/core/styles';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import createTheme from '@iobroker/adapter-react/createTheme';

let theme = 'light';

function printPrompt() {
    const prompt = `
██╗ ██████╗ ██████╗ ██████╗  ██████╗ ██╗  ██╗███████╗██████╗ 
██║██╔═══██╗██╔══██╗██╔══██╗██╔═══██╗██║ ██╔╝██╔════╝██╔══██╗
██║██║   ██║██████╔╝██████╔╝██║   ██║█████╔╝ █████╗  ██████╔╝
██║██║   ██║██╔══██╗██╔══██╗██║   ██║██╔═██╗ ██╔══╝  ██╔══██╗
██║╚██████╔╝██████╔╝██║  ██║╚██████╔╝██║  ██╗███████╗██║  ██║
╚═╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
`;
    console.log(prompt);
    console.log('Nice to see you here! :) Join our dev community here https://github.com/ioBroker/ioBroker or here https://github.com/iobroker-community-adapters');
    console.log('Help us to create open source project with reactJS!');
    console.log('See you :)');
}

function build() {
    printPrompt();
    return ReactDOM.render(<MuiThemeProvider theme={createTheme(theme)}>
        <App onThemeChange={_theme => {
            theme = _theme;
            build();
        }}/>
    </MuiThemeProvider>, document.getElementById('root'));
}


build();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
