import React, {Component} from 'react';
import {withStyles} from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Checkbox from '@material-ui/core/Checkbox';
import Fab from '@material-ui/core/Fab';
import CircularProgress from '@material-ui/core/CircularProgress';

import DialogError from '@iobroker/adapter-react/Dialogs/Error';
import I18n from '@iobroker/adapter-react/i18n';

import {MdRefresh as IconRefresh} from 'react-icons/md';
import {FaFolder as IconFolderClosed} from 'react-icons/fa';
import {FaFolderOpen as IconFolderOpened} from 'react-icons/fa';

const WIDTH_TYPE = 100;
const WIDTH_VAL  = 200;
const WIDTH_NAME = WIDTH_VAL + WIDTH_TYPE;

const styles = theme => ({
    tab: {
        width: '100%',
        height: '100%',
        overflow: 'hidden',
    },
    tree: {
        height: 'calc(100% - 50px)',
        overflow: 'auto',
    },
    header: {
        background: '#666666',
        color: 'white',
        fontWeight: 'bold',
    },
    refresh: {
        margin: '10px 10px 5px 20px'
    },
    folderDiv: {
        width: '100%',
        fontWeight: 'bold',
        cursor: 'pointer'
    },
    itemDiv: {
        width: '100%',
    },
    itemCheckbox: {
        padding: 0,
    },
    detailsDiv: {

    },
    folderWait: {

    },
    folderIcon: {
        width: 18,
        height: 18,
        marginRight: 3,
        marginLeft: 2,
        verticalAlign: 'middle',
    },
    itemVariable: {
    },
    itemUnsupported: {
        opacity: 0.7
    },
    itemName: {
        display: 'inline-block'
    },
    itemType: {
        width: WIDTH_TYPE,
        display: 'inline-block',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        fontSize: 14,
        whiteSpace: 'nowrap',
        fontStyle: 'italic',
    },
    itemVal: {
        width: WIDTH_VAL,
        display: 'inline-block',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        textAlign: 'right',
        whiteSpace: 'nowrap',
        fontSize: 14
    }
});

class Browser extends Component {
    constructor(props) {
        super(props);

        const mapping = {};
        Object.keys(this.props.subscribes).forEach(nodeId => mapping[this.props.subscribes[nodeId].id] = nodeId);

        this.state = {
            errorText: '',
            loading: true,
            expanded: [],
            requesting: {},
            changing: [],
            updating: this.props.updating,
            subscribes: this.props.subscribes || {},
            errorDetected: false,
            mapping,
            refreshing: false,
            requestItems: true,
            details: null,
            root: {list: null, id: '', name: 'Root', fullPath: ''},
            currentPath: this.props.path || '',
            values: {}
        };
        this.requesting = {};
        this.onStateChangeBound = this.onStateChange.bind(this);
    }

    componentDidMount() {
        this.props.registerOnStateChange(this.onStateChangeBound);
    }

    componentWillUnmount() {
        this.props.registerOnStateChange(null);
    }

    showAllSelectedStates(ids) {
        ids = ids || this.state.subscribes;
        const expanded = this.state.expanded.splice(); // copy it

        Object.keys(ids).forEach(item => {
            const parts = ids[item].fullPath.split('>>');
            parts.pop();
            while (parts.length) {
                const id = parts.join('>>');
                !expanded.includes(id) && expanded.push(id);
                parts.pop();
            }
        });

        expanded.sort();
        this.setState({expanded});
    }

    renderError() {
        if (!this.state.errorText) {
            return null;
        }
        return (<DialogError text={this.state.errorText} title={I18n.t('Error')} onClose={() => this.setState({errorText: ''})}/>);
    }

