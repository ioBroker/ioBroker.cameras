'use strict';
const utils       = require('@iobroker/adapter-core');
const adapterName = require('./package.json').name.split('.').pop();
const http        = require('http');
const fs          = require('fs');

/**
 * The adapter instance
 * @type {ioBroker.Adapter}
 */
let adapter;

/**
 * Starts the adapter instance
 * @param {Partial<ioBroker.AdapterOptions>} [options]
 */
function startAdapter(options) {
    options = options || {};
    Object.assign(options, {name: adapterName});
    adapter = new utils.Adapter(options);

    adapter.getEncryptedConfig = adapter.getEncryptedConfig || getEncryptedConfig;

    try {
        adapter.tools = adapter.tools || require(utils.controllerDir + '/lib/tools');
    } catch (e) {
        adapter.tools = {decrypt};
    }

    adapter.on('ready', () => main(adapter));

    adapter.on('unload', cb => {
        adapter.__bforceInterval && clearInterval(adapter.__bforceInterval);
        adapter.__bforceInterval = null;
        try {
            if (adapter.__server) {
                adapter.__server.close(() => unloadCameras(adapter, cb));
            } else {
                unloadCameras(adapter, cb);
            }
        } catch (e) {
            unloadCameras(adapter, cb);
        }
    });

    return adapter;
}

function unloadCameras(adapter, cb) {
    const promises = [];
    adapter.config.cameras.forEach(item => {
        if (item && item.type && adapter.__CAM_TYPES[item.type] && adapter.__CAM_TYPES[item.type].unload) {
            try {
                adapter.__CAM_TYPES[item.type].unload(adapter, item);
            } catch (e) {
                adapter.log.error('Cannot unload "' + item.type + '": ' + e);
            }
        }
    });
    Promise.all(promises)
        .then(() => cb && cb());
}

function startWebServer(adapter) {
    adapter.__server = http.createServer((req, res) => {
        const clientIp = req.connection.remoteAddress;
        const now = Date.now();
        if (adapter.__bforce[clientIp] && now - adapter.__bforce[clientIp] < 5000)  {
            adapter.__bforce[clientIp] = now;
            res.statusCode = 429;
            res.write('Blocked for 5 seconds');
            return res.end();
        }

        const parts = req.url.split('?');
        const url = parts[0];
        const query = [];
        (parts[1] || '').split('&').forEach(p => {
            const pp = p.split('=');
            query[pp[0]] = decodeURIComponent(pp[1] || '');
        });

        if (query.key !== adapter.config.key) {
            adapter.__bforce[clientIp] = Date.now();
            res.statusCode = 401;
            res.write('Invalid key');
            return res.end();
        }

        if (clientIp !== '127.0.0.1' &&
            clientIp !== '::1/128' &&
            adapter.config.allowIPs !== true &&
            !adapter.config.allowIPs.includes(clientIp)) {
            res.statusCode = 401;
            res.write('Invalid key');
            res.end();
        }

        const cam = adapter.config.cameras.find(cam => cam.name === url);

        if (cam) {
            if (adapter.__CAM_TYPES[cam.type]) {
                adapter.log.debug('Request ' + JSON.stringify(cam));
                adapter.__CAM_TYPES[cam.type].process(adapter, cam, req, res)
                    .then(data => {
                        if (data && !data.done) {
                            res.setHeader('Content-type', data.contentType);
                            res.write(data.body || '');
                            res.end();
                        } else if (!data) {
                            res.statusCode = 500;
                            res.write('No answer');
                            res.end();
                        }
                    })
                    .catch(e => {
                        res.statusCode = 500;
                        res.write('Unknown error: ' + e);
                        res.end();
                    });
            } else {
                res.statusCode = 501;
                res.write('Unknown camera type: ' + cam.type);
                res.end();
            }
        } else {
            res.statusCode = 404;
            res.write('not found');
            res.end();
        }
    });
    adapter.__server.on('clientError', (err, socket) => {
        socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    });

    adapter.__server.listen({port: adapter.config.port || '127', host: adapter.config.bind}, () =>
        adapter.log.debug(`Server started on ${adapter.config.bind}:${adapter.config.port}`));
}

function main(adapter) {
    // read secret key
    adapter.getForeignObject('system.config', null, (err, data) => {
        // store system secret
        adapter.__systemSecret = data.native.secret;

        adapter.__CAM_TYPES = {};
        const promises = [];

        // init all required camera providers
        adapter.config.cameras.forEach(item => {
            if (item && item.type) {
                item.name = '/' + item.name;
                try {
                    adapter.__CAM_TYPES[item.type] = adapter.__CAM_TYPES[item.type] || require(__dirname + '/cameras/' + item.type);
                    promises.push(adapter.__CAM_TYPES[item.type].init(adapter, item));
                } catch (e) {
                    adapter.log.error('Cannot load "' + item.type + '": ' + e);
                }
            }
        });

        if (typeof adapter.config.allowIPs === 'string') {
            adapter.config.allowIPs = adapter.config.allowIPs.split(/,;/).map(i => i.trim()).filter(i => i);
            if (adapter.config.allowIPs.find(i => i === '*')) {
                adapter.config.allowIPs = true;
            }
        }

        adapter.__bforce = {};

        // garage collector
        adapter.__bforceInterval = setInterval(() => {
            const now = Date.now();
            Object.keys(adapter.__bforce).forEach(ip => {
                if (now - adapter.__bforce[ip] > 5000) {
                    delete adapter.__bforce[ip];
                }
            })
        }, 30000);

        Promise.all(promises)
            .then(() => startWebServer(adapter));
    });
}

// @ts-ignore parent is a valid property on module
if (module.parent) {
    // Export startAdapter in compact mode
    module.exports = startAdapter;
} else {
    // otherwise start the instance directly
    startAdapter();
}
