/**
 * Copyright 2018-2024 bluefox <dogafox@gmail.com>
 *
 * MIT License
 *
 **/
'use strict';

const fs= require('node:fs');
const adapterName = require('./package.json').name.replace('iobroker.', '');
const { deleteFoldersRecursive, npmInstall, buildReact, copyFiles, collectFiles, patchHtmlFile } = require('@iobroker/build-tools');

function clean() {
    deleteFoldersRecursive(`${__dirname}/admin`);
    deleteFoldersRecursive(`${__dirname}/src/build`);
}
function copyAllFiles() {
    deleteFoldersRecursive(`${__dirname}/admin`);
    copyFiles([
        'src/build/**/*',
        '!src/build/index.html',
        '!src/build/static/js/main.*.chunk.js',
        '!src/build/i18n/**/*',
        '!src/build/i18n',
        'admin-config/*'
    ],'admin/');

    let index = fs.readFileSync(`${__dirname}/src/build/index.html`).toString('utf8');
    index = index.replaceAll('href="/', 'href="');
    index = index.replaceAll('src="/', 'src="');
    index = index.replace('<script type="text/javascript" src="./vendor/socket.io.js"></script>', '<script type="text/javascript" src="./../../socket.io/socket.io.js"></script>');
    fs.writeFileSync(`${__dirname}/admin/index_m.html`, index);

    const files = collectFiles('src/build/static/js/main.*.chunk.js');
    for (const file of files) {
        let data = fs.readFileSync(file.base + file.name).toString('utf8');
        data = data.replaceAll('s.p+"static/media/copy-content', '"./static/media/copy-content');
        fs.writeFileSync(`${__dirname}/admin/static/js/${file.name}`, data);
    }
}
function cleanWidgets() {
    deleteFoldersRecursive(`${__dirname}/src-widgets/build`);
    deleteFoldersRecursive(`${__dirname}/widgets`);
}

function copyAllFilesWidgets() {
    copyFiles(`src-widgets/build/*.js`, `widgets/${adapterName}`);
    copyFiles(`src-widgets/build/*.map`, `widgets/${adapterName}`);

    copyFiles(`src-widgets/build/img/*`, `widgets/${adapterName}/img`);
    copyFiles([
        `src-widgets/build/static/js/*`,
        `!src-widgets/build/static/js/node_modules*.*`,
        `!src-widgets/build/static/js/vendors-node_modules*.*`,
        `!src-widgets/build/static/js/main*.*`,
        `!src-widgets/build/static/js/src_bootstrap*.*`,
    ], `widgets/${adapterName}/static/js`);
    copyFiles(`src-widgets/src/i18n/*.json`, `widgets/${adapterName}/i18n`);
}

if (process.argv.includes('--0-clean')) {
    clean();
} else if (process.argv.includes('--1-npm')) {
    if (!fs.existsSync(`${__dirname}/src/node_modules`)) {
        npmInstall(`${__dirname.replace(/\\/g, '/')}/src/`)
            .catch(e => console.error(e));
    }
} else if (process.argv.includes('--2-build')) {
    buildReact(`${__dirname}/src/`, { rootDir: __dirname })
        .catch(e => console.error(e));
} else if (process.argv.includes('--3-copy')) {
    copyAllFiles();
} else if (process.argv.includes('--4-patch')) {
    patchHtmlFile(`${__dirname}/admin/index_m.html`)
        .catch(e => console.error(e));
} else if (process.argv.includes('--build-gui')) {
    clean();
    let npmPromise = null;
    if (!fs.existsSync(`${__dirname}/src/node_modules`)) {
        npmPromise = npmInstall(`${__dirname.replace(/\\/g, '/')}/src/`)
            .catch(e => console.error(e));
    } else {
        npmPromise = Promise.resolve();
    }
    npmPromise
        .then(() => buildReact(`${__dirname}/src/`, { rootDir: __dirname }))
        .then(() => copyAllFiles())
        .then(() => patchHtmlFile(`${__dirname}/admin/index_m.html`))
        .catch(e => console.error(e));
} else if (process.argv.includes('--widgets-0-clean')) {
    cleanWidgets();
} else if (process.argv.includes('--widgets-1-npm')) {
    npmInstall(`${__dirname.replace(/\\/g, '/')}/src-widgets/`)
        .catch(e => console.error(e));
} else if (process.argv.includes('--widgets-2-build')) {
    buildReact(`${__dirname}/src-widgets/`, { rootDir: __dirname, craco: true })
        .catch(e => console.error(e));
} else if (process.argv.includes('--widgets-3-copy')) {
    copyAllFilesWidgets();
} else if (process.argv.includes('--widgets-build')) {
    cleanWidgets();
    npmInstall(`${__dirname.replace(/\\/g, '/')}/src-widgets/`)
        .then(() => buildReact(`${__dirname}/src-widgets/`, { rootDir: __dirname, craco: true }))
        .then(() => copyAllFilesWidgets())
        .catch(e => console.error(e));
} else {
    clean();
    let npmPromise = null;
    if (!fs.existsSync(`${__dirname}/src/node_modules`)) {
        npmPromise = npmInstall(`${__dirname.replace(/\\/g, '/')}/src/`)
            .catch(e => console.error(e));
    } else {
        npmPromise = Promise.resolve();
    }
    npmPromise
        .then(() => buildReact(`${__dirname}/src/`, { rootDir: __dirname }))
        .then(() => copyAllFiles())
        .then(() => patchHtmlFile(`${__dirname}/admin/index_m.html`))
        .then(() => cleanWidgets())
        .then(() => npmInstall(`${__dirname.replace(/\\/g, '/')}/src-widgets/`))
        .then(() => buildReact(`${__dirname}/src-widgets/`, { rootDir: __dirname, craco: true }))
        .then(() => copyAllFilesWidgets())
        .catch(e => console.error(e));
}
