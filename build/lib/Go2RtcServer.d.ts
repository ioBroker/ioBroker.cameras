export interface Go2RtcOptions {
    /** Explicit path to the go2rtc binary. If empty, the usual locations are searched */
    binaryPath?: string;
    /** Port of the local go2rtc HTTP API, default 1984 */
    apiPort?: number | string;
    /** Writable directory for the generated configuration file */
    tempPath: string;
    /** Path to ffmpeg, handed to go2rtc for transcoding sources */
    ffmpegPath?: string;
    /**
     * Port of the internal RTSP server, bound to localhost. It cannot be switched off:
     * go2rtc pipes the output of `ffmpeg:`/`exec:` sources back through it, so disabling the
     * module breaks every transcoded source with "rtsp module disabled".
     */
    rtspPort?: number | string;
    /**
     * Listen address for WebRTC media, e.g. ":8555". Empty disables WebRTC.
     * Note that WebRTC media never passes through the ioBroker.web proxy - only the signalling
     * does - so this port has to be reachable by the browser itself.
     */
    webrtcListen?: string;
}
export default class Go2RtcServer {
    private readonly adapter;
    private readonly options;
    private readonly apiPort;
    private proc;
    private binaryPath;
    private running;
    private readonly client;
    constructor(adapter: ioBroker.Adapter, options: Go2RtcOptions);
    get url(): string;
    isRunning(): boolean;
    /**
     * Locate the go2rtc binary: explicit setting first, then the copy shipped next to the adapter,
     * then the system PATH.
     */
    static findBinary(configured: string | undefined, log?: ioBroker.Log): string;
    /**
     * Write a minimal configuration. Only the API is exposed and it is bound to localhost -
     * the adapter is the only client. Streams are added at runtime through the API, so no
     * credentials are ever written to disk.
     */
    private writeConfig;
    start(): Promise<boolean>;
    private waitForApi;
    stop(): Promise<void>;
    /** Register a stream, or re-register it if the source URL changed */
    ensureStream(name: string, source: string): Promise<void>;
    /** Fetch a single JPEG frame. go2rtc transcodes from whatever the source delivers */
    getSnapshot(name: string, timeoutMs?: number): Promise<Buffer>;
}
