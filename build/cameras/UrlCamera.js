"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GenericCamera_1 = __importDefault(require("./GenericCamera"));
const httpSnapshot_1 = require("../lib/httpSnapshot");
class UrlCamera extends GenericCamera_1.default {
    config;
    runningRequest = null;
    constructor(adapter, config) {
        super(adapter, config);
        this.config = config;
    }
    async init() {
        // check parameters
        if (!this.config.url ||
            typeof this.config.url !== 'string' ||
            (!this.config.url.startsWith('http://') && !this.config.url.startsWith('https://'))) {
            throw new Error(`Invalid URL: "${this.config.url}"`);
        }
        return super.init();
    }
    async process() {
        if (this.runningRequest) {
            return this.runningRequest;
        }
        // A snapshot URL as well as an MJPEG stream, of which the first frame is taken
        this.runningRequest = (0, httpSnapshot_1.fetchSnapshot)(this.config.url, { timeout: this.config.timeout })
            // Also on failure - a request left behind here would be handed out to every later
            // caller, so one unreachable camera would stay broken until the adapter restarts
            .finally(() => (this.runningRequest = null));
        return this.runningRequest;
    }
}
exports.default = UrlCamera;
//# sourceMappingURL=UrlCamera.js.map