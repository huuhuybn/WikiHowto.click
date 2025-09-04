const sharp = require('sharp');
const path = require('path');

class ImageHandler {
    constructor() {
        this.supportedTypes = {
            'jpg-to-png': { input: ['image/jpeg'], output: 'image/png', extension: '.png' },
            'png-to-jpg': { input: ['image/png'], output: 'image/jpeg', extension: '.jpg' },
            'jpg-to-webp': { input: ['image/jpeg'], output: 'image/webp', extension: '.webp' },
            'png-to-webp': { input: ['image/png'], output: 'image/webp', extension: '.webp' },
            'webp-to-jpg': { input: ['image/webp'], output: 'image/jpeg', extension: '.jpg' },
            'webp-to-png': { input: ['image/webp'], output: 'image/png', extension: '.png' },
            'gif-to-png': { input: ['image/gif'], output: 'image/png', extension: '.png' },
            'png-to-gif': { input: ['image/png'], output: 'image/gif', extension: '.gif' },
            'jpg-to-gif': { input: ['image/jpeg'], output: 'image/gif', extension: '.gif' },
            'bmp-to-png': { input: ['image/bmp'], output: 'image/png', extension: '.png' },
            'tiff-to-jpg': { input: ['image/tiff'], output: 'image/jpeg', extension: '.jpg' },
            'heic-to-jpg': { input: ['image/heic'], output: 'image/jpeg', extension: '.jpg' },
            'avif-to-png': { input: ['image/avif'], output: 'image/png', extension: '.png' },
            'png-to-ico': { input: ['image/png'], output: 'image/x-icon', extension: '.ico' },
            'jpg-to-ico': { input: ['image/jpeg'], output: 'image/x-icon', extension: '.ico' },
            'svg-to-ico': { input: ['image/svg+xml'], output: 'image/x-icon', extension: '.ico' },
            'svg-to-png': { input: ['image/svg+xml'], output: 'image/png', extension: '.png' },
            'jpg-to-tiff': { input: ['image/jpeg'], output: 'image/tiff', extension: '.tiff' },
            'png-to-tiff': { input: ['image/png'], output: 'image/tiff', extension: '.tiff' },
            'jpg-to-bmp': { input: ['image/jpeg'], output: 'image/bmp', extension: '.bmp' },
            'png-to-bmp': { input: ['image/png'], output: 'image/bmp', extension: '.bmp' },
            'jpg-to-avif': { input: ['image/jpeg'], output: 'image/avif', extension: '.avif' },
            'png-to-avif': { input: ['image/png'], output: 'image/avif', extension: '.avif' },
            'webp-to-avif': { input: ['image/webp'], output: 'image/avif', extension: '.avif' },
            'bmp-to-ico': { input: ['image/bmp'], output: 'image/x-icon', extension: '.ico' },
            'tiff-to-ico': { input: ['image/tiff'], output: 'image/x-icon', extension: '.ico' },
            'webp-to-ico': { input: ['image/webp'], output: 'image/x-icon', extension: '.ico' }
        };
    }

