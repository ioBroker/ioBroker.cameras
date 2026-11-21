"use strict";
/**
 * Helpers for the commands of the shared catalog of camera commands (family "camera", see HELP.md of
 * ioBroker.assistant): every camera adapter answers `getCameras` and `snapshot` the same way, so a client
 * (ioBroker.assistant, pi-agent, a script) can use any of them without knowing the adapter.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isStandardError = isStandardError;
exports.findCamera = findCamera;
exports.checkFileName = checkFileName;
/**
 * @param value an answer of the helpers below
 * @returns whether it is a failure
 */
function isStandardError(value) {
    return 'error' in value;
}
/**
 * Find the camera the caller means: by its id or its name, compared without case; an exact match wins over a
 * partial one, and several matches are refused instead of guessed.
 *
 * @param cameras the cameras of the instance
 * @param wanted the parameter `camera` of the message
 * @returns the camera, or the failure to answer
 */
function findCamera(cameras, wanted) {
    const text = typeof wanted === 'number' ? String(wanted) : typeof wanted === 'string' ? wanted.trim() : '';
    if (!text) {
        return { error: 'The parameter "camera" is missing', reason: 'BAD_REQUEST' };
    }
    const exactId = cameras.find(cam => cam.id === text);
    if (exactId) {
        return exactId;
    }
    const lower = text.toLowerCase();
    const exact = cameras.filter(cam => cam.id.toLowerCase() === lower || cam.name.toLowerCase() === lower);
    const fits = exact.length
        ? exact
        : cameras.filter(cam => cam.id.toLowerCase().includes(lower) || cam.name.toLowerCase().includes(lower));
    if (fits.length === 1) {
        return fits[0];
    }
    if (fits.length > 1) {
        return {
            error: `"${text}" fits several cameras`,
            reason: 'AMBIGUOUS',
            candidates: fits.map(cam => cam.name),
        };
    }
    return {
        error: `Camera "${text}" not found`,
        reason: 'NOT_FOUND',
        candidates: cameras.map(cam => cam.name),
    };
}
/**
 * Check the option `fileName` of `snapshot`: a path in the files of the adapter.
 *
 * @param fileName the option as the caller gave it
 * @returns the path without a leading slash, or the failure to answer
 */
function checkFileName(fileName) {
    const path = typeof fileName === 'string' ? fileName.trim().replace(/\\/g, '/').replace(/^\/+/, '') : '';
    if (!path || path.split('/').some(part => part === '..' || part === '.')) {
        return { error: `Invalid fileName: "${String(fileName)}"`, reason: 'BAD_REQUEST' };
    }
    return path;
}
//# sourceMappingURL=standard.js.map