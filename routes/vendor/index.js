const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware");

// Import vendor route modules
const authRoutes = require("./authRoutes");
const trekRoutes = require("./trekRoutes");
const bookingRoutes = require("./bookingRoutes");
const customerRoutes = require("./customerRoutes");
const locationRoutes = require("./locationRoutes");
const stateRoutes = require("./stateRoutes");
const analyticsRoutes = require("./analyticsRoutes");
const destinationRoutes = require("./destinationRoutes");
const couponRoutes = require("./couponRoutes");
const activityRoutes = require("./activityRoutes");

// Mount /auth routes (public: login/register)
router.use("/auth", authRoutes);

// Apply auth middleware to all other vendor routes
router.use(authMiddleware);

// Mount protected vendor routes
router.use("/treks", trekRoutes);
router.use("/bookings", bookingRoutes);
router.use("/customers", customerRoutes);
router.use("/locations", locationRoutes);
router.use("/states", stateRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/destinations", destinationRoutes);
router.use("/coupons", couponRoutes);
router.use("/activities", activityRoutes);

// Vendor API info
router.get("/", (req, res) => {
    res.json({
        version: "1.0.0",
        name: "Arobo Vendor Panel API",
        description: "Vendor-specific endpoints for the Arobo platform",
        endpoints: {
            auth: "/api/vendor/auth",
            treks: "/api/vendor/treks",
            bookings: "/api/vendor/bookings",
            customers: "/api/vendor/customers",
            locations: "/api/vendor/locations",
            analytics: "/api/vendor/analytics",
            destinations: "/api/vendor/destinations",
        },
        authentication:
            "JWT token required for all endpoints except /auth/login and /auth/register",
    });
});

module.exports = router;
