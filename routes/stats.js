const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// Route để xem thống kê (chỉ cho admin)
router.get('/', function(req, res) {
    try {
        const stats = logger.generateStats();
        res.json(stats);
    } catch (error) {
        logger.error('Error generating stats', error);
        res.status(500).json({ error: 'Failed to generate stats' });
    }
});

// Route để xem logs gần đây
router.get('/recent', function(req, res) {
    try {
        const stats = logger.generateStats();
        res.json({
            recentRequests: stats.recentRequests || [],
            totalRequests: stats.totalRequests || 0
        });
    } catch (error) {
        logger.error('Error getting recent logs', error);
        res.status(500).json({ error: 'Failed to get recent logs' });
    }
});

// Route để xem thống kê theo platform
router.get('/platforms', function(req, res) {
    try {
        const stats = logger.generateStats();
        res.json({
            platforms: stats.platforms || {},
            totalRequests: stats.totalRequests || 0
        });
    } catch (error) {
        logger.error('Error getting platform stats', error);
        res.status(500).json({ error: 'Failed to get platform stats' });
    }
});

// Route để xem thống kê theo status
router.get('/statuses', function(req, res) {
    try {
        const stats = logger.generateStats();
        res.json({
            statuses: stats.statuses || {},
            totalRequests: stats.totalRequests || 0
        });
    } catch (error) {
        logger.error('Error getting status stats', error);
        res.status(500).json({ error: 'Failed to get status stats' });
    }
});

// Route để xem thống kê theo ngôn ngữ
router.get('/languages', function(req, res) {
    try {
        const stats = logger.generateStats();
        res.json({
            languages: stats.languages || {},
            totalRequests: stats.totalRequests || 0
        });
    } catch (error) {
        logger.error('Error getting language stats', error);
        res.status(500).json({ error: 'Failed to get language stats' });
    }
});

// Route để xem danh sách errors
router.get('/errors', function(req, res) {
    try {
        const stats = logger.generateStats();
        const errorRequests = (stats.recentRequests || []).filter(req => req.status === 'error');
        
        res.json({
            totalErrors: errorRequests.length,
            errors: errorRequests,
            errorByPlatform: errorRequests.reduce((acc, req) => {
                acc[req.platform] = (acc[req.platform] || 0) + 1;
                return acc;
            }, {}),
            errorTypes: errorRequests.reduce((acc, req) => {
                const errorType = req.error || 'Unknown error';
                acc[errorType] = (acc[errorType] || 0) + 1;
                return acc;
            }, {})
        });
    } catch (error) {
        logger.error('Error getting error stats', error);
        res.status(500).json({ error: 'Failed to get error stats' });
    }
});

// Route để xóa logs cũ
router.delete('/clean', function(req, res) {
    try {
        logger.cleanOldLogs();
        res.json({ message: 'Old logs cleaned successfully' });
    } catch (error) {
        logger.error('Error cleaning old logs', error);
        res.status(500).json({ error: 'Failed to clean old logs' });
    }
});

module.exports = router; 