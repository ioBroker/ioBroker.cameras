import { Adapter, type AdapterOptions } from '@iobroker/adapter-core';
import type { CameraRequestInternal, CamerasAdapterConfig, ProcessData, ProcessDataEx } from './types';
export declare class CamerasAdapter extends Adapter {
    private lang;
    private streamSubscribes;
    config: CamerasAdapterConfig;
    private bForceInterval;
    private server;
    /** Processed pictures per camera, one entry per requested `{w,h,angle}` combination */
    private cache;
    private allowIPs;
    private cameras;
    private bForce;
    private ffmpegPath;
    private go2rtc;
    constructor(options?: Partial<AdapterOptions>);
    onStateChange(id: string, state: ioBroker.State | null | undefined): void;
    onUnload(cb: () => void): void;
    testCamera(item: CameraRequestInternal): Promise<ProcessData | null>;
    /**
     * Grab a picture and run it through the image pipeline.
     *
     * This is the single implementation behind all three entry points (private HTTP server, `image`
     * message and the initial {@link fillFiles}), so that they cannot drift apart in caching or in
     * what they do to the picture.
     */
    getCameraImageData(cam: CameraRequestInternal): Promise<ProcessDataEx>;
    getCameraImage(cam: CameraRequestInternal): Promise<Buffer | string>;
    onClientSubscribe(msg: {
        clientId: string;
        message: ioBroker.Message;
    }): Promise<{
        accepted: boolean;
        heartbeat?: number;
        error?: string;
    }>;
    onClientUnsubscribe(clientId: string, obj: ioBroker.Message | undefined): void;
    onMessage(obj: ioBroker.Message): Promise<void>;
    unloadCameras(cb: () => void): void;
    resizeImage(data: ProcessDataEx, width: number | undefined, height: number | undefined): Promise<ProcessData>;
    rotateImage(data: ProcessDataEx, angle: number | undefined): Promise<ProcessData>;
    addTextToImage(data: ProcessDataEx, dateFormat: string | undefined, title: string | null | undefined): Promise<ProcessData>;
    startWebServer(): void;
    syncConfig(): Promise<void>;
    fillFiles(): Promise<void>;
    syncData(): Promise<void>;
    main(): Promise<void>;
}
