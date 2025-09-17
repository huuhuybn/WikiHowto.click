var express = require('express');
const router = express.Router();

const i18n = require('../utils/i18nLoader');
const generateMeta = require("../utils/metaHelper");
const langCode = require('../locales/langs');
const logger = require('../utils/logger');
const langs = langCode; // hỗ trợ 20+ ngôn ngữ

router.get('/', function (req, res, next) {
    res.redirect('/en/'); // hoặc bất kỳ ngôn ngữ mặc định nào
});

router.get('/:lang/', function (req, res, next) {
    let lang = req.params.lang || 'en';

    // Kiểm tra xem lang có hợp lệ không (có trong danh sách supported languages)
    if (!langs.includes(lang)) {
        console.log(`404: Invalid language ${lang}`);
        return res.redirect('/en/');
    }

    try {
        const group = "home";
        const slug = "home";
        const content = i18n.load(lang, group, slug);

        // Kiểm tra xem content có tồn tại không
        if (!content || !content.title) {
            console.log(`404: Content not found for ${lang}/${group}/${slug}`);
            return res.redirect('/en/');
        }
        const meta = generateMeta(lang, `${group}/${slug}`, {
            title: content.metaTitle,
            description: content.metaDescription,
            ogImage: content.ogImage
        });
        res.render('index', { lang, content, meta });
    } catch (error) {
        console.log(`Error loading content for ${lang}:`, error.message);
        return res.redirect('/en/');
    }
});


// Redirect from /en/convert/ to appropriate category based on slug
router.get('/:lang/convert/:slug/', (req, res) => {
    const {lang, slug} = req.params;
    
    // Determine the appropriate category based on the slug
    let category = 'image'; // default
    
    if (slug.includes('pdf') || slug.includes('merge') || slug.includes('combine') || 
        slug.includes('to-pdf') || slug.includes('pdf-to')) {
        category = 'pdf';
    } else if (slug.includes('mp3') || slug.includes('wav') || slug.includes('flac') || 
               slug.includes('m4a') || slug.includes('ogg') || slug.includes('wma') || 
               slug.includes('aiff') || slug.includes('aac') || slug.includes('amr') || 
               slug.includes('au') || slug.includes('ra') || slug.includes('wv') || 
               slug.includes('m4p') || slug.includes('m4b') || slug.includes('3gp')) {
        category = 'audio';
    } else if (slug.includes('mp4') || slug.includes('webm') || slug.includes('gif')) {
        category = 'video';
    } else if (slug.includes('ttf') || slug.includes('woff') || slug.includes('otf')) {
        category = 'font';
    } else if (slug.includes('doc') || slug.includes('xls') || slug.includes('ppt')) {
        category = 'office';
    } else if (slug.includes('zip') || slug.includes('rar') || slug.includes('7z')) {
        category = 'archive';
    }
    // else default to 'image' for jpg, png, webp, etc.
    
    console.log(`Redirecting from /${lang}/convert/${slug}/ to /${lang}/${category}/convert-${slug}/`);
    return res.redirect(`/${lang}/${category}/convert-${slug}/`);
});

// Handle privacy and terms pages with language prefix
router.get('/:lang/privacy', (req, res) => {
    const {lang} = req.params;
    
    // Validate language
    if (!langs.includes(lang)) {
        console.log(`404: Invalid language ${lang} for privacy page`);
        return res.redirect('/en/');
    }
    
    res.render('privacy', {
        title: 'Privacy Policy - MiConvert',
        description: 'Privacy Policy for MiConvert. Learn how we protect your privacy and handle your data.',
        currentPage: 'privacy',
        lang: lang
    });
});

router.get('/:lang/terms', (req, res) => {
    const {lang} = req.params;
    
    // Validate language
    if (!langs.includes(lang)) {
        console.log(`404: Invalid language ${lang} for terms page`);
        return res.redirect('/en/');
    }
    
    res.render('terms', {
        title: 'Terms of Service - MiConvert',
        description: 'Terms of Service for MiConvert. Read our terms and conditions for using our service.',
        currentPage: 'terms',
        lang: lang
    });
});

router.get('/:lang/:group/:slug/', (req, res) => {
    const {lang, group, slug} = req.params;

    console.log(`Accessing route: ${lang}/${group}/${slug}/`);

    // Validate group - only allow valid content groups (removed 'all' since we don't use it)
    const validGroups = ['image-converter', 'image', 'pdf', 'video', 'audio', 'font', 'office', 'archive', 'blog'];
    if (!validGroups.includes(group)) {
        console.log(`404: Invalid group ${group} for ${lang}/${group}/${slug}`);
        return res.redirect('/en/');
    }

    // Validate slug - should not contain file extensions or invalid characters
    if (slug.includes('.') || slug.includes('favicon') || slug.includes('icon')) {
        console.log(`404: Invalid slug ${slug} for ${lang}/${group}/${slug}`);
        return res.redirect('/en/');
    }

    try {
        // Load nội dung dịch
        console.log(`Attempting to load content for: ${lang}/${group}/${slug}`);
        const content = i18n.load(lang, group, slug); // trả về object JSON từ file như vi/tiktok/save-video-tiktok.json

        console.log(`Content loaded:`, content ? 'success' : 'failed');
        console.log(`Content keys:`, content ? Object.keys(content) : 'no content');

        // Kiểm tra xem content có tồn tại không
        if (!content || !content.title) {
            console.log(`404: Content not found for ${lang}/${group}/${slug}`);
            return res.redirect('/en/');
        }

        // Tạo thông tin meta dựa trên content
        console.log(content)
        const meta = generateMeta(lang, `${group}/${slug}`, {
            title: content.metaTitle,
            description: content.metaDescription,
            ogImage: content.ogImage
        });
        // Use index template for all pages (removed homepage template since we don't use all/home)
        res.render('index', {
            lang,
            group,
            slug,
            content,
            meta
        });
    } catch (error) {
        console.log(`Error loading content for ${lang}/${group}/${slug}:`, error.message);
        return res.redirect('/en/');
    }
});



router.post('/', async (req, res) => {
    let DATA = {
        errorCode: undefined,
        message: undefined,
        data: []
    };
    try {
        const url = req.body.url || req.body.link || req.query.url || req.query.link;

        if (!url) {
            logger.logUserRequest(req, 'error', {error: 'Missing video URL!'});
            return res.status(400).json({error: 'Missing video URL!'});
        }

        // Twitter support removed
        return res.status(501).json({error: 'Video downloader not available'});
    } catch (error) {
        console.error('Route handler error:', error);

        // Xử lý các loại lỗi cụ thể
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: 'Validation error',
                message: error.message || 'Invalid input data.',
                url: req.body.url || req.body.link || req.query.url || req.query.link
            });
        } else if (error.name === 'TimeoutError') {
            return res.status(408).json({
                error: 'Request timeout',
                message: 'The request took too long to process.',
                url: req.body.url || req.body.link || req.query.url || req.query.link
            });
        } else {
            // Lỗi server nội bộ
            return res.status(500).json({
                error: 'Internal server error',
                message: 'An unexpected error occurred while processing your request.',
                url: req.body.url || req.body.link || req.query.url || req.query.link
            });
        }
    }
});

// Test route
router.get('/test', (req, res) => {
    res.json({ message: 'Test route working!' });
});

// Test route cho convert
router.get('/convert-test', (req, res) => {
    res.json({ message: 'Convert test route working!' });
});



module.exports = router;
