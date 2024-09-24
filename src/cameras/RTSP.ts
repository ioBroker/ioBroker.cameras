import { spawn } from 'child_process';
import { readFileSync } from 'node:fs';
import { normalize } from 'node:path';
import sharp from 'sharp';
import ffmpeg, { type FfmpegCommand } from 'fluent-ffmpeg';
import type { ProcessImageReturnType, RTSPImageSettings } from '../types';
import GenericCamera from './Generic';

class RTSP extends GenericCamera {
    protected decodedPassword: string;

    private streamSubscribes: { clientId: string; ts: number; camera: string }[] | null = null;

    protected settings: RTSPImageSettings = { ip: '', id: 0, name: '', type: 'rtsp' };

    private lastFrame: number = 0;

    protected timeout: number;

    private url: string;

    private streaming: null | {
        lastBase64Frame?: string;
        width: number;
        proc: FfmpegCommand | null;
        monitor?: ioBroker.Interval | null;
    } = null;

    private ratio: number = 0;

    constructor(adapter: ioBroker.Adapter, streamingContext: { clientId: string; ts: number; camera: string }[]) {
        super(adapter);

        this.streamSubscribes = streamingContext;
    }

    init(settings: RTSPImageSettings): Promise<void> {
        this.settings = settings;
        if (!this.decodedPassword) {
            this.decodedPassword = this.settings.password ? this.adapter.decrypt(this.settings.password) : '';
        }
        this.timeout = parseInt((this.settings.timeout || this.adapter.config.defaultTimeout) as string, 10) || 10000;
        this.cacheTimeout =
            parseInt((this.settings.cacheTimeout || this.adapter.config.defaultCacheTimeout) as string, 10) || 10000;

        // check parameters
        if (!this.settings.ip || typeof this.settings.ip !== 'string') {
            throw new Error(`Invalid IP: "${this.settings.ip}"`);
        }

        this.url = this.settings.url || this.getRtspURL();

        return Promise.resolve();
    }

    async process(): Promise<ProcessImageReturnType> {
        if (this.runningRequest instanceof Promise) {
            return this.runningRequest;
        }

        this.adapter.log.debug(
            `[${this.settings.name}/${this.settings.type}/${this.settings.ip}] Requesting snapshot...`,
        );

        if (this.streaming?.lastBase64Frame) {
            return Promise.resolve({
                body: Buffer.from(this.streaming.lastBase64Frame, 'base64'),
                contentType: 'image/jpeg',
            });
        }

        const outputFileName = normalize(
            `${this.adapter.config.tempPath}/${this.settings.ip.replace(/[.:]/g, '_')}.jpg`,
        );

        this.runningRequest = this.getRtspSnapshot(outputFileName).then(async body => {
            this.runningRequest = null;
            this.adapter.log.debug(`[${this.settings.name}/${this.settings.type}/${this.settings.ip}] Snapshot done!`);

            if (!this.ratio) {
                // try to get width and height
                const metadata = await sharp(body).metadata();
                this.ratio = metadata.width / metadata.height;
            }

            return {
                body,
                contentType: 'image/jpeg',
            };
        });

        return this.runningRequest;
    }

    static maskPassword(str: string, password: string): string {
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

    static executeFFmpeg(
        params: string | string[],
        path: string,
        timeout?: number,
        debug?: (text: string) => void,
        decodedPassword?: string,
    ): Promise<string> {
        const timeoutMs = timeout || 10000;

        return new Promise((resolve, reject) => {
            let paramArray: string[];
            if (params && !Array.isArray(params)) {
                paramArray = params.split(' ');
            } else if (params) {
                paramArray = params as string[];
            } else {
                paramArray = [];
            }

            debug && debug(`Executing ${path} ${RTSP.maskPassword(paramArray.join(' '), decodedPassword)}`);

            const proc = spawn(path, paramArray);
            proc.on('error', (err: any) => reject(new Error(err)));

            const stdout: string[] = [];
            const stderr: string[] = [];

            proc.stdout.setEncoding('utf8');
            proc.stdout.on('data', (data: Buffer) => stdout.push(data.toString('utf8')));

            proc.stderr.setEncoding('utf8');
            proc.stderr.on('data', (data: Buffer) => stderr.push(data.toString('utf8')));

            let timeout = setTimeout(() => {
                timeout = null;
                proc.kill();
                reject(new Error('timeout'));
            }, timeoutMs);

            proc.on('close', (code: number) => {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                    code ? reject(new Error(stderr.join(''))) : resolve(stdout.join(''));
                }
            });
        });
    }

