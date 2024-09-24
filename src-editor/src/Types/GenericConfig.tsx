import { Component } from 'react';

import type { AdminConnection, IobTheme, ThemeType } from '@iobroker/adapter-react-v5';

export type CameraType = 'url' | 'urlBasicAuth' | 'rtsp' | 'reolinkE1' | 'eufy' | 'hikam';

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
}

export interface GenericConfigProps {
    socket: AdminConnection;
    onChange: (settings: Record<string, any>) => void;
    native: Record<string, any>;
    decrypt: (textToDecrypt: string, cb: (decryptedText: string) => void) => void;
    encrypt: (textToEncrypt: string, cb: (encryptedText: string) => void) => void;
    themeType: ThemeType;
    settings: Record<string, any>;
    theme: IobTheme;
}

class GenericConfig<TState> extends Component<GenericConfigProps, TState> {
    protected constructor(props: GenericConfigProps) {
        super(props);

        this.state = JSON.parse(JSON.stringify(this.props.settings));
    }

    // eslint-disable-next-line class-methods-use-this,react/no-unused-class-component-methods
    reportSettings(): void {}
}

export default GenericConfig;
