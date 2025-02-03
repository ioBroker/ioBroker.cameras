import { URL } from 'node:url';
import type { CameraConfigAny, CameraConfigEufy } from '../types';
import GenericRtspCamera from './GenericRtspCamera';

export default class EufyCamera extends GenericRtspCamera {
    protected config: CameraConfigEufy;

    constructor(adapter: ioBroker.Adapter, config: CameraConfigAny) {
        super(adapter, config);
        this.config = config as CameraConfigEufy;
    }

    async init(): Promise<void> {
        // check parameters
        if (this.config.useOid && !this.config.oid) {
            throw new Error(`Invalid object ID: "${this.config.oid}"`);
        }
        this.settings = {
            ip: this.config.ip,
            port: 80,
        };

        // check parameters
        if (!this.config.useOid && (!this.config.ip || typeof this.config.ip !== 'string')) {
            throw new Error(`Invalid IP: "${this.config.ip}"`);
        }

        if (this.config.useOid) {
            const url = await this.adapter.getForeignStateAsync(this.config.oid);
            const parts = this.config.oid.split('.');
            parts.pop();
            parts.push('rtsp_stream');
            const rtspEnabled = await this.adapter.getForeignStateAsync(parts.join('.'));
            if (rtspEnabled && !rtspEnabled.val) {
                await this.adapter.setForeignStateAsync(parts.join('.'), true);
            }
            if (url?.val) {
                const u = new URL(url.val);
                this.settings.ip = u.hostname;
                this.settings.port = u.port;
                this.settings.urlPath = u.pathname;
                this.settings.username = u.username;
                this.decodedPassword = u.password;
            }
        } else {
            this.settings.urlPath = '/live0';
        }

        return super.init();
    }
}
