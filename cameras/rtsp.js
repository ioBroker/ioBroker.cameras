const spawn = require('child_process').spawn;
const fs = require('fs');
const path = require('path');

function executeFFmpeg(params, path) {
    return new Promise((resolve, reject) => {
        if (params && !Array.isArray(params)) {
            params = params.split(' ');
        }

        const proc = spawn(path, params || []);

        const stdout = [];
        const stderr = [];

        proc.stdout.setEncoding('utf8');
        proc.stdout.on('data', data => stdout.push(data.toString('utf8')));

        proc.stderr.setEncoding('utf8');
        proc.stderr.on('data', data => stderr.push(data.toString('utf8')));

        proc.on('close', code =>
            code ? reject(stderr.join('')) : resolve(stdout.join('')));
    });
}

function getRtspSnapshot(ffpmegPath, ip, login, password, port, urlPath, outputFileName) {
    return executeFFmpeg([
        '-y',
        '-i',
        `rtsp://${login}:${password}@${ip}:${port || 554}${urlPath ? (urlPath.startsWith('/') ? urlPath : `/${urlPath}`) : ''}`,
        '-vframes',
        '1',
        outputFileName,
    ], ffpmegPath)
        .then(() => fs.readFileSync(outputFileName));
}

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

    const outputFileName = path.normalize(`${adapter.config.tempPath}/${cam.ip.replace(/[.:]/g, '_')}.jpg`);
    cam.runningRequest = getRtspSnapshot(adapter.config.ffmpegPath, cam.ip, cam.username, cam.decodedPassword, cam.port, cam.urlPath, outputFileName)
        .then(body => {
            cam.runningRequest = null;

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
    executeFFmpeg,
};