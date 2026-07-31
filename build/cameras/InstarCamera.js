"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GenericCamera_1 = __importDefault(require("./GenericCamera"));
const axios_1 = __importDefault(require("axios"));
class InstarCamera extends GenericCamera_1.default {
    config;
    link = '';
    runningRequest = null;
    constructor(adapter, config) {
        super(adapter, config);
        this.config = config;
    }
    async init() {
        // check parameters
        if (!this.config.ip || typeof this.config.ip !== 'string') {
            throw new Error(`Invalid URL: "${this.config.ip}"`);
        }
        // The password is stored encrypted and must be decrypted before it goes into the URL
        const password = this.config.password ? this.adapter.decrypt(this.config.password) : '';
        this.link = `http://${this.config.ip}:80/tmpfs/${this.config.quality === 'low' ? 'auto' : 'snap'}.jpg?usr=${encodeURIComponent(this.config.username || '')}&pwd=${encodeURIComponent(password)}`;
        return super.init();
    }
    async process() {
        if (this.runningRequest) {
            return this.runningRequest;
        }
        const options = {
            responseType: 'arraybuffer',
            validateStatus: status => status < 400,
            timeout: this.config.timeout,
        };
        this.runningRequest = axios_1.default
            .get(this.link, options)
            .then(response => {
            this.runningRequest = null;
            return {
                body: response.data,
                contentType: response.headers['Content-type'] || response.headers['content-type'],
            };
        })
            .catch(error => {
            if (error.response) {
                throw new Error(error.response.data || error.response.status);
            }
            else {
                throw new Error(error.code);
            }
        });
        return this.runningRequest;
    }
}
exports.default = InstarCamera;
//# sourceMappingURL=InstarCamera.js.map