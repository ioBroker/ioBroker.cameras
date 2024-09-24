"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sharp_1 = __importDefault(require("sharp"));
const moment_1 = __importDefault(require("moment/moment"));
class GenericCamera {
    runningRequest = null;
    settings;
    adapter;
    cacheTimeout = 0;
    cache = null;
    constructor(adapter) {
        this.adapter = adapter;
    }
    async unload() {
        // do nothing
    }
    async getCameraImage(querySettings) {
        if (!this.settings) {
            throw new Error('init not called');
        }
        this.adapter.log.debug(`Request ${this.settings.type} ${this.settings.ip || this.settings.url || ''} ${this.settings.name}`);
        const params = {
            w: parseInt(querySettings?.w || this.settings.width, 10) || 0,
            h: parseInt(querySettings?.h || this.settings.height, 10) || 0,
            angle: parseInt(querySettings?.angle || this.settings.angle, 10) || 0,
        };
        if (!querySettings?.noCache &&
            this.cache &&
            this.cache.ts > Date.now() &&
            JSON.stringify(this.cache.params) === JSON.stringify(params)) {
            this.adapter.log.debug(`Take from cache ${this.settings.name} ${this.settings.type} ${this.settings.ip || this.settings.url}`);
            return this.cache.data;
        }
        let data = await this.process();
        if (data) {
            data = await this.resizeImage(data, params.w, params.h);
            data = await this.rotateImage(data, params.angle);
            data = await this.addTextToImage(data, this.settings.addTime ? this.adapter.config.dateFormat || 'LTS' : null, this.settings.title);
            if (this.cacheTimeout) {
                this.cache = {
                    data,
                    ts: Date.now() + this.cacheTimeout,
                    params: JSON.stringify(params),
                };
            }
            await this.adapter.writeFileAsync(this.adapter.namespace, `/${this.settings.name}.jpg`, Buffer.from(data.body));
            return data;
        }
        throw new Error('No data from camera');
    }
    resizeImage(data, width, height) {
        if (!sharp_1.default) {
            this.adapter.log.warn('Module sharp is not installed. Please install it to resize images');
            return Promise.resolve({ body: data.body, contentType: 'image/jpeg' });
        }
        if (!width && !height) {
            return (0, sharp_1.default)(data.body)
                .jpeg()
                .toBuffer()
                .then(body => ({ body, contentType: 'image/jpeg' }));
        }
        return (0, sharp_1.default)(data.body)
            .resize(width || null, height || null)
            .jpeg()
            .toBuffer()
            .then(body => ({ body, contentType: 'image/jpeg' }));
    }
    rotateImage(data, angle) {
        if (!angle) {
            return (0, sharp_1.default)(data.body)
                .jpeg()
                .toBuffer()
                .then(body => ({ body, contentType: 'image/jpeg' }));
        }
        return (0, sharp_1.default)(data.body)
            .rotate(angle)
            .jpeg()
            .toBuffer()
            .then(body => ({ body, contentType: 'image/jpeg' }));
    }
    async addTextToImage(data, dateFormat, title) {
        if (!dateFormat && !title) {
            return data;
        }
        const date = dateFormat ? (0, moment_1.default)().locale(this.adapter.language).format(dateFormat) : '';
        const metadata = await (0, sharp_1.default)(data.body).metadata();
        const layers = [];
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
        return (0, sharp_1.default)(data.body)
            .composite(layers)
            .jpeg()
            .toBuffer()
            .then(body => ({ body, contentType: 'image/jpeg' }));
    }
}
exports.default = GenericCamera;
