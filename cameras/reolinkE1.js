const { getRtspSnapshot } = require('./rtsp');
const path = require('path');

function init(adapter, cam) {
    adapter.__urlCameras = adapter.__urlCameras || {};
    adapter.__urlCameras[cam.name] = true;

    // check parameters
    if (!cam.ip || typeof cam.ip !== 'string') {
        return Promise.reject(`Invalid IP: "${cam.ip}"`);
    }

    cam.decodedPassword = adapter.decrypt(cam.password);
    if (cam.cacheTimeout === undefined || cam.cacheTimeout === null || cam.cacheTimeout === '') {
        cam.cacheTimeout = adapter.config.defaultCacheTimeout;
    } else {
        cam.cacheTimeout = parseInt(cam.cacheTimeout, 10) || 0;
    }

    cam.settings = JSON.parse(JSON.stringify(cam));
    cam.settings.port = 554;
    cam.settings.urlPath = cam.quality === 'high' ? '/h264Preview_01_main' : '/h264Preview_01_sub';

    return Promise.resolve();
}

function unload(adapter, cam) {
    if (adapter.__urlCameras[cam.name]) {
        delete adapter.__urlCameras[cam.name];
    }
    // after last unload all the resources must be cleared too
    if (Object.keys(adapter.__urlCameras)) {
        // unload
    }

    // do nothing
    return Promise.resolve();
}

function process(adapter, cam) {
    if (cam.cache && cam.cacheTime > Date.now()) {
        return Promise.resolve(cam.cache);
    }

    if (cam.runningRequest) {
        return cam.runningRequest;
    }

    adapter.log.debug(`Requesting Reolink E1 from ${cam.ip}...`);

    const outputFileName = path.normalize(`${adapter.config.tempPath}/${cam.ip.replace(/[.:]/g, '_')}.jpg`);

    cam.runningRequest = getRtspSnapshot(adapter.config.ffmpegPath, cam.settings, outputFileName)
        .then(body => {
            cam.runningRequest = null;
            adapter.log.debug(`Reolink E1 from ${cam.ip}. Done!`);

            const result = {
                body,
                contentType: 'image/jpeg',
            };

            if (cam.cacheTimeout) {
                cam.cache = result;
                cam.cacheTime = Date.now() + cam.cacheTimeout;
            }

            return result;
        });

    return cam.runningRequest;
}

module.exports = {
    init,
    process,
    unload,
};