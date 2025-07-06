const db = require("../models");
const { City, PickupPoint, Mapping, WeatherLog, Trek, Vendor, User } = db;
const { Op } = require("sequelize");

// Get States
const getStates = async (req, res) => {
    try {
        // Get unique states from cities table without any filtering
        const states = await City.findAll({
            attributes: [
                [
                    db.sequelize.fn("DISTINCT", db.sequelize.col("state_name")),
                    "stateName",
                ],
                "region",
            ],
            group: ["state_name", "region"],
            order: [["state_name", "ASC"]],
            raw: true,
        });

        // Transform the data to a cleaner format
        const transformedStates = states.map((state) => ({
            name: state.stateName,
            region: state.region,
        }));

        res.json({
            success: true,
            data: transformedStates,
            count: transformedStates.length,
        });
    } catch (error) {
        console.error("Error fetching states:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch states",
            error: error.message,
        });
    }
};

// City Management
const getCities = async (req, res) => {
    try {
        const { search, region, status, page = 1, limit = 10 } = req.query;

        const whereClause = {};

        if (search) {
            whereClause[Op.or] = [
                { cityName: { [Op.like]: `%${search}%` } },
                { stateName: { [Op.like]: `%${search}%` } },
            ];
        }

        if (region && region !== "all") {
            whereClause.region = region;
        }

        if (status && status !== "all") {
            whereClause.status = status;
        }

        const offset = (page - 1) * limit;

        const { count, rows: cities } = await City.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: offset,
            order: [["created_at", "DESC"]],
        });

        // Calculate statistics
        const totalCities = await City.count();
        const activeCities = await City.count({ where: { status: "active" } });
        const totalCustomers = (await City.sum("totalCustomers")) || 0;
        const totalBookings = (await City.sum("totalBookings")) || 0;

        res.json({
            success: true,
            data: {
                cities,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(count / limit),
                    totalItems: count,
                    itemsPerPage: parseInt(limit),
                },
                statistics: {
                    totalCities,
                    activeCities,
                    totalCustomers,
                    totalBookings,
                    growthRate: 23, // This would be calculated based on historical data
                },
            },
        });
    } catch (error) {
        console.error("Error fetching cities:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch cities",
            error: error.message,
        });
    }
};

const getCityById = async (req, res) => {
    try {
        const { id } = req.params;

        const city = await City.findByPk(id, {
            include: [
                {
                    model: PickupPoint,
                    as: "pickupPoints",
                },
                {
                    model: Mapping,
                    as: "mappings",
                    include: [
                        {
                            model: Trek,
                            as: "trek",
                            attributes: ["id", "title"],
                        },
                    ],
                },
            ],
        });

        if (!city) {
            return res.status(404).json({
                success: false,
                message: "City not found",
            });
        }

        res.json({
            success: true,
            data: city,
        });
    } catch (error) {
        console.error("Error fetching city:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch city",
            error: error.message,
        });
    }
};

const createCity = async (req, res) => {
    try {
        const { cityName, stateName, region, status, launchDate, isPopular } =
            req.body;

        // Check if city already exists in the state
        const existingCity = await City.findOne({
            where: {
                cityName: cityName,
                stateName: stateName,
            },
        });

        if (existingCity) {
            return res.status(400).json({
                success: false,
                message: `${cityName} already exists in ${stateName}`,
            });
        }

        const city = await City.create({
            cityName,
            stateName,
            region,
            status,
            isPopular: isPopular || false,
            launchDate,
        });

        res.status(201).json({
            success: true,
            message: "City created successfully",
            data: city,
        });
    } catch (error) {
        console.error("Error creating city:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create city",
            error: error.message,
        });
    }
};

const updateCity = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const city = await City.findByPk(id);
        if (!city) {
            return res.status(404).json({
                success: false,
                message: "City not found",
            });
        }

        await city.update(updateData);

        res.json({
            success: true,
            message: "City updated successfully",
            data: city,
        });
    } catch (error) {
        console.error("Error updating city:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update city",
            error: error.message,
        });
    }
};

const deleteCity = async (req, res) => {
    try {
        const { id } = req.params;

        const city = await City.findByPk(id);
        if (!city) {
            return res.status(404).json({
                success: false,
                message: "City not found",
            });
        }

        // Check if city has associated pickup points or mappings
        const pickupPointsCount = await PickupPoint.count({
            where: { cityId: id },
        });
        const mappingsCount = await Mapping.count({ where: { cityId: id } });

        if (pickupPointsCount > 0 || mappingsCount > 0) {
            return res.status(400).json({
                success: false,
                message:
                    "Cannot delete city with associated pickup points or mappings",
            });
        }

        await city.destroy();

        res.json({
            success: true,
            message: "City deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting city:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete city",
            error: error.message,
        });
    }
};

