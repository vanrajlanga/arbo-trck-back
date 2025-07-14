const {
    Coupon,
    CouponAssignment,
    Customer,
    sequelize,
} = require("../../models");
const { Op } = require("sequelize");

// Mobile: Get all active coupons available for customer
exports.getAvailableCoupons = async (req, res) => {
    try {
        const { customer_id } = req.query;

        if (!customer_id) {
            return res.status(400).json({
                success: false,
                message: "Customer ID is required",
            });
        }

        const currentDate = new Date();

        // Get all active coupons that are currently valid
        const coupons = await Coupon.findAll({
            where: {
                status: "active",
                valid_from: {
                    [Op.lte]: currentDate,
                },
                valid_until: {
                    [Op.gte]: currentDate,
                },
                [Op.or]: [
                    { max_uses: null }, // No usage limit
                    { current_uses: { [Op.lt]: sequelize.col("max_uses") } }, // Still has uses left
                ],
            },
            order: [["created_at", "DESC"]],
        });

        // Check which coupons are already used by this customer
        const customerCoupons = await CouponAssignment.findAll({
            where: { customer_id: customer_id },
            attributes: ["coupon_id"],
        });

        const usedCouponIds = customerCoupons.map((cc) => cc.coupon_id);

        // Filter out coupons already used by this customer
        const availableCoupons = coupons.filter(
            (coupon) => !usedCouponIds.includes(coupon.id)
        );

        // Transform coupons for mobile response
        const transformedCoupons = availableCoupons.map((coupon) => ({
            id: coupon.id,
            title: coupon.title,
            color: coupon.color,
            code: coupon.code,
            description: coupon.description,
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_value,
            min_amount: coupon.min_amount,
            max_discount_amount: coupon.max_discount_amount,
            valid_from: coupon.valid_from,
            valid_until: coupon.valid_until,
            current_uses: coupon.current_uses,
            max_uses: coupon.max_uses,
            is_used: false,
        }));

        res.json({
            success: true,
            data: transformedCoupons,
            count: transformedCoupons.length,
        });
    } catch (error) {
        console.error("Error fetching available coupons:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch coupons",
            error: error.message,
        });
    }
};

// Mobile: Validate coupon code
exports.validateCoupon = async (req, res) => {
    try {
        const { code, customer_id, amount } = req.body;

        if (!code || !customer_id) {
            return res.status(400).json({
                success: false,
                message: "Coupon code and customer ID are required",
            });
        }

        const currentDate = new Date();

        // Find the coupon
        const coupon = await Coupon.findOne({
            where: {
                code: code.toUpperCase(),
                status: "active",
                valid_from: {
                    [Op.lte]: currentDate,
                },
                valid_until: {
                    [Op.gte]: currentDate,
                },
            },
        });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "Invalid or expired coupon code",
            });
        }

        // Check if customer has already used this coupon
        const customerCoupon = await CouponAssignment.findOne({
            where: {
                coupon_id: coupon.id,
                customer_id: customer_id,
            },
        });

        if (customerCoupon) {
            return res.status(400).json({
                success: false,
                message: "You have already used this coupon",
            });
        }

        // Check usage limits
        if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
            return res.status(400).json({
                success: false,
                message: "This coupon has reached its usage limit",
            });
        }

        // Check minimum amount if provided
        if (amount && coupon.min_amount && amount < coupon.min_amount) {
            return res.status(400).json({
                success: false,
                message: `Minimum order amount of ₹${coupon.min_amount} required`,
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

        res.json({
            success: true,
            data: {
                id: coupon.id,
                title: coupon.title,
                color: coupon.color,
                code: coupon.code,
                description: coupon.description,
                discount_type: coupon.discount_type,
                discount_value: coupon.discount_value,
                discount_amount: discountAmount,
                min_amount: coupon.min_amount,
                max_discount_amount: coupon.max_discount_amount,
                valid_from: coupon.valid_from,
                valid_until: coupon.valid_until,
            },
        });
    } catch (error) {
        console.error("Error validating coupon:", error);
        res.status(500).json({
            success: false,
            message: "Failed to validate coupon",
            error: error.message,
        });
    }
};

// Mobile: Apply coupon (mark as used)
exports.applyCoupon = async (req, res) => {
    try {
        const { coupon_id, customer_id, booking_id } = req.body;

        if (!coupon_id || !customer_id) {
            return res.status(400).json({
                success: false,
                message: "Coupon ID and customer ID are required",
            });
        }

        // Check if customer has already used this coupon
        const existingAssignment = await CouponAssignment.findOne({
            where: {
                coupon_id: coupon_id,
                customer_id: customer_id,
            },
        });

        if (existingAssignment) {
            return res.status(400).json({
                success: false,
                message: "You have already used this coupon",
            });
        }

        // Create coupon assignment
        await CouponAssignment.create({
            coupon_id: coupon_id,
            customer_id: customer_id,
            booking_id: booking_id || null,
            used_at: new Date(),
        });

        // Increment coupon usage count
        await Coupon.increment("current_uses", {
            where: { id: coupon_id },
        });

        res.json({
            success: true,
            message: "Coupon applied successfully",
        });
    } catch (error) {
        console.error("Error applying coupon:", error);
        res.status(500).json({
            success: false,
            message: "Failed to apply coupon",
            error: error.message,
        });
    }
};

// Mobile: Get customer's used coupons
exports.getCustomerCoupons = async (req, res) => {
    try {
        const { customer_id } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows: customerCoupons } =
            await CouponAssignment.findAndCountAll({
                where: { customer_id: customer_id },
                include: [
                    {
                        model: Coupon,
                        as: "coupon",
                        attributes: [
                            "id",
                            "title",
                            "color",
                            "code",
                            "description",
                            "discount_type",
                            "discount_value",
                            "valid_from",
                            "valid_until",
                        ],
                    },
                ],
                order: [["used_at", "DESC"]],
                limit: parseInt(limit),
                offset: parseInt(offset),
            });

        const transformedCoupons = customerCoupons.map((cc) => ({
            id: cc.id,
            coupon: cc.coupon,
            used_at: cc.used_at,
            booking_id: cc.booking_id,
        }));

        res.json({
            success: true,
            data: transformedCoupons,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalCount: count,
            },
        });
    } catch (error) {
        console.error("Error fetching customer coupons:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch customer coupons",
            error: error.message,
        });
    }
};
