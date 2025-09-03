// Google Analytics Tracking for Snapsave
// Tracking ID: G-7YBY7E07EB

// Global Analytics Object
window.SnapsaveAnalytics = {
    // Initialize analytics
    init: function() {
        console.log('Analytics initialized');
        this.trackPageView();
        this.setupEventListeners();
    },

    // Track page view
    trackPageView: function() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: document.title,
                page_location: window.location.href,
                page_path: window.location.pathname
            });
        }
    },

    // Track URL submission
    trackUrlSubmission: function(url, platform) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'url_submission', {
                event_category: 'engagement',
                event_label: platform,
                custom_parameter_1: platform,
                value: 1
            });
        }
    },

    // Track download attempt
    trackDownloadAttempt: function(platform, videoUrl, quality) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'download_attempt', {
                event_category: 'download',
                event_label: platform,
                custom_parameter_1: platform,
                custom_parameter_2: 'attempt',
                custom_parameter_3: quality,
                value: 1
            });
        }
    },

    // Track successful download
    trackDownloadSuccess: function(platform, videoUrl, quality, fileSize) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'download_success', {
                event_category: 'download',
                event_label: platform,
                custom_parameter_1: platform,
                custom_parameter_2: 'success',
                custom_parameter_3: quality,
                value: fileSize || 1
            });
        }
    },

    // Track download failure
    trackDownloadFailure: function(platform, error, videoUrl) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'download_failure', {
                event_category: 'download',
                event_label: platform,
                custom_parameter_1: platform,
                custom_parameter_2: 'failure',
                custom_parameter_3: error,
                value: 1
            });
        }
    },

    // Track direct video download
    trackDirectVideoDownload: function(videoUrl, platform) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'direct_video_download', {
                event_category: 'direct_download',
                event_label: platform,
                custom_parameter_1: platform,
                custom_parameter_2: 'direct',
                value: 1
            });
        }
    },

    // Track button clicks
    trackButtonClick: function(buttonType, platform) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'button_click', {
                event_category: 'engagement',
                event_label: buttonType,
                custom_parameter_1: platform,
                value: 1
            });
        }
    },

    // Track form interactions
    trackFormInteraction: function(action, platform) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_interaction', {
                event_category: 'engagement',
                event_label: action,
                custom_parameter_1: platform,
                value: 1
            });
        }
    },

    // Track error events
    trackError: function(errorType, errorMessage, platform) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'error', {
                event_category: 'error',
                event_label: errorType,
                custom_parameter_1: platform,
                custom_parameter_2: errorMessage,
                value: 1
            });
        }
    },

    // Track user engagement
    trackEngagement: function(action, platform, duration) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'user_engagement', {
                event_category: 'engagement',
                event_label: action,
                custom_parameter_1: platform,
                value: duration || 1
            });
        }
    },

    // Track conversion (successful download completion)
    trackConversion: function(platform, videoUrl, quality) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'conversion', {
                event_category: 'conversion',
                event_label: platform,
                custom_parameter_1: platform,
                custom_parameter_2: 'completed',
                custom_parameter_3: quality,
                value: 1
            });
        }
    },

    // Track platform detection
    trackPlatformDetection: function(url, detectedPlatform) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'platform_detection', {
                event_category: 'detection',
                event_label: detectedPlatform,
                custom_parameter_1: detectedPlatform,
                value: 1
            });
        }
    },

    // Track performance metrics
    trackPerformance: function(metric, value, platform) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'performance', {
                event_category: 'performance',
                event_label: metric,
                custom_parameter_1: platform,
                value: value
            });
        }
    },

    // Setup event listeners
    setupEventListeners: function() {
        // Track form submissions
        document.addEventListener('DOMContentLoaded', function() {
            const forms = document.querySelectorAll('form');
            forms.forEach(function(form) {
                form.addEventListener('submit', function(e) {
                    const urlInput = form.querySelector('input[type="text"], input[type="url"]');
                    if (urlInput && urlInput.value) {
                        const platform = window.SnapsaveAnalytics.detectPlatform(urlInput.value);
                        window.SnapsaveAnalytics.trackUrlSubmission(urlInput.value, platform);
                    }
                });
            });

            // Track button clicks
            const buttons = document.querySelectorAll('.button');
            buttons.forEach(function(button) {
                button.addEventListener('click', function(e) {
                    const buttonText = button.textContent.trim();
                    const platform = window.SnapsaveAnalytics.getCurrentPlatform();
                    window.SnapsaveAnalytics.trackButtonClick(buttonText, platform);
                });
            });

            // Track download links
            const downloadLinks = document.querySelectorAll('a[href*="download"], .download-link');
            downloadLinks.forEach(function(link) {
                link.addEventListener('click', function(e) {
                    const platform = window.SnapsaveAnalytics.getCurrentPlatform();
                    window.SnapsaveAnalytics.trackDownloadAttempt(platform, link.href, 'unknown');
                });
            });
        });
    },

    // Detect platform from URL
    detectPlatform: function(url) {
        if (!url) return 'unknown';
        
        if (/tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com/i.test(url)) return 'tiktok';
        if (/facebook\.com|fb\.com|fb\.me|fb\.watch/i.test(url)) return 'facebook';
        if (/twitter\.com|x\.com/i.test(url)) return 'twitter';
        if (/instagram\.com|instagr\.am/i.test(url)) return 'instagram';
        if (/pinterest\.|pin\.it/i.test(url)) return 'pinterest';
        if (/youtube\.com|youtu\.be/i.test(url)) return 'youtube';
        if (/reddit\.com/i.test(url)) return 'reddit';
        if (/dailymotion\.com/i.test(url)) return 'dailymotion';
        
        return 'unknown';
    },

    // Get current platform from URL or page
    getCurrentPlatform: function() {
        const currentUrl = window.location.pathname;
        if (currentUrl.includes('/tiktok')) return 'tiktok';
        if (currentUrl.includes('/facebook')) return 'facebook';
        if (currentUrl.includes('/twitter')) return 'twitter';
        if (currentUrl.includes('/instagram')) return 'instagram';
        if (currentUrl.includes('/pinterest')) return 'pinterest';
        if (currentUrl.includes('/youtube')) return 'youtube';
        if (currentUrl.includes('/reddit')) return 'reddit';
        if (currentUrl.includes('/dailymotion')) return 'dailymotion';
        
        return 'homepage';
    },

    // Track session start
    trackSessionStart: function() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'session_start', {
                event_category: 'session',
                value: 1
            });
        }
    },

    // Track session end
    trackSessionEnd: function() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'session_end', {
                event_category: 'session',
                value: 1
            });
        }
    }
};

// Initialize analytics when page loads
document.addEventListener('DOMContentLoaded', function() {
    window.SnapsaveAnalytics.init();
    window.SnapsaveAnalytics.trackSessionStart();
});

// Track session end when user leaves
window.addEventListener('beforeunload', function() {
    window.SnapsaveAnalytics.trackSessionEnd();
});

// Track performance metrics
window.addEventListener('load', function() {
    if ('performance' in window) {
        const perfData = performance.getEntriesByType('navigation')[0];
        if (perfData) {
            const platform = window.SnapsaveAnalytics.getCurrentPlatform();
            window.SnapsaveAnalytics.trackPerformance('page_load_time', perfData.loadEventEnd - perfData.loadEventStart, platform);
            window.SnapsaveAnalytics.trackPerformance('dom_content_loaded', perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart, platform);
        }
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.SnapsaveAnalytics;
} 