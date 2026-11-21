const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
// Like the integration tests this needs `npm run build-backend` first
const { COMMANDS, HELP } = require('../build/lib/help');

/** The commands of the switch in `onMessage` of src/main.ts */
function commandsOfMain() {
    const source = fs.readFileSync(path.join(__dirname, '../src/main.ts'), 'utf8');
    const start = source.indexOf('async onMessage(');
    const end = source.indexOf('unloadCameras(', start);
    assert.ok(start > 0 && end > start, 'onMessage found');
    return [...source.slice(start, end).matchAll(/case '([^']+)':/g)].map(m => m[1]);
}

describe('help', () => {
    it('lists exactly the commands onMessage answers, each once', () => {
        const names = COMMANDS.map(c => c.command);
        assert.strictEqual(new Set(names).size, names.length);
        assert.deepStrictEqual([...names].sort(), commandsOfMain().sort());
    });

    it('marks every command as write true or false', () => {
        for (const { command, write } of COMMANDS) {
            assert.strictEqual(typeof write, 'boolean', command);
        }
        // only these return just information
        const readOnly = COMMANDS.filter(c => !c.write).map(c => c.command);
        assert.deepStrictEqual(readOnly.sort(), ['getCameras', 'help', 'image', 'list', 'snapshot', 'unifiCameras']);
    });

    it('marks the commands of the shared catalog with standard', () => {
        const marked = Object.fromEntries(COMMANDS.filter(c => c.standard).map(c => [c.command, c.standard]));
        assert.deepStrictEqual(marked, { getCameras: 'camera.getCameras', snapshot: 'camera.snapshot' });
        for (const standard of Object.values(marked)) {
            assert.ok(HELP.includes(standard), standard);
        }
    });

    it('names every command', () => {
        for (const { command } of COMMANDS) {
            assert.ok(HELP.includes(command), command);
        }
        assert.ok(HELP.includes('sendTo cameras.0'));
        assert.ok(HELP.includes('How to talk to the user:'));
    });

    it('keeps the lines short', () => {
        for (const line of HELP.split('\n')) {
            assert.ok(line.length <= 120, line);
        }
    });
});
