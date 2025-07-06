const { State, City } = require("../models");
const { Op } = require("sequelize");

// Get all states
const getAllStates = async (req, res) => {
    try {
        const { status } = req.query;
        const whereClause = {};
        if (status) whereClause.status = status;
        const states = await State.findAll({
            where: whereClause,
            order: [["name", "ASC"]],
        });
        res.json({ success: true, data: states });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch states",
            error: error.message,
        });
    }
};

// Get state by ID
const getStateById = async (req, res) => {
    try {
        const { id } = req.params;
        const state = await State.findByPk(id);
        if (!state)
            return res
                .status(404)
                .json({ success: false, message: "State not found" });
        res.json({ success: true, data: state });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch state",
            error: error.message,
        });
    }
};

// Create new state
const createState = async (req, res) => {
    try {
        const { name, status } = req.body;
        if (!name)
            return res
                .status(400)
                .json({ success: false, message: "Name is required" });
        const state = await State.create({ name, status: status || "active" });
        res.status(201).json({ success: true, data: state });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create state",
            error: error.message,
        });
    }
};

// Update state
const updateState = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, status } = req.body;
        const state = await State.findByPk(id);
        if (!state)
            return res
                .status(404)
                .json({ success: false, message: "State not found" });
        await state.update({ name, status });
        res.json({ success: true, data: state });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update state",
            error: error.message,
        });
    }
};

// Delete state
const deleteState = async (req, res) => {
    try {
        const { id } = req.params;
        const state = await State.findByPk(id);
        if (!state)
            return res
                .status(404)
                .json({ success: false, message: "State not found" });
        await state.destroy();
        res.json({ success: true, message: "State deleted" });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete state",
            error: error.message,
        });
    }
};

// Toggle state popularity
const toggleStatePopularity = async (req, res) => {
    try {
        const { id } = req.params;

        const state = await State.findByPk(id);

        if (!state) {
            return res.status(404).json({
                success: false,
                message: "State not found",
            });
        }

        await state.update({ is_popular: !state.is_popular });

        res.json({
            success: true,
            message: `State ${
                state.is_popular ? "marked as popular" : "unmarked as popular"
            }`,
            data: state,
        });
    } catch (error) {
        console.error("Error toggling state popularity:", error);
        res.status(500).json({
            success: false,
            message: "Failed to toggle state popularity",
            error: error.message,
        });
    }
};

// Get popular states
const getPopularStates = async (req, res) => {
    try {
        const states = await State.findAll({
            where: { is_popular: true, status: "active" },
            include: [
                {
                    model: City,
                    as: "cities",
                    attributes: ["id", "name", "status", "is_popular"],
                    where: { status: "active" },
                    required: false,
                },
            ],
            order: [["name", "ASC"]],
        });

        res.json({
            success: true,
            data: states,
        });
    } catch (error) {
        console.error("Error fetching popular states:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch popular states",
            error: error.message,
        });
    }
};

// Get states by region
const getStatesByRegion = async (req, res) => {
    try {
        const { region } = req.params;

        const states = await State.findAll({
            where: { region, status: "active" },
            include: [
                {
                    model: City,
                    as: "cities",
                    attributes: ["id", "name", "status", "is_popular"],
                    where: { status: "active" },
                    required: false,
                },
            ],
            order: [["name", "ASC"]],
        });

        res.json({
            success: true,
            data: states,
        });
    } catch (error) {
        console.error("Error fetching states by region:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch states by region",
            error: error.message,
        });
    }
};

module.exports = {
    getAllStates,
    getStateById,
    createState,
    updateState,
    deleteState,
    toggleStatePopularity,
    getPopularStates,
    getStatesByRegion,
};
