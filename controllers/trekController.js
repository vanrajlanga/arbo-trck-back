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
} = require("../models");
const { validationResult } = require("express-validator");
const { saveBase64Image, deleteImage } = require("../utils/fileUpload");
const { Op } = require("sequelize");

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

// Get all treks for a vendor
exports.getVendorTreks = async (req, res) => {
    try {
        const vendorId = req.user.vendorId;

        if (!vendorId) {
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
                    model: City,
                    as: "city",
                    required: false,
                    include: [
                        {
                            model: State,
                            as: "state",
                            required: false,
                        },
                    ],
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

        // Debug logging
        console.log(
            "Raw treks from database:",
            treks.map((t) => ({
                id: t.id,
                title: t.title,
                destination: t.destination,
                destination_id: t.destination_id,
                destinationData: t.destinationData,
            }))
        );

        // Transform data to match frontend format
        const transformedTreks = await Promise.all(
            treks.map(async (trek) => {
                const trekRating = await calculateTrekRating(trek.id);

                return {
                    id: trek.id,
                    name: trek.title,
                    description: trek.description,
                    destination_id: trek.destination_id,
                    destination: trek.destinationData?.name || "",
                    city_id: trek.city_id,
                    city: trek.city?.cityName || "",
                    duration: trek.duration,
                    durationDays: trek.duration_days,
                    durationNights: trek.duration_nights,
                    price: trek.base_price,
                    difficulty: trek.difficulty,
                    trekType: trek.trek_type,
                    category: trek.category,
                    status: trek.status,
                    meetingPoint: trek.meeting_point || "",
                    meetingTime: trek.meeting_time || "",
                    images:
                        trek.images?.map((img) => `storage/${img.url}`) || [],
                    itinerary:
                        trek.itinerary_items?.map((item) => ({
                            day: item.day_number,
                            activities: item.activities || [],
                        })) || [],
                    accommodations:
                        trek.accommodations?.map((acc, index) => ({
                            night: index + 1,
                            type: acc.type || "",
                            date: acc.details?.date || "",
                            location: acc.details?.location || "",
                            description: acc.details?.description || "",
                        })) || [],
                    trekStages:
                        trek.trek_stages?.map((stage) => ({
                            id: stage.id,
                            stage_name: stage.stage_name || stage.name || "",
                            means_of_transport: stage.means_of_transport || "",
                            date_time: stage.date_time || "",
                        })) || [],
                    batches:
                        trek.batches?.map((batch) => ({
                            id: batch.id,
                            startDate: batch.start_date,
                            endDate: batch.end_date,
                            capacity: batch.capacity,
                            bookedSlots: batch.booked_slots || 0,
                            availableSlots:
                                batch.available_slots ||
                                batch.capacity - (batch.booked_slots || 0),
                        })) || [],
                    inclusions: parseJsonField(trek.inclusions),
                    exclusions: parseJsonField(trek.exclusions),
                    rating: trekRating.overall,
                    ratingDetails: trekRating,
                    hasDiscount: trek.has_discount || false,
                    discountValue: parseFloat(trek.discount_value) || 0.0,
                    discountType: trek.discount_type || "percentage",
                    discountText: generateDiscountText(
                        trek.has_discount,
                        trek.discount_value,
                        trek.discount_type
                    ),
                    cancellationPolicies: parseJsonField(
                        trek.cancellation_policies
                    ),
                    otherPolicies: parseJsonField(trek.other_policies),
                    activities: parseJsonField(trek.activities),
                    createdAt: trek.created_at,
                    updatedAt: trek.updated_at,
                };
            })
        );

        res.json({
            success: true,
            data: transformedTreks,
        });
    } catch (error) {
        console.error("Error fetching vendor treks:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch treks",
            error: error.message,
        });
    }
};

