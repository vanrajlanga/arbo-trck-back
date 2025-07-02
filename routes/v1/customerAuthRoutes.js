const express = require("express");
const router = express.Router();
const {
    firebaseVerify,
    updateProfile,
    getProfile,
} = require("../../controllers/customerAuthController");
const {
    authenticateCustomer,
} = require("../../middleware/customerAuthMiddleware");

// Public routes
router.post("/firebase-verify", firebaseVerify);

// Protected routes
router.put("/profile", authenticateCustomer, updateProfile);
router.get("/profile", authenticateCustomer, getProfile);

module.exports = router;
