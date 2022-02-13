'use strict';
const utils       = require('@iobroker/adapter-core');
const adapterName = require('./package.json').name.split('.').pop();
const http        = require('http');
const sharp       = require('sharp');

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
    Object.assign(options, {name: adapterName, subscribable: true});
    adapter = new utils.Adapter(options);

    adapter.on('message', msg => processMessage(adapter, msg));
    adapter.on('ready', () => main(adapter));

    adapter.on('subscribesChange', subscriptions => {
        // Go through subscribes
        console.log('Subscribe on ' + JSON.stringify(subscriptions));
    });

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

function testCamera(adapter, item, cb) {
    if (item && item.type) {
        const url = '/' + item.name + '_test';
        try {
            adapter.__CAM_TYPES[item.type] = adapter.__CAM_TYPES[item.type] || require('./cameras/' + item.type);
        } catch (e) {
            adapter.log.error(`Cannot load "${item.type}": ${e}`);
            return cb({error: `Cannot load "${item.type}"`});
        }
        const req = { url };
        let body;
        let status;
        let contentType;
        const res = {
            status: _status => status = _status,
            send: _body => body = _body,
            setHeader: (name, value) => {
                if ((name || '').toLowerCase() === 'content-type') {
                    contentType = value;
                }
            }
        };

        adapter.__CAM_TYPES[item.type].init(adapter, item)
            .then(() => {
                try {
                    return adapter.__CAM_TYPES[item.type].process(adapter, item, req, res);
                } catch (e) {
                    console.log('Cannot get image: ' + e);
                    cb && cb({error: 'Cannot get image: ' + e});
                    cb = null;
                    return null;
                }
            })
            .then(result => {
                // result = {body, contentType: status.headers['Content-type'] || status.headers['content-type']}
                if (result && cb) {
                    if (result.done) {
                        if (status >= 200 && status < 400) {
                            result = {body: `data:${contentType};base64,${body.toString('base64')}`, contentType};
                        } else {
                            return cb && cb(result);
                        }
                    }
                    if (result.body) {
                        return resizeImage(result, 300)
                            .then(data => cb && cb({body: `data:${data.contentType};base64,${data.body.toString('base64')}`, contentType}));
                    } else {
                        result.error = result.error || 'No answer';
                        return cb && cb(result);
                    }
                } else if (cb) {
                    return cb && cb({error: 'No answer'});
                }
            })
            .catch(e => {
                adapter.log.warn('Cannot get image: ' + (e && e.toString()));
                cb && cb({error: e && e.toString()});
            })
            .then(() => adapter.__CAM_TYPES[item.type].unload(adapter, item));
    } else {
        cb && cb({error: 'Unknown type or invalid parameters'});
    }
}

function getCameraImage(cam, width, height, angle) {
    if (adapter.__CAM_TYPES[cam.type]) {
        adapter.log.debug('Request ' + JSON.stringify(cam));

        return adapter.__CAM_TYPES[cam.type].process(adapter, cam)
            .then(data => {
                if (data) {
                    let imageData;
                    return resizeImage(data, width || cam.width, height || cam.height)
                        .then(data => rotateImage(data, angle || cam.angle))
                        .then(_imageData => {
                            imageData = _imageData;
                            if (adapter.setForeignBinaryStateAsync) {
                                return adapter.setForeignBinaryStateAsync(`${adapter.namespace}.cameras.${cam.name}`, Buffer.from(_imageData.body));
                            } else {
                                return adapter.setBinaryStateAsync(`${adapter.namespace}.cameras.${cam.name}`, Buffer.from(_imageData.body));
                            }
                        })
                        .then(() => imageData.body);
                } else if (!data) {
                    adapter.log.error('No data from camera ' + cam.name);
                }
            })
            .catch(e => adapter.log.error(`Cannot get camera image of ${cam.name}: ${e}`));
    } else {
        return Promise.reject('Unsupported camera type');
    }
}

function processMessage(adapter, obj) {
    if (!obj || !obj.command) {
        return;
    }

    switch (obj.command) {
        case 'test': {
            testCamera(adapter, obj.message, result =>
                obj.callback && adapter.sendTo(obj.from, obj.command, result, obj.callback));
            break;
        }

        case 'image': {
            const cam = adapter.config.cameras.find(cam => cam.name === obj.message.name);
            if (cam && obj.callback) {
                getCameraImage(cam, obj.message.width, obj.message.height, obj.message.angle)
                    .then(data =>
                        adapter.sendTo(obj.from, obj.command, { data: Buffer.from(data).toString('base64'), contentType: 'image/jpeg' }, obj.callback))
                    .catch(e => adapter.sendTo(obj.from, obj.command, { error: e }, obj.callback));
            } else {
                obj.callback && adapter.sendTo(obj.from, obj.command, { error: 'Name not found' }, obj.callback);
            }
            break;
        }

        case 'list': {
            obj.callback && adapter.sendTo(obj.from, obj.command, {
                list: adapter.config.cameras.map(cam =>
                    ({name: cam.name, desc: cam.desc, id: adapter.namespace + '.cameras.' + cam.name}))}, obj.callback);

            break;
        }
    }
}