// Get single trek by ID
exports.getTrekById = async (req, res) => {
    try {
        const { id } = req.params;
        const vendorId = req.user.vendorId;

        if (!vendorId) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Vendor account required.",
            });
        }

        const trek = await Trek.findOne({
            where: {
                id: id,
                vendor_id: vendorId,
            },
            include: [
                {
                    model: Destination,
                    as: "destinationData",
                    required: false,
                },
                {
                    model: City,
                    as: "city",
                    required: false,
                    include: [
                        {
                            model: State,
                            as: "state",
                            required: false,
                        },
                    ],
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

        // Include ratings
        const trekRating = await calculateTrekRating(trek.id);
        trek.dataValues.rating = trekRating.overall;
        trek.dataValues.ratingCount = trekRating.ratingCount;
        trek.dataValues.categoryRatings = trekRating.categories;

        // Get individual customer ratings
        const customerRatings = await Rating.findAll({
            where: { trek_id: trek.id },
            include: [
                {
                    model: RatingCategory,
                    as: "category",
                },
                {
                    model: Customer,
                    as: "customer",
                    attributes: ["id", "name", "email"],
                },
            ],
            order: [["created_at", "DESC"]],
        });

        // Get all reviews for this trek
        const allReviews = await Review.findAll({
            where: { trek_id: trek.id, status: "approved" },
            include: [
                {
                    model: Customer,
                    as: "customer",
                    attributes: ["id", "name", "email"],
                },
            ],
        });

        // Group ratings by customer and attach reviews
        const customerRatingsMap = new Map();

        customerRatings.forEach((rating) => {
            const customerId = rating.customer?.id || "anonymous";
            const customerName = rating.customer?.name || "Anonymous";
            const customerEmail = rating.customer?.email;

            if (!customerRatingsMap.has(customerId)) {
                customerRatingsMap.set(customerId, {
                    customer: {
                        id: customerId,
                        name: customerName,
                        email: customerEmail,
                    },
                    ratings: [],
                    reviews: [],
                    categoryRatings: {},
                });
            }

            const customerData = customerRatingsMap.get(customerId);
            customerData.ratings.push({
                id: rating.id,
                category: rating.category?.name || "Overall",
                rating: parseFloat(rating.rating_value),
                createdAt: rating.created_at,
            });

            // Add category rating
            if (rating.category?.name) {
                customerData.categoryRatings[rating.category.name] = parseFloat(
                    rating.rating_value
                );
            }
        });

        // Attach reviews to each customer
        allReviews.forEach((review) => {
            const customerId = review.customer?.id || "anonymous";
            if (customerRatingsMap.has(customerId)) {
                customerRatingsMap.get(customerId).reviews.push({
                    id: review.id,
                    title: review.title,
                    content: review.content,
                    createdAt: review.created_at,
                });
            }
        });

        // Transform to final format
        const customerRatingAndReview = Array.from(
            customerRatingsMap.values()
        ).map((customerData) => {
            // Calculate overall rating from category ratings
            const categoryValues = Object.values(customerData.categoryRatings);
            const overallRating =
                categoryValues.length > 0
                    ? parseFloat(
                          (
                              categoryValues.reduce(
                                  (sum, rating) => sum + rating,
                                  0
                              ) / categoryValues.length
                          ).toFixed(2)
                      )
                    : 0;

            return {
                customer: customerData.customer,
                rating: overallRating, // Overall rating for this customer
                categoryRatings: customerData.categoryRatings, // Individual category ratings
                reviews: customerData.reviews, // All reviews by this customer
                createdAt:
                    customerData.ratings.length > 0
                        ? customerData.ratings[0].createdAt
                        : new Date(),
            };
        });

        // Transform data to match frontend format
        const transformedTrek = {
            id: trek.id,
            name: trek.title,
            description: trek.description,
            destination: trek.destinationData?.name || "",
            destination_id: trek.destination_id,
            city_id: trek.city_id,
            city: trek.city
                ? {
                      id: trek.city.id,
                      cityName: trek.city.cityName,
                      state: trek.city.state
                          ? {
                                id: trek.city.state.id,
                                name: trek.city.state.name,
                            }
                          : null,
                  }
                : null,
            duration: trek.duration || "",
            durationDays: trek.duration_days || "",
            durationNights: trek.duration_nights || "",
            price: trek.base_price,
            difficulty: trek.difficulty || "moderate",
            trekType: trek.trek_type,
            category: trek.category,
            status: trek.status === "active" ? "active" : "deactive",
            images: trek.images?.map((img) => `storage/${img.url}`) || [],
            itinerary:
                trek.itinerary_items?.map((item) => ({
                    day: item.day_number,
                    activities: item.activities || [],
                })) || [],
            accommodations:
                trek.accommodations?.map((acc, index) => ({
                    night: index + 1,
                    type: acc.type || "",
                    date: acc.details?.date || "",
                    location: acc.details?.location || "",
                    description: acc.details?.description || "",
                })) || [],
            trekStages:
                trek.trek_stages?.map((stage) => ({
                    id: stage.id,
                    stage_name: stage.stage_name || stage.name || "",
                    means_of_transport: stage.means_of_transport || "",
                    date_time: stage.date_time || "",
                })) || [],
            batches:
                trek.batches?.map((batch) => ({
                    id: batch.id,
                    startDate: batch.start_date,
                    endDate: batch.end_date,
                    capacity: batch.capacity,
                    bookedSlots: batch.booked_slots || 0,
                    availableSlots:
                        batch.available_slots ||
                        batch.capacity - (batch.booked_slots || 0),
                })) || [],
            inclusions: parseJsonField(trek.inclusions),
            exclusions: parseJsonField(trek.exclusions),
            meetingPoint: trek.meeting_point || "",
            meetingTime: trek.meeting_time || "",
            rating: trek.rating,
            ratingCount: trek.ratingCount,
            categoryRatings: trek.categoryRatings,
            customerRatingAndReview: customerRatingAndReview,
            hasDiscount: trek.has_discount || false,
            discountValue: parseFloat(trek.discount_value) || 0.0,
            discountType: trek.discount_type || "percentage",
            discountText: generateDiscountText(
                trek.has_discount,
                trek.discount_value,
                trek.discount_type
            ),
            cancellationPolicies: parseJsonField(trek.cancellation_policies),
            otherPolicies: parseJsonField(trek.other_policies),
            activities: parseJsonField(trek.activities),
            createdAt: trek.created_at,
            updatedAt: trek.updated_at,
        };

        console.log("Retrieved trek from DB:", {
            id: trek.id,
            trek_type: trek.trek_type,
            category: trek.category,
        });
        console.log("Transformed trek data:", {
            id: transformedTrek.id,
            trekType: transformedTrek.trekType,
            category: transformedTrek.category,
        });

        res.json({
            success: true,
            data: transformedTrek,
        });
    } catch (error) {
        console.error("Error fetching trek:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch trek",
            error: error.message,
        });
    }
};

// Create new trek
exports.createTrek = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation errors",
                errors: errors.array(),
            });
        }

        const vendorId = req.user.vendorId;

        if (!vendorId) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Vendor account required.",
            });
        }

        const {
            name,
            description,
            destination_id,
            city_id,
            duration,
            durationDays,
            durationNights,
            price,
            difficulty,
            trekType,
            category,
            maxParticipants,
            inclusions,
            exclusions,
            meetingPoint,
            meetingTime,
            itinerary,
            accommodations,
            trekStages,
            images,
            status,
            discountValue,
            discountType,
            hasDiscount,
            cancellationPolicies,
            otherPolicies,
            activities,
            batches,
        } = req.body;

        // Create the trek
        const trek = await Trek.create({
            title: name,
            description,
            vendor_id: vendorId,
            destination_id: destination_id,
            city_id: city_id,
            duration,
            duration_days: durationDays,
            duration_nights: durationNights,
            base_price: price,
            difficulty: difficulty || "moderate",
            trek_type: trekType,
            category: category,
            status: status === "active" ? "active" : "deactive",
            discount_value: discountValue || 0.0,
            discount_type: discountType || "percentage",
            has_discount: hasDiscount || false,
            inclusions: ensureJsonArray(inclusions),
            exclusions: ensureJsonArray(exclusions),
            cancellation_policies: ensureJsonArray(cancellationPolicies),
            other_policies: ensureJsonArray(otherPolicies),
            activities: ensureJsonArray(activities),
        });

        // Add batches if provided
        if (batches && Array.isArray(batches)) {
            const batchItems = batches.map((batch) => ({
                trek_id: trek.id,
                start_date: batch.startDate,
                end_date: batch.endDate,
                capacity: batch.capacity || maxParticipants || 20,
            }));

            await Batch.bulkCreate(batchItems);
        }

        console.log(
            "Created trek with trekType:",
            trekType,
            "category:",
            category
        );
        console.log("Saved trek data:", {
            id: trek.id,
            trek_type: trek.trek_type,
            category: trek.category,
        });

        // Add itinerary items if provided
        if (itinerary && Array.isArray(itinerary)) {
            console.log("Processing itinerary for save:", itinerary);

            const itineraryItems = itinerary.map((item, index) => {
                console.log(
                    `Processing day ${index + 1} activities:`,
                    item.activities
                );

                return {
                    trek_id: trek.id,
                    day_number: item.day || index + 1,
                    activities: ensureJsonArray(item.activities),
                };
            });

            console.log("Final itinerary items to save:", itineraryItems);
            await ItineraryItem.bulkCreate(itineraryItems);
        }

        // Add accommodations if provided
        if (accommodations && Array.isArray(accommodations)) {
            console.log("Processing accommodations for save:", accommodations);

            const accommodationItems = accommodations.map((acc, index) => ({
                trek_id: trek.id,
                type: acc.type || "",
                details: {
                    date: acc.date || "",
                    location: acc.location || "",
                    description: acc.description || "",
                },
            }));

            console.log(
                "Final accommodation items to save:",
                accommodationItems
            );
            await Accommodation.bulkCreate(accommodationItems);
        }

        // Add trek stages if provided
        if (trekStages && Array.isArray(trekStages)) {
            const stageItems = trekStages.map((stage, index) => ({
                trek_id: trek.id,
                stage_name: stage.stage_name || stage.name || "",
                means_of_transport: stage.means_of_transport || "",
                date_time: stage.date_time || "",
            }));

            await TrekStage.bulkCreate(stageItems);
        }

        // Process and save images if provided
        if (images && Array.isArray(images)) {
            const imageItems = [];

            for (const imageData of images) {
                try {
                    // Save base64 image to file system
                    const relativePath = await saveBase64Image(
                        imageData,
                        vendorId
                    );
                    imageItems.push({
                        trek_id: trek.id,
                        url: relativePath,
                    });
                } catch (error) {
                    console.error("Error saving image:", error);
                    // Continue with other images, don't fail the entire request
                }
            }

            if (imageItems.length > 0) {
                await TrekImage.bulkCreate(imageItems);
            }
        }

        res.status(201).json({
            success: true,
            message: "Trek created successfully",
            data: {
                id: trek.id,
                name: trek.title,
                status: trek.status,
            },
        });
    } catch (error) {
        console.error("Error creating trek:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create trek",
            error: error.message,
        });
    }
};

