import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { StylesProvider, createGenerateClassName } from '@mui/styles';
import pack from '../package.json';
import * as serviceWorker from './serviceWorker';

import '@iobroker/adapter-react-v5/index.css';
import theme from '@iobroker/adapter-react-v5/Theme';
import Utils from '@iobroker/adapter-react-v5/Components/Utils';
import App from './App';

window.adapterName = 'cameras';

console.log(`iobroker.${window.adapterName}@${pack.version}`);
let themeName = Utils.getThemeName();

const generateClassName = createGenerateClassName({
    productionPrefix: 'iob',
});

function build() {
    const container = document.getElementById('root');
    const root = createRoot(container);
    return root.render(<StylesProvider generateClassName={generateClassName}>
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme(themeName)}>
                <App onThemeChange={_themeName => {
                    themeName = _themeName;
                    build();
                }} />
            </ThemeProvider>
        </StyledEngineProvider>
    </StylesProvider>);
}

build();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
