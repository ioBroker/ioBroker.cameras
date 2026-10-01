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
    /** `rtsps://` instead of `rtsp://`, e.g. UniFi Protect on port 7441. RTSPS always runs over TCP */
    secure?: boolean;
    /**
     * Decode key frames only. An H.265 stream joined in the middle of a GOP otherwise gives ffmpeg a
     * frame without its reference picture, and the snapshot comes out as a flat grey image.
     */
    keyFramesOnly?: boolean;
}
export declare function findFFmpegPath(pathToExecutable?: string, log?: ioBroker.Log): string;
export declare function getFFmpegVersion(ffmpegPath: string, log?: ioBroker.Log): string;
/**
 * Replace every occurrence of a secret in a string that is about to be logged.
 *
 * Both forms have to go: a command line carries the encoded password, while a log line that
 * prints the URL of a camera without a user name carries the secret verbatim - UniFi Protect,
 * where the stream token sits in the path and is the whole credential.
 */
export declare function maskPassword(str: string, password: string): string;
export declare function executeFFmpeg(params: string[], ffmpegPath: string, decodedPassword?: string, timeoutMs?: number, log?: ioBroker.Log): Promise<string>;
export declare function startFFmpeg(params: string[], ffmpegPath: string, decodedPassword?: string, log?: ioBroker.Log): ChildProcessWithoutNullStreams;
export declare function getRtspSnapshot(config: RtspOptions, outputFileName: string, ffmpegPath: string, decodedPassword: string, timeout: number, log: ioBroker.Log): Promise<Buffer>;
