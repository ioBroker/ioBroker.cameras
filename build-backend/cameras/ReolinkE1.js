"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RTSP_1 = __importDefault(require("./RTSP"));
// documentation https://reolink.com/wp-content/uploads/2017/01/Reolink-CGI-command-v1.61.pdf
class ReolinkE1Camera extends RTSP_1.default {
    async init(settings) {
        // check parameters
        if (!settings.ip || typeof settings.ip !== 'string') {
            throw new Error(`Invalid IP: "${settings.ip}"`);
        }
        const _settings = JSON.parse(JSON.stringify(settings));
        _settings.port = '554';
        _settings.urlPath = settings.quality === 'high' ? '/h264Preview_01_main' : '/h264Preview_01_sub';
        await super.init(_settings);
        return Promise.resolve();
    }
}
exports.default = ReolinkE1Camera;
