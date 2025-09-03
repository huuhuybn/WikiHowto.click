const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const archiver = require('archiver');
const router = express.Router();
const { PDFDocument } = require('pdf-lib');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

if (ffmpegPath) {
	ffmpeg.setFfmpegPath(ffmpegPath);
}

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'image/png', 'image/jpeg', 'image/gif', 'image/webp', 
            'image/tiff', 'image/svg+xml', 'image/heif', 'image/heif-sequence',
            'image/avif', 'image/vips', 'image/x-portable-pixmap'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type for ${file.originalname}. Only image files are allowed.`));
        }
    },
    limits: {
        fileSize: 16 * 1024 * 1024 // 16MB limit
    }
});

// Separate uploaders for PDF and MP4 where needed
const uploadPdf = multer({
	storage: multer.memoryStorage(),
	fileFilter: (req, file, cb) => {
		if (file.mimetype === 'application/pdf') return cb(null, true);
		cb(new Error(`Invalid file type for ${file.originalname}. Only PDF is allowed.`));
	},
	limits: { fileSize: 20 * 1024 * 1024 }
});

const uploadVideo = multer({
	storage: multer.memoryStorage(),
	fileFilter: (req, file, cb) => {
		if (file.mimetype === 'video/mp4') return cb(null, true);
		cb(new Error(`Invalid file type for ${file.originalname}. Only MP4 is allowed.`));
	},
	limits: { fileSize: 80 * 1024 * 1024 }
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Handle individual image conversion
router.post('/convert-single', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        const targetFormat = req.body.format?.toLowerCase() || 'png';
        const allowedFormats = [
            'png', 'jpg', 'jpeg', 'webp', 'gif', 'tiff', 'tif',
            'heif', 'avif', 'vips', 'v', 'raw'
        ];

        if (!allowedFormats.includes(targetFormat)) {
            return res.status(400).json({ error: 'Target format not supported' });
        }

        // Convert the image using sharp
        let sharpInstance = sharp(req.file.buffer);

        // Handle transparency for JPEG conversion
        if (targetFormat === 'jpg' || targetFormat === 'jpeg') {
            sharpInstance = sharpInstance.flatten({ background: { r: 255, g: 255, b: 255 } });
        }

        // Convert to the target format
        const convertedBuffer = await sharpInstance
            .toFormat(targetFormat)
            .toBuffer();

        // Generate output filename
        const originalName = path.parse(req.file.originalname).name;
        const outputFilename = `${originalName}.${targetFormat}`;

        // Send the converted image
        res.setHeader('Content-Type', `image/${targetFormat === 'jpg' ? 'jpeg' : targetFormat}`);
        res.setHeader('Content-Disposition', `attachment; filename="${outputFilename}"`);
        res.send(convertedBuffer);

    } catch (error) {
        console.error('Conversion error:', error);
        res.status(500).json({
            error: error.message || 'Error converting image',
            filename: req.file?.originalname
        });
    }
});

// Handle batch image conversion
router.post('/convert-batch', upload.array('files'), async (req, res) => {
    // Set a longer timeout for this route
    req.setTimeout(300000); // 5 minutes timeout

    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files provided' });
        }

        // Limit the number of files that can be processed at once
        const MAX_FILES = 50;
        if (req.files.length > MAX_FILES) {
            return res.status(400).json({
                error: `Too many files. Maximum ${MAX_FILES} files allowed per batch.`
            });
        }

        const targetFormat = req.body.format?.toLowerCase() || 'png';
        const allowedFormats = [
            'png', 'jpg', 'jpeg', 'webp', 'gif', 'tiff', 'tif',
            'heif', 'avif', 'vips', 'v', 'raw'
        ];

        if (!allowedFormats.includes(targetFormat)) {
            return res.status(400).json({ error: 'Target format not supported' });
        }

        // Create a zip archive
        const archive = archiver('zip', {
            zlib: { level: 6 }, // Reduced compression level for better performance
            store: true // Store files without compression for better performance
        });

        // Set the response headers
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename=converted_images.zip');

        // Handle archive errors
        archive.on('error', (err) => {
            if (!res.headersSent) {
                res.status(500).json({ error: 'Error creating zip archive' });
            }
        });

        // Pipe the archive to the response
        archive.pipe(res);

        // Process each file
        const results = {
            successful: [],
            failed: []
        };

        // Process files in smaller chunks to reduce memory usage
        const chunkSize = 5;
        for (let i = 0; i < req.files.length; i += chunkSize) {
            const chunk = req.files.slice(i, i + chunkSize);
            const chunkPromises = chunk.map(async (file) => {
                try {
                    // Check file size before processing
                    const maxFileSize = 10 * 1024 * 1024; // 10MB limit
                    if (file.size > maxFileSize) {
                        throw new Error(`File ${file.originalname} is too large. Maximum size is 10MB.`);
                    }

                    // Convert the image using sharp with memory optimization
                    let sharpInstance = sharp(file.buffer, {
                        limitInputPixels: 100000000, // Limit input pixels to prevent memory issues
                        sequentialRead: true // Enable sequential reading for better memory usage
                    });

                    // Handle transparency for JPEG conversion
                    if (targetFormat === 'jpg' || targetFormat === 'jpeg') {
                        sharpInstance = sharpInstance.flatten({ background: { r: 255, g: 255, b: 255 } });
                    }

                    // Convert to the target format with quality settings
                    const convertedBuffer = await sharpInstance
                        .toFormat(targetFormat, {
                            quality: 80, // Reduced quality for better performance
                            effort: 4 // Reduced effort for better performance
                        })
                        .toBuffer();

                    // Generate output filename
                    const originalName = path.parse(file.originalname).name;
                    const outputFilename = `${originalName}.${targetFormat}`;

                    // Add the converted file to the archive
                    archive.append(convertedBuffer, { name: outputFilename });
                    results.successful.push({
                        originalName: file.originalname,
                        convertedName: outputFilename
                    });

                    // Clear the buffer to free memory
                    file.buffer = null;

                } catch (error) {
                    results.failed.push({
                        filename: file.originalname,
                        error: error.message
                    });
                }
            });

            // Wait for the current chunk to complete before processing the next
            await Promise.all(chunkPromises);

            // Force garbage collection after each chunk
            if (global.gc) {
                global.gc();
            }
        }

        // Add a results summary to the archive
        const summary = {
            total: req.files.length,
            successful: results.successful,
            failed: results.failed
        };

        archive.append(JSON.stringify(summary, null, 2), { name: 'conversion_summary.json' });

        // Finalize the archive
        await archive.finalize();

    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({
                error: error.message || 'Error converting images',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }
});

// Get supported formats
router.get('/formats', (req, res) => {
    res.json({
        inputFormats: [
            { format: 'JPEG', mimeType: 'image/jpeg', extensions: ['.jpg', '.jpeg', '.jpe', '.jfif'] },
            { format: 'PNG', mimeType: 'image/png', extensions: ['.png'] },
            { format: 'WEBP', mimeType: 'image/webp', extensions: ['.webp'] },
            { format: 'TIFF', mimeType: 'image/tiff', extensions: ['.tif', '.tiff'] },
            { format: 'GIF', mimeType: 'image/gif', extensions: ['.gif'] },
            { format: 'SVG', mimeType: 'image/svg+xml', extensions: ['.svg', '.svgz'] },
            { format: 'HEIF/AVIF', mimeType: 'image/heif,image/avif', extensions: ['.heif', '.avif'] }
        ],
        outputFormats: [
            { format: 'PNG', extension: '.png', description: 'Lossless compression, supports transparency' },
            { format: 'JPEG', extension: '.jpg', description: 'Lossy compression, small file size' },
            { format: 'WEBP', extension: '.webp', description: 'Modern format, good compression' },
            { format: 'TIFF', extension: '.tiff', description: 'High quality, professional use' },
            { format: 'GIF', extension: '.gif', description: 'Supports animation and transparency' },
            { format: 'HEIF/AVIF', extension: '.avif', description: 'Modern format, excellent compression' }
        ]
    });
});

// Error handling middleware
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message || 'Internal server error' });
});

module.exports = router;

// ============== EXTRA CONVERSION ROUTES ==============

// Image -> PDF (supports any readable image; converts to PNG internally if needed)
router.post('/convert-to-pdf', upload.single('file'), async (req, res) => {
	try {
		if (!req.file) return res.status(400).json({ error: 'No file provided' });

		// Ensure we have a PNG or JPEG buffer for pdf-lib
		let imageBuffer = req.file.buffer;
		let isPngOrJpeg = req.file.mimetype === 'image/png' || req.file.mimetype === 'image/jpeg';
		if (!isPngOrJpeg) {
			imageBuffer = await sharp(req.file.buffer).png().toBuffer();
			isPngOrJpeg = true; // now PNG
		}

		// Read dimensions via sharp
		const meta = await sharp(imageBuffer).metadata();
		const width = Math.max(1, meta.width || 1000);
		const height = Math.max(1, meta.height || 1000);

		const pdfDoc = await PDFDocument.create();
		const page = pdfDoc.addPage([width, height]);
		let embedded;
		try {
			if (req.file.mimetype === 'image/jpeg') {
				embedded = await pdfDoc.embedJpg(imageBuffer);
			} else {
				// default to PNG
				embedded = await pdfDoc.embedPng(imageBuffer);
			}
		} catch (_) {
			// Fallback: embed as PNG
			embedded = await pdfDoc.embedPng(imageBuffer);
		}
		page.drawImage(embedded, { x: 0, y: 0, width, height });
		const pdfBytes = await pdfDoc.save();

		const baseName = path.parse(req.file.originalname).name;
		res.setHeader('Content-Type', 'application/pdf');
		res.setHeader('Content-Disposition', `attachment; filename="${baseName}.pdf"`);
		return res.send(Buffer.from(pdfBytes));
	} catch (error) {
		console.error('Image->PDF error:', error);
		return res.status(500).json({ error: error.message || 'Error converting image to PDF' });
	}
});

// GIF -> MP4
router.post('/convert/gif-to-mp4', upload.single('file'), async (req, res) => {
	if (!req.file) return res.status(400).json({ error: 'No file provided' });
	if (req.file.mimetype !== 'image/gif') return res.status(400).json({ error: 'Only GIF is allowed' });

	const tmpDir = path.join(uploadsDir, 'tmp');
	if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

	const inputPath = path.join(tmpDir, `${Date.now()}-input.gif`);
	const outputPath = path.join(tmpDir, `${Date.now()}-output.mp4`);

	try {
		fs.writeFileSync(inputPath, req.file.buffer);
		await new Promise((resolve, reject) => {
			ffmpeg(inputPath)
				.outputOptions([
					'-movflags +faststart',
					'-pix_fmt yuv420p',
					'-vf', 'fps=25,scale=trunc(iw/2)*2:trunc(ih/2)*2:flags=lanczos'
				])
				.videoCodec('libx264')
				.on('error', reject)
				.on('end', resolve)
				.save(outputPath);
		});

		const data = fs.readFileSync(outputPath);
		res.setHeader('Content-Type', 'video/mp4');
		res.setHeader('Content-Disposition', 'attachment; filename="converted.mp4"');
		res.send(data);
	} catch (error) {
		console.error('GIF->MP4 error:', error);
		res.status(500).json({ error: error.message || 'Error converting GIF to MP4' });
	} finally {
		try { fs.existsSync(inputPath) && fs.unlinkSync(inputPath); } catch (_) {}
		try { fs.existsSync(outputPath) && fs.unlinkSync(outputPath); } catch (_) {}
	}
});

// MP4 -> GIF
router.post('/convert/mp4-to-gif', uploadVideo.single('file'), async (req, res) => {
	if (!req.file) return res.status(400).json({ error: 'No file provided' });
	if (req.file.mimetype !== 'video/mp4') return res.status(400).json({ error: 'Only MP4 is allowed' });

	const tmpDir = path.join(uploadsDir, 'tmp');
	if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

	const inputPath = path.join(tmpDir, `${Date.now()}-input.mp4`);
	const outputPath = path.join(tmpDir, `${Date.now()}-output.gif`);

	try {
		fs.writeFileSync(inputPath, req.file.buffer);
		await new Promise((resolve, reject) => {
			ffmpeg(inputPath)
				.outputOptions([
					'-vf', 'fps=12,scale=480:-1:flags=lanczos'
				])
				.on('error', reject)
				.on('end', resolve)
				.save(outputPath);
		});

		const data = fs.readFileSync(outputPath);
		res.setHeader('Content-Type', 'image/gif');
		res.setHeader('Content-Disposition', 'attachment; filename="converted.gif"');
		res.send(data);
	} catch (error) {
		console.error('MP4->GIF error:', error);
		res.status(500).json({ error: error.message || 'Error converting MP4 to GIF' });
	} finally {
		try { fs.existsSync(inputPath) && fs.unlinkSync(inputPath); } catch (_) {}
		try { fs.existsSync(outputPath) && fs.unlinkSync(outputPath); } catch (_) {}
	}
});

// PDF -> Image (stub with guidance)
router.post('/convert/pdf-to-image', uploadPdf.single('file'), async (req, res) => {
	return res.status(501).json({
		error: 'PDF to image requires Poppler or Ghostscript installed (pdftoppm/pdftocairo).',
		install: 'macOS: brew install poppler; Ubuntu: apt-get install poppler-utils',
		usage: 'After installing, we can enable this route to return PNG/JPG.'
	});
});

