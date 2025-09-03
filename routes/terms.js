const express = require('express');
const router = express.Router();

router.get('/', function(req, res) {
    res.render('terms', {
        title: 'Terms of Service - DotSave',
        description: 'Terms of Service for DotSave video downloader. Read our terms and conditions for using our service.',
        currentPage: 'terms'
    });
});

module.exports = router; 