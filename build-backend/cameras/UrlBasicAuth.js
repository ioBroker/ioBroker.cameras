"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const Generic_1 = __importDefault(require("./Generic"));
class UrlBasicAuthCamera extends Generic_1.default {
    timeout = 0;
    basicAuth = '';
    init(settings) {
        // check parameters
        if (!settings.url ||
            typeof settings.url !== 'string' ||
            (!settings.url.startsWith('http://') && !settings.url.startsWith('https://'))) {
            throw new Error(`Invalid URL: "${settings.url}"`);
        }
        if (!settings.username || typeof settings.username !== 'string') {
            throw new Error(`Invalid Username: "${settings.username}"`);
        }
        settings.password = settings.password || '';
        this.timeout = parseInt((settings.timeout || this.adapter.config.defaultTimeout), 10) || 2000;
        this.cacheTimeout =
            parseInt((settings.cacheTimeout || this.adapter.config.defaultCacheTimeout), 10) || 10000;
        // Calculate basic authentication. The password was encrypted and must be decrypted
        this.basicAuth = `Basic ${Buffer.from(`${settings.username}:${this.adapter.decrypt(settings.password)}`).toString('base64')}`;
        this.settings = settings;
        return Promise.resolve();
    }
    async process() {
        if (this.runningRequest instanceof Promise) {
            return this.runningRequest;
        }
        this.runningRequest = axios_1.default
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
            }
            else {
                this.adapter.log.error(`Cannot read ${this.settings.url}: ${error}`);
                throw new Error(error.code);
            }
        });
        return this.runningRequest;
    }
}
exports.default = UrlBasicAuthCamera;
