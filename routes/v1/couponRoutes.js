const express = require("express");
const router = express.Router();
const couponController = require("../../controllers/v1/couponController");

// Public routes (for mobile app - no auth required)
router.get("/available", couponController.getAvailableCoupons);
router.post("/validate", couponController.validateCoupon);
router.post("/apply", couponController.applyCoupon);
router.get("/customer/:customer_id", couponController.getCustomerCoupons);

module.exports = router;
