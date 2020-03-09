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

    adapter.on('ready', () => {
        // automatic migration of token
        if (!adapter.supportsFeature || !adapter.supportsFeature('ADAPTER_AUTO_DECRYPT')) {
            adapter.getEncryptedConfig('enc_key')
                .then(value => {
                    adapter.config.enc_key = value;
                    main(adapter);
                });
        } else {
            main(adapter);
        }
    });

    adapter.on('unload', cb => {
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

function getEncryptedConfig(attribute, callback) {
    if (adapter.config.hasOwnProperty(attribute)) {
        if (typeof callback !== 'function') {
            return new Promise((resolve, reject) => {
                getEncryptedConfig(attribute, (err, encrypted) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(encrypted);
                    }
                });
            });
        } else {
            adapter.getForeignObject('system.config', null, (err, data) => {
                let systemSecret;
                if (data && data.native) {
                    systemSecret = data.native.secret;
                }
                callback(null, adapter.tools.decrypt(systemSecret, adapter.config[attribute]));
            });
        }
    } else {
        if (typeof callback === 'function') {
            callback('Attribute not found');
        } else {
            return Promise.reject('Attribute not found');
        }
    }
}

/**
 * Decrypt the password/value with given key
 * @param {string} key - Secret key
 * @param {string} value - value to decript
 * @returns {string}
 */
function decrypt(key, value) {
    let result = '';
    for(let i = 0; i < value.length; i++) {
        result += String.fromCharCode(key[i % key.length].charCodeAt(0) ^ value.charCodeAt(i));
    }
    return result;
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
        const url = req.url.split('?')[0];

        const cam = adapter.config.cameras.find(cam => cam.name === url);

        if (cam) {
            if (adapter.__CAM_TYPES[cam.type]) {
                adapter.__CAM_TYPES[cam.type].process(adapter, cam, req, res)
                    .then(data => {
                        if (data && !data.done) {
                            res.setHeader('Content-type', data.contentType);
                            res.status(200).send(data.body || '');
                        } else if (!data) {
                            res.status(500).send('No answer');
                        }
                    })
                    .catch(e => res.status(500).send('Unknown error: ' + e));
            } else {
                res.status(501).send('Unknown camera type: ' + cam.type);
            }
        } else {
            res.status(404).send('not found');
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