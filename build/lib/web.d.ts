import type { Server as HttpServer } from 'node:http';
import type { Server as HttpsServer } from 'node:https';
import type { IOSocketClass } from 'iobroker.ws';
import type { Express } from 'express';
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
    startFFmpeg(rule: CameraConfigAny, socket: WebSocket): Promise<void>;
    rtsp2mjpeg(rule: CameraConfigAny, ws: WebSocketClient, cb: (customHandler?: boolean) => void): Promise<void>;
    oneCamera(rule: CameraConfigAny): void;
}
