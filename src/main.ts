import { Adapter, type AdapterOptions } from '@iobroker/adapter-core';
import http from 'node:http';
import sharp, { type OverlayOptions } from 'sharp';
import { existsSync, mkdirSync } from 'node:fs';
import { normalize } from 'node:path';
import moment from 'moment';
import decompress from 'decompress';
import type {
    CameraConfigAny,
    CameraConfigRtsp,
    CameraName,
    CameraRequestInternal,
    CamerasAdapterConfig,
    ProcessData,
    ProcessDataEx,
} from './types';
import type GenericCamera from './cameras/GenericCamera';
import type {
    UserInterfaceClientSubscribeReturnType,
    UserInterfaceSubscribeInfo,
    UserInterfaceUnsubscribeInfo,
} from '@iobroker/types/build/types';
import createCamera from './cameras/Factory';
import { findFFmpegPath, getFFmpegVersion } from './cameras/rtspCommon';
import Go2RtcServer from './lib/Go2RtcServer';

const WIN_FFMPEG_VERSION = '2025-02-02-git-957eb2323a-full_build-www.gyan.dev';

type SubscribeData = {
    type: string;
    sid: string;
    data?: { width?: number };
};

type UnsubscribeData = {
    type: string[];
    sid: string;
    reason: 'client';
};

export class CamerasAdapter extends Adapter {
    private lang: ioBroker.Languages = 'en';
    private streamSubscribes: { camera: string; clientId: string; ts: number }[] = [];
    declare public config: CamerasAdapterConfig;
    private bForceInterval: NodeJS.Timeout | null = null;
    private server: http.Server | null = null;
    private cache: { [cameraName: CameraName]: { data: ProcessDataEx; ts: number; params: string } } = {};
    private allowIPs: true | string[] = true;
    private cameras: Record<CameraName, GenericCamera> = {};
    private bForce: { [ip: string]: number } = {};
    private ffmpegPath = '';
    private go2rtc: Go2RtcServer | null = null;

    public constructor(options: Partial<AdapterOptions> = {}) {
        super({
            ...options,
            name: 'cameras',
            uiClientSubscribe: async (
                subscribeInfo: UserInterfaceSubscribeInfo,
            ): Promise<UserInterfaceClientSubscribeReturnType> => {
                return await this.onClientSubscribe(subscribeInfo);
            },
            uiClientUnsubscribe: (data: UserInterfaceUnsubscribeInfo) => {
                const { clientId, message, reason } = data;
                if (reason === 'client') {
                    this.log.debug(`GUI Client "${clientId} disconnected`);
                } else {
                    this.log.debug(`Client "${clientId}: ${reason}`);
                }
                this.onClientUnsubscribe(clientId, message);
            },
            unload: callback => this.onUnload(callback),
            message: obj => this.onMessage(obj),
            stateChange: (id, state) => this.onStateChange(id, state),
            ready: () => this.main(),
        });
    }

    onStateChange(id: string, state: ioBroker.State | null | undefined): void {
        if (state && !state.ack && id.endsWith('.running') && id.startsWith(this.namespace)) {
            const parts = id.split('.');
            const camera: CameraName = parts[parts.length - 2];
            if (this.cameras[camera]) {
                if (state.val) {
                    try {
                        this.cameras[camera]
                            .startWebStream()
                            .catch(e => this.log.error(`Cannot start camera ${camera}: ${e}`));
                    } catch (e) {
                        this.log.error(`Cannot start camera ${camera}: ${e}`);
                    }
                } else {
                    this.log.debug(`Stop camera ${camera}`);
                    this.cameras[camera]
                        .stopWebStream()
                        .catch(e => this.log.error(`Cannot stop camera ${camera}: ${e}`));
                }
            }
        }
    }

    onUnload(cb: () => void): void {
        if (this.bForceInterval) {
            clearInterval(this.bForceInterval);
            this.bForceInterval = null;
        }
        try {
            if (this.server) {
                this.server.close(() => this.unloadCameras(cb));
            } else {
                this.unloadCameras(cb);
            }
        } catch {
            this.unloadCameras(cb);
        }
    }

