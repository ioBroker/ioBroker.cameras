import GenericCamera from './GenericCamera';
import type { CameraConfigAny, CameraConfigUrl, ProcessData } from '../types';
export default class UrlCamera extends GenericCamera {
    protected config: CameraConfigUrl;
    private runningRequest;
    constructor(adapter: ioBroker.Adapter, config: CameraConfigAny);
    init(): Promise<void>;
    process(): Promise<ProcessData>;
}
