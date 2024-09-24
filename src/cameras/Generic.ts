import type { ProcessImageReturnType } from '../types';
import sharp, { type OverlayOptions } from 'sharp';
import moment from 'moment/moment';

abstract class GenericCamera {
    protected runningRequest: null | Promise<ProcessImageReturnType> = null;

    protected settings: Record<string, any>;

    protected adapter: ioBroker.Adapter;

    protected cacheTimeout: number = 0;

    protected cache: {
        // when the image was taken
        ts: number;
        // query parameters of cached image
        params: string;
        // Cached image
        data: ProcessImageReturnType | null;
    } | null = null;

    public constructor(adapter: ioBroker.Adapter) {
        this.adapter = adapter;
    }

    abstract init(settings: Record<string, any>): Promise<void>;
    async unload(): Promise<void> {
        // do nothing
    }
    abstract process(): Promise<ProcessImageReturnType>;

    async getCameraImage(querySettings?: {
        w?: number;
        h?: number;
        angle?: number;
        noCache?: boolean;
    }): Promise<ProcessImageReturnType> {
        if (!this.settings) {
            throw new Error('init not called');
        }

        this.adapter.log.debug(
            `Request ${this.settings.type} ${this.settings.ip || this.settings.url || ''} ${this.settings.name}`,
        );

        const params = {
            w: parseInt(querySettings?.w || this.settings.width, 10) || 0,
            h: parseInt(querySettings?.h || this.settings.height, 10) || 0,
            angle: parseInt(querySettings?.angle || this.settings.angle, 10) || 0,
        };

        if (
            !querySettings?.noCache &&
            this.cache &&
            this.cache.ts > Date.now() &&
            JSON.stringify(this.cache.params) === JSON.stringify(params)
        ) {
            this.adapter.log.debug(
                `Take from cache ${this.settings.name} ${this.settings.type} ${this.settings.ip || this.settings.url}`,
            );
            return this.cache.data;
        }

        let data = await this.process();
        if (data) {
            data = await this.resizeImage(data, params.w, params.h);
            data = await this.rotateImage(data, params.angle);
            data = await this.addTextToImage(
                data,
                this.settings.addTime ? this.adapter.config.dateFormat || 'LTS' : null,
                this.settings.title,
            );

            if (this.cacheTimeout) {
                this.cache = {
                    data,
                    ts: Date.now() + this.cacheTimeout,
                    params: JSON.stringify(params),
                };
            }

            await this.adapter.writeFileAsync(
                this.adapter.namespace,
                `/${this.settings.name}.jpg`,
                Buffer.from(data.body),
            );
            return data;
        }
        throw new Error('No data from camera');
    }

    resizeImage(data: ProcessImageReturnType, width: number, height: number): Promise<ProcessImageReturnType> {
        if (!sharp) {
            this.adapter.log.warn('Module sharp is not installed. Please install it to resize images');
            return Promise.resolve({ body: data.body, contentType: 'image/jpeg' });
        }

        if (!width && !height) {
            return sharp(data.body)
                .jpeg()
                .toBuffer()
                .then(body => ({ body, contentType: 'image/jpeg' }));
        }

        return sharp(data.body)
            .resize(width || null, height || null)
            .jpeg()
            .toBuffer()
            .then(body => ({ body, contentType: 'image/jpeg' }));
    }

    rotateImage(data: ProcessImageReturnType, angle: number): Promise<ProcessImageReturnType> {
        if (!angle) {
            return sharp(data.body)
                .jpeg()
                .toBuffer()
                .then(body => ({ body, contentType: 'image/jpeg' }));
        }
        return sharp(data.body)
            .rotate(angle)
            .jpeg()
            .toBuffer()
            .then(body => ({ body, contentType: 'image/jpeg' }));
    }

    async addTextToImage(
        data: ProcessImageReturnType,
        dateFormat: string,
        title: string,
    ): Promise<ProcessImageReturnType> {
        if (!dateFormat && !title) {
            return data;
        }
        const date = dateFormat ? moment().locale(this.adapter.language).format(dateFormat) : '';

        const metadata = await sharp(data.body).metadata();

        const layers: OverlayOptions[] = [];

        if (title) {
            layers.push({
                input: {
                    text: {
                        text: title,
                        dpi: metadata.height * 0.2,
                    },
                },
                top: Math.round(metadata.height * 0.95),
                left: Math.round(metadata.width * 0.01),
                blend: 'add',
            });
        }

        if (date) {
            layers.push({
                input: {
                    text: {
                        text: date,
                        dpi: metadata.height * 0.2,
                    },
                },
                top: Math.round(metadata.height * 0.02),
                left: Math.round(metadata.width * 0.01),
                blend: 'add',
            });
        }

        return sharp(data.body)
            .composite(layers)
            .jpeg()
            .toBuffer()
            .then(body => ({ body, contentType: 'image/jpeg' }));
    }
}

export default GenericCamera;
