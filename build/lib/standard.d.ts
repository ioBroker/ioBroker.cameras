/**
 * Helpers for the commands of the shared catalog of camera commands (family "camera", see HELP.md of
 * ioBroker.assistant): every camera adapter answers `getCameras` and `snapshot` the same way, so a client
 * (ioBroker.assistant, pi-agent, a script) can use any of them without knowing the adapter.
 */
/** A camera as `getCameras` lists it */
export interface StandardCamera {
    /** What the adapter uses for the camera: its name in the settings */
    id: string;
    /** What the user calls it: the description, else the name */
    name: string;
}
/** A failure in the form of the catalog */
export interface StandardError {
    error: string;
    reason?: 'BAD_REQUEST' | 'NOT_FOUND' | 'AMBIGUOUS' | 'NOT_CONNECTED';
    candidates?: string[];
}
/**
 * @param value an answer of the helpers below
 * @returns whether it is a failure
 */
export declare function isStandardError(value: object): value is StandardError;
/**
 * Find the camera the caller means: by its id or its name, compared without case; an exact match wins over a
 * partial one, and several matches are refused instead of guessed.
 *
 * @param cameras the cameras of the instance
 * @param wanted the parameter `camera` of the message
 * @returns the camera, or the failure to answer
 */
export declare function findCamera<T extends StandardCamera>(cameras: T[], wanted: unknown): T | StandardError;
/**
 * Check the option `fileName` of `snapshot`: a path in the files of the adapter.
 *
 * @param fileName the option as the caller gave it
 * @returns the path without a leading slash, or the failure to answer
 */
export declare function checkFileName(fileName: unknown): string | StandardError;
