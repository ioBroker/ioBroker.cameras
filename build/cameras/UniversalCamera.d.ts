import type { CameraConfigAny, CameraConfigUniversal, ProcessData } from '../types';
import GenericRtspCamera from './GenericRtspCamera';
export default class UniversalCamera extends GenericRtspCamera {
    protected config: CameraConfigUniversal;
    private basicAuth;
    private simpleURL;
    constructor(adapter: ioBroker.Adapter, config: CameraConfigAny, ffmpegPath: string);
    /**
     * Replace the placeholders ispyconnect.com uses in its URL table.
     *
     * A placeholder may appear more than once in one path, so every replacement is global.
     * `[PASWORD]` is a typo in the source data and means the same as `[PASSWORD]`; `[AUTH]` is the
     * base64 of `user:password` that the Dahua-style URLs append as `authbasic=`.
     */
    private buildUrlPath;
    init(): Promise<void>;
    processSimple(): Promise<ProcessData>;
    process(): Promise<ProcessData>;
}
