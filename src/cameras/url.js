const axios = require('axios');

function init(adapter, cam) {
    adapter.__urlCameras = adapter.__urlCameras || {};
    adapter.__urlCameras[cam.name] = true;

    // check parameters
    if (!cam.url || typeof cam.url !== 'string' || (!cam.url.startsWith('http://') && !cam.url.startsWith('https://'))) {
        return Promise.reject(`Invalid URL: "${cam.url}"`);
    }

    cam.timeout = parseInt(cam.timeout || adapter.config.defaultTimeout, 10) || 2000;

    return Promise.resolve();
}

function unload(adapter, cam) {
    if (adapter.__urlCameras[cam.name]) {
        delete adapter.__urlCameras[cam.name];
    }
    // after last unloading, all the resources must be cleared too
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

    cam.runningRequest = axios.get(cam.url, {
        responseType: 'arraybuffer',
        validateStatus: status => status < 400,
        timeout: cam.timeout,
    })
        .then(response => {
            cam.runningRequest = null;
            return {
                body: response.data,
                contentType: response.headers['Content-type'] || response.headers['content-type'],
            };
        })
        .catch(error => {
            if (error.response) {
                adapter.log.error(`Cannot read ${cam.url}: ${error.response.data || error}`);
                throw new Error(error.response.data || error.response.status);
            } else {
                adapter.log.error(`Cannot read ${cam.url}: ${error}`);
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
