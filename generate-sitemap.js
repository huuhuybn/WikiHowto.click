const fs = require('fs');
const path = require('path');

// Languages supported
const languages = [
    'en', 'vi', 'es', 'pt', 'fr', 'de', 'it', 'id', 'ms', 'th', 'ja', 'ko', 
    'zh-CN', 'zh-TW', 'ru', 'tr', 'pl', 'ro', 'uk', 'cs', 'el', 'hi', 'jv', 
    'nl', 'hu', 'ar', 'he', 'fa', 'sw', 'sq', 'am', 'ta', 'te', 'bn', 'ur', 
    'sr', 'bg', 'sv', 'da', 'fi', 'no', 'sk', 'sl', 'et', 'lv', 'lt', 'ca', 'hr'
];

// Converter categories and their converters
const converters = {
    image: [
        'jpg-to-png', 'png-to-jpg', 'jpg-to-webp', 'webp-to-jpg', 'png-to-webp', 'webp-to-png',
        'jpg-to-gif', 'gif-to-jpg', 'png-to-gif', 'gif-to-png', 'jpg-to-bmp', 'bmp-to-jpg',
        'png-to-bmp', 'bmp-to-png', 'jpg-to-tiff', 'tiff-to-jpg', 'png-to-tiff', 'tiff-to-png',
        'jpg-to-ico', 'png-to-ico', 'bmp-to-ico', 'svg-to-png', 'svg-to-jpg', 'svg-to-ico',
        'heic-to-jpg', 'heic-to-png', 'avif-to-jpg', 'avif-to-png', 'avif-to-webp'
    ],
    video: [
        'jpg-to-gif', 'png-to-gif', 'gif-to-mp4', 'webp-to-gif', 'bmp-to-gif'
    ],
    pdf: [
        'pdf-to-jpg', 'pdf-to-png', 'pdf-to-webp', 'pdf-to-tiff',
        'jpg-to-pdf', 'png-to-pdf', 'webp-to-pdf', 'tiff-to-pdf',
        'merge-jpg-to-pdf', 'combine-png-to-pdf'
    ],
    audio: [
        'mp3-to-wav', 'wav-to-mp3', 'mp3-to-flac', 'flac-to-mp3',
        'mp3-to-m4a', 'm4a-to-mp3', 'wav-to-m4a', 'm4a-to-wav'
    ],
    font: [
        'ttf-to-woff', 'woff-to-ttf', 'otf-to-ttf', 'ttf-to-otf'
    ],
    office: [
        'doc-to-pdf', 'pdf-to-doc', 'xls-to-pdf', 'pdf-to-xls',
        'ppt-to-pdf', 'pdf-to-ppt'
    ],
    archive: [
        'zip-to-rar', 'rar-to-zip', '7z-to-zip', 'zip-to-7z'
    ]
};

// Twitter downloader pages - REMOVED
// const twitterPages = [
//     'video-downloader', 'to-mp3', 'to-mp4', 'image-downloader', 'gif-downloader', 'spaces-downloader'
// ];

// Other pages
const otherPages = [
    { group: '', slug: '' }, // homepage
    { group: 'privacy', slug: 'privacy' },
    { group: 'terms', slug: 'terms' }
];

function generateSitemap() {
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

    // Generate URLs for each language
    languages.forEach(lang => {
        // Homepage
        sitemap += `
  <url>
    <loc>https://miconvert.com/${lang}/</loc>
    <lastmod>2025-01-21</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>`;
        
        // Add hreflang links for all languages
        languages.forEach(hreflang => {
            sitemap += `
    <xhtml:link rel="alternate" hreflang="${hreflang}" href="https://miconvert.com/${hreflang}/"/>`;
        });
        
        sitemap += `
  </url>`;

        // Converter pages
        Object.entries(converters).forEach(([category, converterList]) => {
            converterList.forEach(converter => {
                sitemap += `
  <url>
    <loc>https://miconvert.com/${lang}/${category}/convert-${converter}/</loc>
    <lastmod>2025-01-21</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="${lang}" href="https://miconvert.com/${lang}/${category}/convert-${converter}/"/>`;
                
                // Add hreflang for other languages
                languages.filter(l => l !== lang).forEach(hreflang => {
                    sitemap += `
    <xhtml:link rel="alternate" hreflang="${hreflang}" href="https://miconvert.com/${hreflang}/${category}/convert-${converter}/"/>`;
                });
                
                sitemap += `
  </url>`;
            });
        });

        // Twitter downloader pages - REMOVED
        // twitterPages.forEach(page => {
        //     sitemap += `
        //   <url>
        //     <loc>https://miconvert.com/${lang}/twitter/${page}/</loc>
        //     <lastmod>2025-01-21</lastmod>
        //     <changefreq>weekly</changefreq>
        //     <priority>0.7</priority>
        //     <xhtml:link rel="alternate" hreflang="${lang}" href="https://miconvert.com/${lang}/twitter/${page}/"/>`;
        //     
        //     languages.filter(l => l !== lang).forEach(hreflang => {
        //         sitemap += `
        //     <xhtml:link rel="alternate" hreflang="${hreflang}" href="https://miconvert.com/${hreflang}/twitter/${page}/"/>`;
        //     });
        //     
        //     sitemap += `
        //   </url>`;
        // });

        // Other pages (privacy, terms)
        otherPages.forEach(page => {
            if (page.group === '') return; // skip homepage (already added)
            
            sitemap += `
  <url>
    <loc>https://miconvert.com/${lang}/${page.slug}/</loc>
    <lastmod>2025-01-21</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
    <xhtml:link rel="alternate" hreflang="${lang}" href="https://miconvert.com/${lang}/${page.slug}/"/>`;
            
            languages.filter(l => l !== lang).forEach(hreflang => {
                sitemap += `
    <xhtml:link rel="alternate" hreflang="${hreflang}" href="https://miconvert.com/${hreflang}/${page.slug}/"/>`;
            });
            
            sitemap += `
  </url>`;
        });
    });

    sitemap += `
</urlset>`;

    return sitemap;
}

// Generate and save sitemap
const sitemapContent = generateSitemap();
fs.writeFileSync('public/sitemap.xml', sitemapContent);

console.log('✅ Sitemap generated successfully!');
console.log(`📊 Total URLs: ${languages.length * (1 + Object.values(converters).flat().length + otherPages.length - 1)}`);
console.log(`🌍 Languages: ${languages.length}`);
console.log(`🔧 Converters: ${Object.values(converters).flat().length}`);
console.log(`📄 Other pages: ${otherPages.length - 1}`);
