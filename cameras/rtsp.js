const spawn = require('child_process').spawn;
const fs = require('fs');
const path = require('path');

function executeFFmpeg(params, path, adapter) {
    return new Promise((resolve, reject) => {
        if (params && !Array.isArray(params)) {
            params = params.split(' ');
        }

        adapter && adapter.log.debug(`Executing ${path} ${params.join(' ')}`);

        const proc = spawn(path, params || []);
        proc.on('error', err => reject(err));

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
    let password = options.decodedPassword;
    if (options.username) {
        // convert special characters
        password = encodeURIComponent(password)
            .replace(/!/g, '%21')
            .replace(/'/g, '%27')
            .replace(/\(/g, '%28')
            .replace(/\)/g, '%29')
            .replace(/\*/g, '%2A');
    }

    options.prefix && parameters.push(options.prefix);
    parameters.push(`-i`);
    parameters.push(`rtsp://${options.username ? `${encodeURIComponent(options.username)}:${password}@` : ''}${options.ip}:${options.port || 554}${options.urlPath ? (options.urlPath.startsWith('/') ? options.urlPath : `/${options.urlPath}`) : ''}`);
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

function getRtspSnapshot(ffpmegPath, options, outputFileName, adapter) {
    const parameters = buildCommand(options, outputFileName);

    return executeFFmpeg(parameters, ffpmegPath, adapter)
        .then(() => fs.readFileSync(outputFileName));
}

function init(adapter, cam) {
    adapter.__urlCameras = adapter.__urlCameras || {};
    adapter.__urlCameras[cam.name] = true;

    // check parameters
    if (!cam.ip || typeof cam.ip !== 'string') {
        return Promise.reject(`Invalid IP: "${cam.ip}"`);
    }

    cam.decodedPassword = cam.password ? adapter.decrypt(cam.password) : '';
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
    // after last unload, all the resources must be cleared too
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
    cam.runningRequest = getRtspSnapshot(adapter.config.ffmpegPath, cam, outputFileName, adapter)
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

const streamings = {};

// ffmpeg -rtsp_transport udp -i rtsp://localhost:8090/stream -c:a aac -b:a 160000 -ac 2 -s 854x480 -c:v libx264 -b:v 800000 -hls_time 10 -hls_list_size 2 -hls_flags delete_segments -start_number 1 playlist.m3u8

async function webStreaming(adapter, camera) {
    const cameraObject = adapter.config.cameras.find(c => c.name === camera && c.type === 'rtsp');
    if (!cameraObject.decodedPassword && cameraObject.password) {
        cameraObject.decodedPassword = adapter.decrypt(cameraObject.password);
    }

    const url = cameraObject ? `rtsp://${cameraObject.username || cameraObject.decodedPassword ? `${cameraObject.username}:${cameraObject.decodedPassword}@` : ''}${cameraObject.ip}:${cameraObject.port}/${cameraObject.urlPath}` : '';

    if (!url) {
        adapter.log.error(`No URL for camera ${camera}`);
        throw new Error(`No URL for camera ${camera}`);
    }

    if (!streamings[camera]) {
        adapter.log.debug(`Starting streaming for ${camera} (${url.replace(cameraObject.decodedPassword || 'ABCDEF', '****')})`);

        const path = `${__dirname}/../data/${camera}`;
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
        }
        if (fs.existsSync(`${path}/playlist.m3u8`)) {
            fs.unlinkSync(`${path}/playlist.m3u8`);
        }
        const command = [
            ...`-rtsp_transport tcp -i`.split(' '),
            url,
            ...`-c:a aac -b:a 160000 -ac 2 -s 854x480 -c:v libx264 -b:v 800000 -hls_time 10 -hls_list_size 2 -hls_flags delete_segments -start_number 1`.split(' '),
            `${path}/playlist.m3u8`,
        ];
        const proc = spawn(adapter.config.ffmpegPath, command);
        streamings[camera] = {
            url,
            proc,
            camera,
        };
        proc.on('close', () => {
            adapter.log.debug(`Streaming for ${camera} (${url.replace(cameraObject.decodedPassword || 'ABCDEF', '****')}) closed`);
            stopWebStreaming(camera);
        });
        proc.stdout.setEncoding('utf8');
        proc.stdout.on('data', data => adapter.log.debug(data.toString('utf8')));

        proc.stderr.setEncoding('utf8');
        proc.stderr.on('data', data => adapter.log.warn(data.toString('utf8')));
    } else {
        streamings[camera].timeout && clearTimeout(streamings[camera].timeout);
    }

    // what for first file playlist.m3u8 playlist.m3u8
    const fileName = `${__dirname}/../data/${camera}/playlist.m3u8`;
    let count = 0;
    while (!fs.existsSync(fileName) && count < 300) { // wait 30 seconds
        await new Promise(resolve => setTimeout(resolve, 100));
        count++;
    }
    if (count >= 300) {
        adapter.log.error(`Cannot start streaming ${fileName}`);
        throw new Error(`File ${fileName} still not exists`);
    }

    streamings[camera].timeout = setTimeout(stopWebStreaming, 120000, camera);
}

function stopWebStreaming(camera) {
    if (streamings[camera]) {
        streamings[camera].timeout && clearTimeout(streamings[camera].timeout);
        streamings[camera].timeout = null;

        try {
            streamings[camera].proc.kill();
            console.log('delete: ', `${__dirname}/../data/${camera}`);
            fs.rmSync(`${__dirname}/../data/${camera}`, { recursive: true });
        } catch (e) {
            console.error(`Cannot stop process: ${e}`);
        }
        delete streamings[camera];
    }
}

const cleanRtspData = () => {
    fs.readdir(`${__dirname}/../data`, (err, files) => {
        files.forEach(file => {
            const fileDir = `${__dirname}/../data/${file}`;

            if (file !== '.gitignore') {
                fs.rmSync(fileDir, { recursive: true });
            }
        });
    });
};

function stopAllStreams() {
    for (const camera in streamings) {
        stopWebStreaming(camera);
    }
}

module.exports = {
    init,
    process,
    unload,
    getRtspSnapshot,
    executeFFmpeg,
    webStreaming,
    stopWebStreaming,
    cleanRtspData,
    stopAllStreams,
};