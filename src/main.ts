import { Adapter, type AdapterOptions } from '@iobroker/adapter-core';
import { createServer, type Server } from 'node:http';
import { existsSync, mkdirSync } from 'node:fs';
import { normalize } from 'node:path';
import decompress from 'decompress';

import type { CameraSettings, CameraType } from './types';

import type GenericCamera from './cameras/Generic';
import EufyCamera from './cameras/Eufy';
import HikamCamera from './cameras/Hikam';
import ReolinkE1Camera from './cameras/ReolinkE1';
import RtspCamera from './cameras/RTSP';
import UrlCamera from './cameras/Url';
import UrlBasicAuthCamera from './cameras/UrlBasicAuth';
import type {
    UserInterfaceClientSubscribeReturnType,
    UserInterfaceSubscribeInfo,
    UserInterfaceUnsubscribeInfo,
} from '@iobroker/types/build/types';

interface UIMessage {
    type: string | string[];
}

class CamerasAdapter extends Adapter {
    private streamSubscribes: { clientId: string; ts: number; camera: string }[] = [];
    private bruteForceInterval: ioBroker.Interval | null = null;
    private allowIPs: string[] | boolean;
    private bruteForce: Record<string, number> = {};

    private httpServer: Server | null = null;

    private cameraInstances: Record<string, GenericCamera> = {};

    constructor(options: Partial<AdapterOptions> = {}) {
        options = {
            ...options,
            name: 'cameras', // adapter name
            useFormatDate: true,
            subscribable: true,
            uiClientSubscribe: (data: UserInterfaceSubscribeInfo): Promise<UserInterfaceClientSubscribeReturnType> => {
                const { clientId, message } = data;
                return this.onClientSubscribe(clientId, message);
            },
            uiClientUnsubscribe: (data: UserInterfaceUnsubscribeInfo): Promise<void> => {
                const { clientId, message, reason } = data;
                if (reason === 'client') {
                    this.log.debug(`GUI Client "${clientId} disconnected`);
                } else {
                    this.log.debug(`Client "${clientId}: ${reason}`);
                }
                return this.onClientUnsubscribe(clientId, message);
            },
            message: (obj: ioBroker.Message) => this.processMessage(obj),
            stateChange: async (id: string, state: ioBroker.State | null | undefined): Promise<void> =>
                this.onStateChange(id, state),
            ready: (): Promise<void> => this.onReady(),
            unload: (cb: () => void): void => this.unload(cb),
        };

        super(options as AdapterOptions);
    }

    async onStateChange(id: string, state: ioBroker.State | null | undefined): Promise<void> {
        if (state && !state.ack && id.endsWith('.running') && id.startsWith(this.namespace)) {
            const parts = id.split('.');
            const camera = parts[parts.length - 2];
            if (state.val) {
                try {
                    await this.startRtspStreaming(camera, true);
                } catch (e) {
                    this.log.error(`Cannot start camera ${camera}: ${e}`);
                }
            } else {
                this.log.debug(`Stop camera ${camera}`);
                if (this.cameraInstances[camera] instanceof RtspCamera) {
                    await this.cameraInstances[camera].stopWebStreaming();
                }
            }
        }
    }

    getCameraInstance(type: CameraType): GenericCamera {
        if (type === 'rtsp') {
            return new RtspCamera(this, this.streamSubscribes);
        }
        if (type === 'eufy') {
            return new EufyCamera(this, this.streamSubscribes);
        }
        if (type === 'url') {
            return new UrlCamera(this);
        }
        if (type === 'urlBasicAuth') {
            return new UrlBasicAuthCamera(this);
        }
        if (type === 'hikam') {
            return new HikamCamera(this, this.streamSubscribes);
        }
        if (type === 'reolinkE1') {
            return new ReolinkE1Camera(this, this.streamSubscribes);
        }
        throw new Error(`Unsupported camera type: ${type as string}`);
    }

