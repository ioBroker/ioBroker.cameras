import type { CameraConfigAny } from '../types';
import type GenericCamera from './GenericCamera';
export default function createCamera(adapter: ioBroker.Adapter, config: CameraConfigAny, ffmpegPath: string, streamSubscribes?: {
    camera: string;
    clientId: string;
}[]): Promise<GenericCamera>;
