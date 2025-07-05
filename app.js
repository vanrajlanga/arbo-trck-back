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
    origin:
        process.env.NODE_ENV === "production"
            ? [process.env.FRONTEND_URL].filter(Boolean) // In production, only allow configured URLs
            : true, // In development, allow all origins
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
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
