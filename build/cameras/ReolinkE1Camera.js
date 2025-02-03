"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GenericRtspCamera_1 = __importDefault(require("./GenericRtspCamera"));
// documentation https://reolink.com/wp-content/uploads/2017/01/Reolink-CGI-command-v1.61.pdf
class ReolinkE1Camera extends GenericRtspCamera_1.default {
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
            urlPath: this.config.quality === 'high' ? '/h264Preview_01_main' : '/h264Preview_01_sub',
        };
        return super.init();
    }
}
exports.default = ReolinkE1Camera;
//# sourceMappingURL=ReolinkE1Camera.js.map