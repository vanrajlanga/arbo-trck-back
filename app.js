const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const { sequelize } = require("./models");
const { handleSequelizeErrors } = require("./middleware/validationMiddleware");
const logger = require("./utils/logger");
require("dotenv").config();

// Initialize Firebase
const { initializeFirebase } = require("./config/firebase");
try {
    initializeFirebase();
    logger.app("info", "Firebase initialized successfully");
} catch (error) {
    logger.error("error", "Failed to initialize Firebase", {
        error: error.message,
    });
}

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
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));

// Request logging middleware
app.use(logger.logRequest.bind(logger));

// Morgan logging (HTTP requests)
app.use(
    morgan("combined", {
        stream: {
            write: (message) => {
                logger.api("info", message.trim());
            },
        },
    })
);

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
// Note: Legacy routes have been moved to organized structure
// Use /api/admin, /api/vendor, or /api/v1 endpoints instead

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
                activities: "/api/admin/activities",
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
                customer_auth: "/api/v1/customer/auth",
                customer_bookings: "/api/v1/customer/bookings",
                travelers: "/api/v1/customer/travelers",
                treks: "/api/v1/treks",
            },
            legacy: {
                description:
                    "Legacy endpoints have been moved to organized structure",
                note: "Use /api/vendor or /api/v1 endpoints instead",
            },
        },
        documentation: "https://your-docs-url.com",
    });
});

// Enhanced error handling middleware
app.use(handleSequelizeErrors);

// Error logging middleware
app.use(logger.logError.bind(logger));

// General error handling
app.use((err, req, res, next) => {
    // Log the error
    logger.error("error", "Unhandled application error", {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userId: req.user?.id,
    });

    // Handle specific error types
    if (err.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: err.errors,
        });
    }

    if (err.name === "UnauthorizedError") {
        return res.status(401).json({
            success: false,
            message: "Unauthorized access",
        });
    }

    // Default error response
    res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
        availableRoutes: ["/api/vendor", "/api/v1", "/api", "/health"],
    });
});

// Removed database synchronization here; use the standalone sync.js script instead

module.exports = app;
