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
        const transformedTreks = treks.map((trek) => {
            const destinationName = trek.destinationData?.name || "";
            console.log(`Trek ${trek.id} destination:`, {
                fromAssociation: trek.destinationData?.name,
                final: destinationName,
            });

            return {
                id: trek.id,
                name: trek.title,
                description: trek.description,
                destination: destinationName,
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
                trekType: trek.trek_type || "",
                category: trek.category || "",
                status: trek.status === "published" ? "active" : "draft",
                slots: {
                    total: trek.max_participants || 20,
                    booked: trek.booked_slots || 0,
                },
                startDate: trek.start_date,
                endDate: trek.end_date,
                images: trek.images?.map((img) => `/storage/${img.url}`) || [],
                itinerary:
                    trek.itinerary_items?.map((item) => ({
                        day: item.day_number,
                        activities: item.activities || [],
                    })) || [],
                accommodations:
                    trek.accommodations?.map((acc, index) => ({
                        night: index + 1,
                        type: acc.type || "",
                        name: acc.details?.name || "",
                        location: acc.details?.location || "",
                        description: acc.details?.description || "",
                    })) || [],
                trekStages:
                    trek.trek_stages?.map((stage) => ({
                        id: stage.id,
                        name: stage.name,
                        description: stage.description,
                        distance: stage.distance,
                        duration: stage.duration,
                    })) || [],
                inclusions: parseJsonField(trek.inclusions),
                exclusions: parseJsonField(trek.exclusions),
                meetingPoint: trek.meeting_point || "Not specified",
                meetingTime: trek.meeting_time || "Not specified",
                rating: parseFloat(trek.rating) || 0.0,
                hasDiscount: trek.has_discount || false,
                discountValue: parseFloat(trek.discount_value) || 0.0,
                discountType: trek.discount_type || "percentage",
                discountText: generateDiscountText(
                    trek.has_discount,
                    trek.discount_value,
                    trek.discount_type
                ),
                createdAt: trek.created_at,
                updatedAt: trek.updated_at,
            };
        });

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
            ],
        });

        if (!trek) {
            return res.status(404).json({
                success: false,
                message: "Trek not found",
            });
        }

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
            trekType: trek.trek_type || "",
            category: trek.category || "",
            status: trek.status === "published" ? "active" : "draft",
            slots: {
                total: trek.max_participants || 20,
                booked: trek.booked_slots || 0,
            },
            startDate: trek.start_date,
            endDate: trek.end_date,
            images: trek.images?.map((img) => `/storage/${img.url}`) || [],
            itinerary:
                trek.itinerary_items?.map((item) => ({
                    day: item.day_number,
                    activities: item.activities || [],
                })) || [],
            accommodations:
                trek.accommodations?.map((acc, index) => ({
                    night: index + 1,
                    type: acc.type || "",
                    name: acc.details?.name || "",
                    location: acc.details?.location || "",
                    description: acc.details?.description || "",
                })) || [],
            trekStages:
                trek.trek_stages?.map((stage) => ({
                    id: stage.id,
                    name: stage.name,
                    description: stage.description,
                    distance: stage.distance,
                    duration: stage.duration,
                })) || [],
            inclusions: parseJsonField(trek.inclusions),
            exclusions: parseJsonField(trek.exclusions),
            meetingPoint: trek.meeting_point || "",
            meetingTime: trek.meeting_time || "",
            rating: parseFloat(trek.rating) || 0.0,
            hasDiscount: trek.has_discount || false,
            discountValue: parseFloat(trek.discount_value) || 0.0,
            discountType: trek.discount_type || "percentage",
            discountText: generateDiscountText(
                trek.has_discount,
                trek.discount_value,
                trek.discount_type
            ),
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
            destination,
            duration,
            durationDays,
            durationNights,
            price,
            difficulty,
            trekType,
            category,
            maxParticipants,
            startDate,
            endDate,
            inclusions,
            exclusions,
            meetingPoint,
            meetingTime,
            itinerary,
            accommodations,
            trekStages,
            images,
            status,
            rating,
            discountValue,
            discountType,
            hasDiscount,
        } = req.body;

        // Create the trek
        const trek = await Trek.create({
            title: name,
            description,
            vendor_id: vendorId,
            destination,
            duration,
            duration_days: durationDays,
            duration_nights: durationNights,
            base_price: price,
            difficulty: difficulty || "moderate",
            trek_type: trekType,
            category: category,
            max_participants: maxParticipants || 20,
            start_date: startDate,
            end_date: endDate,
            inclusions: ensureJsonArray(inclusions),
            exclusions: ensureJsonArray(exclusions),
            meeting_point: meetingPoint,
            meeting_time: meetingTime,
            status: status === "active" ? "published" : "draft",
            rating: rating || 0.0,
            discount_value: discountValue || 0.0,
            discount_type: discountType || "percentage",
            has_discount: hasDiscount || false,
        });

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
                    name: acc.name || "",
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
                stage_number: index + 1,
                name: stage.name || "",
                description: stage.description || "",
                distance: stage.distance || "",
                duration: stage.duration || "",
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
            destination,
            duration,
            durationDays,
            durationNights,
            price,
            difficulty,
            trekType,
            category,
            maxParticipants,
            startDate,
            endDate,
            inclusions,
            exclusions,
            meetingPoint,
            meetingTime,
            itinerary,
            accommodations,
            trekStages,
            images,
            status,
            rating,
            discountValue,
            discountType,
            hasDiscount,
        } = req.body;

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
            destination,
            duration,
            duration_days: durationDays,
            duration_nights: durationNights,
            base_price: price,
            difficulty: difficulty || "moderate",
            trek_type: trekType,
            category: category,
            max_participants: maxParticipants || 20,
            start_date: startDate,
            end_date: endDate,
            inclusions: ensureJsonArray(inclusions),
            exclusions: ensureJsonArray(exclusions),
            meeting_point: meetingPoint,
            meeting_time: meetingTime,
            status: status === "active" ? "published" : "draft",
            rating: rating || 0.0,
            discount_value: discountValue || 0.0,
            discount_type: discountType || "percentage",
            has_discount: hasDiscount || false,
        });

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
                    name: acc.name || "",
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
                stage_number: index + 1,
                name: stage.name || "",
                description: stage.description || "",
                distance: stage.distance || "",
                duration: stage.duration || "",
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

        const newStatus = trek.status === "published" ? "draft" : "published";
        await trek.update({ status: newStatus });

        res.json({
            success: true,
            message: `Trek ${
                newStatus === "published" ? "activated" : "deactivated"
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
            status: trek.status === "published" ? "active" : "draft",
            vendorName: trek.vendor?.user?.name || "Unknown Vendor",
            vendorId: trek.vendor_id,
            images: trek.images?.map((img) => `/storage/${img.url}`) || [],
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

        const whereClause = { status: "published" };

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
            durationDays: trek.duration_days,
            durationNights: trek.duration_nights,
            price: trek.base_price,
            difficulty: trek.difficulty,
            category: trek.category,
            availableSlots: trek.max_participants - trek.booked_slots,
            startDate: trek.start_date,
            endDate: trek.end_date,
            images: trek.images?.map((img) => `/storage/${img.url}`) || [],
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
            createdAt: trek.created_at,
        }));

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

        const trek = await Trek.findOne({
            where: {
                id: id,
                status: "published",
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
            ],
        });

        if (!trek) {
            return res.status(404).json({
                success: false,
                message: "Trek not found",
            });
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
            category: trek.category,
            trekType: trek.trek_type,
            maxParticipants: trek.max_participants,
            availableSlots: trek.max_participants - trek.booked_slots,
            startDate: trek.start_date,
            endDate: trek.end_date,
            meetingPoint: trek.meeting_point,
            meetingTime: trek.meeting_time,
            images: trek.images?.map((img) => `/storage/${img.url}`) || [],
            itinerary:
                trek.itinerary_items?.map((item) => ({
                    day: item.day_number,
                    activities: item.activities || [],
                })) || [],
            accommodations:
                trek.accommodations?.map((acc, index) => ({
                    night: index + 1,
                    type: acc.type,
                    details: acc.details,
                })) || [],
            trekStages:
                trek.trek_stages?.map((stage) => ({
                    id: stage.id,
                    name: stage.name,
                    description: stage.description,
                    distance: stage.distance,
                    duration: stage.duration,
                })) || [],
            inclusions: parseJsonField(trek.inclusions),
            exclusions: parseJsonField(trek.exclusions),
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
                status: "published",
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
            availableSlots: trek.max_participants - trek.booked_slots,
            images: trek.images?.map((img) => `/storage/${img.url}`) || [],
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
            page = 1,
            limit = 10,
            difficulty,
            minPrice,
            maxPrice,
            startDate,
            destination_id,
            city_id,
        } = req.query;

        const whereClause = { status: "published" };

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

        // Filter by start date - treks that start on or after the specified date
        if (startDate) {
            whereClause.start_date = { [Op.gte]: new Date(startDate) };
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
            ],
            order: [["start_date", "ASC"]],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
        });

        const transformedTreks = treks.rows.map((trek) => ({
            id: trek.id,
            name: trek.title,
            description: trek.description,
            destination: trek.destinationData?.name || "",
            destination_id: trek.destination_id,
            city_id: trek.city_id,
            city: trek.city?.cityName || "",
            duration: trek.duration,
            durationDays: trek.duration_days,
            durationNights: trek.duration_nights,
            price: trek.base_price,
            difficulty: trek.difficulty,
            trekType: trek.trek_type,
            category: trek.category,
            maxParticipants: trek.max_participants,
            availableSlots: trek.max_participants - trek.booked_slots,
            startDate: trek.start_date,
            endDate: trek.end_date,
            meetingPoint: trek.meeting_point,
            meetingTime: trek.meeting_time,
            status: trek.status,
            images: trek.images?.map((img) => `/storage/${img.url}`) || [],
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
                email: trek.vendor.user?.email || "",
                phone: trek.vendor.user?.phone || "",
                rating: 4.0, // Default rating since not stored in database
                status: trek.vendor.status,
            },
            createdAt: trek.created_at,
            updatedAt: trek.updated_at,
        }));

        res.json({
            success: true,
            data: transformedTreks,
            searchQuery: q,
            filters: {
                destination_id: destination_id || null,
                city_id: city_id || null,
                startDate: startDate || null,
                difficulty: difficulty || null,
                priceRange: {
                    min: minPrice || null,
                    max: maxPrice || null,
                },
            },
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(treks.count / parseInt(limit)),
                totalCount: treks.count,
            },
        });
    } catch (error) {
        console.error("Error searching treks:", error);
        res.status(500).json({
            success: false,
            message: "Failed to search treks",
        });
    }
};
