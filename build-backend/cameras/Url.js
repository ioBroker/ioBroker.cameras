"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UrlBasicAuth_1 = __importDefault(require("./UrlBasicAuth"));
class UrlCamera extends UrlBasicAuth_1.default {
    init(settings) {
        // check parameters
        if (!settings.url ||
            typeof settings.url !== 'string' ||
            (!settings.url.startsWith('http://') && !settings.url.startsWith('https://'))) {
            throw new Error(`Invalid URL: "${settings.url}"`);
        }
        this.timeout = parseInt((settings.timeout || this.adapter.config.defaultTimeout), 10) || 2000;
        this.cacheTimeout =
            parseInt((settings.cacheTimeout || this.adapter.config.defaultCacheTimeout), 10) || 10000;
        this.settings = settings;
        return Promise.resolve();
    }
}
exports.default = UrlCamera;
