import type { CameraConfigAny, CameraConfigEufy } from '../types';
import GenericRtspCamera from './GenericRtspCamera';
export default class EufyCamera extends GenericRtspCamera {
    protected config: CameraConfigEufy;
    constructor(adapter: ioBroker.Adapter, config: CameraConfigAny, ffmpegPath: string);
    init(): Promise<void>;
}
