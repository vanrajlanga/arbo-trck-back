const fs = require("fs");
const path = require("path");

// Ensure logs directory exists
const logsDir = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Create a writable stream for each log file
const createLogStream = (filename) => {
    const logPath = path.join(logsDir, filename);
    return fs.createWriteStream(logPath, { flags: "a" }); // 'a' for append
};

// Get current timestamp
const getTimestamp = () => {
    return new Date().toISOString();
};

// Format log message
const formatLog = (level, message, data = null) => {
    const timestamp = getTimestamp();
    let logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    if (data) {
        if (typeof data === "object") {
            logMessage += `\nData: ${JSON.stringify(data, null, 2)}`;
        } else {
            logMessage += `\nData: ${data}`;
        }
    }

    return logMessage + "\n";
};

// Logger class
class Logger {
    constructor() {
        this.bookingLogStream = createLogStream("bookings.log");
        this.authLogStream = createLogStream("auth.log");
        this.generalLogStream = createLogStream("general.log");
    }

    // Log to booking-specific file
    logBooking(level, message, data = null) {
        const logMessage = formatLog(level, message, data);
        this.bookingLogStream.write(logMessage);
        console.log(logMessage.trim()); // Also log to console
    }

    // Log to auth-specific file
    logAuth(level, message, data = null) {
        const logMessage = formatLog(level, message, data);
        this.authLogStream.write(logMessage);
        console.log(logMessage.trim()); // Also log to console
    }

    // Log to general file
    logGeneral(level, message, data = null) {
        const logMessage = formatLog(level, message, data);
        this.generalLogStream.write(logMessage);
        console.log(logMessage.trim()); // Also log to console
    }

    // Convenience methods
    info(stream, message, data = null) {
        this[`log${stream.charAt(0).toUpperCase() + stream.slice(1)}`](
            "info",
            message,
            data
        );
    }

    error(stream, message, data = null) {
        this[`log${stream.charAt(0).toUpperCase() + stream.slice(1)}`](
            "error",
            message,
            data
        );
    }

    warn(stream, message, data = null) {
        this[`log${stream.charAt(0).toUpperCase() + stream.slice(1)}`](
            "warn",
            message,
            data
        );
    }

    debug(stream, message, data = null) {
        this[`log${stream.charAt(0).toUpperCase() + stream.slice(1)}`](
            "debug",
            message,
            data
        );
    }
}

// Create singleton instance
const logger = new Logger();

module.exports = logger;
