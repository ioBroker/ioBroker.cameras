/**
 * Compares the two transports the web extension can use for a snapshot, end to end:
 *
 *   GET <web>/cameras.0/bench  ->  ioBroker.web  ->  cameras web extension  ->  transport  ->  cameras.0
 *
 * The only difference between the two runs is native.snapshotTransport ("message" vs "http").
 *
 * !! This drives a RUNNING ioBroker. It temporarily replaces the camera list of cameras.0 with a
 * !! single test camera, enables the instance and restarts the web instance three times. The original
 * !! instance object is written back in a finally block - but do not run it on a system you care
 * !! about while somebody is watching a camera.
 *
 * Prepare:
 *   node <controller>/iobroker.js object get system.adapter.cameras.0 > backup.json
 * Run:
 *   node benchmark/snapshot-transport.js <path-to-backup.json>
 *
 * Result on a jsonl database (median per request), see getTransport() in src/lib/web.ts:
 *   42 KB   http 2.7 ms   message 34.5 ms
 *   406 KB  http 4.6 ms   message 47.3 ms
 *   1.2 MB  http 9.5 ms   message 85.3 ms
 */
const http = require('node:http');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');

const IOB = process.env.IOB_CONTROLLER || '../node_modules/iobroker.js-controller/iobroker.js';
const BACKUP = process.argv[2];
const CAM_PORT = 8456;
const WEB = 'http://127.0.0.1:8082/cameras.0/bench';
const ITERATIONS = 40;
const WARMUP = 8;

if (!BACKUP) { console.error('Usage: node benchmark/snapshot-transport.js <backup.json>'); process.exit(1); }
const IOB_CWD = process.env.IOB_CWD || require('node:path').dirname(require('node:path').dirname(IOB));
const backup = JSON.parse(fs.readFileSync(BACKUP, 'utf8'));

function iob(...args) {
    return execFileSync('node', [IOB, ...args], { encoding: 'utf8', cwd: IOB_CWD, stdio: ['ignore', 'pipe', 'pipe'] });
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

function stats(samples) {
    const s = [...samples].sort((a, b) => a - b);
    const at = p => s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))];
    return { min: s[0], median: at(50), p95: at(95), mean: samples.reduce((a, b) => a + b, 0) / samples.length };
}
const fmt = n => `${n.toFixed(2).padStart(8)} ms`;

let payload = Buffer.alloc(0);
const camera = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'image/jpeg');
    res.end(payload);
});

function get(url) {
    return new Promise((resolve, reject) => {
        http.get(url, res => {
            const chunks = [];
            res.on('data', c => chunks.push(c));
            res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks) }));
        }).on('error', reject);
    });
}

async function makeJpeg(px, quality) {
    const sharp = require('sharp');
    const raw = Buffer.alloc(px * px * 3);
    for (let i = 0; i < raw.length; i++) {
        raw[i] = (i * 2654435761) % 256;
    }
    return sharp(raw, { raw: { width: px, height: px, channels: 3 } }).jpeg({ quality }).toBuffer();
}

async function measureTransport(transport, sizes) {
    console.log(`\n--- snapshotTransport = ${transport} ---`);
    const native = {
        ...backup.native,
        defaultCacheTimeout: 600000,
        snapshotTransport: transport,
        cameras: [{ name: 'bench', type: 'url', url: `http://127.0.0.1:${CAM_PORT}/b.jpg`, cacheTimeout: '' }],
    };
    iob('object', 'set', 'system.adapter.cameras.0', `native=${JSON.stringify(native)}`);
    iob('object', 'set', 'system.adapter.cameras.0', 'common.enabled=true');
    await sleep(2000);
    payload = await makeJpeg(sizes[0][1], sizes[0][2]);
    iob('restart', 'web.0');
    // web.0 has to come back up and load the extension
    for (let i = 0; i < 40; i++) {
        await sleep(1000);
        try {
            const r = await get(`${WEB}?noCache=true`);
            if (r.status === 200) {
                break;
            }
        } catch {
            /* not up yet */
        }
        if (i === 39) {
            throw new Error('web.0 did not serve the camera route');
        }
    }

    const rows = [];
    for (const [label, px, quality] of sizes) {
        payload = await makeJpeg(px, quality);
        const primed = await get(`${WEB}?noCache=true`);
        if (primed.status !== 200) {
            throw new Error(`prime failed with ${primed.status}: ${primed.body.toString().slice(0, 200)}`);
        }
        const deliveredKb = primed.body.length / 1024;

        for (let i = 0; i < WARMUP; i++) {
            await get(WEB);
        }
        const times = [];
        for (let i = 0; i < ITERATIONS; i++) {
            const t = process.hrtime.bigint();
            const r = await get(WEB);
            times.push(Number(process.hrtime.bigint() - t) / 1e6);
            if (r.status !== 200 || r.body.length !== primed.body.length) {
                throw new Error(`unexpected answer: ${r.status}, ${r.body.length} bytes`);
            }
        }
        rows.push({ label, kb: deliveredKb, ...stats(times) });
        console.log(`  ${label.padEnd(8)} ${deliveredKb.toFixed(0).padStart(4)} KB  median ${fmt(stats(times).median)}`);
    }
    return rows;
}

(async () => {
    const sizes = [
        ['klein', 300, 70],
        ['mittel', 900, 80],
        ['gross', 1600, 85],
    ];
    let message;
    let httpRows;
    try {
        await new Promise(r => camera.listen(CAM_PORT, '127.0.0.1', r));
        message = await measureTransport('message', sizes);
        httpRows = await measureTransport('http', sizes);
    } finally {
        console.log('\nStelle die ursprüngliche Konfiguration wieder her...');
        try {
            iob('object', 'set', 'system.adapter.cameras.0', `native=${JSON.stringify(backup.native)}`);
            iob('object', 'set', 'system.adapter.cameras.0', `common.enabled=${backup.common.enabled}`);
            if (!backup.common.enabled) {
                try {
                    iob('stop', 'cameras.0');
                } catch {
                    /* was not running */
                }
            }
            iob('restart', 'web.0');
            console.log('Wiederhergestellt.');
        } catch (e) {
            console.error('ACHTUNG - Wiederherstellung fehlgeschlagen:', e.message);
        }
        camera.close();
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log(`End-to-end über web.0, ${ITERATIONS} Messungen je Größe (Cache-Treffer im Adapter)`);
    console.log('='.repeat(80));
    console.log(`${'Bild'.padEnd(16)}${'Transport'.padEnd(11)}${'min'.padStart(10)}${'median'.padStart(11)}${'p95'.padStart(11)}${'mean'.padStart(11)}`);
    console.log('-'.repeat(80));
    for (let i = 0; i < message.length; i++) {
        const m = message[i];
        const h = httpRows[i];
        const label = `${m.label} ${m.kb.toFixed(0)}KB`;
        console.log(`${label.padEnd(16)}${'message'.padEnd(11)}${fmt(m.min)}${fmt(m.median)}${fmt(m.p95)}${fmt(m.mean)}`);
        console.log(`${''.padEnd(16)}${'http'.padEnd(11)}${fmt(h.min)}${fmt(h.median)}${fmt(h.p95)}${fmt(h.mean)}`);
        console.log(
            `${''.padEnd(16)}${'Differenz'.padEnd(11)}${fmt(m.median - h.median)} (median), Faktor ${(m.median / h.median).toFixed(2)}x`,
        );
        console.log('-'.repeat(80));
    }
})();