    async onReady(): Promise<void> {
        this.streamSubscribes = [];

        if (!this.config.ffmpegPath && process.platform === 'win32' && !existsSync(`${__dirname}/win-ffmpeg.exe`)) {
            this.log.info('Decompress ffmpeg.exe...');
            await decompress(`${__dirname}/win-ffmpeg.zip`, __dirname);
        }

        this.language = this.config.language || this.language || 'en';

        this.config.tempPath = this.config.tempPath || `${__dirname}/snapshots`;
        this.config.defaultCacheTimeout = parseInt(this.config.defaultCacheTimeout as unknown as string, 10) || 0;

        if (!existsSync(this.config.ffmpegPath) && !existsSync(`${this.config.ffmpegPath}.exe`)) {
            if (process.platform === 'win32') {
                this.config.ffmpegPath = `${__dirname}/win-ffmpeg.exe`;
            } else {
                this.log.error(`Cannot find ffmpeg in "${this.config.ffmpegPath}"`);
            }
        }

        try {
            if (!existsSync(this.config.tempPath)) {
                mkdirSync(this.config.tempPath);
                this.log.debug(`Create snapshots directory: ${normalize(this.config.tempPath)}`);
            }
        } catch (e) {
            this.log.error(`Cannot create snapshots directory: ${e}`);
        }

        let migrate = false;
        this.config.cameras = this.config.cameras.filter(cam => cam.enabled !== false);

        // init all required camera providers
        for (const item of this.config.cameras) {
            if (item?.type) {
                if (
                    !item.rtsp &&
                    (item?.type === 'eufy' ||
                        item?.type === 'rtsp' ||
                        item?.type === 'reolinkE1' ||
                        item?.type === 'hikam')
                ) {
                    migrate = true;
                }
                this.cameraInstances[item.name] = this.getCameraInstance(item.type);
                await this.cameraInstances[item.name].init(item);
            }
        }

        if (migrate) {
            this.log.info('Migrate config to new format');
            const obj = await this.getForeignObjectAsync(`system.adapter.${this.namespace}`);
            this.config.cameras.forEach(item => {
                if (
                    item?.type === 'eufy' ||
                    item?.type === 'rtsp' ||
                    item?.type === 'reolinkE1' ||
                    item?.type === 'hikam'
                ) {
                    item.rtsp = true;
                }
            });
            await this.setForeignObjectAsync(`system.adapter.${this.namespace}`, obj);
            // adapter will be restarted
            return;
        }

        if (typeof this.config.allowIPs === 'string') {
            this.allowIPs = this.config.allowIPs
                .split(/,;/)
                .map(i => i.trim())
                .filter(i => i);
            if (this.allowIPs.find(i => i === '*')) {
                this.allowIPs = true;
            }
        } else {
            this.allowIPs = this.config.allowIPs;
        }

        // garbage collector
        this.bruteForceInterval = this.setInterval(() => {
            const now = Date.now();
            Object.keys(this.bruteForce).forEach(ip => {
                if (now - this.bruteForce[ip] > 5000) {
                    delete this.bruteForce[ip];
                }
            });
        }, 30000);

        this.subscribeStates('*');

        await this.syncData();
        await this.syncConfig();
        await this.fillFiles();
        this.startWebServer();
    }

    unload(cb: () => void): void {
        if (this.bruteForceInterval) {
            this.clearInterval(this.bruteForceInterval);
            this.bruteForceInterval = null;
        }
        const promises: Promise<void>[] = [];
        Object.keys(this.cameraInstances).forEach(
            name => this.cameraInstances[name] && promises.push(this.cameraInstances[name].unload()),
        );
        void Promise.all(promises).then(() => {
            if (this.httpServer) {
                this.httpServer.close(cb);
                this.httpServer = null;
            } else {
                cb && cb();
            }
        });
    }

