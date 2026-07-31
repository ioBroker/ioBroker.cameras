/**
 * HTTP client for a running go2rtc instance.
 *
 * Deliberately separated from Go2RtcServer: the web extension (lib/web.ts) runs inside the
 * ioBroker.web process and therefore cannot see the Go2RtcServer object that the adapter created.
 * It only knows the configuration, so it talks to the same local API through this client.
 */
import axios from 'axios';
import type { Readable } from 'node:stream';

export interface Go2RtcClientOptions {
    /** Port of the go2rtc HTTP API, default 1984 */
    apiPort?: number | string;
    /** Host of the API. Always localhost - the API is never exposed to the network */
    host?: string;
    log?: ioBroker.Log;
}

export default class Go2RtcClient {
    private readonly host: string;
    private readonly apiPort: number;
    private readonly log?: ioBroker.Log;
    /** Streams already registered, keyed by camera name, value is the source URL */
    private readonly registered = new Map<string, string>();

    constructor(options: Go2RtcClientOptions) {
        this.host = options.host || '127.0.0.1';
        this.apiPort = parseInt(options.apiPort as string, 10) || 1984;
        this.log = options.log;
    }

    get url(): string {
        return `http://${this.host}:${this.apiPort}`;
    }

    /** True if go2rtc answers on its API */
    async isAvailable(timeoutMs?: number): Promise<boolean> {
        try {
            await axios.get(`${this.url}/api/streams`, { timeout: timeoutMs || 2000 });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Register a stream, or re-register it if the source URL changed.
     *
     * Two producers are registered: the camera itself, and an ffmpeg transcode of it to MJPEG.
     * Without the second one `/api/stream.mjpeg` refuses an H264 camera with
     * "codecs not matched: video:H264 => video:JPEG". go2rtc only starts a producer once a
     * consumer actually attaches, so the transcoder costs nothing while nobody is watching.
     */
    async ensureStream(name: string, source: string): Promise<void> {
        if (this.registered.get(name) === source) {
            return;
        }

        // Repeated "src" parameters add several producers - axios would encode an array as src[]
        const query = new URLSearchParams();
        query.append('name', name);
        query.append('src', source);
        query.append('src', `ffmpeg:${name}#video=mjpeg`);

        await axios.put(`${this.url}/api/streams?${query.toString()}`, null, { timeout: 5000 });
        this.registered.set(name, source);
        this.log?.debug(`Registered stream "${name}" in go2rtc`);
    }

    forgetStream(name: string): void {
        this.registered.delete(name);
    }

    forgetAll(): void {
        this.registered.clear();
    }

    /** Single JPEG frame. go2rtc transcodes from whatever the source delivers */
    async getSnapshot(name: string, timeoutMs?: number): Promise<Buffer> {
        const response = await axios.get(`${this.url}/api/frame.jpeg`, {
            params: { src: name },
            responseType: 'arraybuffer',
            timeout: timeoutMs || 10000,
        });

        return Buffer.from(response.data as ArrayBuffer);
    }

    /**
     * Open the MJPEG stream as a Node stream. The caller is responsible for destroying it.
     * Used by the web extension to feed the browser without spawning an ffmpeg process.
     */
    async openMjpegStream(name: string): Promise<{ stream: Readable; contentType: string }> {
        const response = await axios.get(`${this.url}/api/stream.mjpeg`, {
            params: { src: name },
            responseType: 'stream',
            // A live stream never completes, so no read timeout - only the connect attempt is bounded
            timeout: 0,
        });

        return {
            stream: response.data as Readable,
            contentType: (response.headers['content-type'] as string) || 'multipart/x-mixed-replace',
        };
    }

    /** WebSocket endpoint used for WebRTC/MSE signalling */
    getWsUrl(name: string): string {
        return `ws://${this.host}:${this.apiPort}/api/ws?src=${encodeURIComponent(name)}`;
    }
}

/**
 * Pull complete JPEG frames out of a byte stream.
 *
 * go2rtc delivers multipart/x-mixed-replace, so between two images there are boundary headers.
 * Searching for the SOI/EOI markers skips those automatically and is far more robust than
 * assuming that every chunk starts exactly at a frame boundary.
 */
export class JpegFrameExtractor {
    private buffer: Buffer = Buffer.alloc(0);
    private readonly maxBuffer: number;

    constructor(maxBuffer = 8 * 1024 * 1024) {
        this.maxBuffer = maxBuffer;
    }

    push(chunk: Buffer): Buffer[] {
        this.buffer = this.buffer.length ? Buffer.concat([this.buffer, chunk]) : chunk;
        const frames: Buffer[] = [];

        for (;;) {
            const start = this.buffer.indexOf('ffd8', 0, 'hex');
            if (start === -1) {
                break;
            }
            const end = this.buffer.indexOf('ffd9', start + 2, 'hex');
            if (end === -1) {
                // Frame is still incomplete - drop everything before its start
                if (start > 0) {
                    this.buffer = this.buffer.subarray(start);
                }
                break;
            }
            frames.push(this.buffer.subarray(start, end + 2));
            this.buffer = this.buffer.subarray(end + 2);
        }

        // Guard against a source that never produces a valid marker
        if (this.buffer.length > this.maxBuffer) {
            this.buffer = Buffer.alloc(0);
        }

        return frames;
    }
}