// Update trek
exports.updateTrek = async (req, res) => {
    try {
        const { id } = req.params;
        const vendorId = req.user.vendorId;

        if (!vendorId) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Vendor account required.",
            });
        }

        const {
            name,
            description,
            destination_id,
            city_id,
            duration,
            durationDays,
            durationNights,
            price,
            difficulty,
            trekType,
            category,
            maxParticipants,
            inclusions,
            exclusions,
            meetingPoint,
            meetingTime,
            itinerary,
            accommodations,
            trekStages,
            images,
            status,
            discountValue,
            discountType,
            hasDiscount,
            cancellationPolicies,
            otherPolicies,
            activities,
            batches,
        } = req.body;

        // Debug logging for inclusions and exclusions
        console.log("updateTrek - raw inclusions:", inclusions);
        console.log("updateTrek - raw exclusions:", exclusions);
        console.log(
            "updateTrek - processed inclusions:",
            ensureJsonArray(inclusions)
        );
        console.log(
            "updateTrek - processed exclusions:",
            ensureJsonArray(exclusions)
        );

        // Find the trek
        const trek = await Trek.findOne({
            where: {
                id: id,
                vendor_id: vendorId,
            },
        });

        if (!trek) {
            return res.status(404).json({
                success: false,
                message: "Trek not found",
            });
        }

        // Update trek
        await trek.update({
            title: name,
            description,
            destination_id: destination_id,
            city_id: city_id,
            duration,
            duration_days: durationDays,
            duration_nights: durationNights,
            base_price: price,
            difficulty: difficulty || "moderate",
            trek_type: trekType,
            category: category,
            status: status === "active" ? "active" : "deactive",
            discount_value: discountValue || 0.0,
            discount_type: discountType || "percentage",
            has_discount: hasDiscount || false,
            inclusions: ensureJsonArray(inclusions),
            exclusions: ensureJsonArray(exclusions),
            cancellation_policies: ensureJsonArray(cancellationPolicies),
            other_policies: ensureJsonArray(otherPolicies),
            activities: ensureJsonArray(activities),
        });

        // Update batches
        if (batches && Array.isArray(batches)) {
            console.log("Processing batches for update:", batches);

            // Get existing batches
            const existingBatches = await Batch.findAll({
                where: { trek_id: id },
            });

            // Create a map of existing batch IDs for quick lookup
            const existingBatchIds = new Set(
                existingBatches.map((batch) => batch.id)
            );

            // Process each batch from the request
            for (const batchData of batches) {
                if (batchData.id && existingBatchIds.has(batchData.id)) {
                    // Update existing batch
                    await Batch.update(
                        {
                            start_date: batchData.startDate,
                            end_date: batchData.endDate,
                            capacity: batchData.capacity || 20,
                        },
                        {
                            where: {
                                id: batchData.id,
                                trek_id: id,
                            },
                        }
                    );
                    console.log(`Updated batch ${batchData.id}`);
                } else {
                    // Create new batch
                    await Batch.create({
                        trek_id: id,
                        start_date: batchData.startDate,
                        end_date: batchData.endDate,
                        capacity: batchData.capacity || 20,
                    });
                    console.log(`Created new batch for trek ${id}`);
                }
            }

            // Delete batches that are no longer in the request
            const incomingBatchIds = batches
                .filter((batch) => batch.id)
                .map((batch) => batch.id);

            const batchesToDelete = existingBatches.filter(
                (batch) => !incomingBatchIds.includes(batch.id)
            );

            for (const batchToDelete of batchesToDelete) {
                await batchToDelete.destroy();
                console.log(`Deleted batch ${batchToDelete.id}`);
            }
        } else {
            // If no batches provided, delete all existing batches
            await Batch.destroy({ where: { trek_id: id } });
            console.log(`Deleted all batches for trek ${id}`);
        }

        // Update itinerary items
        if (itinerary && Array.isArray(itinerary)) {
            console.log("Processing itinerary for update:", itinerary);

            // Delete existing itinerary items
            await ItineraryItem.destroy({ where: { trek_id: id } });

            // Create new itinerary items
            const itineraryItems = itinerary.map((item, index) => {
                console.log(
                    `Processing day ${index + 1} activities:`,
                    item.activities
                );

                return {
                    trek_id: trek.id,
                    day_number: item.day || index + 1,
                    activities: ensureJsonArray(item.activities),
                };
            });

            console.log("Final itinerary items to update:", itineraryItems);
            await ItineraryItem.bulkCreate(itineraryItems);
        }

        // Update accommodations
        if (accommodations && Array.isArray(accommodations)) {
            console.log(
                "Processing accommodations for update:",
                accommodations
            );

            // Delete existing accommodations
            await Accommodation.destroy({ where: { trek_id: id } });

            // Create new accommodations
            const accommodationItems = accommodations.map((acc, index) => ({
                trek_id: trek.id,
                type: acc.type || "",
                details: {
                    date: acc.date || "",
                    location: acc.location || "",
                    description: acc.description || "",
                },
            }));

            console.log(
                "Final accommodation items to update:",
                accommodationItems
            );
            await Accommodation.bulkCreate(accommodationItems);
        }

        // Update trek stages
        if (trekStages && Array.isArray(trekStages)) {
            // Delete existing trek stages
            await TrekStage.destroy({ where: { trek_id: id } });

            // Create new trek stages
            const stageItems = trekStages.map((stage, index) => ({
                trek_id: trek.id,
                stage_name: stage.stage_name || stage.name || "",
                means_of_transport: stage.means_of_transport || "",
                date_time: stage.date_time || "",
            }));

            await TrekStage.bulkCreate(stageItems);
        }

        // Update images
        if (images && Array.isArray(images)) {
            // Get existing images to delete old files
            const existingImages = await TrekImage.findAll({
                where: { trek_id: id },
            });

            // Delete old image files
            for (const img of existingImages) {
                await deleteImage(img.url);
            }

            // Delete existing image records
            await TrekImage.destroy({ where: { trek_id: id } });

            // Process and save new images
            const imageItems = [];

            for (const imageData of images) {
                try {
                    // Check if it's a new base64 image or existing URL
                    if (imageData.startsWith("data:image/")) {
                        // Save new base64 image
                        const relativePath = await saveBase64Image(
                            imageData,
                            vendorId
                        );
                        imageItems.push({
                            trek_id: trek.id,
                            url: relativePath,
                        });
                    } else if (imageData.startsWith("/storage/")) {
                        // Existing image URL, extract relative path
                        const relativePath = imageData.replace("/storage/", "");
                        imageItems.push({
                            trek_id: trek.id,
                            url: relativePath,
                        });
                    }
                } catch (error) {
                    console.error("Error processing image:", error);
                    // Continue with other images
                }
            }

            if (imageItems.length > 0) {
                await TrekImage.bulkCreate(imageItems);
            }
        }

        res.json({
            success: true,
            message: "Trek updated successfully",
            data: {
                id: trek.id,
                name: trek.title,
                status: trek.status,
            },
        });
    } catch (error) {
        console.error("Error updating trek:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update trek",
            error: error.message,
        });
    }
};

