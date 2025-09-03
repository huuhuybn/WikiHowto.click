const express = require('express');
const router = express.Router();

router.get('/', function(req, res) {
    res.render('privacy', {
        title: 'Privacy Policy - DotSave',
        description: 'Privacy Policy for DotSave video downloader. Learn how we protect your privacy and handle your data.',
        currentPage: 'privacy'
    });
});

module.exports = router; 