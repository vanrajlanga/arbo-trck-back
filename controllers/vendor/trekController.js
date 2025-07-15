const {
    Trek,
    Vendor,
    User,
    ItineraryItem,
    Accommodation,
    TrekImage,
    TrekStage,
    Batch,
    Destination,
    City,
    State,
    Review,
    Rating,
    RatingCategory,
    Customer,
    Activity,
} = require("../../models");
const { validationResult } = require("express-validator");
const { saveBase64Image, deleteImage } = require("../../utils/fileUpload");
const { Op } = require("sequelize");
const logger = require("../../utils/logger");

// Helper function to parse JSON strings or return arrays
const parseJsonField = (field) => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    if (typeof field === "string") {
        try {
            const parsed = JSON.parse(field);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }
    return [];
};

// Helper function to validate activity IDs
const validateActivityIds = async (activityIds) => {
    if (!activityIds || !Array.isArray(activityIds)) return true;

    const validIds = activityIds.filter((id) => Number.isInteger(id) && id > 0);
    if (validIds.length !== activityIds.length) {
        return false;
    }

    const activities = await Activity.findAll({
        where: { id: validIds, is_active: true },
    });

    return activities.length === validIds.length;
};

// Helper function to calculate trek's overall rating from ratings
const calculateTrekRating = async (trekId) => {
    try {
        const ratings = await Rating.findAll({
            where: {
                trek_id: trekId,
            },
            include: [
                {
                    model: RatingCategory,
                    as: "category",
                },
            ],
        });

        if (ratings.length === 0)
            return { overall: 0, categories: {}, ratingCount: 0 };

        const categoryRatings = {};
        const categoryCounts = {};

        // Initialize category ratings
        const categories = await RatingCategory.findAll({
            where: { is_active: true },
        });
        categories.forEach((cat) => {
            categoryRatings[cat.name] = 0;
            categoryCounts[cat.name] = 0;
        });

        // Calculate category averages
        ratings.forEach((rating) => {
            const categoryName = rating.category.name;
            categoryRatings[categoryName] += parseFloat(rating.rating_value);
            categoryCounts[categoryName]++;
        });

        // Calculate averages
        Object.keys(categoryRatings).forEach((category) => {
            if (categoryCounts[category] > 0) {
                categoryRatings[category] = parseFloat(
                    (
                        categoryRatings[category] / categoryCounts[category]
                    ).toFixed(2)
                );
            }
        });

        // Calculate overall average
        const overallSum = Object.values(categoryRatings).reduce(
            (sum, rating) => sum + rating,
            0
        );
        const overall = parseFloat(
            (overallSum / Object.keys(categoryRatings).length).toFixed(2)
        );

        return {
            overall,
            categories: categoryRatings,
            ratingCount: ratings.length,
        };
    } catch (error) {
        console.error("Error calculating trek rating:", error);
        return { overall: 0, categories: {}, ratingCount: 0 };
    }
};

// Helper function to ensure proper JSON array storage
const ensureJsonArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === "string") {
        try {
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }
    return [];
};

// Helper function to generate discount text
const generateDiscountText = (hasDiscount, discountValue, discountType) => {
    if (!hasDiscount || !discountValue || discountValue <= 0) {
        return null;
    }

    if (discountType === "percentage") {
        return `${Math.round(discountValue)}% OFF`;
    } else if (discountType === "fixed") {
        return `₹${Math.round(discountValue)} OFF`;
    }

    return null;
};