    async testCamera(item: CameraSettings): Promise<{
        body: string;
        contentType: 'image/jpeg';
    } | null> {
        if (item?.type) {
            let result: {
                body: string;
                contentType: 'image/jpeg';
            } | null = null;
            // load camera module
            const cameraInstance = this.getCameraInstance(item.type);
            try {
                await this.cameraInstances[item.name].init(item);
            } catch (e) {
                this.log.error(`Cannot load "${item.type}": ${e}`);
                throw new Error(`Cannot load "${item.type}"`);
            }

            // init camera
            // get image
            let data = await cameraInstance.process();
            if (data?.body) {
                data = await cameraInstance.resizeImage(data, item.width, item.height);
                data = await cameraInstance.rotateImage(data, item.angle);
                data = await cameraInstance.addTextToImage(
                    data,
                    item.addTime ? this.config.dateFormat || 'LTS' : null,
                    item.title,
                );
                result = {
                    body: `data:${data.contentType};base64,${data.body.toString('base64')}`,
                    contentType: data.contentType,
                };
            } else {
                throw new Error('No answer');
            }

            // unload camera
            await cameraInstance.unload();
            return result;
        }
        throw new Error('Unknown type or invalid parameters');
    }

    async startRtspStreaming(camera: string, fromState?: boolean): Promise<void> {
        if (this.cameraInstances[camera]) {
            await (this.cameraInstances[camera] as RtspCamera).webStreaming(fromState);
        } else {
            // the camera does not support RTSP streaming
            this.log.warn(`Camera "${camera}" does not support RTSP streaming`);
            throw new Error("Camera doesn't support RTSP streaming");
        }
    }

    async onClientSubscribe(
        clientId: string,
        obj: ioBroker.Message,
    ): Promise<{ accepted: boolean; heartbeat?: number; error?: string }> {
        this.log.debug(`Subscribe from ${clientId}: ${JSON.stringify(obj.message)}`);
        if (!this.streamSubscribes) {
            return { error: 'Adapter is still initializing', accepted: false };
        }
        const message: UIMessage = obj.message as UIMessage;
        if (!Array.isArray(message.type)) {
            message.type = [message.type];
        }
        for (const type of message.type) {
            if (type?.startsWith('startCamera/')) {
                const camera = type.substring('startCamera/'.length);
                // start camera with message.data
                if (!this.streamSubscribes.find(s => s.camera === camera)) {
                    this.log.debug(`Start camera "${camera}"`);
                }

                try {
                    await this.startRtspStreaming(camera /*, message.data */);
                } catch (e) {
                    this.log.error(`Cannot start camera on subscribe "${camera}": ${e}`);
                    return {
                        error: `Cannot start camera on subscribe "${camera}": ${e}`,
                        accepted: false,
                    };
                }

                // inform GUI that camera is started
                const sub = this.streamSubscribes.find(s => s.clientId === clientId && s.camera === camera);
                if (!sub) {
                    this.streamSubscribes.push({ clientId, camera, ts: Date.now() });
                } else {
                    sub.ts = Date.now();
                }
            }
        }

        return { accepted: true, heartbeat: 60000 };
    }

    onClientUnsubscribe(clientId: string, obj: ioBroker.Message): Promise<void> {
        this.log.debug(`Unsubscribe from ${clientId}: ${JSON.stringify(obj?.message)}`);
        if (!this.streamSubscribes) {
            return;
        }
        if (!obj?.message?.type) {
            return;
        }

        const message: UIMessage = obj.message as UIMessage;
        if (!Array.isArray(message.type)) {
            message.type = [message.type];
        }

        for (const type of message.type) {
            if (type?.startsWith('startCamera/')) {
                const camera = type.substring('startCamera/'.length);
                let deleted;
                do {
                    deleted = false;
                    const pos = this.streamSubscribes.findIndex(s => s.clientId === clientId);
                    if (pos !== -1) {
                        deleted = true;
                        this.streamSubscribes.splice(pos, 1);
                        // check if anyone else subscribed on this camera
                        if (!this.streamSubscribes.find(s => s.camera === camera || Date.now() - s.ts > 60000)) {
                            // stop camera
                            this.log.debug(`Stop camera "${camera}"`);
                            if (this.cameraInstances[camera]) {
                                (this.cameraInstances[camera] as RtspCamera)
                                    .stopWebStreaming()
                                    .catch(e => this.log.error(`Cannot stop streaming: ${e}`));
                            }
                        }
                    }
                } while (deleted);
            }
        }
    }

