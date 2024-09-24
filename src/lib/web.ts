import * as http from 'node:http';
import { type IncomingMessage, type Server } from 'node:http';
import { type Express } from 'express';

function getUrl(
    path: string,
    query: Record<string, any>,
    port: number,
): Promise<{ body: Buffer; contentType: string }> {
    return new Promise((resolve, reject) => {
        const queryStr = Object.keys(query)
            .map(attr => `${attr}=${encodeURIComponent(query[attr])}`)
            .join('&');

        http.get(`http://127.0.0.1:${port}/${path}${queryStr ? `?${queryStr}` : ''}`, (res: IncomingMessage) => {
            const { statusCode } = res;
            const contentType: string = res.headers['content-type'];

            if (statusCode !== 200) {
                // Consume response data to free-up memory
                res.resume();
                return reject(new Error(`Request Failed. Status Code: ${statusCode}`));
            }

            const data: Buffer[] = [];
            res.on('data', (chunk: Buffer) => data.push(chunk));
            res.on('end', () => resolve({ body: Buffer.concat(data), contentType }));
            res.on('error', e => reject(new Error(e.message)));
        }).on('error', e => reject(new Error((e.message || e).toString())));
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
class ProxyCameras {
    private app: Express;
    private config: ioBroker.AdapterConfig;
    private readonly namespace: string;
    private readonly route: string;
    private readonly adapter: ioBroker.Adapter;

    constructor(
        _server: Server,
        _webSettings: { secure: boolean; port: number },
        adapter: ioBroker.Adapter,
        instanceSettings: ioBroker.InstanceObject,
        app: Express,
    ) {
        this.app = app;
        this.config = (instanceSettings ? instanceSettings.native : {}) as ioBroker.AdapterConfig;
        this.namespace = instanceSettings ? instanceSettings._id.substring('system.adapter.'.length) : 'cameras';

        // @ts-expect-error route could be defined
        this.route = this.config.route || `${this.namespace}/`;
        this.config.port = parseInt(this.config.port as unknown as string, 10) || 80;

        // remove leading slash
        if (this.route[0] === '/') {
            this.route = this.route.substr(1);
        }

        this.adapter = adapter;
        this.config.cameras.forEach(cam => this.oneCamera(cam));
    }

    oneCamera(rule: { name: string }): void {
        this.adapter.log.info(`Install extension on /${this.route}${rule.name}`);

        this.app.use(`/${this.route}${rule.name}`, (req, res) => {
            const parts = req.url.split('?');
            const query: Record<string, string> = {};
            (parts[1] || '').split('&').forEach(p => {
                if (p && p.includes('=')) {
                    const pp = p.split('=');
                    query[pp[0]] = decodeURIComponent(pp[1] || '');
                }
            });

            query.key = this.config.key;
            if (req.path.match(/^\/streaming/)) {
                getUrl(rule.name + req.path, query, this.config.port)
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

            this.adapter.log.debug(
                `Request "${rule.name}" with "${JSON.stringify(query)} on port ${this.config.port}...`,
            );

            getUrl(rule.name, query, this.config.port)
                .then(file => {
                    res.setHeader('Content-type', file.contentType);
                    res.status(200).send(file.body || '');
                })
                .catch(error => {
                    const text = error.response ? error.response.data || error : error;
                    this.adapter.log.error(
                        `Cannot request "${rule.name}" with "${JSON.stringify(query)} on port ${this.config.port}: ${text}`,
                    );
                    res.status(500).send(typeof error !== 'string' ? JSON.stringify(error) : error);
                });
        });
    }
}

module.exports = ProxyCameras;
