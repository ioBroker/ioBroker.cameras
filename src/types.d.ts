import type { Metadata } from 'sharp';

export type ContentType = string;
export type CameraType = 'url' | 'urlBasicAuth' | 'rtsp' | 'reolinkE1' | 'eufy' | 'hikam' | 'instar' | 'universal';

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
    urlProtocol: 'rtsp://' | 'http://';
    /** Manufacturer of the camera, like "ezviz" */
    manufacturer: string;
    /** Model of the camera, like C3W */
    model: string;
    channel?: number | string;
}

export interface CameraConfigReolink extends CameraConfig {
    type: 'reolinkE1';
    ip: string;
    password?: string;
    username?: string;
    quality: 'high' | 'low';
}

export type CameraConfigAny =
    | CameraConfigUrl
    | CameraConfigUrlBasicAuth
    | CameraConfigRtsp
    | CameraConfigEufy
    | CameraConfigHiKam
    | CameraConfigUniversal
    | CameraInstarConfig
    | CameraConfigReolink;

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

export interface ProcessData {
    // Buffer or base64 string
    body: Buffer | string;
    contentType: ContentType;
}

export interface ProcessDataEx extends ProcessData {
    metadata?: Metadata;
}

export interface CameraRequestInternal extends CameraConfig {
    width?: number;
    height?: number;
    angle?: number;
    noCache?: boolean;
}

export interface CameraRequest extends Omit<CameraRequestInternal, 'type' | 'id'> {
    type?: CameraType;
    id?: number;
}