    async convert(type, file) {
        // Debug: Kiểm tra file
        console.log('File info:', {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.buffer ? file.buffer.length : 'undefined',
            bufferExists: !!file.buffer
        });

        // Kiểm tra buffer có tồn tại không
        if (!file.buffer || file.buffer.length === 0) {
            throw new Error('Input Buffer is empty');
        }

        // Kiểm tra type có được hỗ trợ không
        if (!this.supportedTypes[type]) {
            throw new Error(`Unsupported conversion type: ${type}`);
        }

        const config = this.supportedTypes[type];
        
        // Thử phát hiện định dạng thực tế bằng sharp thay vì chỉ tin mimetype upload
        const formatToMime = {
            jpeg: 'image/jpeg',
            jpg: 'image/jpeg',
            png: 'image/png',
            webp: 'image/webp',
            gif: 'image/gif',
            tiff: 'image/tiff',
            heic: 'image/heic',
            avif: 'image/avif',
            bmp: 'image/bmp'
        };
        let detectedMime = null;
        try {
            const meta = await sharp(file.buffer).metadata();
            if (meta && meta.format && formatToMime[meta.format]) {
                detectedMime = formatToMime[meta.format];
            }
        } catch (_) {
            // ignore detection errors, will fall back to upload mimetype check
        }
        
        const isAllowed = config.input.includes(file.mimetype) || (detectedMime && config.input.includes(detectedMime));
        if (!isAllowed) {
            throw new Error(`Invalid file type. Expected: ${config.input.join(', ')}, Got: ${file.mimetype}${detectedMime ? ` (detected: ${detectedMime})` : ''}`);
        }

        try {
            let sharpInstance = sharp(file.buffer);

            // Xử lý theo từng loại conversion
            switch (type) {
                case 'jpg-to-png':
                    return await this.convertJpgToPng(sharpInstance, file);
                case 'png-to-jpg':
                    return await this.convertPngToJpg(sharpInstance, file);
                case 'jpg-to-webp':
                    return await this.convertToWebp(sharpInstance, file);
                case 'png-to-webp':
                    return await this.convertToWebp(sharpInstance, file);
                case 'webp-to-jpg':
                    return await this.convertWebpToJpg(sharpInstance, file);
                case 'webp-to-png':
                    return await this.convertWebpToPng(sharpInstance, file);
                case 'gif-to-png':
                    return await this.convertGifToPng(sharpInstance, file);
                case 'png-to-gif':
                    return await this.convertPngToGif(sharpInstance, file);
                case 'jpg-to-gif':
                    return await this.convertJpgToGif(sharpInstance, file);
                case 'bmp-to-png':
                    return await this.convertBmpToPng(sharpInstance, file);
                case 'tiff-to-jpg':
                    return await this.convertTiffToJpg(sharpInstance, file);
                case 'heic-to-jpg':
                    return await this.convertHeicToJpg(sharpInstance, file);
                case 'avif-to-png':
                    return await this.convertAvifToPng(sharpInstance, file);
                case 'png-to-ico':
                    return await this.convertToIco(sharpInstance, file);
                case 'jpg-to-ico':
                    return await this.convertToIco(sharpInstance, file);
                case 'svg-to-ico':
                    return await this.convertToIco(sharpInstance, file);
                case 'svg-to-png':
                    return await this.convertSvgToPng(sharpInstance, file);
                case 'jpg-to-tiff':
                    return await this.convertJpgToTiff(sharpInstance, file);
                case 'png-to-tiff':
                    return await this.convertPngToTiff(sharpInstance, file);
                case 'jpg-to-bmp':
                    return await this.convertJpgToBmp(sharpInstance, file);
                case 'png-to-bmp':
                    return await this.convertPngToBmp(sharpInstance, file);
                case 'jpg-to-avif':
                    return await this.convertJpgToAvif(sharpInstance, file);
                case 'png-to-avif':
                    return await this.convertPngToAvif(sharpInstance, file);
                case 'webp-to-avif':
                    return await this.convertWebpToAvif(sharpInstance, file);
                case 'bmp-to-ico':
                    return await this.convertToIco(sharpInstance, file);
                case 'tiff-to-ico':
                    return await this.convertToIco(sharpInstance, file);
                case 'webp-to-ico':
                    return await this.convertToIco(sharpInstance, file);
                default:
                    throw new Error(`Unsupported conversion: ${type}`);
            }
        } catch (error) {
            throw new Error(`Conversion failed: ${error.message}`);
        }
    }

    async convertJpgToPng(sharpInstance, file) {
        const outputBuffer = await sharpInstance
            .png({ compressionLevel: 6 })
            .toBuffer();

        const originalName = path.parse(file.originalname).name;
        return {
            buffer: outputBuffer,
            filename: `${originalName}.png`,
            mimetype: 'image/png',
            size: outputBuffer.length
        };
    }

    async convertPngToJpg(sharpInstance, file) {
        const outputBuffer = await sharpInstance
            .jpeg({ quality: 90 })
            .toBuffer();

        const originalName = path.parse(file.originalname).name;
        return {
            buffer: outputBuffer,
            filename: `${originalName}.jpg`,
            mimetype: 'image/jpeg',
            size: outputBuffer.length
        };
    }

    async convertToWebp(sharpInstance, file) {
        const outputBuffer = await sharpInstance
            .webp({ quality: 90 })
            .toBuffer();

        const originalName = path.parse(file.originalname).name;
        return {
            buffer: outputBuffer,
            filename: `${originalName}.webp`,
            mimetype: 'image/webp',
            size: outputBuffer.length
        };
    }

    async convertWebpToJpg(sharpInstance, file) {
        const outputBuffer = await sharpInstance
            .jpeg({ quality: 90 })
            .toBuffer();

        const originalName = path.parse(file.originalname).name;
        return {
            buffer: outputBuffer,
            filename: `${originalName}.jpg`,
            mimetype: 'image/jpeg',
            size: outputBuffer.length
        };
    }

    async convertWebpToPng(sharpInstance, file) {
        const outputBuffer = await sharpInstance
            .png({ compressionLevel: 6 })
            .toBuffer();

        const originalName = path.parse(file.originalname).name;
        return {
            buffer: outputBuffer,
            filename: `${originalName}.png`,
            mimetype: 'image/png',
            size: outputBuffer.length
        };
    }

