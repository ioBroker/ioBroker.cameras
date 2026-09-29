import type { CameraConfigAny, CameraConfigUniversal, ProcessData } from '../types';
import GenericRtspCamera from './GenericRtspCamera';
import axios from 'axios';

export default class UniversalCamera extends GenericRtspCamera {
    protected config: CameraConfigUniversal;
    private basicAuth: string | undefined;
    private simpleURL: string | undefined;

    constructor(adapter: ioBroker.Adapter, config: CameraConfigAny, ffmpegPath: string) {
        super(adapter, config, ffmpegPath);
        this.config = config as CameraConfigUniversal;
    }

    /**
     * Replace the placeholders ispyconnect.com uses in its URL table.
     *
     * A placeholder may appear more than once in one path, so every replacement is global.
     * `[PASWORD]` is a typo in the source data and means the same as `[PASSWORD]`; `[AUTH]` is the
     * base64 of `user:password` that the Dahua-style URLs append as `authbasic=`.
     */
    private buildUrlPath(): string {
        // One pass, so a replacement can never be replaced again by the next placeholder
        return this.config.urlPath.replace(
            /\[(CHANNEL|WIDTH|HEIGHT|AUTH|USERNAME|PASWORD|PASSWORD)]/g,
            (_placeholder: string, name: string): string => {
                switch (name) {
                    case 'CHANNEL':
                        return this.config.channel?.toString() || '0';
                    case 'WIDTH':
                        return this.config.width?.toString() || '640';
                    case 'HEIGHT':
                        return this.config.height?.toString() || '480';
                    case 'AUTH':
                        return Buffer.from(`${this.config.username || ''}:${this.decodedPassword}`).toString('base64');
                    case 'USERNAME':
                        return this.config.username || '';
                    default:
                        return this.decodedPassword;
                }
            },
        );
    }

    async init(): Promise<void> {
        this.decodedPassword = this.config.password ? this.adapter.decrypt(this.config.password) : '';

        if (!this.config.model) {
            throw new Error('Model is required');
        }
        if (this.config.urlProtocol === 'http://') {
            // It is URL type
            this.isRtsp = false;
            // Calculate basic authentication. The password was encrypted and must be decrypted
            this.basicAuth = this.config.username
                ? `Basic ${Buffer.from(`${this.config.username}:${this.decodedPassword}`).toString('base64')}`
                : undefined;

            this.simpleURL = `http://${this.config.ip}${!this.config.port || parseInt(this.config.port as string, 10) === 80 ? '' : `:${this.config.port}`}${this.buildUrlPath()}`;
        } else {
            this.isRtsp = true;
            this.settings = {
                ip: this.config.ip,
                port: this.config.port || 554,
                urlPath: this.buildUrlPath(),
                username: this.config.username,
                protocol: 'tcp',
            };
        }

        return super.init();
    }

    async processSimple(): Promise<ProcessData> {
        if (this.runningRequest) {
            return this.runningRequest;
        }

        const options: axios.AxiosRequestConfig = {
            responseType: 'arraybuffer',
            validateStatus: status => status < 400,
            timeout: this.config.timeout as number,
        };
        if (this.basicAuth) {
            options.headers = { Authorization: this.basicAuth };
        }

        this.runningRequest = axios
            .get(this.simpleURL!, options)
            .then(response => ({
                body: response.data,
                contentType: response.headers['Content-type'] || response.headers['content-type'],
            }))
            .catch(error => {
                if (error.response) {
                    throw new Error(error.response.data || error.response.status);
                } else {
                    throw new Error(error.code);
                }
            })
            // Also on failure - a request left behind here would be handed out to every later
            // caller, so one unreachable camera would stay broken until the adapter restarts
            .finally(() => (this.runningRequest = null));

        return this.runningRequest;
    }

    async process(): Promise<ProcessData> {
        if (this.simpleURL) {
            return this.processSimple();
        }
        return super.process();
    }
}
