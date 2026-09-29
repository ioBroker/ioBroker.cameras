"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findFFmpegPath = findFFmpegPath;
exports.getFFmpegVersion = getFFmpegVersion;
exports.executeFFmpeg = executeFFmpeg;
exports.startFFmpeg = startFFmpeg;
exports.getRtspSnapshot = getRtspSnapshot;
const node_fs_1 = require("node:fs");
const node_child_process_1 = require("node:child_process");
const node_path_1 = require("node:path");
function findFFmpegPath(pathToExecutable, log) {
    if (pathToExecutable) {
        return (0, node_fs_1.existsSync)(pathToExecutable) ? (0, node_path_1.normalize)(pathToExecutable).replace(/\\/g, '/') : '';
    }
    if (process.platform === 'win32') {
        // Try to find in the current directory
        if ((0, node_fs_1.existsSync)(`${__dirname}/../../win-ffmpeg.exe`)) {
            return (0, node_path_1.normalize)(`${__dirname}/../../win-ffmpeg.exe`).replace(/\\/g, '/');
        }
        // execute where command
        try {
            const path = (0, node_child_process_1.execSync)('where ffmpeg');
            if (path.toString().trim()) {
                return path.toString().trim().replace(/\\/g, '/');
            }
        }
        catch (e) {
            log?.warn(`Cannot execute "where ffmpeg": ${e}`);
        }
        throw new Error('FFmpeg not found');
    }
    const paths = [
        '/usr/bin/ffmpeg',
        '/usr/local/bin/ffmpeg',
        '/usr/local/ffmpeg/bin/ffmpeg',
        '/usr/ffmpeg/bin/ffmpeg',
    ];
    for (const path of paths) {
        if ((0, node_fs_1.existsSync)(path)) {
            return path;
        }
    }
    // execute where command
    try {
        const path = (0, node_child_process_1.execSync)('which ffmpeg');
        if (path.toString().trim()) {
            return path.toString().trim();
        }
    }
    catch (e) {
        log?.warn(`Cannot execute "which ffmpeg": ${e}`);
    }
    throw new Error('FFmpeg not found');
}
function getFFmpegVersion(ffmpegPath, log) {
    const _ffmpegPath = findFFmpegPath(ffmpegPath, log);
    try {
        const data = (0, node_child_process_1.execSync)(`${_ffmpegPath} -version`).toString();
        if (data) {
            const result = data.split('\n')[0];
            const version = result.match(/version\s+([-\w.]+)/i);
            if (version) {
                return version[1];
            }
            return result;
        }
        return '';
    }
    catch {
        return '';
    }
}
/**
 * Percent-encode a password for use inside an rtsp:// URL.
 *
 * `encodeURIComponent` leaves `!`, `'`, `(`, `)` and `*` alone, which are legal in a URL but are
 * not what a camera expects in the userinfo part. Both the command line and {@link maskPassword}
 * have to use exactly this function: when they differ, the mask no longer matches the password in
 * the command line and the password ends up in the log in clear text.
 */
function encodePassword(password) {
    return encodeURIComponent(password)
        .replace(/!/g, '%21')
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29')
        .replace(/\*/g, '%2A');
}
function maskPassword(str, password) {
    if (!password) {
        return str;
    }
    // The password can appear more than once, e.g. in the URL and in a user defined suffix
    return str.split(encodePassword(password)).join('******');
}
function buildCommand(config, outputFileName, decodedPassword) {
    const parameters = ['-y'];
    let password = decodedPassword;
    if (config.username) {
        // convert special characters
        password = encodePassword(password);
    }
    config.prefix && parameters.push(config.prefix);
    parameters.push(`-rtsp_transport`);
    parameters.push(config.protocol || 'udp');
    parameters.push('-i');
    parameters.push(`rtsp://${config.username ? `${encodeURIComponent(config.username)}:${password}@` : ''}${config.ip}${!config.port || parseInt(config.port, 10) === 554 ? '' : `:${config.port}`}${config.urlPath ? (config.urlPath.startsWith('/') ? config.urlPath : `/${config.urlPath}`) : ''}`);
    parameters.push('-loglevel');
    parameters.push('error');
    if (config.originalWidth && config.originalHeight) {
        // Without -vf ffmpeg reads "scale=..." as the name of an output file and gives up with
        // "Unable to choose an output format for 'scale=640:480'"
        parameters.push('-vf');
        parameters.push(`scale=${config.originalWidth}:${config.originalHeight}`);
    }
    parameters.push('-vframes');
    parameters.push('1');
    config.suffix && parameters.push(config.suffix);
    parameters.push(outputFileName);
    return parameters;
}
function executeFFmpeg(params, ffmpegPath, decodedPassword, timeoutMs, log) {
    timeoutMs = timeoutMs || 10000;
    return new Promise((resolve, reject) => {
        log?.debug(`Executing ${ffmpegPath} ${maskPassword(params.join(' '), decodedPassword || '')}`);
        const proc = (0, node_child_process_1.spawn)(ffmpegPath, params || []);
        const stdout = [];
        const stderr = [];
        proc.stdout.setEncoding('utf8');
        proc.stdout.on('data', (data) => {
            stdout.push(data.toString('utf8'));
        });
        proc.stderr.setEncoding('utf8');
        proc.stderr.on('data', (data) => {
            stderr.push(data.toString('utf8'));
        });
        let timeout = setTimeout(() => {
            timeout = null;
            proc.kill();
            reject(new Error('timeout'));
        }, timeoutMs);
        const stopTimeout = () => {
            if (!timeout) {
                // The timeout already fired and rejected the promise
                return false;
            }
            clearTimeout(timeout);
            timeout = null;
            return true;
        };
        // ffmpeg was not started at all, e.g. because the path is wrong. Without stopping the
        // timer it would stay pending for the whole timeout and then kill a process that never ran.
        proc.on('error', (err) => {
            if (stopTimeout()) {
                reject(err);
            }
        });
        proc.on('close', (code) => {
            if (stopTimeout()) {
                code ? reject(new Error(stderr.join(''))) : resolve(stdout.join(''));
            }
        });
    });
}
function startFFmpeg(params, ffmpegPath, decodedPassword, log) {
    log?.debug(`Executing ${ffmpegPath} ${maskPassword(params.join(' '), decodedPassword || '')}`);
    const proc = (0, node_child_process_1.spawn)(ffmpegPath, params || []);
    proc.stdout.setEncoding('utf8');
    proc.stderr.setEncoding('utf8');
    proc.on('close', (code) => {
        log?.debug(`FFmpeg exited with code ${code}`);
    });
    return proc;
}
async function getRtspSnapshot(config, outputFileName, ffmpegPath, decodedPassword, timeout, log) {
    const parameters = buildCommand(config, outputFileName, decodedPassword);
    await executeFFmpeg(parameters, ffmpegPath, decodedPassword, timeout, log);
    return (0, node_fs_1.readFileSync)(outputFileName);
}
//# sourceMappingURL=rtspCommon.js.map