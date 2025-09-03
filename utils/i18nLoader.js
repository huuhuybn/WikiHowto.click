const fs = require('fs');
const path = require('path');
const NodeCache = require('node-cache');
const chokidar = require('chokidar');

const cache = new NodeCache({ stdTTL: 3600 }); // cache mỗi file 1 giờ
const baseLocalePath = path.join(__dirname, '..', 'locales'); // /locales/en/pinterest/video.json

function load(lang, group, slug) {
    const cacheKey = `${lang}/${group}/${slug}`;
    let json = cache.get(cacheKey);

    if (!json) {
        const filePath = path.join(baseLocalePath, lang, group, `${slug}.json`);
        try {
            const raw = fs.readFileSync(filePath, 'utf-8');
            json = JSON.parse(raw);
            cache.set(cacheKey, json);
        } catch (err) {
            console.warn('Missing or invalid JSON file:', filePath);
            json = {};
        }
    }

    return json;
}

// Tự xóa cache nếu file thay đổi (live dev hoặc upload mới)
chokidar.watch(baseLocalePath, { ignoreInitial: true }).on('change', (filePath) => {
    const relative = path.relative(baseLocalePath, filePath); // en/pinterest/video.json
    const parts = relative.split(path.sep);
    if (parts.length === 3) {
        const [lang, group, file] = parts;
        const slug = path.basename(file, '.json');
        const cacheKey = `${lang}/${group}/${slug}`;
        cache.del(cacheKey);
        console.log('🧹 JSON cache invalidated:', cacheKey);
    }
});

module.exports = {
    load,
    clearAll: () => cache.flushAll(),
};
