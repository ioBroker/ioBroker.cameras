import type { Readable } from 'node:stream';
export interface Go2RtcClientOptions {
    /** Port of the go2rtc HTTP API, default 1984 */
    apiPort?: number | string;
    /** Host of the API. Always localhost - the API is never exposed to the network */
    host?: string;
    log?: ioBroker.Log;
}
export default class Go2RtcClient {
    private readonly host;
    private readonly apiPort;
    private readonly log?;
    /** Streams already registered, keyed by camera name, value is the source URL */
    private readonly registered;
    constructor(options: Go2RtcClientOptions);
    get url(): string;
    /** True if go2rtc answers on its API */
    isAvailable(timeoutMs?: number): Promise<boolean>;
    /**
     * Register a stream, or re-register it if the source URL changed.
     *
     * Two producers are registered: the camera itself, and an ffmpeg transcode of it to MJPEG.
     * Without the second one `/api/stream.mjpeg` refuses an H264 camera with
     * "codecs not matched: video:H264 => video:JPEG". go2rtc only starts a producer once a
     * consumer actually attaches, so the transcoder costs nothing while nobody is watching.
     */
    ensureStream(name: string, source: string): Promise<void>;
    forgetStream(name: string): void;
    forgetAll(): void;
    /** Single JPEG frame. go2rtc transcodes from whatever the source delivers */
    getSnapshot(name: string, timeoutMs?: number): Promise<Buffer>;
    /**
     * Open the MJPEG stream as a Node stream. The caller is responsible for destroying it.
     * Used by the web extension to feed the browser without spawning an ffmpeg process.
     */
    openMjpegStream(name: string): Promise<{
        stream: Readable;
        contentType: string;
    }>;
    /** WebSocket endpoint used for WebRTC/MSE signalling */
    getWsUrl(name: string): string;
}
/**
 * Pull complete JPEG frames out of a byte stream.
 *
 * go2rtc delivers multipart/x-mixed-replace, so between two images there are boundary headers.
 * Searching for the SOI/EOI markers skips those automatically and is far more robust than
 * assuming that every chunk starts exactly at a frame boundary.
 */
export declare class JpegFrameExtractor {
    private buffer;
    private readonly maxBuffer;
    constructor(maxBuffer?: number);
    push(chunk: Buffer): Buffer[];
}
