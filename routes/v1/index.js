const express = require("express");
const router = express.Router();

// Import v1 route modules
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const vendorRoutes = require("./vendorRoutes");
const trekRoutes = require("./trekRoutes");
const locationRoutes = require("./locationRoutes");
const bookingRoutes = require("./bookingRoutes");
const customerRoutes = require("./customerRoutes");

// New customer-centric routes
const customerAuthRoutes = require("./customerAuthRoutes");
const customerBookingRoutes = require("./customerBookingRoutes");
const travelerRoutes = require("./travelerRoutes");

// Mount existing routes (for admin/vendor web interface)
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/vendors", vendorRoutes);
router.use("/treks", trekRoutes);
router.use("/locations", locationRoutes);
router.use("/bookings", bookingRoutes);
router.use("/customers", customerRoutes);

// Mount new customer-centric routes (for mobile app)
router.use("/customer/auth", customerAuthRoutes);
router.use("/customer/bookings", customerBookingRoutes);
router.use("/customer/travelers", travelerRoutes);

// API version info
router.get("/", (req, res) => {
    res.json({
        version: "1.0.0",
        name: "Arobo Trekking Platform API v1 - Mobile Application API",
        description:
            "Customer-centric API for mobile booking application with phone-based authentication",
        endpoints: {
            // Customer endpoints (primary for mobile)
            customer_auth: "/api/v1/customer/auth",
            customer_bookings: "/api/v1/customer/bookings",
            travelers: "/api/v1/customer/travelers",
            public_treks: "/api/v1/treks",
            locations: "/api/v1/locations",

            // Admin/Vendor endpoints (web interface)
            admin_auth: "/api/v1/auth",
            users: "/api/v1/users",
            vendors: "/api/v1/vendors",
            admin_bookings: "/api/v1/bookings",
            admin_customers: "/api/v1/customers",
        },
        authentication: {
            customer: "Phone-based OTP authentication",
            admin: "Email/password with JWT",
        },
    });
});

module.exports = router;
