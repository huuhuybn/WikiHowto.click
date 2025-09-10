const langArr = require('../locales/langs');
const SUPPORTED_LANGS = langArr

const BASE_URL = 'https://miconvert.com';

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function generateMetaHTML(lang, slug, options = {}) {
    const safeLang = SUPPORTED_LANGS.includes(lang) ? lang : 'en';
    const canonicalUrl = `${BASE_URL}/${safeLang}${slug ? '/' + slug : ''}/`;

    const alternates = SUPPORTED_LANGS.map(l => {
        const url = `${BASE_URL}/${l}${slug ? '/' + slug : ''}/`;
        return `<link rel="alternate" hreflang="${l}" href="${url}">`;
    }).join('\n');

    const xDefault = `<link rel="alternate" hreflang="x-default" href="${BASE_URL}/en${slug ? '/' + slug : ''}/">`;

    return `
<link rel="canonical" href="${canonicalUrl}">
${alternates}
${xDefault}
<meta property="og:url" content="${canonicalUrl}">
`.trim();
}

module.exports = generateMetaHTML;
