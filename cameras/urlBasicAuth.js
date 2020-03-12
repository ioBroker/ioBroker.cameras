const request = require('request');

function init(adapter, cam) {
    // check parameters
    if (!cam.url || typeof cam.url !== 'string' || (!cam.url.startsWith('http://') && !cam.url.startsWith('https://'))) {
        return Promise.reject('Invalid URL: "' + cam.url + '"');
    }
    if (!cam.username || typeof cam.username !== 'string') {
        return Promise.reject('Invalid Username: "' + cam.username + '"');
    }

    cam.password = cam.password || '';

    // calculate basic authentication. Passward was encrypted and must be decrypted
    cam.basicAuth = 'Basic ' + Buffer.from(cam.username + ':' + adapter.tools.decrypt(adapter.__systemSecret, cam.password)).toString('base64');
    return Promise.resolve();
}

function unload(adapter, cam) {
    // do nothing
    return Promise.resolve();
}

function process(adapter, cam, req, res) {
    return new Promise((resolve, reject) => {
        request(cam.url, {
            encoding: null,
            timeout: parseInt(cam.timeout || adapter.config.defaultTimeout, 10) || 2000,
            headers: {Authorization: cam.basicAuth}
        }, (error, status, body) => {
            if (error || !body || status.statusCode >= 400) {
                reject(error || body || status.statusCode);
            } else {
                resolve({body, contentType: status.headers['Content-type'] || status.headers['content-type']});
            }
        })
            .on('error', error => reject(error));
    });
}

module.exports = {
    init,
    process,
    unload,
};