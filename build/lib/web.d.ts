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
    /** Whether the cameras adapter runs on the same host as this web instance */
    private readonly sameHost;
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
    refreshKey(): Promise<boolean>;
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
    getTransport(): 'http' | 'message';
    /**
     * Fetch a still image from the adapter over the transport picked by {@link getTransport}.
     *
     * @param name the camera name
     * @param query parameters of the browser request
     */
    getSnapshot(name: string, query: {
        key?: string;
        noCache?: 'true' | '1' | 'false' | '0';
        w?: string;
        h?: string;
        angle?: string;
    }): Promise<{
        body: Buffer;
        contentType: string;
    }>;
    /**
     * `sendTo` with a timeout.
     *
     * Unlike an HTTP request, a message to a stopped adapter is simply never answered - without this
     * the browser request would hang until it gives up on its own.
     *
     * @param command the message command
     * @param message the payload
     */
    sendToAdapter(command: string, message: Record<string, unknown>): Promise<unknown>;
    oneCamera(rule: CameraConfigAny): void;
}
