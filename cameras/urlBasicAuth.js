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

    // calculate basic authentication. Password was encrypted and must be decrypted
    cam.basicAuth = 'Basic ' + Buffer.from(cam.username + ':' + adapter.tools.decrypt(adapter.__systemSecret, cam.password)).toString('base64');
    return Promise.resolve();
}

function unload(adapter, cam) {
    // do nothing
    return Promise.resolve();
}

function process(adapter, cam, req, res) {
    return axios.get(cam.url, {
        responseType: 'arraybuffer',
        validateStatus: status => status < 400,
        timeout: parseInt(cam.timeout || adapter.config.defaultTimeout, 10) || 2000,
        headers: {Authorization: cam.basicAuth}
    })
        .then(response => ({
            body: response.data,
            contentType: response.headers['Content-type'] || response.headers['content-type']
        }))
        .catch(error => {
            if (error.response) {
                throw new Error(error.response.data || error.response.status);
            } else {
                throw new Error(error.code);
            }
        });
}

module.exports = {
    init,
    process,
    unload,
};