import type { CameraConfigAny, CameraConfigRtsp } from '../types';
import GenericRtspCamera from './GenericRtspCamera';
export default class RtspCamera extends GenericRtspCamera {
    protected config: CameraConfigRtsp;
    constructor(adapter: ioBroker.Adapter, config: CameraConfigAny, ffmpegPath: string);
    init(): Promise<void>;
}
