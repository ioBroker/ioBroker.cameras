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

function buildCommand(options, outputFileName) {
    const parameters = [
        '-y',
    ];
    options.prefix && parameters.push(options.prefix);
    parameters.push(`-i`);
    parameters.push(`rtsp://${options.username ? `${options.username}:${options.decodedPassword}@` : ''}${options.ip}:${options.port || 554}${options.urlPath ? (options.urlPath.startsWith('/') ? options.urlPath : `/${options.urlPath}`) : ''}`);
    parameters.push('-loglevel');
    parameters.push('error');
    if (options.originalWidth && options.originalHeight) {
        parameters.push(`scale=${options.originalWidth}:${options.originalHeight}`);
    }
    parameters.push('-vframes');
    parameters.push('1');
    options.suffix && parameters.push(options.suffix);
    parameters.push(outputFileName);
    return parameters;
}

function getRtspSnapshot(ffpmegPath, options, outputFileName) {
    const parameters = buildCommand(options, outputFileName);

    return executeFFmpeg(parameters, ffpmegPath)
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

    adapter.log.debug(`Requesting snapshot from ${cam.ip}...`);

    const outputFileName = path.normalize(`${adapter.config.tempPath}/${cam.ip.replace(/[.:]/g, '_')}.jpg`);
    cam.runningRequest = getRtspSnapshot(adapter.config.ffmpegPath, cam, outputFileName)
        .then(body => {
            cam.runningRequest = null;
            adapter.log.debug(`Snapshot from ${cam.ip}. Done!`);

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
    getRtspSnapshot
};