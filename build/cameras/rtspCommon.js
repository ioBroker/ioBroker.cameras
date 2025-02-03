"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeFFmpeg = executeFFmpeg;
exports.getRtspSnapshot = getRtspSnapshot;
const node_fs_1 = require("node:fs");
const node_child_process_1 = require("node:child_process");
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
function buildCommand(config, outputFileName, decodedPassword) {
    const parameters = ['-y'];
    let password = decodedPassword;
    if (config.username) {
        // convert special characters
        password = encodeURIComponent(password)
            .replace(/!/g, '%21')
            .replace(/'/g, '%27')
            .replace(/\(/g, '%28')
            .replace(/\)/g, '%29')
            .replace(/\*/g, '%2A');
    }
    config.prefix && parameters.push(config.prefix);
    parameters.push(`-rtsp_transport`);
    parameters.push(config.protocol || 'udp');
    parameters.push('-i');
    parameters.push(`rtsp://${config.username ? `${encodeURIComponent(config.username)}:${password}@` : ''}${config.ip}:${config.port || 554}${config.urlPath ? (config.urlPath.startsWith('/') ? config.urlPath : `/${config.urlPath}`) : ''}`);
    parameters.push('-loglevel');
    parameters.push('error');
    if (config.originalWidth && config.originalHeight) {
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
        proc.on('error', (err) => reject(err));
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
        proc.on('close', (code) => {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
                code ? reject(new Error(stderr.join(''))) : resolve(stdout.join(''));
            }
        });
    });
}
async function getRtspSnapshot(config, outputFileName, ffmpegPath, decodedPassword, timeout, log) {
    const parameters = buildCommand(config, outputFileName, decodedPassword);
    await executeFFmpeg(parameters, ffmpegPath, decodedPassword, timeout, log);
    return (0, node_fs_1.readFileSync)(outputFileName);
}
//# sourceMappingURL=rtspCommon.js.map