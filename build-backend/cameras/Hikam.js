"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RTSP_1 = __importDefault(require("./RTSP"));
// documentation https://www.wiwacam.com/de/mw1-minikamera-kurzanleitung-und-faq/
// https://support.hikam.de/support/solutions/articles/16000070656-zugriff-auf-kameras-der-2-generation-via-onvif-f%C3%BCr-s6-q8-a7-2-generation-
class HikamCamera extends RTSP_1.default {
    async init(settings) {
        // check parameters
        if (!settings.ip || typeof settings.ip !== 'string') {
            throw new Error(`Invalid IP: "${settings.ip}"`);
        }
        const _settings = JSON.parse(JSON.stringify(settings));
        _settings.port = '554';
        _settings.urlPath = settings.quality === 'high' ? '/stream=0' : '/stream=1';
        await super.init(_settings);
    }
}
exports.default = HikamCamera;
