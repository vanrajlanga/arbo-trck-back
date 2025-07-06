const express = require("express");
const router = express.Router();
const {
    getVendorCoupons,
    validateCoupon,
} = require("../../controllers/couponController");
const authMiddleware = require("../../middleware/authMiddleware");

// All routes require authentication
router.use(authMiddleware);

// Vendor coupon routes
router.get("/", getVendorCoupons);
router.post("/validate", validateCoupon);

module.exports = router;
