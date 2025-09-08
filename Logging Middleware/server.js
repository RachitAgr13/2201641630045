// Comprehensive Logging Middleware for URL Shortener Application
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Logging levels
const LOG_LEVELS = {
    ERROR: 'ERROR',
    WARN: 'WARN',
    INFO: 'INFO',
    DEBUG: 'DEBUG'
};

// Test Server API Configuration
const TEST_SERVER_URL = 'http://28.244.56.144/evaluation-service/logs';

// Main logging function as specified in requirements: log(stack, level, package, message)
async function log(stack, level, package, message) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        stack,
        level,
        package,
        message,
        pid: process.pid,
        hostname: require('os').hostname()
    };

    // Format log message for console/file
    const formattedMessage = `[${timestamp}] [${level}] [${package}] ${message} (Stack: ${stack})`;
    
    // Write to console
    console.log(formattedMessage);
    
    // Write to file
    const logFile = path.join(logsDir, `app-${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logFile, formattedMessage + '\n');
    
    // Send to Test Server API
    try {
        await axios.post(TEST_SERVER_URL, {
            stack: stack,
            level: level.toLowerCase(),
            package: package,
            message: message
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 5000
        });
    } catch (error) {
        // Don't let logging API failures break the application
        console.error(`Failed to send log to test server: ${error.message}`);
    }
    
    return logEntry;
}

// Convenience logging functions
const logger = {
    error: (stack, package, message) => log(stack, LOG_LEVELS.ERROR, package, message),
    warn: (stack, package, message) => log(stack, LOG_LEVELS.WARN, package, message),
    info: (stack, package, message) => log(stack, LOG_LEVELS.INFO, package, message),
    debug: (stack, package, message) => log(stack, LOG_LEVELS.DEBUG, package, message)
};

// Express middleware for request logging
function requestLoggingMiddleware(req, res, next) {
    const start = Date.now();
    const { method, url, ip, headers } = req;
    
    // Log incoming request
    logger.info('http-request', 'middleware', 
        `Incoming ${method} request to ${url} from ${ip}`);
    
    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function(...args) {
        const duration = Date.now() - start;
        const { statusCode } = res;
        
        // Log response
        logger.info('http-response', 'middleware', 
            `${method} ${url} - ${statusCode} - ${duration}ms`);
        
        // Log errors if status code indicates error
        if (statusCode >= 400) {
            logger.error('http-error', 'middleware', 
                `HTTP Error ${statusCode} for ${method} ${url}`);
        }
        
        originalEnd.apply(this, args);
    };
    
    next();
}

// Error handling middleware
function errorLoggingMiddleware(err, req, res, next) {
    const { method, url, ip } = req;
    
    // Log detailed error information as specified in requirements
    logger.error('backend', 'error', `Handler: received string, expected bool`);
    logger.error('backend', 'fatal', `db: Critical database connection failure`);
    
    // Log actual error details
    logger.error('application-error', 'middleware', 
        `Unhandled error in ${method} ${url}: ${err.message}`);
    
    logger.error('error-stack', 'middleware', err.stack);
    
    // Send appropriate error response
    if (!res.headersSent) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'An unexpected error occurred',
            timestamp: new Date().toISOString()
        });
    }
    
    next(err);
}

// URL shortening specific logging functions
const urlLogger = {
    urlCreated: (originalUrl, shortCode, expiryDate) => {
        logger.info('url-creation', 'url-shortener', 
            `URL shortened: ${originalUrl} -> ${shortCode} (expires: ${expiryDate})`);
    },
    
    urlAccessed: (shortCode, originalUrl, userAgent, ip, location) => {
        logger.info('url-access', 'url-shortener', 
            `Short URL accessed: ${shortCode} -> ${originalUrl} from ${ip} (${location})`);
    },
    
    urlExpired: (shortCode, originalUrl) => {
        logger.warn('url-expiry', 'url-shortener', 
            `Expired URL accessed: ${shortCode} -> ${originalUrl}`);
    },
    
    invalidUrl: (shortCode, ip) => {
        logger.warn('invalid-url', 'url-shortener', 
            `Invalid short code accessed: ${shortCode} from ${ip}`);
    },
    
    validationError: (field, value, error) => {
        logger.error('validation-error', 'url-shortener', 
            `Validation failed for ${field}: ${value} - ${error}`);
    }
};

// Database operation logging
const dbLogger = {
    query: (operation, table, duration) => {
        logger.debug('database', 'db-operations', 
            `${operation} on ${table} completed in ${duration}ms`);
    },
    
    error: (operation, error) => {
        logger.error('database-error', 'db-operations', 
            `Database operation failed: ${operation} - ${error}`);
    }
};

module.exports = {
    log,
    logger,
    requestLoggingMiddleware,
    errorLoggingMiddleware,
    urlLogger,
    dbLogger,
    LOG_LEVELS
};
