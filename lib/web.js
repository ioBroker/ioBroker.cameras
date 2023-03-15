/* jshint -W097 */
/* jshint strict: false */
/* jslint node: true */
/* jshint -W061 */
'use strict';
const http = require('http');

function getUrl(path, query, port) {
    return new Promise((resolve, reject) => {
        const queryStr = Object.keys(query).map(attr => `${attr}=${encodeURIComponent(query[attr])}`).join('&');

        http.get(`http://127.0.0.1:${port}/${path}${queryStr ? `?${queryStr}` : ''}`, res => {
            const {statusCode} = res;
            const contentType = res.headers['content-type'] || res.headers['Content-type'];

            if (statusCode !== 200) {
                // Consume response data to free up memory
                res.resume();
                return reject(`Request Failed. Status Code: ${statusCode}`);
            }

            const data = [];
            res.on('data', chunk => data.push(chunk));
            res.on('end', () => resolve({body: Buffer.concat(data), contentType}));
            res.on('error', e => reject(e.message));
        })
            .on('error', e => reject(e.message || e));
    });
}

/**
 * Proxy class
 *
 * Read files from localhost server
 *
 * @class
 * @param {object} server http or https node.js object
 * @param {object} webSettings settings of the web server, like <pre><code>{secure: settings.secure, port: settings.port}</code></pre>
 * @param {object} adapter web adapter object
 * @param {object} instanceSettings instance object with common and native
 * @param {object} app express application
 * @return {object} object instance
 */
class ProxyCameras {
    constructor(server, webSettings, adapter, instanceSettings, app) {
        this.app       = app;
        this.config    = instanceSettings ? instanceSettings.native : {};
        this.namespace = instanceSettings ? instanceSettings._id.substring('system.adapter.'.length) : 'cameras';

        this.config.route = this.config.route || `${this.namespace}/`;
        this.config.port = parseInt(this.config.port, 10) || 80;

        // remove leading slash
        if (this.config.route[0] === '/') {
            this.config.route = this.config.route.substr(1);
        }

        this.adapter = adapter;
        this.config.cameras.forEach(cam => this.oneCamera(cam));
    }

    oneCamera(rule) {
        this.adapter.log.info(`Install extension on /${this.config.route}${rule.name}`);

        this.app.use(`/${this.config.route}${rule.name}`, (req, res) => {
            const parts = req.url.split('?');
            const query = {};
            (parts[1] || '').split('&').forEach(p => {
                if (p && p.includes('=')) {
                    const pp = p.split('=');
                    query[pp[0]] = decodeURIComponent(pp[1] || '');
                }
            });

            query.key = this.config.key;
            getUrl(rule.name, query, this.config.port)
                .then(file => {
                    res.setHeader('Content-type', file.contentType);
                    res.status(200).send(file.body || '');
                })
                .catch(error =>
                    res.status(500).send(typeof error !== 'string' ? JSON.stringify(error) : error));
        });
    }
}

module.exports = ProxyCameras;
