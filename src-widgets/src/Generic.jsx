import PropTypes from 'prop-types';

import {
    Card, CardContent,
} from '@mui/material';

import { VisRxWidget } from '@iobroker/vis-2-widgets-react-dev';

class Generic extends (window.visRxWidget || VisRxWidget) {
    getPropertyValue = stateName => this.state.values[`${this.state.rxData[stateName]}.val`];

    static getI18nPrefix() {
        return 'vis_2_widgets_material_';
    }

    // TODO: remove this method when vis-2-widgets-react-dev is updated
    static getText(text) {
        if (typeof text === 'object') {
            return text[(window.visRxWidget || VisRxWidget).getLanguage()] || text.en;
        }
        return text;
    }

    async getParentObject(id) {
        const parts = id.split('.');
        parts.pop();
        const parentOID = parts.join('.');
        return this.props.context.socket.getObject(parentOID);
    }

    static getObjectIcon(obj, id, imagePrefix) {
        imagePrefix = imagePrefix || '../..'; // http://localhost:8081';
        let src = '';
        const common = obj && obj.common;

        if (common) {
            const cIcon = common.icon;
            if (cIcon) {
                if (!cIcon.startsWith('data:image/')) {
                    if (cIcon.includes('.')) {
                        let instance;
                        if (obj.type === 'instance' || obj.type === 'adapter') {
                            src = `${imagePrefix}/adapter/${common.name}/${cIcon}`;
                        } else if (id && id.startsWith('system.adapter.')) {
                            instance = id.split('.', 3);
                            if (cIcon[0] === '/') {
                                instance[2] += cIcon;
                            } else {
                                instance[2] += `/${cIcon}`;
                            }
                            src = `${imagePrefix}/adapter/${instance[2]}`;
                        } else {
                            instance = id.split('.', 2);
                            if (cIcon[0] === '/') {
                                instance[0] += cIcon;
                            } else {
                                instance[0] += `/${cIcon}`;
                            }
                            src = `${imagePrefix}/adapter/${instance[0]}`;
                        }
                    } else {
                        return null;
                    }
                } else {
                    src = cIcon;
                }
            }
        }

        return src || null;
    }

    wrapContent(content, addToHeader, cardContentStyle, headerStyle, onCardClick) {
        return super.wrapContent(content, addToHeader, cardContentStyle, headerStyle, onCardClick, { Card, CardContent });
    }
}

Generic.propTypes = {
    context: PropTypes.object,
    themeType: PropTypes.string,
    style: PropTypes.object,
    data: PropTypes.object,
};

export default Generic;
