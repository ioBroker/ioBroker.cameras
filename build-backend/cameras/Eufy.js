"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_url_1 = require("node:url");
const RTSP_1 = __importDefault(require("./RTSP"));
class EufyCamera extends RTSP_1.default {
    async init(settings) {
        if (settings.useOid && !settings.oid) {
            throw new Error(`Invalid object ID: "${settings.oid}"`);
        }
        // check parameters
        if (!settings.useOid && (!settings.ip || typeof settings.ip !== 'string')) {
            throw new Error(`Invalid IP: "${settings.ip}"`);
        }
        const _settings = JSON.parse(JSON.stringify(settings));
        if (settings.useOid) {
            const url = await this.adapter.getForeignStateAsync(settings.oid);
            const parts = settings.oid.split('.');
            parts.pop();
            parts.push('rtsp_stream');
            const rtspEnabled = await this.adapter.getForeignStateAsync(parts.join('.'));
            if (rtspEnabled && !rtspEnabled.val) {
                await this.adapter.setForeignStateAsync(parts.join('.'), true);
            }
            if (url?.val) {
                const u = new node_url_1.URL(url.val);
                _settings.ip = u.hostname;
                _settings.port = u.port;
                _settings.urlPath = u.pathname;
                _settings.username = u.username;
                this.decodedPassword = u.password;
            }
        }
        else {
            _settings.port = '80';
            _settings.urlPath = '/live0';
        }
        await super.init(_settings);
    }
}
exports.default = EufyCamera;
