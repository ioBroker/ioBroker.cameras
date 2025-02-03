import path from 'node:path';
import ffmpeg, { type FfmpegCommand } from 'fluent-ffmpeg';
import sharp from 'sharp';

import GenericCamera from './GenericCamera';
import type { ContentType, CamerasAdapterConfig, ProcessData, CameraConfigAny } from '../types';
import { getRtspSnapshot, type RtspOptions } from './rtspCommon';

export default class GenericRtspCamera extends GenericCamera {
    private width = 0;
    private ratio = 0;
    protected decodedPassword = '';
    private lastFrame: number = 0;
    private monitor: ReturnType<typeof setTimeout> | null = null;
    private runningRequest: Promise<{ body: Buffer; contentType: ContentType }> | null = null;
    private lastBase64Frame = '';
    private proc: FfmpegCommand | null = null;
    public isRtsp = true;
    protected settings: RtspOptions | null = null;

    constructor(adapter: ioBroker.Adapter, config: CameraConfigAny) {
        super(adapter, config);
        //     Fill settings
        //     fill decodedPassword
        //     this.decodedPassword = this.adapter.decrypt(this.config.password);
    }

    async init(): Promise<void> {
        // check parameters
        if (!this.settings?.ip || typeof this.settings.ip !== 'string') {
            if (!this.settings) {
                throw new Error(`Invalid settings: undefined`);
            }
            throw new Error(`Invalid IP: "${this.settings?.ip}"`);
        }

        this.lastFrame = 0;

        await super.init();
    }

    async destroy(): Promise<void> {
        await this.stopWebStream();

        this.initialized = false;

        // do nothing
        return Promise.resolve();
    }

    async process(): Promise<ProcessData> {
        if (this.runningRequest) {
            return this.runningRequest;
        }

        if (!this.settings) {
            this.adapter.log.error(`No settings for camera ${this.config.name}`);
            throw new Error(`No settings for camera ${this.config.name}`);
        }

        this.adapter.log.debug(`Requesting snapshot from ${this.settings.ip}...`);

        // If stream is enabled, send data from streaming
        if (this.lastBase64Frame) {
            return {
                body: Buffer.from(this.lastBase64Frame, 'base64'),
                contentType: 'image/jpeg',
            };
        }

        const outputFileName = path.normalize(
            `${(this.adapter.config as CamerasAdapterConfig).tempPath}/${this.settings.ip.replace(/[.:]/g, '_')}.jpg`,
        );
        this.runningRequest = getRtspSnapshot(
            this.settings,
            outputFileName,
            (this.adapter.config as CamerasAdapterConfig).ffmpegPath,
            this.decodedPassword,
            this.config.timeout as number,
            this.adapter.log,
        ).then(async body => {
            this.runningRequest = null;
            this.adapter.log.debug(`Snapshot from ${this.settings!.ip}. Done!`);

            if (!this.ratio) {
                // try to get width and height
                const image = sharp(body);
                const metadata = await image.metadata();
                this.ratio = (metadata.width || 1) / (metadata.height || 1);
            }

            return {
                body,
                contentType: 'image/jpeg',
            };
        });

        return this.runningRequest;
    }

    getRtspURL(): string {
        if (!this.settings) {
            throw new Error(`No settings for camera ${this.config.name}`);
        }

        return `rtsp://${this.settings.username ? `${encodeURIComponent(this.settings.username)}:${this.decodedPassword}@` : ''}${this.settings.ip}:${this.settings.port || 554}${this.settings.urlPath ? (this.settings.urlPath.startsWith('/') ? this.settings.urlPath : `/${this.settings.urlPath}`) : ''}`;
    }

    // ffmpeg -rtsp_transport udp -i rtsp://localhost:8090/stream -c:a aac -b:a 160000 -ac 2 -s 854x480 -c:v libx264 -b:v 800000 -hls_time 10 -hls_list_size 2 -hls_flags delete_segments -start_number 1 playlist.m3u8

