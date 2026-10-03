import type { CameraConfigAny, ProcessData } from '../types';
export default abstract class GenericCamera {
    protected adapter: ioBroker.Adapter;
    protected initialized: boolean;
    protected config: CameraConfigAny;
    readonly path: string;
    isRtsp: boolean;
    /**
     * A snapshot of this camera has a price beyond the request: a Eufy camera without RTSP of its
     * own is woken up through its station for it. Such a camera is left out of the initial
     * `fillFiles()` in main.ts - filling the cache is not worth a battery at every adapter start.
     */
    wakesUpForSnapshot: boolean;
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
