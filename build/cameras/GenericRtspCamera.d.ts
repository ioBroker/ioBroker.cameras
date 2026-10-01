import GenericCamera from './GenericCamera';
import type { ContentType, ProcessData, CameraConfigAny } from '../types';
import { type RtspOptions } from './rtspCommon';
import type Go2RtcServer from '../lib/Go2RtcServer';
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
    private go2rtc;
    constructor(adapter: ioBroker.Adapter, config: CameraConfigAny, ffmpegPath: string);
    init(): Promise<void>;
    getPassword(): string;
    /**
     * Hide the credentials of an RTSP URL before it is logged: the user info, and the secret of a
     * camera that has none - UniFi Protect carries its stream token in the path instead.
     */
    protected maskUrl(url: string): string;
    /** Hand over a running go2rtc instance. If set, snapshots are taken from it instead of ffmpeg */
    setGo2Rtc(server: Go2RtcServer | null): void;
    /**
     * Snapshot via go2rtc. Returns null if go2rtc is unavailable or fails, so the caller can
     * fall back to the ffmpeg path.
     */
    private processViaGo2Rtc;
    destroy(): Promise<void>;
    process(): Promise<ProcessData>;
    /**
     * Scratch file ffmpeg writes the snapshot to.
     *
     * Named after the camera, not after its address: a main stream and a sub stream of the same
     * camera are two entries with the same IP, and they would overwrite each other's frame.
     */
    private getSnapshotFileName;
    getRtspURL(): string;
    startWebStream(options?: {
        width?: number;
    }): Promise<void>;
    stopWebStream(restart?: boolean): Promise<void>;
}
