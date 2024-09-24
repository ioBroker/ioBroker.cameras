declare global {
    namespace ioBroker {
        interface AdapterConfig extends CamerasAdapterConfig {
            port: number;
            key: string;
            webInstance: string;
            defaultTimeout: number;
            defaultCacheTimeout: number;
            allowIPs: string | true;
            ffmpegPath: string;
            tempPath: string;
            dateFormat: string;
            language: ioBroker.Languages;
            cameras: GenericCameraSettings[];
        }
    }
}

export type CameraType = 'url' | 'urlBasicAuth' | 'rtsp' | 'reolinkE1' | 'eufy' | 'hikam';

export interface GenericCamera {
    a: string;
}

export interface GenericCameraSettings {
    id: number;
    name: string;
    type: CameraType;
    ip?: string;
    title?: string;
    desc?: string;
    enabled?: boolean;
    url?: string;
    timeout?: string;
    cacheTimeout?: string;
    addTime?: boolean;
    rtsp?: boolean;
    width?: number;
    height?: number;
    angle?: number;
}

export interface URLImageSettings extends GenericCameraSettings {
    url: string;
}
export interface UrlBasicAuthImageSettings extends URLImageSettings {
    ip: string;
    password: string;
    username: string;
    url: string;
}
export interface RTSPImageSettings extends GenericCameraSettings {
    ip: string;
    password?: string;
    username?: string;

    port?: string;
    urlPath?: string;
    url?: string;
    originalWidth?: string;
    originalHeight?: string;
    prefix?: string;
    suffix?: string;
    protocol?: 'tcp' | 'udp';
}

export interface RTSPReolinkE1Settings extends GenericCameraSettings {
    ip: string;
    password: string;
    username: string;
    quality: 'high' | 'low';
}

export interface RTSPEufySettings extends GenericCameraSettings {
    ip: string;
    oid: string;
    useOid: boolean;
    eusecInstalled: boolean;
    showSelectId: boolean;
}

export interface RTSPHiKamSettings extends GenericCameraSettings {
    ip: string;
    password: string;
    username: string;
    quality: 'high' | 'low';
}

export type CameraSettings =
    | URLImageSettings
    | UrlBasicAuthImageSettings
    | RTSPImageSettings
    | RTSPReolinkE1Settings
    | RTSPEufySettings
    | RTSPHiKamSettings;

export type ProcessImageReturnType = {
    body: Buffer;
    contentType: 'image/jpeg';
};
