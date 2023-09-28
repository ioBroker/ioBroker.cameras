const axios = require('axios');

function init(adapter, cam) {
    adapter.__urlCameras = adapter.__urlCameras || {};
    adapter.__urlCameras[cam.name] = true;

    // check parameters
    if (!cam.url || typeof cam.url !== 'string' || (!cam.url.startsWith('http://') && !cam.url.startsWith('https://'))) {
        return Promise.reject(`Invalid URL: "${cam.url}"`);
    }
    if (cam.cacheTimeout === undefined || cam.cacheTimeout === null || cam.cacheTimeout === '') {
        cam.cacheTimeout = adapter.config.defaultCacheTimeout;
    } else {
        cam.cacheTimeout = parseInt(cam.cacheTimeout, 10) || 0;
    }

    cam.timeout = parseInt(cam.timeout || adapter.config.defaultTimeout, 10) || 2000;

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

function process(adapter, cam, req, res) {
    if (cam.cache && cam.cacheTime > Date.now()) {
        return Promise.resolve(cam.cache);
    }

    if (cam.runningRequest) {
        return cam.runningRequest;
    }

    cam.runningRequest = axios.get(cam.url, {
        responseType: 'arraybuffer',
        validateStatus: status => status < 400,
        timeout: cam.timeout,
    })
        .then(response => {
            cam.runningRequest = null;
            const result = {
                body: response.data,
                contentType: response.headers['Content-type'] || response.headers['content-type']
            };
            if (cam.cacheTimeout) {
                cam.cache = result;
                cam.cacheTime = Date.now() + cam.cacheTimeout;
            }

            return result;
        })
        .catch(error => {
            if (error.response) {
                throw new Error(error.response.data || error.response.status);
            } else {
                throw new Error(error.code);
            }
        });

    return cam.runningRequest;
}

module.exports = {
    init,
    process,
    unload,
};