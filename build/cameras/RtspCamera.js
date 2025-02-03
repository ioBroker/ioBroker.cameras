"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GenericRtspCamera_1 = __importDefault(require("./GenericRtspCamera"));
class RtspCamera extends GenericRtspCamera_1.default {
    config;
    constructor(adapter, config) {
        super(adapter, config);
        this.config = config;
    }
    async init() {
        this.decodedPassword = this.config.password ? this.adapter.decrypt(this.config.password) : '';
        this.settings = {
            ip: this.config.ip,
            port: this.config.port || 554,
            urlPath: this.config.urlPath,
            username: this.config.username,
            originalWidth: this.config.originalWidth,
            originalHeight: this.config.originalHeight,
            prefix: this.config.prefix,
            suffix: this.config.suffix,
            protocol: this.config.protocol || 'tcp',
        };
        return super.init();
    }
}
exports.default = RtspCamera;
//# sourceMappingURL=RtspCamera.js.map