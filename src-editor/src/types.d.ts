import type { URLImageSettings } from './Types/URLImage';
import type { UrlBasicAuthImageSettings } from './Types/URLBasicAuthImage';
import type { RTSPImageSettings } from './Types/RTSPImage';
import type { RTSPReolinkE1Settings } from './Types/RTSPReolinkE1';
import type { RTSPEufySettings } from './Types/RTSPEufy';
import type { RTSPHiKamSettings } from './Types/RTSPHiKam';

export type CameraSettings =
    | URLImageSettings
    | UrlBasicAuthImageSettings
    | RTSPImageSettings
    | RTSPReolinkE1Settings
    | RTSPEufySettings
    | RTSPHiKamSettings;

export interface CamerasInstanceNative {
    cameras: CameraSettings[];
    webInstance: string;
    bind: string;
    defaultTimeout: number;
    key: string;
    port: number;
    ffmpegPath: string;
    tempPath: string;
    defaultCacheTimeout: string;
    dateFormat: string;
}