    onStateChange(id, state) {
        if (this.state.mapping[id]) {
            const actualValue = this.state['val_' + this.state.mapping[id]] || {value: {dataType: state ? typeof state.val : '', value: 'null'}, statusCode: {value: 0}};
            if (!this.updateTimer) {
                this.updateState = {};
                this.updateState['val_' + this.state.mapping[id]] = {
                    value: {
                        value: state ? state.val : actualValue.value.value,
                        dataType: actualValue.value.dataType,
                    },
                    statusCode: {
                        value: actualValue.statusCode.value
                    }
                };
                this.updateTimer = setTimeout(() => {
                    this.updateTimer = null;
                    const _updateState = this.updateState;
                    this.updateState = {};
                    this.setState(_updateState);
                }, 300);
            } else {
                this.updateState['val_' + this.state.mapping[id]] = {
                    value: {
                        value: state ? state.val : actualValue.value.value,
                        dataType: actualValue.value.dataType,
                    },
                    statusCode: {
                        value: actualValue.statusCode.value
                    }
                };
            }
        }
    }

    static getDerivedStateFromProps(props, state) {
        // Re-run the filter whenever the list array or filter text change.
        // Note we need to store prevPropsList and prevFilterText to detect changes.
        if (props.subscribes !== state.subscribes) {
            const mapping = {};
            Object.keys(props.subscribes).forEach(nodeId => mapping[props.subscribes[nodeId].id] = nodeId);
            return {subscribes: props.subscribes, updating: false, mapping, changing: []};
        }
        if (props.updating !== state.updating) {
            return {updating: props.updating};
        }
        return null;
    }

    showError(text) {
        this.setState({errorText: text});
    }

    updateRectState(requesting, cb) {
        requesting = JSON.stringify(requesting);
        if (!this.state.refreshing ||  requesting !== JSON.stringify(this.state.requesting)) {
            this.setState({requesting: JSON.parse(requesting), refreshing: true}, () => cb && cb());
        } else {
            cb && cb();
        }
    }

    browseNode(node, root) {
        root = root || this.state.root;

        if (!this.requesting[node.id]) {
            this.requesting[node.id] = Date.now();

            setTimeout(() => {
                this.updateRectState(this.requesting, () =>
                    this.props.socket.sendTo(this.props.adapterName + '.' + this.props.instance, 'browse', node.id, data => {
                        this.requesting[node.id] && delete this.requesting[node.id];

                        const _root = JSON.parse(JSON.stringify(root));
                        if (data.error) {
                            this.setState({requesting: JSON.parse(JSON.stringify(this.requesting)), errorDetected: true, requestItems: false}, () => this.showError(I18n.t(data.error)));
                        } else {
                            const list = (data.list || []);
                            list.forEach(item => {
                                item.fullPath = [node.fullPath, item.id].join('>>');
                                if (item.type === 'folder') {
                                    item.list = null;
                                }
                            });

                            const _node = this._getNode(node.id, _root);
                            _node.list = list;

                            const requestItems = this.state.requestItems;
                            const newState = {requesting: JSON.parse(JSON.stringify(this.requesting)), root: _root, errorDetected: false};
                            if (requestItems) {
                                newState.requestItems = false;
                            }

                            this.setState(newState, () =>
                                requestItems && this.showAllSelectedStates());
                        }
                    }))
            }, 100);
        }
    }

    readValue(node) {
        if (node.native.nodeClass === 'Variable') {
            if (this.state['val_' + node.id] === undefined) {
                const newState = {};
                newState['val_' + node.id] = null;
                this.props.socket.sendTo(this.props.adapterName + '.' + this.props.instance, 'read', node.id, data => {
                    const newState = {};
                    newState['val_' + node.id] = data;
                    if (data && data.value && typeof data.value.value === 'object') {
                        data.value.value = JSON.stringify(data.value.value);
                    }
                    this.setState(newState);
                });
            }
        }
    }

    _getNode(id, root) {
        root = root || this.state.root;
        if (root.id === id) {
            return root;
        } else if (root.list) {
            let found = null;
            for (let i = 0; i < root.list.length; i++) {
                found = this._getNode(id, root.list[i]);
                if (found) {
                    break;
                }
            }

            return found;
        } else {
            return null;
        }
    }

