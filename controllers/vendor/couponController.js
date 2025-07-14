const { Coupon, CouponAssignment, User } = require("../../models");

// Get vendor coupons
const getVendorCoupons = async (req, res) => {
    try {
        const vendorId = req.user.id;

        const coupons = await Coupon.findAll({
            where: { vendorId },
            order: [["createdAt", "DESC"]],
        });

        res.json(coupons);
    } catch (error) {
        console.error("Error fetching vendor coupons:", error);
        res.status(500).json({ error: "Failed to fetch coupons" });
    }
};

// Validate coupon
const validateCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        const vendorId = req.user.id;

        if (!code) {
            return res.status(400).json({ error: "Coupon code is required" });
        }

        const coupon = await Coupon.findOne({
            where: {
                code: code.toUpperCase(),
                vendorId,
                isActive: true,
            },
        });

        if (!coupon) {
            return res.status(404).json({ error: "Invalid coupon code" });
        }

        // Check if coupon is expired
        if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
            return res.status(400).json({ error: "Coupon has expired" });
        }

        // Check usage limits
        if (coupon.maxUsage && coupon.usageCount >= coupon.maxUsage) {
            return res
                .status(400)
                .json({ error: "Coupon usage limit reached" });
        }

        res.json({
            valid: true,
            coupon: {
                id: coupon.id,
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                minAmount: coupon.minAmount,
                maxDiscount: coupon.maxDiscount,
                description: coupon.description,
            },
        });
    } catch (error) {
        console.error("Error validating coupon:", error);
        res.status(500).json({ error: "Failed to validate coupon" });
    }
};

module.exports = {
    getVendorCoupons,
    validateCoupon,
};
