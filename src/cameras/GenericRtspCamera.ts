import path from 'node:path';
import ffmpeg, { type FfmpegCommand } from 'fluent-ffmpeg';
import sharp from 'sharp';

import GenericCamera from './GenericCamera';
import type { ContentType, CamerasAdapterConfig, ProcessData, CameraConfigAny } from '../types';
import { getRtspSnapshot, type RtspOptions } from './rtspCommon';
import type Go2RtcServer from '../lib/Go2RtcServer';

export default class GenericRtspCamera extends GenericCamera {
    private width = 0;
    private ratio = 0;
    protected decodedPassword = '';
    private lastFrame: number = 0;
    private monitor: ReturnType<typeof setTimeout> | null = null;
    protected runningRequest: Promise<{ body: Buffer; contentType: ContentType }> | null = null;
    private lastBase64Frame = '';
    private proc: FfmpegCommand | null = null;
    public isRtsp = true;
    protected settings: RtspOptions | null = null;
    private readonly ffmpegPath: string;
    private go2rtc: Go2RtcServer | null = null;

    constructor(adapter: ioBroker.Adapter, config: CameraConfigAny, ffmpegPath: string) {
        super(adapter, config);
        this.ffmpegPath = ffmpegPath;
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

    getPassword(): string {
        return this.decodedPassword;
    }

    /** Hand over a running go2rtc instance. If set, snapshots are taken from it instead of ffmpeg */
    setGo2Rtc(server: Go2RtcServer | null): void {
        this.go2rtc = server;
    }

    /**
     * Snapshot via go2rtc. Returns null if go2rtc is unavailable or fails, so the caller can
     * fall back to the ffmpeg path.
     */
    private async processViaGo2Rtc(): Promise<ProcessData | null> {
        if (!this.go2rtc?.isRunning()) {
            return null;
        }

        try {
            await this.go2rtc.ensureStream(this.config.name, this.getRtspURL());
            const body = await this.go2rtc.getSnapshot(this.config.name, this.config.timeout as number);
            return { body, contentType: 'image/jpeg' };
        } catch (e) {
            this.adapter.log.warn(
                `go2rtc snapshot for "${this.config.name}" failed, using ffmpeg instead: ${e as Error}`,
            );
            return null;
        }
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

        const viaGo2Rtc = await this.processViaGo2Rtc();
        if (viaGo2Rtc) {
            return viaGo2Rtc;
        }

        this.runningRequest = getRtspSnapshot(
            this.settings,
            this.getSnapshotFileName(),
            this.ffmpegPath,
            this.decodedPassword,
            this.config.timeout as number,
            this.adapter.log,
        )
            .then(async body => {
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
            })
            // Also on failure - a request left behind here would be handed out to every later
            // caller, so one unreachable camera would stay broken until the adapter restarts
            .finally(() => (this.runningRequest = null));

        return this.runningRequest;
    }

    /**
     * Scratch file ffmpeg writes the snapshot to.
     *
     * Named after the camera, not after its address: a main stream and a sub stream of the same
     * camera are two entries with the same IP, and they would overwrite each other's frame.
     */
    private getSnapshotFileName(): string {
        return path.normalize(
            `${(this.adapter.config as CamerasAdapterConfig).tempPath}/${this.config.name.replace(/[^\w-]/g, '_')}.jpg`,
        );
    }

    getRtspURL(): string {
        if (!this.settings) {
            throw new Error(`No settings for camera ${this.config.name}`);
        }

        return `rtsp://${this.settings.username ? `${encodeURIComponent(this.settings.username)}:${encodeURIComponent(this.decodedPassword)}@` : ''}${this.settings.ip}:${this.settings.port || 554}${this.settings.urlPath ? (this.settings.urlPath.startsWith('/') ? this.settings.urlPath : `/${this.settings.urlPath}`) : ''}`;
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
            // A small difference is not worth restarting ffmpeg for, the scale is close enough
            if (this.width && desiredWidth && Math.abs(this.width - desiredWidth) < 100) {
                this.width = desiredWidth;
            } else if (this.proc) {
                // The scale is part of the running ffmpeg command line, so a real change needs a
                // restart. Only then - with nothing running yet there is nothing to wait for, and
                // waiting here would delay the first picture of every viewer by ten seconds.
                this.adapter.log.debug(
                    `Stopping streaming for ${this.config.name} while requested width is ${desiredWidth}. Was ${this.width}`,
                );
                await this.stopWebStream();

                // Give the camera a moment to let go of the old connection
                await new Promise(resolve => setTimeout(resolve, 10000));

                this.width = desiredWidth;
            } else {
                this.width = desiredWidth;
            }
        }

        if (!this.proc) {
            await this.adapter.setState(`${this.config.name}.running`, true, true);

            this.adapter.log.debug(
                `Starting streaming for ${this.config.name} (${url.replace(/:[^@]+@/, ':****@')}), width: ${this.width}`,
            );

            this.proc = ffmpeg(url)
                .setFfmpegPath(this.ffmpegPath)
                // .addInputOption('-preset', 'ultrafast')
                .addInputOption('-rtsp_transport', 'tcp')
                .addInputOption('-re')
                .outputFormat('mjpeg')
                .fps(2)
                .addOptions('-q:v 0');

            if (this.width) {
                // first try to find the best scale
                if (!this.ratio) {
                    const body = await getRtspSnapshot(
                        this.settings!,
                        this.getSnapshotFileName(),
                        this.ffmpegPath,
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
                        this.lastBase64Frame = frame;

                        if (this.streamSubscribes) {
                            const clientsToDelete: string[] = [];
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

                            // Forget the clients that are no longer registered. Remove them by
                            // identity - the index in clientsToDelete is unrelated to streamSubscribes
                            for (const clientId of clientsToDelete) {
                                const pos = this.streamSubscribes.findIndex(
                                    s => s.clientId === clientId && s.camera === this.config.name,
                                );
                                if (pos !== -1) {
                                    this.streamSubscribes.splice(pos, 1);
                                }
                            }
                        }

                        if (!found) {
                            await this.adapter.setState(`${this.config.name}.stream`, frame, true);
                        }
                    }
                    chunks = chunk as Buffer<ArrayBuffer>;
                } else {
                    chunks = Buffer.concat([chunks, chunk]);
                }
            });
        }
    }

    async stopWebStream(restart?: boolean): Promise<void> {
        // The last frame of the stream must not survive it. process() answers from it while the
        // stream runs, so keeping it would freeze every later snapshot on that picture.
        this.lastBase64Frame = '';

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
                    this.adapter.log.warn(`Cannot stop ffmpeg for "${this.config.name}": ${e}`);
                }
                await this.adapter.setState(`${this.config.name}.stream`, '', true);
                await this.adapter.setState(`${this.config.name}.running`, false, true);
            }

            if (restart) {
                // Nothing to do here: the stream is stopped, and the next subscription of a GUI
                // client starts it again. Restarting it now would keep ffmpeg running for nobody.
                this.adapter.log.debug(`Streaming for ${this.config.name} stopped after an error`);
            }
        }
    }
}
