'use strict';
const utils       = require('@iobroker/adapter-core');
const adapterName = require('./package.json').name.split('.').pop();
const http        = require('http');
const rtsp        = require('./cameras/rtsp');
const fs          = require('fs');
const path        = require('path');
const moment      = require('moment');
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
    Object.assign(options, {name: adapterName, subscribable: true});
    adapter = new utils.Adapter(options);

    adapter.on('message', msg => processMessage(adapter, msg));
    adapter.on('ready', () => main(adapter));

    adapter.on('subscribesChange', subscriptions => {
        // Go through subscribes
        console.log(`Subscribe on ${JSON.stringify(subscriptions)}`);
    });


    moment.locale('de');

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
        const url = `/${item.name}_test`;
        try {
            adapter.__CAM_TYPES[item.type] = adapter.__CAM_TYPES[item.type] || require(`./cameras/${item.type}`);
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
            },
        };

        adapter.__CAM_TYPES[item.type].init(adapter, item)
            .then(() => {
                try {
                    return adapter.__CAM_TYPES[item.type].process(adapter, item, req, res);
                } catch (e) {
                    console.log(`Cannot get image: ${e}`);
                    cb && cb({error: `Cannot get image: ${e}`});
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
                        return resizeImage(result, item.width, item.height)
                            .then(data => rotateImage(data, item.angle))
                            .then(data => addTextToImage(data, item.addTime ? adapter.config.dateFormat || 'LTS' : null, item.title))
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
                adapter.log.warn(`Cannot get image: ${e && e.toString()}`);
                cb && cb({error: e && e.toString()});
            })
            .then(() => adapter.__CAM_TYPES[item.type].unload(adapter, item));
    } else {
        cb && cb({error: 'Unknown type or invalid parameters'});
    }
}

function getCameraImage(cam) {
    if (adapter.__CAM_TYPES[cam.type]) {
        adapter.log.debug(`Request ${cam.type} ${cam.ip || cam.url || cam.oid || ''} ${cam.name}`);

        return adapter.__CAM_TYPES[cam.type].process(adapter, cam)
            .then(data => {
                if (data) {
                    let imageData;
                    return resizeImage(data, cam.width, cam.height)
                        .then(data => rotateImage(data, cam.angle))
                        .then(data => addTextToImage(data, cam.addTime ? adapter.config.dateFormat || 'LTS' : null, cam.title))
                        .then(_imageData => {
                            imageData = _imageData;
                            return adapter.writeFileAsync(adapter.namespace, `/${cam.name}.jpg`, Buffer.from(_imageData.body));
                        })
                        .then(() => imageData.body);
                } else if (!data) {
                    adapter.log.error(`No data from camera ${cam.name}`);
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
            let cam = adapter.config.cameras.find(cam => cam.name === obj.message.name);
            if (cam && obj.callback) {
                cam = Object.assign(JSON.parse(JSON.stringify(cam), obj.message));

                getCameraImage(cam)
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
        case 'webStreaming': {
            if (obj.callback && obj.message) {
                const url = rtsp.webStreaming(adapter, obj.message.rtsp);
                adapter.sendTo(obj.from, obj.command, {url: `http://127.0.0.1:8200/streaming/${url}/playlist.m3u8`}, obj.callback);
            }
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
            .then(body => ({body, contentType: 'image/jpeg'}));
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
                        dpi: data.metadata.height * 0.2
                    },
                },
                top: Math.round(data.metadata.height * 0.95),
                left: Math.round(data.metadata.width * 0.01),
                blend: 'add'
            });
        }

        if (date) {
            layers.push({
                input: {
                    text: {
                        text: date,
                        dpi: data.metadata.height * 0.2
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
            .then(body => ({body, contentType: 'image/jpeg'}));
    }
}

function startWebServer(adapter) {
    adapter.log.debug(`Starting web server on http://${adapter.config.bind}:${adapter.config.port}/`);
    adapter.__server = http.createServer((req, res) => {
        const clientIp = req.connection.remoteAddress;
        const match = req.url.match(/^\/streaming\/([0-9a-z\-]+)\/(playlist[0-9]*\.(m3u8|ts))$/);
        if (match) {
            let path = `${__dirname}/data/${match[1]}/${match[2]}`;
            if (fs.existsSync(path)) {
                const stat = fs.statSync(path);

                const headers = {
                    'Access-Control-Allow-Origin': '*', /* @dev First, read about security */
                    'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
                    'Access-Control-Max-Age': 2592000, // 30 days
                    /** add other headers as per requirement */
                };
                
                if (req.method === 'OPTIONS') {
                    res.writeHead(204, headers);
                    res.end();
                    return;
                }

                res.writeHead(200, {
                    'Content-Type': match[3] === 'ts' ? 'video/mpeg' : 'text/plain',
                    'Content-Length': stat.size,
                    ...headers,
                });
                const file = fs.createReadStream(path);
                file.pipe(res);
            }
            return;
        }

        const parts = req.url.split('?');
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

        if (cam) {
            if (adapter.__CAM_TYPES[cam.type]) {
                adapter.log.debug(`Request ${cam.name} ${cam.type} ${cam.ip || cam.url}`);
                let done = false;
                adapter.__CAM_TYPES[cam.type].process(adapter, cam, req, res)
                    .then(data => {
                        done = data.done;
                        if (data && !done) {
                            return resizeImage(data, parseInt(query.w, 10), parseInt(query.h, 10))
                                .then(data => rotateImage(data, parseInt(query.angle, 10)))
                                .then(data => addTextToImage(data, cam.addTime ? adapter.config.dateFormat || 'LTS' : null, cam.title))
                                .then(data => {
                                    if (!done) {
                                        done = true;
                                        res.setHeader('Content-type', data.contentType);
                                        res.write(data.body || '');
                                        res.end();
                                    }
                                });
                        } else if (!done) {
                            if (!done) {
                                done = true;
                                res.statusCode = 500;
                                res.write('No answer');
                                res.end();
                            }
                        }
                    })
                    .catch(e => {
                        if (!done) {
                            done = true;
                            res.statusCode = 500;
                            res.write(`Unknown error: ${e}`);
                            res.end();
                        }
                    });
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
        adapter.log.debug(`Server started on ${adapter.config.bind}:${adapter.config.port}`));
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
    // write all states with actual images one time at start
    return new Promise(resolve => {
        const promises = adapter.config.cameras.map(cam =>
            getCameraImage(cam)
                .catch(e => adapter.log.error(`Cannot get image: ${e}`)));

        Promise.all(promises)
            .then(() => resolve(null));
    });
}

function main(adapter) {
    // read secret key
    adapter.getForeignObject('system.config', null, (err, data) => {
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

        // init all required camera providers
        adapter.config.cameras.forEach(item => {
            if (item && item.type && item.enabled !== false) {
                item.path = `/${item.name}`;
                try {
                    adapter.__CAM_TYPES[item.type] = adapter.__CAM_TYPES[item.type] || require(`./cameras/${item.type}`);
                    promises.push(adapter.__CAM_TYPES[item.type]
                        .init(adapter, item)
                        .catch(e => adapter.log.error(`Cannot init camera ${item.name}: ${e && e.toString()}`))
                    );
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
            .then(() => fillFiles())
            .then(() => rtsp.cleanRtspData())
            .then(() => startWebServer(adapter))
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
