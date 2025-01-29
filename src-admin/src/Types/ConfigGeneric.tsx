import { type JSX, Component } from 'react';
import type { AdminConnection, IobTheme, ThemeType } from '@iobroker/adapter-react-v5';
import type { CameraAdapterConfig } from '../types';

export interface ConfigProps<T> {
    onChange: (
        settings: Omit<
            T,
            'name' | 'type' | 'desc' | 'timeout' | 'cacheTimeout' | 'addTime' | 'title' | 'id' | 'enabled' | 'rtsp'
        >,
    ) => void;
    settings: Omit<
        T,
        'name' | 'type' | 'desc' | 'timeout' | 'cacheTimeout' | 'addTime' | 'title' | 'id' | 'enabled' | 'rtsp'
    >;
    native: CameraAdapterConfig;
    decrypt: (text: string, callback: (decrypted: string) => void) => void;
    encrypt: (text: string, callback: (encrypted: string) => void) => void;
    theme: IobTheme;
    themeType: ThemeType;
    socket: AdminConnection;
}

export default abstract class ConfigGeneric<T, S = object> extends Component<
    ConfigProps<T>,
    Omit<T, 'name' | 'type' | 'desc' | 'timeout' | 'cacheTimeout' | 'addTime' | 'id' | 'title' | 'enabled' | 'rtsp'> & S
> {
    static isRtsp = false;

    abstract render(): JSX.Element;
}
