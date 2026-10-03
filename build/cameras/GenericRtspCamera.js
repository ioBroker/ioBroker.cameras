"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const sharp_1 = __importDefault(require("sharp"));
const GenericCamera_1 = __importDefault(require("./GenericCamera"));
const rtspCommon_1 = require("./rtspCommon");
/**
 * How long the grey check stays on hold after a key frame turned out to be flat as well. Short enough
 * that a lens someone uncovered is noticed again, long enough that the second snapshot is not paid
 * for on every request - see {@link GenericRtspCamera.takeSnapshot}.
 */
const GREY_RECHECK_MS = 10 * 60_000;
class GenericRtspCamera extends GenericCamera_1.default {
    width = 0;
    ratio = 0;
    decodedPassword = '';
    lastFrame = 0;
    monitor = null;
    runningRequest = null;
    lastBase64Frame = '';
    proc = null;
    isRtsp = true;
    settings = null;
    ffmpegPath;
    go2rtc = null;
    /** Not before this the grey check may spend a second ffmpeg run again, see {@link takeSnapshot} */
    greyCheckAgainAt = 0;
    constructor(adapter, config, ffmpegPath) {
        super(adapter, config);
        this.ffmpegPath = ffmpegPath;
        //     Fill settings
        //     fill decodedPassword
        //     this.decodedPassword = this.adapter.decrypt(this.config.password);
    }
    async init() {
        // check parameters
        if (!this.settings?.ip || typeof this.settings.ip !== 'string') {
            if (!this.settings) {
                throw new Error(`Invalid settings: undefined`);
            }
            throw new Error(`Invalid IP: "${this.settings?.ip}"`);
        }
        this.lastFrame = 0;
        await super.init();
    }
    getPassword() {
        return this.decodedPassword;
    }
    /**
     * Hide the credentials of an RTSP URL before it is logged: the user info, and the secret of a
     * camera that has none - UniFi Protect carries its stream token in the path instead.
     */
    maskUrl(url) {
        return (0, rtspCommon_1.maskPassword)(url.replace(/:[^@]+@/, ':****@'), this.decodedPassword);
    }
    /** Hand over a running go2rtc instance. If set, snapshots are taken from it instead of ffmpeg */
    setGo2Rtc(server) {
        this.go2rtc = server;
    }
    /**
     * Snapshot via go2rtc. Returns null if go2rtc is unavailable or fails, so the caller can
     * fall back to the ffmpeg path.
     */
    async processViaGo2Rtc() {
        if (!this.go2rtc?.isRunning()) {
            return null;
        }
        try {
            await this.go2rtc.ensureStream(this.config.name, this.getRtspURL());
            const body = await this.go2rtc.getSnapshot(this.config.name, this.config.timeout);
            return { body, contentType: 'image/jpeg' };
        }
        catch (e) {
            this.adapter.log.warn(`go2rtc snapshot for "${this.config.name}" failed, using ffmpeg instead: ${e}`);
            return null;
        }
    }
    async destroy() {
        await this.stopWebStream();
        this.initialized = false;
        // do nothing
        return Promise.resolve();
    }
    async process() {
        if (this.runningRequest) {
            return this.runningRequest;
        }
        if (!this.settings) {
            this.adapter.log.error(`No settings for camera ${this.config.name}`);
            throw new Error(`No settings for camera ${this.config.name}`);
        }
        this.adapter.log.debug(`Requesting snapshot from ${this.settings.ip}...`);
        // If stream is enabled, send data from streaming
        if (this.lastBase64Frame) {
            return {
                body: Buffer.from(this.lastBase64Frame, 'base64'),
                contentType: 'image/jpeg',
            };
        }
        const viaGo2Rtc = await this.processViaGo2Rtc();
        if (viaGo2Rtc) {
            return viaGo2Rtc;
        }
        this.runningRequest = this.takeSnapshot()
            .then(async (body) => {
            this.adapter.log.debug(`Snapshot from ${this.settings.ip}. Done!`);
            if (!this.ratio) {
                // try to get width and height
                const image = (0, sharp_1.default)(body);
                const metadata = await image.metadata();
                this.ratio = (metadata.width || 1) / (metadata.height || 1);
            }
            return {
                body,
                contentType: 'image/jpeg',
            };
        })
            // Also on failure - a request left behind here would be handed out to every later
            // caller, so one unreachable camera would stay broken until the adapter restarts
            .finally(() => (this.runningRequest = null));
        return this.runningRequest;
    }
    /**
     * Snapshot with ffmpeg. A flat grey image is what ffmpeg decodes from an H.265 stream joined
     * between two key frames - then the snapshot is taken again from a key frame, and the camera
     * keeps that for as long as the adapter runs. Nobody would find the expert option on their own.
     */
    async takeSnapshot() {
        const settings = this.settings;
        const snapshot = () => (0, rtspCommon_1.getRtspSnapshot)(settings, this.getSnapshotFileName(), this.ffmpegPath, this.decodedPassword, this.config.timeout, this.adapter.log);
        const body = await snapshot();
        if (settings.keyFramesOnly || Date.now() < this.greyCheckAgainAt || !(await (0, rtspCommon_1.isFlatImage)(body))) {
            return body;
        }
        settings.keyFramesOnly = true;
        const fromKeyFrame = await snapshot().catch((e) => {
            this.adapter.log.debug(`Camera "${this.config.name}": no snapshot from a key frame: ${e.message}`);
            return null;
        });
        if (fromKeyFrame && !(await (0, rtspCommon_1.isFlatImage)(fromKeyFrame))) {
            this.adapter.log.info(`Camera "${this.config.name}" delivered a grey image (H.265?). Snapshots are now taken from key frames only`);
            return fromKeyFrame;
        }
        // Flat from a key frame as well - a covered lens or a camera showing one colour. Waiting for
        // key frames does not help then and would only make every snapshot slower.
        // A camera really showing one colour would otherwise pay for the second snapshot on every
        // request for the rest of the runtime, so the check is put on hold - but not given up: a lens
        // does not stay covered forever, and the H.265 problem would never be found after that.
        settings.keyFramesOnly = false;
        this.greyCheckAgainAt = Date.now() + GREY_RECHECK_MS;
        return body;
    }
    /**
     * Scratch file ffmpeg writes the snapshot to.
     *
     * Named after the camera, not after its address: a main stream and a sub stream of the same
     * camera are two entries with the same IP, and they would overwrite each other's frame.
     */
    getSnapshotFileName() {
        return node_path_1.default.normalize(`${this.adapter.config.tempPath}/${this.config.name.replace(/[^\w-]/g, '_')}.jpg`);
    }
    getRtspURL() {
        if (!this.settings) {
            throw new Error(`No settings for camera ${this.config.name}`);
        }
        return `${this.settings.secure ? 'rtsps' : 'rtsp'}://${this.settings.username ? `${encodeURIComponent(this.settings.username)}:${encodeURIComponent(this.decodedPassword)}@` : ''}${this.settings.ip}:${this.settings.port || 554}${this.settings.urlPath ? (this.settings.urlPath.startsWith('/') ? this.settings.urlPath : `/${this.settings.urlPath}`) : ''}`;
    }
    // ffmpeg -rtsp_transport udp -i rtsp://localhost:8090/stream -c:a aac -b:a 160000 -ac 2 -s 854x480 -c:v libx264 -b:v 800000 -hls_time 10 -hls_list_size 2 -hls_flags delete_segments -start_number 1 playlist.m3u8
    async startWebStream(options) {
        const url = this.getRtspURL();
        if (!url) {
            this.adapter.log.error(`No URL for camera ${this.config.name}`);
            throw new Error(`No URL for camera ${this.config.name}`);
        }
        const desiredWidth = options?.width || 0;
        if (this.width !== desiredWidth) {
            // A small difference is not worth restarting ffmpeg for, the scale is close enough
            if (this.width && desiredWidth && Math.abs(this.width - desiredWidth) < 100) {
                this.width = desiredWidth;
            }
            else if (this.proc) {
                // The scale is part of the running ffmpeg command line, so a real change needs a
                // restart. Only then - with nothing running yet there is nothing to wait for, and
                // waiting here would delay the first picture of every viewer by ten seconds.
                this.adapter.log.debug(`Stopping streaming for ${this.config.name} while requested width is ${desiredWidth}. Was ${this.width}`);
                await this.stopWebStream();
                // Give the camera a moment to let go of the old connection
                await new Promise(resolve => setTimeout(resolve, 10000));
                this.width = desiredWidth;
            }
            else {
                this.width = desiredWidth;
            }
        }
        if (!this.proc) {
            await this.adapter.setState(`${this.config.name}.running`, true, true);
            this.adapter.log.debug(`Starting streaming for ${this.config.name} (${this.maskUrl(url)}), width: ${this.width}`);
            this.proc = (0, fluent_ffmpeg_1.default)(url)
                .setFfmpegPath(this.ffmpegPath)
                // .addInputOption('-preset', 'ultrafast')
                .addInputOption('-rtsp_transport', 'tcp')
                .addInputOption('-re')
                .outputFormat('mjpeg')
                .fps(2)
                .addOptions('-q:v 0');
            if (this.width) {
                // first try to find the best scale
                if (!this.ratio) {
                    const body = await (0, rtspCommon_1.getRtspSnapshot)(this.settings, this.getSnapshotFileName(), this.ffmpegPath, this.decodedPassword, this.config.timeout, this.adapter.log);
                    // try to get width and height
                    const image = (0, sharp_1.default)(body);
                    const metadata = await image.metadata();
                    this.ratio = (metadata.width || 1) / (metadata.height || 1);
                }
                this.proc.addOptions(`-vf scale=${this.width}:${Math.round(this.width / this.ratio)}`);
            }
            this.proc.on('end', async () => {
                this.adapter.log.debug(`Streaming for ${this.config.name} stopped`);
                await this.stopWebStream();
            });
            this.proc.on('error', async (err /* , stdout, stderr */) => {
                if (this.proc) {
                    await this.adapter.setState(`${this.config.name}.stream`, '', true);
                    await this.adapter.setState(`${this.config.name}.running`, false, true);
                    this.adapter.log.debug(`Cannot process video for "${this.config.name}": ${err.message}`);
                }
                else {
                    this.adapter.log.debug(`Streaming for ${this.config.name} stopped`);
                }
                await this.stopWebStream(true);
            });
            const ffStream = this.proc.pipe();
            let chunks = Buffer.from([]);
            this.lastFrame = 0;
            // Start monitor interval, that checks if any picture was received in 10 seconds
            this.monitor = setInterval(async () => {
                if (Date.now() - this.lastFrame > 10000) {
                    if (this.monitor) {
                        clearInterval(this.monitor);
                        this.monitor = null;
                    }
                    this.adapter.log.debug(`No data for ${this.config.name} for 10 seconds. Stopping`);
                    await this.stopWebStream();
                }
            }, 10000);
            ffStream.on('data', async (chunk) => {
                if (chunk.length > 2 && chunk[0] === 0xff && chunk[1] === 0xd8) {
                    const frame = chunks.toString('base64');
                    let found = false;
                    // Do not send frames too often
                    if (!this.lastFrame || Date.now() - this.lastFrame > 300) {
                        this.lastFrame = Date.now();
                        this.lastBase64Frame = frame;
                        if (this.streamSubscribes) {
                            this.streamSubscribes.forEach(sub => {
                                if (sub.camera === this.config.name) {
                                    found = true;
                                    try {
                                        if (this.adapter.sendToUI) {
                                            this.adapter
                                                .sendToUI({ clientId: sub.clientId, data: frame })
                                                .catch(e => this.onSendToUIError(sub, e));
                                        }
                                    }
                                    catch (e) {
                                        this.onSendToUIError(sub, e);
                                    }
                                }
                            });
                        }
                        if (!found) {
                            await this.adapter.setState(`${this.config.name}.stream`, frame, true);
                        }
                    }
                    chunks = chunk;
                }
                else {
                    chunks = Buffer.concat([chunks, chunk]);
                }
            });
        }
    }
    onSendToUIError(sub, e) {
        const error = e instanceof Error ? e.message : String(e);
        if (error.includes('not registered')) {
            // The client is gone (e.g. the browser tab was closed) - forget it, otherwise every
            // following frame would fail the same way. The rejection arrives after the frame loop
            // is done, so the subscription is removed here, by identity, and not collected for it.
            const pos = this.streamSubscribes?.indexOf(sub) ?? -1;
            if (pos !== -1) {
                this.streamSubscribes.splice(pos, 1);
            }
            this.adapter.log.debug(`GUI client "${sub.clientId}" for ${this.config.name} is gone: ${error}`);
        }
        else {
            this.adapter.log.warn(`Cannot send to UI: ${error}`);
        }
    }
    async stopWebStream(restart) {
        // The last frame of the stream must not survive it. process() answers from it while the
        // stream runs, so keeping it would freeze every later snapshot on that picture.
        this.lastBase64Frame = '';
        if (this.initialized) {
            if (this.monitor) {
                clearInterval(this.monitor);
                this.monitor = null;
            }
            if (this.proc) {
                try {
                    this.proc?.kill('SIGKILL');
                    this.proc = null;
                }
                catch (e) {
                    this.adapter.log.warn(`Cannot stop ffmpeg for "${this.config.name}": ${e}`);
                }
                await this.adapter.setState(`${this.config.name}.stream`, '', true);
                await this.adapter.setState(`${this.config.name}.running`, false, true);
            }
            if (restart) {
                // Nothing to do here: the stream is stopped, and the next subscription of a GUI
                // client starts it again. Restarting it now would keep ffmpeg running for nobody.
                this.adapter.log.debug(`Streaming for ${this.config.name} stopped after an error`);
            }
        }
    }
}
exports.default = GenericRtspCamera;
//# sourceMappingURL=GenericRtspCamera.js.map