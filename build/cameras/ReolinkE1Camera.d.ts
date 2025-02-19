import GenericRtspCamera from './GenericRtspCamera';
import type { CameraConfigAny, CameraConfigReolink } from '../types';
export default class ReolinkE1Camera extends GenericRtspCamera {
    protected config: CameraConfigReolink;
    constructor(adapter: ioBroker.Adapter, config: CameraConfigAny, ffmpegPath: string);
    init(): Promise<void>;
}
