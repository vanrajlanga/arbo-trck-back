const { Coupon } = require("../models");
const { Op } = require("sequelize");

// Admin Coupon Management
const getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.findAll({
            order: [["created_at", "DESC"]],
        });

        // Transform the data to match frontend expectations
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

        res.json({ success: true, data: transformedCoupons });
    } catch (error) {
        console.error("Error fetching coupons:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch coupons",
            error: error.message,
        });
    }
};

const getCouponById = async (req, res) => {
    try {
        const { id } = req.params;
        const coupon = await Coupon.findByPk(id);
        if (!coupon)
            return res
                .status(404)
                .json({ success: false, message: "Coupon not found" });

        // Transform the data to match frontend expectations
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

        res.json({ success: true, data: transformedCoupon });
    } catch (error) {
        console.error("Error fetching coupon:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch coupon",
            error: error.message,
        });
    }
};

const createCoupon = async (req, res) => {
    try {
        const {
            code,
            description,
            discount_type,
            discount_value,
            min_order_amount,
            max_discount_amount,
            usage_limit,
            valid_from,
            valid_until,
            is_active,
        } = req.body;

        if (
            !code ||
            !discount_type ||
            !discount_value ||
            !valid_from ||
            !valid_until
        ) {
            return res
                .status(400)
                .json({ success: false, message: "Missing required fields" });
        }

        const existingCoupon = await Coupon.findOne({
            where: { code: code.toUpperCase() },
        });
        if (existingCoupon) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "Coupon code already exists",
                });
        }

        // Map frontend fields to database fields
        const couponData = {
            code: code.toUpperCase(),
            description: description || "",
            discount_type,
            discount_value: parseFloat(discount_value),
            min_amount: parseFloat(min_order_amount || 0),
            max_discount_amount: max_discount_amount
                ? parseFloat(max_discount_amount)
                : null,
            max_uses: usage_limit || null,
            current_uses: 0,
            valid_from: new Date(valid_from),
            valid_until: new Date(valid_until),
            status: is_active ? "active" : "inactive",
        };

        const coupon = await Coupon.create(couponData);

        // Transform the response to match frontend expectations
        const transformedCoupon = {
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
            created_at: coupon.created_at,
            updated_at: coupon.updated_at,
        };

        res.status(201).json({
            success: true,
            message: "Coupon created successfully",
            data: transformedCoupon,
        });
    } catch (error) {
        console.error("Error creating coupon:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create coupon",
            error: error.message,
        });
    }
};

const updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const coupon = await Coupon.findByPk(id);

        if (!coupon)
            return res
                .status(404)
                .json({ success: false, message: "Coupon not found" });

        if (updateData.code && updateData.code !== coupon.code) {
            const existingCoupon = await Coupon.findOne({
                where: {
                    code: updateData.code.toUpperCase(),
                    id: { [Op.ne]: id },
                },
            });
            if (existingCoupon) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message: "Coupon code already exists",
                    });
            }
            updateData.code = updateData.code.toUpperCase();
        }

        // Map frontend fields to database fields
        const mappedUpdateData = {};

        if (updateData.code !== undefined)
            mappedUpdateData.code = updateData.code;
        if (updateData.description !== undefined)
            mappedUpdateData.description = updateData.description;
        if (updateData.discount_type !== undefined)
            mappedUpdateData.discount_type = updateData.discount_type;
        if (updateData.discount_value !== undefined)
            mappedUpdateData.discount_value = parseFloat(
                updateData.discount_value
            );
        if (updateData.min_order_amount !== undefined)
            mappedUpdateData.min_amount = parseFloat(
                updateData.min_order_amount
            );
        if (updateData.max_discount_amount !== undefined) {
            mappedUpdateData.max_discount_amount =
                updateData.max_discount_amount
                    ? parseFloat(updateData.max_discount_amount)
                    : null;
        }
        if (updateData.usage_limit !== undefined)
            mappedUpdateData.max_uses = updateData.usage_limit;
        if (updateData.valid_from !== undefined)
            mappedUpdateData.valid_from = new Date(updateData.valid_from);
        if (updateData.valid_until !== undefined)
            mappedUpdateData.valid_until = new Date(updateData.valid_until);
        if (updateData.is_active !== undefined) {
            mappedUpdateData.status = updateData.is_active
                ? "active"
                : "inactive";
        }

        await coupon.update(mappedUpdateData);

        // Transform the response to match frontend expectations
        const transformedCoupon = {
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
            created_at: coupon.created_at,
            updated_at: coupon.updated_at,
        };

        res.json({
            success: true,
            message: "Coupon updated successfully",
            data: transformedCoupon,
        });
    } catch (error) {
        console.error("Error updating coupon:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update coupon",
            error: error.message,
        });
    }
};

