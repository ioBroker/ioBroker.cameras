// Generates one logo per manufacturer into src-admin/public/data/<id>.svg.
//
// Two sources:
//   1. simple-icons (CC0-1.0) for the brands it actually carries - a real brand mark.
//   2. A generated monogram for everything else. Most IP camera brands are not in any
//      freely licensed icon set, and copying trademarked logos off the web into an MIT
//      repository is not something we want to do. The monogram keeps the picker readable
//      and can be replaced at any time: Types/Universal.tsx looks for <id>.svg, then .png,
//      then .jpg, so dropping a real logo next to the JSON file is enough.
//
// Usage: node tools/logos.js [--force]
const { writeFileSync, existsSync, readFileSync } = require('node:fs');
const { join } = require('node:path');
const simpleIcons = require('simple-icons');

const DATA_DIR = join(__dirname, '..', 'src-admin', 'public', 'data');

/**
 * simple-icons entries that carry the *wrong* company for our purposes.
 * "Planet" there is planet.com (satellite imagery), not PLANET Technology, which is the
 * networking manufacturer that makes the IP cameras.
 */
const WRONG_MATCHES = new Set(['planet']);

/** Manufacturers where the simple-icons slug differs from our id */
const SLUG_OVERRIDES = {
    'tp-link': 'tplink',
    'd-link': 'dlink',
};

function findBrandIcon(id, name) {
    if (WRONG_MATCHES.has(id)) {
        return null;
    }

    const icons = Object.values(simpleIcons).filter(icon => icon && icon.slug && icon.path);
    const bySlug = new Map(icons.map(icon => [icon.slug, icon]));
    const byTitle = new Map(icons.map(icon => [icon.title.toLowerCase().replace(/[^a-z0-9]/g, ''), icon]));

    const candidates = [
        SLUG_OVERRIDES[id],
        id.replace(/-/g, ''),
        id,
        name.toLowerCase().replace(/[^a-z0-9]/g, ''),
    ].filter(Boolean);

    for (const candidate of candidates) {
        const icon = bySlug.get(candidate) || byTitle.get(candidate);
        if (icon) {
            return icon;
        }
    }
    return null;
}

/** Names where the automatic abbreviation would be misleading */
const MONOGRAM_OVERRIDES = {
    tapo: 'TAPO',
    wanscam: 'WCAM',
    wansview: 'WVIEW',
};

/** Short, still recognizable abbreviation: initials for multi-word names, else the first letters */
function monogramText(id, name) {
    if (MONOGRAM_OVERRIDES[id]) {
        return MONOGRAM_OVERRIDES[id];
    }

    const words = name.split(/[\s-]+/).filter(w => w);
    if (words.length > 1) {
        return words
            .slice(0, 3)
            .map(w => w[0])
            .join('')
            .toUpperCase();
    }
    return name
        .replace(/[^A-Za-z0-9]/g, '')
        .slice(0, 3)
        .toUpperCase();
}

/** Stable colour per manufacturer, so a logo never changes between runs */
function hueFor(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
    }
    return hash % 360;
}

/** Perceived brightness of #rrggbb, used to pick black or white content */
function isLight(hex) {
    const value = parseInt(hex.replace('#', ''), 16);
    const r = (value >> 16) & 0xff;
    const g = (value >> 8) & 0xff;
    const b = value & 0xff;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.65;
}

function brandSvg(icon) {
    const background = `#${icon.hex}`;
    const light = isLight(background);
    const foreground = light ? '#000000' : '#ffffff';
    // A light brand colour (Sony is plain white) would make the tile disappear on a light
    // admin theme, so outline it
    const border = light ? '<rect x=".5" y=".5" width="31" height="31" rx="5.5" fill="none" stroke="#00000022"/>' : '';
    // simple-icons paths live in a 24x24 viewBox; inset the glyph a little
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="${icon.title}">
    <rect width="32" height="32" rx="6" fill="${background}"/>
    ${border}
    <g transform="translate(4 4)">
        <path d="${icon.path}" fill="${foreground}"/>
    </g>
</svg>
`;
}

function monogramSvg(id, name) {
    const text = monogramText(id, name);
    const hue = hueFor(name);
    const background = `hsl(${hue} 42% 42%)`;
    // Shrink the text as it gets longer so five letters still fit
    const fontSize = [16, 16, 13, 11, 9, 7.5][Math.min(text.length, 5)] || 7.5;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="${name}">
    <rect width="32" height="32" rx="6" fill="${background}"/>
    <text x="16" y="16" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}"
          font-weight="700" text-anchor="middle" dominant-baseline="central">${text}</text>
</svg>
`;
}

function main() {
    const force = process.argv.includes('--force');
    const indexPath = join(DATA_DIR, 'manufacturers.json');
    if (!existsSync(indexPath)) {
        console.error('manufacturers.json is missing - run "node tools/parser.js" first');
        process.exit(1);
    }

    const manufacturers = JSON.parse(readFileSync(indexPath, 'utf8'));
    let brand = 0;
    let generated = 0;
    let skipped = 0;

    for (const { id, name } of manufacturers) {
        // Never overwrite a hand-placed logo unless explicitly asked to
        const existing = ['svg', 'png', 'jpg'].find(ext => existsSync(join(DATA_DIR, `${id}.${ext}`)));
        if (existing && !force) {
            skipped++;
            continue;
        }

        const icon = findBrandIcon(id, name);
        if (icon) {
            writeFileSync(join(DATA_DIR, `${id}.svg`), brandSvg(icon));
            console.log(`  ${id.padEnd(12)} brand logo (${icon.title})`);
            brand++;
        } else {
            writeFileSync(join(DATA_DIR, `${id}.svg`), monogramSvg(id, name));
            console.log(`  ${id.padEnd(12)} monogram "${monogramText(id, name)}"`);
            generated++;
        }
    }

    // Two identical abbreviations next to each other in the dropdown are confusing
    const seen = new Map();
    for (const { id, name } of manufacturers) {
        if (findBrandIcon(id, name)) {
            continue;
        }
        const text = monogramText(id, name);
        if (seen.has(text)) {
            console.warn(`Warning: "${text}" is used by both ${seen.get(text)} and ${id}`);
        }
        seen.set(text, id);
    }

    console.log(`\n${brand} brand logos, ${generated} monograms, ${skipped} kept as they were`);
    if (!force && skipped) {
        console.log('Use --force to regenerate the existing ones too');
    }
}

main();
