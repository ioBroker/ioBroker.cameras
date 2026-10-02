import { URL } from 'node:url';
import type { CameraConfigAny, CameraConfigEufy, ProcessData } from '../types';
import GenericRtspCamera from './GenericRtspCamera';

/** Starting the P2P stream wakes a battery camera up and connects through the station - that takes a while */
const LIVESTREAM_START_TIMEOUT_MS = 25_000;
const LIVESTREAM_POLL_MS = 500;
/** eusec writes the link before the first frame arrives in its go2rtc */
const LIVESTREAM_SETTLE_MS = 1_500;
/**
 * A camera that was just woken up needs a while until its frames arrive through the station.
 * Until then every snapshot runs into the ffmpeg timeout, so it is repeated for this long.
 */
const LIVESTREAM_FIRST_FRAME_TIMEOUT_MS = 20_000;
const LIVESTREAM_RETRY_PAUSE_MS = 1_000;

export default class EufyCamera extends GenericRtspCamera {
    protected config: CameraConfigEufy;

    /**
     * Object ID of the eusec device, set for a camera without RTSP of its own. eusec streams such
     * a camera through the station into its own go2rtc - but only after `start_stream` was
     * pressed, and it ends the stream again after its "max. livestream duration".
     */
    private livestreamDevice: string | null = null;

    constructor(adapter: ioBroker.Adapter, config: CameraConfigAny, ffmpegPath: string) {
        super(adapter, config, ffmpegPath);
        this.config = config as CameraConfigEufy;
    }

    async init(): Promise<void> {
        // check parameters
        if (this.config.useOid && !this.config.oid) {
            throw new Error(`Invalid object ID: "${this.config.oid}"`);
        }
        this.settings = {
            ip: this.config.ip,
            port: 80,
        };

        // check parameters
        if (!this.config.useOid && (!this.config.ip || typeof this.config.ip !== 'string')) {
            throw new Error(`Invalid IP: "${this.config.ip}"`);
        }

        if (this.config.useOid) {
            const parts = this.config.oid.split('.');
            parts.pop();
            const device = parts.join('.');

            // eusec creates the RTSP states only for cameras that support RTSP themselves
            const hasRtsp = !!(await this.adapter.getForeignObjectAsync(this.config.oid));
            if (!hasRtsp && (await this.adapter.getForeignObjectAsync(`${device}.start_stream`))) {
                await this.initLivestream(device);
                return super.init();
            }

            const url = await this.adapter.getForeignStateAsync(this.config.oid);
            const rtspEnabled = await this.adapter.getForeignStateAsync(`${device}.rtsp_stream`);
            if (rtspEnabled && !rtspEnabled.val) {
                await this.adapter.setForeignStateAsync(`${device}.rtsp_stream`, true);
            }
            if (url?.val && typeof url.val === 'string') {
                this.applyUrl(url.val);
            } else {
                // Otherwise the base class fails with a missing IP, which says nothing about the cause
                throw new Error(
                    `The eusec adapter has no RTSP link in "${this.config.oid}" yet. RTSP was switched on now, the link follows after a restart; if not, enable RTSP for the camera in the Eufy app`,
                );
            }
        } else {
            this.settings.urlPath = '/live0';
        }

        return super.init();
    }

    private applyUrl(url: string): void {
        const u = new URL(url);
        this.settings!.ip = u.hostname;
        this.settings!.port = u.port || 554;
        this.settings!.urlPath = u.pathname;
        this.settings!.username = decodeURIComponent(u.username);
        this.decodedPassword = decodeURIComponent(u.password);
    }