// Vendor: Get all treks for a vendor
exports.getVendorTreks = async (req, res) => {
    try {
        const vendorId = req.user.id; // Changed from req.user.vendorId to req.user.id

        logger.trek("info", "Fetching vendor treks", {
            vendorId,
            ip: req.ip,
            userAgent: req.get("User-Agent"),
        });

        if (!vendorId) {
            logger.trek("warn", "Access denied - no vendor ID", {
                ip: req.ip,
                userAgent: req.get("User-Agent"),
            });
            return res.status(403).json({
                success: false,
                message: "Access denied. Vendor account required.",
            });
        }

        const treks = await Trek.findAll({
            where: { vendor_id: vendorId },
            include: [
                {
                    model: Destination,
                    as: "destinationData",
                    required: false,
                },
                {
                    model: ItineraryItem,
                    as: "itinerary_items",
                    required: false,
                },
                {
                    model: Accommodation,
                    as: "accommodations",
                    required: false,
                },
                {
                    model: TrekImage,
                    as: "images",
                    required: false,
                },
                {
                    model: TrekStage,
                    as: "trek_stages",
                    required: false,
                },
                {
                    model: Batch,
                    as: "batches",
                    required: false,
                },
            ],
            order: [["created_at", "DESC"]],
        });

        // Calculate ratings for each trek and fetch activity details
        const treksWithRatings = await Promise.all(
            treks.map(async (trek) => {
                const trekRating = await calculateTrekRating(trek.id);

                // Fetch activity details if activity IDs exist
                let activityDetails = [];
                if (
                    trek.activities &&
                    Array.isArray(trek.activities) &&
                    trek.activities.length > 0
                ) {
                    activityDetails = await Activity.findAll({
                        where: { id: trek.activities, is_active: true },
                        attributes: ["id", "name", "category_name"],
                    });
                }

                // Fetch city details if city_ids exist
                let cityDetails = [];
                if (
                    trek.city_ids &&
                    Array.isArray(trek.city_ids) &&
                    trek.city_ids.length > 0
                ) {
                    cityDetails = await City.findAll({
                        where: { id: trek.city_ids },
                        include: [
                            {
                                model: State,
                                as: "state",
                                required: false,
                            },
                        ],
                        attributes: ["id", "cityName", "isPopular"],
                    });
                }

                return {
                    ...trek.toJSON(),
                    rating: trekRating.overall,
                    ratingCount: trekRating.ratingCount,
                    categoryRatings: trekRating.categories,
                    activityDetails: activityDetails,
                    cityDetails: cityDetails,
                };
            })
        );

        res.json({
            success: true,
            data: treksWithRatings,
        });
    } catch (error) {
        console.error("Error fetching vendor treks:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch treks",
        });
    }
};

// Vendor: Get trek by ID
exports.getTrekById = async (req, res) => {
    try {
        const { id } = req.params;
        const vendorId = req.user.id;

        if (!vendorId) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Vendor account required.",
            });
        }

        const trek = await Trek.findOne({
            where: { id, vendor_id: vendorId },
            include: [
                {
                    model: Destination,
                    as: "destinationData",
                    required: false,
                },
                {
                    model: ItineraryItem,
                    as: "itinerary_items",
                    required: false,
                },
                {
                    model: Accommodation,
                    as: "accommodations",
                    required: false,
                },
                {
                    model: TrekImage,
                    as: "images",
                    required: false,
                },
                {
                    model: TrekStage,
                    as: "trek_stages",
                    required: false,
                },
                {
                    model: Batch,
                    as: "batches",
                    required: false,
                },
            ],
        });

        if (!trek) {
            return res.status(404).json({
                success: false,
                message: "Trek not found",
            });
        }

        // Calculate rating
        const trekRating = await calculateTrekRating(trek.id);

        // Fetch activity details if activity IDs exist
        let activityDetails = [];
        if (
            trek.activities &&
            Array.isArray(trek.activities) &&
            trek.activities.length > 0
        ) {
            activityDetails = await Activity.findAll({
                where: { id: trek.activities, is_active: true },
                attributes: ["id", "name", "category_name"],
            });
        }

        // Fetch city details if city_ids exist
        let cityDetails = [];
        if (
            trek.city_ids &&
            Array.isArray(trek.city_ids) &&
            trek.city_ids.length > 0
        ) {
            cityDetails = await City.findAll({
                where: { id: trek.city_ids },
                include: [
                    {
                        model: State,
                        as: "state",
                        required: false,
                    },
                ],
                attributes: ["id", "cityName", "isPopular"],
            });
        }

        const trekData = {
            ...trek.toJSON(),
            rating: trekRating.overall,
            ratingCount: trekRating.ratingCount,
            categoryRatings: trekRating.categories,
            activityDetails: activityDetails,
            cityDetails: cityDetails,
        };

        res.json({
            success: true,
            data: trekData,
        });
    } catch (error) {
        console.error("Error fetching trek by ID:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch trek",
        });
    }
};

