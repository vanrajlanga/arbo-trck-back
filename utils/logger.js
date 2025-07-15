const fs = require("fs");
const path = require("path");
const winston = require("winston");

// Ensure logs directory exists
const logsDir = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for logs with timestamp
const logFormat = winston.format.combine(
    winston.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
        let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;

        if (Object.keys(meta).length > 0) {
            log += `\nMetadata: ${JSON.stringify(meta, null, 2)}`;
        }

        if (stack) {
            log += `\nStack: ${stack}`;
        }

        return log;
    })
);

// Console format for development
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({
        format: "HH:mm:ss",
    }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let log = `${timestamp} [${level}]: ${message}`;

        if (Object.keys(meta).length > 0) {
            log += `\n${JSON.stringify(meta, null, 2)}`;
        }

        return log;
    })
);

// Create different loggers for different purposes
const createLogger = (category) => {
    const transports = [
        // Console transport for development
        new winston.transports.Console({
            format: consoleFormat,
            level: process.env.NODE_ENV === "production" ? "info" : "debug",
        }),

        // Simple file transport for general logs (appends to same file)
        new winston.transports.File({
            filename: path.join(logsDir, `${category}.log`),
            level: "info",
            maxsize: 20 * 1024 * 1024, // 20MB
            maxFiles: 5,
        }),

        // Simple file transport for error logs (appends to same file)
        new winston.transports.File({
            filename: path.join(logsDir, `${category}-error.log`),
            level: "error",
            maxsize: 20 * 1024 * 1024, // 20MB
            maxFiles: 5,
        }),

        // Simple file transport for debug logs (development only)
        ...(process.env.NODE_ENV !== "production"
            ? [
                  new winston.transports.File({
                      filename: path.join(logsDir, `${category}-debug.log`),
                      level: "debug",
                      maxsize: 20 * 1024 * 1024, // 20MB
                      maxFiles: 3,
                  }),
              ]
            : []),
    ];

    return winston.createLogger({
        format: logFormat,
        transports,
        exitOnError: false,
    });
};

// Create specific loggers
const loggers = {
    app: createLogger("app"),
    api: createLogger("api"),
    auth: createLogger("auth"),
    booking: createLogger("booking"),
    trek: createLogger("trek"),
    vendor: createLogger("vendor"),
    admin: createLogger("admin"),
    database: createLogger("database"),
    payment: createLogger("payment"),
    email: createLogger("email"),
    error: createLogger("error"),
};

// Enhanced Logger class with additional features
class Logger {
    constructor() {
        this.loggers = loggers;
    }

    // Generic logging method
    log(category, level, message, meta = {}) {
        const logger = this.loggers[category] || this.loggers.app;

        // Add request context if available
        if (global.currentRequest) {
            meta.requestId = global.currentRequest.id;
            meta.userId = global.currentRequest.user?.id;
            meta.ip = global.currentRequest.ip;
            meta.userAgent = global.currentRequest.get("User-Agent");
        }

        logger.log(level, message, meta);
    }

    // App-level logging
    app(level, message, meta = {}) {
        this.log("app", level, message, meta);
    }

    // API request/response logging
    api(level, message, meta = {}) {
        this.log("api", level, message, meta);
    }

    // Authentication logging
    auth(level, message, meta = {}) {
        this.log("auth", level, message, meta);
    }

    // Booking-related logging
    booking(level, message, meta = {}) {
        this.log("booking", level, message, meta);
    }

    // Trek-related logging
    trek(level, message, meta = {}) {
        this.log("trek", level, message, meta);
    }

    // Vendor-related logging
    vendor(level, message, meta = {}) {
        this.log("vendor", level, message, meta);
    }

    // Admin-related logging
    admin(level, message, meta = {}) {
        this.log("admin", level, message, meta);
    }

    // Database logging
    database(level, message, meta = {}) {
        this.log("database", level, message, meta);
    }

    // Payment logging
    payment(level, message, meta = {}) {
        this.log("payment", level, message, meta);
    }

    // Email logging
    email(level, message, meta = {}) {
        this.log("email", level, message, meta);
    }

    // Error logging
    error(level, message, meta = {}) {
        this.log("error", level, message, meta);
    }

    // Convenience methods for each level
    info(category, message, meta = {}) {
        this.log(category, "info", message, meta);
    }

    error(category, message, meta = {}) {
        this.log(category, "error", message, meta);
    }

    warn(category, message, meta = {}) {
        this.log(category, "warn", message, meta);
    }

    debug(category, message, meta = {}) {
        this.log(category, "debug", message, meta);
    }

    // Request logging middleware
    logRequest(req, res, next) {
        const startTime = Date.now();

        // Store request context globally
        global.currentRequest = {
            id:
                req.headers["x-request-id"] ||
                `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            user: req.user,
            ip: req.ip,
            method: req.method,
            url: req.url,
            startTime,
        };

        // Log request start
        this.api("info", `Request started: ${req.method} ${req.url}`, {
            requestId: global.currentRequest.id,
            method: req.method,
            url: req.url,
            ip: req.ip,
            userAgent: req.get("User-Agent"),
            userId: req.user?.id,
            body: req.method !== "GET" ? req.body : undefined,
            query: req.query,
            params: req.params,
        });

        // Override res.end to log response
        const originalEnd = res.end;
        res.end = function (chunk, encoding) {
            const duration = Date.now() - startTime;

            // Log response
            logger.api("info", `Request completed: ${req.method} ${req.url}`, {
                requestId: global.currentRequest.id,
                statusCode: res.statusCode,
                duration: `${duration}ms`,
                contentLength: res.get("Content-Length"),
            });

            // Clear global request context
            global.currentRequest = null;

            originalEnd.call(this, chunk, encoding);
        };

        next();
    }

    // Error logging middleware
    logError(err, req, res, next) {
        this.error("error", "Unhandled error occurred", {
            error: err.message,
            stack: err.stack,
            requestId: global.currentRequest?.id,
            method: req.method,
            url: req.url,
            ip: req.ip,
            userId: req.user?.id,
        });

        next(err);
    }

    // Database query logging
    logQuery(sql, duration, meta = {}) {
        this.database("debug", "Database query executed", {
            sql,
            duration: `${duration}ms`,
            ...meta,
        });
    }

    // Performance logging
    logPerformance(operation, duration, meta = {}) {
        this.app("info", `Performance: ${operation}`, {
            duration: `${duration}ms`,
            ...meta,
        });
    }
}

// Create singleton instance
const logger = new Logger();

module.exports = logger;
