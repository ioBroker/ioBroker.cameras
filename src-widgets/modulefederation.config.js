const makeFederation = require('@iobroker/vis-2-widgets-react-dev/modulefederation.config');

module.exports = makeFederation(
    'vis2CameraWidgets',
    {
        './RtspCamera': './src/RtspCamera',
        './translations': './src/translations',
    }
);