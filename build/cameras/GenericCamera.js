"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GenericCamera {
    adapter;
    initialized = false;
    config;
    path;
    isRtsp = false;
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