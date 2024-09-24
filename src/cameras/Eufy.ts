import { URL } from 'node:url';
import RTSP from './RTSP';
import type { RTSPEufySettings, RTSPImageSettings } from '../types';

class EufyCamera extends RTSP {
    async init(settings: RTSPEufySettings): Promise<void> {
        if (settings.useOid && !settings.oid) {
            throw new Error(`Invalid object ID: "${settings.oid}"`);
        }

        // check parameters
        if (!settings.useOid && (!settings.ip || typeof settings.ip !== 'string')) {
            throw new Error(`Invalid IP: "${settings.ip}"`);
        }

        const _settings: RTSPImageSettings = JSON.parse(JSON.stringify(settings));

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
                const u = new URL(url.val);
                _settings.ip = u.hostname;
                _settings.port = u.port;
                _settings.urlPath = u.pathname;
                _settings.username = u.username;

                this.decodedPassword = u.password;
            }
        } else {
            _settings.port = '80';
            _settings.urlPath = '/live0';
        }

        await super.init(_settings);
    }
}

export default EufyCamera;
