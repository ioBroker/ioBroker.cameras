"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const node_child_process_1 = require("node:child_process");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const Go2RtcClient_1 = __importDefault(require("./Go2RtcClient"));
class Go2RtcServer {
    adapter;
    options;
    apiPort;
    proc = null;
    binaryPath = '';
    running = false;
    client;
    constructor(adapter, options) {
        this.adapter = adapter;
        this.options = options;
        this.apiPort = parseInt(options.apiPort, 10) || 1984;
        this.client = new Go2RtcClient_1.default({ apiPort: this.apiPort, log: adapter.log });
    }
    get url() {
        return this.client.url;
    }
    isRunning() {
        return this.running;
    }
    /**
     * Locate the go2rtc binary: explicit setting first, then the copy shipped next to the adapter,
     * then the system PATH.
     */
    static findBinary(configured, log) {
        if (configured) {
            if ((0, node_fs_1.existsSync)(configured)) {
                return (0, node_path_1.normalize)(configured).replace(/\\/g, '/');
            }
            log?.warn(`go2rtc not found at configured path "${configured}"`);
        }
        const isWindows = process.platform === 'win32';
        const name = isWindows ? 'go2rtc.exe' : 'go2rtc';
        const candidates = [(0, node_path_1.join)(__dirname, '..', '..', 'go2rtc', name), (0, node_path_1.join)(__dirname, '..', '..', name)];
        for (const candidate of candidates) {
            if ((0, node_fs_1.existsSync)(candidate)) {
                return (0, node_path_1.normalize)(candidate).replace(/\\/g, '/');
            }
        }
        try {
            const found = (0, node_child_process_1.execSync)(isWindows ? 'where go2rtc' : 'which go2rtc')
                .toString()
                .trim()
                .split('\n')[0];
            if (found) {
                return found.trim().replace(/\\/g, '/');
            }
        }
        catch {
            // not on PATH either
        }
        return '';
    }
    /**
     * Write a minimal configuration. Only the API is exposed and it is bound to localhost -
     * the adapter is the only client. Streams are added at runtime through the API, so no
     * credentials are ever written to disk.
     */
    writeConfig() {
        const configPath = (0, node_path_1.normalize)((0, node_path_1.join)(this.options.tempPath, 'go2rtc.yaml')).replace(/\\/g, '/');
        const rtspPort = parseInt(this.options.rtspPort, 10) || 8554;
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
        (0, node_fs_1.writeFileSync)(configPath, `${lines.join('\n')}\n`);
        return configPath;
    }
    async start() {
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
        this.proc = (0, node_child_process_1.spawn)(this.binaryPath, ['-config', configPath], { windowsHide: true });
        // go2rtc writes its log to stdout, not stderr
        const onLog = (data) => {
            const text = data.toString().trim();
            if (!text) {
                return;
            }
            if (text.includes('ERR ')) {
                this.adapter.log.warn(`go2rtc: ${text}`);
            }
            else {
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
    async waitForApi(timeoutMs) {
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
    stop() {
        this.running = false;
        this.client.forgetAll();
        if (this.proc) {
            const proc = this.proc;
            this.proc = null;
            try {
                proc.kill();
            }
            catch (e) {
                this.adapter.log.debug(`Cannot stop go2rtc: ${e}`);
            }
        }
        return Promise.resolve();
    }
    /** Register a stream, or re-register it if the source URL changed */
    async ensureStream(name, source) {
        if (!this.running) {
            throw new Error('go2rtc is not running');
        }
        await this.client.ensureStream(name, source);
    }
    /** Fetch a single JPEG frame. go2rtc transcodes from whatever the source delivers */
    async getSnapshot(name, timeoutMs) {
        if (!this.running) {
            throw new Error('go2rtc is not running');
        }
        return this.client.getSnapshot(name, timeoutMs);
    }
}
exports.default = Go2RtcServer;
//# sourceMappingURL=Go2RtcServer.js.map