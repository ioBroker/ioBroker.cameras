import PropTypes from 'prop-types';

class Generic extends window.visRxWidget {
    static getI18nPrefix() {
        return 'cameras_';
    }
}

Generic.propTypes = {
    context: PropTypes.object,
    themeType: PropTypes.string,
    style: PropTypes.object,
    data: PropTypes.object,
};

export default Generic;
