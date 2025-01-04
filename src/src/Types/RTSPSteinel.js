const { getRtspSnapshot, getRtspURL } = require('./rtsp');
const path = require('path');

function init(adapter, cam) {
    adapter.__urlCameras = adapter.__urlCameras || {};
    adapter.__urlCameras[cam.name] = true;

    // check parameters
    if (!cam.ip || typeof cam.ip !== 'string') {
        return Promise.reject(`Invalid IP: "${cam.ip}"`);
    }

    cam.decodedPassword = cam.password ? adapter.decrypt(cam.password) : '';

    // Construct the RTSP URL
    cam.settings = JSON.parse(JSON.stringify(cam));
    cam.settings.port = 554;
    cam.settings.urlPath = `user=${cam.username || 'admin'}&password=${cam.decodedPassword || ''}&channel=1&stream=${cam.quality === 'high' ? '0' : '1'}.sdp?`;
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

    adapter.log.debug(`Requesting Steinel Cam from ${cam.ip}...`);

    const outputFileName = path.normalize(`${adapter.config.tempPath}/${cam.ip.replace(/[.:]/g, '_')}.jpg`);

    if (!cam.settings) {
        return Promise.reject(`Invalid settings for ${JSON.stringify(cam)}`);
    }

    cam.runningRequest = getRtspSnapshot(adapter.config.ffmpegPath, cam.settings, outputFileName, adapter)
        .then(body => {
            cam.runningRequest = null;
            adapter.log.debug(`Steinel Cam from ${cam.ip}. Done!`);

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
