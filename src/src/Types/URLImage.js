import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';

import TextField from '@mui/material/TextField';

import I18n from '@iobroker/adapter-react-v5/i18n';

const styles = theme => ({
    page: {
        width: '100%'
    },
    url: {
        width: '100%'
    }
});

class Config extends Component {
    constructor(props) {
        super(props);

        const state = JSON.parse(JSON.stringify(this.props.settings));
        // set default values
        state.url      = state.url || '';

        this.state = state;
    }

    render() {
        return <div className={this.props.classes.page}>
            <TextField
                variant="standard"
                key="url"
                className={this.props.classes.url}
                label={I18n.t('Camera URL')}
                value={this.state.url}
                onChange={e => {
                    this.setState({url: e.target.value}, () =>
                        this.props.onChange({
                            url: this.state.url
                        }));
                }}
            />
        </div>;
    }
}

Config.propTypes = {
    onChange: PropTypes.func.isRequired,
    defaultTimeout: PropTypes.number,
    settings: PropTypes.object.isRequired,
};

export default withStyles(styles)(Config);
