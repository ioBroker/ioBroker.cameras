"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This file is a web extension for a global server, and it runs in the context of ioBroker.web.
 * It will be started by ioBroker.web and called by it
 */
const http = __importStar(require("node:http"));
const wrtc_1 = require("@roamhq/wrtc");
const rtspCommon_1 = require("../cameras/rtspCommon");
const Factory_1 = __importDefault(require("../cameras/Factory"));
const node_fs_1 = require("node:fs");
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const ws_1 = require("ws");
const Go2RtcClient_1 = __importStar(require("./Go2RtcClient"));
/** A browser is waiting on the other end, so do not let a silent adapter hang the request forever */
const MESSAGE_TIMEOUT_MS = 10000;
/**
 * Turn whatever was thrown into something readable.
 *
 * `JSON.stringify(new Error('...'))` is `{}` - an Error carries its message on a non-enumerable
 * property. Answering a failed request with `{}` hides exactly the information that is needed.
 *
 * @param error the caught value
 */
function describeError(error) {
    if (typeof error === 'string') {
        return error;
    }
    if (error instanceof Error) {
        return error.message;
    }
    try {
        return JSON.stringify(error);
    }
    catch {
        return String(error);
    }
}
/**
 * Read image by request from global web server
 *
 * @param path name of the camera
 * @param query parameters for the camera
 * @param port Port of internal web server hosted by `cameras` adapter
 */
function getUrl(path, query, port) {
    return new Promise((resolve, reject) => {
        const queryStr = Object.keys(query)
            .map(attr => `${attr}=${encodeURIComponent(query[attr])}`)
            .join('&');
        http.get(`http://127.0.0.1:${port}/${path}${queryStr ? `?${queryStr}` : ''}`, res => {
            const { statusCode } = res;
            const contentType = (res.headers['content-type'] || res.headers['Content-type']);
            if (statusCode !== 200) {
                // Consume response data to free-up memory
                res.resume();
                const error = new Error(`Request Failed. Status Code: ${statusCode}`);
                error.statusCode = statusCode;
                return reject(error);
            }
            const data = [];
            res.on('data', chunk => data.push(chunk));
            res.on('end', () => resolve({ body: Buffer.concat(data), contentType }));
            res.on('error', e => reject(new Error(e.message)));
        }).on('error', e => reject(new Error(e.message)));
    });
}
/**
 * Proxy class
 *
 * Read files from localhost server
 *
 * @param server http or https node.js object
 * @param webSettings settings of the web server, like <pre><code>{secure: settings.secure, port: settings.port}</code></pre>
 * @param adapter web adapter object
 * @param instanceSettings instance object with common and native
 * @param app express application
 */
