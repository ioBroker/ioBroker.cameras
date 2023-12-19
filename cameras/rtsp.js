const spawn = require('child_process').spawn;
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

function maskPassword(str, password) {
    if (password) {
        password = encodeURIComponent(password)
            .replace(/!/g, '%21')
            .replace(/'/g, '%27')
            .replace(/\(/g, '%28')
            .replace(/\)/g, '%29')
            .replace(/\*/g, '%2A');
    }
    return str.replace(password || 'ABCGHFG', '******');
}

function executeFFmpeg(params, path, adapter, decodedPassword, timeoutMs) {
    timeoutMs = timeoutMs || 10000;

    return new Promise((resolve, reject) => {
        if (params && !Array.isArray(params)) {
            params = params.split(' ');
        }

        adapter && adapter.log.debug(`Executing ${path} ${maskPassword(params.join(' '), decodedPassword)}`);

        const proc = spawn(path, params || []);
        proc.on('error', err => reject(err));

        const stdout = [];
        const stderr = [];

        proc.stdout.setEncoding('utf8');
        proc.stdout.on('data', data => stdout.push(data.toString('utf8')));

        proc.stderr.setEncoding('utf8');
        proc.stderr.on('data', data => stderr.push(data.toString('utf8')));


        let timeout = setTimeout(() => {
            timeout = null;
            proc.kill();
            reject('timeout');
        }, timeoutMs);

        proc.on('close', code => {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
                code ? reject(stderr.join('')) : resolve(stdout.join(''));
            }
        });
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

    parameters.push(`-rtsp_transport`);
    parameters.push(options.protocol || 'udp');

    parameters.push('-i');
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

    return executeFFmpeg(parameters, ffpmegPath, adapter, options.decodedPassword, options.timeout)
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
    cam.timeout = parseInt(cam.timeout || adapter.config.defaultTimeout, 10) || 10000;
    cam.lastFrame = null;

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

    adapter.log.debug(`Requesting snapshot from ${cam.ip}...`);

    if (streamings[cam.name] && streamings[cam.name].lastBase64Frame) {
        return Promise.resolve({
            body: Buffer.from(streamings[cam.name].lastBase64Frame, 'base64'),
            contentType: 'image/jpeg',
        });
    }

    const outputFileName = path.normalize(`${adapter.config.tempPath}/${cam.ip.replace(/[.:]/g, '_')}.jpg`);
    cam.runningRequest = getRtspSnapshot(adapter.config.ffmpegPath, cam, outputFileName, adapter)
        .then(async body => {
            cam.runningRequest = null;
            adapter.log.debug(`Snapshot from ${cam.ip}. Done!`);

            if (!ratio[cam.name]) {
                // try to get width and height
                const image = await adapter._sharp(body);
                const metadata = await image.metadata();
                ratio[cam.name] = metadata.width / metadata.height;
            }

            return {
                body,
                contentType: 'image/jpeg',
            };
        });

    return cam.runningRequest;
}

function getRtspURL(adapter, cameraObject) {
    if (!cameraObject.decodedPassword && cameraObject.password) {
        cameraObject.decodedPassword = adapter.decrypt(cameraObject.password);
    }

    return `rtsp://${cameraObject.username ? `${encodeURIComponent(cameraObject.username)}:${cameraObject.decodedPassword}@` : ''}${cameraObject.ip}:${cameraObject.port || 554}${cameraObject.urlPath ? (cameraObject.urlPath.startsWith('/') ? cameraObject.urlPath : `/${cameraObject.urlPath}`) : ''}`;
}
const streamings = {};
const ratio = {};

// ffmpeg -rtsp_transport udp -i rtsp://localhost:8090/stream -c:a aac -b:a 160000 -ac 2 -s 854x480 -c:v libx264 -b:v 800000 -hls_time 10 -hls_list_size 2 -hls_flags delete_segments -start_number 1 playlist.m3u8

async function webStreaming(adapter, camera, options, fromState) {
    const url = typeof options === 'string' ? options : options.url;

    if (!fromState) {
        await adapter.setStateAsync(`${camera}.running`, true, true);
    }

    if (!url) {
        adapter.log.error(`No URL for camera ${camera}`);
        throw new Error(`No URL for camera ${camera}`);
    }

    const desiredWidth = (options && options.width) || 0;

    if (streamings[camera] && streamings[camera].width !== desiredWidth) {
        // if width changed drastically
        if (streamings[camera].width && desiredWidth && Math.abs(streamings[camera].width - desiredWidth) < 100) {
            streamings[camera].width = desiredWidth;
        } else {
            // stop streaming
            adapter.log.debug(`Stopping streaming for ${camera} while requested width is ${desiredWidth}. was ${streamings[camera].width}`);
            stopWebStreaming(adapter, camera);
            // wait 3 seconds
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    }

    if (!streamings[camera]) {
        streamings[camera] = {
            url,
            camera,
            width: desiredWidth,
        };

        adapter.log.debug(`Starting streaming for ${camera} (${url.replace(/:[^@]+@/, ':****@')}), width: ${desiredWidth}`);

        const command = ffmpeg(url)
            .setFfmpegPath(adapter.config.ffmpegPath)
            // .addInputOption('-preset', 'ultrafast')
            .addInputOption('-rtsp_transport', 'tcp')
            .addInputOption('-re')
            .outputFormat('mjpeg')
            .fps(2)
            .addOptions('-q:v 0');

        streamings[camera].proc = command;

        if (desiredWidth) {
            // first try to find the best scale
            if (!ratio[camera]) {
                const cameraObject = adapter.config.cameras.find(c => c.name === camera);

                const outputFileName = path.normalize(`${adapter.config.tempPath}/${cameraObject.ip.replace(/[.:]/g, '_')}.jpg`);
                const body = await getRtspSnapshot(adapter.config.ffmpegPath, cameraObject, outputFileName, adapter);
                // try to get width and height
                const image = await adapter._sharp(body);
                const metadata = await image.metadata();
                ratio[camera] = metadata.width / metadata.height;
            }
            command.addOptions(`-vf scale=${options.width}:${Math.round(options.width / ratio[camera])}`);
        }

        command.on('end', function () {
            adapter.log.debug(`Streaming for ${camera} stopped`);
            adapter.setState(`${camera}.stream`, '', true);
            adapter.setState(`${camera}.running`, false, true);
        });
        command.on('error', function (err /* , stdout, stderr */) {
            if (streamings[camera]) {
                adapter.setState(`${camera}.stream`, '', true);
                adapter.setState(`${camera}.running`, false, true);
                adapter.log.debug(`Cannot process video for "${camera}": ${err.message}`);
            } else {
                adapter.log.debug(`Streaming for ${camera} stopped`);
            }
        });

        const ffStream = command.pipe();
        let chunks = Buffer.from([]);
        let lastFrame = 0;
        streamings[camera].monitor = setInterval(() => {
            if (Date.now() - lastFrame > 10000) {
                streamings[camera].monitor && clearInterval(streamings[camera].monitor);
                streamings[camera].monitor = null;
                adapter.log.debug(`No data for ${camera} for 10 seconds. Stopping`);
                stopWebStreaming(adapter, camera);
            }
        }, 10000);

        ffStream.on('data', chunk => {
            if (chunk.length > 2 && chunk[0] === 0xFF && chunk[1] === 0xD8) {
                const frame = chunks.toString('base64');
                let found = false;
                if (!lastFrame || Date.now() - lastFrame > 300) {
                    lastFrame = Date.now();
                    console.log(`frame ${frame.length}`);
                    streamings[camera].lastBase64Frame = frame;

                    const clientsToDelete = [];
                    adapter._streamSubscribes.forEach(sub => {
                        if (sub.camera === camera) {
                            found = true;
                            try {
                                adapter.sendToUI && adapter.sendToUI({ clientId: sub.clientId, data: frame });
                            } catch (e) {
                                if (e && e.toString().includes('not registered')) {
                                    // forget this client
                                    clientsToDelete.push(sub.clientId);
                                }
                                adapter.log.warn(`Cannot send to UI: ${e}`);
                            }
                        }
                    });
                    if (clientsToDelete.length) {
                        adapter._streamSubscribes = adapter._streamSubscribes.filter(sub => !clientsToDelete.includes(sub.clientId));
                    }

                    if (!found) {
                        adapter.setState(`${camera}.stream`, frame, true);
                    }
                } else {
                    console.log(`skip frame ${frame.length}`);
                }
                chunks = chunk;
            } else {
                chunks = Buffer.concat([chunks, chunk]);
            }
        });
    }
}

function stopWebStreaming(adapter, camera) {
    if (streamings[camera]) {
        streamings[camera].monitor && clearInterval(streamings[camera].monitor);
        streamings[camera].monitor = null;
        try {
            streamings[camera].proc.kill();
        } catch (e) {
            console.error(`Cannot stop process: ${e}`);
        }
        adapter.setState(`${camera}.stream`, '', true);
        adapter.setState(`${camera}.running`, false, true);
        delete streamings[camera];
    }
}

function stopAllStreams(adapter) {
    for (const camera in streamings) {
        adapter.setState(`${camera}.stream`, '', true);
        adapter.setState(`${camera}.running`, false, true);
    }
}

module.exports = {
    init,
    process,
    unload,
    getRtspURL,
    getRtspSnapshot,
    executeFFmpeg,
    webStreaming,
    stopWebStreaming,
    stopAllStreams,
};
