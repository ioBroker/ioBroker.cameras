const { getRtspSnapshot, getRtspURL } = require('./rtsp');
const path = require('node:path');

// documentation https://reolink.com/wp-content/uploads/2017/01/Reolink-CGI-command-v1.61.pdf

function init(adapter, cam) {
    adapter.__urlCameras = adapter.__urlCameras || {};
    adapter.__urlCameras[cam.name] = true;

    // check parameters
    if (!cam.ip || typeof cam.ip !== 'string') {
        return Promise.reject(`Invalid IP: "${cam.ip}"`);
    }

    cam.decodedPassword = cam.password ? adapter.decrypt(cam.password) : '';

    cam.settings = JSON.parse(JSON.stringify(cam));
    cam.settings.port = 554;
    cam.settings.urlPath = cam.quality === 'high' ? '/h264Preview_01_main' : '/h264Preview_01_sub';
    cam.settings.timeout = parseInt(cam.timeout || adapter.config.defaultTimeout, 10) || 2000;

    return Promise.resolve();
}

function unload(adapter, cam) {
    if (adapter.__urlCameras[cam.name]) {
        delete adapter.__urlCameras[cam.name];
    }
    // after last unload, all the resources must be cleared too
    if (Object.keys(adapter.__urlCameras)) {
        // unload
    }

    // do nothing
    return Promise.resolve();
}

function process(adapter, cam) {
    if (cam.runningRequest) {
        return cam.runningRequest;
    }

    adapter.log.debug(`Requesting Reolink E1 from ${cam.ip}...`);

    const outputFileName = path.normalize(`${adapter.config.tempPath}/${cam.ip.replace(/[.:]/g, '_')}.jpg`);

    if (!cam.settings) {
        return Promise.reject(`Invalid settings for ${JSON.stringify(cam)}`);
    }

    cam.runningRequest = getRtspSnapshot(adapter.config.ffmpegPath, cam.settings, outputFileName, adapter)
        .then(body => {
            cam.runningRequest = null;
            adapter.log.debug(`Reolink E1 from ${cam.ip}. Done!`);

            return {
                body,
                contentType: 'image/jpeg',
            };
        });

    return cam.runningRequest;
}

module.exports = {
    init,
    process,
    unload,
    getRtspURL,
};
