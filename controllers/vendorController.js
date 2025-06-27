const { Vendor, User } = require("../models");

// Get all vendors (alias for existing function)
exports.getAllVendors = async (req, res, next) => {
    try {
        const vendors = await Vendor.findAll({
            include: [{ model: User, as: "user" }],
        });
        res.json(vendors);
    } catch (err) {
        next(err);
    }
};

// Legacy function name (keep for backward compatibility)
exports.getVendors = async (req, res, next) => {
    try {
        const vendors = await Vendor.findAll({
            include: [{ model: User, as: "user" }],
        });
        res.json(vendors);
    } catch (err) {
        next(err);
    }
};

// Get vendor by ID
exports.getVendorById = async (req, res, next) => {
    try {
        const vendor = await Vendor.findByPk(req.params.id, {
            include: [{ model: User, as: "user" }],
        });
        if (!vendor)
            return res.status(404).json({ message: "Vendor not found" });
        res.json(vendor);
    } catch (err) {
        next(err);
    }
};

// Update vendor
exports.updateVendor = async (req, res, next) => {
    try {
        const [updated] = await Vendor.update(req.body, {
            where: { id: req.params.id },
        });
        if (!updated)
            return res.status(404).json({ message: "Vendor not found" });
        const vendor = await Vendor.findByPk(req.params.id, {
            include: [{ model: User, as: "user" }],
        });
        res.json(vendor);
    } catch (err) {
        next(err);
    }
};

// Delete vendor
exports.deleteVendor = async (req, res, next) => {
    try {
        const deleted = await Vendor.destroy({ where: { id: req.params.id } });
        if (!deleted)
            return res.status(404).json({ message: "Vendor not found" });
        res.status(204).end();
    } catch (err) {
        next(err);
    }
};

exports.createVendor = async (req, res, next) => {
    try {
        const { user_id, company_info } = req.body;
        // Ensure user exists
        const user = await User.findByPk(user_id);
        if (!user) return res.status(404).json({ message: "User not found" });
        const vendor = await Vendor.create({
            user_id,
            company_info,
            status: "inactive",
        });
        res.status(201).json(vendor);
    } catch (err) {
        next(err);
    }
};

exports.updateVendorStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const [updated] = await Vendor.update(
            { status },
            { where: { id: req.params.id } }
        );
        if (!updated)
            return res.status(404).json({ message: "Vendor not found" });
        const vendor = await Vendor.findByPk(req.params.id);
        res.json(vendor);
    } catch (err) {
        next(err);
    }
};
