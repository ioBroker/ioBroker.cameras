// This file tries to extract information from https://www.ispyconnect.com/camera/MODEL where MODEL is a placeholder for the camera model.
const axios = require('axios');
const { writeFileSync } = require('node:fs')
const cheerio = require('cheerio');

const MANUFACTURERS = ['canon'];

async function fetchCameraConfig(manufacturer) {
    const response = await axios.get(`https://www.ispyconnect.com/camera/${manufacturer}`);

    const $ = cheerio.load(response.data);
    const data = [];

    $('tr').each((index, element) => {
        const models = $(element)
            .find('td')
            .eq(0)
            .text()
            .split(',')
            .map(type => type.trim());
        const variant = $(element).find('td').eq(1).text().trim();
        const protocol = $(element).find('td').eq(2).text().trim();
        const path = $(element).find('td').eq(3).text().trim();

        if (variant) {
            data.push({ models, variant, protocol, path });
        }
    });

    writeFileSync(`${manufacturer}.json`, JSON.stringify(data, null, 4));
}

for (const MANUFACTURER of MANUFACTURERS) {
    fetchCameraConfig(MANUFACTURER).catch(console.error);
}
