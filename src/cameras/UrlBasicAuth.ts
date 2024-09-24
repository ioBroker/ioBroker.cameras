import axios from 'axios';
import GenericCamera from './Generic';
import type { ProcessImageReturnType, UrlBasicAuthImageSettings } from '../types';

class UrlBasicAuthCamera extends GenericCamera {
    protected timeout = 0;

    protected basicAuth = '';

    init(settings: UrlBasicAuthImageSettings): Promise<void> {
        // check parameters
        if (
            !settings.url ||
            typeof settings.url !== 'string' ||
            (!settings.url.startsWith('http://') && !settings.url.startsWith('https://'))
        ) {
            throw new Error(`Invalid URL: "${settings.url}"`);
        }
        if (!settings.username || typeof settings.username !== 'string') {
            throw new Error(`Invalid Username: "${settings.username}"`);
        }

        settings.password = settings.password || '';

        this.timeout = parseInt((settings.timeout || this.adapter.config.defaultTimeout) as string, 10) || 2000;
        this.cacheTimeout =
            parseInt((settings.cacheTimeout || this.adapter.config.defaultCacheTimeout) as string, 10) || 10000;

        // Calculate basic authentication. The password was encrypted and must be decrypted
        this.basicAuth = `Basic ${Buffer.from(`${settings.username}:${this.adapter.decrypt(settings.password)}`).toString('base64')}`;

        this.settings = settings;

        return Promise.resolve();
    }

    async process(): Promise<ProcessImageReturnType> {
        if (this.runningRequest instanceof Promise) {
            return this.runningRequest;
        }

        this.runningRequest = axios
            .get(this.settings.url, {
                responseType: 'arraybuffer',
                validateStatus: status => status < 400,
                timeout: this.timeout,
                headers: this.basicAuth ? { Authorization: this.basicAuth } : undefined,
            })
            .then(response => {
                this.runningRequest = null;
                return {
                    body: response.data,
                    contentType: response.headers['Content-type'] || response.headers['content-type'] || 'image/jpeg',
                };
            })
            .catch(error => {
                if (error.response) {
                    this.adapter.log.error(`Cannot read ${this.settings.url}: ${error.response.data || error}`);
                    throw new Error(error.response.data || error.response.status);
                } else {
                    this.adapter.log.error(`Cannot read ${this.settings.url}: ${error}`);
                    throw new Error(error.code);
                }
            });

        return this.runningRequest;
    }
}

export default UrlBasicAuthCamera;
