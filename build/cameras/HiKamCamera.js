"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GenericRtspCamera_1 = __importDefault(require("./GenericRtspCamera"));
// documentation https://www.wiwacam.com/de/mw1-minikamera-kurzanleitung-und-faq/
// https://support.hikam.de/support/solutions/articles/16000070656-zugriff-auf-kameras-der-2-generation-via-onvif-f%C3%BCr-s6-q8-a7-2-generation-
class HiKamCamera extends GenericRtspCamera_1.default {
    config;
    constructor(adapter, config) {
        super(adapter, config);
        this.config = config;
    }
    async init() {
        this.decodedPassword = this.config.password ? this.adapter.decrypt(this.config.password) : '';
        this.settings = {
            ip: this.config.ip,
            username: this.config.username,
            port: 554,
            urlPath: this.config.quality === 'high' ? '/stream=0' : '/stream=1',
        };
        return super.init();
    }
}
exports.default = HiKamCamera;
//# sourceMappingURL=HiKamCamera.js.map