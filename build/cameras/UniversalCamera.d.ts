import type { CameraConfigAny, CameraConfigUniversal, ProcessData } from '../types';
import GenericRtspCamera from './GenericRtspCamera';
export default class UniversalCamera extends GenericRtspCamera {
    protected config: CameraConfigUniversal;
    private basicAuth;
    private simpleURL;
    constructor(adapter: ioBroker.Adapter, config: CameraConfigAny, ffmpegPath: string);
    init(): Promise<void>;
    processSimple(): Promise<ProcessData>;
    process(): Promise<ProcessData>;
}
