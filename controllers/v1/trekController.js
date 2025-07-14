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
    Badge,
    CancellationPolicy,
} = require("../../models");
const { Op } = require("sequelize");

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

// Helper function to fetch activity details by IDs
const fetchActivityDetails = async (activityIds) => {
    if (
        !activityIds ||
        !Array.isArray(activityIds) ||
        activityIds.length === 0
    ) {
        return [];
    }

    try {
        const activities = await Activity.findAll({
            where: {
                id: activityIds,
                is_active: true,
            },
            attributes: ["id", "name", "category_name"],
            order: [["name", "ASC"]],
        });

        return activities;
    } catch (error) {
        console.error("Error fetching activity details:", error);
        return [];
    }
};

// Helper function to fetch cancellation policy details by IDs
const fetchCancellationPolicyDetails = async (policyIds) => {
    if (!policyIds || !Array.isArray(policyIds) || policyIds.length === 0) {
        return [];
    }

    try {
        const policies = await CancellationPolicy.findAll({
            where: {
                id: policyIds,
                is_active: true,
            },
            attributes: [
                "id",
                "title",
                "description",
                "rules",
                "descriptionPoints",
            ],
            order: [
                ["sort_order", "ASC"],
                ["title", "ASC"],
            ],
        });

        return policies;
    } catch (error) {
        console.error("Error fetching cancellation policy details:", error);
        return [];
    }
};

// Mobile: Get all active treks
exports.getAllTreks = async (req, res) => {
    try {
        console.log("Starting getAllTreks function");

        const {
            page = 1,
            limit = 20,
            category,
            difficulty,
            destination_id,
            city_id,
            start_date,
        } = req.query;
        const offset = (page - 1) * limit;

        // Build where clause
        const whereClause = { status: "active" };

        if (category) {
            whereClause.category = category;
        }

        if (difficulty) {
            whereClause.difficulty = difficulty;
        }

        if (destination_id) {
            whereClause.destination_id = destination_id;
        }

        if (city_id) {
            whereClause.city_id = city_id;
        }

        // Get treks with pagination
        const { count, rows: treks } = await Trek.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Vendor,
                    as: "vendor",
                    attributes: ["id"],
                    include: [
                        {
                            model: User,
                            as: "user",
                            attributes: ["id", "name", "email", "phone"],
                        },
                    ],
                },
                {
                    model: Destination,
                    as: "destinationData",
                    attributes: ["id", "name"],
                },
                {
                    model: City,
                    as: "city",
                    attributes: ["id", "cityName"],
                },
                {
                    model: Badge,
                    as: "badge",
                    attributes: ["id", "name", "icon", "color", "category"],
                    where: { is_active: true },
                    required: false,
                },
            ],
            order: [["created_at", "DESC"]],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        // Fetch activity details for each trek
        const treksWithActivities = await Promise.all(
            treks.map(async (trek) => {
                const trekData = trek.toJSON();

                // Fetch activity details if activities field exists and contains IDs
                if (trekData.activities && Array.isArray(trekData.activities)) {
                    const activityDetails = await fetchActivityDetails(
                        trekData.activities
                    );
                    // Replace activity IDs with activity names
                    trekData.activities = activityDetails.map(
                        (activity) => activity.name
                    );
                } else {
                    trekData.activities = [];
                }

                // Fetch cancellation policy details if cancellation_policies field exists and contains IDs
                if (
                    trekData.cancellation_policies &&
                    Array.isArray(trekData.cancellation_policies)
                ) {
                    const cancellationPolicyDetails =
                        await fetchCancellationPolicyDetails(
                            trekData.cancellation_policies
                        );
                    // Replace policy IDs with policy details
                    trekData.cancellation_policies = cancellationPolicyDetails;
                } else {
                    trekData.cancellation_policies = [];
                }

                // Calculate average rating for this trek
                const trekRating = await calculateTrekRating(trekData.id);
                trekData.rating = trekRating.overall;
                trekData.ratingCount = trekRating.ratingCount;
                trekData.categoryRatings = trekRating.categories;

                // Flatten destination structure
                if (trekData.destinationData) {
                    trekData.destination = trekData.destinationData.name;
                    delete trekData.destinationData;
                }

                // Flatten vendor structure
                if (trekData.vendor && trekData.vendor.user) {
                    trekData.vendor = trekData.vendor.user.name;
                }

                // Flatten city structure
                if (trekData.city) {
                    trekData.city = trekData.city.cityName;
                }

                // Add badge information
                if (trekData.badge) {
                    trekData.badge = {
                        name: trekData.badge.name,
                        color: trekData.badge.color,
                    };
                } else {
                    trekData.badge = null;
                }

                // Add batch data if start_date is provided
                if (start_date) {
                    const batch = await Batch.findOne({
                        where: {
                            trek_id: trekData.id,
                            start_date: start_date,
                        },
                        attributes: [
                            "id",
                            "start_date",
                            "end_date",
                            "capacity",
                            "available_slots",
                        ],
                    });

                    if (batch) {
                        trekData.batch = {
                            id: batch.id,
                            start_date: batch.start_date,
                            end_date: batch.end_date,
                            capacity: batch.capacity,
                            available_slots: batch.available_slots,
                        };
                    } else {
                        trekData.batch = null;
                    }
                } else {
                    trekData.batch = null;
                }

                return trekData;
            })
        );

        console.log("Found treks:", treksWithActivities.length);

        res.json({
            success: true,
            data: treksWithActivities,
            count: treksWithActivities.length,
            totalCount: count,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalCount: count,
            },
        });
    } catch (error) {
        console.error("Error fetching treks:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch treks",
            error: error.message,
        });
    }
};

