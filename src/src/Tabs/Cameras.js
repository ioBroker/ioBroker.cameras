import React, {Component} from 'react';
import {withStyles} from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import MessageDialog from '@iobroker/adapter-react/Dialogs/Message';
import CircularProgress from '@material-ui/core/CircularProgress';
import Fab from '@material-ui/core/Fab';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

import IconDelete from '@material-ui/icons/Delete';
import IconEdit from '@material-ui/icons/Edit';

import I18n from '@iobroker/adapter-react/i18n';

import URLImage from '../Types/URLImage';
import TextField from '@material-ui/core/TextField';

const TYPES = {
    'url': {Config: URLImage}
};

const styles = theme => ({
    tab: {
        width: '100%',
        height: '100%'
    },
    column: {
        display: 'inline-block',
        verticalAlign: 'top',
        marginRight: 20,
        height: '100%',
        overflow: 'hidden',
        width: 'calc(50% - 20px)',
        minWidth: 300,
        maxWidth: 450
    },
    columnDiv: {
        height: 'calc(100% - 60px)',
        overflow: 'auto',
        minWidth: 300
    },
    enumLineEnabled: {
        position: 'absolute',
        right: 0,
        top: 0,
    },
    enumLineEdit: {
        //float: 'right'
        position: 'absolute',
        top: 5,
        right: 50
    },
    enumLineName: {

    },
    enumLineSubName:{
        fontStyle: 'italic',
    },
    enumLine: {
        height: 48,
        width: '100%',
        position: 'relative'
    },
    enumLineId: {
        display: 'block',
        fontStyle: 'italic',
        fontSize: 12
    },
    columnHeader: {
        background: theme.palette.primary.light,
        padding: 10,
        color: theme.palette.primary.contrastText
    }
});

class Server extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
        };
    }

    renderMessage() {
        if (this.state.message) {
            return (<MessageDialog text={this.state.message} onClose={() => this.setState({message: ''})}/>);
        } else {
            return null;
        }
    }

    renderConfigDialog() {
        if (this.state.editCam !== null) {
            const cam = this.props.native.cameras[this.state.editCam];
            let Config = (TYPES[cam.type] || TYPES.url).Config;

            return (<Dialog
                maxWidth="lg"
                open={true}
                onClose={() => this.state.editCam !== null && this.setState({editCam: null})}
            >
                <DialogTitle >Edit camera</DialogTitle>
                <DialogContent>(<Config settings={cam} onChange={settings => this.editedSettings = JSON.stringify(settings)}/>)</DialogContent>
                <DialogActions>
                    <Button onClick={this.setState({editCam: null})}>{I18n.t('Cancel')}</Button>
                    <Button onClick={() => {
                        const cameras = JSON.parse(JSON.stringify(this.props.native.cameras));
                        if (this.editedSettings) {
                            cameras[this.state.editCam] = JSON.parse(this.editedSettings);
                            this.props.onChange('cameras', cameras, () => this.setState({editCam: null}));
                        } else {
                            this.setState({editCam: null});
                        }
                    }} color="primary">{I18n.t('Apply')}</Button>
                </DialogActions>
            </Dialog>);
        } else {
            return null;
        }
    }

    renderCamera(cam, i) {
        return (<div>
            <div><TextField
                key="name"
                className={this.props.classes.name}
                label={I18n.t('Name')}
                value={cam.name}
                onChange={e => {
                    const cameras = JSON.parse(JSON.stringify(this.props.native.cameras));
                    cameras[i].name = e.target.value;
                    this.props.onChange('cameras', cameras);
                }}
            /></div>
            <div><FormControl className={this.props.classes.type}>
                <InputLabel>{I18n.t('Type')}</InputLabel>
                <Select
                    value={cam.type}
                    onChange={e => {
                        const cameras = JSON.parse(JSON.stringify(this.props.native.cameras));
                        cameras[i].type = e.target.value;
                        this.props.onChange('cameras', cameras);
                    }}
                >
                    {Object.keys(TYPES).map(type => (<MenuItem value={type}>{TYPES[type].name || type}</MenuItem>))}
                </Select>
            </FormControl></div>
            <Fab onClick={() => this.onEdit(i, cam)}><IconEdit /></Fab>
            <Fab onClick={() => {
                const cameras = JSON.parse(JSON.stringify(this.props.native.cameras));
                cameras.splice(i, 1);
                this.props.onChange('cameras', cameras);
            }}><IconDelete /></Fab>
        </div>);
    }

    render() {
        if (this.state.loading) {
            return (<CircularProgress />);
        }
        return (
            <div className={this.props.classes.tab}>
                {this.props.native.cameras.map((cam, i) => this.renderCamera(cam, i))}
                {this.renderConfigDialog()}
                {this.renderMessage()}
            </div>
        );
    }
}

Server.propTypes = {
    common: PropTypes.object.isRequired,
    native: PropTypes.object.isRequired,
    instance: PropTypes.number.isRequired,
    adapterName: PropTypes.string.isRequired,
    onError: PropTypes.func,
    onLoad: PropTypes.func,
    onChange: PropTypes.func,
    socket: PropTypes.object.isRequired,
};

export default withStyles(styles)(Server);