    async startWebStream(options?: { width?: number }): Promise<void> {
        const url = this.getRtspURL();

        if (!url) {
            this.adapter.log.error(`No URL for camera ${this.config.name}`);
            throw new Error(`No URL for camera ${this.config.name}`);
        }

        const desiredWidth = options?.width || 0;

        if (this.width !== desiredWidth) {
            // if width changed drastically
            if (this.width && desiredWidth && Math.abs(this.width - desiredWidth) < 100) {
                this.width = desiredWidth;
            } else {
                // stop streaming
                this.adapter.log.debug(
                    `Stopping streaming for ${this.config.name} while requested width is ${desiredWidth}. Was ${this.width}`,
                );
                await this.stopWebStream();

                // wait 10 seconds
                await new Promise(resolve => setTimeout(resolve, 10000));

                this.width = desiredWidth;
            }
        }

        if (!this.proc) {
            await this.adapter.setState(`${this.config.name}.running`, true, true);

            this.adapter.log.debug(
                `Starting streaming for ${this.config.name} (${url.replace(/:[^@]+@/, ':****@')}), width: ${this.width}`,
            );

            this.proc = ffmpeg(url)
                .setFfmpegPath((this.adapter.config as CamerasAdapterConfig).ffmpegPath)
                // .addInputOption('-preset', 'ultrafast')
                .addInputOption('-rtsp_transport', 'tcp')
                .addInputOption('-re')
                .outputFormat('mjpeg')
                .fps(2)
                .addOptions('-q:v 0');

            if (this.width) {
                // first try to find the best scale
                if (!this.ratio) {
                    const outputFileName = path.normalize(
                        `${(this.adapter.config as CamerasAdapterConfig).tempPath}/${this.settings!.ip.replace(/[.:]/g, '_')}.jpg`,
                    );
                    const body = await getRtspSnapshot(
                        this.settings!,
                        (this.adapter.config as CamerasAdapterConfig).ffmpegPath,
                        outputFileName,
                        this.decodedPassword,
                        this.config.timeout as number,
                        this.adapter.log,
                    );
                    // try to get width and height
                    const image = sharp(body);
                    const metadata = await image.metadata();
                    this.ratio = (metadata.width || 1) / (metadata.height || 1);
                }
                this.proc.addOptions(`-vf scale=${this.width}:${Math.round(this.width / this.ratio)}`);
            }

            this.proc.on('end', async (): Promise<void> => {
                this.adapter.log.debug(`Streaming for ${this.config.name} stopped`);
                await this.stopWebStream();
            });

            this.proc.on('error', async (err /* , stdout, stderr */): Promise<void> => {
                if (this.proc) {
                    await this.adapter.setState(`${this.config.name}.stream`, '', true);
                    await this.adapter.setState(`${this.config.name}.running`, false, true);
                    this.adapter.log.debug(`Cannot process video for "${this.config.name}": ${err.message}`);
                } else {
                    this.adapter.log.debug(`Streaming for ${this.config.name} stopped`);
                }

                await this.stopWebStream(true);
            });

            const ffStream = this.proc.pipe();
            let chunks = Buffer.from([]);
            this.lastFrame = 0;
            // Start monitor interval, that checks if any picture was received in 10 seconds
            this.monitor = setInterval(async () => {
                if (Date.now() - this.lastFrame > 10000) {
                    if (this.monitor) {
                        clearInterval(this.monitor);
                        this.monitor = null;
                    }
                    this.adapter.log.debug(`No data for ${this.config.name} for 10 seconds. Stopping`);
                    await this.stopWebStream();
                }
            }, 10000);

            ffStream.on('data', async (chunk: Buffer): Promise<void> => {
                if (chunk.length > 2 && chunk[0] === 0xff && chunk[1] === 0xd8) {
                    const frame = chunks.toString('base64');
                    let found = false;

                    // Do not send frames too often
                    if (!this.lastFrame || Date.now() - this.lastFrame > 300) {
                        this.lastFrame = Date.now();
                        console.log(`frame ${frame.length}`);
                        this.lastBase64Frame = frame;

                        if (this.streamSubscribes) {
                            const clientsToDelete = [];
                            this.streamSubscribes.forEach(sub => {
                                if (sub.camera === this.config.name) {
                                    found = true;
                                    try {
                                        if (this.adapter.sendToUI) {
                                            this.adapter.sendToUI({ clientId: sub.clientId, data: frame }).catch(e => {
                                                if (e?.toString().includes('not registered')) {
                                                    // forget this client
                                                    clientsToDelete.push(sub.clientId);
                                                }
                                                this.adapter.log.warn(`Cannot send to UI: ${e}`);
                                            });
                                        }
                                    } catch (e) {
                                        if (e?.toString().includes('not registered')) {
                                            // forget this client
                                            clientsToDelete.push(sub.clientId);
                                        }
                                        this.adapter.log.warn(`Cannot send to UI: ${e}`);
                                    }
                                }
                            });

                            if (clientsToDelete.length) {
                                for (let i = clientsToDelete.length - 1; i >= 0; i--) {
                                    this.streamSubscribes.splice(i, 1);
                                }
                            }
                        }

                        if (!found) {
                            await this.adapter.setState(`${this.config.name}.stream`, frame, true);
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

    async stopWebStream(restart?: boolean): Promise<void> {
        if (this.initialized) {
            if (this.monitor) {
                clearInterval(this.monitor);
                this.monitor = null;
            }
            if (this.proc) {
                try {
                    this.proc?.kill('SIGKILL');
                    this.proc = null;
                } catch (e) {
                    console.error(`Cannot stop process: ${e}`);
                }
                await this.adapter.setState(`${this.config.name}.stream`, '', true);
                await this.adapter.setState(`${this.config.name}.running`, false, true);
            }

            // todo
            if (restart) {
                this.adapter.log.warn('Implement restart of ffmpeg process');
            }
        }
    }
}
