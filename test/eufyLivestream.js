const assert = require('node:assert');
// Like the integration tests this needs `npm run build-backend` first
const GenericRtspCamera = require('../build/cameras/GenericRtspCamera').default;
const EufyCamera = require('../build/cameras/EufyCamera').default;

const DEVICE = 'eusec.0.T8010.cameras.T8113ABC';
const LINK = 'rtsp://iobhost:8554/T8113ABC';

/** Just enough of an adapter, with eusec writing the link a moment after `start_stream` */
function createAdapter({ running = null, sameHost = true } = {}) {
    const objects = {
        [`${DEVICE}.start_stream`]: { type: 'state' },
        'system.adapter.eusec.0': {
            common: { host: sameHost ? 'iob' : 'other' },
            native: { hostname: '', go2rtc_rtsp_port: 8554 },
        },
        'system.host.other': { common: { hostname: 'otherhost' } },
    };
    const states = { [`${DEVICE}.livestream_rtsp`]: running ? { val: running } : null };
    const noop = () => {};
    return {
        host: 'iob',
        presses: 0,
        log: { debug: noop, info: noop, warn: noop, error: noop },
        config: { tempPath: '' },
        decrypt: value => value,
        getForeignObjectAsync: async id => objects[id] || null,
        getForeignStateAsync: async id => states[id] || null,
        async setForeignStateAsync(id, val) {
            if (id === `${DEVICE}.start_stream` && val === true) {
                this.presses++;
                setTimeout(() => (states[`${DEVICE}.livestream_rtsp`] = { val: LINK }), 200);
            }
        },
    };
}

const config = { name: 'eufy1', type: 'eufy', useOid: true, oid: `${DEVICE}.rtsp_stream_url`, timeout: 5000 };

describe('Eufy camera without RTSP (live stream of eusec)', function () {
    this.timeout(10000);
    let originalProcess;
    /** Snapshots that fail before one succeeds, like ffmpeg while the first frames are missing */
    let failures = 0;

    before(() => {
        // Instead of running ffmpeg, answer with the URL the snapshot would be taken from
        originalProcess = GenericRtspCamera.prototype.process;
        GenericRtspCamera.prototype.process = async function () {
            if (failures > 0) {
                failures--;
                throw new Error('timeout');
            }
            return { body: Buffer.from(this.getRtspURL()), contentType: 'image/jpeg' };
        };
    });

    beforeEach(() => {
        failures = 0;
    });

    after(() => {
        GenericRtspCamera.prototype.process = originalProcess;
    });

    it('does not wake the camera at start', async () => {
        const adapter = createAdapter();
        const camera = new EufyCamera(adapter, { ...config }, 'ffmpeg');
        await camera.init();
        assert.strictEqual(adapter.presses, 0);
        assert.strictEqual(camera.getRtspURL(), 'rtsp://127.0.0.1:8554/T8113ABC');
    });

    it('starts the stream for a snapshot and uses the link of eusec', async () => {
        const adapter = createAdapter();
        const camera = new EufyCamera(adapter, { ...config }, 'ffmpeg');
        await camera.init();
        const result = await camera.process();
        assert.strictEqual(adapter.presses, 1);
        assert.strictEqual(result.body.toString(), LINK);

        // The stream runs now - the next snapshot must not press again
        await camera.process();
        assert.strictEqual(adapter.presses, 1);
    });

    it('waits for the first frames of a stream it has just started', async () => {
        const adapter = createAdapter();
        const camera = new EufyCamera(adapter, { ...config }, 'ffmpeg');
        await camera.init();
        // The camera was just woken up: the first two snapshots run into the ffmpeg timeout
        failures = 2;
        const result = await camera.process();
        assert.strictEqual(result.body.toString(), LINK);
        assert.strictEqual(adapter.presses, 1);
    });

    it('starts the stream again if eusec left a stale link behind', async () => {
        // eusec deletes the link only on a regular stop - after its restart the old one stays
        const adapter = createAdapter({ running: LINK });
        const camera = new EufyCamera(adapter, { ...config }, 'ffmpeg');
        await camera.init();
        failures = 2;
        const result = await camera.process();
        assert.strictEqual(result.body.toString(), LINK);
        assert.strictEqual(adapter.presses, 1);
    });

    it('uses a stream that already runs', async () => {
        const adapter = createAdapter({ running: LINK });
        const camera = new EufyCamera(adapter, { ...config }, 'ffmpeg');
        await camera.init();
        const result = await camera.process();
        assert.strictEqual(adapter.presses, 0);
        assert.strictEqual(result.body.toString(), LINK);
    });

    it('takes the host of eusec in a multi-host setup', async () => {
        const camera = new EufyCamera(createAdapter({ sameHost: false }), { ...config }, 'ffmpeg');
        await camera.init();
        assert.strictEqual(camera.getRtspURL(), 'rtsp://otherhost:8554/T8113ABC');
    });
});