    async convertGifToPng(sharpInstance, file) {
        const outputBuffer = await sharpInstance
            .png({ compressionLevel: 6 })
            .toBuffer();

        const originalName = path.parse(file.originalname).name;
        return {
            buffer: outputBuffer,
            filename: `${originalName}.png`,
            mimetype: 'image/png',
            size: outputBuffer.length
        };
    }

    async convertPngToGif(sharpInstance, file) {
        const outputBuffer = await sharpInstance
            .gif()
            .toBuffer();

        const originalName = path.parse(file.originalname).name;
        return {
            buffer: outputBuffer,
            filename: `${originalName}.gif`,
            mimetype: 'image/gif',
            size: outputBuffer.length
        };
    }

    async convertJpgToGif(sharpInstance, file) {
        const outputBuffer = await sharpInstance
            .gif()
            .toBuffer();

        const originalName = path.parse(file.originalname).name;
        return {
            buffer: outputBuffer,
            filename: `${originalName}.gif`,
            mimetype: 'image/gif',
            size: outputBuffer.length
        };
    }

    async convertBmpToPng(sharpInstance, file) {
        const outputBuffer = await sharpInstance
            .png({ compressionLevel: 6 })
            .toBuffer();

        const originalName = path.parse(file.originalname).name;
        return {
            buffer: outputBuffer,
            filename: `${originalName}.png`,
            mimetype: 'image/png',
            size: outputBuffer.length
        };
    }

    async convertTiffToJpg(sharpInstance, file) {
        const outputBuffer = await sharpInstance
            .jpeg({ quality: 90 })
            .toBuffer();

        const originalName = path.parse(file.originalname).name;
        return {
            buffer: outputBuffer,
            filename: `${originalName}.jpg`,
            mimetype: 'image/jpeg',
            size: outputBuffer.length
        };
    }

    async convertHeicToJpg(sharpInstance, file) {
        const outputBuffer = await sharpInstance
            .jpeg({ quality: 90 })
            .toBuffer();

        const originalName = path.parse(file.originalname).name;
        return {
            buffer: outputBuffer,
            filename: `${originalName}.jpg`,
            mimetype: 'image/jpeg',
            size: outputBuffer.length
        };
    }

    async convertAvifToPng(sharpInstance, file) {
        const outputBuffer = await sharpInstance
            .png({ compressionLevel: 6 })
            .toBuffer();

        const originalName = path.parse(file.originalname).name;
        return {
            buffer: outputBuffer,
            filename: `${originalName}.png`,
            mimetype: 'image/png',
            size: outputBuffer.length
        };
    }

    async convertToIco(sharpInstance, file) {
        // ICO files typically contain multiple sizes (16x16, 32x32, 48x48, 64x64, 128x128, 256x256)
        const sizes = [16, 32, 48, 64, 128, 256];
        const originalName = path.parse(file.originalname).name;
        
        // Create multiple PNG buffers for different sizes
        const pngBuffers = [];
        for (const size of sizes) {
            try {
                const pngBuffer = await sharpInstance
                    .clone()
                    .resize(size, size, { fit: 'inside', withoutEnlargement: true })
                    .png({ compressionLevel: 6 })
                    .toBuffer();
                pngBuffers.push({ size, buffer: pngBuffer });
            } catch (error) {
                console.warn(`Failed to create ${size}x${size} icon:`, error.message);
            }
        }

        if (pngBuffers.length === 0) {
            throw new Error('Failed to create any icon sizes');
        }

        // Create ICO file with proper header
        const icoBuffer = this.createIcoFile(pngBuffers);
        
        return {
            buffer: icoBuffer,
            filename: `${originalName}.ico`,
            mimetype: 'image/x-icon',
            size: icoBuffer.length
        };
    }

