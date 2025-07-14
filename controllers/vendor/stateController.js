const { State, City } = require("../../models");
const { Op } = require("sequelize");

// Get all states
exports.getAllStates = async (req, res) => {
    try {
        const states = await State.findAll({
            where: { status: "active" },
            include: [
                {
                    model: City,
                    as: "cities",
                    attributes: ["id", "cityName"],
                    where: { isPopular: true },
                    required: false,
                },
            ],
            order: [["name", "ASC"]],
        });
        res.json({ success: true, data: states });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch states",
        });
    }
};

// Get state by ID
exports.getStateById = async (req, res) => {
    try {
        const state = await State.findByPk(req.params.id, {
            include: [
                {
                    model: City,
                    as: "cities",
                    attributes: ["id", "cityName", "isPopular"],
                },
            ],
        });
        if (!state)
            return res
                .status(404)
                .json({ success: false, message: "State not found" });
        res.json({ success: true, data: state });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch state",
        });
    }
};

// Get popular states
exports.getPopularStates = async (req, res) => {
    try {
        const states = await State.findAll({
            where: { status: "active" },
            include: [
                {
                    model: City,
                    as: "cities",
                    attributes: ["id", "cityName"],
                    where: { isPopular: true },
                    required: true,
                },
            ],
            order: [["name", "ASC"]],
        });
        res.json({ success: true, data: states });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch popular states",
        });
    }
};

// Get states by region (placeholder - you can implement region logic)
exports.getStatesByRegion = async (req, res) => {
    try {
        const { region } = req.params;
        // For now, return all states. You can implement region-based filtering later
        const states = await State.findAll({
            where: { status: "active" },
            include: [
                {
                    model: City,
                    as: "cities",
                    attributes: ["id", "cityName"],
                },
            ],
            order: [["name", "ASC"]],
        });
        res.json({ success: true, data: states, region });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch states by region",
        });
    }
};
