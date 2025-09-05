var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var multer = require('multer');
var sharp = require('sharp');
var fs = require('fs');
var imageHandler = require('./modules/image');
var pdfHandler = require('./modules/pdf');
var videoHandler = require('./modules/video');

var app = express();

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    }
});

// Health check endpoint for production debugging
app.get('/health', async (req, res) => {
    try {
        const health = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch,
            memory: process.memoryUsage(),
            uptime: process.uptime()
        };
        
        // Test Sharp.js
        try {
            const testBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
            await sharp(testBuffer).metadata();
            health.sharp = { status: 'ok', version: sharp.versions };
        } catch (sharpError) {
            health.sharp = { status: 'error', error: sharpError.message };
        }
        
        // Test temp directory
        try {
            const tempDir = path.join(__dirname, 'temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            health.tempDir = { status: 'ok', path: tempDir, writable: true };
        } catch (tempError) {
            health.tempDir = { status: 'error', error: tempError.message };
        }
        
        res.json(health);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var downloadRouter = require('./routes/download');
var directVideoRouter = require('./routes/direct-video');
var privacyRouter = require('./routes/privacy');
var termsRouter = require('./routes/terms');
var statsRouter = require('./routes/stats');
var imageConverterRouter = require('./routes/image-converter');

app.use('/privacy', privacyRouter);
app.use('/terms', termsRouter);
app.use('/stats', statsRouter);
app.use('/users', usersRouter);
app.use('/download', downloadRouter);
app.use('/direct-video', directVideoRouter);
app.use('/image-converter', imageConverterRouter);

// Converter route trực tiếp - đặt trước indexRouter để tránh bị xử lý bởi Twitter route
app.post('/convert', upload.array('files', 10), async (req, res) => {
    try {
        const files = req.files;
        const type = req.body.type;
        const lang = req.body.lang || 'en';
        
        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }
        
        if (!type) {
            return res.status(400).json({ error: 'No conversion type specified' });
        }
        
        // Generate progress ID
        const progressId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        conversionProgress.set(progressId, {
            status: 'processing',
            progress: 0,
            message: 'Starting conversion...',
            totalFiles: files.length,
            processedFiles: 0
        });
        
        console.log(`Processing ${files.length} files for conversion type: ${type}`);
        console.log('Files received:', files.map(f => ({
            originalname: f.originalname,
            mimetype: f.mimetype,
            size: f.size
        })));
        
        const results = [];
        const lowerType = type.toLowerCase();
        
        // Determine handler based on conversion type
        let handler;
        if (lowerType.includes('pdf') || lowerType.includes('merge') || lowerType.includes('combine')) {
            handler = pdfHandler;
        } else if (lowerType.includes('mp4') || lowerType.includes('video')) {
            handler = videoHandler;
        } else if (lowerType.includes('gif') || lowerType.includes('ico') || lowerType.includes('svg') || lowerType.includes('png') || lowerType.includes('jpg') || lowerType.includes('jpeg') || lowerType.includes('webp') || lowerType.includes('bmp') || lowerType.includes('tiff') || lowerType.includes('heic') || lowerType.includes('avif')) {
            handler = imageHandler;
        } else {
            return res.status(400).json({ error: 'Unsupported conversion type' });
        }
        
        // Check if this is a merge/combine operation
        const isMergeType = lowerType.includes('merge') || lowerType.includes('combine');
        const isMultiToPdf = (lowerType.includes('jpg') || lowerType.includes('png')) && lowerType.includes('pdf') && files.length > 1;
        
        if (isMergeType || isMultiToPdf) {
            // Update progress
            conversionProgress.set(progressId, {
                status: 'processing',
                progress: 10,
                message: 'Merging files...',
                totalFiles: files.length,
                processedFiles: 0
            });
            
            try {
                const merged = await handler.mergeImagesToPdf(type, files);
                results.push({
                    originalName: `${files.length} files`,
                    success: true,
                    data: merged
                });
                
                // Update progress to complete
                conversionProgress.set(progressId, {
                    status: 'completed',
                    progress: 100,
                    message: 'Conversion completed successfully',
                    totalFiles: files.length,
                    processedFiles: files.length
                });
                
            } catch (error) {
                console.error(`Error merging images to PDF:`, error);
                conversionProgress.set(progressId, {
                    status: 'error',
                    progress: 0,
                    message: error.message,
                    totalFiles: files.length,
                    processedFiles: 0
                });
                
                return res.render('result', {
                    title: 'MERGE - Error',
                    success: false,
                    error: error.message,
                    data: [],
                    content: { result_actions: {} }
                });
            }
        } else {
            // Process individual files
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                
                // Update progress
                const progress = Math.round(((i + 1) / files.length) * 90) + 10;
                conversionProgress.set(progressId, {
                    status: 'processing',
                    progress: progress,
                    message: `Processing file ${i + 1} of ${files.length}: ${file.originalname}`,
                    totalFiles: files.length,
                    processedFiles: i + 1
                });
                
                console.log(`Processing file ${i + 1}/${files.length}: ${file.originalname}`);
                console.log('File info:', {
                    originalname: file.originalname,
                    mimetype: file.mimetype,
                    size: file.size,
                    bufferExists: !!file.buffer
                });
                
                try {
                    const result = await handler.convert(type, file);
                    results.push({
                        originalName: file.originalname,
                        success: true,
                        data: result,
                        originalBuffer: file.buffer
                    });
                } catch (error) {
                    console.error(`Error processing file ${file.originalname}:`, error);
                    console.error('Conversion error details:', {
                        fileName: file.originalname,
                        fileSize: file.size,
                        fileMimeType: file.mimetype,
                        conversionType: type,
                        errorMessage: error.message,
                        errorStack: error.stack,
                        bufferExists: !!file.buffer,
                        bufferSize: file.buffer ? file.buffer.length : 0
                    });
                    results.push({
                        originalName: file.originalname,
                        success: false,
                        error: error.message
                    });
                }
            }
            
            // Update progress to complete
            conversionProgress.set(progressId, {
                status: 'completed',
                progress: 100,
                message: 'All files processed successfully',
                totalFiles: files.length,
                processedFiles: files.length
            });
        }
        
        // Generate thumbnails and temporary files
        const processedResults = [];
        for (const result of results) {
            if (result.success && result.data) {
                try {
                    // Save converted file first - use converter-provided filename and extension
                    const safePrefix = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    const providedFilename = result.data.filename || result.originalName;
                    const ext = path.extname(providedFilename) || '';
                    const base = path.basename(providedFilename, ext);
                    const finalFilename = `${safePrefix}_${base}${ext}`;
                    const convertedPath = path.join(__dirname, 'temp', finalFilename);
                    fs.writeFileSync(convertedPath, result.data.buffer);
                    
                    // Generate thumbnail from original file (not converted file)
                    let thumbnailFilename = '';
                    try {
                        // For ICO files, create thumbnail from original file since Sharp can't read ICO
                        const sourceBuffer = result.data.mimetype === 'image/x-icon' ? 
                            result.originalBuffer : result.data.buffer;
                        
                        const thumbnailBuffer = await sharp(sourceBuffer)
                            .resize(150, 150, { fit: 'cover' })
                            .jpeg({ quality: 80 })
                            .toBuffer();
                        
                        thumbnailFilename = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}_thumb.jpg`;
                        const thumbnailPath = path.join(__dirname, 'temp', thumbnailFilename);
                        fs.writeFileSync(thumbnailPath, thumbnailBuffer);
                    } catch (thumbError) {
                        console.error('Error generating thumbnail:', thumbError);
                        console.error('Thumbnail error details:', {
                            message: thumbError.message,
                            stack: thumbError.stack,
                            sourceBufferType: result.data.mimetype,
                            sourceBufferSize: sourceBuffer ? sourceBuffer.length : 'undefined'
                        });
                        // Use a default thumbnail or skip thumbnail
                        thumbnailFilename = '';
                    }
                    
                    processedResults.push({
                        title: result.originalName,
                        thumbnail: thumbnailFilename ? `/download/${thumbnailFilename}` : '',
                        medias: [{
                            url: `/download/${finalFilename}`,
                            quality: 'Original',
                            type: result.data.mimetype || result.data.mimeType || 'file'
                        }]
                    });
                } catch (error) {
                    console.error('Error processing result:', error);
                }
            }
        }
        
        // Clean up progress after 5 minutes
        setTimeout(() => {
            conversionProgress.delete(progressId);
        }, 5 * 60 * 1000);
        
        // Render result page
        res.render('result', {
            title: type.toUpperCase(),
            success: true,
            data: processedResults,
            content: { result_actions: {} }
        });
        
    } catch (error) {
        console.error('Error in conversion route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Progress tracking for conversions
const conversionProgress = new Map();

// Add progress tracking endpoint
app.get('/convert/progress/:id', (req, res) => {
    const progressId = req.params.id;
    const progress = conversionProgress.get(progressId) || { status: 'not_found' };
    res.json(progress);
});

app.use('/', indexRouter);

// Robots.txt route
app.get('/robots.txt', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/robots.txt'));
});

// Sitemap.xml route
app.get('/sitemap.xml', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/sitemap.xml'));
});

// Ads.txt route
app.get('/ads.txt', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/ads.txt'));
});

// Blog routes
app.get('/blog', (req, res) => {
    try {
        const blogDir = path.join(__dirname, 'locales', 'en', 'blog');
        const blogFiles = fs.readdirSync(blogDir).filter(file => file.endsWith('.json'));
        
        const blogPosts = blogFiles.map(file => {
            const filePath = path.join(blogDir, file);
            const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            return {
                ...content,
                slug: content.slug || file.replace('.json', '')
            };
        }).sort((a, b) => new Date(b.published_date) - new Date(a.published_date));
        
        res.render('blog', {
            title: 'Blog - WikiHowTo.click',
            blogPosts: blogPosts,
            lang: 'en'
        });
    } catch (error) {
        console.error('Error loading blog posts:', error);
        res.status(500).send('Error loading blog posts');
    }
});

app.get('/blog/:slug', (req, res) => {
    try {
        const slug = req.params.slug;
        const blogFilePath = path.join(__dirname, 'locales', 'en', 'blog', `${slug}.json`);
        
        if (!fs.existsSync(blogFilePath)) {
            return res.status(404).send('Blog post not found');
        }
        
        const blogPost = JSON.parse(fs.readFileSync(blogFilePath, 'utf8'));
        
        res.render('blog-detail', {
            title: `${blogPost.title} - WikiHowTo.click`,
            blogPost: blogPost,
            lang: 'en'
        });
    } catch (error) {
        console.error('Error loading blog post:', error);
        res.status(500).send('Error loading blog post');
    }
});

// Route để serve files đã convert
app.get('/download/:filename', (req, res) => {
    const fs = require('fs');
    const path = require('path');
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'temp', filename);
    
    // Kiểm tra file có tồn tại không
    if (!fs.existsSync(filePath)) {
        return res.status(404).send('File not found');
    }
    
    // Set headers cho download
    const ext = path.extname(filename);
    const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.pdf': 'application/pdf'
    };
    
    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    
    // Stream file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
});


// catch 404 and redirect to home page
app.use(function(req, res, next) {
    // Bỏ qua POST requests (cho API)
    if (req.method === 'POST') {
        return next();
    }
    
    // Bỏ qua route /convert
    if (req.path === '/convert' || req.path.startsWith('/convert/')) {
        return next();
    }
    
    // Kiểm tra nếu là API request hoặc converter request
    if (req.headers['content-type'] === 'application/json' ||
        req.path.startsWith('/api/') ||
        req.path.includes('.json')) {
        return res.status(404).json({
            error: 'Not found',
            message: 'The requested resource was not found',
            redirect: '/'
        });
    }

    // Kiểm tra nếu là request cho static files (CSS, JS, images, etc.)
    if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|xml|txt)$/)) {
        return res.status(404).json({
            error: 'Resource not found',
            message: 'The requested file was not found'
        });
    }



    // Kiểm tra nếu là privacy hoặc terms pages
    if (req.path === '/privacy' || req.path === '/privacy/' ||
        req.path === '/terms' || req.path === '/terms/') {
        return res.status(404).json({
            error: 'Not found',
            message: 'Privacy or Terms page not found'
        });
    }

    // Redirect về trang chủ cho tất cả các trường hợp khác
    console.log(`404 Redirect: ${req.method} ${req.path} -> /en/`);
    return res.redirect('/en/');
});

// error handler for other errors (500, etc.)
app.use(function(err, req, res, next) {
    console.error('Error:', err);

    // Kiểm tra nếu là API request
    if (req.headers['content-type'] === 'application/json' ||
        req.path.startsWith('/api/') ||
        req.path.includes('.json')) {
        return res.status(err.status || 500).json({
            error: 'Server error',
            message: err.message || 'An internal server error occurred',
            status: err.status || 500
        });
    }

    // Kiểm tra nếu là development environment
    if (req.app.get('env') === 'development') {
        res.locals.message = err.message;
        res.locals.error = err;
        res.status(err.status || 500);
        return res.render('error');
    }

    // Production: redirect về trang chủ cho lỗi server
    console.log(`500 Redirect: ${req.method} ${req.path} -> /en/`);
    return res.redirect('/en/');
});

module.exports = app;