// Delete trek
exports.deleteTrek = async (req, res) => {
    try {
        const { id } = req.params;
        const vendorId = req.user.vendorId;

        if (!vendorId) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Vendor account required.",
            });
        }

        const trek = await Trek.findOne({
            where: {
                id: id,
                vendor_id: vendorId,
            },
        });

        if (!trek) {
            return res.status(404).json({
                success: false,
                message: "Trek not found",
            });
        }

        // Get and delete image files
        const images = await TrekImage.findAll({ where: { trek_id: id } });
        for (const img of images) {
            await deleteImage(img.url);
        }

        // Delete associated data first
        await ItineraryItem.destroy({ where: { trek_id: id } });
        await TrekStage.destroy({ where: { trek_id: id } });
        await TrekImage.destroy({ where: { trek_id: id } });
        await Accommodation.destroy({ where: { trek_id: id } });

        // Delete the trek
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
            error: error.message,
        });
    }
};

// Toggle trek status
exports.toggleTrekStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const vendorId = req.user.vendorId;

        if (!vendorId) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Vendor account required.",
            });
        }

        const trek = await Trek.findOne({
            where: {
                id: id,
                vendor_id: vendorId,
            },
        });

        if (!trek) {
            return res.status(404).json({
                success: false,
                message: "Trek not found",
            });
        }

        const newStatus = trek.status === "active" ? "deactive" : "active";
        await trek.update({ status: newStatus });

        res.json({
            success: true,
            message: `Trek ${
                newStatus === "active" ? "activated" : "deactivated"
            } successfully`,
            data: {
                id: trek.id,
                status: newStatus,
            },
        });
    } catch (error) {
        console.error("Error toggling trek status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to toggle trek status",
            error: error.message,
        });
    }
};