class ProxyCameras {
    app;
    config;
    namespace;
    adapter;
    /** Socket io server */
    ioServer;
    ffmpegPath = '';
    procs = {};
    /**
     * Client for the go2rtc instance started by the adapter. go2rtc binds its API to localhost
     * only, so the browser must never talk to it directly - everything goes through the routes
     * installed here, which inherit the authentication and the http/https scheme of ioBroker.web.
     */
    go2rtc = null;
    /** Whether the cameras adapter runs on the same host as this web instance */
    sameHost = true;
    constructor(server, webSettings, adapter, instanceSettings, app, io) {
        this.app = app;
        this.config = instanceSettings
            ? instanceSettings.native
            : {};
        this.namespace = instanceSettings ? instanceSettings._id.substring('system.adapter.'.length) : 'cameras';
        this.config.route = this.config.route || `${this.namespace}/`;
        this.config.port = parseInt(this.config.port, 10) || 80;
        // remove leading slash
        if (this.config.route[0] === '/') {
            this.config.route = this.config.route.substring(1);
        }
        this.adapter = adapter;
        this.ioServer = io?.ioServer || null;
        // The private server of the adapter is only reachable over 127.0.0.1, so it is no option when
        // the cameras adapter runs on another host than this web instance
        const cameraHost = instanceSettings?.common?.host;
        const ownHost = adapter?.common?.host;
        this.sameHost = !cameraHost || !ownHost || cameraHost === ownHost;
        if (this.getTransport() === 'message') {
            this.adapter.log.info(`Cameras snapshots are requested via messages${this.sameHost ? '' : ` - ${this.namespace} runs on "${cameraHost}"`}`);
        }
        if (this.config.useGo2rtc) {
            this.go2rtc = new Go2RtcClient_1.default({
                apiPort: this.config.go2rtcApiPort,
                log: this.adapter.log,
            });
            this.adapter.log.info(`Cameras web extension will use go2rtc on ${this.go2rtc.url}`);
        }
        this.config.cameras.forEach(cam => this.oneCamera(cam));
    }
    unload() {
        for (const camera in this.procs) {
            if (this.procs[camera].timer) {
                this.adapter.clearTimeout(this.procs[camera].timer);
            }
            this.stopSource(camera);
        }
        this.procs = {};
        this.go2rtc?.forgetAll();
        return Promise.resolve();
    }
    getFfmpegPath() {
        if (this.ffmpegPath) {
            return this.ffmpegPath;
        }
        this.ffmpegPath = (0, rtspCommon_1.findFFmpegPath)(this.config.ffmpegPath, this.adapter.log);
        if (!(0, node_fs_1.existsSync)(this.ffmpegPath) && !(0, node_fs_1.existsSync)(`${this.ffmpegPath}.exe`)) {
            this.adapter.log.error(`Cannot find ffmpeg in "${this.config.ffmpegPath}"`);
        }
        return this.ffmpegPath;
    }
    async getRtspURL(rule) {
        let tempCamera = null;
        // load camera module
        try {
            tempCamera = (await (0, Factory_1.default)(this.adapter, rule, this.ffmpegPath));
            await tempCamera.init();
            const url = tempCamera.getRtspURL();
            const password = tempCamera.getPassword();
            await tempCamera.destroy();
            tempCamera = null;
            return { password, url };
        }
        catch (e) {
            this.adapter.log.error(`Cannot load "${rule.type}": ${e}`);
            throw new Error(`Cannot load "${rule.type}"`);
        }
    }
    async rtsp2WebRTC(rule, ws, cb) {
        // Does not work!.
        // Request for connection
        const { url, password } = await this.getRtspURL(rule);
        this.getFfmpegPath();
        const socket = ws.ws;
        let proc = null;
        const peer = new wrtc_1.RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });
        const onSocketClose = () => {
            if (proc) {
                proc.kill();
                proc = null;
            }
        };
        peer.onicecandidate = (event) => {
            console.log('onicecandidate:', JSON.stringify(event));
            if (event.candidate) {
                socket.send(JSON.stringify({ type: 'ice-candidate', candidate: event.candidate }));
            }
        };
        peer.onconnectionstatechange = () => {
            console.log('Connection state:', peer.connectionState);
            if (peer.connectionState === 'disconnected') {
                onSocketClose();
            }
        };
        // Inform the web socket that we will handle everything ourselves
        if (ws.enableCustomHandler) {
            // The socket was closed by web instance
            ws.enableCustomHandler(onSocketClose);
        }
        socket?.on('message', async (message) => {
            const data = JSON.parse(message);
            console.log(`Received: ${JSON.stringify(data)}`);
            if (data.type === 'request-offer') {
                const offer = await peer.createOffer();
                await peer.setLocalDescription(offer);
                socket.send(JSON.stringify({ type: 'offer', sdp: offer.sdp }));
            }
            else if (data.type === 'answer') {
                await peer.setRemoteDescription(new wrtc_1.RTCSessionDescription({ type: 'answer', sdp: data.sdp }));
            }
            else if (data.type === 'ice-candidate') {
                console.log('🔹 Received ICE candidate:', data.candidate);
                await peer.addIceCandidate(new wrtc_1.RTCIceCandidate(data.candidate));
            }
        });
        // Client closed the socket
        socket?.on('close', onSocketClose);
        socket?.on('error', () => {
            this.adapter.log.warn(`Error in web socket for ${rule.name}`);
            onSocketClose();
        });
        socket.on('disconnect', () => {
            onSocketClose();
        });
        const params = [
            '-rtsp_transport',
            'tcp',
            '-i',
            url,
            '-c:v',
            'libx265',
            '-preset',
            'ultrafast',
            '-tune',
            'zerolatency',
            '-b:v',
            '800k',
            '-bufsize',
            '800k',
            '-vf',
            'format=yuv420p',
            '-c:a',
            'aac',
            '-f',
            'rtp',
            'rtp://127.0.0.1:5004',
        ];
        /*params = [
            '-rtsp_transport',
            'tcp',
            '-i',
            url,
            '-map',
            '0:v:0',
            '-c:v',
            'libx264',
            '-preset',
            'ultrafast',
            '-tune',
            'zerolatency',
            '-b:v',
            '800k',
            '-bufsize',
            '800k',
            '-vf',
            'format=yuv420p',
            '-f',
            'rtp',
            'rtp://127.0.0.1:5004',
        ];*/
        // Start WebRTC server
        proc = (0, rtspCommon_1.startFFmpeg)(params, this.ffmpegPath, password, this.adapter.log);
        proc.stderr.on('data', data => {
            console.error(`FFmpeg Log: ${data}`);
        });
        if (cb) {
            // inform the caller that we will process all messages
            cb(true);
        }
    }
    onSocketClose(rule, socket, reason) {
        const name = rule.name;
        const entry = this.procs[name];
        if (!entry) {
            return;
        }
        const pos = entry.sockets.indexOf(socket);
        if (pos !== -1) {
            entry.sockets.splice(pos, 1);
        }
        // The source itself died - there is nothing to keep alive
        const sourceDied = reason === 'ffmpeg error' ||
            reason === 'ffmpeg end' ||
            reason === 'go2rtc error' ||
            reason === 'go2rtc end';
        if (entry.sockets.length && !sourceDied) {
            return;
        }
        if (entry.timer) {
            this.adapter.clearTimeout(entry.timer);
            entry.timer = undefined;
        }
        if (sourceDied) {
            this.adapter.log.debug(`Stop source for "${name}", because of "${reason}"`);
            this.stopSource(name);
            delete this.procs[name];
            return;
        }
        // Keep the source alive for a moment so that a page reload does not restart it
        this.adapter.log.debug(`Stop source for "${name}" in 3s, because of "${reason}"`);
        entry.timer = this.adapter.setTimeout(() => {
            const current = this.procs[name];
            if (!current) {
                return;
            }
            current.timer = undefined;
            if (current.sockets.length) {
                this.adapter.log.debug(`Do not stop source for "${name}" because of new socket`);
                return;
            }
            this.adapter.log.debug(`Stop source for "${name}" after 3s timeout`);
            this.stopSource(name);
            delete this.procs[name];
        }, 3000);
    }
    /**
     * Attach a socket to an already running source.
     *
     * Returns false if there is no source yet. Without this the second viewer of the same camera
     * was never added to the list and therefore never received a frame.
     */
    attachSocket(name, socket) {
        if (!this.procs[name]) {
            return false;
        }
        if (!this.procs[name].sockets.includes(socket)) {
            this.procs[name].sockets.push(socket);
        }
        if (this.procs[name].timer) {
            this.adapter.log.debug(`Do not stop source for "${name}" because of new socket!`);
            this.adapter.clearTimeout(this.procs[name].timer);
            this.procs[name].timer = undefined;
        }
        return true;
    }
    /** Stop whichever source is feeding this camera */
    stopSource(name) {
        const entry = this.procs[name];
        if (!entry) {
            return;
        }
        try {
            entry.proc?.kill('SIGKILL');
        }
        catch {
            // ignore
        }
        try {
            entry.go2rtcStream?.destroy();
        }
        catch {
            // ignore
        }
        entry.proc = null;
        entry.go2rtcStream = null;
    }
    /** Pick the frame source: go2rtc if it is configured and reachable, otherwise a local ffmpeg */
    async startSource(rule, socket) {
        if (this.go2rtc) {
            try {
                await this.startGo2Rtc(rule, socket);
                return;
            }
            catch (e) {
                this.adapter.log.warn(`go2rtc stream for "${rule.name}" failed, using ffmpeg instead: ${e}`);
                delete this.procs[rule.name];
            }
        }
        await this.startFFmpeg(rule, socket);
    }
    /**
     * Feed the browser sockets from go2rtc. The frames leave this process in exactly the same
     * shape as with ffmpeg, so the existing vis widget keeps working unchanged.
     */
    async startGo2Rtc(rule, socket) {
        const name = rule.name;
        if (this.attachSocket(name, socket)) {
            return;
        }
        const { url } = await this.getRtspURL(rule);
        this.procs[name] = { proc: null, go2rtcStream: null, sockets: [socket], timer: undefined };
        this.adapter.log.debug(`Starting go2rtc stream for "${name}"`);
        await this.go2rtc.ensureStream(name, url);
        const { stream } = await this.go2rtc.openMjpegStream(name);
        // The camera may have been dropped while we were connecting
        if (!this.procs[name]) {
            stream.destroy();
            return;
        }
        this.procs[name].go2rtcStream = stream;
        const extractor = new Go2RtcClient_1.JpegFrameExtractor();
        stream.on('data', (chunk) => {
            const frames = extractor.push(chunk);
            if (!frames.length || !this.procs[name]) {
                return;
            }
            for (const frame of frames) {
                this.procs[name].sockets.forEach(s => s.send(frame, { binary: true }));
            }
        });
        stream.on('error', (e) => {
            this.adapter.log.debug(`go2rtc stream for "${name}" failed: ${e.message}`);
            this.onSocketClose(rule, socket, 'go2rtc error');
        });
        stream.on('end', () => {
            this.adapter.log.debug(`go2rtc stream for "${name}" ended`);
            this.onSocketClose(rule, socket, 'go2rtc end');
        });
    }
    async startFFmpeg(rule, socket) {
        this.getFfmpegPath();
        const name = rule.name;
        if (!this.procs[name]) {
            const { url } = await this.getRtspURL(rule);
            this.procs[name] = { proc: null, sockets: [], timer: undefined };
            this.adapter.log.debug(`Starting ffmpeg for "${name}"`);
            // Start ffmpeg server
            this.procs[name].proc = (0, fluent_ffmpeg_1.default)(url)
                .setFfmpegPath(this.ffmpegPath)
                .addInputOption('-rtsp_transport', 'tcp')
                .addInputOption('-re')
                .addInputOption('-hide_banner')
                // .addInputOption('-timeout 1000000')
                .addInputOption('-loglevel error')
                .outputFormat('mjpeg')
                .fps(3)
                .addOptions('-update 1')
                .addOptions('-q:v 5');
            this.procs[name].sockets.push(socket);
            this.procs[name].proc?.on('end', (stdout, stderr) => {
                this.adapter.log.debug(`Streaming for ${name} stopped: ${stderr}`);
                this.onSocketClose(rule, socket, 'ffmpeg end');
            });
            this.procs[name].proc?.on('error', (err, stdout, stderr) => {
                this.adapter.log.debug(`Cannot process video for "${name}": ${err.message} ${stderr}`);
                this.onSocketClose(rule, socket, 'ffmpeg error');
            });
            const ffStream = this.procs[name].proc.pipe();
            const extractor = new Go2RtcClient_1.JpegFrameExtractor();
            ffStream.on('data', (chunk) => {
                const frames = extractor.push(chunk);
                if (!frames.length || !this.procs[name]) {
                    return;
                }
                for (const frame of frames) {
                    this.procs[name].sockets.forEach(s => s.send(frame, { binary: true }));
                }
            });
        }
        else {
            this.attachSocket(name, socket);
        }
    }
    /**
     * Relay the go2rtc signalling WebSocket.
     *
     * The browser must not talk to go2rtc directly: its API is bound to localhost, and a page
     * served over https may not open a ws:// connection. Going through this route means the
     * connection inherits the scheme (ws/wss) and the authentication of ioBroker.web.
     *
     * The payload is passed through untouched, so offer/answer/candidate handling stays entirely
     * between the browser and go2rtc.
     */
    async webrtcSignalling(rule, ws, cb) {
        const client = this.go2rtc;
        const socket = ws.ws;
        if (!client) {
            this.adapter.log.warn(`WebRTC requested for "${rule.name}" but go2rtc is not enabled`);
            socket?.close();
            cb?.(true);
            return;
        }
        const { url } = await this.getRtspURL(rule);
        await client.ensureStream(rule.name, url);
        const upstream = new ws_1.WebSocket(client.getWsUrl(rule.name));
        const pending = [];
        let closed = false;
        const closeBoth = (reason) => {
            if (closed) {
                return;
            }
            closed = true;
            this.adapter.log.debug(`WebRTC relay for "${rule.name}" closed: ${reason}`);
            try {
                upstream.close();
            }
            catch {
                // ignore
            }
            try {
                socket?.close();
            }
            catch {
                // ignore
            }
        };
        upstream.on('open', () => {
            while (pending.length) {
                upstream.send(pending.shift());
            }
        });
        upstream.on('message', (data, isBinary) => socket?.send(isBinary ? data : data.toString()));
        upstream.on('error', (e) => closeBoth(`go2rtc error: ${e.message}`));
        upstream.on('close', () => closeBoth('go2rtc closed'));
        socket?.on('message', (data, isBinary) => {
            const payload = isBinary ? data : data.toString();
            if (upstream.readyState === ws_1.WebSocket.OPEN) {
                upstream.send(payload);
            }
            else {
                pending.push(payload);
            }
        });
        socket?.on('close', () => closeBoth('browser closed'));
        socket?.on('error', (e) => closeBoth(`browser error: ${e.message}`));
        if (ws.enableCustomHandler) {
            ws.enableCustomHandler(() => closeBoth('web server stopping'));
        }
        // We handle every message on this socket ourselves
        cb?.(true);
    }
    async rtsp2mjpeg(rule, ws, cb) {
        // Request for connection
        this.adapter.log.debug(`New socket connection for "${rule.name}"`);
        const socket = ws.ws;
        await this.startSource(rule, socket);
        // Inform the web socket that we will handle everything ourselves
        if (ws.enableCustomHandler) {
            // The socket was closed by web instance
            ws.enableCustomHandler(() => this.onSocketClose(rule, socket, 'web server stopping'));
        }
        // Client closed the socket
        socket?.on('close', () => {
            this.adapter.log.warn(`Socket connection was closed for ${rule.name}`);
            this.onSocketClose(rule, socket, 'socket connection closed');
        });
        socket?.on('error', (error) => {
            this.adapter.log.warn(`Error in web socket for ${rule.name}: ${error.toString()}`);
            this.onSocketClose(rule, socket, 'socket connection error');
        });
        socket.on('disconnect', () => {
            this.adapter.log.warn(`Socket disconnection for ${rule.name}`);
            this.onSocketClose(rule, socket, 'socket disconnection');
        });
        if (cb) {
            // inform the caller that we will process all messages
            cb(true);
        }
    }
    /** Pipe the go2rtc MJPEG stream to an express response */
    async streamMjpeg(rule, res) {
        const client = this.go2rtc;
        const { url } = await this.getRtspURL(rule);
        await client.ensureStream(rule.name, url);
        const { stream, contentType } = await client.openMjpegStream(rule.name);
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'no-store, private');
        // Stop pulling from the camera as soon as the browser goes away
        res.on('close', () => stream.destroy());
        stream.on('error', () => res.end());
        stream.pipe(res);
    }
    /**
     * Re-read the secret key from the instance object.
     *
     * This class keeps the copy of `instanceSettings.native` it was constructed with, but it lives in
     * the ioBroker.web process: when the key is changed, the cameras adapter restarts with the new one
     * while this copy stays behind, and every request is answered with "Invalid key" until ioBroker.web
     * happens to be restarted too. Refreshing after a rejected request repairs that by itself.
     *
     * @returns true if the key actually changed, i.e. a retry is worth it
     */
    async refreshKey() {
        try {
            const obj = await this.adapter.getForeignObjectAsync(`system.adapter.${this.namespace}`);
            const key = obj?.native?.key;
            if (key !== undefined && key !== this.config.key) {
                this.adapter.log.info(`Key of ${this.namespace} has changed, using the new one`);
                this.config.key = key;
                return true;
            }
        }
        catch (e) {
            this.adapter.log.debug(`Cannot re-read the configuration of ${this.namespace}: ${e}`);
        }
        return false;
    }
    /**
     * Which transport to use for a still image.
     *
     * Both work, because the adapter runs in a different process:
     *
     *  - `http`: a request to the private server of the adapter on 127.0.0.1.
     *  - `message`: `sendTo`, which travels through the states database. It needs no open port, so no
     *    key and no IP allow list are involved, and it is the only one that works when ioBroker.web
     *    runs on a different host.
     *
     * `http` is the default because messages are a lot more expensive. Measured end to end through
     * ioBroker.web against a jsonl database, median per request:
     *
     * | picture  | http    | message |
     * | -------- | ------- | ------- |
     * | 42 KB    | 2.7 ms  | 34.5 ms |
     * | 406 KB   | 4.6 ms  | 47.3 ms |
     * | 1.2 MB   | 9.5 ms  | 85.3 ms |
     *
     * Most of that is a fixed ~30 ms for the database round trip, and the payload additionally goes
     * through the states database base64 encoded - a load every other adapter shares.
     */
    getTransport() {
        if (this.config.snapshotTransport === 'http' || this.config.snapshotTransport === 'message') {
            return this.config.snapshotTransport;
        }
        return this.sameHost ? 'http' : 'message';
    }
    /**
     * Fetch a still image from the adapter over the transport picked by {@link getTransport}.
     *
     * @param name the camera name
     * @param query parameters of the browser request
     */
    async getSnapshot(name, query) {
        if (this.getTransport() === 'http') {
            try {
                return await getUrl(name, query, this.config.port);
            }
            catch (error) {
                // A 401 most likely means our cached key is stale - refresh it and try once more
                if (error?.statusCode === 401 && (await this.refreshKey())) {
                    query.key = this.config.key;
                    return getUrl(name, query, this.config.port);
                }
                throw error;
            }
        }
        const answer = (await this.sendToAdapter('image', {
            name,
            width: parseInt(query.w || '0', 10) || undefined,
            height: parseInt(query.h || '0', 10) || undefined,
            angle: parseInt(query.angle || '0', 10) || undefined,
            noCache: query.noCache === 'true' || query.noCache === '1',
            // A browser request must not rewrite the stored <name>.jpg on every single frame
            noFileWrite: true,
        }));
        if (answer?.error) {
            throw new Error(answer.error);
        }
        if (!answer?.data) {
            throw new Error('No data from adapter');
        }
        return { body: Buffer.from(answer.data, 'base64'), contentType: answer.contentType || 'image/jpeg' };
    }
    /**
     * `sendTo` with a timeout.
     *
     * Unlike an HTTP request, a message to a stopped adapter is simply never answered - without this
     * the browser request would hang until it gives up on its own.
     *
     * @param command the message command
     * @param message the payload
     */
    sendToAdapter(command, message) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error(`No answer from ${this.namespace} within ${MESSAGE_TIMEOUT_MS} ms`));
            }, MESSAGE_TIMEOUT_MS);
            try {
                this.adapter.sendTo(this.namespace, command, message, answer => {
                    clearTimeout(timer);
                    resolve(answer);
                });
            }
            catch (e) {
                clearTimeout(timer);
                reject(e);
            }
        });
    }
    oneCamera(rule) {
        this.adapter.log.info(`Install extension on /${this.config.route}${rule.name}`);
        this.app.use(`/${this.config.route}${rule.name}`, (req, res) => {
            const parts = req.url.split('?');
            const query = {};
            (parts[1] || '').split('&').forEach(p => {
                if (p?.includes('=')) {
                    const pp = p.split('=');
                    query[decodeURIComponent(pp[0])] = decodeURIComponent(pp[1] || '');
                }
            });
            query.key = this.config.key;
            // Continuous MJPEG straight from go2rtc, usable in a plain <img src="...">.
            // Proxied on purpose - the go2rtc API stays bound to localhost.
            if (this.go2rtc && req.path.match(/^\/stream\.mjpeg/)) {
                this.streamMjpeg(rule, res).catch(error => this.adapter.log.debug(`MJPEG stream for "${rule.name}" ended: ${error}`));
                return;
            }
            if (req.path.match(/^\/streaming/)) {
                getUrl(rule.name + req.path, query, this.config.port)
                    .then(file => {
                    const headers = {
                        'Access-Control-Allow-Origin': '*' /* @dev First, read about security */,
                        'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
                        'Access-Control-Max-Age': 2592000, // 30 days
                        /** add other headers as per requirement */
                    };
                    res.set(headers);
                    if (req.method === 'OPTIONS') {
                        res.status(204);
                        res.end();
                        return;
                    }
                    res.setHeader('Content-type', file.contentType);
                    res.setHeader('Cache-Control', 'no-store, private');
                    res.status(200).send(file.body || '');
                })
                    .catch(error => res.status(500).send(describeError(error)));
                return;
            }
            this.getSnapshot(rule.name, query)
                .then(file => {
                res.setHeader('Content-type', file.contentType);
                // Every request returns a freshly grabbed frame. Without this express only sends an
                // ETag, which leaves it to the browser whether it revalidates at all - a plain
                // <img src="/cameras.0/cam1"> could then keep showing the first frame it ever got.
                res.setHeader('Cache-Control', 'no-store, private');
                res.status(200).send(file.body || '');
            })
                .catch(error => res.status(500).send(describeError(error)));
        });
        // Install web socket route
        if (this.ioServer?.addWsRoute && rule.rtsp && rule.enabled !== false) {
            this.adapter.log.info(`Install web socket extension on /${this.config.route}${rule.name}`);
            this.ioServer.addWsRoute(`/${this.config.route}${rule.name}`, (ws, cb) => {
                void this.rtsp2mjpeg(rule, ws, cb);
            });
            // Separate exact path - the route table matches the pathname exactly, no wildcards
            if (this.go2rtc) {
                this.adapter.log.info(`Install WebRTC signalling on /${this.config.route}${rule.name}/webrtc`);
                this.ioServer.addWsRoute(`/${this.config.route}${rule.name}/webrtc`, (ws, cb) => {
                    this.webrtcSignalling(rule, ws, cb).catch(e => {
                        this.adapter.log.warn(`Cannot start WebRTC for "${rule.name}": ${e}`);
                        cb?.(true);
                    });
                });
            }
        }
    }
}
exports.default = ProxyCameras;
//# sourceMappingURL=web.js.map