import type { CameraConfigAny, CameraConfigRtsp } from '../types';
import GenericRtspCamera from './GenericRtspCamera';

export default class RtspCamera extends GenericRtspCamera {
    protected config: CameraConfigRtsp;

    constructor(adapter: ioBroker.Adapter, config: CameraConfigAny) {
        super(adapter, config);
        this.config = config as CameraConfigRtsp;
    }

    async init(): Promise<void> {
        this.decodedPassword = this.config.password ? this.adapter.decrypt(this.config.password) : '';
        this.settings = {
            ip: this.config.ip,
            port: this.config.port || 554,
            urlPath: this.config.urlPath,
            username: this.config.username,
            originalWidth: this.config.originalWidth,
            originalHeight: this.config.originalHeight,
            prefix: this.config.prefix,
            suffix: this.config.suffix,
            protocol: this.config.protocol || 'tcp',
        };

        return super.init();
    }
}
