/**
 * This file is a web extension for a global server, and it runs in a context of ioBroker.web
 * It will be started by ioBroker.web and called by it
 */
import * as http from 'node:http';
import type { Server as HttpServer } from 'node:http';
import type { Server as HttpsServer } from 'node:https';
import type { Express } from 'express';
import type { CameraConfigAny, CamerasAdapterConfig } from '../types';

/**
 * Read image by request from global web server
 *
 * @param path name of the camera
 * @param query parameters for the camera
 * @param port Port of internal web server hosted by `cameras` adapter
 */
function getUrl(
    path: string,
    query: Record<string, string>,
    port: number,
): Promise<{ body: Buffer; contentType: string }> {
    return new Promise<{ body: Buffer; contentType: string }>((resolve, reject): void => {
        const queryStr = Object.keys(query)
            .map(attr => `${attr}=${encodeURIComponent(query[attr])}`)
            .join('&');

        http.get(`http://127.0.0.1:${port}/${path}${queryStr ? `?${queryStr}` : ''}`, res => {
            const { statusCode } = res;
            const contentType = (res.headers['content-type'] || res.headers['Content-type']) as string;

            if (statusCode !== 200) {
                // Consume response data to free-up memory
                res.resume();
                return reject(new Error(`Request Failed. Status Code: ${statusCode}`));
            }

            const data: Uint8Array[] = [];
            res.on('data', chunk => data.push(chunk));
            res.on('end', () => resolve({ body: Buffer.concat(data), contentType }));
            res.on('error', e => reject(new Error(e.message)));
        }).on('error', e => reject(new Error(e.message)));
    });
}

/**
 * Proxy class
 *
 * Read files from localhost server
 *
 * @param server http or https node.js object
 * @param webSettings settings of the web server, like <pre><code>{secure: settings.secure, port: settings.port}</code></pre>
 * @param adapter web adapter object
 * @param instanceSettings instance object with common and native
 * @param app express application
 */
export default class ProxyCameras {
    private readonly app: Express;
    private readonly config: CamerasAdapterConfig & { route: string };
    private readonly namespace: string;
    private readonly adapter: ioBroker.Adapter;

    constructor(
        server: HttpServer | HttpsServer,
        webSettings: { secure: boolean; port: number },
        adapter: ioBroker.Adapter,
        instanceSettings: ioBroker.InstanceObject,
        app: Express,
    ) {
        this.app = app;
        this.config = instanceSettings
            ? (instanceSettings.native as CamerasAdapterConfig & { route: string })
            : ({} as CamerasAdapterConfig & { route: string });
        this.namespace = instanceSettings ? instanceSettings._id.substring('system.adapter.'.length) : 'cameras';

        this.config.route = this.config.route || `${this.namespace}/`;
        this.config.port = parseInt(this.config.port as string, 10) || 80;

        // remove leading slash
        if (this.config.route[0] === '/') {
            this.config.route = this.config.route.substr(1);
        }

        this.adapter = adapter;
        this.config.cameras.forEach(cam => this.oneCamera(cam));
    }

    oneCamera(rule: CameraConfigAny): void {
        this.adapter.log.info(`Install extension on /${this.config.route}${rule.name}`);

        this.app.use(`/${this.config.route}${rule.name}`, (req, res) => {
            const parts = req.url.split('?');
            const query: Record<string, string> = {};
            (parts[1] || '').split('&').forEach(p => {
                if (p?.includes('=')) {
                    const pp = p.split('=');
                    query[decodeURIComponent(pp[0])] = decodeURIComponent(pp[1] || '');
                }
            });

            query.key = this.config.key;
            if (req.path.match(/^\/streaming/)) {
                getUrl(rule.name + req.path, query, this.config.port as number)
                    .then(file => {
                        const headers = {
                            'Access-Control-Allow-Origin': '*' /* @dev First, read about security */,
                            'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
                            'Access-Control-Max-Age': 2592000, // 30 days
                            /** add other headers as per requirement */
                        };

                        res.set(headers);

                        if (req.method === 'OPTIONS') {
                            res.status(204);
                            res.end();
                            return;
                        }

                        res.setHeader('Content-type', file.contentType);
                        res.status(200).send(file.body || '');
                    })
                    .catch(error => res.status(500).send(typeof error !== 'string' ? JSON.stringify(error) : error));
                return;
            }
            getUrl(rule.name, query, this.config.port as number)
                .then(file => {
                    res.setHeader('Content-type', file.contentType);
                    res.status(200).send(file.body || '');
                })
                .catch(error => res.status(500).send(typeof error !== 'string' ? JSON.stringify(error) : error));
        });
    }
}
