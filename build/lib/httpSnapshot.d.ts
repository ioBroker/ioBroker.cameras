import type { ContentType } from '../types';
/** `boundary` of a `multipart/...` content type, unquoted. Empty if the camera announced none */
export declare function parseBoundary(contentType: string): string;
/**
 * Cut the first complete JPEG out of the data of a `multipart/x-mixed-replace` stream.
 * Returns null while the frame is not complete yet.
 *
 * The end marker is the last thing to go by, not the first: a JPEG carries a whole thumbnail inside
 * its EXIF segment, and that thumbnail has an `FFD9` of its own, so searching for one cuts the frame
 * short in the middle. In order of reliability the end of the part comes from
 *
 * 1. the `Content-Length` of the part, if the camera sends one,
 * 2. the next boundary - that is what delimits a part, and for a stream of frames the next one is
 *    only one frame time away,
 * 3. the end marker, for a camera that announces no boundary and does not open with one either.
 *
 * @param data everything read from the stream so far
 * @param boundary from the `Content-Type` header, used if the body does not open with its delimiter
 */
export declare function extractFirstJpeg(data: Buffer, boundary?: string): Buffer | null;
/**
 * Fetch one image from an HTTP camera.
 *
 * A snapshot URL answers with a single image. Many cameras offer an MJPEG stream instead, which
 * never ends - from that the first frame is taken. A video stream (ASF, MP4, ...) cannot be
 * decoded here and fails right away with a hint instead of running into the timeout.
 */
export declare function fetchSnapshot(url: string, options: {
    timeout?: number | string;
    headers?: Record<string, string>;
}): Promise<{
    body: Buffer;
    contentType: ContentType;
}>;
