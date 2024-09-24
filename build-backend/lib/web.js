"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const http = __importStar(require("node:http"));
function getUrl(path, query, port) {
    return new Promise((resolve, reject) => {
        const queryStr = Object.keys(query)
            .map(attr => `${attr}=${encodeURIComponent(query[attr])}`)
            .join('&');
        http.get(`http://127.0.0.1:${port}/${path}${queryStr ? `?${queryStr}` : ''}`, (res) => {
            const { statusCode } = res;
            const contentType = res.headers['content-type'];
            if (statusCode !== 200) {
                // Consume response data to free-up memory
                res.resume();
                return reject(new Error(`Request Failed. Status Code: ${statusCode}`));
            }
            const data = [];
            res.on('data', (chunk) => data.push(chunk));
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
    app;
    config;
    namespace;
    route;
    adapter;
    constructor(_server, _webSettings, adapter, instanceSettings, app) {
        this.app = app;
        this.config = (instanceSettings ? instanceSettings.native : {});
        this.namespace = instanceSettings ? instanceSettings._id.substring('system.adapter.'.length) : 'cameras';
        // @ts-expect-error route could be defined
        this.route = this.config.route || `${this.namespace}/`;
        this.config.port = parseInt(this.config.port, 10) || 80;
        // remove leading slash
        if (this.route[0] === '/') {
            this.route = this.route.substr(1);
        }
        this.adapter = adapter;
        this.config.cameras.forEach(cam => this.oneCamera(cam));
    }
    oneCamera(rule) {
        this.adapter.log.info(`Install extension on /${this.route}${rule.name}`);
        this.app.use(`/${this.route}${rule.name}`, (req, res) => {
            const parts = req.url.split('?');
            const query = {};
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
            this.adapter.log.debug(`Request "${rule.name}" with "${JSON.stringify(query)} on port ${this.config.port}...`);
            getUrl(rule.name, query, this.config.port)
                .then(file => {
                res.setHeader('Content-type', file.contentType);
                res.status(200).send(file.body || '');
            })
                .catch(error => {
                const text = error.response ? error.response.data || error : error;
                this.adapter.log.error(`Cannot request "${rule.name}" with "${JSON.stringify(query)} on port ${this.config.port}: ${text}`);
                res.status(500).send(typeof error !== 'string' ? JSON.stringify(error) : error);
            });
        });
    }
}
module.exports = ProxyCameras;
