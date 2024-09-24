import React, { type JSX } from 'react';

import { TextField } from '@mui/material';

import { I18n } from '@iobroker/adapter-react-v5';
import GenericConfig, { type GenericCameraSettings, type GenericConfigProps } from '../Types/GenericConfig';

const styles: Record<string, React.CSSProperties> = {
    page: {
        width: '100%',
    },
    url: {
        width: '100%',
    },
};

export interface URLImageSettings extends GenericCameraSettings {
    url: string;
}

class URLImageConfig extends GenericConfig<URLImageSettings> {
    constructor(props: GenericConfigProps) {
        super(props);

        // set default values
        Object.assign(this.state, {
            url: this.state.url || '',
        });
    }

    reportSettings(): void {
        this.props.onChange({
            url: this.state.url,
        });
    }

    render(): JSX.Element {
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

export default URLImageConfig;
