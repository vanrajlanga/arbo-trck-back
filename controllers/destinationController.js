const { Destination, Trek } = require("../models");
const { Op } = require("sequelize");

// Get all destinations
const getAllDestinations = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            region,
            difficulty,
            trekType,
            status = "active",
            search,
        } = req.query;

        const whereClause = {};

        if (region) whereClause.region = region;
        if (difficulty) whereClause.difficulty = difficulty;
        if (trekType) whereClause.trek_type = trekType;
        if (status) whereClause.status = status;

        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } },
                { state: { [Op.like]: `%${search}%` } },
            ];
        }

        const destinations = await Destination.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Trek,
                    as: "treks",
                    attributes: ["id", "title", "status"],
                    where: { status: "published" },
                    required: false,
                },
            ],
            order: [["name", "ASC"]],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
        });

        // Transform data to include trek count
        const transformedDestinations = destinations.rows.map(
            (destination) => ({
                id: destination.id,
                name: destination.name,
                description: destination.description,
                region: destination.region,
                state: destination.state,
                altitude: destination.altitude,
                bestTimeToVisit: destination.bestTimeToVisit,
                difficulty: destination.difficulty,
                trekType: destination.trekType,
                isPopular: destination.isPopular,
                status: destination.status,
                totalTreks: destination.treks?.length || 0,
                avgRating: destination.avgRating,
                imageUrl: destination.imageUrl,
                coordinates: destination.coordinates,
                createdAt: destination.created_at,
                updatedAt: destination.updated_at,
            })
        );

        res.json({
            success: true,
            data: transformedDestinations,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(destinations.count / parseInt(limit)),
                totalCount: destinations.count,
                hasMore:
                    parseInt(page) <
                    Math.ceil(destinations.count / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error("Error fetching destinations:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch destinations",
        });
    }
};

// Get destination by ID
const getDestinationById = async (req, res) => {
    try {
        const { id } = req.params;

        const destination = await Destination.findByPk(id, {
            include: [
                {
                    model: Trek,
                    as: "treks",
                    attributes: [
                        "id",
                        "title",
                        "description",
                        "status",
                        "base_price",
                    ],
                    where: { status: "published" },
                    required: false,
                },
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
        });
    }
};

// Create new destination
const createDestination = async (req, res) => {
    try {
        const {
            name,
            description,
            region,
            state,
            altitude,
            bestTimeToVisit,
            difficulty,
            trekType,
            isPopular,
            status,
            imageUrl,
            coordinates,
        } = req.body;

        // Validate required fields
        if (!name || !region) {
            return res.status(400).json({
                success: false,
                message: "Name and region are required",
            });
        }

        // Check if destination with same name already exists
        const existingDestination = await Destination.findOne({
            where: { name: { [Op.iLike]: name } },
        });

        if (existingDestination) {
            return res.status(400).json({
                success: false,
                message: "Destination with this name already exists",
            });
        }

        const destination = await Destination.create({
            name,
            description,
            region,
            state,
            altitude,
            bestTimeToVisit,
            difficulty,
            trekType,
            isPopular: isPopular || false,
            status: status || "active",
            imageUrl,
            coordinates,
        });

        res.status(201).json({
            success: true,
            message: "Destination created successfully",
            data: destination,
        });
    } catch (error) {
        console.error("Error creating destination:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create destination",
        });
    }
};

// Update destination
const updateDestination = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const destination = await Destination.findByPk(id);

        if (!destination) {
            return res.status(404).json({
                success: false,
                message: "Destination not found",
            });
        }

        // Check if name is being updated and if it conflicts with existing destination
        if (updateData.name && updateData.name !== destination.name) {
            const existingDestination = await Destination.findOne({
                where: {
                    name: { [Op.iLike]: updateData.name },
                    id: { [Op.ne]: id },
                },
            });

            if (existingDestination) {
                return res.status(400).json({
                    success: false,
                    message: "Destination with this name already exists",
                });
            }
        }

        await destination.update(updateData);

        res.json({
            success: true,
            message: "Destination updated successfully",
            data: destination,
        });
    } catch (error) {
        console.error("Error updating destination:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update destination",
        });
    }
};

// Delete destination
const deleteDestination = async (req, res) => {
    try {
        const { id } = req.params;

        const destination = await Destination.findByPk(id, {
            include: [
                {
                    model: Trek,
                    as: "treks",
                    required: false,
                },
            ],
        });

        if (!destination) {
            return res.status(404).json({
                success: false,
                message: "Destination not found",
            });
        }

        // Check if destination has associated treks
        if (destination.treks && destination.treks.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete destination with associated treks",
            });
        }

        await destination.destroy();

        res.json({
            success: true,
            message: "Destination deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting destination:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete destination",
        });
    }
};

// Toggle destination popularity
const togglePopularity = async (req, res) => {
    try {
        const { id } = req.params;

        const destination = await Destination.findByPk(id);

        if (!destination) {
            return res.status(404).json({
                success: false,
                message: "Destination not found",
            });
        }

        await destination.update({
            isPopular: !destination.isPopular,
        });

        res.json({
            success: true,
            message: `Destination ${
                destination.isPopular ? "marked as" : "removed from"
            } popular`,
            data: destination,
        });
    } catch (error) {
        console.error("Error toggling destination popularity:", error);
        res.status(500).json({
            success: false,
            message: "Failed to toggle destination popularity",
        });
    }
};

// Get popular destinations
const getPopularDestinations = async (req, res) => {
    try {
        const destinations = await Destination.findAll({
            where: {
                isPopular: true,
                status: "active",
            },
            include: [
                {
                    model: Trek,
                    as: "treks",
                    attributes: ["id", "title", "status"],
                    where: { status: "published" },
                    required: false,
                },
            ],
            order: [["name", "ASC"]],
        });

        const transformedDestinations = destinations.map((destination) => ({
            id: destination.id,
            name: destination.name,
            description: destination.description,
            region: destination.region,
            state: destination.state,
            difficulty: destination.difficulty,
            trekType: destination.trekType,
            totalTreks: destination.treks?.length || 0,
            avgRating: destination.avgRating,
            imageUrl: destination.imageUrl,
        }));

        res.json({
            success: true,
            data: transformedDestinations,
        });
    } catch (error) {
        console.error("Error fetching popular destinations:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch popular destinations",
        });
    }
};

module.exports = {
    getAllDestinations,
    getDestinationById,
    createDestination,
    updateDestination,
    deleteDestination,
    togglePopularity,
    getPopularDestinations,
};
