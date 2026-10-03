"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBoundary = parseBoundary;
exports.extractFirstJpeg = extractFirstJpeg;
exports.fetchSnapshot = fetchSnapshot;
const axios_1 = __importDefault(require("axios"));
/** A camera never sends a frame this big - stop reading instead of filling the memory */
const MAX_IMAGE_SIZE = 20 * 1024 * 1024;
/** Used when the camera has no timeout: an MJPEG stream without a frame would never end */
const DEFAULT_TIMEOUT_MS = 10_000;
const SOI = Buffer.from([0xff, 0xd8]);
const EOI = Buffer.from([0xff, 0xd9]);
/** `boundary` of a `multipart/...` content type, unquoted. Empty if the camera announced none */
function parseBoundary(contentType) {
    const match = /;\s*boundary=(?:"([^"]*)"|([^;,\s]*))/i.exec(contentType);
    return (match?.[1] || match?.[2] || '').trim();
}
/**
 * The delimiter a multipart body really uses: its first line. Cameras do contradict their own
 * `Content-Type` header here, and what is on the wire is what the frame ends with.
 */
function readBoundaryOfBody(data) {
    // '--', the opening delimiter
    if (data[0] !== 0x2d || data[1] !== 0x2d) {
        return '';
    }
    const lineEnd = data.indexOf(0x0a);
    return lineEnd === -1 ? '' : data.subarray(2, lineEnd).toString('latin1').trim();
}
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
function extractFirstJpeg(data, boundary) {
    const start = data.indexOf(SOI);
    if (start === -1) {
        return null;
    }
    const partHeader = data.subarray(Math.max(0, start - 512), start).toString('latin1');
    const lengths = [...partHeader.matchAll(/content-length:\s*(\d+)/gi)];
    if (lengths.length) {
        const length = parseInt(lengths[lengths.length - 1][1], 10);
        return data.length >= start + length ? data.subarray(start, start + length) : null;
    }
    const delimiter = readBoundaryOfBody(data) || boundary;
    if (delimiter) {
        const end = data.indexOf(`--${delimiter}`, start, 'latin1');
        if (end === -1) {
            return null;
        }
        // The part body is followed by the line break that belongs to the delimiter, not to the image
        let stop = end;
        while (stop > start && (data[stop - 1] === 0x0a || data[stop - 1] === 0x0d)) {
            stop--;
        }
        return data.subarray(start, stop);
    }
    const end = data.indexOf(EOI, start + SOI.length);
    return end === -1 ? null : data.subarray(start, end + EOI.length);
}
/**
 * Fetch one image from an HTTP camera.
 *
 * A snapshot URL answers with a single image. Many cameras offer an MJPEG stream instead, which
 * never ends - from that the first frame is taken. A video stream (ASF, MP4, ...) cannot be
 * decoded here and fails right away with a hint instead of running into the timeout.
 */
async function fetchSnapshot(url, options) {
    const controller = new AbortController();
    const timeout = parseInt(options.timeout, 10) || DEFAULT_TIMEOUT_MS;
    let timedOut = false;
    const timer = setTimeout(() => {
        timedOut = true;
        controller.abort();
    }, timeout);
    try {
        const response = await axios_1.default.get(url, {
            responseType: 'stream',
            validateStatus: status => status < 400,
            headers: options.headers,
            signal: controller.signal,
        });
        const contentType = String(response.headers['content-type'] || '');
        const isMjpeg = contentType.toLowerCase().startsWith('multipart/x-mixed-replace');
        const boundary = isMjpeg ? parseBoundary(contentType) : '';
        if (/^(video|audio)\//i.test(contentType) || /ms-?asf|mpegurl/i.test(contentType)) {
            throw new Error(`The URL delivers a video stream (${contentType}), not an image. Use the snapshot or RTSP URL of the camera`);
        }
        return await new Promise((resolve, reject) => {
            const chunks = [];
            let size = 0;
            const stream = response.data;
            stream.on('data', (chunk) => {
                chunks.push(chunk);
                size += chunk.length;
                if (isMjpeg) {
                    const frame = extractFirstJpeg(Buffer.concat(chunks), boundary);
                    if (frame) {
                        // One frame is all that is needed - the camera would go on sending forever.
                        // Settle first: aborting emits an error on the stream right away
                        resolve({ body: Buffer.from(frame), contentType: 'image/jpeg' });
                        controller.abort();
                        return;
                    }
                }
                if (size > MAX_IMAGE_SIZE) {
                    reject(new Error(`No image within the first ${MAX_IMAGE_SIZE} bytes`));
                    controller.abort();
                }
            });
            stream.on('end', () => resolve({ body: Buffer.concat(chunks), contentType }));
            stream.on('error', (error) => reject(error));
        });
    }
    catch (error) {
        if (timedOut) {
            throw new Error(`Timeout after ${timeout} ms`);
        }
        const e = error;
        if (e.response?.status) {
            throw new Error(`HTTP ${e.response.status}`);
        }
        throw new Error(e.code || e.message || String(error));
    }
    finally {
        clearTimeout(timer);
    }
}
//# sourceMappingURL=httpSnapshot.js.map