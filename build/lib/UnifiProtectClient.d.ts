export type UnifiQuality = 'high' | 'medium' | 'low';
export interface UnifiCameraInfo {
    id: string;
    name: string;
    state?: string;
    modelKey?: string;
}
/**
 * Client for the official UniFi Protect integration API (`/proxy/protect/integration/v1`), which
 * authenticates with an API key created under "Settings → Control Plane → Integrations".
 *
 * The console ships a self-signed certificate, so it is not verified. The requests stay in the
 * local network, and the alternative - asking every user to install their console's certificate -
 * is what nobody does.
 */
export default class UnifiProtectClient {
    private readonly http;
    constructor(host: string, apiKey: string, timeoutMs?: number);
    getCameras(): Promise<UnifiCameraInfo[]>;
    getSnapshot(cameraId: string, highQuality: boolean): Promise<Buffer>;
    /**
     * Stream token of the camera for the given quality, i.e. the last path segment of
     * `rtsps://<console>:7441/<token>?enableSrtp`. The same token also works for plain RTSP on 7447.
     *
     * If Protect has no stream for this quality yet, one is created - that is the same as switching
     * on "RTSP" for the camera in the Protect UI.
     */
    getStreamToken(cameraId: string, quality: UnifiQuality): Promise<string>;
}
