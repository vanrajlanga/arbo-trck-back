const { State, City, PickupPoint } = require("../../models");

// Get all states
exports.getStates = async (req, res) => {
    try {
        const states = await State.findAll({
            where: { status: "active" },
            order: [["name", "ASC"]],
            attributes: ["id", "name"],
            raw: true,
        });
        res.json({ success: true, data: states });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch states",
        });
    }
};

// Get all cities
exports.getCities = async (req, res) => {
    try {
        const cities = await City.findAll({
            include: [
                { model: State, as: "state", attributes: ["id", "name"] },
            ],
            order: [["cityName", "ASC"]],
        });
        res.json({
            success: true,
            data: { cities },
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
        res.status(500).json({
            success: false,
            message: "Failed to fetch city",
        });
    }
};

// Create city
exports.createCity = async (req, res) => {
    try {
        const { cityName, stateId } = req.body;
        if (!cityName || !stateId)
            return res.status(400).json({
                success: false,
                message: "cityName and stateId required",
            });
        const city = await City.create({ cityName, stateId });
        res.status(201).json({ success: true, data: city });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to create city",
        });
    }
};

// Update city
exports.updateCity = async (req, res) => {
    try {
        const city = await City.findByPk(req.params.id);
        if (!city)
            return res
                .status(404)
                .json({ success: false, message: "City not found" });
        await city.update(req.body);
        res.json({ success: true, data: city });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to update city",
        });
    }
};

// Delete city
exports.deleteCity = async (req, res) => {
    try {
        const city = await City.findByPk(req.params.id);
        if (!city)
            return res
                .status(404)
                .json({ success: false, message: "City not found" });
        await city.destroy();
        res.json({ success: true, message: "City deleted" });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to delete city",
        });
    }
};

// Get pickup points (optionally by city)
exports.getPickupPoints = async (req, res) => {
    try {
        const where = req.params.id ? { cityId: req.params.id } : {};
        const pickupPoints = await PickupPoint.findAll({
            where,
            include: [
                { model: City, as: "city", attributes: ["id", "cityName"] },
            ],
            order: [["name", "ASC"]],
        });
        res.json({ success: true, data: pickupPoints });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch pickup points",
        });
    }
};

// Create pickup point
exports.createPickupPoint = async (req, res) => {
    try {
        const { cityId, name, address } = req.body;
        if (!cityId || !name || !address)
            return res.status(400).json({
                success: false,
                message: "cityId, name, and address required",
            });
        const pickupPoint = await PickupPoint.create(req.body);
        res.status(201).json({ success: true, data: pickupPoint });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to create pickup point",
        });
    }
};

// Update pickup point
exports.updatePickupPoint = async (req, res) => {
    try {
        const pickupPoint = await PickupPoint.findByPk(req.params.id);
        if (!pickupPoint)
            return res
                .status(404)
                .json({ success: false, message: "Pickup point not found" });
        await pickupPoint.update(req.body);
        res.json({ success: true, data: pickupPoint });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to update pickup point",
        });
    }
};

// Delete pickup point
exports.deletePickupPoint = async (req, res) => {
    try {
        const pickupPoint = await PickupPoint.findByPk(req.params.id);
        if (!pickupPoint)
            return res
                .status(404)
                .json({ success: false, message: "Pickup point not found" });
        await pickupPoint.destroy();
        res.json({ success: true, message: "Pickup point deleted" });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to delete pickup point",
        });
    }
};
