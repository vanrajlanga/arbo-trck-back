const express = require("express");
const router = express.Router();
const { Coupon } = require("../../models");
const { Op } = require("sequelize");

// Public coupon listing for mobile app
const getPublicCoupons = async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;

        const coupons = await Coupon.findAll({
            where: {
                status: "active",
                valid_from: { [Op.lte]: new Date() },
                valid_until: { [Op.gte]: new Date() },
            },
            order: [["created_at", "DESC"]],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        // Transform the data for mobile app consumption
        const transformedCoupons = coupons.map((coupon) => ({
            id: coupon.id,
            code: coupon.code,
            description: coupon.description || "",
            discount_type: coupon.discount_type,
            discount_value: parseFloat(coupon.discount_value),
            min_order_amount: parseFloat(coupon.min_amount || 0),
            max_discount_amount: coupon.max_discount_amount
                ? parseFloat(coupon.max_discount_amount)
                : null,
            usage_limit: coupon.max_uses,
            used_count: coupon.current_uses,
            valid_from: coupon.valid_from,
            valid_until: coupon.valid_until,
            is_active: coupon.status === "active",
            status: coupon.status,
            created_at: coupon.created_at,
            updated_at: coupon.updated_at,
        }));

        const total = await Coupon.count({
            where: {
                status: "active",
                valid_from: { [Op.lte]: new Date() },
                valid_until: { [Op.gte]: new Date() },
            },
        });

        res.json({
            success: true,
            data: transformedCoupons,
            pagination: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: parseInt(offset) + parseInt(limit) < total,
            },
        });
    } catch (error) {
        console.error("Error fetching public coupons:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch coupons",
            error: error.message,
        });
    }
};

// Public coupon validation for mobile app
const validatePublicCoupon = async (req, res) => {
    try {
        const { code, amount } = req.body;

        if (!code || !amount) {
            return res.status(400).json({
                success: false,
                message: "Coupon code and amount are required",
            });
        }

        const coupon = await Coupon.findOne({
            where: {
                code: code.toUpperCase(),
                status: "active",
                valid_from: { [Op.lte]: new Date() },
                valid_until: { [Op.gte]: new Date() },
            },
        });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "Invalid or expired coupon code",
            });
        }

        // Check minimum order amount
        if (coupon.min_amount && amount < coupon.min_amount) {
            return res.status(400).json({
                success: false,
                message: `Minimum order amount of ₹${coupon.min_amount} required`,
            });
        }

        // Check usage limit
        if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
            return res.status(400).json({
                success: false,
                message: "Coupon usage limit reached",
            });
        }

        // Calculate discount
        let discountAmount = 0;
        if (coupon.discount_type === "percentage") {
            discountAmount = (amount * coupon.discount_value) / 100;
            if (coupon.max_discount_amount) {
                discountAmount = Math.min(
                    discountAmount,
                    coupon.max_discount_amount
                );
            }
        } else {
            discountAmount = coupon.discount_value;
        }

        const finalAmount = Math.max(0, amount - discountAmount);

        res.json({
            success: true,
            data: {
                coupon: {
                    id: coupon.id,
                    code: coupon.code,
                    description: coupon.description,
                    discount_type: coupon.discount_type,
                    discount_value: parseFloat(coupon.discount_value),
                    min_order_amount: parseFloat(coupon.min_amount || 0),
                    max_discount_amount: coupon.max_discount_amount
                        ? parseFloat(coupon.max_discount_amount)
                        : null,
                    usage_limit: coupon.max_uses,
                    used_count: coupon.current_uses,
                    valid_from: coupon.valid_from,
                    valid_until: coupon.valid_until,
                    is_active: coupon.status === "active",
                    status: coupon.status,
                },
                originalAmount: amount,
                discountAmount,
                finalAmount,
                savings: discountAmount,
            },
        });
    } catch (error) {
        console.error("Error validating public coupon:", error);
        res.status(500).json({
            success: false,
            message: "Failed to validate coupon",
            error: error.message,
        });
    }
};

// Get coupon by code (public)
const getCouponByCode = async (req, res) => {
    try {
        const { code } = req.params;

        const coupon = await Coupon.findOne({
            where: {
                code: code.toUpperCase(),
                status: "active",
                valid_from: { [Op.lte]: new Date() },
                valid_until: { [Op.gte]: new Date() },
            },
        });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "Coupon not found or expired",
            });
        }

        // Transform the data for mobile app consumption
        const transformedCoupon = {
            id: coupon.id,
            code: coupon.code,
            description: coupon.description || "",
            discount_type: coupon.discount_type,
            discount_value: parseFloat(coupon.discount_value),
            min_order_amount: parseFloat(coupon.min_amount || 0),
            max_discount_amount: coupon.max_discount_amount
                ? parseFloat(coupon.max_discount_amount)
                : null,
            usage_limit: coupon.max_uses,
            used_count: coupon.current_uses,
            valid_from: coupon.valid_from,
            valid_until: coupon.valid_until,
            is_active: coupon.status === "active",
            status: coupon.status,
            created_at: coupon.created_at,
            updated_at: coupon.updated_at,
        };

        res.json({
            success: true,
            data: transformedCoupon,
        });
    } catch (error) {
        console.error("Error fetching coupon by code:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch coupon",
            error: error.message,
        });
    }
};

// Public routes (no authentication required)
router.get("/", getPublicCoupons);
router.get("/code/:code", getCouponByCode);
router.post("/validate", validatePublicCoupon);

module.exports = router;
