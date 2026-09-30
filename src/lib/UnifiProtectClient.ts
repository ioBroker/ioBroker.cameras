import https from 'node:https';
import axios, { type AxiosInstance } from 'axios';

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
    private readonly http: AxiosInstance;

    constructor(host: string, apiKey: string, timeoutMs = 5000) {
        this.http = axios.create({
            baseURL: `https://${host}/proxy/protect/integration/v1`,
            headers: { 'X-API-KEY': apiKey },
            httpsAgent: new https.Agent({ rejectUnauthorized: false }),
            timeout: timeoutMs,
        });
    }

    async getCameras(): Promise<UnifiCameraInfo[]> {
        const response = await this.http.get<UnifiCameraInfo[]>('/cameras');
        return response.data.map(cam => ({ id: cam.id, name: cam.name, state: cam.state, modelKey: cam.modelKey }));
    }

    async getSnapshot(cameraId: string, highQuality: boolean): Promise<Buffer> {
        const response = await this.http.get(`/cameras/${encodeURIComponent(cameraId)}/snapshot`, {
            params: { highQuality },
            responseType: 'arraybuffer',
        });
        return Buffer.from(response.data as ArrayBuffer);
    }

    /**
     * Stream token of the camera for the given quality, i.e. the last path segment of
     * `rtsps://<console>:7441/<token>?enableSrtp`. The same token also works for plain RTSP on 7447.
     *
     * If Protect has no stream for this quality yet, one is created - that is the same as switching
     * on "RTSP" for the camera in the Protect UI.
     */
    async getStreamToken(cameraId: string, quality: UnifiQuality): Promise<string> {
        const url = `/cameras/${encodeURIComponent(cameraId)}/rtsps-stream`;
        let streams = (await this.http.get<Partial<Record<UnifiQuality, string | null>>>(url)).data;
        if (!streams?.[quality]) {
            streams = (
                await this.http.post<Partial<Record<UnifiQuality, string | null>>>(url, { qualities: [quality] })
            ).data;
        }
        const link = streams?.[quality];
        if (!link) {
            throw new Error(`UniFi Protect did not return a ${quality} quality stream for camera ${cameraId}`);
        }
        const token = new URL(link).pathname.replace(/^\//, '');
        if (!token) {
            throw new Error(`Unexpected stream link from UniFi Protect: ${link}`);
        }
        return token;
    }
}