const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const coupon = await Coupon.findByPk(id);
        if (!coupon)
            return res
                .status(404)
                .json({ success: false, message: "Coupon not found" });
        if (coupon.current_uses > 0) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "Cannot delete coupon that has been used",
                });
        }
        await coupon.destroy();
        res.json({ success: true, message: "Coupon deleted successfully" });
    } catch (error) {
        console.error("Error deleting coupon:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete coupon",
            error: error.message,
        });
    }
};

const toggleCouponStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const coupon = await Coupon.findByPk(id);
        if (!coupon)
            return res
                .status(404)
                .json({ success: false, message: "Coupon not found" });
        const newStatus = coupon.status === "active" ? "inactive" : "active";
        await coupon.update({ status: newStatus });

        // Transform the response to match frontend expectations
        const transformedCoupon = {
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
            is_active: newStatus === "active",
            status: newStatus,
            created_at: coupon.created_at,
            updated_at: coupon.updated_at,
        };

        res.json({
            success: true,
            message: `Coupon ${newStatus}`,
            data: transformedCoupon,
        });
    } catch (error) {
        console.error("Error toggling coupon status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to toggle coupon status",
            error: error.message,
        });
    }
};

// Vendor Coupon Management
const getVendorCoupons = async (req, res) => {
    try {
        // Get all active coupons that vendors can use
        const coupons = await Coupon.findAll({
            where: {
                status: "active",
                valid_until: { [Op.gte]: new Date() },
            },
            order: [["created_at", "DESC"]],
        });

        // Transform the data to match frontend expectations
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

        res.json({ success: true, data: transformedCoupons });
    } catch (error) {
        console.error("Error fetching vendor coupons:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch coupons",
            error: error.message,
        });
    }
};

const validateCoupon = async (req, res) => {
    try {
        const { code, amount } = req.body;
        if (!code || !amount) {
            return res
                .status(400)
                .json({
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
            return res
                .status(404)
                .json({
                    success: false,
                    message: "Invalid or expired coupon code",
                });
        }
        if (coupon.min_amount && amount < coupon.min_amount) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: `Minimum order amount of ₹${coupon.min_amount} required`,
                });
        }
        if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "Coupon usage limit reached",
                });
        }
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

// Coupon Analytics
const getCouponAnalytics = async (req, res) => {
    try {
        const totalCoupons = await Coupon.count();
        const activeCoupons = await Coupon.count({
            where: {
                status: "active",
                valid_until: { [Op.gte]: new Date() },
            },
        });
        const totalUsage = await Coupon.sum("current_uses");
        const topCoupons = await Coupon.findAll({
            where: { current_uses: { [Op.gt]: 0 } },
            order: [["current_uses", "DESC"]],
            limit: 5,
        });
        res.json({
            success: true,
            data: {
                totalCoupons,
                activeCoupons,
                totalUsage,
                topCoupons,
            },
        });
    } catch (error) {
        console.error("Error fetching coupon analytics:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch coupon analytics",
            error: error.message,
        });
    }
};

module.exports = {
    getAllCoupons,
    getCouponById,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus,
    getCouponAnalytics,
    getVendorCoupons,
    validateCoupon,
};
