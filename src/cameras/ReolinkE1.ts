import RTSP from './RTSP';
import type {RTSPImageSettings, RTSPReolinkE1Settings} from '../types';

// documentation https://reolink.com/wp-content/uploads/2017/01/Reolink-CGI-command-v1.61.pdf

class ReolinkE1Camera extends RTSP {
    async init(settings: RTSPReolinkE1Settings): Promise<void> {
        // check parameters
        if (!settings.ip || typeof settings.ip !== 'string') {
            throw new Error(`Invalid IP: "${settings.ip}"`);
        }

        const _settings: RTSPImageSettings = JSON.parse(JSON.stringify(settings));
        _settings.port = '554';
        _settings.urlPath = settings.quality === 'high' ? '/h264Preview_01_main' : '/h264Preview_01_sub';

        await super.init(_settings);

        return Promise.resolve();
    }
}

export default ReolinkE1Camera;
