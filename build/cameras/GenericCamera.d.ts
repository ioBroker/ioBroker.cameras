import type { CameraConfigAny, ProcessData } from '../types';
export default abstract class GenericCamera {
    protected adapter: ioBroker.Adapter;
    protected initialized: boolean;
    protected config: CameraConfigAny;
    readonly path: string;
    isRtsp: boolean;
    protected streamSubscribes: {
        camera: string;
        clientId: string;
    }[] | undefined;
    protected constructor(adapter: ioBroker.Adapter, config: CameraConfigAny);
    getName(): string;
    registerRtspStreams(streamSubscribes: {
        camera: string;
        clientId: string;
    }[]): void;
    init(): Promise<void>;
    destroy(): Promise<void>;
    startWebStream(_options?: {
        width?: number;
    }): Promise<void>;
    stopWebStream(_restart?: boolean): Promise<void>;
    abstract process(): Promise<ProcessData>;
}
