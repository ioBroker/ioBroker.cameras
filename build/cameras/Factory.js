"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createCamera;
const UrlCamera_1 = __importDefault(require("./UrlCamera"));
const HiKamCamera_1 = __importDefault(require("./HiKamCamera"));
const UrlBasicAuthCamera_1 = __importDefault(require("./UrlBasicAuthCamera"));
const RtspCamera_1 = __importDefault(require("./RtspCamera"));
const ReolinkE1Camera_1 = __importDefault(require("./ReolinkE1Camera"));
const EufyCamera_1 = __importDefault(require("./EufyCamera"));
async function createCamera(adapter, config, streamSubscribes) {
    let camera;
    switch (config.type) {
        case 'url':
            camera = new UrlCamera_1.default(adapter, config);
            break;
        case 'urlBasicAuth':
            camera = new UrlBasicAuthCamera_1.default(adapter, config);
            break;
        case 'hikam':
            camera = new HiKamCamera_1.default(adapter, config);
            break;
        case 'rtsp':
            camera = new RtspCamera_1.default(adapter, config);
            break;
        case 'reolinkE1':
            camera = new ReolinkE1Camera_1.default(adapter, config);
            break;
        case 'eufy':
            camera = new EufyCamera_1.default(adapter, config);
            break;
    }
    if (!camera) {
        throw new Error(`Unknown camera type: ${config.type}`);
    }
    await camera.init();
    if (camera.isRtsp) {
        camera.registerRtspStreams(streamSubscribes);
    }
    return camera;
}
//# sourceMappingURL=Factory.js.map