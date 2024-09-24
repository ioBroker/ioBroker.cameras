import UrlBasicAuthCamera from './UrlBasicAuth';
import type { URLImageSettings } from '../types';

class UrlCamera extends UrlBasicAuthCamera {
    init(settings: URLImageSettings): Promise<void> {
        // check parameters
        if (
            !settings.url ||
            typeof settings.url !== 'string' ||
            (!settings.url.startsWith('http://') && !settings.url.startsWith('https://'))
        ) {
            throw new Error(`Invalid URL: "${settings.url}"`);
        }

        this.timeout = parseInt((settings.timeout || this.adapter.config.defaultTimeout) as string, 10) || 2000;
        this.cacheTimeout =
            parseInt((settings.cacheTimeout || this.adapter.config.defaultCacheTimeout) as string, 10) || 10000;

        this.settings = settings;

        return Promise.resolve();
    }
}

export default UrlCamera;