    async testCamera(item: CameraRequestInternal): Promise<ProcessData | null> {
        if (item?.type) {
            let result: ProcessData | null = null;
            let tempCamera: GenericCamera;
            // load camera module
            try {
                tempCamera = await createCamera(this, item as CameraConfigAny, this.ffmpegPath);
            } catch (e) {
                this.log.error(`Cannot load "${item.type}": ${e}`);
                throw new Error(`Cannot load "${item.type}"`);
            }

            // get image
            let data = await tempCamera.process();
            if (data?.body) {
                data = await this.resizeImage(data, item.width, item.height);
                data = await this.rotateImage(data, item.angle);
                data = await this.addTextToImage(
                    data,
                    item.addTime ? this.config.dateFormat || 'LTS' : undefined,
                    item.title,
                );
                result = {
                    body: `data:${data.contentType};base64,${data.body.toString('base64')}`,
                    contentType: data.contentType,
                };
                await tempCamera.destroy();
            } else {
                await tempCamera.destroy();
                throw new Error(`No answer`);
            }

            // unload camera
            return result;
        }

        throw new Error('Unknown type or invalid parameters');
    }

    async getCameraImage(cam: CameraRequestInternal): Promise<Buffer | string> {
        if (this.cameras[cam.name]) {
            this.log.debug(`Request ${cam.type} ${cam.name}`);

            const params = {
                w: parseInt(cam.width as unknown as string, 10) || 0,
                h: parseInt(cam.height as unknown as string, 10) || 0,
                angle: parseInt(cam.angle as unknown as string, 10) || 0,
            };

            if (
                !cam.noCache &&
                this.cache[cam.name] &&
                this.cache[cam.name].ts > Date.now() &&
                this.cache[cam.name].params === JSON.stringify(params)
            ) {
                this.log.debug(`Take from cache ${cam.name} ${cam.type}`);
                return this.cache[cam.name].data.body;
            }

            let data = await this.cameras[cam.name].process();
            if (data) {
                data = await this.resizeImage(data, params.w, params.h);
                data = await this.rotateImage(data, params.angle);
                data = await this.addTextToImage(
                    data,
                    cam.addTime ? this.config.dateFormat || 'LTS' : undefined,
                    cam.title,
                );

                if (cam.cacheTimeout) {
                    this.cache[cam.name] = {
                        data,
                        ts: Date.now() + (cam.cacheTimeout as number),
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

    async onClientSubscribe(msg: { clientId: string; message: ioBroker.Message }): Promise<{
        accepted: boolean;
        heartbeat?: number;
        error?: string;
    }> {
        this.log.debug(`Subscribe from ${msg.clientId}: ${JSON.stringify(msg.message)}`);
        if (!this.streamSubscribes) {
            this.log.error(`Adapter is still initializing`);
            return { accepted: false, error: `Adapter is still initializing` };
        }

        const message = msg.message.message as SubscribeData;

        if (message.type?.startsWith('startCamera/')) {
            const cameraName = message.type.substring('startCamera/'.length);
            // start camera with obj.message.data
            if (!this.streamSubscribes.find(s => s.camera === cameraName)) {
                this.log.debug(`Start camera "${cameraName}"`);
            }

            if (this.cameras[cameraName]) {
                try {
                    await this.cameras[cameraName].startWebStream(message.data);
                } catch (e) {
                    this.log.error(`Cannot start camera on subscribe "${cameraName}": ${e}`);
                    return { accepted: false, error: `Cannot start camera on subscribe "${cameraName}": ${e}` };
                }
            }

            // inform GUI that camera is started
            const sub = this.streamSubscribes.find(s => s.clientId === msg.clientId && s.camera === cameraName);
            if (!sub) {
                this.streamSubscribes.push({ clientId: msg.clientId, camera: cameraName, ts: Date.now() });
            } else {
                sub.ts = Date.now();
            }

            return { accepted: true, heartbeat: 60000 };
        }

        return { accepted: false, error: 'Unknown message type' };
    }

    onClientUnsubscribe(clientId: string, obj: ioBroker.Message | undefined): void {
        this.log.debug(`Unsubscribe from ${clientId}: ${JSON.stringify(obj?.message)}`);
        if (!this.streamSubscribes) {
            return;
        }
        const message: UnsubscribeData | undefined = obj?.message as UnsubscribeData | undefined;
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

    async onMessage(obj: ioBroker.Message): Promise<void> {
        if (!obj?.command) {
            return;
        }

        switch (obj.command) {
            case 'test': {
                try {
                    const data = await this.testCamera(obj.message);
                    obj.callback && this.sendTo(obj.from, obj.command, data, obj.callback);
                } catch (e) {
                    obj.callback && this.sendTo(obj.from, obj.command, { error: e.toString() }, obj.callback);
                }
                break;
            }

            case 'image': {
                if (obj.message) {
                    const cameraConfig = this.config.cameras.find(cam => cam.name === obj.message.name);
                    if (cameraConfig && obj.callback) {
                        // Take the stored camera configuration and let the request override
                        // width/height/angle/noCache
                        const cam: CameraRequestInternal = Object.assign(
                            JSON.parse(JSON.stringify(cameraConfig)),
                            obj.message,
                        );

                        try {
                            const data = await this.getCameraImage(cam);
                            this.sendTo(
                                obj.from,
                                obj.command,
                                { data: Buffer.from(data).toString('base64'), contentType: 'image/jpeg' },
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
                    try {
                        const version = getFFmpegVersion(obj.message.path, this.log);
                        this.sendTo(obj.from, obj.command, { version: version || 'No answer' }, obj.callback);
                    } catch (error) {
                        this.sendTo(obj.from, obj.command, { error: (error as Error).toString() }, obj.callback);
                    }
                }
                break;
            }
        }
    }

    unloadCameras(cb: () => void): void {
        const promises: Promise<void>[] = [];

        if (this.go2rtc) {
            const server = this.go2rtc;
            this.go2rtc = null;
            promises.push(server.stop().catch(e => this.log.error(`Cannot stop go2rtc: ${e}`)));
        }

        this.config.cameras.forEach(item => {
            if (item?.type && this.cameras[item.name]) {
                try {
                    promises.push(
                        this.cameras[item.name]
                            .destroy()
                            .catch(e => this.log.error(`Cannot unload "${item.type}": ${e}`)),
                    );
                } catch (e) {
                    this.log.error(`Cannot unload "${item.type}": ${e}`);
                }
            }
        });

        void Promise.all(promises).then(() => cb && cb());
    }

    async resizeImage(
        data: ProcessDataEx,
        width: number | undefined,
        height: number | undefined,
    ): Promise<ProcessData> {
        if (!width && !height) {
            const body = await sharp(data.body).jpeg().toBuffer();
            return { body, contentType: 'image/jpeg' };
        }

        const body = await sharp(data.body)
            .resize(width || null, height || null)
            .jpeg()
            .toBuffer();
        return { body, contentType: 'image/jpeg' };
    }

    async rotateImage(data: ProcessDataEx, angle: number | undefined): Promise<ProcessData> {
        if (!angle) {
            const body = await sharp(data.body).jpeg().toBuffer();
            return { body, contentType: 'image/jpeg' };
        }

        const body = await sharp(data.body).rotate(angle).jpeg().toBuffer();
        return { body, contentType: 'image/jpeg' };
    }

    async addTextToImage(
        data: ProcessDataEx,
        dateFormat: string | undefined,
        title: string | null | undefined,
    ): Promise<ProcessData> {
        if (!dateFormat && !title) {
            return data;
        }
        const date = dateFormat ? moment().locale(this.lang).format(dateFormat) : '';

        data.metadata = data.metadata || (await sharp(data.body).metadata());

        const layers: OverlayOptions[] = [];

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

        return sharp(data.body)
            .composite(layers)
            .jpeg()
            .toBuffer()
            .then(body => ({ body, contentType: 'image/jpeg' }));
    }

    startWebServer(): void {
        this.log.debug(`Starting web server on http://${this.config.bind}:${this.config.port}/`);
        this.server = http.createServer(async (req, res) => {
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
            const query: {
                key?: string;
                noCache?: 'true' | '1' | 'false' | '0';
                w?: string;
                h?: string;
                angle?: string;
            } = {};
            (parts[1] || '').split('&').forEach(p => {
                const pp = p.split('=');
                (query as Record<string, string>)[decodeURIComponent(pp[0])] = decodeURIComponent(pp[1] || '');
            });

            const now = Date.now();
            if (this.bForce[clientIp] && now - this.bForce[clientIp] < 5000 && query.key !== this.config.key) {
                this.bForce[clientIp] = now;
                res.statusCode = 429;
                res.write('Blocked for 5 seconds');
                res.end();
                return;
            }

            if (query.key !== this.config.key) {
                this.bForce[clientIp] = Date.now();
                res.statusCode = 401;
                res.write('Invalid key');
                res.end();
                this.log.debug(`Invalid key from ${clientIp}. Expected ${this.config.key}`);
                return;
            }

            if (
                clientIp !== '127.0.0.1' &&
                clientIp !== '::1/128' &&
                this.allowIPs !== true &&
                !this.allowIPs.includes(clientIp)
            ) {
                res.statusCode = 401;
                res.write('Invalid key');
                res.end();
                this.log.debug(`Invalid key from ${clientIp}. Expected ${this.config.key}`);
                return;
            }

            // A camera that failed to initialize has no entry in this.cameras
            const cam = this.config.cameras.find(c => this.cameras[c.name]?.path === url);

            const ignoreCache = query.noCache === 'true' || query.noCache === '1';

            if (cam) {
                if (this.cameras[cam.name]) {
                    let data;
                    try {
                        const params = {
                            w: parseInt(query.w || '0', 10) || 0,
                            h: parseInt(query.h || '0', 10) || 0,
                            angle: parseInt(query.angle || '0', 10) || 0,
                        };
                        if (
                            !ignoreCache &&
                            this.cache[cam.name] &&
                            this.cache[cam.name].ts > Date.now() &&
                            this.cache[cam.name].params === JSON.stringify(params)
                        ) {
                            this.log.debug(`Take from cache ${cam.name} ${cam.type}`);
                            data = this.cache[cam.name].data;
                        } else {
                            this.log.debug(`Request ${cam.name}`);
                            data = await this.cameras[cam.name].process();
                            data = await this.resizeImage(data, params.w, params.h);
                            data = await this.rotateImage(data, params.angle);
                            data = await this.addTextToImage(
                                data,
                                cam.addTime ? this.config.dateFormat || 'LTS' : undefined,
                                cam.title,
                            );
                            if (cam.cacheTimeout) {
                                this.cache[cam.name] = {
                                    data,
                                    ts: Date.now() + (cam.cacheTimeout as number),
                                    params: JSON.stringify(params),
                                };
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

        this.server.on('clientError', (_err, socket) => socket.end('HTTP/1.1 400 Bad Request\r\n\r\n'));

        this.server.listen({ port: this.config.port || 8200, host: this.config.bind }, () =>
            this.log.info(`Server started on ${this.config.bind}:${this.config.port}`),
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
                        this.log.error(`Cannot delete file ${this.namespace}/${file.file}: ${e}`);
                    }
                }
            }
        } catch {
            // ignore
        }
    }

    async fillFiles(): Promise<void> {
        // write all states with actual images one time at the start
        const promises = this.config.cameras.map(cam =>
            this.getCameraImage(cam as CameraRequestInternal).catch((e: Error) =>
                this.log.error(`Cannot get image: ${e}`),
            ),
        );

        await Promise.all(promises);
    }

    async syncData(): Promise<void> {
        const states = await this.getStatesOfAsync('');
        // create new states
        for (const cam of this.config.cameras) {
            let running;
            try {
                running = await this.getObjectAsync(`${cam.name}.running`);
            } catch {
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
                } catch {
                    // ignore
                }
            }

            const stateRunning = await this.getStateAsync(`${cam.name}.running`);
            // Start a web stream if desired, e.g. after adapter restart
            if (stateRunning?.val && !stateRunning.ack) {
                this.log.debug(`Start camera ${cam.name}`);
                try {
                    await this.cameras[cam.name].startWebStream();
                } catch (e) {
                    this.log.error(`Cannot start camera ${cam.name}: ${e}`);
                }
            }

            // Create stream object
            let stream;
            try {
                stream = await this.getObjectAsync(`${cam.name}.stream`);
            } catch {
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

    async main(): Promise<void> {
        this.streamSubscribes = [];

        // read secret key
        const systemConfig = await this.getForeignObjectAsync('system.config');
        // store system secret
        this.lang = this.config.language || systemConfig?.common.language || 'en';

        const promises: Promise<void>[] = [];

        this.config.tempPath = normalize(this.config.tempPath || `${__dirname}/../snapshots`).replace(/\\/g, '/');
        this.config.defaultCacheTimeout = parseInt(this.config.defaultCacheTimeout as string, 10) || 0;

        const isAnyRtsp = this.config.cameras.find(
            it => it.enabled !== false && (it as CameraConfigRtsp).ip && (it.type === 'rtsp' || it.rtsp),
        );

        if (isAnyRtsp) {
            if (
                !this.config.ffmpegPath &&
                process.platform === 'win32' &&
                !existsSync(`${__dirname}/../win-ffmpeg.exe`)
            ) {
                this.log.info('Decompress ffmpeg.exe...');
                await decompress(`${__dirname}/../win-ffmpeg.zip`, `${__dirname}/../`);
                this.ffmpegPath = findFFmpegPath(this.config.ffmpegPath, this.log);
            } else {
                this.ffmpegPath = findFFmpegPath(this.config.ffmpegPath, this.log);
                const version = getFFmpegVersion(this.ffmpegPath, this.log);
                if (version !== WIN_FFMPEG_VERSION) {
                    // extract
                    this.log.info('Decompress ffmpeg.exe...');
                    await decompress(`${__dirname}/../win-ffmpeg.zip`, `${__dirname}/../`);
                }
            }

            if (!existsSync(this.ffmpegPath) && !existsSync(`${this.ffmpegPath}.exe`)) {
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

        this.config.cameras = this.config.cameras.filter(cam => cam.enabled !== false);

        // Optional: one go2rtc process for all RTSP cameras instead of one ffmpeg per snapshot.
        // If it does not come up, the cameras silently keep using ffmpeg.
        if (this.config.useGo2rtc && isAnyRtsp) {
            const server = new Go2RtcServer(this, {
                binaryPath: this.config.go2rtcPath,
                apiPort: this.config.go2rtcApiPort,
                rtspPort: this.config.go2rtcRtspPort,
                tempPath: this.config.tempPath,
                ffmpegPath: this.ffmpegPath,
            });
            try {
                this.go2rtc = (await server.start()) ? server : null;
            } catch (e) {
                this.log.warn(`Cannot start go2rtc: ${e as Error}`);
                this.go2rtc = null;
            }
        }

        // init all required camera providers
        this.config.cameras.forEach(item => {
            if (item?.type) {
                if (item.cacheTimeout === undefined || item.cacheTimeout === null || item.cacheTimeout === '') {
                    item.cacheTimeout = this.config.defaultCacheTimeout;
                } else {
                    item.cacheTimeout = parseInt(item.cacheTimeout as string, 10) || 0;
                }

                try {
                    promises.push(
                        createCamera(this, item, this.ffmpegPath, this.streamSubscribes, this.go2rtc)
                            .then(camera => {
                                this.cameras[camera.getName()] = camera;
                            })
                            .catch(e => this.log.error(`Cannot init camera ${item.name}: ${e && e.toString()}`)),
                    );
                } catch (e) {
                    this.log.error(`Cannot load "${item.type}": ${e}`);
                }
            }
        });

        if (typeof this.config.allowIPs === 'string') {
            this.allowIPs = this.config.allowIPs
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
}

if (require.main !== module) {
    // Export the constructor in compact mode
    module.exports = (options: Partial<AdapterOptions> | undefined) => new CamerasAdapter(options);
} else {
    // otherwise start the instance directly
    (() => new CamerasAdapter())();
}
