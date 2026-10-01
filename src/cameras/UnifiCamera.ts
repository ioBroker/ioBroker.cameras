import type { CameraConfigAny, CameraConfigUnifi, ProcessData } from '../types';
import GenericRtspCamera from './GenericRtspCamera';
import UnifiProtectClient from '../lib/UnifiProtectClient';

/**
 * Camera managed by UniFi Protect.
 *
 * Protect re-streams every camera from the console: RTSP on port 7447, RTSPS on 7441, and the
 * path is a per-stream token instead of credentials. With an API key the token is fetched from
 * the integration API and snapshots come from Protect directly, which is faster than decoding
 * the stream and does not need ffmpeg. Without a key the token has to be entered by hand.
 */
export default class UnifiCamera extends GenericRtspCamera {
    protected config: CameraConfigUnifi;
    private client: UnifiProtectClient | null = null;
    private runningApiRequest: Promise<ProcessData> | null = null;
    /** A running ffmpeg keeps the URL it was started with, so the token is only renewed before a new one */
    private streamRunning = false;
    /** A broken API is reported once per outage - every snapshot runs into the same timeout */
    private apiFailureReported = false;

    constructor(adapter: ioBroker.Adapter, config: CameraConfigAny, ffmpegPath: string) {
        super(adapter, config, ffmpegPath);
        this.config = config as CameraConfigUnifi;
    }

    async init(): Promise<void> {
        if (!this.config.ip || typeof this.config.ip !== 'string') {
            throw new Error(`Invalid IP: "${this.config.ip}"`);
        }

        const apiKey = this.config.apiKey ? this.adapter.decrypt(this.config.apiKey) : '';
        let token = this.config.token ? this.adapter.decrypt(this.config.token) : '';

        if (apiKey && this.config.cameraId) {
            this.client = new UnifiProtectClient(this.config.ip, apiKey, this.getApiTimeout());
            try {
                token = await this.client.getStreamToken(this.config.cameraId, this.config.quality || 'high');
            } catch (e) {
                if (!token) {
                    throw new Error(`Cannot get stream token from UniFi Protect: ${e as Error}`);
                }
                this.adapter.log.warn(
                    `Cannot get stream token of "${this.config.name}" from UniFi Protect, using the configured one: ${e as Error}`,
                );
            }
        }

        if (!token) {
            throw new Error('Neither an API key with a camera nor a stream token is configured');
        }

        this.settings = {
            ip: this.config.ip,
            port: parseInt(this.config.port as string, 10) || (this.config.secure ? 7441 : 7447),
            urlPath: UnifiCamera.buildUrlPath(token, !!this.config.secure),
            protocol: 'tcp',
            secure: !!this.config.secure,
            // Protect cameras send H.265 more often than not
            keyFramesOnly: true,
        };

        // The token is the whole credential of the stream, so it is masked in the log like a password
        this.decodedPassword = token;

        return super.init();
    }

    /** Timeout of the Protect API requests: the request timeout of the camera, or five seconds */
    private getApiTimeout(): number {
        return parseInt(this.config.timeout as string, 10) || 5000;
    }

    private static buildUrlPath(token: string, secure: boolean): string {
        return secure ? `/${token}?enableSrtp` : `/${token}`;
    }

    /**
     * Read the token from Protect again.
     *
     * Protect issues a new one when RTSP is switched off and on again or the camera is re-adopted.
     * The token from `init()` then stays broken for the whole lifetime of the adapter, although the
     * API key would be able to fetch the current one. Returns true if the token actually changed.
     */
    private async refreshToken(): Promise<boolean> {
        if (!this.client || !this.config.cameraId || !this.settings) {
            return false;
        }

        try {
            const token = await this.client.getStreamToken(this.config.cameraId, this.config.quality || 'high');
            const urlPath = UnifiCamera.buildUrlPath(token, !!this.config.secure);
            if (urlPath === this.settings.urlPath) {
                return false;
            }
            this.settings.urlPath = urlPath;
            this.decodedPassword = token;
            this.adapter.log.info(`UniFi Protect issued a new stream token for "${this.config.name}"`);
            return true;
        } catch (e) {
            this.adapter.log.debug(`Cannot refresh the stream token of "${this.config.name}": ${e as Error}`);
            return false;
        }
    }

    /** Snapshot from the stream, retried once if Protect has issued a new token meanwhile */
    private async processStream(): Promise<ProcessData> {
        try {
            return await super.process();
        } catch (e) {
            if (!(await this.refreshToken())) {
                throw e;
            }
            return super.process();
        }
    }

    async process(): Promise<ProcessData> {
        if (!this.client || !this.config.cameraId) {
            return super.process();
        }

        if (this.runningApiRequest) {
            return this.runningApiRequest;
        }

        this.runningApiRequest = this.client
            // The snapshot API only knows a high and a low resolution, so "medium" takes the high one
            .getSnapshot(this.config.cameraId, this.config.quality !== 'low')
            .then((body): ProcessData => {
                this.apiFailureReported = false;
                return { body, contentType: 'image/jpeg' };
            })
            .catch((e: Error) => {
                const text = `Snapshot of "${this.config.name}" from UniFi Protect failed, using the stream: ${e}`;
                if (this.apiFailureReported) {
                    this.adapter.log.debug(text);
                } else {
                    // Worth one warning: from here on every snapshot waits for the same timeout first
                    this.apiFailureReported = true;
                    this.adapter.log.warn(text);
                }
                return this.processStream();
            })
            // Also on failure - a request left behind here would be handed out to every later
            // caller, so one unreachable camera would stay broken until the adapter restarts
            .finally(() => (this.runningApiRequest = null));

        return this.runningApiRequest;
    }

    async startWebStream(options?: { width?: number }): Promise<void> {
        // Only for a stream that is really new: startWebStream() is called again for every viewer,
        // and a token fetched while ffmpeg already runs would not be used anyway
        if (!this.streamRunning) {
            await this.refreshToken();
        }

        await super.startWebStream(options);

        // After super(), which may have stopped a running stream to change the scale
        this.streamRunning = true;
    }

    async stopWebStream(restart?: boolean): Promise<void> {
        this.streamRunning = false;
        return super.stopWebStream(restart);
    }
}
