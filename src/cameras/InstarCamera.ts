import GenericCamera from './GenericCamera';
import type { CameraConfigAny, CameraInstarConfig, ContentType, ProcessData } from '../types';

import axios from 'axios';

export default class InstarCamera extends GenericCamera {
    protected config: CameraInstarConfig;
    private link: string = '';

    private runningRequest: Promise<{ body: Buffer; contentType: ContentType }> | null = null;

    constructor(adapter: ioBroker.Adapter, config: CameraConfigAny) {
        super(adapter, config);
        this.config = config as CameraInstarConfig;
    }

    async init(): Promise<void> {
        // check parameters
        if (!this.config.ip || typeof this.config.ip !== 'string') {
            throw new Error(`Invalid URL: "${this.config.ip}"`);
        }

        // The password is stored encrypted and must be decrypted before it goes into the URL
        const password = this.config.password ? this.adapter.decrypt(this.config.password) : '';

        this.link = `http://${this.config.ip}:80/tmpfs/${this.config.quality === 'low' ? 'auto' : 'snap'}.jpg?usr=${encodeURIComponent(this.config.username || '')}&pwd=${encodeURIComponent(password)}`;

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

        this.runningRequest = axios
            .get(this.link, options)
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