// Pickup Point Management
const getPickupPoints = async (req, res) => {
    try {
        const { cityId, search, status, page = 1, limit = 10 } = req.query;

        const whereClause = {};

        if (cityId && cityId !== "all") {
            whereClause.cityId = cityId;
        }

        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { address: { [Op.like]: `%${search}%` } },
                { landmark: { [Op.like]: `%${search}%` } },
            ];
        }

        if (status && status !== "all") {
            whereClause.status = status;
        }

        const offset = (page - 1) * limit;

        const { count, rows: pickupPoints } = await PickupPoint.findAndCountAll(
            {
                where: whereClause,
                include: [
                    {
                        model: City,
                        as: "city",
                        attributes: ["id", "cityName", "stateName", "region"],
                    },
                ],
                limit: parseInt(limit),
                offset: offset,
                order: [["createdAt", "DESC"]],
            }
        );

        res.json({
            success: true,
            data: {
                pickupPoints,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(count / limit),
                    totalItems: count,
                    itemsPerPage: parseInt(limit),
                },
            },
        });
    } catch (error) {
        console.error("Error fetching pickup points:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch pickup points",
            error: error.message,
        });
    }
};

const createPickupPoint = async (req, res) => {
    try {
        const pickupPointData = req.body;

        const pickupPoint = await PickupPoint.create(pickupPointData);

        // Fetch the created pickup point with city data
        const createdPickupPoint = await PickupPoint.findByPk(pickupPoint.id, {
            include: [
                {
                    model: City,
                    as: "city",
                    attributes: ["id", "cityName", "stateName", "region"],
                },
            ],
        });

        res.status(201).json({
            success: true,
            message: "Pickup point created successfully",
            data: createdPickupPoint,
        });
    } catch (error) {
        console.error("Error creating pickup point:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create pickup point",
            error: error.message,
        });
    }
};

const updatePickupPoint = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const pickupPoint = await PickupPoint.findByPk(id);
        if (!pickupPoint) {
            return res.status(404).json({
                success: false,
                message: "Pickup point not found",
            });
        }

        await pickupPoint.update(updateData);

        // Fetch updated pickup point with city data
        const updatedPickupPoint = await PickupPoint.findByPk(id, {
            include: [
                {
                    model: City,
                    as: "city",
                    attributes: ["id", "cityName", "stateName", "region"],
                },
            ],
        });

        res.json({
            success: true,
            message: "Pickup point updated successfully",
            data: updatedPickupPoint,
        });
    } catch (error) {
        console.error("Error updating pickup point:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update pickup point",
            error: error.message,
        });
    }
};

const deletePickupPoint = async (req, res) => {
    try {
        const { id } = req.params;

        const pickupPoint = await PickupPoint.findByPk(id);
        if (!pickupPoint) {
            return res.status(404).json({
                success: false,
                message: "Pickup point not found",
            });
        }

        await pickupPoint.destroy();

        res.json({
            success: true,
            message: "Pickup point deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting pickup point:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete pickup point",
            error: error.message,
        });
    }
};

// Mapping Management
const getMappings = async (req, res) => {
    try {
        const { cityId, trekId, status, page = 1, limit = 10 } = req.query;

        const whereClause = {};

        if (cityId && cityId !== "all") {
            whereClause.cityId = cityId;
        }

        if (trekId && trekId !== "all") {
            whereClause.trekId = trekId;
        }

        if (status && status !== "all") {
            whereClause.status = status;
        }

        const offset = (page - 1) * limit;

        const { count, rows: mappings } = await Mapping.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: City,
                    as: "city",
                    attributes: ["id", "cityName", "stateName", "region"],
                },
                {
                    model: Trek,
                    as: "trek",
                    attributes: ["id", "title"],
                    include: [
                        {
                            model: Vendor,
                            as: "vendor",
                            attributes: ["id", "business_name"],
                            include: [
                                {
                                    model: User,
                                    as: "user",
                                    attributes: ["id", "name", "email"],
                                },
                            ],
                        },
                    ],
                },
            ],
            limit: parseInt(limit),
            offset: offset,
            order: [["createdAt", "DESC"]],
        });

        res.json({
            success: true,
            data: {
                mappings,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(count / limit),
                    totalItems: count,
                    itemsPerPage: parseInt(limit),
                },
            },
        });
    } catch (error) {
        console.error("Error fetching mappings:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch mappings",
            error: error.message,
        });
    }
};

