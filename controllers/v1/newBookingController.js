const {
    Booking,
    Customer,
    Traveler,
    BookingTraveler,
    Trek,
    Vendor,
    Batch,
    PickupPoint,
    Coupon,
} = require("../../models");
const { Op } = require("sequelize");
const sequelize = require("../../models").sequelize;
const {
    updateBatchSlotsOnBooking,
    updateBatchSlotsOnCancellation,
} = require("../../utils/batchSlotManager");

// Create a new booking with travelers
exports.createBooking = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            trek_id,
            batch_id,
            pickup_point_id,
            coupon_id,
            travelers, // Array of traveler objects
            special_requests,
            booking_source = "mobile",
        } = req.body;

        const customerId = req.customer.id;

        // Validate trek exists and is available
        const trek = await Trek.findByPk(trek_id, {
            include: [{ model: Vendor, as: "vendor" }],
        });

        if (!trek) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: "Trek not found",
            });
        }

        if (trek.status !== "active") {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: "Trek is not available for booking",
            });
        }

        // Validate batch if provided
        let batch = null;
        if (batch_id) {
            batch = await Batch.findOne({
                where: {
                    id: batch_id,
                    trek_id: trek_id,
                    status: "active",
                    start_date: { [Op.gte]: new Date() },
                },
            });

            if (!batch) {
                await transaction.rollback();
                return res.status(404).json({
                    success: false,
                    message: "Batch not found or not available",
                });
            }
        }

        // Validate travelers data
        if (!travelers || !Array.isArray(travelers) || travelers.length === 0) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: "At least one traveler is required",
            });
        }

        // Process travelers - create or update existing ones
        const travelerIds = [];
        const processedTravelers = [];

        for (const travelerData of travelers) {
            let traveler;

            if (travelerData.id) {
                // Existing traveler - verify ownership
                traveler = await Traveler.findOne({
                    where: {
                        id: travelerData.id,
                        customer_id: customerId,
                        is_active: true,
                    },
                });

                if (!traveler) {
                    // Create new traveler if not found
                    traveler = await Traveler.create(
                        {
                            customer_id: customerId,
                            name: travelerData.name,
                            age: travelerData.age,
                            gender: travelerData.gender,
                        },
                        { transaction }
                    );
                }

                // Update traveler if needed
                await traveler.update(
                    {
                        name: travelerData.name || traveler.name,
                        age: travelerData.age || traveler.age,
                        gender: travelerData.gender || traveler.gender,
                    },
                    { transaction }
                );
            } else {
                // New traveler
                traveler = await Traveler.create(
                    {
                        customer_id: customerId,
                        name: travelerData.name,
                        age: travelerData.age,
                        gender: travelerData.gender,
                    },
                    { transaction }
                );
            }

            travelerIds.push(traveler.id);
            processedTravelers.push({
                traveler,
                is_primary: travelerData.is_primary || false,
                special_requirements: travelerData.special_requirements,
                accommodation_preference:
                    travelerData.accommodation_preference || "any",
                meal_preference: travelerData.meal_preference || "veg",
            });
        }

        // Ensure at least one primary traveler
        const hasPrimary = processedTravelers.some((t) => t.is_primary);
        if (!hasPrimary) {
            processedTravelers[0].is_primary = true;
        }

        // Calculate pricing
        const totalTravelers = travelers.length;
        const basePrice = trek.price_per_person;
        const totalAmount = basePrice * totalTravelers;

        // Apply coupon discount if provided
        let discountAmount = 0;
        let coupon = null;
        if (coupon_id) {
            coupon = await Coupon.findByPk(coupon_id);
            if (coupon && coupon.is_active) {
                if (coupon.discount_type === "percentage") {
                    discountAmount =
                        (totalAmount * coupon.discount_value) / 100;
                } else {
                    discountAmount = coupon.discount_value;
                }
            }
        }

        const finalAmount = Math.max(0, totalAmount - discountAmount);

        // Create booking
        const booking = await Booking.create(
            {
                customer_id: customerId,
                trek_id: trek_id,
                batch_id: batch_id,
                vendor_id: trek.vendor.id,
                pickup_point_id: pickup_point_id,
                coupon_id: coupon_id,
                total_travelers: totalTravelers,
                base_amount: totalAmount,
                discount_amount: discountAmount,
                final_amount: finalAmount,
                status: "pending",
                special_requests: special_requests,
                booking_source: booking_source,
            },
            { transaction }
        );

        // Create booking-traveler associations
        for (const processedTraveler of processedTravelers) {
            await BookingTraveler.create(
                {
                    booking_id: booking.id,
                    traveler_id: processedTraveler.traveler.id,
                    is_primary: processedTraveler.is_primary,
                    special_requirements:
                        processedTraveler.special_requirements,
                    accommodation_preference:
                        processedTraveler.accommodation_preference,
                    meal_preference: processedTraveler.meal_preference,
                    status: "confirmed",
                },
                { transaction }
            );
        }

        // Update batch slots if batch is specified
        if (batch) {
            await updateBatchSlotsOnBooking(
                batch.id,
                totalTravelers,
                transaction
            );
        }

        await transaction.commit();

        // Fetch booking with all related data
        const bookingWithDetails = await Booking.findByPk(booking.id, {
            include: [
                {
                    model: Trek,
                    as: "trek",
                    include: [{ model: Vendor, as: "vendor" }],
                },
                {
                    model: Batch,
                    as: "batch",
                },
                {
                    model: PickupPoint,
                    as: "pickupPoint",
                },
                {
                    model: Coupon,
                    as: "coupon",
                },
                {
                    model: BookingTraveler,
                    as: "bookingTravelers",
                    include: [{ model: Traveler, as: "traveler" }],
                },
            ],
        });

        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: bookingWithDetails,
        });
    } catch (error) {
        await transaction.rollback();
        console.error("Error creating booking:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create booking",
        });
    }
};

