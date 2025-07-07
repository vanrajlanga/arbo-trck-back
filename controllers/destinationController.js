const { Destination, Trek } = require("../models");
const { Op } = require("sequelize");

// Get all destinations
const getAllDestinations = async (req, res) => {
    try {
        const { search, status, page = 1, limit = 100 } = req.query;

        const whereClause = {};

        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { state: { [Op.like]: `%${search}%` } },
            ];
        }

        if (status && status !== "all") {
            whereClause.status = status;
        }

        const offset = (page - 1) * limit;

        const { count, rows: destinations } = await Destination.findAndCountAll(
            {
                where: whereClause,
                limit: parseInt(limit),
                offset: offset,
                order: [["name", "ASC"]],
            }
        );

        // Calculate statistics
        const totalDestinations = await Destination.count();
        const activeDestinations = await Destination.count({
            where: { status: "active" },
        });
        const popularDestinations = await Destination.count({
            where: { isPopular: true },
        });

        res.json({
            success: true,
            data: {
                destinations,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(count / limit),
                    totalItems: count,
                    itemsPerPage: parseInt(limit),
                },
                statistics: {
                    totalDestinations,
                    activeDestinations,
                    popularDestinations,
                },
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
                    where: { status: "active" },
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
        const { name, state, isPopular, status } = req.body;

        // Validate required fields
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Name is required",
            });
        }

        // Check if destination with same name already exists
        const existingDestination = await Destination.findOne({
            where: { name: { [Op.like]: name } },
        });

        if (existingDestination) {
            return res.status(400).json({
                success: false,
                message: "Destination with this name already exists",
            });
        }

        const destination = await Destination.create({
            name,
            state,
            isPopular: isPopular || false,
            status: status || "active",
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
                    name: { [Op.like]: updateData.name },
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

        // Convert empty altitude string to null
        if (updateData.altitude === "") {
            updateData.altitude = null;
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
            order: [["name", "ASC"]],
        });

        res.json({
            success: true,
            data: destinations,
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
