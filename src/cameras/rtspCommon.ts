import { existsSync, readFileSync } from 'node:fs';
import { spawn, execSync, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { normalize } from 'node:path';

export interface RtspOptions {
    ip: string;
    port: number | string;
    urlPath?: string;
    prefix?: string;
    suffix?: string;
    protocol?: 'udp' | 'tcp';
    username?: string;
    originalHeight?: number | string;
    originalWidth?: number | string;
}

export function findFFmpegPath(pathToExecutable?: string, log?: ioBroker.Log): string {
    if (pathToExecutable) {
        return existsSync(pathToExecutable) ? normalize(pathToExecutable).replace(/\\/g, '/') : '';
    }
    if (process.platform === 'win32') {
        // Try to find in the current directory
        if (existsSync(`${__dirname}/../../win-ffmpeg.exe`)) {
            return normalize(`${__dirname}/../../win-ffmpeg.exe`).replace(/\\/g, '/');
        }
        // execute where command
        try {
            const path = execSync('where ffmpeg');
            if (path.toString().trim()) {
                return path.toString().trim().replace(/\\/g, '/');
            }
        } catch (e) {
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
        if (existsSync(path)) {
            return path;
        }
    }
    // execute where command
    try {
        const path = execSync('which ffmpeg');
        if (path.toString().trim()) {
            return path.toString().trim();
        }
    } catch (e) {
        log?.warn(`Cannot execute "which ffmpeg": ${e}`);
    }
    throw new Error('FFmpeg not found');
}

export function getFFmpegVersion(ffmpegPath: string, log?: ioBroker.Log): string {
    const _ffmpegPath = findFFmpegPath(ffmpegPath, log);

    try {
        const data = execSync(`${_ffmpegPath} -version`).toString();
        if (data) {
            const result = data.split('\n')[0];
            const version = result.match(/version\s+([-\w.]+)/i);
            if (version) {
                return version[1];
            }
            return result;
        }
        return '';
    } catch {
        return '';
    }
}

function maskPassword(str: string, password: string): string {
    if (password) {
        password = encodeURIComponent(password)
            //.replace(/!/g, '%21')
            .replace(/'/g, '%27')
            .replace(/\(/g, '%28')
            .replace(/\)/g, '%29')
            .replace(/\*/g, '%2A');
    }
    return str.replace(password || 'ABCGHFG', '******');
}

function buildCommand(config: RtspOptions, outputFileName: string, decodedPassword: string): string[] {
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
    parameters.push(
        `rtsp://${config.username ? `${encodeURIComponent(config.username)}:${password}@` : ''}${config.ip}${!config.port || parseInt(config.port as string, 10) === 554 ? '' : `:${config.port}`}${config.urlPath ? (config.urlPath.startsWith('/') ? config.urlPath : `/${config.urlPath}`) : ''}`,
    );

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

export function executeFFmpeg(
    params: string[],
    ffmpegPath: string,
    decodedPassword?: string,
    timeoutMs?: number,
    log?: ioBroker.Log,
): Promise<string> {
    timeoutMs = timeoutMs || 10000;

    return new Promise((resolve, reject) => {
        log?.debug(`Executing ${ffmpegPath} ${maskPassword(params.join(' '), decodedPassword || '')}`);

        const proc = spawn(ffmpegPath, params || []);
        proc.on('error', (err: Error) => reject(err));

        const stdout: string[] = [];
        const stderr: string[] = [];

        proc.stdout.setEncoding('utf8');
        proc.stdout.on('data', (data: Buffer): void => {
            stdout.push(data.toString('utf8'));
        });

        proc.stderr.setEncoding('utf8');
        proc.stderr.on('data', (data: Buffer): void => {
            stderr.push(data.toString('utf8'));
        });

        let timeout: NodeJS.Timeout | null = setTimeout(() => {
            timeout = null;
            proc.kill();
            reject(new Error('timeout'));
        }, timeoutMs);

        proc.on('close', (code: number): void => {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
                code ? reject(new Error(stderr.join(''))) : resolve(stdout.join(''));
            }
        });
    });
}

export function startFFmpeg(
    params: string[],
    ffmpegPath: string,
    decodedPassword?: string,
    log?: ioBroker.Log,
): ChildProcessWithoutNullStreams {
    log?.debug(`Executing ${ffmpegPath} ${maskPassword(params.join(' '), decodedPassword || '')}`);

    const proc = spawn(ffmpegPath, params || []);

    proc.stdout.setEncoding('utf8');
    proc.stderr.setEncoding('utf8');

    proc.on('close', (code: number): void => {
        log?.debug(`FFmpeg exited with code ${code}`);
    });

    return proc;
}

export async function getRtspSnapshot(
    config: RtspOptions,
    outputFileName: string,
    ffmpegPath: string,
    decodedPassword: string,
    timeout: number,
    log: ioBroker.Log,
): Promise<Buffer> {
    const parameters: string[] = buildCommand(config, outputFileName, decodedPassword);

    await executeFFmpeg(parameters, ffmpegPath, decodedPassword, timeout, log);
    return readFileSync(outputFileName);
}