// Mobile: Get trek by ID
exports.getTrekById = async (req, res) => {
    try {
        const { id } = req.params;
        const { start_date } = req.query;
        console.log("Looking for trek with id:", id);
        const trek = await Trek.findOne({
            where: { id },
            include: [
                {
                    model: Vendor,
                    as: "vendor",
                    attributes: ["id"],
                    include: [
                        {
                            model: User,
                            as: "user",
                            attributes: ["id", "name", "email", "phone"],
                        },
                    ],
                },
                {
                    model: Destination,
                    as: "destinationData",
                    attributes: ["id", "name"],
                },
                {
                    model: City,
                    as: "city",
                    attributes: ["id", "cityName"],
                },
                {
                    model: Badge,
                    as: "badge",
                    attributes: ["id", "name", "icon", "color", "category"],
                    where: { is_active: true },
                    required: false,
                },
            ],
        });
        console.log("Trek found:", trek);
        if (!trek) {
            return res.status(404).json({
                success: false,
                message: "Trek not found",
            });
        }

        // Calculate rating
        const trekRating = await calculateTrekRating(trek.id);
        const trekData = {
            ...trek.toJSON(),
            rating: trekRating.overall,
            ratingCount: trekRating.ratingCount,
            categoryRatings: trekRating.categories,
        };

        // Fetch activity details if activities field exists and contains IDs
        if (trekData.activities && Array.isArray(trekData.activities)) {
            const activityDetails = await fetchActivityDetails(
                trekData.activities
            );
            // Replace activity IDs with activity names
            trekData.activities = activityDetails.map(
                (activity) => activity.name
            );
        } else {
            trekData.activities = [];
        }

        // Fetch cancellation policy details if cancellation_policies field exists and contains IDs
        if (
            trekData.cancellation_policies &&
            Array.isArray(trekData.cancellation_policies)
        ) {
            const cancellationPolicyDetails =
                await fetchCancellationPolicyDetails(
                    trekData.cancellation_policies
                );
            // Replace policy IDs with policy details
            trekData.cancellation_policies = cancellationPolicyDetails;
        } else {
            trekData.cancellation_policies = [];
        }

        // Flatten destination structure
        if (trekData.destinationData) {
            trekData.destination = trekData.destinationData.name;
            delete trekData.destinationData;
        }

        // Flatten vendor structure
        if (trekData.vendor && trekData.vendor.user) {
            trekData.vendor = trekData.vendor.user.name;
        }

        // Flatten city structure
        if (trekData.city) {
            trekData.city = trekData.city.cityName;
        }

        // Add badge information
        if (trekData.badge) {
            trekData.badge = {
                name: trekData.badge.name,
                color: trekData.badge.color,
            };
        } else {
            trekData.badge = null;
        }

        // Add batch data if batch_id or start_date is provided
        const { batch_id } = req.query;
        if (batch_id) {
            const batch = await Batch.findOne({
                where: {
                    id: batch_id,
                    trek_id: trekData.id,
                },
                attributes: [
                    "id",
                    "start_date",
                    "end_date",
                    "capacity",
                    "available_slots",
                ],
            });
            if (batch) {
                trekData.batch = {
                    id: batch.id,
                    start_date: batch.start_date,
                    end_date: batch.end_date,
                    capacity: batch.capacity,
                    available_slots: batch.available_slots,
                };
            } else {
                trekData.batch = null;
            }
        } else if (start_date) {
            const batch = await Batch.findOne({
                where: {
                    trek_id: trekData.id,
                    start_date: start_date,
                },
                attributes: [
                    "id",
                    "start_date",
                    "end_date",
                    "capacity",
                    "available_slots",
                ],
            });
            if (batch) {
                trekData.batch = {
                    id: batch.id,
                    start_date: batch.start_date,
                    end_date: batch.end_date,
                    capacity: batch.capacity,
                    available_slots: batch.available_slots,
                };
            } else {
                trekData.batch = null;
            }
        } else {
            trekData.batch = null;
        }

        // Fetch reviews for this trek
        const { count: reviewCount, rows: reviews } =
            await Review.findAndCountAll({
                where: { trek_id: trekData.id, status: "approved" },
                include: [
                    {
                        model: Customer,
                        as: "customer",
                        attributes: ["id", "name"],
                    },
                ],
                order: [["created_at", "DESC"]],
                limit: 10, // Limit to latest 10 reviews
            });

        trekData.reviews = reviews;
        trekData.reviewCount = reviewCount;

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

// Mobile: Get trek batches
exports.getTrekBatches = async (req, res) => {
    try {
        const { id } = req.params;

        // Verify trek exists and is active
        const trek = await Trek.findOne({
            where: { id: id, status: "active" },
        });

        if (!trek) {
            return res.status(404).json({
                success: false,
                message: "Trek not found",
            });
        }

        const batches = await Batch.findAll({
            where: {
                trek_id: id,
                start_date: {
                    [Op.gte]: new Date(),
                },
            },
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

// Mobile: Get trek reviews
exports.getTrekReviews = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        // Verify trek exists
        const trek = await Trek.findByPk(id);
        if (!trek) {
            return res.status(404).json({
                success: false,
                message: "Trek not found",
            });
        }

        const { count, rows: reviews } = await Review.findAndCountAll({
            where: { trek_id: id, status: "approved" },
            include: [
                {
                    model: Customer,
                    as: "customer",
                    attributes: ["id", "name"],
                },
            ],
            order: [["created_at", "DESC"]],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        res.json({
            success: true,
            data: reviews,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalCount: count,
            },
        });
    } catch (error) {
        console.error("Error fetching trek reviews:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch reviews",
        });
    }
};

// Mobile: Get trek ratings
exports.getTrekRatings = async (req, res) => {
    try {
        const { id } = req.params;

        // Verify trek exists
        const trek = await Trek.findByPk(id);
        if (!trek) {
            return res.status(404).json({
                success: false,
                message: "Trek not found",
            });
        }

        const ratings = await Rating.findAll({
            where: { trek_id: id },
            include: [
                {
                    model: RatingCategory,
                    as: "category",
                },
                {
                    model: Customer,
                    as: "customer",
                    attributes: ["id", "name"],
                },
            ],
            order: [["created_at", "DESC"]],
        });

        // Calculate overall rating
        const trekRating = await calculateTrekRating(id);

        res.json({
            success: true,
            data: {
                overall: trekRating.overall,
                ratingCount: trekRating.ratingCount,
                categoryRatings: trekRating.categories,
                ratings: ratings,
            },
        });
    } catch (error) {
        console.error("Error fetching trek ratings:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch ratings",
        });
    }
};