    async processMessage(obj: ioBroker.Message): Promise<void> {
        if (!obj || !obj.command) {
            return;
        }

        switch (obj.command) {
            case 'test': {
                try {
                    const data = await this.testCamera(obj.message as CameraSettings);
                    obj.callback && this.sendTo(obj.from, obj.command, data, obj.callback);
                } catch (e) {
                    obj.callback && this.sendTo(obj.from, obj.command, { error: e.toString() }, obj.callback);
                }
                break;
            }

            case 'image': {
                if (obj.message) {
                    if (this.cameraInstances[obj.message.name] && obj.callback) {
                        try {
                            const data = await this.cameraInstances[obj.message.name].getCameraImage(obj.message);
                            this.sendTo(
                                obj.from,
                                obj.command,
                                { data: Buffer.from(data.body).toString('base64'), contentType: data.contentType },
                                obj.callback,
                            );
                        } catch (e) {
                            this.sendTo(obj.from, obj.command, { error: e }, obj.callback);
                        }
                    } else {
                        obj.callback && this.sendTo(obj.from, obj.command, { error: 'Name not found' }, obj.callback);
                    }
                } else {
                    obj.callback && this.sendTo(obj.from, obj.command, { error: 'Invalid request' }, obj.callback);
                }
                break;
            }

            case 'list': {
                obj.callback &&
                    this.sendTo(
                        obj.from,
                        obj.command,
                        {
                            list: this.config.cameras.map(cam => ({
                                name: cam.name,
                                desc: cam.desc,
                                id: `${this.namespace}.cameras.${cam.name}`,
                            })),
                        },
                        obj.callback,
                    );

                break;
            }

            case 'ffmpeg': {
                if (obj.callback && obj.message) {
                    RtspCamera.executeFFmpeg('-version', obj.message.path)
                        .then(data => {
                            if (data) {
                                const result = data.split('\n')[0];
                                const version = result.match(/version\s+([-\w.]+)/i);
                                if (version) {
                                    this.sendTo(obj.from, obj.command, { version: version[1] }, obj.callback);
                                } else {
                                    this.sendTo(obj.from, obj.command, { version: result }, obj.callback);
                                }
                            } else {
                                this.sendTo(obj.from, obj.command, { error: 'No answer' }, obj.callback);
                            }
                        })
                        .catch(error => this.sendTo(obj.from, obj.command, { error }, obj.callback));
                }
                break;
            }
        }
    }

