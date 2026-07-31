import type { CameraConfigAny } from '../types';
import type GenericCamera from './GenericCamera';
import type GenericRtspCamera from './GenericRtspCamera';
import type Go2RtcServer from '../lib/Go2RtcServer';
import UrlCamera from './UrlCamera';
import HiKamCamera from './HiKamCamera';
import InstarCamera from './InstarCamera';
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
    go2rtc?: Go2RtcServer | null,
): Promise<GenericCamera> {
    let camera: GenericCamera | undefined;
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
        case 'instar':
            camera = new InstarCamera(adapter, config);
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

    if (camera.isRtsp && go2rtc) {
        (camera as GenericRtspCamera).setGo2Rtc(go2rtc);
    }

    return camera;
}
