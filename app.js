const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const { sequelize } = require("./models");
require("dotenv").config();

// Initialize Firebase
const { initializeFirebase } = require("./config/firebase");
try {
    initializeFirebase();
} catch (error) {
    console.error("Failed to initialize Firebase:", error);
}

// Test database connection
const testDatabaseConnection = async () => {
    const fs = require('fs');
    const path = require('path');
    
    // Ensure logs directory exists
    const logsDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }
    
    // Create database log stream
    const dbLogStream = fs.createWriteStream(path.join(logsDir, 'database.log'), { flags: 'a' });
    
    const logToFile = (message) => {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${message}\n`;
        dbLogStream.write(logEntry);
        console.log(message);
    };
    
    try {
        await sequelize.authenticate();
        logToFile('✅ Database connection has been established successfully.');
        
        // Test a simple query
        const result = await sequelize.query('SELECT 1 as test');
        logToFile('✅ Database query test successful: ' + JSON.stringify(result[0][0]));
        
        // Log database configuration (without sensitive data)
        logToFile('📊 Database Configuration:');
        logToFile(`   Host: ${process.env.DB_HOST}`);
        logToFile(`   Database: ${process.env.DB_NAME}`);
        logToFile(`   User: ${process.env.DB_USER}`);
        logToFile(`   NODE_ENV: ${process.env.NODE_ENV}`);
        
    } catch (error) {
        logToFile('❌ Unable to connect to the database: ' + error.message);
        logToFile('📊 Database configuration:');
        logToFile(`   Host: ${process.env.DB_HOST}`);
        logToFile(`   Database: ${process.env.DB_NAME}`);
        logToFile(`   User: ${process.env.DB_USER}`);
        logToFile(`   NODE_ENV: ${process.env.NODE_ENV}`);
        
        // Provide helpful error messages
        if (error.message.includes('No database selected')) {
            logToFile('💡 Solution: Check if the database exists and the user has access to it.');
            logToFile('💡 Try: CREATE DATABASE IF NOT EXISTS aorbo_trekking;');
        } else if (error.message.includes('Access denied')) {
            logToFile('💡 Solution: Check database username and password.');
        } else if (error.message.includes('ECONNREFUSED')) {
            logToFile('💡 Solution: Check if MySQL server is running and accessible.');
        }
        
        // Log full error details
        logToFile('🔍 Full error details:');
        logToFile(error.stack);
        
        // Exit if database connection fails in production
        if (process.env.NODE_ENV === 'production') {
            logToFile('🚨 Exiting due to database connection failure in production');
            dbLogStream.end();
            process.exit(1);
        }
    }
    
    // Close the log stream
    dbLogStream.end();
};

// Test database connection on startup
testDatabaseConnection();

// Import logging middleware
const { loggingMiddleware, errorLoggingMiddleware } = require("./middleware/loggingMiddleware");

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const trekRoutes = require("./routes/trekRoutes");
const locationRoutes = require("./routes/locationRoutes");
const bookingRoutes = require("./routes/v1/bookingRoutes");

// Import v1 routes (for mobile app)
const v1Routes = require("./routes/v1");

// Import new structured routes
const adminRoutes = require("./routes/admin");
const vendorPanelRoutes = require("./routes/vendor");

const app = express();

// CORS configuration
const corsOptions = {
    origin: true, // Allow all origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(loggingMiddleware); // Add comprehensive logging
app.use(morgan("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Static file serving for uploaded images
app.use("/storage", express.static(path.join(__dirname, "storage")));

// NEW API STRUCTURE
// Admin panel routes
app.use("/api/admin", adminRoutes);

// Vendor panel routes
app.use("/api/vendor", vendorPanelRoutes);

// Mobile app routes (v1)
app.use("/api/v1", v1Routes);

// LEGACY ROUTES (maintain backward compatibility)
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api", trekRoutes);
app.use("/api", locationRoutes);

// Health check
app.get("/health", (req, res) =>
    res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
    })
);

// API documentation endpoint
app.get("/api", (req, res) => {
    res.json({
        name: "Arobo Trekking Platform API",
        version: "1.0.0",
        description: "RESTful API for the Arobo trekking platform",
        endpoints: {
            admin: {
                base: "/api/admin",
                description: "Admin panel endpoints",
                auth: "/api/admin/auth",
                users: "/api/admin/users",
                vendors: "/api/admin/vendors",
                treks: "/api/admin/treks",
                locations: "/api/admin/locations",
                bookings: "/api/admin/bookings",
                customers: "/api/admin/customers",
                analytics: "/api/admin/analytics",
                system: "/api/admin/system",
            },
            vendor: {
                base: "/api/vendor",
                description: "Vendor panel endpoints",
                auth: "/api/vendor/auth",
                treks: "/api/vendor/treks",
                bookings: "/api/vendor/bookings",
                customers: "/api/vendor/customers",
                locations: "/api/vendor/locations",
                analytics: "/api/vendor/analytics",
            },
            v1: {
                base: "/api/v1",
                description: "Mobile app endpoints",
                auth: "/api/v1/auth",
                customer_auth: "/api/v1/customer/auth",
                customer_bookings: "/api/v1/customer/bookings",
                travelers: "/api/v1/customer/travelers",
                treks: "/api/v1/treks",
                destinations: "/api/v1/destinations",
                locations: "/api/v1/locations",
                bookings: "/api/v1/bookings",
            },
            legacy: {
                description: "Legacy endpoints (deprecated)",
                auth: "/api/auth",
                users: "/api/users",
                vendors: "/api/vendors",
                bookings: "/api/bookings",
                treks: "/api/vendor/treks, /api/admin/treks",
                locations: "/api/states, /api/cities",
            },
        },
        documentation: "https://your-docs-url.com",
    });
});

// Error handling
app.use(errorLoggingMiddleware); // Add error logging
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        message: "Internal Server Error",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found",
        availableRoutes: [
            "/api/admin",
            "/api/vendor",
            "/api/v1",
            "/api",
            "/health",
        ],
    });
});

// Removed database synchronization here; use the standalone sync.js script instead

module.exports = app;