    buildCommand(options: RTSPImageSettings, outputFileName: string): string[] {
        const parameters = ['-y'];
        let password = this.decodedPassword;
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
        parameters.push(
            `rtsp://${options.username ? `${encodeURIComponent(options.username)}:${password}@` : ''}${options.ip}:${options.port || 554}${options.urlPath ? (options.urlPath.startsWith('/') ? options.urlPath : `/${options.urlPath}`) : ''}`,
        );

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

    async getRtspSnapshot(outputFileName: string): Promise<Buffer> {
        const parameters = this.buildCommand(this.settings, outputFileName);

        await RTSP.executeFFmpeg(
            parameters,
            this.adapter.config.ffmpegPath,
            this.timeout,
            (text: string): void => this.adapter.log.debug(text),
            this.decodedPassword,
        );
        return readFileSync(outputFileName);
    }

    getRtspURL(): string {
        return `rtsp://${this.settings.username ? `${encodeURIComponent(this.settings.username)}:${this.decodedPassword}@` : ''}${this.settings.ip}:${this.settings.port || 554}${this.settings.urlPath ? (this.settings.urlPath.startsWith('/') ? this.settings.urlPath : `/${this.settings.urlPath}`) : ''}`;
    }

    // ffmpeg -rtsp_transport udp -i rtsp://localhost:8090/stream -c:a aac -b:a 160000 -ac 2 -s 854x480 -c:v libx264 -b:v 800000 -hls_time 10 -hls_list_size 2 -hls_flags delete_segments -start_number 1 playlist.m3u8
    async webStreaming(fromState?: boolean): Promise<void> {
        if (!fromState) {
            await this.adapter.setState(`${this.settings.name}.running`, true, true);
        }

        if (!this.url) {
            this.adapter.log.error(
                `[${this.settings.name}/${this.settings.type}/${this.settings.ip}] No URL for camera`,
            );
            throw new Error(`No URL for camera ${this.settings.name}`);
        }

        const desiredWidth = this.settings.width || 0;

        if (this.streaming && this.streaming.width !== desiredWidth) {
            // if width changed drastically
            if (this.streaming.width && desiredWidth && Math.abs(this.streaming.width - desiredWidth) < 100) {
                this.streaming.width = desiredWidth;
            } else {
                // stop streaming
                this.adapter.log.debug(
                    `[${this.settings.name}/${this.settings.type}/${this.settings.ip}] Stopping streaming while requested width is ${desiredWidth}. was ${this.streaming.width}`,
                );
                await this.stopWebStreaming();
                // wait 3 seconds
                await new Promise(resolve => setTimeout(resolve, 10000));
            }
        }

        if (!this.streaming) {
            this.streaming = {
                width: desiredWidth,
                proc: null,
            };

            this.adapter.log.debug(
                `[${this.settings.name}/${this.settings.type}/${this.settings.ip}] Starting streaming (${this.url.replace(/:[^@]+@/, ':****@')}), width: ${desiredWidth}`,
            );

            const command = ffmpeg(this.url)
                .setFfmpegPath(this.adapter.config.ffmpegPath)
                // .addInputOption('-preset', 'ultrafast')
                .addInputOption('-rtsp_transport', 'tcp')
                .addInputOption('-re')
                .outputFormat('mjpeg')
                .fps(2)
                .addOptions('-q:v 0');

            this.streaming.proc = command;

            if (desiredWidth) {
                // first try to find the best scale
                if (!this.ratio) {
                    const outputFileName = normalize(
                        `${this.adapter.config.tempPath}/${this.settings.ip.replace(/[.:]/g, '_')}.jpg`,
                    );
                    const body = await this.getRtspSnapshot(outputFileName);
                    // try to get width and height
                    const metadata = await sharp(body).metadata();
                    this.ratio = metadata.width / metadata.height;
                }
                command.addOptions(`-vf scale=${this.settings.width}:${Math.round(this.settings.width / this.ratio)}`);
            }

            command.on('end', async () => {
                this.adapter.log.debug(
                    `[${this.settings.name}/${this.settings.type}/${this.settings.ip}] Streaming stopped`,
                );
                await this.adapter.setState(`${this.settings.name}.stream`, '', true);
                await this.adapter.setState(`${this.settings.name}.running`, false, true);
            });
            command.on('error', async (err /* , stdout, stderr */) => {
                if (this.streaming) {
                    await this.adapter.setState(`${this.settings.name}.stream`, '', true);
                    await this.adapter.setState(`${this.settings.name}.running`, false, true);
                    this.adapter.log.debug(
                        `[${this.settings.name}/${this.settings.type}/${this.settings.ip}] Cannot process video: ${err.message}`,
                    );
                } else {
                    this.adapter.log.debug(
                        `[${this.settings.name}/${this.settings.type}/${this.settings.ip}] Streaming stopped`,
                    );
                }
            });

            const ffStream = command.pipe();
            let chunks = Buffer.from([]);
            this.lastFrame = 0;
            this.streaming.monitor = this.adapter.setInterval(async () => {
                if (Date.now() - this.lastFrame > 10000) {
                    if (this.streaming.monitor) {
                        this.adapter.clearInterval(this.streaming.monitor);
                    }
                    this.streaming.monitor = null;
                    this.adapter.log.debug(
                        `[${this.settings.name}/${this.settings.type}/${this.settings.ip}] No data for 10 seconds. Stopping`,
                    );
                    await this.stopWebStreaming();
                }
            }, 10000);

            ffStream.on('data', chunk => {
                if (chunk.length > 2 && chunk[0] === 0xff && chunk[1] === 0xd8) {
                    const frame = chunks.toString('base64');
                    let found = false;
                    if (!this.lastFrame || Date.now() - this.lastFrame > 300) {
                        this.lastFrame = Date.now();
                        console.log(`frame ${frame.length}`);
                        this.streaming.lastBase64Frame = frame;

                        const clientsToDelete: string[] = [];
                        const promises: Promise<void>[] = [];
                        this.streamSubscribes?.forEach(sub => {
                            if (sub.camera === this.settings.name) {
                                found = true;
                                if (this.adapter.sendToUI) {
                                    try {
                                        promises.push(
                                            this.adapter.sendToUI({ clientId: sub.clientId, data: frame }).catch(e => {
                                                if (e?.toString().includes('not registered')) {
                                                    // forget this client
                                                    clientsToDelete.push(sub.clientId);
                                                }
                                                this.adapter.log.warn(`Cannot send to UI: ${e}`);
                                            }),
                                        );
                                    } catch (e) {
                                        if (e?.toString().includes('not registered')) {
                                            // forget this client
                                            clientsToDelete.push(sub.clientId);
                                        }
                                        this.adapter.log.warn(`Cannot send to UI: ${e}`);
                                    }
                                }
                            }
                        });
                        void Promise.all(promises).then(() => {
                            if (clientsToDelete.length) {
                                for (let i = this.streamSubscribes.length - 1; i >= 0; i--) {
                                    if (clientsToDelete.includes(this.streamSubscribes[i].clientId)) {
                                        this.streamSubscribes.splice(i, 1);
                                    }
                                }
                            }
                            if (!found) {
                                return this.adapter.setState(`${this.settings.name}.stream`, frame, true);
                            }
                        });
                    } else {
                        console.log(
                            `[${this.settings.name}/${this.settings.type}/${this.settings.ip}] skip frame ${frame.length}`,
                        );
                    }
                    chunks = chunk;
                } else {
                    chunks = Buffer.concat([chunks, chunk]);
                }
            });
        }
    }

    async stopWebStreaming(): Promise<void> {
        if (this.streaming) {
            if (this.streaming.monitor) {
                clearInterval(this.streaming.monitor);
                this.streaming.monitor = null;
            }
            try {
                this.streaming.proc.kill('KILL');
            } catch (e) {
                console.error(
                    `[${this.settings.name}/${this.settings.type}/${this.settings.ip}] Cannot stop process: ${e}`,
                );
            }
            await this.adapter.setState(`${this.settings.name}.stream`, '', true);
            await this.adapter.setState(`${this.settings.name}.running`, false, true);
            this.streaming = null;
        }
    }
}

export default RTSP;
