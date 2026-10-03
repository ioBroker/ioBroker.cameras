import type { CameraConfigAny, CameraConfigEufy, ProcessData } from '../types';
import GenericRtspCamera from './GenericRtspCamera';
export default class EufyCamera extends GenericRtspCamera {
    protected config: CameraConfigEufy;
    /**
     * Object ID of the eusec device, set for a camera without RTSP of its own. eusec streams such
     * a camera through the station into its own go2rtc - but only after `start_stream` was
     * pressed, and it ends the stream again after its "max. livestream duration".
     */
    private livestreamDevice;
    constructor(adapter: ioBroker.Adapter, config: CameraConfigAny, ffmpegPath: string);
    init(): Promise<void>;
    private applyUrl;
    /**
     * Prepare the address of the P2P stream without starting it - that would wake the camera up
     * at every adapter start. eusec builds the link as rtsp://<hostname>:<go2rtc_rtsp_port>/<serial>.
     */
    private initLivestream;
    /** Press `start_stream` unless the stream already runs. Returns true if it was started now */
    private ensureLivestream;
    process(): Promise<ProcessData>;
    startWebStream(options?: {
        width?: number;
    }): Promise<void>;
}