// Vendor: Create trek
exports.createTrek = async (req, res) => {
    try {
        const vendorId = req.user.id;

        logger.trek("info", "Creating new trek", {
            vendorId,
            title: req.body.title,
            destinationId: req.body.destination_id,
            ip: req.ip,
        });

        if (!vendorId) {
            logger.trek(
                "warn",
                "Access denied - no vendor ID for trek creation",
                {
                    ip: req.ip,
                    userAgent: req.get("User-Agent"),
                }
            );
            return res.status(403).json({
                success: false,
                message: "Access denied. Vendor account required.",
            });
        }

        // Validate destination exists
        if (req.body.destination_id) {
            const destination = await Destination.findByPk(
                req.body.destination_id
            );
            if (!destination) {
                return res.status(400).json({
                    success: false,
                    message: "Selected destination does not exist",
                    errors: {
                        destination_id: ["Selected destination does not exist"],
                    },
                });
            }
        }

        // Validate city exists if provided
        if (req.body.city_id) {
            const city = await City.findByPk(req.body.city_id);
            if (!city) {
                return res.status(400).json({
                    success: false,
                    message: "Selected city does not exist",
                    errors: { city_id: ["Selected city does not exist"] },
                });
            }
        }

        // Validate activity IDs if provided
        if (req.body.activities) {
            const areValidActivities = await validateActivityIds(
                req.body.activities
            );
            if (!areValidActivities) {
                return res.status(400).json({
                    success: false,
                    message: "One or more activity IDs are invalid or inactive",
                    errors: {
                        activities: [
                            "One or more activity IDs are invalid or inactive",
                        ],
                    },
                });
            }
        }

        const trekData = {
            ...req.body,
            vendor_id: vendorId,
        };

        const trek = await Trek.create(trekData);

        logger.trek("info", "Trek created successfully", {
            trekId: trek.id,
            vendorId,
            title: trek.title,
        });

        res.status(201).json({
            success: true,
            message: "Trek created successfully",
            data: trek,
        });
    } catch (error) {
        logger.trek("error", "Failed to create trek", {
            vendorId,
            error: error.message,
            stack: error.stack,
            body: req.body,
        });

        res.status(500).json({
            success: false,
            message: "Failed to create trek",
        });
    }
};

// Vendor: Update trek
exports.updateTrek = async (req, res) => {
    try {
        const { id } = req.params;
        const vendorId = req.user.id;

        if (!vendorId) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Vendor account required.",
            });
        }

        const trek = await Trek.findOne({
            where: { id, vendor_id: vendorId },
        });

        if (!trek) {
            return res.status(404).json({
                success: false,
                message: "Trek not found",
            });
        }

        // Validate destination exists if being updated
        if (req.body.destination_id) {
            const destination = await Destination.findByPk(
                req.body.destination_id
            );
            if (!destination) {
                return res.status(400).json({
                    success: false,
                    message: "Selected destination does not exist",
                    errors: {
                        destination_id: ["Selected destination does not exist"],
                    },
                });
            }
        }

        // Validate city exists if being updated
        if (req.body.city_id) {
            const city = await City.findByPk(req.body.city_id);
            if (!city) {
                return res.status(400).json({
                    success: false,
                    message: "Selected city does not exist",
                    errors: { city_id: ["Selected city does not exist"] },
                });
            }
        }

        // Validate activity IDs if being updated
        if (req.body.activities) {
            const areValidActivities = await validateActivityIds(
                req.body.activities
            );
            if (!areValidActivities) {
                return res.status(400).json({
                    success: false,
                    message: "One or more activity IDs are invalid or inactive",
                    errors: {
                        activities: [
                            "One or more activity IDs are invalid or inactive",
                        ],
                    },
                });
            }
        }

        await trek.update(req.body);

        res.json({
            success: true,
            message: "Trek updated successfully",
            data: trek,
        });
    } catch (error) {
        console.error("Error updating trek:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update trek",
        });
    }
};

