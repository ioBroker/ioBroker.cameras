/**
 * Copyright 2018-2025 bluefox <dogafox@gmail.com>
 *
 * MIT License
 *
 **/
'use strict';

const fs = require('node:fs');
const adapterName = require('./package.json').name.replace('iobroker.', '');
const buildHelper = require('@iobroker/vis-2-widgets-react-dev/buildHelper');
const { deleteFoldersRecursive, buildReact, npmInstall, copyFiles, patchHtmlFile } = require('@iobroker/build-tools');
const { copyFileSync } = require('node:fs');

async function copyAllFiles() {
    deleteFoldersRecursive(`${__dirname}/admin`);
    copyFiles(['src-admin/build/**/*', '!src-admin/build/index.html', 'admin-config/*'], 'admin/');

    await patchHtmlFile(`${__dirname}/src-admin/build/index.html`);
    copyFileSync(`${__dirname}/src-admin/build/index.html`, `${__dirname}/admin/index_m.html`);
}

function clean() {
    deleteFoldersRecursive(`${__dirname}/admin`);
    deleteFoldersRecursive(`${__dirname}/src-admin/build`);
}

function widgetsClean() {
    deleteFoldersRecursive(`${__dirname}/src-widgets/build`);
    deleteFoldersRecursive(`${__dirname}/widgets`);
}

async function widgetsCopyAllFiles() {
    copyFiles([`${__dirname}/src-widgets/build/*.js`], `widgets/${adapterName}`);
    copyFiles([`${__dirname}/src-widgets/build/img/*`], `widgets/${adapterName}/img`);
    copyFiles([`${__dirname}/src-widgets/build/*.map`], `widgets/${adapterName}`);

    const ignore = buildHelper.ignoreFiles(`${__dirname}/src-widgets/`);
    const copy = buildHelper.copyFiles(`${__dirname}/src-widgets/`);

    copyFiles([
        `${__dirname}/src-widgets/build/static/**/*`,
        ...ignore,
    ], `widgets/${adapterName}/static`);

    copyFiles(copy, `widgets/${adapterName}/static/js`);
    copyFiles([`${__dirname}/src-widgets/src/i18n/*.json`], `widgets/${adapterName}/i18n`);

    await new Promise(resolve =>
        setTimeout(() => {
            if (
                fs.existsSync(`widgets/${adapterName}/static/media`) &&
                !fs.readdirSync(`widgets/${adapterName}/static/media`).length
            ) {
                fs.rmdirSync(`widgets/${adapterName}/static/media`);
            }
            resolve(null);
        }, 500),
    );
}

if (process.argv.includes('--0-clean')) {
    clean();
} else if (process.argv.includes('--1-npm')) {
    if (!fs.existsSync(`${__dirname}/src-admin/node_modules`)) {
        npmInstall('src-admin').catch(e => {
            console.error(`Cannot run npm: ${e}`);
            process.exit(2);
        });
    }
} else if (process.argv.includes('--2-build')) {
    buildReact('src-admin', { rootDir: 'src-admin', tsc: true, vite: true }).catch(e => {
        console.error(`Cannot build: ${e}`);
        process.exit(2);
    });
} else if (process.argv.includes('--3-copy')) {
    copyAllFiles().catch(e => {
        console.error(`Cannot copy: ${e}`);
        process.exit(2);
    });
} else if (process.argv.includes('--build-admin')) {
    clean();
    npmInstall('src-admin')
        .then(() => buildReact('src-admin', { rootDir: 'src-admin', tsc: true, vite: true }))
        .then(() => copyAllFiles());
} else if (process.argv.includes('--widget-0-clean')) {
    widgetsClean();
} else if (process.argv.includes('--widget-1-npm')) {
    if (!fs.existsSync(`${__dirname}/src-widgets/node_modules`)) {
        npmInstall('src-widgets').catch(e => {
            console.error(`Cannot run npm: ${e}`);
            process.exit(2);
        });
    }
} else if (process.argv.includes('--widget-2-build')) {
    buildReact(`${__dirname}/src-widgets`, { rootDir: `${__dirname}/src-widgets`, craco: true }).catch(e => {
        console.error(`Cannot build: ${e}`);
        process.exit(2);
    });
} else if (process.argv.includes('--widget-3-copy')) {
    widgetsCopyAllFiles().catch(e => {
        console.error(`Cannot copy: ${e}`);
        process.exit(2);
    });
} else if (process.argv.includes('--widget-build')) {
    widgetsClean();
    npmInstall('src-widgets')
        .then(() => buildReact(`${__dirname}/src-widgets`, { rootDir: `${__dirname}/src-widgets`, craco: true }))
        .then(() => widgetsCopyAllFiles())
        .catch(e => {
            console.error(`Cannot build: ${e}`);
            process.exit(2);
        });
} else {
    clean();
    npmInstall('src-admin')
        .then(() => buildReact('src-admin', { rootDir: 'src-admin', tsc: true, vite: true }))
        .then(() => copyAllFiles())
        .then(() => widgetsClean())
        .then(() => npmInstall('src-widgets'))
        .then(() => buildReact(`${__dirname}/src-widgets`, { rootDir: `${__dirname}/src-widgets`, craco: true }))
        .then(() => widgetsCopyAllFiles())
        .catch(e => {
            console.error(`Cannot build: ${e}`);
            process.exit(2);
        });
}
