import React, {Component} from 'react';
import {withStyles} from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import MessageDialog from '@iobroker/adapter-react/Dialogs/Message';
import Fab from '@material-ui/core/Fab';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

import IconDelete from '@material-ui/icons/Delete';
import IconEdit from '@material-ui/icons/Edit';
import IconAdd from '@material-ui/icons/Add';
import IconUp from '@material-ui/icons/ArrowUpward';
import IconDown from '@material-ui/icons/ArrowDownward';

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
    lineDiv: {
        width: '100%',
        paddingBottom: 5,
        borderBottom: '1px dashed gray'
    },
    lineText: {
        display: 'inline-block',
        width: 200,
    },
    lineDesc: {
        display: 'inline-block',
        width: 'calc(100% - 550px)',
    },
    lineType: {
        display: 'inline-block',
        width: 150,
    },
    lineEdit: {
        display: 'inline-block',
        marginLeft: 10,
        marginTop: 10,
    },
    lineUp: {
        display: 'inline-block',
        marginLeft: 10,
        marginTop: 10,
    },
    lineDown: {
        display: 'inline-block',
        marginLeft: 10,
        marginTop: 10,
    },
    lineDelete: {
        display: 'inline-block',
        marginLeft: 10,
        marginTop: 10,
    },
    type: {
        width: '100%'
    },
    name:  {
        width: 'calc(100% - 10px)',
    },
    desc:  {
        width: 'calc(100% - 10px)',
    },
    lineNoButtonUp:  {
        display: 'inline-block',
        width: 40,
        marginLeft: 10,
    },
    lineNoButtonDown:  {
        display: 'inline-block',
        width: 40,
        marginLeft: 10,
    },});

class Server extends Component {
    constructor(props) {
        super(props);

        this.state = {
            editCam: false,
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
        if (this.state.editCam !== false) {
            const cam = this.props.native.cameras[this.state.editCam];
            let Config = (TYPES[cam.type] || TYPES.url).Config;

            return (<Dialog
                maxWidth="lg"
                fullWidth={true}
                open={true}
                onClose={() => this.state.editCam !== null && this.setState({editCam: false})}
            >
                <DialogTitle>{I18n.t('Edit camera %s [%s]', cam.name, cam.type)}</DialogTitle>
                <DialogContent><Config settings={cam} onChange={settings => this.editedSettings = JSON.stringify(settings)}/></DialogContent>
                <DialogActions>
                    <Button onClick={() => this.setState({editCam: false})}>{I18n.t('Cancel')}</Button>
                    <Button onClick={() => {
                        const cameras = JSON.parse(JSON.stringify(this.props.native.cameras));
                        if (this.editedSettings) {
                            cameras[this.state.editCam] = JSON.parse(this.editedSettings);
                            this.props.onChange('cameras', cameras, () => this.setState({editCam: false}));
                        } else {
                            this.setState({editCam: false});
                        }
                    }} color="primary">{I18n.t('Apply')}</Button>
                </DialogActions>
            </Dialog>);
        } else {
            return null;
        }
    }

    renderCamera(cam, i) {
        const error = this.props.native.cameras.find((c, ii) => c.name === cam.name && ii !== i);
        return (<div key={'cam' + i} className={this.props.classes.lineDiv}>
            <div className={this.props.classes.lineText}>
                <TextField
                    className={this.props.classes.name}
                    label={I18n.t('Name')}
                    error={error}
                    value={cam.name}
                    helperText={error ? I18n.t('Duplicate name') : ''}
                    onChange={e => {
                        const cameras = JSON.parse(JSON.stringify(this.props.native.cameras));
                        cameras[i].name = e.target.value.replace(/[^-_\da-zA-Z]/g, '_');
                        this.props.onChange('cameras', cameras);
                    }}
                />
            </div>
            <div className={this.props.classes.lineDesc}>
                <TextField
                    className={this.props.classes.desc}
                    label={I18n.t('Description')}
                    value={cam.desc}
                    onChange={e => {
                        const cameras = JSON.parse(JSON.stringify(this.props.native.cameras));
                        cameras[i].desc = e.target.value;
                        this.props.onChange('cameras', cameras);
                    }}
                />
            </div>
            <div className={this.props.classes.lineType}>
                <FormControl className={this.props.classes.type}>
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
                </FormControl>
            </div>
            {i ? (<Fab size="small" className={this.props.classes.lineUp} onClick={() => {
                const cameras = JSON.parse(JSON.stringify(this.props.native.cameras));
                const cam = cameras[i];
                cameras.splice(i, 1);
                cameras.splice(i - 1, 0, cam);
                this.props.onChange('cameras', cameras);
            }}><IconUp /></Fab>) : (<div className={this.props.classes.lineNoButtonUp}>&nbsp;</div>)}
            {i !== this.props.native.cameras.length - 1 ? (<Fab size="small" className={this.props.classes.lineDown} onClick={() => {
                const cameras = JSON.parse(JSON.stringify(this.props.native.cameras));
                const cam = cameras[i];
                cameras.splice(i, 1);
                cameras.splice(i + 1, 0, cam);
                this.props.onChange('cameras', cameras);
            }}><IconDown /></Fab>) : (<div className={this.props.classes.lineNoButtonDown}>&nbsp;</div>)}
            <Fab size="small" className={this.props.classes.lineEdit} onClick={() => this.setState({editCam: i})}><IconEdit /></Fab>
            <Fab size="small" className={this.props.classes.lineDelete} onClick={() => {
                const cameras = JSON.parse(JSON.stringify(this.props.native.cameras));
                cameras.splice(i, 1);
                this.props.onChange('cameras', cameras);
            }}><IconDelete /></Fab>
        </div>);
    }

    render() {
        return (
            <div className={this.props.classes.tab}>
                <Fab size="small" onClick={() => {
                    const cameras = JSON.parse(JSON.stringify(this.props.native.cameras));
                    let i = 1;
                    while(cameras.find(cam => cam.name === 'cam' + i)) i++;
                    cameras.push({name: 'cam' + i, type: 'url'});
                    this.props.onChange('cameras', cameras);
                }}><IconAdd /></Fab>
                {this.props.native.cameras ? this.props.native.cameras.map((cam, i) => this.renderCamera(cam, i)) : null}
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
