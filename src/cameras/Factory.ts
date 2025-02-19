import type { CameraConfigAny } from '../types';
import type GenericCamera from './GenericCamera';
import UrlCamera from './UrlCamera';
import HiKamCamera from './HiKamCamera';
import UrlBasicAuthCamera from './UrlBasicAuthCamera';
import RtspCamera from './RtspCamera';
import ReolinkE1Camera from './ReolinkE1Camera';
import EufyCamera from './EufyCamera';
import UniversalCamera from './UniversalCamera';

export default async function createCamera(
    adapter: ioBroker.Adapter,
    config: CameraConfigAny,
    ffmpegPath: string,
    streamSubscribes?: { camera: string; clientId: string }[],
): Promise<GenericCamera> {
    let camera: GenericCamera;
    switch (config.type) {
        case 'url':
            camera = new UrlCamera(adapter, config);
            break;
        case 'urlBasicAuth':
            camera = new UrlBasicAuthCamera(adapter, config);
            break;
        case 'hikam':
            camera = new HiKamCamera(adapter, config, ffmpegPath);
            break;
        case 'rtsp':
            camera = new RtspCamera(adapter, config, ffmpegPath);
            break;
        case 'reolinkE1':
            camera = new ReolinkE1Camera(adapter, config, ffmpegPath);
            break;
        case 'eufy':
            camera = new EufyCamera(adapter, config, ffmpegPath);
            break;
        case 'universal':
            camera = new UniversalCamera(adapter, config, ffmpegPath);
            break;
    }
    if (!camera) {
        throw new Error(`Unknown camera type: ${config.type}`);
    }

    await camera.init();

    if (camera.isRtsp && streamSubscribes) {
        camera.registerRtspStreams(streamSubscribes);
    }

    return camera;
}
