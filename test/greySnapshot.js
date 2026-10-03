const assert = require('node:assert');
const sharp = require('sharp');
// Like the integration tests this needs `npm run build-backend` first
const rtspCommon = require('../build/cameras/rtspCommon');
const RtspCamera = require('../build/cameras/RtspCamera').default;

/** A flat image like the one ffmpeg decodes from an H.265 frame without its reference picture */
const grey = () =>
    sharp({ create: { width: 64, height: 48, channels: 3, background: { r: 128, g: 128, b: 128 } } })
        .jpeg()
        .toBuffer();

/** A dark image with sensor noise, like a camera at night */
async function noisy() {
    const pixels = Buffer.alloc(64 * 48 * 3);
    for (let i = 0; i < pixels.length; i++) {
        pixels[i] = 10 + Math.floor(Math.random() * 20);
    }
    return sharp(pixels, { raw: { width: 64, height: 48, channels: 3 } })
        .jpeg()
        .toBuffer();
}

describe('Grey H.265 snapshots', () => {
    const originalSnapshot = rtspCommon.getRtspSnapshot;
    let answers;
    let calls;

    before(() => {
        // Instead of ffmpeg: hand out the prepared images and record the settings of each call
        rtspCommon.getRtspSnapshot = async settings => {
            calls.push({ keyFramesOnly: !!settings.keyFramesOnly });
            return answers.shift();
        };
    });

    after(() => {
        rtspCommon.getRtspSnapshot = originalSnapshot;
    });

    async function createCamera(config = {}) {
        const noop = () => {};
        const adapter = {
            log: { debug: noop, info: noop, warn: noop, error: noop },
            config: { tempPath: '' },
            decrypt: value => value,
        };
        const camera = new RtspCamera(
            adapter,
            { name: 'cam', type: 'rtsp', ip: '192.168.1.10', port: 554, urlPath: '/live', ...config },
            'ffmpeg',
        );
        await camera.init();
        return camera;
    }

    beforeEach(() => {
        calls = [];
    });

    it('tells a flat image from a dark one with noise', async () => {
        assert.strictEqual(await rtspCommon.isFlatImage(await grey()), true);
        assert.strictEqual(await rtspCommon.isFlatImage(await noisy()), false);
        assert.strictEqual(await rtspCommon.isFlatImage(Buffer.from('no image')), false);
    });

    it('takes a normal image once', async () => {
        const image = await noisy();
        answers = [image];
        const camera = await createCamera();
        const result = await camera.process();
        assert.ok(result.body.equals(image));
        assert.deepStrictEqual(calls, [{ keyFramesOnly: false }]);
    });

    it('takes a grey image again from a key frame and keeps that', async () => {
        const image = await noisy();
        answers = [await grey(), image, await noisy()];
        const camera = await createCamera();
        const result = await camera.process();
        assert.ok(result.body.equals(image));
        assert.deepStrictEqual(calls, [{ keyFramesOnly: false }, { keyFramesOnly: true }]);

        // The next snapshot comes from a key frame right away
        await camera.process();
        assert.deepStrictEqual(calls[2], { keyFramesOnly: true });
    });

    it('does not keep key frames if the image stays flat', async () => {
        const first = await grey();
        answers = [first, await grey(), await noisy()];
        const camera = await createCamera();
        const result = await camera.process();
        assert.ok(result.body.equals(first));

        // A covered lens: waiting for key frames would only slow every snapshot down
        await camera.process();
        assert.deepStrictEqual(calls[2], { keyFramesOnly: false });
    });

    it('does not check a flat image again on every snapshot', async () => {
        answers = [await grey(), await grey(), await grey(), await grey()];
        const camera = await createCamera();
        await camera.process();
        assert.deepStrictEqual(calls, [{ keyFramesOnly: false }, { keyFramesOnly: true }]);

        // A camera really showing one colour would otherwise pay for the second ffmpeg run on
        // every request for the rest of the runtime
        await camera.process();
        assert.deepStrictEqual(calls, [
            { keyFramesOnly: false },
            { keyFramesOnly: true },
            { keyFramesOnly: false },
        ]);
    });

    it('checks a flat image again once the pause is over', async () => {
        const good = await noisy();
        answers = [await grey(), await grey(), await grey(), good];
        const camera = await createCamera();
        await camera.process();
        assert.strictEqual(calls.length, 2);

        // The check is on hold, not given up: a lens does not stay covered forever, and the H.265
        // problem would never be found after that. Here the pause is skipped instead of waited out
        camera.greyCheckAgainAt = 0;
        const result = await camera.process();
        assert.strictEqual(calls.length, 4);
        assert.ok(result.body.equals(good));
    });

    it('uses key frames right away when configured', async () => {
        answers = [await grey()];
        const camera = await createCamera({ keyFramesOnly: true });
        await camera.process();
        assert.deepStrictEqual(calls, [{ keyFramesOnly: true }]);
    });
});
