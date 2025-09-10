const express = require('express');
const router = express.Router();
const request = require('request');
const crypto = require('crypto');

// Cache để lưu thông tin video
const videoCache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 phút

// Hàm kiểm tra URL video trực tiếp
function isDirectVideoUrl(url) {
    const videoExtensions = /\.(mp4|webm|avi|mov|mkv|flv|wmv|m4v|3gp|ogv)$/i;
    const videoDomains = [
        /tokcdn\.com/i,
        /cdn\.tiktok\.com/i,
        /fbcdn\.net/i,
        /cdn\.instagram\.com/i,
        /pbs\.twimg\.com/i,
        /video\.twimg\.com/i,
        /cdn\.pinterest\.com/i,
        /media\.amazonaws\.com/i,
        /cloudfront\.net/i,
        /akamaihd\.net/i
    ];
    
    return videoExtensions.test(url) || videoDomains.some(domain => domain.test(url));
}

// Hàm tạo cache key
function generateCacheKey(url) {
    return crypto.createHash('md5').update(url).digest('hex');
}

// Hàm detect platform từ URL
function detectPlatform(url) {
    if (/tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com/i.test(url)) return 'tiktok';
    if (/facebook\.com|fb\.com|fb\.me|fb\.watch/i.test(url)) return 'facebook';
    // Twitter support removed
    // if (/twitter\.com|x\.com/i.test(url)) return 'twitter';
    if (/instagram\.com|instagr\.am/i.test(url)) return 'instagram';
    if (/pinterest\.|pin\.it/i.test(url)) return 'pinterest';
    if (/youtube\.com|youtu\.be/i.test(url)) return 'youtube';
    if (/reddit\.com/i.test(url)) return 'reddit';
    if (/dailymotion\.com/i.test(url)) return 'dailymotion';
    return 'direct';
}

// Hàm stream video trực tiếp với tối ưu hóa
function streamDirectVideo(videoUrl, res, filename = 'video.mp4', rangeHeader = null) {
    return new Promise((resolve, reject) => {
        console.log(`Streaming direct video: ${videoUrl}`);
        
        // Set headers tối ưu cho video streaming
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD');
        res.setHeader('Access-Control-Allow-Headers', 'Range');
        
        // Tạo filename an toàn
        const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 100);
        res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);

        // Xử lý Range request (cho video seeking)
        const range = rangeHeader;
        let start = 0;
        let end = null;
        
        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            start = parseInt(parts[0], 10);
            end = parts[1] ? parseInt(parts[1], 10) : null;
        }

        // Tạo request với headers tối ưu
        const videoRequest = request({
            url: videoUrl,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'video/mp4,video/*,*/*;q=0.9',
                'Accept-Encoding': 'identity',
                'Connection': 'keep-alive',
                'Range': range || undefined
            },
            timeout: 30000, // 30 giây timeout
            followRedirect: true,
            maxRedirects: 5
        });

        videoRequest.on('response', (response) => {
            console.log(`Video response status: ${response.statusCode}`);
            
            // Forward headers quan trọng
            if (response.headers['content-length']) {
                res.setHeader('Content-Length', response.headers['content-length']);
            }
            
            if (response.headers['accept-ranges']) {
                res.setHeader('Accept-Ranges', response.headers['accept-ranges']);
            }
            
            if (response.headers['content-type']) {
                res.setHeader('Content-Type', response.headers['content-type']);
            }
            
            // Xử lý Range response
            if (response.statusCode === 206 && response.headers['content-range']) {
                res.setHeader('Content-Range', response.headers['content-range']);
                res.status(206);
            } else if (response.statusCode === 200) {
                res.status(200);
            } else {
                res.status(response.statusCode);
            }
        });

        videoRequest.on('data', (chunk) => {
            res.write(chunk);
        });

        videoRequest.on('end', () => {
            res.end();
            console.log('Video streaming completed');
            resolve();
        });

        videoRequest.on('error', (error) => {
            console.error('Streaming error:', error.message);
            if (!res.headersSent) {
                res.status(500).json({ 
                    error: 'Streaming failed', 
                    message: error.message 
                });
            }
            reject(error);
        });

        // Handle client disconnect
        res.on('close', () => {
            console.log('Client disconnected, aborting video request');
            videoRequest.abort();
        });

        // Handle timeout
        videoRequest.on('timeout', () => {
            console.error('Video request timeout');
            videoRequest.abort();
            if (!res.headersSent) {
                res.status(408).json({ error: 'Request timeout' });
            }
        });
    });
}

