import { type ChildProcessWithoutNullStreams } from 'node:child_process';
export interface RtspOptions {
    ip: string;
    port: number | string;
    urlPath?: string;
    prefix?: string;
    suffix?: string;
    protocol?: 'udp' | 'tcp';
    username?: string;
    originalHeight?: number | string;
    originalWidth?: number | string;
}
export declare function findFFmpegPath(pathToExecutable?: string, log?: ioBroker.Log): string;
export declare function getFFmpegVersion(ffmpegPath: string, log?: ioBroker.Log): string;
export declare function executeFFmpeg(params: string[], ffmpegPath: string, decodedPassword?: string, timeoutMs?: number, log?: ioBroker.Log): Promise<string>;
export declare function startFFmpeg(params: string[], ffmpegPath: string, decodedPassword?: string, log?: ioBroker.Log): ChildProcessWithoutNullStreams;
export declare function getRtspSnapshot(config: RtspOptions, outputFileName: string, ffmpegPath: string, decodedPassword: string, timeout: number, log: ioBroker.Log): Promise<Buffer>;