    startWebServer(): void {
        this.log.debug(`Starting web server on http://127.0.0.1:${this.config.port}/`);
        this.httpServer = createServer(async (req, res) => {
            const clientIp = req.socket.remoteAddress;
            if (!clientIp) {
                res.statusCode = 401;
                res.write('Invalid key');
                res.end();
                this.log.debug(`Invalid key from unknown IP`);
                return;
            }
            const parts = (req.url || '').split('?');
            const camName = parts[0].replace(/^\//, '');
            const query: Record<string, string> = {};
            (parts[1] || '').split('&').forEach(p => {
                const pp = p.split('=');
                query[pp[0]] = decodeURIComponent(pp[1] || '');
            });

            const now = Date.now();
            if (this.bruteForce[clientIp] && now - this.bruteForce[clientIp] < 5000 && query.key !== this.config.key) {
                this.bruteForce[clientIp] = now;
                res.statusCode = 429;
                res.write('Blocked for 5 seconds');
                res.end();
                return;
            }

            if (query.key !== this.config.key) {
                this.bruteForce[clientIp] = Date.now();
                res.statusCode = 401;
                res.write('Invalid key');
                res.end();
                this.log.debug(`Invalid key from ${clientIp}. Expected "${this.config.key}", Received "${query.key}"`);
                return;
            }

            if (
                clientIp !== '127.0.0.1' &&
                clientIp !== '::1/128' &&
                this.config.allowIPs !== true &&
                !this.config.allowIPs.includes(clientIp)
            ) {
                res.statusCode = 401;
                res.write('Invalid key');
                res.end();
                this.log.debug(`Invalid key from ${clientIp}. Expected ${this.config.key}`);
                return;
            }
            const noCache = query.noCache === 'true' || query.noCache === '1';

            if (camName && this.cameraInstances[camName]) {
                try {
                    const data = await this.cameraInstances[camName].getCameraImage({ ...query, noCache });
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
                res.write(`Unknown camera name: ${camName}`);
                res.end();
            }
        });

        this.httpServer.on('clientError', (_err, socket) => socket.end('HTTP/1.1 400 Bad Request\r\n\r\n'));

        this.httpServer.listen({ port: this.config.port || '127', host: '127.0.0.1' }, () =>
            this.log.info(`Server started on 127.0.0.1:${this.config.port}`),
        );
    }

    async syncConfig(): Promise<void> {
        try {
            const files = await this.readDirAsync(this.namespace, '/');
            for (let f = 0; f < files.length; f++) {
                const file = files[f];
                if (!this.config.cameras.find(item => `${item.name}.jpg` === file.file)) {
                    try {
                        await this.delFileAsync(this.namespace, file.file);
                    } catch (e) {
                        this.log.error(`Cannot delete file ${file.file}: ${e}`);
                    }
                }
            }
        } catch {
            // ignore
        }
    }

    // do not convert this function to async, as all cameras must get the first images simultaneously
    fillFiles(): Promise<void> {
        // write all states with actual images one time at the start
        const promises: Promise<void>[] = [];
        Object.keys(this.cameraInstances).forEach(name =>
            promises.push(
                this.cameraInstances[name]
                    .getCameraImage()
                    .catch(e => this.log.error(`Cannot get image: ${e}`))
                    .then(() => {}),
            ),
        );

        return Promise.all(promises).then(() => {});
    }

    async syncData(): Promise<void> {
        const states = await this.getStatesOfAsync('');
        let running;
        let stream;
        // create new states
        for (let c = 0; c < this.config.cameras.length; c++) {
            try {
                running = await this.getObjectAsync(`${this.config.cameras[c].name}.running`);
            } catch {
                // ignore
            }
            if (!running) {
                try {
                    await this.setObjectAsync(`${this.config.cameras[c].name}.running`, {
                        type: 'state',
                        common: {
                            name: `${this.config.cameras[c].name}.running`,
                            type: 'boolean',
                            role: 'indicator',
                            read: true,
                            write: true,
                        },
                        native: {},
                    });
                } catch {
                    // ignore
                }
            }
            const stateRunning = await this.getStateAsync(`${this.config.cameras[c].name}.running`);
            if (stateRunning && stateRunning.val && !stateRunning.ack) {
                this.log.debug(`Start camera ${this.config.cameras[c].name}`);
                try {
                    await this.startRtspStreaming(this.config.cameras[c].name, true);
                } catch (e) {
                    this.log.error(`Cannot start camera ${this.config.cameras[c].name}: ${e}`);
                }
            }
            try {
                stream = await this.getObjectAsync(`${this.config.cameras[c].name}.stream`);
            } catch {
                // ignore
            }
            if (!stream) {
                try {
                    await this.setObjectAsync(`${this.config.cameras[c].name}.stream`, {
                        type: 'state',
                        common: {
                            name: `${this.config.cameras[c].name}.stream`,
                            type: 'string',
                            role: 'indicator',
                            read: true,
                            write: false,
                        },
                        native: {},
                    });
                } catch {
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
                if (!this.config.cameras.find(cam => cam.name === name)) {
                    try {
                        await this.delObjectAsync(states[s]._id);
                    } catch {
                        // ignore
                    }
                }
            }
        }
    }
}

if (require.main !== module) {
    // Export the constructor in compact mode
    module.exports = (options: Partial<AdapterOptions> | undefined) => new CamerasAdapter(options);
} else {
    // otherwise start the instance directly
    (() => new CamerasAdapter())();
}
