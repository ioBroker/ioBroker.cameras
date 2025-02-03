import { readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';

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

function maskPassword(str: string, password: string): string {
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
        `rtsp://${config.username ? `${encodeURIComponent(config.username)}:${password}@` : ''}${config.ip}:${config.port || 554}${config.urlPath ? (config.urlPath.startsWith('/') ? config.urlPath : `/${config.urlPath}`) : ''}`,
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
