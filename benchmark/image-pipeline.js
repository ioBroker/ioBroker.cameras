/**
 * What the image pipeline costs when nothing was asked for.
 *
 * getCameraImage() always runs resizeImage() -> rotateImage() -> addTextToImage(). The first two
 * re-encode the picture through sharp even when no size and no angle were requested:
 *
 *     if (!width && !height) { const body = await sharp(data.body).jpeg().toBuffer(); ... }
 *     if (!angle)            { const body = await sharp(data.body).jpeg().toBuffer(); ... }
 *
 * So a plain snapshot is decoded and re-encoded twice for nothing. This measures the time and the
 * quality that costs.
 *
 * Run with: node benchmark/image-pipeline.js
 */
const sharp = require('sharp');

const ITERATIONS = 20;
const WARMUP = 3;

/** Build a picture with structure, so JPEG has something real to work on */
async function makeSource(px, quality) {
    const raw = Buffer.alloc(px * px * 3);
    for (let y = 0; y < px; y++) {
        for (let x = 0; x < px; x++) {
            const i = (y * px + x) * 3;
            raw[i] = (x * 255) / px;
            raw[i + 1] = (y * 255) / px;
            raw[i + 2] = ((x ^ y) % 256) * 0.8 + 40 * Math.sin(x / 7);
        }
    }
    return sharp(raw, { raw: { width: px, height: px, channels: 3 } }).jpeg({ quality }).toBuffer();
}

// --- the two variants, copied from src/main.ts -------------------------------------------------
const resizeAsIs = body => sharp(body).jpeg().toBuffer();
const rotateAsIs = body => sharp(body).jpeg().toBuffer();

async function currentPipeline(body) {
    return rotateAsIs(await resizeAsIs(body));
}

/** One pass - the minimum if you insist on normalising everything to JPEG */
async function singlePass(body) {
    return sharp(body).jpeg().toBuffer();
}

/** What src/main.ts does now: convert only what is not JPEG yet, and never rotate by 0 */
const isJpeg = b => Buffer.isBuffer(b) && b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;

async function fixedPipeline(body) {
    const resized = isJpeg(body) ? body : await sharp(body).jpeg().toBuffer();
    return resized; // rotateImage(0) now returns the data unchanged
}

/** A request that really asks for something, for comparison */
async function realResize(body) {
    return sharp(body).resize(640, null).jpeg().toBuffer();
}

async function time(fn, body) {
    for (let i = 0; i < WARMUP; i++) {
        await fn(body);
    }
    const samples = [];
    for (let i = 0; i < ITERATIONS; i++) {
        const t = process.hrtime.bigint();
        await fn(body);
        samples.push(Number(process.hrtime.bigint() - t) / 1e6);
    }
    samples.sort((a, b) => a - b);
    return { median: samples[Math.floor(samples.length / 2)], min: samples[0] };
}

/** Mean absolute difference per colour channel value, 0..255 */
async function meanAbsDiff(a, b) {
    const [ra, rb] = await Promise.all([
        sharp(a).raw().toBuffer({ resolveWithObject: true }),
        sharp(b).raw().toBuffer({ resolveWithObject: true }),
    ]);
    if (ra.data.length !== rb.data.length) {
        return NaN;
    }
    let sum = 0;
    for (let i = 0; i < ra.data.length; i++) {
        sum += Math.abs(ra.data[i] - rb.data[i]);
    }
    return sum / ra.data.length;
}

const ms = n => `${n.toFixed(1).padStart(7)} ms`;
const kb = n => `${(n / 1024).toFixed(0).padStart(5)} KB`;

(async () => {
    const cases = [
        ['640x640  q85', 640, 85],
        ['1280x1280 q85', 1280, 85],
        ['1920x1920 q90', 1920, 90],
    ];

    console.log(`\n${'='.repeat(84)}`);
    console.log(`Bildpipeline ohne angeforderte Änderung, ${ITERATIONS} Messungen je Fall`);
    console.log('='.repeat(84));

    for (const [label, px, quality] of cases) {
        const source = await makeSource(px, quality);

        // Sequentially on purpose: run in parallel they compete for the sharp thread pool and the
        // numbers stop meaning anything
        const cur = await time(currentPipeline, source);
        const one = await time(singlePass, source);
        const fixed = await time(fixedPipeline, source);
        const real = await time(realResize, source);

        const afterOne = await singlePass(source);
        const afterTwo = await currentPipeline(source);
        const afterFixed = await fixedPipeline(source);
        const diffOne = await meanAbsDiff(source, afterOne);
        const diffTwo = await meanAbsDiff(source, afterTwo);
        const diffFixed = await meanAbsDiff(source, afterFixed);

        console.log(`\n${label}   Quelle ${kb(source.length)}`);
        console.log('-'.repeat(84));
        console.log(`  ${'vorher (2x sharp)'.padEnd(34)}${ms(cur.median)}   Ergebnis ${kb(afterTwo.length)}`);
        console.log(`  ${'1x sharp'.padEnd(34)}${ms(one.median)}   Ergebnis ${kb(afterOne.length)}`);
        console.log(`  ${'JETZT (JPEG wird durchgereicht)'.padEnd(34)}${ms(fixed.median)}   Ergebnis ${kb(afterFixed.length)}`);
        console.log(`  ${'zum Vergleich: echtes resize(640)'.padEnd(34)}${ms(real.median)}`);
        console.log(`  -> eingespart pro Snapshot: ${(cur.median - fixed.median).toFixed(1)} ms`);
        console.log(
            `  -> Qualität: Abweichung vom Original ${diffTwo.toFixed(2)} (vorher) -> ${diffFixed.toFixed(2)} (jetzt) von 255`,
        );
        console.log(
            `  -> Größe: ${kb(afterTwo.length)} (vorher, ${((1 - afterTwo.length / source.length) * 100).toFixed(0)} % verloren) -> ${kb(afterFixed.length)} (jetzt, unverändert)`,
        );
    }

    // The pipeline promises "the result is always jpg" - passing through must not break that
    console.log(`\n${'='.repeat(84)}`);
    console.log('Zusicherung "Ergebnis ist immer JPEG"');
    console.log('-'.repeat(84));
    const png = await sharp(await makeSource(320, 90))
        .png()
        .toBuffer();
    const jpg = await makeSource(320, 90);
    const fromPng = await fixedPipeline(png);
    const fromJpg = await fixedPipeline(jpg);
    console.log(`  PNG-Quelle  -> Ergebnis ist JPEG: ${isJpeg(fromPng)} (${kb(png.length)} -> ${kb(fromPng.length)})`);
    console.log(
        `  JPEG-Quelle -> Ergebnis ist JPEG: ${isJpeg(fromJpg)}, Bytes unverändert: ${fromJpg.equals(jpg)}`,
    );

    console.log(`\n${'='.repeat(84)}`);
    console.log('addTextToImage() gibt das Bild unverändert zurück, wenn weder Zeit noch Titel gesetzt sind -');
    console.log('die beiden sharp-Durchgänge stammten allein aus resizeImage() und rotateImage().');
    console.log(`${'='.repeat(84)}\n`);
})();
