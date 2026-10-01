export type ContentType = string;
export type CameraType =
    'url' | 'urlBasicAuth' | 'rtsp' | 'reolinkE1' | 'eufy' | 'hikam' | 'universal' | 'instar' | 'unifi';

export type CameraName = string;

export interface CameraConfig {
    name: CameraName;
    type: CameraType;
    id: number;
    rtsp: boolean;
    desc?: string;
    timeout?: number | string;
    cacheTimeout?: number | string;
    addTime?: boolean;
    title?: string;
    enabled?: boolean;
}

export interface CameraConfigUrl extends CameraConfig {
    type: 'url';
    url: string;
}

export interface CameraConfigUrlBasicAuth extends CameraConfig {
    type: 'urlBasicAuth';
    url: string;
    password: string;
    username: string;
}

export interface CameraInstarConfig extends CameraConfig {
    type: 'instar';
    ip: string;
    password: string;
    username: string;
    quality: 'low' | 'high';
}

export interface CameraConfigEufy extends CameraConfig {
    type: 'eufy';
    ip: string;
    oid: string;
    useOid: boolean;
}

export interface CameraConfigHiKam extends CameraConfig {
    type: 'hikam';
    ip: string;
    password: string;
    username: string;
    quality: 'low' | 'high';
}

export interface CameraConfigRtsp extends CameraConfig {
    type: 'rtsp';
    ip: string;
    port: string | number;
    urlPath: string;
    password?: string;
    username?: string;
    originalWidth?: string | number;
    originalHeight?: string | number;
    prefix?: string;
    suffix?: string;
    protocol: 'udp' | 'tcp';
}

export interface CameraConfigUniversal extends CameraConfig {
    type: 'universal';
    ip: string;
    /** Default 554 */
    port: string | number;
    /** Path from configuration file, like "/channel80" */
    urlPath: string;
    password?: string;
    username?: string;
    urlProtocol: 'rtsp://' | 'http://' | '';
    /** Manufacturer of the camera, like "ezviz" */
    manufacturer: string;
    /** Model of the camera, like C3W */
    model: string;
    /** Value for the [CHANNEL] placeholder of the URL path */
    channel?: number | string;
    /** Value for the [WIDTH] placeholder of the URL path */
    width?: number | string;
    /** Value for the [HEIGHT] placeholder of the URL path */
    height?: number | string;
}

export interface CameraConfigReolink extends CameraConfig {
    type: 'reolinkE1';
    ip: string;
    password?: string;
    username?: string;
    quality: 'high' | 'low';
}

export interface CameraConfigUnifi extends CameraConfig {
    type: 'unifi';
    /** Address of the UniFi console or NVR that runs Protect */
    ip: string;
    /** Encrypted key for the Protect integration API. Optional - without it `token` is required */
    apiKey?: string;
    /** Protect id of the camera, picked in the dialog. Only used together with `apiKey` */
    cameraId?: string;
    /** Last part of the RTSP link Protect shows for a stream. Taken from the API if `apiKey` is set */
    token?: string;
    quality?: 'high' | 'medium' | 'low';
    /** RTSPS on port 7441 instead of RTSP on port 7447 */
    secure?: boolean;
    /** Only needed behind a port forwarding or proxy. Empty = 7447, or 7441 with `secure` */
    port?: number | string;
}

export type CameraConfigAny =
    | CameraConfigUrl
    | CameraConfigUrlBasicAuth
    | CameraConfigRtsp
    | CameraConfigEufy
    | CameraConfigHiKam
    | CameraConfigUniversal
    | CameraInstarConfig
    | CameraConfigReolink
    | CameraConfigUnifi;

export interface CamerasAdapterConfig {
    bind: string;
    port: string | number;
    key: string;
    webInstance: string;
    defaultTimeout: number | string;
    defaultCacheTimeout: number | string;
    allowIPs: string;
    ffmpegPath: string;
    tempPath: string;
    /** Use a local go2rtc process for RTSP snapshots instead of spawning ffmpeg per request */
    useGo2rtc: boolean;
    /** Explicit path to the go2rtc binary. Empty = search the usual locations */
    go2rtcPath: string;
    /** Port of the local go2rtc HTTP API */
    go2rtcApiPort: number | string;
    /** Port of the go2rtc internal RTSP server (localhost only, required for transcoding) */
    go2rtcRtspPort: number | string;
    dateFormat: 'LTS';
    language: ioBroker.Languages;
    cameras: CameraConfigAny[];
}
