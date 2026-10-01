"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_https_1 = __importDefault(require("node:https"));
const axios_1 = __importDefault(require("axios"));
/**
 * Client for the official UniFi Protect integration API (`/proxy/protect/integration/v1`), which
 * authenticates with an API key created under "Settings → Control Plane → Integrations".
 *
 * The console ships a self-signed certificate, so it is not verified. The requests stay in the
 * local network, and the alternative - asking every user to install their console's certificate -
 * is what nobody does.
 */
class UnifiProtectClient {
    http;
    constructor(host, apiKey, timeoutMs = 5000) {
        this.http = axios_1.default.create({
            baseURL: `https://${host}/proxy/protect/integration/v1`,
            headers: { 'X-API-KEY': apiKey },
            httpsAgent: new node_https_1.default.Agent({ rejectUnauthorized: false }),
            timeout: timeoutMs,
        });
    }
    async getCameras() {
        const response = await this.http.get('/cameras');
        return response.data.map(cam => ({ id: cam.id, name: cam.name, state: cam.state, modelKey: cam.modelKey }));
    }
    async getSnapshot(cameraId, highQuality) {
        const response = await this.http.get(`/cameras/${encodeURIComponent(cameraId)}/snapshot`, {
            params: { highQuality },
            responseType: 'arraybuffer',
        });
        return Buffer.from(response.data);
    }
    /**
     * Stream token of the camera for the given quality, i.e. the last path segment of
     * `rtsps://<console>:7441/<token>?enableSrtp`. The same token also works for plain RTSP on 7447.
     *
     * If Protect has no stream for this quality yet, one is created - that is the same as switching
     * on "RTSP" for the camera in the Protect UI.
     */
    async getStreamToken(cameraId, quality) {
        const url = `/cameras/${encodeURIComponent(cameraId)}/rtsps-stream`;
        let streams = (await this.http.get(url)).data;
        if (!streams?.[quality]) {
            streams = (await this.http.post(url, { qualities: [quality] })).data;
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
exports.default = UnifiProtectClient;
//# sourceMappingURL=UnifiProtectClient.js.map