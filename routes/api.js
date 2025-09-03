const express = require('express');
const router = express.Router();

// Import modules cho image converter
const multer = require('multer');
const imageHandler = require('../modules/image');
const pdfHandler = require('../modules/pdf');
const videoHandler = require('../modules/video');

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    }
});

// Test route
router.get('/test', (req, res) => {
    res.json({ message: 'API test route working!' });
});

// POST route cho image converter
router.post('/', upload.array('files', 10), async (req, res) => {
    try {
        const { type } = req.body;
        const files = req.files || [];

        if (!type) {
            return res.status(400).json({ error: 'Missing conversion type!' });
        }

        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded!' });
        }

        console.log(`Processing ${files.length} files for conversion type: ${type}`);

        // Xác định handler dựa trên type
        let handler;
        let handlerType;

        if (type.includes('jpg') || type.includes('png') || type.includes('webp') || 
            type.includes('gif') || type.includes('bmp') || type.includes('tiff') || 
            type.includes('heic') || type.includes('avif')) {
            handler = imageHandler;
            handlerType = 'image';
        } else if (type.includes('pdf')) {
            handler = pdfHandler;
            handlerType = 'pdf';
        } else if (type.includes('mp4') || type.includes('gif')) {
            handler = videoHandler;
            handlerType = 'video';
        } else {
            return res.status(400).json({ error: 'Unsupported conversion type!' });
        }

        // Xử lý từng file
        const results = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            console.log(`Processing file ${i + 1}/${files.length}: ${file.originalname}`);

            try {
                const result = await handler.convert(type, file);
                results.push({
                    originalName: file.originalname,
                    success: true,
                    data: result
                });
            } catch (error) {
                console.error(`Error processing file ${file.originalname}:`, error);
                results.push({
                    originalName: file.originalname,
                    success: false,
                    error: error.message
                });
            }
        }

        // Trả về kết quả
        return res.json({
            success: true,
            type: type,
            handlerType: handlerType,
            totalFiles: files.length,
            results: results
        });

    } catch (error) {
        console.error('Converter route error:', error);
        
        return res.status(500).json({
            error: 'Conversion failed',
            message: error.message
        });
    }
});

module.exports = router;