// Get all treks (Admin only)
exports.getAllTreks = async (req, res) => {
    try {
        const treks = await Trek.findAll({
            include: [
                {
                    model: Destination,
                    as: "destinationData",
                    required: false,
                },
                {
                    model: Vendor,
                    as: "vendor",
                    include: [
                        {
                            model: User,
                            as: "user",
                            attributes: ["name", "email"],
                        },
                    ],
                },
                {
                    model: TrekImage,
                    as: "images",
                    required: false,
                },
            ],
            order: [["created_at", "DESC"]],
        });

        const transformedTreks = treks.map((trek) => ({
            id: trek.id,
            name: trek.title,
            description: trek.description,
            destination: trek.destinationData?.name || "Not specified",
            duration: trek.duration || "Not specified",
            price: trek.base_price,
            difficulty: trek.difficulty || "moderate",
            status: trek.status === "active" ? "active" : "deactive",
            vendorName: trek.vendor?.user?.name || "Unknown Vendor",
            vendorId: trek.vendor_id,
            images: trek.images?.map((img) => `storage/${img.url}`) || [],
            createdAt: trek.created_at,
        }));

        res.json({
            success: true,
            data: transformedTreks,
        });
    } catch (error) {
        console.error("Error fetching all treks:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch treks",
            error: error.message,
        });
    }
};

// Public methods for mobile app (no authentication required)

// Get all published treks for public access
exports.getAllPublicTreks = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            difficulty,
            minPrice,
            maxPrice,
            category,
        } = req.query;

        const whereClause = { status: "active" };

        if (difficulty) whereClause.difficulty = difficulty;
        if (category) whereClause.category = category;
        if (minPrice || maxPrice) {
            whereClause.base_price = {};
            if (minPrice) whereClause.base_price[Op.gte] = parseFloat(minPrice);
            if (maxPrice) whereClause.base_price[Op.lte] = parseFloat(maxPrice);
        }

        const treks = await Trek.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Destination,
                    as: "destinationData",
                    required: false,
                },
                {
                    model: Vendor,
                    as: "vendor",
                    attributes: ["id", "status"],
                    include: [
                        {
                            model: require("../models").User,
                            as: "user",
                            attributes: ["id", "name", "email", "phone"],
                        },
                    ],
                },
                {
                    model: TrekImage,
                    as: "images",
                    required: false,
                    limit: 3, // Only get first 3 images for list view
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
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
        });

        const transformedTreks = await Promise.all(
            treks.rows.map(async (trek) => {
                // Calculate rating for each trek
                const trekRating = await calculateTrekRating(trek.id);

                return {
                    id: trek.id,
                    name: trek.title,
                    description: trek.description,
                    destination: trek.destinationData?.name || "",
                    duration: trek.duration,
                    durationDays: trek.duration_days,
                    durationNights: trek.duration_nights,
                    price: trek.base_price,
                    difficulty: trek.difficulty,
                    category: trek.category,
                    images:
                        trek.images?.map((img) => `storage/${img.url}`) || [],
                    trekStages:
                        trek.trek_stages?.map((stage) => ({
                            id: stage.id,
                            stage_name: stage.stage_name || stage.name || "",
                            means_of_transport: stage.means_of_transport || "",
                            date_time: stage.date_time || "",
                        })) || [],
                    // Rating details
                    rating: trekRating.overall,
                    ratingCount: trekRating.ratingCount,
                    categoryRatings: trekRating.categories,
                    hasDiscount: trek.has_discount || false,
                    discountValue: parseFloat(trek.discount_value) || 0.0,
                    discountType: trek.discount_type || "percentage",
                    discountText: generateDiscountText(
                        trek.has_discount,
                        trek.discount_value,
                        trek.discount_type
                    ),
                    vendor: {
                        id: trek.vendor.id,
                        name: trek.vendor.user?.name || "Unknown Vendor",
                        rating: 4.0, // Default rating since not stored in database
                    },
                    createdAt: trek.created_at,
                };
            })
        );

        res.json({
            success: true,
            data: transformedTreks,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(treks.count / parseInt(limit)),
                totalCount: treks.count,
                hasMore:
                    parseInt(page) < Math.ceil(treks.count / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error("Error fetching public treks:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch treks",
        });
    }
};