function unloadCameras(adapter, cb) {
    const promises = [];
    adapter.config.cameras.forEach(item => {
        if (item && item.type && adapter.__CAM_TYPES[item.type] && adapter.__CAM_TYPES[item.type].unload) {
            try {
                adapter.__CAM_TYPES[item.type].unload(adapter, item);
            } catch (e) {
                adapter.log.error(`Cannot unload "${item.type}": ${e}`);
            }
        }
    });
    Promise.all(promises)
        .then(() => cb && cb());
}

function resizeImage(data, width, height) {
    if (!width && !height)  {
        return sharp(data.body)
            .jpeg()
            .toBuffer()
            .then(body =>({body, contentType: 'image/jpeg'}));
    }  else {
        return sharp(data.body)
            .resize(width || null, height || null)
            .jpeg()
            .toBuffer()
            .then(body => ({body, contentType: 'image/jpeg'}));
    }
}

function rotateImage(data, angle) {
    if (!angle)  {
        return sharp(data.body)
            .jpeg()
            .toBuffer()
            .then(body =>({body, contentType: 'image/jpeg'}));
    }  else {
        return sharp(data.body)
            .rotate(angle)
            .jpeg()
            .toBuffer()
            .then(body => ({body, contentType: 'image/jpeg'}));
    }
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
        const query = {};
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

        const cam = adapter.config.cameras.find(cam => cam.path === url);

        if (cam) {
            if (adapter.__CAM_TYPES[cam.type]) {
                adapter.log.debug('Request ' + JSON.stringify(cam));
                adapter.__CAM_TYPES[cam.type].process(adapter, cam, req, res)
                    .then(data => {
                        if (data && !data.done) {
                            resizeImage(data, parseInt(query.w, 10), parseInt(query.h, 10))
                                .then(data => rotateImage(data, parseInt(query.angle, 10)))
                                .then(data => {
                                    res.setHeader('Content-type', data.contentType);
                                    res.write(data.body || '');
                                    res.end();
                                });
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

function processTasks(tasks, cb) {
    if (!tasks || !tasks.length) {
        cb && cb();
    } else {
        const task = tasks.shift();
        if (task.name === 'delete') {
            adapter.delForeignObject(task.id, () =>
                setImmediate(processTasks, tasks, cb));
        } else if (task.name === 'set') {
            adapter.setForeignObject(task.obj._id, task.obj, () =>
                setImmediate(processTasks, tasks, cb));
        }
    }
}

function syncConfig() {
    return new Promise(resolve =>
        adapter.getStatesOf('', 'cameras', (err, states) => {
            const tasks = [];

            states.forEach(obj => {
                const name = obj._id.split('.').pop();
                if (!adapter.config.cameras.find(item => item.name === name)) {
                    // state does not exists anymore
                    tasks.push({name: 'delete', id: obj._id});
                }
            });
            adapter.config.cameras.forEach(item => {
                const obj = states.find(obj => obj._id.split('.').pop() === item.name);
                if (!obj) {
                    tasks.push({name: 'set', obj: {
                        _id: adapter.namespace + '.cameras.' + item.name,
                        common: {
                            name: item.desc || item.name,
                            type: 'file',
                            role: 'camera'
                        },
                        binary: true,
                        type: 'state',
                        native: {
                            url: `/${adapter.namespace}/${item.name}`
                        }
                    }});
                } else if (obj && obj.common.name !== (item.desc || item.name)) {
                    obj.common.name = item.desc || item.name;
                    tasks.push({name: 'set', obj});
                }
            });

            processTasks(tasks, () => resolve());
        }));
}

function fillStates() {
    // write all states with actual images one time at start
    return new Promise(resolve => {
        const promises = adapter.config.cameras.map(cam =>
            getCameraImage(cam)
                .catch(e => adapter.log.error('Cannot get image: ' + e)));

        Promise.all(promises)
            .then(() => resolve());
    });
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
                item.path = '/' + item.name;
                try {
                    adapter.__CAM_TYPES[item.type] = adapter.__CAM_TYPES[item.type] || require(__dirname + '/cameras/' + item.type);
                    promises.push(adapter.__CAM_TYPES[item.type].init(adapter, item).catch(e => adapter.log.error(`Cannot init camera ${item.name}: ${e && e.toString()}`)));
                } catch (e) {
                    adapter.log.error(`Cannot load "${item.type}": ${e}`);
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
            });
        }, 30000);

        Promise.all(promises)
            .then(() => syncConfig())
            .then(() => fillStates())
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