const createMapping = async (req, res) => {
    try {
        const mappingData = req.body;

        // Check if mapping already exists
        const existingMapping = await Mapping.findOne({
            where: {
                cityId: mappingData.cityId,
                trekId: mappingData.trekId,
            },
        });

        if (existingMapping) {
            return res.status(400).json({
                success: false,
                message: "Mapping already exists for this city and trek",
            });
        }

        const mapping = await Mapping.create(mappingData);

        // Fetch the created mapping with related data
        const createdMapping = await Mapping.findByPk(mapping.id, {
            include: [
                {
                    model: City,
                    as: "city",
                    attributes: ["id", "cityName", "stateName", "region"],
                },
                {
                    model: Trek,
                    as: "trek",
                    attributes: ["id", "title"],
                },
            ],
        });

        res.status(201).json({
            success: true,
            message: "Mapping created successfully",
            data: createdMapping,
        });
    } catch (error) {
        console.error("Error creating mapping:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create mapping",
            error: error.message,
        });
    }
};

const updateMapping = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const mapping = await Mapping.findByPk(id);
        if (!mapping) {
            return res.status(404).json({
                success: false,
                message: "Mapping not found",
            });
        }

        await mapping.update(updateData);

        // Fetch updated mapping with related data
        const updatedMapping = await Mapping.findByPk(id, {
            include: [
                {
                    model: City,
                    as: "city",
                    attributes: ["id", "cityName", "stateName", "region"],
                },
                {
                    model: Trek,
                    as: "trek",
                    attributes: ["id", "title"],
                },
            ],
        });

        res.json({
            success: true,
            message: "Mapping updated successfully",
            data: updatedMapping,
        });
    } catch (error) {
        console.error("Error updating mapping:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update mapping",
            error: error.message,
        });
    }
};

const deleteMapping = async (req, res) => {
    try {
        const { id } = req.params;

        const mapping = await Mapping.findByPk(id);
        if (!mapping) {
            return res.status(404).json({
                success: false,
                message: "Mapping not found",
            });
        }

        await mapping.destroy();

        res.json({
            success: true,
            message: "Mapping deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting mapping:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete mapping",
            error: error.message,
        });
    }
};

// Weather Management
const getWeatherLogs = async (req, res) => {
    try {
        const {
            cityId,
            trekId,
            date,
            condition,
            page = 1,
            limit = 10,
        } = req.query;

        const whereClause = {};

        if (cityId) {
            whereClause.cityId = cityId;
        }

        if (trekId) {
            whereClause.trekId = trekId;
        }

        if (date) {
            whereClause.date = date;
        }

        if (condition && condition !== "all") {
            whereClause.weatherCondition = condition;
        }

        const offset = (page - 1) * limit;

        const { count, rows: weatherLogs } = await WeatherLog.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: City,
                    as: "city",
                    attributes: ["id", "cityName", "stateName", "region"],
                },
                {
                    model: Trek,
                    as: "trek",
                    attributes: ["id", "title"],
                    required: false,
                },
            ],
            limit: parseInt(limit),
            offset: offset,
            order: [
                ["date", "DESC"],
                ["createdAt", "DESC"],
            ],
        });

        res.json({
            success: true,
            data: {
                weatherLogs,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(count / limit),
                    totalItems: count,
                    itemsPerPage: parseInt(limit),
                },
            },
        });
    } catch (error) {
        console.error("Error fetching weather logs:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch weather logs",
            error: error.message,
        });
    }
};

const createWeatherLog = async (req, res) => {
    try {
        const weatherData = req.body;

        const weatherLog = await WeatherLog.create(weatherData);

        // Fetch the created weather log with related data
        const createdWeatherLog = await WeatherLog.findByPk(weatherLog.id, {
            include: [
                {
                    model: City,
                    as: "city",
                    attributes: ["id", "cityName", "stateName", "region"],
                },
                {
                    model: Trek,
                    as: "trek",
                    attributes: ["id", "title"],
                    required: false,
                },
            ],
        });

        res.status(201).json({
            success: true,
            message: "Weather log created successfully",
            data: createdWeatherLog,
        });
    } catch (error) {
        console.error("Error creating weather log:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create weather log",
            error: error.message,
        });
    }
};

module.exports = {
    // Cities
    getCities,
    getCityById,
    createCity,
    updateCity,
    deleteCity,

    // Pickup Points
    getPickupPoints,
    createPickupPoint,
    updatePickupPoint,
    deletePickupPoint,

    // Mappings
    getMappings,
    createMapping,
    updateMapping,
    deleteMapping,

    // Weather
    getWeatherLogs,
    createWeatherLog,

    // States
    getStates,
};