// Get single trek details for public access
exports.getPublicTrekById = async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate } = req.query;

        const trek = await Trek.findOne({
            where: {
                id: id,
                status: "active",
            },
            include: [
                {
                    model: Destination,
                    as: "destinationData",
                    required: false,
                },
                {
                    model: City,
                    as: "city",
                    required: false,
                    include: [
                        {
                            model: State,
                            as: "state",
                            required: false,
                        },
                    ],
                },
                {
                    model: Vendor,
                    as: "vendor",
                    attributes: ["id", "status"],
                    include: [
                        {
                            model: require("../models").User,
                            as: "user",
                            attributes: ["id", "name", "email", "phone"],
                        },
                    ],
                },
                {
                    model: ItineraryItem,
                    as: "itinerary_items",
                    required: false,
                    order: [["day_number", "ASC"]],
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

        // Calculate trek rating from ratings
        const trekRating = await calculateTrekRating(trek.id);

        // Get individual customer ratings
        const customerRatingsAndReviews = await Rating.findAll({
            where: { trek_id: trek.id },
            include: [
                {
                    model: RatingCategory,
                    as: "category",
                },
                {
                    model: Customer,
                    as: "customer",
                    attributes: ["id", "name", "email"],
                },
            ],
            order: [["created_at", "DESC"]],
        });

        // Get all reviews for this trek
        const allReviews = await Review.findAll({
            where: { trek_id: trek.id, status: "approved" },
            include: [
                {
                    model: Customer,
                    as: "customer",
                    attributes: ["id", "name", "email"],
                },
            ],
        });

        // Group ratings by customer to calculate overall and category ratings per customer
        const customerRatingsMap = new Map();

        customerRatingsAndReviews.forEach((rating) => {
            const customerId = rating.customer?.id || "anonymous";
            const customerName = rating.customer?.name || "Anonymous";
            const customerEmail = rating.customer?.email;

            if (!customerRatingsMap.has(customerId)) {
                customerRatingsMap.set(customerId, {
                    customer: {
                        id: customerId,
                        name: customerName,
                        email: customerEmail,
                    },
                    ratings: [],
                    reviews: [],
                    categoryRatings: {},
                });
            }

            const customerData = customerRatingsMap.get(customerId);
            customerData.ratings.push({
                id: rating.id,
                category: rating.category?.name || "Overall",
                rating: parseFloat(rating.rating_value),
                createdAt: rating.created_at,
            });

            // Add category rating
            if (rating.category?.name) {
                customerData.categoryRatings[rating.category.name] = parseFloat(
                    rating.rating_value
                );
            }
        });

        // Attach reviews to each customer
        allReviews.forEach((review) => {
            const customerId = review.customer?.id || "anonymous";
            if (customerRatingsMap.has(customerId)) {
                customerRatingsMap.get(customerId).reviews.push({
                    id: review.id,
                    title: review.title,
                    content: review.content,
                    createdAt: review.created_at,
                });
            }
        });

        // Calculate overall rating for each customer and transform to final format
        const customerRatingAndReview = Array.from(
            customerRatingsMap.values()
        ).map((customerData) => {
            // Calculate overall rating from category ratings
            const categoryValues = Object.values(customerData.categoryRatings);
            const overallRating =
                categoryValues.length > 0
                    ? parseFloat(
                          (
                              categoryValues.reduce(
                                  (sum, rating) => sum + rating,
                                  0
                              ) / categoryValues.length
                          ).toFixed(2)
                      )
                    : 0;

            return {
                customer: customerData.customer,
                rating: overallRating, // Overall rating for this customer
                categoryRatings: customerData.categoryRatings, // Individual category ratings
                reviews: customerData.reviews, // All reviews by this customer
                createdAt:
                    customerData.ratings.length > 0
                        ? customerData.ratings[0].createdAt
                        : new Date(),
            };
        });

        let batchInfo = null;

        if (startDate) {
            const targetDate = new Date(startDate).toISOString().split("T")[0]; // Convert to YYYY-MM-DD format
            const matchingBatch = trek.batches?.find((batch) => {
                const batchStartDate = batch.start_date;
                if (!batchStartDate) return false;
                // Convert batch start date to YYYY-MM-DD format for comparison
                const batchDate = new Date(batchStartDate)
                    .toISOString()
                    .split("T")[0];
                return batchDate === targetDate;
            });

            if (matchingBatch) {
                batchInfo = {
                    id: matchingBatch.id,
                    startDate: matchingBatch.start_date,
                    endDate: matchingBatch.end_date,
                    capacity: matchingBatch.capacity,
                    bookedSlots: matchingBatch.booked_slots || 0,
                    availableSlots:
                        matchingBatch.available_slots ||
                        matchingBatch.capacity -
                            (matchingBatch.booked_slots || 0),
                };
                // Only include the matching batch in the batches array
                filteredBatches = [matchingBatch];
            } else {
                // No matching batch found, return empty array
                filteredBatches = [];
            }
        }

        const transformedTrek = {
            id: trek.id,
            name: trek.title,
            description: trek.description,
            destination: trek.destinationData?.name || "",
            destination_id: trek.destination_id,
            city_id: trek.city_id,
            city: trek.city
                ? {
                      id: trek.city.id,
                      cityName: trek.city.cityName,
                      state: trek.city.state
                          ? {
                                id: trek.city.state.id,
                                name: trek.city.state.name,
                            }
                          : null,
                  }
                : null,
            duration: trek.duration,
            durationDays: trek.duration_days,
            durationNights: trek.duration_nights,
            price: trek.base_price,
            difficulty: trek.difficulty,
            trekType: trek.trek_type,
            category: trek.category,
            meetingPoint: trek.meeting_point,
            meetingTime: trek.meeting_time,
            images: trek.images?.map((img) => `storage/${img.url}`) || [],
            itinerary:
                trek.itinerary_items?.map((item) => ({
                    day: item.day_number,
                    activities: item.activities || [],
                })) || [],
            accommodations:
                trek.accommodations?.map((acc, index) => {
                    let dayName = "";
                    if (acc.details?.date) {
                        const dateObj = new Date(acc.details.date);
                        if (!isNaN(dateObj)) {
                            dayName = dateObj.toLocaleDateString("en-US", {
                                weekday: "long",
                            });
                        }
                    }
                    return {
                        night: index + 1,
                        type: acc.type,
                        date: acc.details?.date || "",
                        dayName,
                        location: acc.details?.location || "",
                        description: acc.details?.description || "",
                    };
                }) || [],
            trekStages:
                trek.trek_stages?.map((stage) => ({
                    id: stage.id,
                    stage_name: stage.stage_name || stage.name || "",
                    means_of_transport: stage.means_of_transport || "",
                    date_time: stage.date_time || "",
                })) || [],
            batchInfo: batchInfo ? batchInfo : null,
            inclusions: parseJsonField(trek.inclusions),
            exclusions: parseJsonField(trek.exclusions),
            rating: trekRating.overall,
            ratingCount: trekRating.ratingCount,
            categoryRatings: trekRating.categories,
            customerRatingAndReview: customerRatingAndReview,
            hasDiscount: trek.has_discount || false,
            discountValue: parseFloat(trek.discount_value) || 0.0,
            discountType: trek.discount_type || "percentage",
            discountText: generateDiscountText(
                trek.has_discount,
                trek.discount_value,
                trek.discount_type
            ),
            cancellationPolicies: parseJsonField(trek.cancellation_policies),
            otherPolicies: parseJsonField(trek.other_policies),
            activities: parseJsonField(trek.activities),
            vendor: {
                id: trek.vendor.id,
                name: trek.vendor.user?.name || "Unknown Vendor",
                email: trek.vendor.user?.email || "",
                phone: trek.vendor.user?.phone || "",
                rating: 4.0, // Default rating since not stored in database
                status: trek.vendor.status,
            },
            createdAt: trek.created_at,
            updatedAt: trek.updated_at,
        };

        res.json({
            success: true,
            data: transformedTrek,
        });
    } catch (error) {
        console.error("Error fetching public trek:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch trek details",
        });
    }
};

// Get treks by category
exports.getTreksByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const treks = await Trek.findAndCountAll({
            where: {
                category: categoryId,
                status: "active",
            },
            include: [
                {
                    model: Destination,
                    as: "destinationData",
                    required: false,
                },
                {
                    model: Vendor,
                    as: "vendor",
                    attributes: ["id", "status"],
                    include: [
                        {
                            model: require("../models").User,
                            as: "user",
                            attributes: ["id", "name", "email", "phone"],
                        },
                    ],
                },
                {
                    model: TrekImage,
                    as: "images",
                    required: false,
                    limit: 1,
                },
                {
                    model: TrekStage,
                    as: "trek_stages",
                    required: false,
                },
            ],
            order: [["created_at", "DESC"]],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
        });

        const transformedTreks = treks.rows.map((trek) => ({
            id: trek.id,
            name: trek.title,
            description: trek.description,
            destination: trek.destinationData?.name || "",
            duration: trek.duration,
            price: trek.base_price,
            difficulty: trek.difficulty,
            availableSlots:
                trek.batches?.reduce(
                    (total, batch) =>
                        total + (batch.capacity - (batch.booked_slots || 0)),
                    0
                ) || 0,
            images: trek.images?.map((img) => `storage/${img.url}`) || [],
            trekStages:
                trek.trek_stages?.map((stage) => ({
                    id: stage.id,
                    stage_name: stage.stage_name || stage.name || "",
                    means_of_transport: stage.means_of_transport || "",
                    date_time: stage.date_time || "",
                })) || [],
            rating: parseFloat(trek.rating) || 0.0,
            hasDiscount: trek.has_discount || false,
            discountValue: parseFloat(trek.discount_value) || 0.0,
            discountType: trek.discount_type || "percentage",
            discountText: generateDiscountText(
                trek.has_discount,
                trek.discount_value,
                trek.discount_type
            ),
            vendor: {
                id: trek.vendor.id,
                name: trek.vendor.user?.name || "Unknown Vendor",
                rating: 4.0, // Default rating since not stored in database
            },
        }));

        res.json({
            success: true,
            data: transformedTreks,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(treks.count / parseInt(limit)),
                totalCount: treks.count,
            },
        });
    } catch (error) {
        console.error("Error fetching treks by category:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch treks",
        });
    }
};

