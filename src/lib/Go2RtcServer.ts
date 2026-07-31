/**
 * Thin wrapper around a local go2rtc process.
 *
 * go2rtc keeps exactly one connection per camera open and fans the stream out to any number of
 * consumers. That replaces the "one ffmpeg process per snapshot" approach of GenericRtspCamera:
 * a snapshot becomes a plain HTTP GET against the local API.
 *
 * The server is optional. If the binary cannot be found or does not come up, the adapter keeps
 * using the ffmpeg code path, so enabling this can never make an existing installation worse.
 */
import { spawn, execSync, type ChildProcess } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { normalize, join } from 'node:path';
import Go2RtcClient from './Go2RtcClient';

export interface Go2RtcOptions {
    /** Explicit path to the go2rtc binary. If empty, the usual locations are searched */
    binaryPath?: string;
    /** Port of the local go2rtc HTTP API, default 1984 */
    apiPort?: number | string;
    /** Writable directory for the generated configuration file */
    tempPath: string;
    /** Path to ffmpeg, handed to go2rtc for transcoding sources */
    ffmpegPath?: string;
    /**
     * Port of the internal RTSP server, bound to localhost. It cannot be switched off:
     * go2rtc pipes the output of `ffmpeg:`/`exec:` sources back through it, so disabling the
     * module breaks every transcoded source with "rtsp module disabled".
     */
    rtspPort?: number | string;
    /**
     * Listen address for WebRTC media, e.g. ":8555". Empty disables WebRTC.
     * Note that WebRTC media never passes through the ioBroker.web proxy - only the signalling
     * does - so this port has to be reachable by the browser itself.
     */
    webrtcListen?: string;
}

export default class Go2RtcServer {
    private readonly adapter: ioBroker.Adapter;
    private readonly options: Go2RtcOptions;
    private readonly apiPort: number;
    private proc: ChildProcess | null = null;
    private binaryPath = '';
    private running = false;
    private readonly client: Go2RtcClient;

    constructor(adapter: ioBroker.Adapter, options: Go2RtcOptions) {
        this.adapter = adapter;
        this.options = options;
        this.apiPort = parseInt(options.apiPort as string, 10) || 1984;
        this.client = new Go2RtcClient({ apiPort: this.apiPort, log: adapter.log });
    }

    get url(): string {
        return this.client.url;
    }

    isRunning(): boolean {
        return this.running;
    }

    /**
     * Locate the go2rtc binary: explicit setting first, then the copy shipped next to the adapter,
     * then the system PATH.
     */
    static findBinary(configured: string | undefined, log?: ioBroker.Log): string {
        if (configured) {
            if (existsSync(configured)) {
                return normalize(configured).replace(/\\/g, '/');
            }
            log?.warn(`go2rtc not found at configured path "${configured}"`);
        }

        const isWindows = process.platform === 'win32';
        const name = isWindows ? 'go2rtc.exe' : 'go2rtc';

        const candidates = [join(__dirname, '..', '..', 'go2rtc', name), join(__dirname, '..', '..', name)];
        for (const candidate of candidates) {
            if (existsSync(candidate)) {
                return normalize(candidate).replace(/\\/g, '/');
            }
        }

        try {
            const found = execSync(isWindows ? 'where go2rtc' : 'which go2rtc')
                .toString()
                .trim()
                .split('\n')[0];
            if (found) {
                return found.trim().replace(/\\/g, '/');
            }
        } catch {
            // not on PATH either
        }

        return '';
    }

    /**
     * Write a minimal configuration. Only the API is exposed and it is bound to localhost -
     * the adapter is the only client. Streams are added at runtime through the API, so no
     * credentials are ever written to disk.
     */
    private writeConfig(): string {
        const configPath = normalize(join(this.options.tempPath, 'go2rtc.yaml')).replace(/\\/g, '/');
        const rtspPort = parseInt(this.options.rtspPort as string, 10) || 8554;
        const lines = [
            'api:',
            `  listen: "127.0.0.1:${this.apiPort}"`,
            // Must stay enabled - `ffmpeg:` sources are piped back through this server
            'rtsp:',
            `  listen: "127.0.0.1:${rtspPort}"`,
            'webrtc:',
            `  listen: "${this.options.webrtcListen || ''}"`,
            'log:',
            '  level: warn',
        ];
        if (this.options.ffmpegPath) {
            lines.push('ffmpeg:', `  bin: "${this.options.ffmpegPath}"`);
        }
        writeFileSync(configPath, `${lines.join('\n')}\n`);
        return configPath;
    }

    async start(): Promise<boolean> {
        if (this.running) {
            return true;
        }

        this.binaryPath = Go2RtcServer.findBinary(this.options.binaryPath, this.adapter.log);
        if (!this.binaryPath) {
            this.adapter.log.warn('go2rtc binary not found - falling back to ffmpeg');
            return false;
        }

        const configPath = this.writeConfig();
        this.adapter.log.info(`Starting go2rtc: ${this.binaryPath} -config ${configPath}`);

        this.proc = spawn(this.binaryPath, ['-config', configPath], { windowsHide: true });

        // go2rtc writes its log to stdout, not stderr
        const onLog = (data: Buffer): void => {
            const text = data.toString().trim();
            if (!text) {
                return;
            }
            if (text.includes('ERR ')) {
                this.adapter.log.warn(`go2rtc: ${text}`);
            } else {
                this.adapter.log.debug(`go2rtc: ${text}`);
            }
        };
        this.proc.stdout?.on('data', onLog);
        this.proc.stderr?.on('data', onLog);

        this.proc.on('error', e => {
            this.adapter.log.error(`go2rtc failed to start: ${e.message}`);
            this.running = false;
            this.proc = null;
        });

        this.proc.on('exit', code => {
            if (this.running) {
                this.adapter.log.warn(`go2rtc exited unexpectedly with code ${code}`);
            }
            this.running = false;
            this.proc = null;
            this.client.forgetAll();
        });

        const up = await this.waitForApi(10000);
        if (!up) {
            this.adapter.log.warn('go2rtc did not answer on its API - falling back to ffmpeg');
            await this.stop();
            return false;
        }

        this.running = true;
        this.adapter.log.info(`go2rtc is ready on ${this.url}`);
        return true;
    }

    private async waitForApi(timeoutMs: number): Promise<boolean> {
        const deadline = Date.now() + timeoutMs;
        while (Date.now() < deadline) {
            if (!this.proc) {
                return false;
            }
            if (await this.client.isAvailable(1000)) {
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        return false;
    }

    stop(): Promise<void> {
        this.running = false;
        this.client.forgetAll();
        if (this.proc) {
            const proc = this.proc;
            this.proc = null;
            try {
                proc.kill();
            } catch (e) {
                this.adapter.log.debug(`Cannot stop go2rtc: ${e as Error}`);
            }
        }
        return Promise.resolve();
    }

    /** Register a stream, or re-register it if the source URL changed */
    async ensureStream(name: string, source: string): Promise<void> {
        if (!this.running) {
            throw new Error('go2rtc is not running');
        }
        await this.client.ensureStream(name, source);
    }

    /** Fetch a single JPEG frame. go2rtc transcodes from whatever the source delivers */
    async getSnapshot(name: string, timeoutMs?: number): Promise<Buffer> {
        if (!this.running) {
            throw new Error('go2rtc is not running');
        }
        return this.client.getSnapshot(name, timeoutMs);
    }
}
