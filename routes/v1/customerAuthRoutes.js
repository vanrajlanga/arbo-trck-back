const express = require("express");
const router = express.Router();
const {
    requestOTP,
    verifyOTP,
    completeProfile,
    getProfile,
} = require("../../controllers/customerAuthController");
const {
    authenticateCustomer,
} = require("../../middleware/customerAuthMiddleware");

// Public routes
router.post("/request-otp", requestOTP);
router.post("/verify-otp", verifyOTP);

// Protected routes
router.put("/profile", authenticateCustomer, completeProfile);
router.get("/profile", authenticateCustomer, getProfile);

module.exports = router;
