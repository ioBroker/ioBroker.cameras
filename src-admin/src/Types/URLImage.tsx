import React from 'react';

import { TextField } from '@mui/material';

import { I18n } from '@iobroker/adapter-react-v5';
import type { CameraConfigUrl } from '../types';
import ConfigGeneric, { type ConfigProps } from './ConfigGeneric';

const styles: Record<'page' | 'url', React.CSSProperties> = {
    page: {
        width: '100%',
    },
    url: {
        width: '100%',
    },
};

export default class UrlImageConfig extends ConfigGeneric<CameraConfigUrl> {
    constructor(props: ConfigProps<CameraConfigUrl>) {
        super(props);

        this.state = {
            url: this.props.settings.url || '',
        };
    }

    reportSettings(): void {
        this.props.onChange({
            url: this.state.url,
        });
    }

    render(): React.JSX.Element {
        return (
            <div style={styles.page}>
                <TextField
                    variant="standard"
                    key="url"
                    style={styles.url}
                    label={I18n.t('Camera URL')}
                    value={this.state.url}
                    onChange={e => this.setState({ url: e.target.value }, () => this.reportSettings())}
                />
            </div>
        );
    }
}