// Vendor: Delete trek
exports.deleteTrek = async (req, res) => {
    try {
        const { id } = req.params;
        const vendorId = req.user.id;

        if (!vendorId) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Vendor account required.",
            });
        }

        const trek = await Trek.findOne({
            where: { id, vendor_id: vendorId },
        });

        if (!trek) {
            return res.status(404).json({
                success: false,
                message: "Trek not found",
            });
        }

        // Delete associated images
        const images = await TrekImage.findAll({
            where: { trek_id: id },
        });

        for (const image of images) {
            if (image.image_url) {
                await deleteImage(image.image_url);
            }
        }

        await trek.destroy();

        res.json({
            success: true,
            message: "Trek deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting trek:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete trek",
        });
    }
};

// Vendor: Toggle trek status
exports.toggleTrekStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const vendorId = req.user.id;

        if (!vendorId) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Vendor account required.",
            });
        }

        const trek = await Trek.findOne({
            where: { id, vendor_id: vendorId },
        });

        if (!trek) {
            return res.status(404).json({
                success: false,
                message: "Trek not found",
            });
        }

        const newStatus = trek.status === "active" ? "inactive" : "active";
        await trek.update({ status: newStatus });

        res.json({
            success: true,
            message: `Trek ${newStatus} successfully`,
            data: trek,
        });
    } catch (error) {
        console.error("Error toggling trek status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to toggle trek status",
        });
    }
};

// Vendor: Get trek batches
exports.getTrekBatches = async (req, res) => {
    try {
        const { id } = req.params;
        const vendorId = req.user.id;

        if (!vendorId) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Vendor account required.",
            });
        }

        // Verify trek belongs to vendor
        const trek = await Trek.findOne({
            where: { id: id, vendor_id: vendorId },
        });

        if (!trek) {
            return res.status(404).json({
                success: false,
                message: "Trek not found",
            });
        }

        const batches = await Batch.findAll({
            where: { trek_id: id },
            order: [["start_date", "ASC"]],
        });

        const transformedBatches = batches.map((batch) => ({
            id: batch.id,
            startDate: batch.start_date,
            endDate: batch.end_date,
            capacity: batch.capacity,
            bookedSlots: batch.booked_slots || 0,
            availableSlots:
                batch.available_slots ||
                batch.capacity - (batch.booked_slots || 0),
            isAvailable:
                (batch.available_slots ||
                    batch.capacity - (batch.booked_slots || 0)) > 0,
        }));

        res.json({
            success: true,
            data: transformedBatches,
        });
    } catch (error) {
        console.error("Error fetching trek batches:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch trek batches",
        });
    }
};

// Vendor: Create batches for a trek
exports.createBatches = async (req, res) => {
    try {
        console.log("🔍 Debug - createBatches called with:", req.body);
        const { serviceDates, capacity } = req.body;
        const trek_id = req.params.id; // Get trek_id from URL parameter
        const vendorId = req.user.id;

        if (!vendorId) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Vendor account required.",
            });
        }

        // Verify the trek belongs to this vendor
        const trek = await Trek.findOne({
            where: { id: trek_id, vendor_id: vendorId },
        });

        if (!trek) {
            return res.status(404).json({
                success: false,
                message: "Trek not found or access denied.",
            });
        }

        console.log("🔍 Debug - serviceDates:", serviceDates);
        console.log("🔍 Debug - serviceDates type:", typeof serviceDates);
        console.log(
            "🔍 Debug - serviceDates isArray:",
            Array.isArray(serviceDates)
        );

        if (
            !serviceDates ||
            !Array.isArray(serviceDates) ||
            serviceDates.length === 0
        ) {
            console.log("🔍 Debug - Service dates validation failed");
            return res.status(400).json({
                success: false,
                message: "Service dates are required.",
            });
        }

        const durationDays = trek.duration_days || 1;
        const batchCapacity = capacity || trek.max_participants || 20;

        // Create batches for each service date
        const createdBatches = [];
        for (const startDate of serviceDates) {
            // Calculate end date based on duration
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + durationDays - 1);

            const batch = await Batch.create({
                trek_id: trek_id,
                start_date: startDate,
                end_date: endDate.toISOString().split("T")[0], // Format as YYYY-MM-DD
                capacity: batchCapacity,
                booked_slots: 0,
                available_slots: batchCapacity,
            });

            createdBatches.push(batch);
        }

        res.json({
            success: true,
            message: `${createdBatches.length} batches created successfully`,
            data: createdBatches,
        });
    } catch (error) {
        console.error("Error creating batches:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create batches",
        });
    }
};