    toggleFolder(node) {
        const expanded = JSON.parse(JSON.stringify(this.state.expanded));
        const pos = expanded.indexOf(node.fullPath);
        if (pos === -1) {
            expanded.push(node.fullPath);
        } else {
            expanded.splice(pos, 1);
        }
        this.setState({expanded, details: null});
    }

    renderFolder(node, level, renderContext) {
        const hasSomeSubscribes = renderContext.cachedFullPathes.find(fullPath => fullPath.startsWith(node.fullPath));
        const style = {paddingLeft: level * 20, width: 'calc(100% - ' + level * 20 + 'px)'};
        if (hasSomeSubscribes) {
            style.color = '#3399CC';
        }
        const checked = !!(node.list && hasSomeSubscribes);
        const indeterminate = checked && (!node.list || !node.list.filter(item => item.native && item.native.nodeClass === 'Variable').every(item =>
            renderContext.cachedFullPathes.includes(item.fullPath + '>>')));

        return (<div key={node.fullPath} className={this.props.classes.folderDiv} style={style} onClick={() => node.id && this.toggleFolder(node)}>
            {node.list && node.list.length ? (<Checkbox className={this.props.classes.itemCheckbox} indeterminate={indeterminate} checked={checked} size="small" onClick={e => {
                e.stopPropagation();
                if (indeterminate) {
                    // disable all
                    this.onSelectUnselectVariable(node.list.filter(item => item.native && item.native.nodeClass === 'Variable' && this.state.subscribes[item.id]), false);
                } else {
                    // enable all
                    if (checked) {
                        this.onSelectUnselectVariable(node.list.filter(item => item.native && item.native.nodeClass === 'Variable' && this.state.subscribes[item.id]), false);
                    } else {
                        this.onSelectUnselectVariable(node.list.filter(item => item.native && item.native.nodeClass === 'Variable' && !this.state.subscribes[item.id]), true);
                    }
                }
            }}/>) : null}
            {this.state.expanded.includes(node.fullPath) ? (<IconFolderOpened className={this.props.classes.folderIcon}/>) : (<IconFolderClosed className={this.props.classes.folderIcon}/>)}
            {node.name}
            {this.state.requesting[node.id] ? (<CircularProgress
                variant="indeterminate"
                disableShrink
                className={this.props.classes.folderWait}
                size={18}
                thickness={4}
            />) : null}
        </div>);
    }

    onSelectUnselectVariable(nodes, enabled) {
        if (!nodes || !nodes.length) {
            return;
        }
        const node = nodes.shift();

        if (!this.state.changing.includes(node.id)) {
            const changing = this.state.changing.splice();
            changing.push(node.id);
            this.setState({changing}, () =>
                this.props.onSubscribeChanged(node, enabled === undefined ? !this.state.subscribes[node.id] : enabled, () =>
                    setTimeout(() => this.onSelectUnselectVariable(nodes, enabled))));
        } else {
            this.props.onSubscribeChanged(node, enabled === undefined ? !this.state.subscribes[node.id] : enabled, () =>
                setTimeout(() => this.onSelectUnselectVariable(nodes, enabled)));
        }
    }

    renderVariable(node, level) {
        const style = {paddingLeft: level * 20, width: 'calc(100% - ' + level * 20 + 'px)'};
        if (this.state.values[node.id] === undefined) {
            this.readValue(node);
        }

        const type = this.state['val_' + node.id] ? this.state['val_' + node.id].value.dataType : '...';
        let val = this.state['val_' + node.id] ? this.state['val_' + node.id].value.value : '...';
        if (val === null || val === undefined) {
            val = 'null';
        }

        return (<div key={node.fullPath} className={this.props.classes.itemDiv + ' ' + this.props.classes.itemVariable} style={style}>
            {this.state.changing.includes(node.id) ? (<CircularProgress
                    variant="indeterminate"
                    disableShrink
                    className={this.props.classes.folderWait}
                    size={22}
                    thickness={4}
                />) :
                (<Checkbox className={this.props.classes.itemCheckbox} checked={!!this.state.subscribes[node.id]} size="small" onClick={() => this.onSelectUnselectVariable([node])}/>)}
            <div className={this.props.classes.itemName} style={{width: 'calc(100% - ' + (WIDTH_NAME + 22) + 'px)'}}>{node.name}</div>
            <div className={this.props.classes.itemType} title={type.toString().length > 10 ? type : ''}>{type}</div>
            <div className={this.props.classes.itemVal} title={val.toString().length > 10 ? val : ''}>{val}</div>
        </div>);
    }

