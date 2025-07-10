const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Create write streams for different log types
const createLogStream = (filename) => {
    const logPath = path.join(logsDir, filename);
    return fs.createWriteStream(logPath, { flags: 'a' });
};

const generalLogStream = createLogStream('general.log');
const authLogStream = createLogStream('auth.log');
const bookingsLogStream = createLogStream('bookings.log');
const treksLogStream = createLogStream('treks.log');
const usersLogStream = createLogStream('users.log');
const vendorsLogStream = createLogStream('vendors.log');
const customersLogStream = createLogStream('customers.log');

// Helper function to get log stream based on route
const getLogStream = (route) => {
    if (route.includes('/auth')) return authLogStream;
    if (route.includes('/bookings') || route.includes('/booking')) return bookingsLogStream;
    if (route.includes('/treks') || route.includes('/trek')) return treksLogStream;
    if (route.includes('/users') || route.includes('/user')) return usersLogStream;
    if (route.includes('/vendors') || route.includes('/vendor')) return vendorsLogStream;
    if (route.includes('/customers') || route.includes('/customer')) return customersLogStream;
    return generalLogStream;
};

// Helper function to format log entry
const formatLogEntry = (req, res, responseTime, statusCode, error = null) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl || req.url;
    const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const userId = req.user?.id || req.customer?.id || 'Anonymous';
    const userType = req.user ? 'user' : req.customer ? 'customer' : 'anonymous';
    
    const logData = {
        timestamp,
        method,
        url,
        ip,
        userAgent,
        userId,
        userType,
        responseTime: `${responseTime}ms`,
        statusCode,
        requestBody: req.body,
        requestHeaders: {
            'content-type': req.headers['content-type'],
            'authorization': req.headers.authorization ? 'Bearer [HIDDEN]' : undefined,
            'user-agent': userAgent
        },
        queryParams: req.query,
        params: req.params
    };

    if (error) {
        logData.error = {
            message: error.message,
            stack: error.stack
        };
    }

    return JSON.stringify(logData, null, 2);
};

// Main logging middleware
const loggingMiddleware = (req, res, next) => {
    const startTime = Date.now();
    const originalSend = res.send;
    const originalJson = res.json;
    const originalStatus = res.status;

    let statusCode = 200;
    let responseBody = null;

    // Override res.status to capture status code
    res.status = function(code) {
        statusCode = code;
        return originalStatus.apply(this, arguments);
    };

    // Override res.send to capture response body
    res.send = function(body) {
        responseBody = body;
        return originalSend.apply(this, arguments);
    };

    // Override res.json to capture response body
    res.json = function(body) {
        responseBody = JSON.stringify(body);
        return originalJson.apply(this, arguments);
    };

    // Log when response finishes
    res.on('finish', () => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        const logStream = getLogStream(req.originalUrl || req.url);
        const logEntry = formatLogEntry(req, res, responseTime, statusCode);
        
        logStream.write(logEntry + '\n');
        
        // Also log to console for development
        if (process.env.NODE_ENV === 'development') {
            console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${statusCode} (${responseTime}ms)`);
        }
    });

    // Log errors
    res.on('error', (error) => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        const logStream = getLogStream(req.originalUrl || req.url);
        const logEntry = formatLogEntry(req, res, responseTime, statusCode, error);
        
        logStream.write(logEntry + '\n');
    });

    next();
};

// Error logging middleware
const errorLoggingMiddleware = (error, req, res, next) => {
    const endTime = Date.now();
    const responseTime = endTime - (req.startTime || Date.now());
    
    const logStream = getLogStream(req.originalUrl || req.url);
    const logEntry = formatLogEntry(req, res, responseTime, res.statusCode || 500, error);
    
    logStream.write(logEntry + '\n');
    
    // Also log to console for development
    if (process.env.NODE_ENV === 'development') {
        console.error(`[ERROR] ${req.method} ${req.originalUrl} - ${error.message}`);
        console.error(error.stack);
    }
    
    next(error);
};

module.exports = {
    loggingMiddleware,
    errorLoggingMiddleware
}; 