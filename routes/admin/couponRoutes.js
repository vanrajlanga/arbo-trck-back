const express = require("express");
const router = express.Router();
const {
    getAllCoupons,
    getCouponById,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus,
    getCouponAnalytics,
} = require("../../controllers/couponController");
const authMiddleware = require("../../middleware/authMiddleware");

// All routes require authentication
router.use(authMiddleware);

// Coupon management routes
router.get("/", getAllCoupons);
router.get("/analytics", getCouponAnalytics);
router.get("/:id", getCouponById);
router.post("/", createCoupon);
router.put("/:id", updateCoupon);
router.delete("/:id", deleteCoupon);
router.patch("/:id/status", toggleCouponStatus);

module.exports = router;
