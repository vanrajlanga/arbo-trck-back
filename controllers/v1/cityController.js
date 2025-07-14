const { State, City } = require("../../models");

// Get all cities
exports.getAllCities = async (req, res) => {
    try {
        const cities = await City.findAll({
            include: [
                { model: State, as: "state", attributes: ["id", "name"] },
            ],
            order: [["cityName", "ASC"]],
        });
        res.json({
            success: true,
            data: cities,
        });
    } catch (err) {
        console.error("Error fetching cities:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch cities",
        });
    }
};

// Get city by ID
exports.getCityById = async (req, res) => {
    try {
        const city = await City.findByPk(req.params.id, {
            include: [
                { model: State, as: "state", attributes: ["id", "name"] },
            ],
        });
        if (!city)
            return res
                .status(404)
                .json({ success: false, message: "City not found" });
        res.json({ success: true, data: city });
    } catch (err) {
        console.error("Error fetching city:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch city",
        });
    }
};

// Get popular cities
exports.getPopularCities = async (req, res) => {
    try {
        const cities = await City.findAll({
            where: { isPopular: true },
            include: [
                { model: State, as: "state", attributes: ["id", "name"] },
            ],
            order: [["cityName", "ASC"]],
        });
        res.json({
            success: true,
            data: cities,
        });
    } catch (err) {
        console.error("Error fetching popular cities:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch popular cities",
        });
    }
};

// Get cities by state
exports.getCitiesByState = async (req, res) => {
    try {
        const { stateId } = req.params;
        const cities = await City.findAll({
            where: { stateId },
            include: [
                { model: State, as: "state", attributes: ["id", "name"] },
            ],
            order: [["cityName", "ASC"]],
        });
        res.json({
            success: true,
            data: cities,
        });
    } catch (err) {
        console.error("Error fetching cities by state:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch cities by state",
        });
    }
};
