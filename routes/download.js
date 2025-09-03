const express = require('express');
const router = express.Router();
const request = require('request');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const logger = require('../utils/logger');


// Cache để lưu kết quả download
const downloadCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

// Chỉ hỗ trợ Twitter
function detectPlatform(url) {
    if (/twitter\.com|x\.com/i.test(url)) return 'twitter';
    return null;
}

// Hàm tạo cache key
function generateCacheKey(url, platform) {
    return crypto.createHash('md5').update(`${url}-${platform}`).digest('hex');
}

// Hàm download và stream video
async function downloadAndStreamVideo(videoUrl, res, platform) {
    const cacheKey = generateCacheKey(videoUrl, platform);

    // Kiểm tra cache trước
    const cached = downloadCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        console.log(`Serving from cache: ${platform}`);
        return streamVideoFromUrl(cached.videoUrl, res, cached.title);
    }

    try {
        // Download video info
        const DATA = {
            errorCode: undefined,
            message: undefined,
            data: []
        };

        let result;
        if (platform === 'twitter') {
            // result = await twHandler(videoUrl, DATA);
            return res.status(501).json({ error: 'Twitter module not implemented yet' });
        } else {
            return res.status(400).json({ error: 'Only Twitter/X URLs are supported' });
        }

        if (result.errorCode !== 200 || !result.data || result.data.length === 0) {
            return res.status(404).json({
                error: 'Video not found',
                message: result.message
            });
        }

        // Lấy tất cả media (video + ảnh)
        const videoData = result.data[0];
        const videoUrl = videoData.medias.find(m => m.type === 'video')?.url;
        const images = videoData.medias.filter(m => m.type === 'image');

        if (!videoUrl && images.length === 0) {
            return res.status(404).json({ error: 'No video or image URL found' });
        }

        // Cache kết quả với đầy đủ media
        downloadCache.set(cacheKey, {
            videoUrl: videoUrl,
            images: images,
            title: videoData.title || 'content',
            timestamp: Date.now()
        });

        // Nếu có video, stream video. Nếu không, trả về JSON với ảnh
        if (videoUrl) {
            await streamVideoFromUrl(videoUrl, res, videoData.title);
        } else {
            // Trả về JSON với thông tin ảnh
            res.json({
                success: true,
                platform: platform,
                title: videoData.title,
                description: videoData.description,
                thumbnail: videoData.thumbnail,
                images: images,
                message: 'Images available for download'
            });
        }

    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Download failed', message: error.message });
    }
}

// Hàm stream video từ URL
function streamVideoFromUrl(videoUrl, res, title) {
    return new Promise((resolve, reject) => {
        // Set headers cho video streaming
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Cache-Control', 'public, max-age=3600');

        // Tạo filename an toàn
        const safeTitle = title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
        res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.mp4"`);

        // Stream video
        const videoRequest = request({
            url: videoUrl,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        videoRequest.on('response', (response) => {
            // Forward content length nếu có
            if (response.headers['content-length']) {
                res.setHeader('Content-Length', response.headers['content-length']);
            }

            // Forward range headers nếu có
            if (response.headers['accept-ranges']) {
                res.setHeader('Accept-Ranges', response.headers['accept-ranges']);
            }
        });

        videoRequest.on('data', (chunk) => {
            res.write(chunk);
        });

        videoRequest.on('end', () => {
            res.end();
            resolve();
        });

        videoRequest.on('error', (error) => {
            console.error('Streaming error:', error);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Streaming failed' });
            }
            reject(error);
        });

        // Handle client disconnect
        res.on('close', () => {
            videoRequest.abort();
        });
    });
}

// Route POST để download video
router.post('/video', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            logger.logUserRequest(req, 'error', { error: 'URL is required' });
            return res.status(400).json({ error: 'URL is required' });
        }

        const platform = detectPlatform(url);
        if (!platform) {
            logger.logUserRequest(req, 'error', { error: 'Unsupported platform', url });
            return res.status(400).json({ error: 'Unsupported platform' });
        }

        console.log(`Downloading ${platform} video: ${url}`);

        // Log successful request
        logger.logUserRequest(req, 'success', { platform, url });

        // Bắt đầu download và stream
        await downloadAndStreamVideo(url, res, platform);

    } catch (error) {
        console.error('Route error:', error);
        logger.logUserRequest(req, 'error', { error: error.message, url: req.body.url });
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

// Route GET để download video (cho compatibility)
router.get('/video', async (req, res) => {
    try {
        const { url, platform: queryPlatform } = req.query;

        if (!url) {
            return res.status(400).json({ error: 'URL parameter is required' });
        }

        // Sử dụng platform từ query hoặc detect từ URL
        const platform = queryPlatform || detectPlatform(url);
        if (!platform) {
            return res.status(400).json({ error: 'Unsupported platform' });
        }

        console.log(`Downloading ${platform} video: ${url}`);

        // Track analytics
        console.log(`Analytics: Download via /download/video - ${platform} - ${url}`);

        await downloadAndStreamVideo(url, res, platform);

    } catch (error) {
        console.error('Route error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

// Route để kiểm tra trạng thái download
router.post('/status', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const platform = detectPlatform(url);
        if (!platform) {
            return res.status(400).json({ error: 'Unsupported platform' });
        }

        const cacheKey = generateCacheKey(url, platform);
        const cached = downloadCache.get(cacheKey);

        if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
            return res.json({
                status: 'ready',
                platform: platform,
                cached: true,
                videoUrl: cached.videoUrl,
                images: cached.images || [],
                title: cached.title
            });
        }

        // Kiểm tra nhanh xem video có tồn tại không
        const DATA = { errorCode: undefined, message: undefined, data: [] };

        let result;
        if (platform === 'twitter') {
            // result = await twHandler(url, DATA);
            return res.json({
                status: 'not_supported',
                platform: platform,
                message: 'Twitter module not implemented yet'
            });
        } else {
            return res.json({
                status: 'not_supported',
                platform: platform,
                message: 'Only Twitter/X URLs are supported'
            });
        }

        if (result.errorCode === 200 && result.data && result.data.length > 0) {
            const videoData = result.data[0];
            const videoUrl = videoData.medias.find(m => m.type === 'video')?.url;
            const images = videoData.medias.filter(m => m.type === 'image');

            if (videoUrl || images.length > 0) {
                return res.json({
                    status: 'available',
                    platform: platform,
                    cached: false,
                    title: videoData.title,
                    thumbnail: videoData.thumbnail,
                    hasVideo: !!videoUrl,
                    hasImages: images.length > 0,
                    imageCount: images.length,
                    downloadUrl: `/download/video?url=${url}`
                });
            }
        }

        return res.json({
            status: 'not_found',
            platform: platform,
            message: result.message || 'Video not available'
        });

    } catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({ error: 'Status check failed' });
    }
});

// Route để xóa cache
router.delete('/cache', (req, res) => {
    const { url } = req.query;

    if (url) {
        const platform = detectPlatform(url);
        if (platform) {
            const cacheKey = generateCacheKey(url, platform);
            downloadCache.delete(cacheKey);
            res.json({ message: 'Cache cleared for URL' });
        } else {
            res.status(400).json({ error: 'Invalid URL' });
        }
    } else {
        // Xóa toàn bộ cache
        downloadCache.clear();
        res.json({ message: 'All cache cleared' });
    }
});

module.exports = router;
