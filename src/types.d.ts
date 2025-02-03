import type { Metadata } from 'sharp';

export type ContentType = string;
export type CameraType = 'url' | 'urlBasicAuth' | 'rtsp' | 'reolinkE1' | 'eufy' | 'hikam';

export type CameraName = string;

export interface CameraConfig {
    name: CameraName;
    type: CameraType;
    id: number;
    desc?: string;
    timeout?: number | string;
    cacheTimeout?: number | string;
    addTime?: boolean;
    title?: string;
    enabled?: boolean;
    rtsp?: boolean;
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