// Get customer bookings
exports.getCustomerBookings = async (req, res) => {
    try {
        const customerId = req.customer.id;
        const { status, page = 1, limit = 10 } = req.query;

        const whereClause = { customer_id: customerId };
        if (status && status !== "all") {
            whereClause.status = status;
        }

        const bookings = await Booking.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Trek,
                    as: "trek",
                    include: [{ model: Vendor, as: "vendor" }],
                },
                {
                    model: Batch,
                    as: "batch",
                },
                {
                    model: BookingTraveler,
                    as: "bookingTravelers",
                    include: [{ model: Traveler, as: "traveler" }],
                },
            ],
            order: [["created_at", "DESC"]],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
        });

        res.json({
            success: true,
            data: bookings.rows,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(bookings.count / parseInt(limit)),
                totalCount: bookings.count,
                itemsPerPage: parseInt(limit),
            },
        });
    } catch (error) {
        console.error("Error fetching customer bookings:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch bookings",
        });
    }
};

// Get booking details
exports.getBookingDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const customerId = req.customer.id;

        const booking = await Booking.findOne({
            where: { id: id, customer_id: customerId },
            include: [
                {
                    model: Trek,
                    as: "trek",
                    include: [{ model: Vendor, as: "vendor" }],
                },
                {
                    model: Batch,
                    as: "batch",
                },
                {
                    model: PickupPoint,
                    as: "pickupPoint",
                },
                {
                    model: Coupon,
                    as: "coupon",
                },
                {
                    model: BookingTraveler,
                    as: "bookingTravelers",
                    include: [{ model: Traveler, as: "traveler" }],
                },
            ],
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        res.json({
            success: true,
            data: booking,
        });
    } catch (error) {
        console.error("Error fetching booking details:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch booking details",
        });
    }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;
        const customerId = req.customer.id;

        const booking = await Booking.findOne({
            where: { id: id, customer_id: customerId },
            include: [{ model: Batch, as: "batch" }],
        });

        if (!booking) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        if (booking.status === "cancelled") {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: "Booking is already cancelled",
            });
        }

        if (booking.status === "completed") {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: "Cannot cancel completed booking",
            });
        }

        // Update booking status
        await booking.update({ status: "cancelled" }, { transaction });

        // Update batch slots if batch exists
        if (booking.batch) {
            await updateBatchSlotsOnCancellation(
                booking.batch.id,
                booking.total_travelers,
                transaction
            );
        }

        await transaction.commit();

        res.json({
            success: true,
            message: "Booking cancelled successfully",
        });
    } catch (error) {
        await transaction.rollback();
        console.error("Error cancelling booking:", error);
        res.status(500).json({
            success: false,
            message: "Failed to cancel booking",
        });
    }
};