    /**
     * Prepare the address of the P2P stream without starting it - that would wake the camera up
     * at every adapter start. eusec builds the link as rtsp://<hostname>:<go2rtc_rtsp_port>/<serial>.
     */
    private async initLivestream(device: string): Promise<void> {
        this.livestreamDevice = device;
        // The protocol must be TCP, go2rtc does not serve RTSP over UDP
        this.settings!.protocol = 'tcp';

        const running = await this.adapter.getForeignStateAsync(`${device}.livestream_rtsp`);
        if (running?.val && typeof running.val === 'string') {
            this.applyUrl(running.val);
            return;
        }

        const instanceId = device.split('.').slice(0, 2).join('.');
        const instance = await this.adapter.getForeignObjectAsync(`system.adapter.${instanceId}`);
        const native = (instance?.native || {}) as {
            hostname?: string;
            go2rtc_rtsp_port?: number | string;
            go2rtc_rtsp_username?: string;
        };
        // An empty hostname means the host eusec runs on - this one, unless it is a multi-host setup
        let host = native.hostname;
        if (!host) {
            const eusecHost = (instance?.common as ioBroker.InstanceCommon | undefined)?.host;
            host =
                !eusecHost || eusecHost === this.adapter.host
                    ? '127.0.0.1'
                    : (await this.adapter.getForeignObjectAsync(`system.host.${eusecHost}`))?.common?.hostname ||
                      '127.0.0.1';
        }
        if (native.go2rtc_rtsp_username) {
            // The password is a protected setting of eusec, other adapters cannot read it
            this.adapter.log.warn(
                `Camera "${this.config.name}": the go2rtc of eusec requires a login for RTSP, which cannot be read from eusec. Remove the RTSP login in the eusec settings`,
            );
        }
        this.settings!.ip = host;
        this.settings!.port = native.go2rtc_rtsp_port || 8554;
        this.settings!.urlPath = `/${device.split('.').pop()}`;
    }

    /** Press `start_stream` unless the stream already runs. Returns true if it was started now */
    private async ensureLivestream(): Promise<boolean> {
        const device = this.livestreamDevice!;
        const linkId = `${device}.livestream_rtsp`;
        const running = await this.adapter.getForeignStateAsync(linkId);
        if (running?.val && typeof running.val === 'string') {
            this.applyUrl(running.val);
            return false;
        }

        this.adapter.log.debug(`Camera "${this.config.name}": starting the live stream of ${device}`);
        await this.adapter.setForeignStateAsync(`${device}.start_stream`, true);

        const deadline = Date.now() + LIVESTREAM_START_TIMEOUT_MS;
        while (Date.now() < deadline) {
            await new Promise(resolve => setTimeout(resolve, LIVESTREAM_POLL_MS));
            const link = await this.adapter.getForeignStateAsync(linkId);
            if (link?.val && typeof link.val === 'string') {
                this.applyUrl(link.val);
                await new Promise(resolve => setTimeout(resolve, LIVESTREAM_SETTLE_MS));
                return true;
            }
        }
        throw new Error(
            `eusec did not start the live stream of "${device}" within ${LIVESTREAM_START_TIMEOUT_MS / 1000} s. Is the station connected?`,
        );
    }

    async process(): Promise<ProcessData> {
        if (!this.livestreamDevice) {
            return super.process();
        }
        const startedNow = await this.ensureLivestream();
        let deadline = Date.now() + LIVESTREAM_FIRST_FRAME_TIMEOUT_MS;
        if (!startedNow) {
            try {
                return await super.process();
            } catch (e) {
                // eusec deletes the link only when the stream stops regularly. After a restart of
                // eusec or a lost connection to the station it stays, although nothing streams
                this.adapter.log.debug(
                    `Camera "${this.config.name}": no frame although eusec shows a live stream link, starting the stream again: ${e as Error}`,
                );
                await this.adapter.setForeignStateAsync(`${this.livestreamDevice}.start_stream`, true);
                // The link exists already, so the start cannot be noticed - only frames show it
                deadline = Date.now() + LIVESTREAM_START_TIMEOUT_MS + LIVESTREAM_FIRST_FRAME_TIMEOUT_MS;
            }
        } else {
            this.adapter.log.debug(`Camera "${this.config.name}": live stream started, waiting for the first frame`);
        }

        // The stream has just been started - its first frames may take a while
        let lastError: unknown;
        do {
            try {
                return await super.process();
            } catch (e) {
                lastError = e;
                this.adapter.log.debug(
                    `Camera "${this.config.name}": no frame from the live stream yet: ${e as Error}`,
                );
                await new Promise(resolve => setTimeout(resolve, LIVESTREAM_RETRY_PAUSE_MS));
            }
        } while (Date.now() < deadline);

        throw new Error(
            `No image from the live stream of "${this.livestreamDevice}" after it was started: ${(lastError as Error)?.message || String(lastError)}`,
        );
    }

    async startWebStream(options?: { width?: number }): Promise<void> {
        if (this.livestreamDevice) {
            await this.ensureLivestream();
        }
        return super.startWebStream(options);
    }
}
