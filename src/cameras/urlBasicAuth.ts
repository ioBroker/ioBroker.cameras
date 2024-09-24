const axios = require('axios');

function init(adapter, cam) {
    // check parameters
    if (!cam.url || typeof cam.url !== 'string' || (!cam.url.startsWith('http://') && !cam.url.startsWith('https://'))) {
        return Promise.reject(`Invalid URL: "${cam.url}"`);
    }
    if (!cam.username || typeof cam.username !== 'string') {
        return Promise.reject(`Invalid Username: "${cam.username}"`);
    }

    cam.password = cam.password || '';

    cam.timeout = parseInt(cam.timeout || adapter.config.defaultTimeout, 10) || 2000;

    // Calculate basic authentication. The password was encrypted and must be decrypted
    cam.basicAuth = `Basic ${Buffer.from(`${cam.username}:${adapter.decrypt(cam.password)}`).toString('base64')}`;
    return Promise.resolve();
}

function unload(adapter, cam) {
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
        headers: { Authorization: cam.basicAuth },
    })
        .then(response => {
            cam.runningRequest = null;
            return {
                body: response.data,
                contentType: response.headers['Content-type'] || response.headers['content-type']
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
