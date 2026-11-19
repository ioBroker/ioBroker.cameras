const assert = require('node:assert');
const path = require('node:path');

// Like the integration tests this needs `npm run build-backend` first
const buildDir = path.join(__dirname, '../build');
const mainPath = require.resolve('../build/main');

/** The adapter with a fake adapter core that records the answers of sendTo */
function createAdapter(sent) {
    class FakeAdapter {
        constructor() {
            this.config = { cameras: [{ name: 'cam1', type: 'url' }] };
            this.log = { debug() {}, info() {}, warn() {}, error() {} };
        }
        sendTo(from, command, message) {
            sent.push({ command, message });
        }
    }
    const corePath = require.resolve('@iobroker/adapter-core', { paths: [buildDir] });
    const original = require.cache[corePath];
    require.cache[corePath] = { id: corePath, filename: corePath, loaded: true, exports: { Adapter: FakeAdapter } };
    delete require.cache[mainPath];
    try {
        return require(mainPath)();
    } finally {
        delete require.cache[mainPath];
        if (original) {
            require.cache[corePath] = original;
        } else {
            delete require.cache[corePath];
        }
    }
}

describe('image', () => {
    it('answers the text of an error, not the Error object', async () => {
        const sent = [];
        const adapter = createAdapter(sent);
        adapter.getCameraImage = () => Promise.reject(new Error('Timeout'));
        await adapter.onMessage({
            command: 'image',
            from: 'system.adapter.javascript.0',
            callback: {},
            message: { name: 'cam1' },
        });
        assert.deepStrictEqual(sent, [{ command: 'image', message: { error: 'Timeout' } }]);
        // as it arrives over sendTo
        assert.deepStrictEqual(JSON.parse(JSON.stringify(sent[0].message)), { error: 'Timeout' });
    });

    it('keeps a text as it is', async () => {
        const sent = [];
        const adapter = createAdapter(sent);
        adapter.getCameraImage = () => Promise.reject('No answer');
        await adapter.onMessage({
            command: 'image',
            from: 'system.adapter.javascript.0',
            callback: {},
            message: { name: 'cam1' },
        });
        assert.deepStrictEqual(sent, [{ command: 'image', message: { error: 'No answer' } }]);
    });
});
