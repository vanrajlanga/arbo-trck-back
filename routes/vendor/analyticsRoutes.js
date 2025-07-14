const express = require("express");
const router = express.Router();
const analyticsController = require("../../controllers/vendor/analyticsController");
const authMiddleware = require("../../middleware/authMiddleware");

// Vendor analytics routes
router.get(
    "/dashboard",
    authMiddleware,
    analyticsController.getVendorDashboard
);

router.get(
    "/bookings",
    authMiddleware,
    analyticsController.getVendorBookingAnalytics
);

router.get("/revenue", (req, res) => {
    res.json({
        message: "Vendor revenue analytics endpoint - to be implemented",
    });
});

router.get("/treks", (req, res) => {
    res.json({ message: "Vendor trek analytics endpoint - to be implemented" });
});

router.get("/customers", (req, res) => {
    res.json({
        message: "Vendor customer analytics endpoint - to be implemented",
    });
});

module.exports = router;