// Route GET để stream video trực tiếp
router.get('/stream', async (req, res) => {
    try {
        const { url, filename } = req.query;
        
        if (!url) {
            return res.status(400).json({ error: 'URL parameter is required' });
        }

        if (!isDirectVideoUrl(url)) {
            return res.status(400).json({ 
                error: 'Invalid video URL', 
                message: 'URL must be a direct video link' 
            });
        }

        console.log(`Direct video request: ${url}`);
        
        // Kiểm tra cache
        const cacheKey = generateCacheKey(url);
        const cached = videoCache.get(cacheKey);
        
        if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
            console.log('Serving from cache');
            return streamDirectVideo(cached.url, res, cached.filename, req.headers.range);
        }

        // Cache thông tin video
        videoCache.set(cacheKey, {
            url: url,
            filename: filename || 'video.mp4',
            timestamp: Date.now()
        });

        // Track direct video download
        const platform = detectPlatform(url);
        console.log(`Analytics: Direct video download - ${platform} - ${url}`);
        
        // Stream video
        await streamDirectVideo(url, res, filename || 'video.mp4', req.headers.range);

    } catch (error) {
        console.error('Direct video route error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

// Route POST để stream video trực tiếp
router.post('/stream', async (req, res) => {
    try {
        const { url, filename } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        if (!isDirectVideoUrl(url)) {
            return res.status(400).json({ 
                error: 'Invalid video URL', 
                message: 'URL must be a direct video link' 
            });
        }

        console.log(`Direct video POST request: ${url}`);
        
        // Kiểm tra cache
        const cacheKey = generateCacheKey(url);
        const cached = videoCache.get(cacheKey);
        
        if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
            console.log('Serving from cache');
            return streamDirectVideo(cached.url, res, cached.filename, req.headers.range);
        }

        // Cache thông tin video
        videoCache.set(cacheKey, {
            url: url,
            filename: filename || 'video.mp4',
            timestamp: Date.now()
        });

        // Track direct video download
        const platform = detectPlatform(url);
        console.log(`Analytics: Direct video download POST - ${platform} - ${url}`);
        
        // Stream video
        await streamDirectVideo(url, res, filename || 'video.mp4', req.headers.range);

    } catch (error) {
        console.error('Direct video POST route error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

// Route để kiểm tra video info
router.post('/info', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        if (!isDirectVideoUrl(url)) {
            return res.status(400).json({ 
                error: 'Invalid video URL', 
                message: 'URL must be a direct video link' 
            });
        }

        // Kiểm tra cache
        const cacheKey = generateCacheKey(url);
        const cached = videoCache.get(cacheKey);
        
        if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
            return res.json({
                status: 'cached',
                url: cached.url,
                filename: cached.filename,
                cached: true,
                downloadUrl: `/direct-video/stream?url=${url}`
            });
        }

        // Kiểm tra video có tồn tại không
        const checkRequest = request({
            url: url,
            method: 'HEAD',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000
        });

        checkRequest.on('response', (response) => {
            if (response.statusCode === 200 || response.statusCode === 206) {
                const contentLength = response.headers['content-length'];
                const contentType = response.headers['content-type'];
                
                // Cache thông tin
                videoCache.set(cacheKey, {
                    url: url,
                    filename: 'video.mp4',
                    timestamp: Date.now()
                });

                return res.json({
                    status: 'available',
                    url: url,
                    filename: 'video.mp4',
                    cached: false,
                    contentLength: contentLength,
                    contentType: contentType,
                    downloadUrl: `/direct-video/stream?url=${url}`
                });
            } else {
                return res.status(404).json({
                    status: 'not_found',
                    error: 'Video not accessible',
                    statusCode: response.statusCode
                });
            }
        });

        checkRequest.on('error', (error) => {
            console.error('Video check error:', error.message);
            return res.status(500).json({
                status: 'error',
                error: 'Failed to check video',
                message: error.message
            });
        });

    } catch (error) {
        console.error('Video info route error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route để xóa cache
router.delete('/cache', (req, res) => {
    const { url } = req.query;
    
    if (url) {
        const cacheKey = generateCacheKey(url);
        videoCache.delete(cacheKey);
        res.json({ message: 'Cache cleared for URL' });
    } else {
        videoCache.clear();
        res.json({ message: 'All cache cleared' });
    }
});

// Route để lấy danh sách cache
router.get('/cache', (req, res) => {
    const cacheList = Array.from(videoCache.entries()).map(([key, value]) => ({
        key: key,
        url: value.url,
        filename: value.filename,
        timestamp: value.timestamp,
        age: Date.now() - value.timestamp
    }));
    
    res.json({
        total: cacheList.length,
        cache: cacheList
    });
});

module.exports = router; 