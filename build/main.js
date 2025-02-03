"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CamerasAdapter = void 0;
const adapter_core_1 = require("@iobroker/adapter-core");
const node_http_1 = __importDefault(require("node:http"));
const sharp_1 = __importDefault(require("sharp"));
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const moment_1 = __importDefault(require("moment"));
const decompress_1 = __importDefault(require("decompress"));
const Factory_1 = __importDefault(require("./cameras/Factory"));
const rtspCommon_1 = require("./cameras/rtspCommon");
class CamerasAdapter extends adapter_core_1.Adapter {
    lang = 'en';
    streamSubscribes = [];
    camerasConfig = {};
    bForceInterval = null;
    server = null;
    cache = {};
    allowIPs = true;
    cameras = {};
    bForce = {};
    constructor(options = {}) {
        super({
            ...options,
            name: 'cameras',
            uiClientSubscribe: async (subscribeInfo) => {
                return await this.onClientSubscribe(subscribeInfo);
            },
            uiClientUnsubscribe: (data) => {
                const { clientId, message, reason } = data;
                if (reason === 'client') {
                    this.log.debug(`GUI Client "${clientId} disconnected`);
                }
                else {
                    this.log.debug(`Client "${clientId}: ${reason}`);
                }
                this.onClientUnsubscribe(clientId, message);
            },
        });
        this.on('ready', () => this.main());
        this.on('stateChange', (id, state) => this.onStateChange(id, state));
        // this.on('objectChange', (id, object) => this.onObjectChange(id, object));
        this.on('unload', callback => this.onUnload(callback));
        this.on('message', this.onMessage.bind(this));
    }
    onStateChange(id, state) {
        if (state && !state.ack && id.endsWith('.running') && id.startsWith(this.namespace)) {
            const parts = id.split('.');
            const camera = parts[id.length - 2];
            if (this.cameras[camera]) {
                if (state.val) {
                    try {
                        this.cameras[camera].startWebStream();
                    }
                    catch (e) {
                        this.log.error(`Cannot start camera ${camera}: ${e}`);
                    }
                }
                else {
                    this.log.debug(`Stop camera ${camera}`);
                    this.cameras[camera].stopWebStream();
                }
            }
        }
    }
    onUnload(cb) {
        if (this.bForceInterval) {
            clearInterval(this.bForceInterval);
            this.bForceInterval = null;
        }
        try {
            if (this.server) {
                this.server.close(() => this.unloadCameras(cb));
            }
            else {
                this.unloadCameras(cb);
            }
        }
        catch {
            this.unloadCameras(cb);
        }
    }
    async main() {
        this.streamSubscribes = [];
        this.camerasConfig = this.config;
        if (!this.camerasConfig.ffmpegPath &&
            process.platform === 'win32' &&
            !(0, node_fs_1.existsSync)(`${__dirname}/win-ffmpeg.exe`)) {
            this.log.info('Decompress ffmpeg.exe...');
            await (0, decompress_1.default)(`${__dirname}/win-ffmpeg.zip`, __dirname);
        }
        // read secret key
        const systemConfig = await this.getForeignObjectAsync('system.config');
        // store system secret
        this.lang = this.camerasConfig.language || systemConfig?.common.language || 'en';
        const promises = [];
        this.camerasConfig.tempPath = this.camerasConfig.tempPath || `${__dirname}/snapshots`;
        this.camerasConfig.defaultCacheTimeout = parseInt(this.camerasConfig.defaultCacheTimeout, 10) || 0;
        if (!(0, node_fs_1.existsSync)(this.camerasConfig.ffmpegPath) && !(0, node_fs_1.existsSync)(`${this.camerasConfig.ffmpegPath}.exe`)) {
            if (process.platform === 'win32') {
                this.camerasConfig.ffmpegPath = `${__dirname}/win-ffmpeg.exe`;
            }
            else {
                this.log.error(`Cannot find ffmpeg in "${this.camerasConfig.ffmpegPath}"`);
            }
        }
        try {
            if (!(0, node_fs_1.existsSync)(this.camerasConfig.tempPath)) {
                (0, node_fs_1.mkdirSync)(this.camerasConfig.tempPath);
                this.log.debug(`Create snapshots directory: ${(0, node_path_1.normalize)(this.camerasConfig.tempPath)}`);
            }
        }
        catch (e) {
            this.log.error(`Cannot create snapshots directory: ${e}`);
        }
        this.camerasConfig.cameras = this.camerasConfig.cameras.filter(cam => cam.enabled !== false);
        // init all required camera providers
        this.camerasConfig.cameras.forEach(item => {
            if (item?.type) {
                if (item.cacheTimeout === undefined || item.cacheTimeout === null || item.cacheTimeout === '') {
                    item.cacheTimeout = this.camerasConfig.defaultCacheTimeout;
                }
                else {
                    item.cacheTimeout = parseInt(item.cacheTimeout, 10) || 0;
                }
                try {
                    promises.push((0, Factory_1.default)(this, item, this.streamSubscribes)
                        .then(camera => {
                        this.cameras[camera.getName()] = camera;
                    })
                        .catch(e => this.log.error(`Cannot init camera ${item.name}: ${e && e.toString()}`)));
                }
                catch (e) {
                    this.log.error(`Cannot load "${item.type}": ${e}`);
                }
            }
        });
        if (typeof this.camerasConfig.allowIPs === 'string') {
            this.allowIPs = this.camerasConfig.allowIPs
                .split(/,;/)
                .map(i => i.trim())
                .filter(i => i);
            if (this.allowIPs.find(i => i === '*')) {
                this.allowIPs = true;
            }
        }
        this.bForce = {};
        // garbage collector
        this.bForceInterval = setInterval(() => {
            const now = Date.now();
            Object.keys(this.bForce).forEach(ip => {
                if (now - this.bForce[ip] > 5000) {
                    delete this.bForce[ip];
                }
            });
        }, 30000);
        this.subscribeStates('*');
        await this.syncData();
        await Promise.all(promises);
        await this.syncConfig();
        await this.fillFiles();
        this.startWebServer();
    }
    async testCamera(item) {
        if (item?.type) {
            let result = null;
            let tempCamera;
            // load camera module
            try {
                tempCamera = await (0, Factory_1.default)(this, item, this.streamSubscribes);
            }
            catch (e) {
                this.log.error(`Cannot load "${item.type}": ${e}`);
                throw new Error(`Cannot load "${item.type}"`);
            }
            // get image
            let data = await tempCamera.process();
            if (data?.body) {
                data = await this.resizeImage(data, item.width, item.height);
                data = await this.rotateImage(data, item.angle);
                data = await this.addTextToImage(data, item.addTime ? this.camerasConfig.dateFormat || 'LTS' : undefined, item.title);
                result = {
                    body: `data:${data.contentType};base64,${data.body.toString('base64')}`,
                    contentType: data.contentType,
                };
                await tempCamera.destroy();
            }
            else {
                await tempCamera.destroy();
                throw new Error(`No answer`);
            }
            // unload camera
            return result;
        }
        throw new Error('Unknown type or invalid parameters');
    }
    async getCameraImage(cam) {
        if (this.cameras[cam.name]) {
            this.log.debug(`Request ${cam.type} ${cam.name}`);
            const params = {
                w: parseInt(cam.width, 10) || 0,
                h: parseInt(cam.height, 10) || 0,
                angle: parseInt(cam.angle, 10) || 0,
            };
            if (!cam.noCache &&
                this.cache[cam.name] &&
                this.cache[cam.name].ts > Date.now() &&
                this.cache[cam.name].params === JSON.stringify(params)) {
                this.log.debug(`Take from cache ${cam.name} ${cam.type}`);
                return this.cache[cam.name].data.body;
            }
            let data = await this.cameras[cam.type].process();
            if (data) {
                data = await this.resizeImage(data, params.w, params.h);
                data = await this.rotateImage(data, params.angle);
                data = await this.addTextToImage(data, cam.addTime ? this.camerasConfig.dateFormat || 'LTS' : undefined, cam.title);
                if (cam.cacheTimeout) {
                    this.cache[cam.name] = {
                        data,
                        ts: Date.now() + cam.cacheTimeout,
                        params: JSON.stringify(params),
                    };
                }
                await this.writeFileAsync(this.namespace, `/${cam.name}.jpg`, Buffer.from(data.body));
                return data.body;
            }
            return Promise.reject(new Error('No data from camera'));
        }
        return Promise.reject(new Error('Unsupported camera type'));
    }
    async onClientSubscribe(msg) {
        this.log.debug(`Subscribe from ${msg.clientId}: ${JSON.stringify(msg.message)}`);
        if (!this.streamSubscribes) {
            this.log.error(`Adapter is still initializing`);
            return { accepted: false, error: `Adapter is still initializing` };
        }
        const message = msg.message.message;
        if (message.type?.startsWith('startCamera/')) {
            const cameraName = message.type.substring('startCamera/'.length);
            // start camera with obj.message.data
            if (!this.streamSubscribes.find(s => s.camera === cameraName)) {
                this.log.debug(`Start camera "${cameraName}"`);
            }
            if (this.cameras[cameraName]) {
                try {
                    await this.cameras[cameraName].startWebStream(message.data);
                }
                catch (e) {
                    this.log.error(`Cannot start camera on subscribe "${cameraName}": ${e}`);
                    return { accepted: false, error: `Cannot start camera on subscribe "${cameraName}": ${e}` };
                }
            }
            // inform GUI that camera is started
            const sub = this.streamSubscribes.find(s => s.clientId === msg.clientId && s.camera === cameraName);
            if (!sub) {
                this.streamSubscribes.push({ clientId: msg.clientId, camera: cameraName, ts: Date.now() });
            }
            else {
                sub.ts = Date.now();
            }
            return { accepted: true, heartbeat: 60000 };
        }
        return { accepted: false, error: 'Unknown message type' };
    }
    onClientUnsubscribe(clientId, obj) {
        this.log.debug(`Unsubscribe from ${clientId}: ${JSON.stringify(obj?.message)}`);
        if (!this.streamSubscribes) {
            return;
        }
        const message = obj?.message;
        if (!message?.type) {
            return;
        }
        if (!Array.isArray(message.type)) {
            message.type = [message.type];
        }
        message.type.forEach(type => {
            if (type && type.startsWith('startCamera/')) {
                const cameraName = type.substring('startCamera/'.length);
                let deleted;
                do {
                    deleted = false;
                    const pos = this.streamSubscribes.findIndex(s => s.clientId === clientId);
                    if (pos !== -1) {
                        deleted = true;
                        this.streamSubscribes.splice(pos, 1);
                        // check if anyone else subscribed on this camera
                        if (!this.streamSubscribes.find(s => s.camera === cameraName || Date.now() - s.ts > 60000)) {
                            // stop camera
                            this.log.debug(`Stop camera "${cameraName}"`);
                            this.cameras[cameraName]
                                .stopWebStream()
                                .catch(e => this.log.error(`Cannot stop camera on unsubscribe "${cameraName}": ${e}`));
                        }
                    }
                } while (deleted);
            }
        });
    }
    async onMessage(obj) {
        if (!obj?.command) {
            return;
        }
        switch (obj.command) {
            case 'test': {
                try {
                    const data = await this.testCamera(obj.message);
                    obj.callback && this.sendTo(obj.from, obj.command, data, obj.callback);
                }
                catch (e) {
                    obj.callback && this.sendTo(obj.from, obj.command, { error: e.toString() }, obj.callback);
                }
                break;
            }
            case 'image': {
                if (obj.message) {
                    const cameraConfig = this.camerasConfig.cameras.find(cam => cam.name === obj.message.name);
                    if (cameraConfig && obj.callback) {
                        const cam = Object.assign(JSON.parse(JSON.stringify(cameraConfig), obj.message));
                        try {
                            const data = await this.getCameraImage(cam);
                            this.sendTo(obj.from, obj.command, { data: Buffer.from(data).toString('base64'), contentType: 'image/jpeg' }, obj.callback);
                        }
                        catch (e) {
                            this.sendTo(obj.from, obj.command, { error: e }, obj.callback);
                        }
                    }
                    else {
                        obj.callback && this.sendTo(obj.from, obj.command, { error: 'Name not found' }, obj.callback);
                    }
                }
                else {
                    obj.callback && this.sendTo(obj.from, obj.command, { error: 'Invalid request' }, obj.callback);
                }
                break;
            }
            case 'list': {
                obj.callback &&
                    this.sendTo(obj.from, obj.command, {
                        list: this.camerasConfig.cameras.map(cam => ({
                            name: cam.name,
                            desc: cam.desc,
                            id: `${this.namespace}.cameras.${cam.name}`,
                        })),
                    }, obj.callback);
                break;
            }
            case 'ffmpeg': {
                if (obj.callback && obj.message) {
                    (0, rtspCommon_1.executeFFmpeg)(['-version'], obj.message.path)
                        .then((data) => {
                        if (data) {
                            const result = data.split('\n')[0];
                            const version = result.match(/version\s+([-\w.]+)/i);
                            if (version) {
                                this.sendTo(obj.from, obj.command, { version: version[1] }, obj.callback);
                            }
                            else {
                                this.sendTo(obj.from, obj.command, { version: result }, obj.callback);
                            }
                        }
                        else {
                            this.sendTo(obj.from, obj.command, { error: 'No answer' }, obj.callback);
                        }
                    })
                        .catch((error) => this.sendTo(obj.from, obj.command, { error: error.toString() }, obj.callback));
                }
                break;
            }
        }
    }
    unloadCameras(cb) {
        const promises = [];
        this.camerasConfig.cameras.forEach(item => {
            if (item?.type && this.cameras[item.name]) {
                try {
                    promises.push(this.cameras[item.type]
                        .destroy()
                        .catch(e => this.log.error(`Cannot unload "${item.type}": ${e}`)));
                }
                catch (e) {
                    this.log.error(`Cannot unload "${item.type}": ${e}`);
                }
            }
        });
        void Promise.all(promises).then(() => cb && cb());
    }
    async resizeImage(data, width, height) {
        if (!width && !height) {
            const body = await (0, sharp_1.default)(data.body).jpeg().toBuffer();
            return { body, contentType: 'image/jpeg' };
        }
        const body = await (0, sharp_1.default)(data.body)
            .resize(width || null, height || null)
            .jpeg()
            .toBuffer();
        return { body, contentType: 'image/jpeg' };
    }
    async rotateImage(data, angle) {
        if (!angle) {
            const body = await (0, sharp_1.default)(data.body).jpeg().toBuffer();
            return { body, contentType: 'image/jpeg' };
        }
        const body = await (0, sharp_1.default)(data.body).rotate(angle).jpeg().toBuffer();
        return { body, contentType: 'image/jpeg' };
    }
    async addTextToImage(data, dateFormat, title) {
        if (!dateFormat && !title) {
            return data;
        }
        const date = dateFormat ? (0, moment_1.default)().locale(this.lang).format(dateFormat) : '';
        data.metadata = data.metadata || (await (0, sharp_1.default)(data.body).metadata());
        const layers = [];
        if (title) {
            layers.push({
                input: {
                    text: {
                        text: title,
                        dpi: (data.metadata.height || 1) * 0.2,
                    },
                },
                top: Math.round((data.metadata.height || 1) * 0.95),
                left: Math.round((data.metadata.width || 1) * 0.01),
                blend: 'add',
            });
        }
        if (date) {
            layers.push({
                input: {
                    text: {
                        text: date,
                        dpi: (data.metadata.height || 1) * 0.2,
                    },
                },
                top: Math.round((data.metadata.height || 1) * 0.02),
                left: Math.round((data.metadata.width || 1) * 0.01),
                blend: 'add',
            });
        }
        return (0, sharp_1.default)(data.body)
            .composite(layers)
            .jpeg()
            .toBuffer()
            .then(body => ({ body, contentType: 'image/jpeg' }));
    }
    startWebServer() {
        this.log.debug(`Starting web server on http://${this.camerasConfig.bind}:${this.camerasConfig.port}/`);
        this.server = node_http_1.default.createServer(async (req, res) => {
            const clientIp = req.socket.remoteAddress;
            if (!clientIp) {
                res.statusCode = 401;
                res.write('Invalid key');
                res.end();
                this.log.debug(`Invalid key from unknown IP`);
                return;
            }
            const parts = (req.url || '').split('?');
            const url = parts[0];
            const query = {};
            (parts[1] || '').split('&').forEach(p => {
                const pp = p.split('=');
                query[decodeURIComponent(pp[0])] = decodeURIComponent(pp[1] || '');
            });
            const now = Date.now();
            if (this.bForce[clientIp] && now - this.bForce[clientIp] < 5000 && query.key !== this.camerasConfig.key) {
                this.bForce[clientIp] = now;
                res.statusCode = 429;
                res.write('Blocked for 5 seconds');
                res.end();
                return;
            }
            if (query.key !== this.camerasConfig.key) {
                this.bForce[clientIp] = Date.now();
                res.statusCode = 401;
                res.write('Invalid key');
                res.end();
                this.log.debug(`Invalid key from ${clientIp}. Expected ${this.camerasConfig.key}`);
                return;
            }
            if (clientIp !== '127.0.0.1' &&
                clientIp !== '::1/128' &&
                this.allowIPs !== true &&
                !this.allowIPs.includes(clientIp)) {
                res.statusCode = 401;
                res.write('Invalid key');
                res.end();
                this.log.debug(`Invalid key from ${clientIp}. Expected ${this.camerasConfig.key}`);
                return;
            }
            const cam = this.camerasConfig.cameras.find(c => this.cameras[c.name].path === url);
            const ignoreCache = query.noCache === 'true' || query.noCache === '1';
            if (cam) {
                if (this.cameras[cam.name]) {
                    let data;
                    try {
                        const params = {
                            w: parseInt(query.w, 10) || 0,
                            h: parseInt(query.h, 10) || 0,
                            angle: parseInt(query.angle, 10) || 0,
                        };
                        if (!ignoreCache &&
                            this.cache[cam.name] &&
                            this.cache[cam.name].ts > Date.now() &&
                            this.cache[cam.name].params === JSON.stringify(params)) {
                            this.log.debug(`Take from cache ${cam.name} ${cam.type}`);
                            data = this.cache[cam.name].data;
                        }
                        else {
                            this.log.debug(`Request ${cam.name}`);
                            data = await this.cameras[cam.name].process();
                            data = await this.resizeImage(data, params.w, params.h);
                            data = await this.rotateImage(data, params.angle);
                            data = await this.addTextToImage(data, cam.addTime ? this.camerasConfig.dateFormat || 'LTS' : undefined, cam.title);
                            if (cam.cacheTimeout) {
                                this.cache[cam.name] = {
                                    data,
                                    ts: Date.now() + cam.cacheTimeout,
                                    params: JSON.stringify(params),
                                };
                            }
                        }
                        res.setHeader('Content-type', data.contentType);
                        res.write(data.body || '');
                        res.end();
                    }
                    catch (e) {
                        res.statusCode = 500;
                        res.write(`Unknown error: ${e}`);
                        res.end();
                    }
                }
                else {
                    res.statusCode = 501;
                    res.write(`Unknown camera type: ${cam.type}`);
                    res.end();
                }
            }
            else {
                res.statusCode = 404;
                res.write('not found');
                res.end();
            }
        });
        this.server.on('clientError', (_err, socket) => socket.end('HTTP/1.1 400 Bad Request\r\n\r\n'));
        this.server.listen({ port: this.camerasConfig.port || '127', host: this.camerasConfig.bind }, () => this.log.info(`Server started on ${this.camerasConfig.bind}:${this.camerasConfig.port}`));
    }
    async syncConfig() {
        try {
            const files = await this.readDirAsync(this.namespace, '/');
            for (let f = 0; f < files.length; f++) {
                const file = files[f];
                if (!this.camerasConfig.cameras.find(item => `${item.name}.jpg` === file.file)) {
                    try {
                        await this.delFileAsync(this.namespace, file.file);
                    }
                    catch (e) {
                        this.log.error(`Cannot delete file ${this.namespace}/${file.file}: ${e}`);
                    }
                }
            }
        }
        catch {
            // ignore
        }
    }
    async fillFiles() {
        // write all states with actual images one time at the start
        const promises = this.camerasConfig.cameras.map(cam => this.getCameraImage(cam).catch((e) => this.log.error(`Cannot get image: ${e}`)));
        await Promise.all(promises);
    }
    async syncData() {
        const states = await this.getStatesOfAsync('');
        // create new states
        for (const cam of this.camerasConfig.cameras) {
            let running;
            try {
                running = await this.getObjectAsync(`${cam.name}.running`);
            }
            catch {
                // ignore
            }
            if (!running) {
                try {
                    await this.setObjectAsync(`${cam.name}.running`, {
                        type: 'state',
                        common: {
                            name: `${cam.name}.running`,
                            type: 'boolean',
                            role: 'indicator',
                            read: true,
                            write: true,
                        },
                        native: {},
                    });
                }
                catch {
                    // ignore
                }
            }
            const stateRunning = await this.getStateAsync(`${cam.name}.running`);
            // Start web stream if desired, e.g. after adapter restart
            if (stateRunning?.val && !stateRunning.ack) {
                this.log.debug(`Start camera ${cam.name}`);
                try {
                    await this.cameras[cam.name].startWebStream();
                }
                catch (e) {
                    this.log.error(`Cannot start camera ${cam.name}: ${e}`);
                }
            }
            // Create stream object
            let stream;
            try {
                stream = await this.getObjectAsync(`${cam.name}.stream`);
            }
            catch {
                // ignore
            }
            if (!stream) {
                try {
                    await this.setObjectAsync(`${cam.name}.stream`, {
                        type: 'state',
                        common: {
                            name: `${cam.name}.stream`,
                            type: 'string',
                            role: 'indicator',
                            read: true,
                            write: false,
                        },
                        native: {},
                    });
                }
                catch {
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
                if (!this.camerasConfig.cameras.find(cam => cam.name === name)) {
                    try {
                        await this.delObjectAsync(states[s]._id);
                    }
                    catch {
                        // ignore
                    }
                }
            }
        }
    }
}
exports.CamerasAdapter = CamerasAdapter;
if (require.main !== module) {
    // Export the constructor in compact mode
    module.exports = (options) => new CamerasAdapter(options);
}
else {
    // otherwise start the instance directly
    (() => new CamerasAdapter())();
}
//# sourceMappingURL=main.js.map