    createIcoFile(pngBuffers) {
        // ICO file structure:
        // Header (6 bytes) + Directory entries (16 bytes each) + Image data
        
        const numImages = pngBuffers.length;
        const headerSize = 6;
        const directorySize = numImages * 16;
        const headerAndDirectorySize = headerSize + directorySize;
        
        // Calculate total size
        let totalSize = headerAndDirectorySize;
        for (const png of pngBuffers) {
            totalSize += png.buffer.length;
        }
        
        const icoBuffer = Buffer.alloc(totalSize);
        let offset = 0;
        
        // Write ICO header
        icoBuffer.writeUInt16LE(0, offset); // Reserved (must be 0)
        offset += 2;
        icoBuffer.writeUInt16LE(1, offset); // Type (1 = ICO)
        offset += 2;
        icoBuffer.writeUInt16LE(numImages, offset); // Number of images
        offset += 2;
        
        // Write directory entries
        let imageDataOffset = headerAndDirectorySize;
        for (const png of pngBuffers) {
            // Width (0 = 256)
            icoBuffer.writeUInt8(png.size === 256 ? 0 : png.size, offset);
            offset += 1;
            // Height (0 = 256)
            icoBuffer.writeUInt8(png.size === 256 ? 0 : png.size, offset);
            offset += 1;
            // Color palette (0 = no palette)
            icoBuffer.writeUInt8(0, offset);
            offset += 1;
            // Reserved (must be 0)
            icoBuffer.writeUInt8(0, offset);
            offset += 1;
            // Color planes (0 or 1)
            icoBuffer.writeUInt16LE(0, offset);
            offset += 2;
            // Bits per pixel (32 for RGBA)
            icoBuffer.writeUInt16LE(32, offset);
            offset += 2;
            // Size of image data
            icoBuffer.writeUInt32LE(png.buffer.length, offset);
            offset += 4;
            // Offset to image data
            icoBuffer.writeUInt32LE(imageDataOffset, offset);
            offset += 4;
            
            imageDataOffset += png.buffer.length;
        }
        
        // Write image data
        for (const png of pngBuffers) {
            png.buffer.copy(icoBuffer, offset);
            offset += png.buffer.length;
        }
        
        return icoBuffer;
    }

    async convertSvgToPng(sharpInstance, file) {
        const outputBuffer = await sharpInstance
            .png({ compressionLevel: 6 })
            .toBuffer();

        const originalName = path.parse(file.originalname).name;
        return {
            buffer: outputBuffer,
            filename: `${originalName}.png`,
            mimetype: 'image/png',
            size: outputBuffer.length
        };
    }

    async convertJpgToTiff(sharpInstance, file) {
        const outputBuffer = await sharpInstance
            .tiff({ compression: 'lzw' })
            .toBuffer();

        const originalName = path.parse(file.originalname).name;
        return {
            buffer: outputBuffer,
            filename: `${originalName}.tiff`,
            mimetype: 'image/tiff',
            size: outputBuffer.length
        };
    }

    async convertPngToTiff(sharpInstance, file) {
        const outputBuffer = await sharpInstance
            .tiff({ compression: 'lzw' })
            .toBuffer();

        const originalName = path.parse(file.originalname).name;
        return {
            buffer: outputBuffer,
            filename: `${originalName}.tiff`,
            mimetype: 'image/tiff',
            size: outputBuffer.length
        };
    }

    async convertJpgToBmp(sharpInstance, file) {
        const outputBuffer = await sharpInstance
            .bmp()
            .toBuffer();

        const originalName = path.parse(file.originalname).name;
        return {
            buffer: outputBuffer,
            filename: `${originalName}.bmp`,
            mimetype: 'image/bmp',
            size: outputBuffer.length
        };
    }

    async convertPngToBmp(sharpInstance, file) {
        const outputBuffer = await sharpInstance
            .bmp()
            .toBuffer();

        const originalName = path.parse(file.originalname).name;
        return {
            buffer: outputBuffer,
            filename: `${originalName}.bmp`,
            mimetype: 'image/bmp',
            size: outputBuffer.length
        };
    }

    async convertJpgToAvif(sharpInstance, file) {
        const outputBuffer = await sharpInstance
            .avif({ quality: 80 })
            .toBuffer();

        const originalName = path.parse(file.originalname).name;
        return {
            buffer: outputBuffer,
            filename: `${originalName}.avif`,
            mimetype: 'image/avif',
            size: outputBuffer.length
        };
    }

    async convertPngToAvif(sharpInstance, file) {
        const outputBuffer = await sharpInstance
            .avif({ quality: 80 })
            .toBuffer();

        const originalName = path.parse(file.originalname).name;
        return {
            buffer: outputBuffer,
            filename: `${originalName}.avif`,
            mimetype: 'image/avif',
            size: outputBuffer.length
        };
    }

    async convertWebpToAvif(sharpInstance, file) {
        const outputBuffer = await sharpInstance
            .avif({ quality: 80 })
            .toBuffer();

        const originalName = path.parse(file.originalname).name;
        return {
            buffer: outputBuffer,
            filename: `${originalName}.avif`,
            mimetype: 'image/avif',
            size: outputBuffer.length
        };
    }

    getSupportedTypes() {
        return Object.keys(this.supportedTypes);
    }
}

module.exports = new ImageHandler();
