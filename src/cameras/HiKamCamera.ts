import GenericRtspCamera from './GenericRtspCamera';
import type { CameraConfigAny, CameraConfigHiKam } from '../types';

// documentation https://www.wiwacam.com/de/mw1-minikamera-kurzanleitung-und-faq/
// https://support.hikam.de/support/solutions/articles/16000070656-zugriff-auf-kameras-der-2-generation-via-onvif-f%C3%BCr-s6-q8-a7-2-generation-

export default class HiKamCamera extends GenericRtspCamera {
    protected config: CameraConfigHiKam;

    constructor(adapter: ioBroker.Adapter, config: CameraConfigAny) {
        super(adapter, config);
        this.config = config as CameraConfigHiKam;
    }

    async init(): Promise<void> {
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
