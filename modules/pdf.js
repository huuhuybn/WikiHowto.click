const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const sharp = require('sharp');
const path = require('path');

class PdfHandler {
    constructor() {
        this.supportedTypes = {
            'image-to-pdf': { input: ['image/jpeg', 'image/png'], output: 'application/pdf', extension: '.pdf' },
            'jpg-to-pdf': { input: ['image/jpeg', 'image/jpg'], output: 'application/pdf', extension: '.pdf' },
            'png-to-pdf': { input: ['image/png'], output: 'application/pdf', extension: '.pdf' },
            'merge-jpg-to-pdf': { input: ['image/jpeg', 'image/jpg'], output: 'application/pdf', extension: '.pdf' },
            'combine-png-to-pdf': { input: ['image/png'], output: 'application/pdf', extension: '.pdf' },
            'pdf-to-jpg': { input: ['application/pdf'], output: 'image/jpeg', extension: '.jpg' },
            'pdf-to-png': { input: ['application/pdf'], output: 'image/png', extension: '.png' }
        };
    }

    async convert(type, file) {
        // Kiểm tra type có được hỗ trợ không
        if (!this.supportedTypes[type]) {
            throw new Error(`Unsupported conversion type: ${type}`);
        }

        const config = this.supportedTypes[type];
        
        // Kiểm tra file type có phù hợp không
        if (!config.input.includes(file.mimetype)) {
            throw new Error(`Invalid file type. Expected: ${config.input.join(', ')}, Got: ${file.mimetype}`);
        }

        try {
            switch (type) {
                case 'image-to-pdf':
                case 'jpg-to-pdf':
                case 'png-to-pdf':
                    return await this.convertImageToPdf(file);
                case 'pdf-to-png':
                    return await this.convertPdfToPng(file);
                case 'pdf-to-jpg':
                    return await this.convertPdfToJpg(file);
                default:
                    throw new Error(`Unsupported conversion: ${type}`);
            }
        } catch (error) {
            throw new Error(`PDF conversion failed: ${error.message}`);
        }
    }

    async convertImageToPdf(file) {
        try {
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage();

            let embeddedImage;
            if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
                embeddedImage = await pdfDoc.embedJpg(file.buffer);
            } else if (file.mimetype === 'image/png') {
                embeddedImage = await pdfDoc.embedPng(file.buffer);
            } else {
                throw new Error('Unsupported image type for PDF conversion. Only JPEG and PNG are supported.');
            }

            const { width, height } = embeddedImage.scaleToFit(page.getWidth(), page.getHeight());
            page.drawImage(embeddedImage, {
                x: page.getWidth() / 2 - width / 2,
                y: page.getHeight() / 2 - height / 2,
                width,
                height,
            });

            const pdfBytes = await pdfDoc.save();
            const originalName = path.parse(file.originalname).name;

            return {
                buffer: Buffer.from(pdfBytes),
                filename: `${originalName}.pdf`,
                mimetype: 'application/pdf',
                size: pdfBytes.length
            };
        } catch (error) {
            throw new Error(`Image to PDF conversion failed: ${error.message}`);
        }
    }

    async convertPdfToJpg(file) {
        // Note: PDF to image conversion requires external tools like Poppler or Ghostscript
        // For now, return a placeholder response
        throw new Error('PDF to image conversion requires external tools like Poppler or Ghostscript. This feature is not yet implemented.');
    }

    async convertPdfToPng(file) {
        // Như trên, chuyển PDF sang PNG cần công cụ ngoài (Poppler/Ghostscript)
        throw new Error('PDF to PNG conversion requires external tools like Poppler or Ghostscript. This feature is not yet implemented.');
    }

    async mergeImagesToPdf(type, files) {
        // Validate type
        if (!['merge-jpg-to-pdf', 'combine-png-to-pdf'].includes(type)) {
            throw new Error(`Unsupported merge type: ${type}`);
        }

        // Validate mimetypes
        const allowed = this.supportedTypes[type].input;
        for (const file of files) {
            if (!allowed.includes(file.mimetype)) {
                throw new Error(`Invalid file type in batch. Expected: ${allowed.join(', ')}, Got: ${file.mimetype}`);
            }
        }

        // Create single multi-page PDF
        const pdfDoc = await PDFDocument.create();

        // Page setup (A4 in points)
        const A4_WIDTH = 595.28; // 210mm
        const A4_HEIGHT = 841.89; // 297mm
        const MARGIN = 36; // 0.5 inch
        const MAX_W = A4_WIDTH - MARGIN * 2;
        const MAX_H = A4_HEIGHT - MARGIN * 2;

        for (const file of files) {
            const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);

            let embeddedImage;
            if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
                embeddedImage = await pdfDoc.embedJpg(file.buffer);
            } else if (file.mimetype === 'image/png') {
                embeddedImage = await pdfDoc.embedPng(file.buffer);
            } else {
                throw new Error(`Unsupported image type in batch: ${file.mimetype}`);
            }

            const imgDims = embeddedImage.scale(1);
            const scale = Math.min(MAX_W / imgDims.width, MAX_H / imgDims.height, 1);
            const drawW = imgDims.width * scale;
            const drawH = imgDims.height * scale;

            const x = (A4_WIDTH - drawW) / 2;
            const y = (A4_HEIGHT - drawH) / 2;

            page.drawImage(embeddedImage, { x, y, width: drawW, height: drawH });
        }

        const pdfBytes = await pdfDoc.save();
        return {
            buffer: Buffer.from(pdfBytes),
            filename: `merged.pdf`,
            mimetype: 'application/pdf',
            size: pdfBytes.length
        };
    }

    getSupportedTypes() {
        return Object.keys(this.supportedTypes);
    }
}

module.exports = new PdfHandler();
