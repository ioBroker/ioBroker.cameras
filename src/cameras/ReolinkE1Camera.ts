import GenericRtspCamera from './GenericRtspCamera';
import type { CameraConfigAny, CameraConfigReolink } from '../types';

// documentation https://reolink.com/wp-content/uploads/2017/01/Reolink-CGI-command-v1.61.pdf

export default class ReolinkE1Camera extends GenericRtspCamera {
    protected config: CameraConfigReolink;

    constructor(adapter: ioBroker.Adapter, config: CameraConfigAny) {
        super(adapter, config);
        this.config = config as CameraConfigReolink;
    }

    async init(): Promise<void> {
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
