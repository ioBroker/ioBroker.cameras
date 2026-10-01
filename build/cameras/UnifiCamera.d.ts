import type { CameraConfigAny, CameraConfigUnifi, ProcessData } from '../types';
import GenericRtspCamera from './GenericRtspCamera';
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
    private client;
    private runningApiRequest;
    /** A running ffmpeg keeps the URL it was started with, so the token is only renewed before a new one */
    private streamRunning;
    /** A broken API is reported once per outage - every snapshot runs into the same timeout */
    private apiFailureReported;
    constructor(adapter: ioBroker.Adapter, config: CameraConfigAny, ffmpegPath: string);
    init(): Promise<void>;
    /** Timeout of the Protect API requests: the request timeout of the camera, or five seconds */
    private getApiTimeout;
    private static buildUrlPath;
    /**
     * Read the token from Protect again.
     *
     * Protect issues a new one when RTSP is switched off and on again or the camera is re-adopted.
     * The token from `init()` then stays broken for the whole lifetime of the adapter, although the
     * API key would be able to fetch the current one. Returns true if the token actually changed.
     */
    private refreshToken;
    /** Snapshot from the stream, retried once if Protect has issued a new token meanwhile */
    private processStream;
    process(): Promise<ProcessData>;
    startWebStream(options?: {
        width?: number;
    }): Promise<void>;
    stopWebStream(restart?: boolean): Promise<void>;
}
