import GenericCamera from './GenericCamera';
import type { CameraConfigAny, CameraConfigUrl, ContentType, ProcessData } from '../types';

import axios from 'axios';

export default class UrlCamera extends GenericCamera {
    protected config: CameraConfigUrl;

    private runningRequest: Promise<{ body: Buffer; contentType: ContentType }> | null = null;

    constructor(adapter: ioBroker.Adapter, config: CameraConfigAny) {
        super(adapter, config);
        this.config = config as CameraConfigUrl;
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

        return super.init();
    }

    async process(): Promise<ProcessData> {
        if (this.runningRequest) {
            return this.runningRequest;
        }

        this.runningRequest = axios
            .get(this.config.url, {
                responseType: 'arraybuffer',
                validateStatus: status => status < 400,
                timeout: this.config.timeout as number,
            })
            .then(response => {
                this.runningRequest = null;
                return {
                    body: response.data,
                    contentType: response.headers['Content-type'] || response.headers['content-type'],
                };
            })
            .catch(error => {
                if (error.response) {
                    throw new Error(error.response.data || error.response.status);
                } else {
                    throw new Error(error.code);
                }
            });

        return this.runningRequest;
    }
}
