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
                return reject(new Error(`Request Failed. Status Code: ${statusCode}`));
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
        this.config.cameras.forEach(cam => this.oneCamera(cam));
    }
    unload() {
        for (const camera in this.procs) {
            try {
                this.procs[camera].proc?.kill('SIGKILL');
            }
            catch {
                // ignore
            }
        }
        this.procs = {};
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
        if (this.procs[rule.name]) {
            const pos = this.procs[rule.name].sockets.indexOf(socket);
            if (pos !== -1) {
                this.procs[rule.name].sockets.splice(pos, 1);
                if (!this.procs[rule.name].sockets.length) {
                    if (this.procs[rule.name].proc) {
                        if (this.procs[rule.name].timer) {
                            this.adapter.clearTimeout(this.procs[rule.name].timer);
                        }
                        if (reason !== 'ffmpeg error' && reason !== 'ffmpeg end') {
                            this.adapter.log.debug(`Stop ffmpeg for "${rule.name}" in 3s, because of "${reason}"`);
                            this.procs[rule.name].timer = this.adapter.setTimeout(() => {
                                this.procs[rule.name].timer = undefined;
                                // Check if there are still no sockets
                                if (!this.procs[rule.name].sockets.length) {
                                    this.adapter.log.debug(`Stop ffmpeg for "${rule.name}" after 3s timeout`);
                                    try {
                                        this.procs[rule.name].proc?.kill('SIGKILL');
                                    }
                                    catch {
                                        // ignore
                                    }
                                    delete this.procs[rule.name];
                                }
                                else {
                                    this.adapter.log.debug(`Do not stop ffmpeg for "${rule.name}" because of new socket`);
                                }
                            }, 3000);
                        }
                        else {
                            this.adapter.log.debug(`Stop ffmpeg for "${rule.name}", because of "${reason}"`);
                            try {
                                this.procs[rule.name].proc?.kill('SIGKILL');
                            }
                            catch {
                                // ignore
                            }
                            delete this.procs[rule.name];
                            // restart ffmpeg
                            void this.startFFmpeg(rule, socket);
                        }
                    }
                    else {
                        delete this.procs[rule.name];
                    }
                }
            }
        }
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
            let chunks = Buffer.from([]);
            let count = 0;
            ffStream.on('data', (chunk) => {
                if (chunk.length > 2 && chunk[0] === 0xff && chunk[1] === 0xd8) {
                    count++;
                    console.log(`Send chunk ${chunks.byteLength} (${count})`);
                    this.procs[name].sockets.forEach(s => s.send(chunks, { binary: true }));
                    chunks = chunk;
                }
                else {
                    console.log(`Received chunk ${chunk.byteLength} of ${count}`);
                    chunks = Buffer.concat([chunks, chunk]);
                }
            });
        }
        else if (this.procs[name].timer) {
            // Disable stop timer
            this.adapter.log.debug(`Do not stop ffmpeg for "${name}" because of new socket!`);
            this.adapter.clearTimeout(this.procs[name].timer);
            this.procs[name].timer = undefined;
        }
    }
    async rtsp2mjpeg(rule, ws, cb) {
        // Request for connection
        this.adapter.log.debug(`New socket connection for "${rule.name}"`);
        const socket = ws.ws;
        await this.startFFmpeg(rule, socket);
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
                    res.status(200).send(file.body || '');
                })
                    .catch(error => res.status(500).send(typeof error !== 'string' ? JSON.stringify(error) : error));
                return;
            }
            getUrl(rule.name, query, this.config.port)
                .then(file => {
                res.setHeader('Content-type', file.contentType);
                res.status(200).send(file.body || '');
            })
                .catch(error => res.status(500).send(typeof error !== 'string' ? JSON.stringify(error) : error));
        });
        // Install web socket route
        if (this.ioServer?.addWsRoute && rule.rtsp && rule.enabled !== false) {
            this.adapter.log.info(`Install web socket extension on /${this.config.route}${rule.name}`);
            this.ioServer.addWsRoute(`/${this.config.route}${rule.name}`, (ws, cb) => {
                void this.rtsp2mjpeg(rule, ws, cb);
            });
        }
    }
}
exports.default = ProxyCameras;
//# sourceMappingURL=web.js.map