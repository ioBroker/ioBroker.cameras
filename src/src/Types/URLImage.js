import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import I18n from '@iobroker/adapter-react/i18n';
import TextField from '@material-ui/core/TextField';

const styles = theme => ({
    page: {

    },
    url: {

    }
});

class Config extends Component {
    constructor(props) {
        super(props);

        const state = JSON.parse(JSON.stringify(this.props.settings));

        this.state = state;
    }

    render() {
        return (
            <div className={this.props.classes.page}>
                <TextField
                    key="url"
                    className={this.props.classes.url}
                    label={I18n.t('Camera URL')}
                    value={this.props.native.url}
                    onChange={e => {
                        this.setState({url: e.target.value}, () =>
                            this.props.onChange({
                                url: this.state.url
                            }));
                    }}
                />
            </div>
        );
    }
}

Config.propTypes = {
    onChange: PropTypes.func,
};

export default withStyles(styles)(Config);
