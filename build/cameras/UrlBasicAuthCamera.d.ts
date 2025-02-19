import GenericCamera from './GenericCamera';
import type { CameraConfigAny, CameraConfigUrlBasicAuth, ProcessData } from '../types';
export default class UrlBasicAuthCamera extends GenericCamera {
    protected config: CameraConfigUrlBasicAuth;
    private basicAuth;
    private runningRequest;
    constructor(adapter: ioBroker.Adapter, config: CameraConfigAny);
    init(): Promise<void>;
    process(): Promise<ProcessData>;
}
