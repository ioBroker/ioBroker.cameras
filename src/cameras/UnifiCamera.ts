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

    constructor(adapter: ioBroker.Adapter, config: CameraConfigAny, ffmpegPath: string) {
        super(adapter, config, ffmpegPath);
        this.config = config as CameraConfigUnifi;
    }

    async init(): Promise<void> {
        if (!this.config.ip || typeof this.config.ip !== 'string') {
            throw new Error(`Invalid IP: "${this.config.ip}"`);
        }

        const apiKey = this.config.apiKey ? this.adapter.decrypt(this.config.apiKey) : '';
        let token = this.config.token || '';

        if (apiKey && this.config.cameraId) {
            this.client = new UnifiProtectClient(this.config.ip, apiKey);
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
            urlPath: this.config.secure ? `/${token}?enableSrtp` : `/${token}`,
            protocol: 'tcp',
            secure: !!this.config.secure,
            // Protect cameras send H.265 more often than not
            keyFramesOnly: true,
        };

        return super.init();
    }

    async process(): Promise<ProcessData> {
        if (!this.client || !this.config.cameraId) {
            return super.process();
        }

        if (this.runningApiRequest) {
            return this.runningApiRequest;
        }

        this.runningApiRequest = this.client
            .getSnapshot(this.config.cameraId, this.config.quality !== 'low')
            .then((body): ProcessData => ({ body, contentType: 'image/jpeg' }))
            .catch((e: Error) => {
                this.adapter.log.debug(
                    `Snapshot of "${this.config.name}" from UniFi Protect failed, using the stream: ${e}`,
                );
                return super.process();
            })
            // Also on failure - a request left behind here would be handed out to every later
            // caller, so one unreachable camera would stay broken until the adapter restarts
            .finally(() => (this.runningApiRequest = null));

        return this.runningApiRequest;
    }
}
