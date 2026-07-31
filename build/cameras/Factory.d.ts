import type { CameraConfigAny } from '../types';
import type GenericCamera from './GenericCamera';
import type Go2RtcServer from '../lib/Go2RtcServer';
export default function createCamera(adapter: ioBroker.Adapter, config: CameraConfigAny, ffmpegPath: string, streamSubscribes?: {
    camera: string;
    clientId: string;
}[], go2rtc?: Go2RtcServer | null): Promise<GenericCamera>;
