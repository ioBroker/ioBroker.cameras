/**
 * This file is a web extension for a global server, and it runs in the context of ioBroker.web.
 * It will be started by ioBroker.web and called by it
 */
import * as http from 'node:http';
import type { Server as HttpServer } from 'node:http';
import type { Server as HttpsServer } from 'node:https';
import type { IOSocketClass, SocketWS } from 'iobroker.ws';
import type { Express, Response as ExpressResponse } from 'express';
import type { CameraConfigAny, CamerasAdapterConfig } from '../types';
import type { Socket as WebSocketClient } from '@iobroker/ws-server';
import type { WebSocket } from 'ws';
import { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate } from '@roamhq/wrtc';
import { findFFmpegPath, startFFmpeg } from '../cameras/rtspCommon';
import createCamera from '../cameras/Factory';
import type GenericRtspCamera from '../cameras/GenericRtspCamera';
import { existsSync } from 'node:fs';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import ffmpeg, { type FfmpegCommand } from 'fluent-ffmpeg';
import { WebSocket as UpstreamWebSocket } from 'ws';
import Go2RtcClient, { JpegFrameExtractor } from './Go2RtcClient';
import type { Readable } from 'node:stream';

/**
 * Read image by request from global web server
 *
 * @param path name of the camera
 * @param query parameters for the camera
 * @param port Port of internal web server hosted by `cameras` adapter
 */
