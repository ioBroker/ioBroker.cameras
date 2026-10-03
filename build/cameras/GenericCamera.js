"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GenericCamera {
    adapter;
    initialized = false;
    config;
    path;
    isRtsp = false;
    /**
     * A snapshot of this camera has a price beyond the request: a Eufy camera without RTSP of its
     * own is woken up through its station for it. Such a camera is left out of the initial
     * `fillFiles()` in main.ts - filling the cache is not worth a battery at every adapter start.
     */
    wakesUpForSnapshot = false;
    streamSubscribes;
    constructor(adapter, config) {
        this.adapter = adapter;
        this.config = config;
        this.path = `/${config.name}`;
    }
    getName() {
        return this.config.name;
    }
    registerRtspStreams(streamSubscribes) {
        this.streamSubscribes = streamSubscribes;
    }
    init() {
        this.initialized = true;
        this.config.timeout =
            parseInt(this.config.timeout ||
                this.adapter.config.defaultTimeout, 10) || 2000;
        return Promise.resolve();
    }
    destroy() {
        this.initialized = false;
        // do nothing
        return Promise.resolve();
    }
    startWebStream(_options) {
        throw new Error('Not implemented');
    }
    stopWebStream(_restart) {
        throw new Error('Not implemented');
    }
}
exports.default = GenericCamera;
//# sourceMappingURL=GenericCamera.js.map