import type { Server as HttpServer } from 'node:http';
import type { Server as HttpsServer } from 'node:https';
import type { IOSocketClass } from 'iobroker.ws';
import type { Express, Response as ExpressResponse } from 'express';
import type { CameraConfigAny } from '../types';
import type { Socket as WebSocketClient } from '@iobroker/ws-server';
import type { WebSocket } from 'ws';
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
    private readonly app;
    private readonly config;
    private readonly namespace;
    private readonly adapter;
    /** Socket io server */
    private readonly ioServer;
    private ffmpegPath;
    private procs;
    /**
     * Client for the go2rtc instance started by the adapter. go2rtc binds its API to localhost
     * only, so the browser must never talk to it directly - everything goes through the routes
     * installed here, which inherit the authentication and the http/https scheme of ioBroker.web.
     */
    private go2rtc;
    constructor(server: HttpServer | HttpsServer, webSettings: {
        secure: boolean;
        port: number;
        defaultUser?: string;
        auth?: boolean;
        language?: ioBroker.Languages;
    }, adapter: ioBroker.Adapter, instanceSettings: ioBroker.InstanceObject, app: Express, io?: IOSocketClass);
    unload(): Promise<void>;
    getFfmpegPath(): string;
    getRtspURL(rule: CameraConfigAny): Promise<{
        url: string;
        password: string;
    }>;
    rtsp2WebRTC(rule: CameraConfigAny, ws: WebSocketClient, cb: (customHandler?: boolean) => void): Promise<void>;
    onSocketClose(rule: CameraConfigAny, socket: WebSocket, reason: string): void;
    /**
     * Attach a socket to an already running source.
     *
     * Returns false if there is no source yet. Without this the second viewer of the same camera
     * was never added to the list and therefore never received a frame.
     */
    private attachSocket;
    /** Stop whichever source is feeding this camera */
    private stopSource;
    /** Pick the frame source: go2rtc if it is configured and reachable, otherwise a local ffmpeg */
    startSource(rule: CameraConfigAny, socket: WebSocket): Promise<void>;
    /**
     * Feed the browser sockets from go2rtc. The frames leave this process in exactly the same
     * shape as with ffmpeg, so the existing vis widget keeps working unchanged.
     */
    startGo2Rtc(rule: CameraConfigAny, socket: WebSocket): Promise<void>;
    startFFmpeg(rule: CameraConfigAny, socket: WebSocket): Promise<void>;
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
    webrtcSignalling(rule: CameraConfigAny, ws: WebSocketClient, cb: (customHandler?: boolean) => void): Promise<void>;
    rtsp2mjpeg(rule: CameraConfigAny, ws: WebSocketClient, cb: (customHandler?: boolean) => void): Promise<void>;
    /** Pipe the go2rtc MJPEG stream to an express response */
    streamMjpeg(rule: CameraConfigAny, res: ExpressResponse): Promise<void>;
    oneCamera(rule: CameraConfigAny): void;
}
