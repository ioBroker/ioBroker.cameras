const http = require('node:http');
const assert = require('node:assert');
// Like the integration tests this needs `npm run build-backend` first
const { fetchSnapshot, extractFirstJpeg } = require('../build/lib/httpSnapshot');

// A JPEG with an end marker inside, like one with an embedded EXIF thumbnail
const jpeg = Buffer.concat([
    Buffer.from([0xff, 0xd8]),
    Buffer.from('header'),
    Buffer.from([0xff, 0xd9]),
    Buffer.from('more-image-data'),
    Buffer.from([0xff, 0xd9]),
]);

describe('httpSnapshot', () => {
    let server;
    let base;

    before(done => {
        server = http.createServer((req, res) => {
            if (req.url === '/snap.jpg') {
                res.writeHead(200, { 'Content-Type': 'image/jpeg' });
                res.end(jpeg);
            } else if (req.url === '/mjpeg-len' || req.url === '/mjpeg-nolen') {
                res.writeHead(200, { 'Content-Type': 'multipart/x-mixed-replace; boundary=frame' });
                const send = () => {
                    const length = req.url === '/mjpeg-len' ? `Content-Length: ${jpeg.length}\r\n` : '';
                    res.write(`--frame\r\nContent-Type: image/jpeg\r\n${length}\r\n`);
                    // In two pieces, as the network delivers it
                    res.write(jpeg.subarray(0, 5));
                    setTimeout(() => res.write(Buffer.concat([jpeg.subarray(5), Buffer.from('\r\n')])), 20);
                };
                send();
                const timer = setInterval(send, 100);
                req.on('close', () => clearInterval(timer));
            } else if (req.url === '/video.asf') {
                res.writeHead(200, { 'Content-Type': 'video/x-ms-asf' });
                res.write('asf');
            } else if (req.url === '/silent') {
                res.writeHead(200, { 'Content-Type': 'multipart/x-mixed-replace; boundary=frame' });
            } else {
                res.writeHead(401);
                res.end();
            }
        });
        server.listen(0, '127.0.0.1', () => {
            base = `http://127.0.0.1:${server.address().port}`;
            done();
        });
    });

    after(() => {
        server.closeAllConnections();
        server.close();
    });

    it('returns a single image unchanged', async () => {
        const result = await fetchSnapshot(`${base}/snap.jpg`, { timeout: 1000 });
        assert.ok(result.body.equals(jpeg));
        assert.strictEqual(result.contentType, 'image/jpeg');
    });

    it('takes the first frame of an MJPEG stream by its Content-Length', async () => {
        const result = await fetchSnapshot(`${base}/mjpeg-len`, { timeout: 1000 });
        assert.ok(result.body.equals(jpeg));
        assert.strictEqual(result.contentType, 'image/jpeg');
    });

    it('takes the first frame of an MJPEG stream without Content-Length', async () => {
        const result = await fetchSnapshot(`${base}/mjpeg-nolen`, { timeout: 1000 });
        assert.deepStrictEqual([...result.body.subarray(0, 2)], [0xff, 0xd8]);
        assert.deepStrictEqual([...result.body.subarray(-2)], [0xff, 0xd9]);
    });

    it('rejects a video stream at once', async () => {
        await assert.rejects(fetchSnapshot(`${base}/video.asf`, { timeout: 1000 }), /video stream/);
    });

    it('gives up after the timeout if no frame comes', async () => {
        await assert.rejects(fetchSnapshot(`${base}/silent`, { timeout: 300 }), /Timeout after 300 ms/);
    });

    it('reports the HTTP status of an error', async () => {
        await assert.rejects(fetchSnapshot(`${base}/forbidden`, { timeout: 1000 }), /HTTP 401/);
    });

    it('waits for a frame that is not complete yet', () => {
        const header = Buffer.from(`--frame\r\nContent-Length: ${jpeg.length}\r\n\r\n`);
        assert.strictEqual(extractFirstJpeg(Buffer.concat([header, jpeg.subarray(0, 10)])), null);
        assert.ok(extractFirstJpeg(Buffer.concat([header, jpeg]))?.equals(jpeg));
    });
});
