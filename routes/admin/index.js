const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware");

// Import admin route modules
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const vendorRoutes = require("./vendorRoutes");
const trekRoutes = require("./trekRoutes");
const locationRoutes = require("./locationRoutes");
const bookingRoutes = require("./bookingRoutes");
const customerRoutes = require("./customerRoutes");
const analyticsRoutes = require("./analyticsRoutes");
const systemRoutes = require("./systemRoutes");
const couponRoutes = require("./couponRoutes");

// Apply auth middleware to all admin routes
router.use(authMiddleware);

// Mount admin routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/vendors", vendorRoutes);
router.use("/treks", trekRoutes);
router.use("/locations", locationRoutes);
router.use("/bookings", bookingRoutes);
router.use("/customers", customerRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/system", systemRoutes);
router.use("/coupons", couponRoutes);

// Admin API info
router.get("/", (req, res) => {
    res.json({
        version: "1.0.0",
        name: "Arobo Admin Panel API",
        description: "Administrative endpoints for the Arobo platform",
        endpoints: {
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
        authentication: "JWT token required for all endpoints",
    });
});

module.exports = router;
