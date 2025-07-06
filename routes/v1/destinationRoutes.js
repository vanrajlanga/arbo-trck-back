const express = require("express");
const router = express.Router();
const { Destination } = require("../../models");

// Get popular destinations (public endpoint for mobile app)
router.get("/popular", async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const destinations = await Destination.findAll({
            where: {
                isPopular: true,
                status: "active",
            },
            limit: parseInt(limit),
            order: [["name", "ASC"]],
            attributes: [
                "id",
                "name",
                "state",
                "isPopular",
                "status",
                "created_at",
                "updated_at",
            ],
        });

        res.json({
            success: true,
            data: destinations,
            count: destinations.length,
        });
    } catch (error) {
        console.error("Error fetching popular destinations:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch popular destinations",
            error: error.message,
        });
    }
});

// Search destinations (public endpoint for mobile app)
router.get("/search", async (req, res) => {
    try {
        const {
            q,
            region,
            difficulty,
            trekType,
            isPopular,
            status = "active",
            limit = 20,
            offset = 0,
        } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: "Search query 'q' is required",
            });
        }

        // Build where clause
        const whereClause = {};

        if (isPopular !== undefined) {
            whereClause.isPopular = isPopular === "true";
        }

        if (status) {
            whereClause.status = status;
        }

        if (state) {
            whereClause.state = state;
        }

        // Add search conditions
        const searchConditions = [
            { name: { [require("sequelize").Op.like]: `%${q}%` } },
            { state: { [require("sequelize").Op.like]: `%${q}%` } },
        ];

        const destinations = await Destination.findAll({
            where: {
                [require("sequelize").Op.and]: [
                    whereClause,
                    { [require("sequelize").Op.or]: searchConditions },
                ],
            },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [
                ["isPopular", "DESC"],
                ["name", "ASC"],
            ],
            attributes: [
                "id",
                "name",
                "state",
                "isPopular",
                "status",
                "created_at",
                "updated_at",
            ],
        });

        // Get total count for pagination
        const totalCount = await Destination.count({
            where: {
                [require("sequelize").Op.and]: [
                    whereClause,
                    { [require("sequelize").Op.or]: searchConditions },
                ],
            },
        });

        res.json({
            success: true,
            data: destinations,
            pagination: {
                total: totalCount,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: parseInt(offset) + destinations.length < totalCount,
            },
            search: {
                query: q,
                results: destinations.length,
            },
        });
    } catch (error) {
        console.error("Error searching destinations:", error);
        res.status(500).json({
            success: false,
            message: "Failed to search destinations",
            error: error.message,
        });
    }
});

// Get destinations by region (public endpoint for mobile app)
router.get("/region/:region", async (req, res) => {
    try {
        const { region } = req.params;
        const { limit = 50, offset = 0 } = req.query;

        const destinations = await Destination.findAll({
            where: {
                region: region,
                status: "active",
            },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [
                ["isPopular", "DESC"],
                ["name", "ASC"],
            ],
            attributes: [
                "id",
                "name",
                "state",
                "isPopular",
                "status",
                "created_at",
                "updated_at",
            ],
        });

        // Get total count for pagination
        const totalCount = await Destination.count({
            where: {
                region: region,
                status: "active",
            },
        });

        res.json({
            success: true,
            data: destinations,
            region: region,
            pagination: {
                total: totalCount,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: parseInt(offset) + destinations.length < totalCount,
            },
        });
    } catch (error) {
        console.error("Error fetching destinations by region:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch destinations by region",
            error: error.message,
        });
    }
});

// Get all destinations (public endpoint for mobile app)
router.get("/", async (req, res) => {
    try {
        const {
            state,
            isPopular,
            status = "active",
            limit = 50,
            offset = 0,
        } = req.query;

        // Build where clause
        const whereClause = {};

        if (isPopular !== undefined) {
            whereClause.isPopular = isPopular === "true";
        }

        if (status) {
            whereClause.status = status;
        }

        if (state) {
            whereClause.state = state;
        }

        const destinations = await Destination.findAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [
                ["isPopular", "DESC"],
                ["name", "ASC"],
            ],
            attributes: [
                "id",
                "name",
                "state",
                "isPopular",
                "status",
                "created_at",
                "updated_at",
            ],
        });

        // Get total count for pagination
        const totalCount = await Destination.count({ where: whereClause });

        res.json({
            success: true,
            data: destinations,
            pagination: {
                total: totalCount,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: parseInt(offset) + destinations.length < totalCount,
            },
        });
    } catch (error) {
        console.error("Error fetching destinations:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch destinations",
            error: error.message,
        });
    }
});

// Get destination by ID (public endpoint for mobile app)
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const destination = await Destination.findByPk(id, {
            attributes: [
                "id",
                "name",
                "state",
                "isPopular",
                "status",
                "created_at",
                "updated_at",
            ],
        });

        if (!destination) {
            return res.status(404).json({
                success: false,
                message: "Destination not found",
            });
        }

        res.json({
            success: true,
            data: destination,
        });
    } catch (error) {
        console.error("Error fetching destination:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch destination",
            error: error.message,
        });
    }
});

module.exports = router;