// Search treks
exports.searchTreks = async (req, res) => {
    try {
        const {
            q,
            difficulty,
            minPrice,
            maxPrice,
            startDate,
            destination_id,
            city_id,
        } = req.query;

        const whereClause = { status: "active" };

        // Text search
        if (q) {
            whereClause[Op.or] = [
                { title: { [Op.like]: `%${q}%` } },
                { description: { [Op.like]: `%${q}%` } },
            ];
        }

        // Filter by destination_id
        if (destination_id) {
            whereClause.destination_id = parseInt(destination_id);
        }

        // Filter by city_id
        if (city_id) {
            whereClause.city_id = parseInt(city_id);
        }

        // Filter by difficulty
        if (difficulty) whereClause.difficulty = difficulty;

        // Filter by price range
        if (minPrice || maxPrice) {
            whereClause.base_price = {};
            if (minPrice) whereClause.base_price[Op.gte] = parseFloat(minPrice);
            if (maxPrice) whereClause.base_price[Op.lte] = parseFloat(maxPrice);
        }

        const treks = await Trek.findAll({
            where: whereClause,
            include: [
                {
                    model: Destination,
                    as: "destinationData",
                    required: false,
                },
                {
                    model: City,
                    as: "city",
                    required: false,
                    include: [
                        {
                            model: State,
                            as: "state",
                            required: false,
                        },
                    ],
                },
                {
                    model: Vendor,
                    as: "vendor",
                    attributes: ["id", "status"],
                    include: [
                        {
                            model: require("../models").User,
                            as: "user",
                            attributes: ["id", "name", "email", "phone"],
                        },
                    ],
                },
                {
                    model: TrekImage,
                    as: "images",
                    required: false,
                    limit: 1,
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

        // Filter by startDate if provided (check batches)
        let filteredTreks = treks;
        if (startDate) {
            const targetDate = new Date(startDate).toISOString().split("T")[0]; // Convert to YYYY-MM-DD format
            filteredTreks = treks.filter((trek) => {
                const batches = trek.batches || [];
                return batches.some((batch) => {
                    const batchStartDate = batch.start_date;
                    if (!batchStartDate) return false;
                    // Convert batch start date to YYYY-MM-DD format for comparison
                    const batchDate = new Date(batchStartDate)
                        .toISOString()
                        .split("T")[0];
                    return batchDate === targetDate;
                });
            });
        }

        const transformedTreks = await Promise.all(
            filteredTreks.map(async (trek) => {
                // Calculate rating for each trek
                const trekRating = await calculateTrekRating(trek.id);

                // Get batch information for the searched date
                let batchInfo = null;
                if (startDate) {
                    const targetDate = new Date(startDate)
                        .toISOString()
                        .split("T")[0];
                    const matchingBatch = trek.batches?.find((batch) => {
                        const batchStartDate = batch.start_date;
                        if (!batchStartDate) return false;
                        const batchDate = new Date(batchStartDate)
                            .toISOString()
                            .split("T")[0];
                        return batchDate === targetDate;
                    });

                    if (matchingBatch) {
                        batchInfo = {
                            id: matchingBatch.id,
                            startDate: matchingBatch.start_date,
                            endDate: matchingBatch.end_date,
                            capacity: matchingBatch.capacity,
                            bookedSlots: matchingBatch.booked_slots || 0,
                            availableSlots:
                                matchingBatch.available_slots ||
                                matchingBatch.capacity -
                                    (matchingBatch.booked_slots || 0),
                        };
                    }
                }

                // Return only the requested fields
                return {
                    id: trek.id,
                    name: trek.title,
                    vendor: {
                        name: trek.vendor.user?.name || "Unknown Vendor",
                    },
                    hasDiscount: trek.has_discount || false,
                    discountText: generateDiscountText(
                        trek.has_discount,
                        trek.discount_value,
                        trek.discount_type
                    ),
                    rating: trekRating.overall,
                    price: trek.base_price,
                    duration: trek.duration,
                    batchInfo: batchInfo
                        ? {
                              startDate: batchInfo.startDate,
                              availableSlots: batchInfo.availableSlots,
                          }
                        : null,
                };
            })
        );

        res.json({
            success: true,
            data: transformedTreks,
            searchQuery: q,
        });
    } catch (error) {
        console.error("Error searching treks:", error);
        res.status(500).json({
            success: false,
            message: "Failed to search treks",
        });
    }
};
