import GenericCamera from './GenericCamera';
import type { ContentType, ProcessData, CameraConfigAny } from '../types';
import { type RtspOptions } from './rtspCommon';
export default class GenericRtspCamera extends GenericCamera {
    private width;
    private ratio;
    protected decodedPassword: string;
    private lastFrame;
    private monitor;
    protected runningRequest: Promise<{
        body: Buffer;
        contentType: ContentType;
    }> | null;
    private lastBase64Frame;
    private proc;
    isRtsp: boolean;
    protected settings: RtspOptions | null;
    private readonly ffmpegPath;
    constructor(adapter: ioBroker.Adapter, config: CameraConfigAny, ffmpegPath: string);
    init(): Promise<void>;
    getPassword(): string;
    destroy(): Promise<void>;
    process(): Promise<ProcessData>;
    getRtspURL(): string;
    startWebStream(options?: {
        width?: number;
    }): Promise<void>;
    stopWebStream(restart?: boolean): Promise<void>;
}
