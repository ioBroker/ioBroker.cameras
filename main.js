'use strict';
const utils       = require('@iobroker/adapter-core');
const adapterName = require('./package.json').name.split('.').pop();
const http        = require('http');
const rtsp        = require('./cameras/rtsp');
const fs          = require('fs');
const path        = require('path');
const moment      = require('moment');
const decompress = require('decompress');

let sharp;
try {
    sharp = require('sharp');
} catch (e) {
    console.error(`Cannot load sharp: ${e}`);
}

/**
 * The adapter instance
 * @type {ioBroker.Adapter}
 */
let adapter;

let lang = 'en';

/**
 * Starts the adapter instance
 * @param {Partial<ioBroker.AdapterOptions>} [options]
 */
function startAdapter(options) {
    options = options || {};
    Object.assign(options, {
        name: adapterName,
        subscribable: true,
        uiClientSubscribe: data => {
            const { clientId, message } = data;
            return onClientSubscribe(clientId, message);
        },
        uiClientUnsubscribe: data => {
            const { clientId, message, reason } = data;
            if (reason === 'client') {
                adapter.log.debug(`GUI Client "${clientId} disconnected`);
            } else {
                adapter.log.debug(`Client "${clientId}: ${reason}`);
            }
            onClientUnsubscribe(clientId, message);
        }
    });
    adapter = new utils.Adapter(options);

    adapter.on('message', msg => processMessage(adapter, msg));
    adapter.on('ready', () => main(adapter));

    adapter.on('subscribesChange', subscriptions => {
        // Go through all subscribes
        console.log(`Subscribe on ${JSON.stringify(subscriptions)}`);
    });

    adapter.on('stateChange', async (id, state) => {
        if (state && !state.ack && id.endsWith('.running') && id.startsWith(adapter.namespace)) {
            id = id.split('.');
            const camera = id[id.length - 2];
            if (state.val) {
                try {
                    await startRtspStreaming(camera, null, true);
                } catch (e) {
                    adapter.log.error(`Cannot start camera ${camera}: ${e}`);
                }
            } else {
                adapter.log.debug(`Stop camera ${camera}`);
                rtsp.stopWebStreaming(adapter, camera);
            }
        }
    });

    moment.locale('de');

    adapter.on('unload', cb => {
        rtsp.stopAllStreams(adapter);
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

async function testCamera(adapter, item) {
    if (item && item.type) {
        let result = null;
        // load camera module
        try {
            adapter.__CAM_TYPES[item.type] = adapter.__CAM_TYPES[item.type] || require(`./cameras/${item.type}`);
        } catch (e) {
            adapter.log.error(`Cannot load "${item.type}": ${e}`);
            throw new Error(`Cannot load "${item.type}"`);
        }

        // init camera
        await adapter.__CAM_TYPES[item.type].init(adapter, item);
        // get image
        let data = await adapter.__CAM_TYPES[item.type].process(adapter, item);
        if (data && data.body) {
            data = await resizeImage(data, item.width, item.height);
            data = await rotateImage(data, item.angle);
            data = await addTextToImage(data, item.addTime ? adapter.config.dateFormat || 'LTS' : null, item.title);
            result = { body: `data:${data.contentType};base64,${data.body.toString('base64')}`, contentType: data.contentType };
        } else {
            throw new Error(`No answer${data && data.error ? `: ${data.error}` : ''}`);
        }

        // unload camera
        await adapter.__CAM_TYPES[item.type].unload(adapter, item);
        return result;
    } else {
        throw new Error('Unknown type or invalid parameters');
    }
}

async function getCameraImage(cam) {
    if (adapter.__CAM_TYPES[cam.type]) {
        adapter.log.debug(`Request ${cam.type} ${cam.ip || cam.url || cam.oid || ''} ${cam.name}`);

        const params = {
            w: parseInt(cam.width, 10) || 0,
            h: parseInt(cam.height, 10) || 0,
            angle: parseInt(cam.angle, 10) || 0,
        };

        if (!cam.noCache && cam.cache && cam.cacheTime > Date.now() && JSON.stringify(cam.cacheParams) === JSON.stringify(params)) {
            adapter.log.debug(`Take from cache ${cam.name} ${cam.type} ${cam.ip || cam.url}`);
            return cam.cache.body;
        }

        let data = await adapter.__CAM_TYPES[cam.type].process(adapter, cam);
        if (data) {
            data = await resizeImage(data, cam.width, cam.height);
            data = await rotateImage(data, cam.angle);
            data = await addTextToImage(data, cam.addTime ? adapter.config.dateFormat || 'LTS' : null, cam.title);

            if (cam.cacheTimeout) {
                cam.cache = data;
                cam.cacheParams = params;
                cam.cacheTime = Date.now() + cam.cacheTimeout;
            }

            await adapter.writeFileAsync(adapter.namespace, `/${cam.name}.jpg`, Buffer.from(data.body));
            return data.body;
        } else {
            return Promise.reject('No data from camera');
        }
    } else {
        return Promise.reject('Unsupported camera type');
    }
}

async function startRtspStreaming(camera, options, fromState) {
    const cameraObject = adapter.config.cameras.find(c => c.name === camera);
    if (cameraObject &&
        adapter.__CAM_TYPES[cameraObject.type] &&
        adapter.__CAM_TYPES[cameraObject.type].getRtspURL
    ) {
        const url = adapter.__CAM_TYPES[cameraObject.type].getRtspURL(adapter, cameraObject);
        options = options || {};
        options.url = url;
        await rtsp.webStreaming(adapter, camera, options, fromState);
    } else {
        // the camera does not support RTSP streaming
        adapter.log.warn(`Camera "${camera}" does not support RTSP streaming`);
        throw new Error('Camera doesn\'t support RTSP streaming');
    }
}

async function onClientSubscribe(clientId, obj) {
    adapter.log.debug(`Subscribe from ${clientId}: ${JSON.stringify(obj.message)}`);
    if (!adapter._streamSubscribes) {
        return { error: `Adapter is still initializing` };
    }
    if (obj.message.type && obj.message.type.startsWith('startCamera/')) {
        const camera = obj.message.type.substring('startCamera/'.length);
        // start camera with obj.message.data
        if (!adapter._streamSubscribes.find(s => s.camera === camera)) {
            adapter.log.debug(`Start camera "${camera}"`);
        }

        try {
            await startRtspStreaming(camera, obj.message.data);
        } catch (e) {
            adapter.log.error(`Cannot start camera on subscribe "${camera}": ${e}`);
            return { error: `Cannot start camera on subscribe "${camera}": ${e}` };
        }

        // inform GUI that camera is started
        const sub = adapter._streamSubscribes.find(s => s.clientId === clientId && s.camera === camera);
        if (!sub) {
            adapter._streamSubscribes.push({ clientId, camera, ts: Date.now() });
        } else {
            sub.ts = Date.now();
        }

        return { accepted: true, heartbeat: 60000 };
    }
}

function onClientUnsubscribe(clientId, obj) {
    adapter.log.debug(`Unsubscribe from ${clientId}: ${JSON.stringify(obj && obj.message)}`);
    if (!adapter._streamSubscribes) {
        return;
    }
    if (!obj || !obj.message || !obj.message.type) {
        return;
    }

    if (!Array.isArray(obj.message.type)) {
        obj.message.type = [obj.message.type];
    }
    obj.message.type.forEach(type => {
        if (type && type.startsWith('startCamera/')) {
            const camera = type.substring('startCamera/'.length);
            let deleted;
            do {
                deleted = false;
                const pos = adapter._streamSubscribes.findIndex(s => s.clientId === clientId);
                if (pos !== -1) {
                    deleted = true;
                    adapter._streamSubscribes.splice(pos, 1);
                    // check if anyone else subscribed on this camera
                    if (!adapter._streamSubscribes.find(s => s.camera === camera || Date.now() - s.ts > 60000)) {
                        // stop camera
                        adapter.log.debug(`Stop camera "${camera}"`);
                        rtsp.stopWebStreaming(adapter, camera);
                    }
                }
            } while (deleted);
        }
    });
}

async function processMessage(adapter, obj) {
    if (!obj || !obj.command) {
        return;
    }

    switch (obj.command) {
        case 'test': {
            try {
                const data = await testCamera(adapter, obj.message);
                obj.callback && adapter.sendTo(obj.from, obj.command, data, obj.callback);
            } catch (e) {
                obj.callback && adapter.sendTo(obj.from, obj.command, { error: e.toString() }, obj.callback);
            }
            break;
        }

        case 'image': {
            if (obj.message) {
                let cam = adapter.config.cameras.find(cam => cam.name === obj.message.name);
                if (cam && obj.callback) {
                    cam = Object.assign(JSON.parse(JSON.stringify(cam), obj.message));

                    try {
                        const data = await getCameraImage(cam);
                        adapter.sendTo(obj.from, obj.command, { data: Buffer.from(data).toString('base64'), contentType: 'image/jpeg' }, obj.callback);
                    } catch (e) {
                        adapter.sendTo(obj.from, obj.command, { error: e }, obj.callback);
                    }
                } else {
                    obj.callback && adapter.sendTo(obj.from, obj.command, { error: 'Name not found' }, obj.callback);
                }
            } else {
                obj.callback && adapter.sendTo(obj.from, obj.command, { error: 'Invalid request' }, obj.callback);
            }
            break;
        }

        case 'list': {
            obj.callback && adapter.sendTo(obj.from, obj.command, {
                list: adapter.config.cameras.map(cam =>
                    ({name: cam.name, desc: cam.desc, id: `${adapter.namespace}.cameras.${cam.name}`}))}, obj.callback);

            break;
        }

        case 'ffmpeg': {
            if (obj.callback && obj.message) {
                rtsp.executeFFmpeg('-version', obj.message.path)
                    .then(data => {
                        if (data) {
                            const result = data.split('\n')[0];
                            const version = result.match(/version\s+([-\w.]+)/i);
                            if (version) {
                                adapter.sendTo(obj.from, obj.command, {version: version[1]}, obj.callback);
                            } else {
                                adapter.sendTo(obj.from, obj.command, {version: result}, obj.callback);
                            }
                        } else {
                            adapter.sendTo(obj.from, obj.command, {error: 'No answer'}, obj.callback);
                        }
                    })
                    .catch(error => adapter.sendTo(obj.from, obj.command, {error}, obj.callback));
            }
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
    if (!sharp) {
        adapter.log.warn('Module sharp is not installed. Please install it to resize images');
        return Promise.resolve(({body: data.body, contentType: 'image/jpeg'}));
    }
    if (!width && !height)  {
        return sharp(data.body)
            .jpeg()
            .toBuffer()
            .then(body => ({ body, contentType: 'image/jpeg' }));
    }  else {
        return sharp(data.body)
            .resize(width || null, height || null)
            .jpeg()
            .toBuffer()
            .then(body => ({ body, contentType: 'image/jpeg' }));
    }
}

function rotateImage(data, angle) {
    if (!angle)  {
        return sharp(data.body)
            .jpeg()
            .toBuffer()
            .then(body =>({ body, contentType: 'image/jpeg' }));
    }  else {
        return sharp(data.body)
            .rotate(angle)
            .jpeg()
            .toBuffer()
            .then(body => ({ body, contentType: 'image/jpeg' }));
    }
}

async function addTextToImage(data, dateFormat, title) {
    if (!dateFormat && !title) {
        return data;
    } else {
        const date = dateFormat ? moment().locale(lang).format(dateFormat) : '';

        if (!data.metadata) {
            data.metadata = await sharp(data.body).metadata();
        }

        const layers = [];

        if (title) {
            layers.push({
                input: {
                    text: {
                        text: title,
                        dpi: data.metadata.height * 0.2,
                    },
                },
                top: Math.round(data.metadata.height * 0.95),
                left: Math.round(data.metadata.width * 0.01),
                blend: 'add',
            });
        }

        if (date) {
            layers.push({
                input: {
                    text: {
                        text: date,
                        dpi: data.metadata.height * 0.2,
                    },
                },
                top: Math.round(data.metadata.height * 0.02),
                left: Math.round(data.metadata.width * 0.01),
                blend: 'add',
            });
        }

        return sharp(data.body)
            .composite(layers)
            .jpeg()
            .toBuffer()
            .then(body => ({ body, contentType: 'image/jpeg' }));
    }
}

function startWebServer(adapter) {
    adapter.log.debug(`Starting web server on http://${adapter.config.bind}:${adapter.config.port}/`);
    adapter.__server = http.createServer(async (req, res) => {
        const clientIp = req.socket.remoteAddress;
        if (!clientIp) {
            res.statusCode = 401;
            res.write('Invalid key');
            res.end();
            adapter.log.debug(`Invalid key from unknown IP`);
            return;
        }
        const parts = (req.url || '').split('?');
        const url = parts[0];
        const query = {};
        (parts[1] || '').split('&').forEach(p => {
            const pp = p.split('=');
            query[pp[0]] = decodeURIComponent(pp[1] || '');
        });

        const now = Date.now();
        if (adapter.__bforce[clientIp] && now - adapter.__bforce[clientIp] < 5000 && query.key !== adapter.config.key)  {
            adapter.__bforce[clientIp] = now;
            res.statusCode = 429;
            res.write('Blocked for 5 seconds');
            res.end();
            return;
        }

        if (query.key !== adapter.config.key) {
            adapter.__bforce[clientIp] = Date.now();
            res.statusCode = 401;
            res.write('Invalid key');
            res.end();
            adapter.log.debug(`Invalid key from ${clientIp}. Expected ${adapter.config.key}`);
            return;
        }

        if (clientIp !== '127.0.0.1' &&
            clientIp !== '::1/128' &&
            adapter.config.allowIPs !== true &&
            !adapter.config.allowIPs.includes(clientIp)
        ) {
            res.statusCode = 401;
            res.write('Invalid key');
            res.end();
            adapter.log.debug(`Invalid key from ${clientIp}. Expected ${adapter.config.key}`);
            return;
        }

        const cam = adapter.config.cameras.find(cam => cam.path === url);

        const ignoreCache = query.noCache === 'true' || query.noCache === true || query.noCache === 1 || query.noCache === '1';

        if (cam) {
            if (adapter.__CAM_TYPES[cam.type]) {
                let data;
                try {
                    const params = {
                        w: parseInt(query.w, 10) || 0,
                        h: parseInt(query.h, 10) || 0,
                        angle: parseInt(query.angle, 10) || 0,
                    };
                    if (!ignoreCache && cam.cache && cam.cacheTime > Date.now() && JSON.stringify(cam.cacheParams) === JSON.stringify(params)) {
                        adapter.log.debug(`Take from cache ${cam.name} ${cam.type} ${cam.ip || cam.url}`);
                        data = cam.cache;
                    } else {
                        adapter.log.debug(`Request ${cam.name} ${cam.type} ${cam.ip || cam.url}`);
                        data = await adapter.__CAM_TYPES[cam.type].process(adapter, cam);
                        data = await resizeImage(data, params.w, params.h);
                        data = await rotateImage(data, params.angle);
                        data = await addTextToImage(data, cam.addTime ? adapter.config.dateFormat || 'LTS' : null, cam.title);
                        if (cam.cacheTimeout) {
                            cam.cache = data;
                            cam.cacheParams = params;
                            cam.cacheTime = Date.now() + cam.cacheTimeout;
                        }
                    }

                    res.setHeader('Content-type', data.contentType);
                    res.write(data.body || '');
                    res.end();
                } catch (e) {
                    res.statusCode = 500;
                    res.write(`Unknown error: ${e}`);
                    res.end();
                }
            } else {
                res.statusCode = 501;
                res.write(`Unknown camera type: ${cam.type}`);
                res.end();
            }
        } else {
            res.statusCode = 404;
            res.write('not found');
            res.end();
        }
    });

    adapter.__server.on('clientError', (err, socket) =>
        socket.end('HTTP/1.1 400 Bad Request\r\n\r\n'));

    adapter.__server.listen({port: adapter.config.port || '127', host: adapter.config.bind}, () =>
        adapter.log.info(`Server started on ${adapter.config.bind}:${adapter.config.port}`));
}

async function syncConfig() {
    try {
        const files = await adapter.readDirAsync(adapter.namespace, '/');
        for (let f = 0; f < files.length; f++) {
            const file = files[f];
            if (!adapter.config.cameras.find(item => `${item.name}.jpg` === file.file)) {
                try {
                    await adapter.delFileAsync(adapter.namespace, file.file);
                } catch (e) {
                    adapter.log.error(`Cannot delete file ${file}: ${e}`);
                }
            }
        }
    } catch (e) {
        // ignore
    }
}

function fillFiles() {
    // write all states with actual images one time at the start
    return new Promise(resolve => {
        const promises = adapter.config.cameras.map(cam =>
            getCameraImage(cam)
                .catch(e => adapter.log.error(`Cannot get image: ${e}`)));

        Promise.all(promises)
            .then(() => resolve(null));
    });
}

async function syncData() {
    const states = await adapter.getStatesOfAsync('');
    let running;
    let stream;
    // create new states
    for (let c = 0; c < adapter.config.cameras.length; c++) {
        try {
            running = await adapter.getObjectAsync(`${adapter.config.cameras[c].name}.running`);
        } catch (e) {
            // ignore
        }
        if (!running) {
            try {
                await adapter.setObjectAsync(`${adapter.config.cameras[c].name}.running`, {
                    type: 'state',
                    common: {
                        name: `${adapter.config.cameras[c].name}.running`,
                        type: 'boolean',
                        role: 'indicator',
                        read: true,
                        write: true,
                    },
                    native: {},
                });
            } catch (e) {
                // ignore
            }
        }
        const stateRunning = await adapter.getStateAsync(`${adapter.config.cameras[c].name}.running`);
        if (stateRunning && stateRunning.val && !stateRunning.ack) {
            adapter.log.debug(`Start camera ${adapter.config.cameras[c].name}`);
            try {
                await startRtspStreaming(adapter.config.cameras[c].name, null, true);
            } catch (e) {
                adapter.log.error(`Cannot start camera ${adapter.config.cameras[c].name}: ${e}`);
            }
        }
        try {
            stream = await adapter.getObjectAsync(`${adapter.config.cameras[c].name}.stream`);
        } catch (e) {
            // ignore
        }
        if (!stream) {
            try {
                await adapter.setObjectAsync(`${adapter.config.cameras[c].name}.stream`, {
                    type: 'state',
                    common: {
                        name: `${adapter.config.cameras[c].name}.stream`,
                        type: 'string',
                        role: 'indicator',
                        read: true,
                        write: false,
                    },
                    native: {},
                });
            } catch (e) {
                // ignore
            }
        }
    }

    // delete old states
    for (let s = 0; s < states.length; s++) {
        if (states[s]._id.match(/\.running$/) || states[s]._id.match(/\.stream$/)) {
            const parts = states[s]._id.split('.');
            parts.pop();
            const name = parts.pop();
            if (!adapter.config.cameras.find(cam => cam.name === name)) {
                try {
                    await adapter.delObjectAsync(states[s]._id);
                } catch (e) {
                    // ignore
                }
            }
        }
    }
}

async function main(adapter) {
    adapter._streamSubscribes = [];
    adapter._sharp = sharp;

    if (!adapter.config.ffmpegPath && process.platform === 'win32' && !fs.existsSync(`${__dirname}/win-ffmpeg.exe`)) {
        adapter.log.info('Decompress ffmpeg.exe...');
        await decompress(`${__dirname}/win-ffmpeg.zip`, __dirname);
    }

    // read secret key
    const data = await adapter.getForeignObjectAsync('system.config');
    // store system secret
    adapter.__systemSecret = data.native.secret;
    lang = adapter.config.language || data.common.language;

    adapter.__CAM_TYPES = {};
    const promises = [];

    adapter.config.tempPath = adapter.config.tempPath || (`${__dirname}/snapshots`);
    adapter.config.defaultCacheTimeout = parseInt(adapter.config.defaultCacheTimeout, 10) || 0;

    if (!fs.existsSync(adapter.config.ffmpegPath) && !fs.existsSync(`${adapter.config.ffmpegPath}.exe`)) {
        if (process.platform === 'win32') {
            adapter.config.ffmpegPath = `${__dirname}/win-ffmpeg.exe`;
        } else {
            adapter.log.error(`Cannot find ffmpeg in "${adapter.config.ffmpegPath}"`);
        }
    }

    try {
        if (!fs.existsSync(adapter.config.tempPath)) {
            fs.mkdirSync(adapter.config.tempPath);
            adapter.log.debug(`Create snapshots directory: ${path.normalize(adapter.config.tempPath)}`);
        }
    } catch (e) {
        adapter.log.error(`Cannot create snapshots directory: ${e}`);
    }

    let migrate = false;
    adapter.config.cameras = adapter.config.cameras.filter(cam => cam.enabled !== false);

    // init all required camera providers
    adapter.config.cameras.forEach(item => {
        if (item && item.type) {
            item.path = `/${item.name}`;

            if (item.cacheTimeout === undefined || item.cacheTimeout === null || item.cacheTimeout === '') {
                item.cacheTimeout = adapter.config.defaultCacheTimeout;
            } else {
                item.cacheTimeout = parseInt(item.cacheTimeout, 10) || 0;
            }

            try {
                adapter.__CAM_TYPES[item.type] = adapter.__CAM_TYPES[item.type] || require(`./cameras/${item.type}`);
                promises.push(adapter.__CAM_TYPES[item.type]
                    .init(adapter, item)
                    .catch(e => adapter.log.error(`Cannot init camera ${item.name}: ${e && e.toString()}`))
                );
                if (!item.rtsp && adapter.__CAM_TYPES[item.type].getRtspURL) {
                    migrate = true;
                }
            } catch (e) {
                adapter.log.error(`Cannot load "${item.type}": ${e}`);
            }
        }
    });

    if (migrate) {
        adapter.log.info('Migrate config to new format');
        const obj = await adapter.getForeignObjectAsync(`system.adapter.${adapter.namespace}`);
        obj.native.cameras.forEach(item => {
            if (item && item.type && adapter.__CAM_TYPES[item.type] && adapter.__CAM_TYPES[item.type].getRtspURL) {
                item.rtsp = true;
            }
        });
        await adapter.setForeignObjectAsync(`system.adapter.${adapter.namespace}`, obj);
        // adapter will be restarted
        return;
    }

    if (typeof adapter.config.allowIPs === 'string') {
        adapter.config.allowIPs = adapter.config.allowIPs.split(/,;/).map(i => i.trim()).filter(i => i);
        if (adapter.config.allowIPs.find(i => i === '*')) {
            adapter.config.allowIPs = true;
        }
    }

    adapter.__bforce = {};

    // garbage collector
    adapter.__bforceInterval = setInterval(() => {
        const now = Date.now();
        Object.keys(adapter.__bforce).forEach(ip => {
            if (now - adapter.__bforce[ip] > 5000) {
                delete adapter.__bforce[ip];
            }
        });
    }, 30000);

    adapter.subscribeStates('*');

    await syncData();
    await Promise.all(promises);
    await syncConfig();
    await fillFiles();
    startWebServer(adapter);
}

// @ts-ignore parent is a valid property on module
if (module.parent) {
    // Export startAdapter in compact mode
    module.exports = startAdapter;
} else {
    // otherwise start the instance directly
    startAdapter();
}
