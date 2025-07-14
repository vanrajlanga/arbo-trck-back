const express = require("express");
const router = express.Router();
const couponController = require("../../controllers/vendor/couponController");
const authMiddleware = require("../../middleware/authMiddleware");

// All routes require authentication
router.use(authMiddleware);

// Vendor coupon routes
router.get("/", couponController.getVendorCoupons);
router.post("/validate", couponController.validateCoupon);

module.exports = router;