function getUrl(
    path: string,
    query: {
        key?: string;
        noCache?: 'true' | '1' | 'false' | '0';
        w?: string;
        h?: string;
        angle?: string;
    },
    port: number,
): Promise<{ body: Buffer; contentType: string }> {
    return new Promise<{ body: Buffer; contentType: string }>((resolve, reject): void => {
        const queryStr = Object.keys(query)
            .map(attr => `${attr}=${encodeURIComponent((query as Record<string, string>)[attr])}`)
            .join('&');

        http.get(`http://127.0.0.1:${port}/${path}${queryStr ? `?${queryStr}` : ''}`, res => {
            const { statusCode } = res;
            const contentType = (res.headers['content-type'] || res.headers['Content-type']) as string;

            if (statusCode !== 200) {
                // Consume response data to free-up memory
                res.resume();
                return reject(new Error(`Request Failed. Status Code: ${statusCode}`));
            }

            const data: Uint8Array[] = [];
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
export default class ProxyCameras {
    private readonly app: Express;
    private readonly config: CamerasAdapterConfig & { route: string };
    private readonly namespace: string;
    private readonly adapter: ioBroker.Adapter;
    /** Socket io server */
    private readonly ioServer: SocketWS | null;
    private ffmpegPath = '';

    private procs: {
        [cameraName: string]: {
            proc: FfmpegCommand | null;
            /** Set instead of proc when the frames come from go2rtc */
            go2rtcStream?: Readable | null;
            sockets: WebSocket[];
            timer: ioBroker.Timeout | undefined;
        };
    } = {};

    /**
     * Client for the go2rtc instance started by the adapter. go2rtc binds its API to localhost
     * only, so the browser must never talk to it directly - everything goes through the routes
     * installed here, which inherit the authentication and the http/https scheme of ioBroker.web.
     */
    private go2rtc: Go2RtcClient | null = null;

    constructor(
        server: HttpServer | HttpsServer,
        webSettings: {
            secure: boolean;
            port: number;
            defaultUser?: string;
            auth?: boolean;
            language?: ioBroker.Languages;
        },
        adapter: ioBroker.Adapter,
        instanceSettings: ioBroker.InstanceObject,
        app: Express,
        io?: IOSocketClass,
    ) {
        this.app = app;
        this.config = instanceSettings
            ? (instanceSettings.native as CamerasAdapterConfig & { route: string })
            : ({} as CamerasAdapterConfig & { route: string });
        this.namespace = instanceSettings ? instanceSettings._id.substring('system.adapter.'.length) : 'cameras';

        this.config.route = this.config.route || `${this.namespace}/`;
        this.config.port = parseInt(this.config.port as string, 10) || 80;

        // remove leading slash
        if (this.config.route[0] === '/') {
            this.config.route = this.config.route.substring(1);
        }

        this.adapter = adapter;
        this.ioServer = io?.ioServer || null;

        if (this.config.useGo2rtc) {
            this.go2rtc = new Go2RtcClient({
                apiPort: this.config.go2rtcApiPort,
                log: this.adapter.log,
            });
            this.adapter.log.info(`Cameras web extension will use go2rtc on ${this.go2rtc.url}`);
        }

        this.config.cameras.forEach(cam => this.oneCamera(cam));
    }

    unload(): Promise<void> {
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

    getFfmpegPath(): string {
        if (this.ffmpegPath) {
            return this.ffmpegPath;
        }

        this.ffmpegPath = findFFmpegPath(this.config.ffmpegPath, this.adapter.log);

        if (!existsSync(this.ffmpegPath) && !existsSync(`${this.ffmpegPath}.exe`)) {
            this.adapter.log.error(`Cannot find ffmpeg in "${this.config.ffmpegPath}"`);
        }

        return this.ffmpegPath;
    }

    async getRtspURL(rule: CameraConfigAny): Promise<{ url: string; password: string }> {
        let tempCamera: GenericRtspCamera | null = null;

        // load camera module
        try {
            tempCamera = (await createCamera(this.adapter, rule, this.ffmpegPath)) as GenericRtspCamera;
            await tempCamera.init();
            const url: string = tempCamera.getRtspURL();
            const password: string = tempCamera.getPassword();
            await tempCamera.destroy();
            tempCamera = null;
            return { password, url };
        } catch (e) {
            this.adapter.log.error(`Cannot load "${rule.type}": ${e}`);
            throw new Error(`Cannot load "${rule.type}"`);
        }
    }

    async rtsp2WebRTC(
        rule: CameraConfigAny,
        ws: WebSocketClient,
        cb: (customHandler?: boolean) => void,
    ): Promise<void> {
        // Does not work!.

        // Request for connection
        const { url, password } = await this.getRtspURL(rule);
        this.getFfmpegPath();

        const socket: WebSocket | null = ws.ws;
        let proc: ChildProcessWithoutNullStreams | null = null;

        const peer = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });

        const onSocketClose = (): void => {
            if (proc) {
                proc.kill();
                proc = null;
            }
        };

        peer.onicecandidate = (event: any): void => {
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

        socket?.on('message', async (message: string): Promise<void> => {
            const data = JSON.parse(message);
            console.log(`Received: ${JSON.stringify(data)}`);

            if (data.type === 'request-offer') {
                const offer = await peer.createOffer();
                await peer.setLocalDescription(offer);
                socket.send(JSON.stringify({ type: 'offer', sdp: offer.sdp }));
            } else if (data.type === 'answer') {
                await peer.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: data.sdp }));
            } else if (data.type === 'ice-candidate') {
                console.log('🔹 Received ICE candidate:', data.candidate);
                await peer.addIceCandidate(new RTCIceCandidate(data.candidate));
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
        proc = startFFmpeg(params, this.ffmpegPath, password, this.adapter.log);
        proc.stderr.on('data', data => {
            console.error(`FFmpeg Log: ${data}`);
        });

        if (cb) {
            // inform the caller that we will process all messages
            cb(true);
        }
    }

    onSocketClose(rule: CameraConfigAny, socket: WebSocket, reason: string): void {
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
        const sourceDied =
            reason === 'ffmpeg error' ||
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
    private attachSocket(name: string, socket: WebSocket): boolean {
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
    private stopSource(name: string): void {
        const entry = this.procs[name];
        if (!entry) {
            return;
        }
        try {
            entry.proc?.kill('SIGKILL');
        } catch {
            // ignore
        }
        try {
            entry.go2rtcStream?.destroy();
        } catch {
            // ignore
        }
        entry.proc = null;
        entry.go2rtcStream = null;
    }

    /** Pick the frame source: go2rtc if it is configured and reachable, otherwise a local ffmpeg */
    async startSource(rule: CameraConfigAny, socket: WebSocket): Promise<void> {
        if (this.go2rtc) {
            try {
                await this.startGo2Rtc(rule, socket);
                return;
            } catch (e) {
                this.adapter.log.warn(`go2rtc stream for "${rule.name}" failed, using ffmpeg instead: ${e as Error}`);
                delete this.procs[rule.name];
            }
        }
        await this.startFFmpeg(rule, socket);
    }

    /**
     * Feed the browser sockets from go2rtc. The frames leave this process in exactly the same
     * shape as with ffmpeg, so the existing vis widget keeps working unchanged.
     */
    async startGo2Rtc(rule: CameraConfigAny, socket: WebSocket): Promise<void> {
        const name = rule.name;

        if (this.attachSocket(name, socket)) {
            return;
        }

        const { url } = await this.getRtspURL(rule);

        this.procs[name] = { proc: null, go2rtcStream: null, sockets: [socket], timer: undefined };
        this.adapter.log.debug(`Starting go2rtc stream for "${name}"`);

        await this.go2rtc!.ensureStream(name, url);
        const { stream } = await this.go2rtc!.openMjpegStream(name);

        // The camera may have been dropped while we were connecting
        if (!this.procs[name]) {
            stream.destroy();
            return;
        }
        this.procs[name].go2rtcStream = stream;

        const extractor = new JpegFrameExtractor();

        stream.on('data', (chunk: Buffer): void => {
            const frames = extractor.push(chunk);
            if (!frames.length || !this.procs[name]) {
                return;
            }
            for (const frame of frames) {
                this.procs[name].sockets.forEach(s => s.send(frame, { binary: true }));
            }
        });

        stream.on('error', (e: Error): void => {
            this.adapter.log.debug(`go2rtc stream for "${name}" failed: ${e.message}`);
            this.onSocketClose(rule, socket, 'go2rtc error');
        });

        stream.on('end', (): void => {
            this.adapter.log.debug(`go2rtc stream for "${name}" ended`);
            this.onSocketClose(rule, socket, 'go2rtc end');
        });
    }

    async startFFmpeg(rule: CameraConfigAny, socket: WebSocket): Promise<void> {
        this.getFfmpegPath();
        const name = rule.name;

        if (!this.procs[name]) {
            const { url } = await this.getRtspURL(rule);

            this.procs[name] = { proc: null, sockets: [], timer: undefined };
            this.adapter.log.debug(`Starting ffmpeg for "${name}"`);

            // Start ffmpeg server
            this.procs[name].proc = ffmpeg(url)
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

            this.procs[name].proc?.on('end', (stdout: string | null, stderr: string | null): void => {
                this.adapter.log.debug(`Streaming for ${name} stopped: ${stderr}`);
                this.onSocketClose(rule, socket, 'ffmpeg end');
            });

            this.procs[name].proc?.on('error', (err, stdout, stderr): void => {
                this.adapter.log.debug(`Cannot process video for "${name}": ${err.message} ${stderr}`);
                this.onSocketClose(rule, socket, 'ffmpeg error');
            });
            const ffStream = this.procs[name].proc.pipe();
            const extractor = new JpegFrameExtractor();

            ffStream.on('data', (chunk: Buffer): void => {
                const frames = extractor.push(chunk);
                if (!frames.length || !this.procs[name]) {
                    return;
                }
                for (const frame of frames) {
                    this.procs[name].sockets.forEach(s => s.send(frame, { binary: true }));
                }
            });
        } else {
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
    async webrtcSignalling(
        rule: CameraConfigAny,
        ws: WebSocketClient,
        cb: (customHandler?: boolean) => void,
    ): Promise<void> {
        const client = this.go2rtc;
        const socket: WebSocket | null = ws.ws;

        if (!client) {
            this.adapter.log.warn(`WebRTC requested for "${rule.name}" but go2rtc is not enabled`);
            socket?.close();
            cb?.(true);
            return;
        }

        const { url } = await this.getRtspURL(rule);
        await client.ensureStream(rule.name, url);

        const upstream = new UpstreamWebSocket(client.getWsUrl(rule.name));
        const pending: (string | Buffer)[] = [];
        let closed = false;

        const closeBoth = (reason: string): void => {
            if (closed) {
                return;
            }
            closed = true;
            this.adapter.log.debug(`WebRTC relay for "${rule.name}" closed: ${reason}`);
            try {
                upstream.close();
            } catch {
                // ignore
            }
            try {
                socket?.close();
            } catch {
                // ignore
            }
        };

        upstream.on('open', () => {
            while (pending.length) {
                upstream.send(pending.shift()!);
            }
        });
        upstream.on('message', (data: Buffer, isBinary: boolean) => socket?.send(isBinary ? data : data.toString()));
        upstream.on('error', (e: Error) => closeBoth(`go2rtc error: ${e.message}`));
        upstream.on('close', () => closeBoth('go2rtc closed'));

        socket?.on('message', (data: Buffer, isBinary: boolean) => {
            const payload = isBinary ? data : data.toString();
            if (upstream.readyState === UpstreamWebSocket.OPEN) {
                upstream.send(payload);
            } else {
                pending.push(payload);
            }
        });
        socket?.on('close', () => closeBoth('browser closed'));
        socket?.on('error', (e: Error) => closeBoth(`browser error: ${e.message}`));

        if (ws.enableCustomHandler) {
            ws.enableCustomHandler(() => closeBoth('web server stopping'));
        }

        // We handle every message on this socket ourselves
        cb?.(true);
    }

    async rtsp2mjpeg(rule: CameraConfigAny, ws: WebSocketClient, cb: (customHandler?: boolean) => void): Promise<void> {
        // Request for connection
        this.adapter.log.debug(`New socket connection for "${rule.name}"`);

        const socket: WebSocket | null = ws.ws;
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

        socket?.on('error', (error: Error): void => {
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
    async streamMjpeg(rule: CameraConfigAny, res: ExpressResponse): Promise<void> {
        const client = this.go2rtc!;
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

    oneCamera(rule: CameraConfigAny): void {
        this.adapter.log.info(`Install extension on /${this.config.route}${rule.name}`);

        this.app.use(`/${this.config.route}${rule.name}`, (req, res) => {
            const parts = req.url.split('?');
            const query: {
                key?: string;
                noCache?: 'true' | '1' | 'false' | '0';
                w?: string;
                h?: string;
                angle?: string;
            } = {};

            (parts[1] || '').split('&').forEach(p => {
                if (p?.includes('=')) {
                    const pp = p.split('=');
                    (query as Record<string, string>)[decodeURIComponent(pp[0])] = decodeURIComponent(pp[1] || '');
                }
            });

            query.key = this.config.key;

            // Continuous MJPEG straight from go2rtc, usable in a plain <img src="...">.
            // Proxied on purpose - the go2rtc API stays bound to localhost.
            if (this.go2rtc && req.path.match(/^\/stream\.mjpeg/)) {
                this.streamMjpeg(rule, res).catch(error =>
                    this.adapter.log.debug(`MJPEG stream for "${rule.name}" ended: ${error}`),
                );
                return;
            }

            if (req.path.match(/^\/streaming/)) {
                getUrl(rule.name + req.path, query, this.config.port as number)
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
            getUrl(rule.name, query, this.config.port as number)
                .then(file => {
                    res.setHeader('Content-type', file.contentType);
                    res.status(200).send(file.body || '');
                })
                .catch(error => res.status(500).send(typeof error !== 'string' ? JSON.stringify(error) : error));
        });

        // Install web socket route
        if (this.ioServer?.addWsRoute && rule.rtsp && rule.enabled !== false) {
            this.adapter.log.info(`Install web socket extension on /${this.config.route}${rule.name}`);

            this.ioServer.addWsRoute(
                `/${this.config.route}${rule.name}`,
                (ws: WebSocketClient, cb: (customHandler?: boolean) => void): void => {
                    void this.rtsp2mjpeg(rule, ws, cb);
                },
            );

            // Separate exact path - the route table matches the pathname exactly, no wildcards
            if (this.go2rtc) {
                this.adapter.log.info(`Install WebRTC signalling on /${this.config.route}${rule.name}/webrtc`);

                this.ioServer.addWsRoute(
                    `/${this.config.route}${rule.name}/webrtc`,
                    (ws: WebSocketClient, cb: (customHandler?: boolean) => void): void => {
                        this.webrtcSignalling(rule, ws, cb).catch(e => {
                            this.adapter.log.warn(`Cannot start WebRTC for "${rule.name}": ${e}`);
                            cb?.(true);
                        });
                    },
                );
            }
        }
    }
}
