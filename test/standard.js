const assert = require('node:assert');
const path = require('node:path');

// Like the integration tests this needs `npm run build-backend` first
const buildDir = path.join(__dirname, '../build');
const mainPath = require.resolve('../build/main');
const { findCamera, checkFileName } = require('../build/lib/standard');

const CAMERAS = [
    { name: 'cam1', type: 'url', desc: 'Front door' },
    { name: 'cam2', type: 'url', desc: 'Garden' },
    { name: 'garage', type: 'url' },
];

/** The adapter with a fake adapter core that records the answers of sendTo and the stored files */
function createAdapter(sent, files) {
    class FakeAdapter {
        constructor() {
            this.namespace = 'cameras.0';
            this.config = { cameras: JSON.parse(JSON.stringify(CAMERAS)) };
            this.log = { debug() {}, info() {}, warn() {}, error() {} };
        }
        sendTo(from, command, message) {
            sent.push({ command, message });
        }
        writeFileAsync(namespace, name, data) {
            files.push({ namespace, name, data });
            return Promise.resolve();
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

/** Send one message and return its answer */
async function ask(adapter, sent, command, message) {
    sent.length = 0;
    await adapter.onMessage({ command, message, from: 'system.adapter.assistant.0', callback: {} });
    assert.strictEqual(sent.length, 1, `one answer to ${command}`);
    return sent[0].message;
}

describe('commands of the shared catalog', () => {
    it('findCamera: id first, then the name without case, then a part of it', () => {
        const cams = [
            { id: 'cam1', name: 'Front door' },
            { id: 'cam2', name: 'Garden door' },
            { id: 'garage', name: 'garage' },
        ];
        assert.strictEqual(findCamera(cams, 'cam2').id, 'cam2');
        assert.strictEqual(findCamera(cams, 'FRONT DOOR').id, 'cam1');
        assert.strictEqual(findCamera(cams, 'garden').id, 'cam2');
        assert.deepStrictEqual(findCamera(cams, 'door'), {
            error: '"door" fits several cameras',
            reason: 'AMBIGUOUS',
            candidates: ['Front door', 'Garden door'],
        });
        assert.strictEqual(findCamera(cams, 'kitchen').reason, 'NOT_FOUND');
        assert.deepStrictEqual(findCamera(cams, 'kitchen').candidates, ['Front door', 'Garden door', 'garage']);
        assert.strictEqual(findCamera(cams, '').reason, 'BAD_REQUEST');
        assert.strictEqual(findCamera(cams, undefined).reason, 'BAD_REQUEST');
    });

    it('checkFileName: a path in the files of the adapter, never above them', () => {
        assert.strictEqual(checkFileName('/snapshots/door.jpg'), 'snapshots/door.jpg');
        assert.strictEqual(checkFileName('door.jpg'), 'door.jpg');
        assert.strictEqual(checkFileName('../admin/x.jpg').reason, 'BAD_REQUEST');
        assert.strictEqual(checkFileName('a/../../x.jpg').reason, 'BAD_REQUEST');
        assert.strictEqual(checkFileName('').reason, 'BAD_REQUEST');
        assert.strictEqual(checkFileName(5).reason, 'BAD_REQUEST');
    });

    it('getCameras lists id and name', async () => {
        const sent = [];
        const adapter = createAdapter(sent, []);
        assert.deepStrictEqual(await ask(adapter, sent, 'getCameras', {}), {
            cameras: [
                { id: 'cam1', name: 'Front door' },
                { id: 'cam2', name: 'Garden' },
                { id: 'garage', name: 'garage' },
            ],
        });
    });

    it('snapshot maps camera to the name of image and passes width and height', async () => {
        const sent = [];
        const files = [];
        const adapter = createAdapter(sent, files);
        const asked = [];
        adapter.getCameraImage = cam => {
            asked.push(cam);
            return Promise.resolve(Buffer.from('jpeg'));
        };
        const answer = await ask(adapter, sent, 'snapshot', { camera: 'front door', width: 640, height: 480 });
        assert.deepStrictEqual(answer, { data: Buffer.from('jpeg').toString('base64'), contentType: 'image/jpeg' });
        assert.strictEqual(asked[0].name, 'cam1');
        assert.strictEqual(asked[0].type, 'url');
        assert.strictEqual(asked[0].width, 640);
        assert.strictEqual(asked[0].height, 480);
        assert.strictEqual(files.length, 0);

        // the camera as a string, and the name of a camera without a description
        await ask(adapter, sent, 'snapshot', 'garage');
        assert.strictEqual(asked[1].name, 'garage');
    });

    it('snapshot stores the picture with fileName, also without a callback', async () => {
        const sent = [];
        const files = [];
        const adapter = createAdapter(sent, files);
        adapter.getCameraImage = () => Promise.resolve(Buffer.from('jpeg'));
        const answer = await ask(adapter, sent, 'snapshot', { camera: 'cam2', fileName: '/snapshots/garden.jpg' });
        assert.strictEqual(answer.file, 'cameras.0/snapshots/garden.jpg');
        assert.strictEqual(answer.data, Buffer.from('jpeg').toString('base64'));
        assert.deepStrictEqual(files[0], {
            namespace: 'cameras.0',
            name: 'snapshots/garden.jpg',
            data: Buffer.from('jpeg'),
        });

        sent.length = 0;
        await adapter.onMessage({ command: 'snapshot', message: { camera: 'cam2', fileName: 'b.jpg' }, from: 'x' });
        assert.strictEqual(sent.length, 0);
        assert.strictEqual(files[1].name, 'b.jpg');
    });

    it('snapshot answers the errors of the catalog', async () => {
        const sent = [];
        const adapter = createAdapter(sent, []);
        adapter.getCameraImage = () => Promise.reject(new Error('Timeout'));
        assert.deepStrictEqual(await ask(adapter, sent, 'snapshot', { camera: 'cam1' }), {
            error: 'Timeout',
            reason: 'NOT_CONNECTED',
        });
        const unknown = await ask(adapter, sent, 'snapshot', { camera: 'kitchen' });
        assert.strictEqual(unknown.reason, 'NOT_FOUND');
        assert.deepStrictEqual(unknown.candidates, ['Front door', 'Garden', 'garage']);
        assert.strictEqual((await ask(adapter, sent, 'snapshot', {})).reason, 'BAD_REQUEST');
        assert.strictEqual((await ask(adapter, sent, 'snapshot', undefined)).reason, 'BAD_REQUEST');
        assert.strictEqual(
            (await ask(adapter, sent, 'snapshot', { camera: 'cam1', fileName: '../x' })).reason,
            'BAD_REQUEST',
        );
    });
});
