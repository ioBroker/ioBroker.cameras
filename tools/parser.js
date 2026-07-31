// This file extracts connection information from https://www.ispyconnect.com/camera/MANUFACTURER
// and writes one JSON file per manufacturer into src-admin/public/data/, plus the
// manufacturers.json index that the "universal" camera dialog uses to fill its dropdown.
//
// Usage:
//   node tools/parser.js                  # refresh all manufacturers listed below
//   node tools/parser.js hikvision dahua  # refresh only the given ones
//
// The page markup changes from time to time. Everything we need sits in data-* attributes
// on the <tr> elements, which survived the last redesign much better than the column order.
const axios = require('axios');
const { writeFileSync, mkdirSync, existsSync, readdirSync } = require('node:fs');
const { join } = require('node:path');
const cheerio = require('cheerio');

const OUTPUT_DIR = join(__dirname, '..', 'src-admin', 'public', 'data');

/** Slug on ispyconnect.com => label shown in the admin dropdown */
const MANUFACTURERS = {
    abus: 'ABUS',
    acti: 'ACTi',
    amcrest: 'Amcrest',
    annke: 'ANNKE',
    arecont: 'Arecont Vision',
    avtech: 'AVTECH',
    axis: 'Axis',
    bosch: 'Bosch',
    canon: 'Canon',
    dahua: 'Dahua',
    'd-link': 'D-Link',
    edimax: 'Edimax',
    eufy: 'Eufy',
    ezviz: 'EZVIZ',
    foscam: 'Foscam',
    geovision: 'GeoVision',
    grandstream: 'Grandstream',
    hanwha: 'Hanwha Techwin',
    hikvision: 'Hikvision',
    honeywell: 'Honeywell',
    imou: 'Imou',
    instar: 'INSTAR',
    lorex: 'Lorex',
    milesight: 'Milesight',
    mobotix: 'MOBOTIX',
    panasonic: 'Panasonic',
    pelco: 'Pelco',
    planet: 'PLANET',
    reolink: 'Reolink',
    samsung: 'Samsung',
    sannce: 'SANNCE',
    sony: 'Sony',
    sricam: 'Sricam',
    swann: 'Swann',
    tapo: 'TP-Link Tapo',
    tenvis: 'TENVIS',
    toshiba: 'Toshiba',
    'tp-link': 'TP-Link',
    trendnet: 'TRENDnet',
    ubiquiti: 'Ubiquiti',
    uniview: 'Uniview',
    vivotek: 'VIVOTEK',
    vstarcam: 'VStarcam',
    wanscam: 'Wanscam',
    wansview: 'Wansview',
    xiaomi: 'Xiaomi',
    yi: 'YI',
    zavio: 'Zavio',
    zmodo: 'Zmodo',
};

/** UniversalCamera can only build rtsp:// and http:// URLs, so everything else is dropped */
const SUPPORTED_PROTOCOLS = ['rtsp://', 'http://'];

function parseCameraConfig(html) {
    const $ = cheerio.load(html);
    const data = [];

    $('tr[data-protocol]').each((index, element) => {
        const row = $(element);
        const protocol = (row.attr('data-protocol') || '').trim();
        if (!SUPPORTED_PROTOCOLS.includes(protocol)) {
            return;
        }

        // Each row lists all models that share this connection URL
        let models = row
            .find('a.model-link')
            .map((i, a) => $(a).text().trim())
            .get()
            .filter(model => model);

        if (!models.length) {
            models = row
                .find('td')
                .eq(0)
                .text()
                .split(',')
                .map(model => model.trim())
                .filter(model => model);
        }

        if (!models.length) {
            return;
        }

        data.push({
            models: [...new Set(models)],
            variant: (row.attr('data-conn') || '').trim(),
            protocol,
            path: (row.attr('data-path') || '').trim(),
            port: parseInt(row.attr('data-port') || '0', 10) || 0,
        });
    });

    return data;
}

async function fetchCameraConfig(manufacturer) {
    const response = await axios.get(`https://www.ispyconnect.com/camera/${manufacturer}`, { timeout: 30000 });
    const data = parseCameraConfig(response.data);

    if (!data.length) {
        console.warn(`  ${manufacturer}: no usable rows - skipped (did the page layout change?)`);
        return;
    }

    writeFileSync(join(OUTPUT_DIR, `${manufacturer}.json`), JSON.stringify(data, null, 4));
    const models = new Set();
    data.forEach(item => item.models.forEach(model => models.add(model)));
    console.log(`  ${manufacturer}: ${data.length} URLs, ${models.size} models`);
}

/** Rebuild manufacturers.json from the data files that are actually present */
function writeIndex() {
    const available = Object.keys(MANUFACTURERS)
        .filter(id => existsSync(join(OUTPUT_DIR, `${id}.json`)))
        .map(id => ({ id, name: MANUFACTURERS[id] }))
        .sort((a, b) => a.name.localeCompare(b.name));

    writeFileSync(join(OUTPUT_DIR, 'manufacturers.json'), JSON.stringify(available, null, 4));
    console.log(`\nmanufacturers.json: ${available.length} manufacturers`);

    const orphans = readdirSync(OUTPUT_DIR)
        .filter(file => file.endsWith('.json') && file !== 'manufacturers.json')
        .map(file => file.replace(/\.json$/, ''))
        .filter(id => !MANUFACTURERS[id]);

    if (orphans.length) {
        console.warn(`Data files without an entry in MANUFACTURERS: ${orphans.join(', ')}`);
    }
}

async function main() {
    const requested = process.argv.slice(2).filter(arg => !arg.startsWith('-'));
    const list = requested.length ? requested : Object.keys(MANUFACTURERS);

    const unknown = requested.filter(id => !MANUFACTURERS[id]);
    if (unknown.length) {
        console.warn(`Unknown manufacturer(s): ${unknown.join(', ')} - add them to MANUFACTURERS first`);
    }

    mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Writing to ${OUTPUT_DIR}`);

    for (const manufacturer of list) {
        if (!MANUFACTURERS[manufacturer]) {
            continue;
        }
        try {
            await fetchCameraConfig(manufacturer);
        } catch (e) {
            console.error(`  ${manufacturer}: ${e.message}`);
        }
    }

    writeIndex();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
