const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Import logging middleware from same folder
const { 
    requestLoggingMiddleware, 
    errorLoggingMiddleware, 
    urlLogger, 
    logger 
} = require('./server.js');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(requestLoggingMiddleware);

// In-memory storage (in production, use a proper database)
const urlDatabase = new Map();
const clickAnalytics = new Map();

// Utility functions
function generateShortCode(customCode = null) {
    if (customCode) {
        // Validate custom code
        if (!/^[a-zA-Z0-9_-]+$/.test(customCode)) {
            throw new Error('Custom shortcode must contain only alphanumeric characters, hyphens, and underscores');
        }
        if (customCode.length < 3 || customCode.length > 20) {
            throw new Error('Custom shortcode must be between 3 and 20 characters');
        }
        if (urlDatabase.has(customCode)) {
            throw new Error('Custom shortcode already exists');
        }
        return customCode;
    }
    
    // Generate random shortcode
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Ensure uniqueness
    if (urlDatabase.has(result)) {
        return generateShortCode();
    }
    
    return result;
}

function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

function getClientIP(req) {
    return req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
}

function getCoarseLocation(ip) {
    // In production, use a proper IP geolocation service
    // For demo purposes, return mock location data
    const mockLocations = ['New York, US', 'London, UK', 'Tokyo, JP', 'Mumbai, IN', 'Sydney, AU'];
    return mockLocations[Math.floor(Math.random() * mockLocations.length)];
}

// API Routes

// Create shortened URL
app.post('/api/shorten', (req, res) => {
    try {
        const { originalUrl, customShortcode, validityPeriod } = req.body;
        const clientIP = getClientIP(req);
        
        // Validation
        if (!originalUrl) {
            urlLogger.validationError('originalUrl', originalUrl, 'Original URL is required');
            return res.status(400).json({ error: 'Original URL is required' });
        }
        
        if (!isValidUrl(originalUrl)) {
            urlLogger.validationError('originalUrl', originalUrl, 'Invalid URL format');
            return res.status(400).json({ error: 'Invalid URL format' });
        }
        
        // Check if user has exceeded concurrent URL limit (5 URLs)
        const userUrls = Array.from(urlDatabase.values()).filter(url => 
            url.createdBy === clientIP && new Date() <= url.expiryDate
        );
        if (userUrls.length >= 5) {
            urlLogger.validationError('concurrentLimit', userUrls.length, 'Maximum 5 concurrent URLs allowed');
            return res.status(429).json({ error: 'Maximum 5 concurrent shortened URLs allowed' });
        }
        
        // Generate short code
        let shortCode;
        try {
            shortCode = generateShortCode(customShortcode);
        } catch (error) {
            urlLogger.validationError('customShortcode', customShortcode, error.message);
            return res.status(400).json({ error: error.message });
        }
        
        // Calculate expiry date (default 30 minutes)
        const validityMinutes = validityPeriod || 30;
        const expiryDate = new Date(Date.now() + validityMinutes * 60 * 1000);
        
        // Store URL data
        const urlData = {
            id: uuidv4(),
            originalUrl,
            shortCode,
            createdAt: new Date(),
            expiryDate,
            createdBy: clientIP,
            isActive: true,
            validityPeriod: validityMinutes
        };
        
        urlDatabase.set(shortCode, urlData);
        clickAnalytics.set(shortCode, {
            totalClicks: 0,
            clicks: []
        });
        
        // Log URL creation
        urlLogger.urlCreated(originalUrl, shortCode, expiryDate);
        
        res.json({
            success: true,
            data: {
                originalUrl,
                shortCode,
                shortUrl: `http://localhost:${PORT}/${shortCode}`,
                expiryDate,
                validityPeriod: validityMinutes
            }
        });
        
    } catch (error) {
        logger.error('url-creation', 'api', `Error creating short URL: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all URLs for statistics
app.get('/api/urls', (req, res) => {
    try {
        const urls = Array.from(urlDatabase.values()).map(url => {
            const analytics = clickAnalytics.get(url.shortCode) || { totalClicks: 0, clicks: [] };
            return {
                ...url,
                totalClicks: analytics.totalClicks,
                isExpired: new Date() > url.expiryDate,
                clickHistory: analytics.clicks.map(click => ({
                    timestamp: click.timestamp,
                    location: click.location
                }))
            };
        });
        
        res.json({
            success: true,
            data: urls
        });
        
    } catch (error) {
        logger.error('url-retrieval', 'api', `Error retrieving URLs: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get detailed analytics for a specific URL
app.get('/api/analytics/:shortCode', (req, res) => {
    try {
        const { shortCode } = req.params;
        
        const urlData = urlDatabase.get(shortCode);
        if (!urlData) {
            return res.status(404).json({ error: 'Short URL not found' });
        }
        
        const analytics = clickAnalytics.get(shortCode) || { totalClicks: 0, clicks: [] };
        
        res.json({
            success: true,
            data: {
                ...urlData,
                totalClicks: analytics.totalClicks,
                clickHistory: analytics.clicks,
                isExpired: new Date() > urlData.expiryDate
            }
        });
        
    } catch (error) {
        logger.error('analytics-retrieval', 'api', `Error retrieving analytics: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Redirect short URL to original URL
app.get('/:shortCode', (req, res) => {
    try {
        const { shortCode } = req.params;
        const clientIP = getClientIP(req);
        const userAgent = req.get('User-Agent') || 'unknown';
        
        const urlData = urlDatabase.get(shortCode);
        
        if (!urlData) {
            urlLogger.invalidUrl(shortCode, clientIP);
            return res.status(404).json({ error: 'Short URL not found' });
        }
        
        // Check if URL has expired
        if (new Date() > urlData.expiryDate) {
            urlLogger.urlExpired(shortCode, urlData.originalUrl);
            return res.status(410).json({ 
                error: 'Short URL has expired',
                expiredAt: urlData.expiryDate
            });
        }
        
        // Record click analytics
        const analytics = clickAnalytics.get(shortCode);
        const location = getCoarseLocation(clientIP);
        
        analytics.totalClicks++;
        analytics.clicks.push({
            timestamp: new Date(),
            ip: clientIP,
            userAgent,
            location
        });
        
        // Log URL access
        urlLogger.urlAccessed(shortCode, urlData.originalUrl, userAgent, clientIP, location);
        
        // Redirect to original URL
        res.redirect(urlData.originalUrl);
        
    } catch (error) {
        logger.error('url-redirect', 'api', `Error redirecting URL: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'URL Shortener API is running',
        timestamp: new Date().toISOString(),
        totalUrls: urlDatabase.size,
        activeUrls: Array.from(urlDatabase.values()).filter(url => new Date() <= url.expiryDate).length
    });
});

// Error handling middleware
app.use(errorLoggingMiddleware);

// Start server
app.listen(PORT, () => {
    logger.info('server-startup', 'main', `URL Shortener API server running on port ${PORT}`);
    console.log(`🚀 URL Shortener API server running on http://localhost:${PORT}`);
    console.log(`📊 Health check available at http://localhost:${PORT}/api/health`);
});

module.exports = app;
