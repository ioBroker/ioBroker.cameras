import GenericCamera from './GenericCamera';
import type { CameraConfigAny, CameraConfigUrlBasicAuth, ContentType, ProcessData } from '../types';

import axios from 'axios';

export default class UrlBasicAuthCamera extends GenericCamera {
    protected config: CameraConfigUrlBasicAuth;
    private basicAuth: string | undefined;

    private runningRequest: Promise<{ body: Buffer; contentType: ContentType }> | null = null;

    constructor(adapter: ioBroker.Adapter, config: CameraConfigAny) {
        super(adapter, config);
        this.config = config as CameraConfigUrlBasicAuth;
    }

    async init(): Promise<void> {
        // check parameters
        if (
            !this.config.url ||
            typeof this.config.url !== 'string' ||
            (!this.config.url.startsWith('http://') && !this.config.url.startsWith('https://'))
        ) {
            throw new Error(`Invalid URL: "${this.config.url}"`);
        }

        this.config.password = this.config.password || '';

        // Calculate basic authentication. The password was encrypted and must be decrypted
        this.basicAuth = this.config.username
            ? `Basic ${Buffer.from(`${this.config.username}:${this.adapter.decrypt(this.config.password)}`).toString('base64')}`
            : undefined;

        return super.init();
    }

    async process(): Promise<ProcessData> {
        if (this.runningRequest) {
            return this.runningRequest;
        }

        const options: axios.AxiosRequestConfig = {
            responseType: 'arraybuffer',
            validateStatus: status => status < 400,
            timeout: this.config.timeout as number,
        };
        if (this.basicAuth) {
            options.headers = { Authorization: this.basicAuth };
        }

        this.runningRequest = axios
            .get(this.config.url, options)
            .then(response => ({
                body: response.data,
                contentType: response.headers['Content-type'] || response.headers['content-type'],
            }))
            .catch(error => {
                if (error.response) {
                    throw new Error(error.response.data || error.response.status);
                } else {
                    throw new Error(error.code);
                }
            })
            // Also on failure - a request left behind here would be handed out to every later
            // caller, so one unreachable camera would stay broken until the adapter restarts
            .finally(() => (this.runningRequest = null));

        return this.runningRequest;
    }
}
