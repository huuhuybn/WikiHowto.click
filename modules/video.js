const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic);

class VideoHandler {
    constructor() {
        this.supportedTypes = {
            'gif-to-mp4': { input: ['image/gif'], output: 'video/mp4', extension: '.mp4' },
            'mp4-to-gif': { input: ['video/mp4'], output: 'image/gif', extension: '.gif' }
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
                case 'gif-to-mp4':
                    return await this.convertGifToMp4(file);
                case 'mp4-to-gif':
                    return await this.convertMp4ToGif(file);
                default:
                    throw new Error(`Unsupported conversion: ${type}`);
            }
        } catch (error) {
            throw new Error(`Video conversion failed: ${error.message}`);
        }
    }

    async convertGifToMp4(file) {
        const inputPath = `/tmp/input_${Date.now()}.gif`;
        const outputPath = `/tmp/output_${Date.now()}.mp4`;

        try {
            // Write input file
            await writeFile(inputPath, file.buffer);

            // Convert using FFmpeg
            await new Promise((resolve, reject) => {
                ffmpeg()
                    .input(inputPath)
                    .inputFormat('gif')
                    .outputOptions([
                        '-movflags', 'frag_keyframe+empty_moov',
                        '-pix_fmt', 'yuv420p',
                        '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2' // Ensure even dimensions for MP4 compatibility
                    ])
                    .toFormat('mp4')
                    .on('end', () => resolve())
                    .on('error', (err) => reject(new Error(`FFmpeg error: ${err.message}`)))
                    .save(outputPath);
            });

            // Read output file
            const outputBuffer = fs.readFileSync(outputPath);
            const originalName = path.parse(file.originalname).name;

            return {
                buffer: outputBuffer,
                filename: `${originalName}.mp4`,
                mimetype: 'video/mp4',
                size: outputBuffer.length
            };

        } catch (error) {
            throw new Error(`GIF to MP4 conversion failed: ${error.message}`);
        } finally {
            // Clean up temporary files
            try {
                if (fs.existsSync(inputPath)) await unlink(inputPath);
                if (fs.existsSync(outputPath)) await unlink(outputPath);
            } catch (cleanupError) {
                console.error('Error cleaning up temporary files:', cleanupError);
            }
        }
    }

    async convertMp4ToGif(file) {
        const inputPath = `/tmp/input_${Date.now()}.mp4`;
        const outputPath = `/tmp/output_${Date.now()}.gif`;

        try {
            // Write input file
            await writeFile(inputPath, file.buffer);

            // Convert using FFmpeg
            await new Promise((resolve, reject) => {
                ffmpeg()
                    .input(inputPath)
                    .inputFormat('mp4')
                    .outputOptions([
                        '-vf', 'fps=10,scale=320:-1:flags=lanczos', // Adjust FPS and scale for GIF
                        '-loop', '0' // Loop indefinitely
                    ])
                    .toFormat('gif')
                    .on('end', () => resolve())
                    .on('error', (err) => reject(new Error(`FFmpeg error: ${err.message}`)))
                    .save(outputPath);
            });

            // Read output file
            const outputBuffer = fs.readFileSync(outputPath);
            const originalName = path.parse(file.originalname).name;

            return {
                buffer: outputBuffer,
                filename: `${originalName}.gif`,
                mimetype: 'image/gif',
                size: outputBuffer.length
            };

        } catch (error) {
            throw new Error(`MP4 to GIF conversion failed: ${error.message}`);
        } finally {
            // Clean up temporary files
            try {
                if (fs.existsSync(inputPath)) await unlink(inputPath);
                if (fs.existsSync(outputPath)) await unlink(outputPath);
            } catch (cleanupError) {
                console.error('Error cleaning up temporary files:', cleanupError);
            }
        }
    }

    getSupportedTypes() {
        return Object.keys(this.supportedTypes);
    }
}

module.exports = new VideoHandler();



