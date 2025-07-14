const express = require("express");
const router = express.Router();

// Import v1 route modules
// Removed admin-dependent routes
const trekRoutes = require("./trekRoutes");
const couponRoutes = require("./couponRoutes");
const stateRoutes = require("./stateRoutes");
const cityRoutes = require("./cityRoutes");
const destinationRoutes = require("./destinationRoutes");

// New customer-centric routes
const customerAuthRoutes = require("./customerAuthRoutes");
const customerBookingRoutes = require("./customerBookingRoutes");
const travelerRoutes = require("./travelerRoutes");

// Mount existing routes (for mobile app)
router.use("/treks", trekRoutes);
router.use("/coupons", couponRoutes);
router.use("/states", stateRoutes);
router.use("/cities", cityRoutes);
router.use("/destinations", destinationRoutes);

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
            coupons: "/api/v1/coupons",
            states: "/api/v1/states",
            cities: "/api/v1/cities",
            destinations: "/api/v1/destinations",
        },
        authentication: {
            customer: "Phone-based OTP authentication",
        },
    });
});

module.exports = router;
