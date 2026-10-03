import GenericCamera from './GenericCamera';
import type { CameraConfigAny, CameraConfigUrl, ContentType, ProcessData } from '../types';

import { fetchSnapshot } from '../lib/httpSnapshot';

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

        // A snapshot URL as well as an MJPEG stream, of which the first frame is taken
        this.runningRequest = fetchSnapshot(this.config.url, { timeout: this.config.timeout })
            // Also on failure - a request left behind here would be handed out to every later
            // caller, so one unreachable camera would stay broken until the adapter restarts
            .finally(() => (this.runningRequest = null));

        return this.runningRequest;
    }
}
