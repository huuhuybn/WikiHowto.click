const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logDir = './logs';
        this.ensureLogDirectory();
    }

    // Tạo thư mục logs nếu chưa có
    ensureLogDirectory() {
        try {
            if (!fs.existsSync(this.logDir)) {
                fs.mkdirSync(this.logDir, { recursive: true, mode: 0o755 });
            }
        } catch (error) {
            // Fallback: sử dụng thư mục tạm nếu không tạo được
            if (error.code === 'EACCES' || error.code === 'EPERM') {
                this.logDir = '/tmp/dotsave-logs';
                try {
                    if (!fs.existsSync(this.logDir)) {
                        fs.mkdirSync(this.logDir, { recursive: true, mode: 0o755 });
                    }
                } catch (fallbackError) {
                    console.error('Cannot create log directory:', fallbackError.message);
                    // Disable file logging, only console
                    this.logDir = null;
                }
            } else {
                console.error('Error creating log directory:', error.message);
                this.logDir = null;
            }
        }
    }

    // Ghi log với timestamp
    log(level, message, data = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            ...data
        };

        // Console output luôn luôn
        console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, data);

        // Ghi file nếu có thư mục logs
        if (this.logDir) {
            try {
                const logFile = path.join(this.logDir, `${new Date().toISOString().split('T')[0]}.log`);
                const logLine = JSON.stringify(logEntry) + '\n';
                fs.appendFileSync(logFile, logLine);
            } catch (error) {
                console.error('Error writing to log file:', error.message);
            }
        }
    }

    // Log user requests
    logUserRequest(req, status, result = {}) {
        const userData = {
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            url: req.body.url || req.query.url,
            platform: this.detectPlatform(req.body.url || req.query.url),
            status: status,
            timestamp: new Date().toISOString(),
            method: req.method,
            path: req.path,
            lang: req.body.lang || req.query.lang || 'unknown'
        };

        this.log('info', 'User Request', userData);

        // Ghi vào file riêng cho user requests
        this.logUserRequestToFile(userData);
    }

    // Ghi user request vào file riêng
    logUserRequestToFile(userData) {
        if (!this.logDir) return;
        
        try {
            const userLogFile = path.join(this.logDir, 'user-requests.log');
            const logLine = JSON.stringify(userData) + '\n';
            fs.appendFileSync(userLogFile, logLine);
        } catch (error) {
            console.error('Error writing user request log:', error.message);
        }
    }

    // Detect platform từ URL
    detectPlatform(url) {
        if (!url) return 'unknown';
        
        if (/youtube\.com|youtu\.be|youtube-nocookie\.com/i.test(url)) return 'youtube';
        if (/tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com/i.test(url)) return 'tiktok';
        if (/facebook\.com|fb\.com|fb\.me|fb\.watch/i.test(url)) return 'facebook';
        // Twitter support removed
        // if (/twitter\.com|x\.com/i.test(url)) return 'twitter';
        if (/instagram\.com|instagr\.am/i.test(url)) return 'instagram';
        if (/pinterest\.|pin\.it/i.test(url)) return 'pinterest';
        if (/reddit\.com|redd\.it|reddit\.app\.link/i.test(url)) return 'reddit';
        if (/dailymotion\.|dai\.ly/i.test(url)) return 'dailymotion';
        if (/t\.me|telegram\.me/i.test(url)) return 'telegram';
        
        return 'unknown';
    }

    // Log errors
    error(message, error = {}) {
        this.log('error', message, error);
    }

    // Log warnings
    warn(message, data = {}) {
        this.log('warn', message, data);
    }

    // Log info
    info(message, data = {}) {
        this.log('info', message, data);
    }

    // Log debug
    debug(message, data = {}) {
        this.log('debug', message, data);
    }

    // Tạo báo cáo thống kê
    generateStats() {
        if (!this.logDir) {
            return { message: 'No user requests logged yet' };
        }

        const userLogFile = path.join(this.logDir, 'user-requests.log');
        
        if (!fs.existsSync(userLogFile)) {
            return { message: 'No user requests logged yet' };
        }

        try {
            const lines = fs.readFileSync(userLogFile, 'utf8').split('\n').filter(line => line.trim());
            const requests = lines.map(line => {
                try {
                    return JSON.parse(line);
                } catch (e) {
                    return null;
                }
            }).filter(req => req);

            const stats = {
                totalRequests: requests.length,
                platforms: {},
                statuses: {},
                languages: {},
                recentRequests: requests.slice(-10).reverse()
            };

            requests.forEach(req => {
                // Platform stats
                stats.platforms[req.platform] = (stats.platforms[req.platform] || 0) + 1;
                
                // Status stats
                stats.statuses[req.status] = (stats.statuses[req.status] || 0) + 1;
                
                // Language stats
                stats.languages[req.lang] = (stats.languages[req.lang] || 0) + 1;
            });

            return stats;
        } catch (error) {
            console.error('Error generating stats:', error.message);
            return { message: 'Error reading log files' };
        }
    }

    // Xóa logs cũ (giữ lại 30 ngày)
    cleanOldLogs() {
        if (!this.logDir) {
            console.log('No log directory available');
            return;
        }

        try {
            const files = fs.readdirSync(this.logDir);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            files.forEach(file => {
                if (file.endsWith('.log')) {
                    const filePath = path.join(this.logDir, file);
                    const stats = fs.statSync(filePath);
                    
                    if (stats.mtime < thirtyDaysAgo) {
                        fs.unlinkSync(filePath);
                        console.log(`Deleted old log file: ${file}`);
                    }
                }
            });
        } catch (error) {
            console.error('Error cleaning old logs:', error.message);
        }
    }
}

module.exports = new Logger(); 