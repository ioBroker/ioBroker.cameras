import RTSP from './RTSP';
import type { RTSPHiKamSettings, RTSPImageSettings } from '../types';

// documentation https://www.wiwacam.com/de/mw1-minikamera-kurzanleitung-und-faq/
// https://support.hikam.de/support/solutions/articles/16000070656-zugriff-auf-kameras-der-2-generation-via-onvif-f%C3%BCr-s6-q8-a7-2-generation-

class HikamCamera extends RTSP {
    async init(settings: RTSPHiKamSettings): Promise<void> {
        // check parameters
        if (!settings.ip || typeof settings.ip !== 'string') {
            throw new Error(`Invalid IP: "${settings.ip}"`);
        }

        const _settings: RTSPImageSettings = JSON.parse(JSON.stringify(settings));
        _settings.port = '554';
        _settings.urlPath = settings.quality === 'high' ? '/stream=0' : '/stream=1';
        await super.init(_settings);
    }
}

export default HikamCamera;
