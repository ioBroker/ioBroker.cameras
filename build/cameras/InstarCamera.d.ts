import GenericCamera from './GenericCamera';
import type { CameraConfigAny, CameraInstarConfig, ProcessData } from '../types';
export default class InstarCamera extends GenericCamera {
    protected config: CameraInstarConfig;
    private link;
    private runningRequest;
    constructor(adapter: ioBroker.Adapter, config: CameraConfigAny);
    init(): Promise<void>;
    process(): Promise<ProcessData>;
}
