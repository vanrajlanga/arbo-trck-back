const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware");

// Import admin route modules
const authRoutes = require("./authRoutes");
const activityRoutes = require("./activityRoutes");
const badgeRoutes = require("./badgeRoutes");
const cancellationPolicyRoutes = require("./cancellationPolicyRoutes");

// Mount public routes (no auth required)
router.use("/auth", authRoutes);

// Apply auth middleware to protected admin routes
router.use(authMiddleware);

// Mount protected admin routes
router.use("/activities", activityRoutes);
router.use("/badges", badgeRoutes);
router.use("/cancellation-policies", cancellationPolicyRoutes);

// Admin API info
router.get("/", (req, res) => {
    res.json({
        version: "1.0.0",
        name: "Arobo Admin Panel API",
        description: "Admin-specific endpoints for the Arobo platform",
        endpoints: {
            auth: "/api/admin/auth",
            activities: "/api/admin/activities",
            badges: "/api/admin/badges",
            cancellationPolicies: "/api/admin/cancellation-policies",
        },
        authentication: "JWT token required for all endpoints",
    });
});

module.exports = router;
