import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
    TextField,
} from '@mui/material';

import { I18n } from '@iobroker/adapter-react-v5';

const styles = {
    page: {
        width: '100%',
    },
    url: {
        width: '100%',
    },
};

class Config extends Component {
    constructor(props) {
        super(props);

        const state = JSON.parse(JSON.stringify(this.props.settings));
        // set default values
        state.url  = state.url || '';

        this.state = state;
    }

    reportSettings() {
        this.props.onChange({
            url: this.state.url,
        });
    }

    render() {
        return <div style={styles.page}>
            <TextField
                variant="standard"
                key="url"
                style={styles.url}
                label={I18n.t('Camera URL')}
                value={this.state.url}
                onChange={e => this.setState({ url: e.target.value }, () =>
                    this.reportSettings())}
            />
        </div>;
    }
}

Config.propTypes = {
    onChange: PropTypes.func.isRequired,
    defaultTimeout: PropTypes.number,
    settings: PropTypes.object.isRequired,
};

export default Config;
