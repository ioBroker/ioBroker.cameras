import type { CameraConfigAny, CamerasAdapterConfig, ProcessData } from '../types';

export default abstract class GenericCamera {
    protected adapter: ioBroker.Adapter;
    protected initialized = false;
    protected config: CameraConfigAny;
    public readonly path: string;
    public isRtsp: boolean = false;
    /**
     * A snapshot of this camera has a price beyond the request: a Eufy camera without RTSP of its
     * own is woken up through its station for it. Such a camera is left out of the initial
     * `fillFiles()` in main.ts - filling the cache is not worth a battery at every adapter start.
     */
    public wakesUpForSnapshot: boolean = false;
    protected streamSubscribes: { camera: string; clientId: string }[] | undefined;

    protected constructor(adapter: ioBroker.Adapter, config: CameraConfigAny) {
        this.adapter = adapter;
        this.config = config;
        this.path = `/${config.name}`;
    }

    getName(): string {
        return this.config.name;
    }

    registerRtspStreams(streamSubscribes: { camera: string; clientId: string }[]): void {
        this.streamSubscribes = streamSubscribes;
    }

    init(): Promise<void> {
        this.initialized = true;

        this.config.timeout =
            parseInt(
                (this.config.timeout as string) ||
                    ((this.adapter.config as CamerasAdapterConfig).defaultTimeout as string),
                10,
            ) || 2000;

        return Promise.resolve();
    }

    destroy(): Promise<void> {
        this.initialized = false;

        // do nothing
        return Promise.resolve();
    }

    startWebStream(_options?: { width?: number }): Promise<void> {
        throw new Error('Not implemented');
    }

    stopWebStream(_restart?: boolean): Promise<void> {
        throw new Error('Not implemented');
    }

    abstract process(): Promise<ProcessData>;
}
