import GenericRtspCamera from './GenericRtspCamera';
import type { CameraConfigAny, CameraConfigHiKam } from '../types';
export default class HiKamCamera extends GenericRtspCamera {
    protected config: CameraConfigHiKam;
    constructor(adapter: ioBroker.Adapter, config: CameraConfigAny, ffmpegPath: string);
    init(): Promise<void>;
}