    renderUnsupported(node, level) {
        const style = {paddingLeft: level * 20, width: 'calc(100% - ' + level * 20 + 'px)'};
        return (<div key={node.fullPath} className={this.props.classes.itemDiv + ' ' + this.props.classes.itemUnsupported} style={style}>
            <div style={{width: 24, display: 'inline-block'}}>&nbsp;</div>
            {node.name}
        </div>);
    }

    renderItem(node, level, renderContext) {
        node = node || this.state.root;
        level = level || 0;
        const style = {paddingLeft: level * 20, width: 'calc(100% - ' + level * 20 + 'px)'};

        if (node.list !== undefined) {
            if (!this.requesting[node.id]) {
                if (!node.list && (!node.id || this.state.expanded.includes(node.fullPath)) && !this.state.errorDetected) {
                    this.refreshFinishTimeout && clearTimeout(this.refreshFinishTimeout);
                    this.refreshFinishTimeout = null;
                    // read list
                    this.browseNode(node);
                    style.fontStyle = 'italic';
                    return this.renderFolder(node, level, renderContext);
                } else {
                    if (this.state.refreshing && !this.refreshFinishTimeout) {
                        this.refreshFinishTimeout = setTimeout(() => {
                            this.refreshFinishTimeout = null;
                            this.setState({refreshing: false});
                        }, 1000);
                    }
                }
            }
            return [
                this.renderFolder(node, level, renderContext),
                (!node.id || this.state.expanded.includes(node.fullPath)) && node.list ? node.list.map(item => this.renderItem(item, level + 1, renderContext)) : null
            ];
        } else {
            if (node.native && node.native.nodeClass === 'Variable') {
                return this.renderVariable(node, level);
            } else {
                return this.renderUnsupported(node, level);
            }
        }
    }

    onRefresh() {
        this.setState({root: {list: null, id: '', name: 'Root', fullPath: ''}, refreshing: true, errorDetected: false});
    }

    render() {
        const renderContext = {
            cachedFullPathes: Object.keys(this.state.subscribes).map(item => this.state.subscribes[item].fullPath + '>>')
        };

        return (
            <div className={this.props.classes.tab}>
                <Fab className={this.props.classes.refresh} disabled={this.state.refreshing || !!Object.keys(this.state.requesting).length} onClick={() => this.onRefresh()} size="small"><IconRefresh/></Fab>
                <div key="header" className={this.props.classes.header} style={{width: '100%'}}>
                    <div className={this.props.classes.itemName} style={{paddingLeft: 3, width: 'calc(100% - ' + (WIDTH_NAME + 11) + 'px)', borderRight: '1px solid white'}}>{I18n.t('Path')}</div>
                    <div className={this.props.classes.itemType} style={{paddingLeft: 3}}>{I18n.t('Type')}</div>
                    <div className={this.props.classes.itemVal} style={{paddingRight: 3, borderLeft: '1px solid white'}}>{I18n.t('Value')}</div>
                </div>
                <div className={this.props.classes.tree}>
                    {this.renderItem(null, null, renderContext)}
                </div>
                {this.renderError()}
            </div>
        );
    }
}

Browser.propTypes = {
    path: PropTypes.string,
    adapterName: PropTypes.string.isRequired,
    instance: PropTypes.number.isRequired,
    onChange: PropTypes.func,
    updating: PropTypes.bool,
    subscribes: PropTypes.object,
    socket: PropTypes.object.isRequired,
};

export default withStyles(styles)(Browser);
