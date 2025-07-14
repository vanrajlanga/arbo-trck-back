const {
    Booking,
    BookingTraveler,
    Trek,
    Customer,
    Vendor,
    PickupPoint,
    Coupon,
    PaymentLog,
    Adjustment,
    Cancellation,
    sequelize,
    User,
    Traveler,
    Batch,
} = require("../../models");
const { Op } = require("sequelize");
const logger = require("../../utils/logger");
const {
    createRazorpayOrder,
    verifyRazorpaySignature,
    getPaymentDetails,
} = require("../../utils/razorpayUtils");
const {
    updateBatchSlotsOnBooking,
    updateBatchSlotsOnCancellation,
} = require("../../utils/batchSlotManager");

// Vendor: Get vendor bookings
exports.getVendorBookings = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { page = 1, limit = 10, search = "", status = "" } = req.query;
        const offset = (page - 1) * limit;

        logger.info("booking", "=== VENDOR BOOKINGS API CALL STARTED ===");
        logger.info("booking", "Request details:", {
            method: req.method,
            url: req.url,
            headers: {
                authorization: req.headers.authorization
                    ? "[HIDDEN]"
                    : "No auth",
                "user-agent": req.headers["user-agent"],
            },
            query: req.query,
            user: req.user,
        });

        if (!vendorId) {
            logger.error("booking", "No vendor ID found in user token");
            return res.status(403).json({
                success: false,
                message: "Access denied. Vendor account required.",
            });
        }

        const whereClause = { vendor_id: vendorId };

        // Apply status filter if provided
        if (status && status !== "undefined" && status !== "all") {
            whereClause.status = status;
            logger.info("booking", "Status filter applied:", { status });
        } else {
            logger.info(
                "booking",
                "No status filter applied (status was undefined or invalid)"
            );
        }

        logger.info("booking", "Final where clause:", whereClause);

        // Get total count for pagination
        const totalCount = await Booking.count({ where: whereClause });
        logger.info("booking", "Total bookings for vendor (before filters):", {
            vendorId,
            totalBookingsForVendor: totalCount,
        });

        // Get status distribution for analytics
        const statusDistribution = await Booking.findAll({
            where: { vendor_id: vendorId },
            attributes: [
                "status",
                [sequelize.fn("COUNT", sequelize.col("id")), "count"],
            ],
            group: ["status"],
        });
        logger.info(
            "booking",
            "Status distribution for vendor:",
            statusDistribution
        );

        // Get bookings with associations
        const { count, rows: bookings } = await Booking.findAndCountAll({
            where: whereClause,
            include: [
                { model: Trek, as: "trek" },
                { model: Customer, as: "customer" },
                { model: PickupPoint, as: "pickupPoint" },
                {
                    model: BookingTraveler,
                    as: "travelers",
                    include: [{ model: Traveler, as: "traveler" }],
                },
            ],
            order: [["created_at", "DESC"]],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        logger.info("booking", "Query results:", {
            totalCount: count,
            returnedRows: bookings.length,
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
        });

        if (bookings.length > 0) {
            logger.info("booking", "Sample booking data:", {
                firstBooking: {
                    id: bookings[0].id,
                    vendor_id: bookings[0].vendor_id,
                    status: bookings[0].status,
                    customer_id: bookings[0].customer_id,
                    trek_id: bookings[0].trek_id,
                },
            });
        }

        logger.info("booking", "=== VENDOR BOOKINGS API CALL COMPLETED ===");

        res.json({
            success: true,
            bookings: bookings,
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalCount: count,
            statusDistribution: statusDistribution,
        });
    } catch (error) {
        logger.error("booking", "Error fetching vendor bookings:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch bookings",
        });
    }
};

// Vendor: Create booking
exports.createVendorBooking = async (req, res) => {
    try {
        const {
            customerId,
            trekId,
            batchId,
            travelers,
            pickupPointId,
            specialRequests,
            status = "confirmed",
            paymentStatus = "completed",
        } = req.body;
        const vendorId = req.user.id;

        // Validate trek exists and belongs to vendor
        const trek = await Trek.findByPk(trekId, {
            include: [{ model: Vendor, as: "vendor" }],
        });

        if (!trek) {
            return res.status(404).json({ message: "Trek not found" });
        }

        if (trek.vendor_id !== vendorId) {
            return res
                .status(403)
                .json({ message: "Trek does not belong to this vendor" });
        }

        if (trek.status !== "active") {
            return res.status(400).json({
                success: false,
                message: "Cannot book inactive trek",
            });
        }

        // Validate batch exists and belongs to the trek
        if (!batchId) {
            return res.status(400).json({
                success: false,
                message: "Batch ID is required",
            });
        }

        const batch = await Batch.findOne({
            where: { id: batchId, trek_id: trekId },
        });

        if (!batch) {
            return res.status(404).json({
                success: false,
                message: "Batch not found or does not belong to this trek",
            });
        }

        // Check if batch has enough available slots
        const availableSlots =
            batch.available_slots || batch.capacity - (batch.booked_slots || 0);
        if (availableSlots < travelers.length) {
            return res.status(400).json({
                success: false,
                message: `Not enough slots available in this batch. Available: ${availableSlots}, Requested: ${travelers.length}`,
            });
        }

        // Validate customer exists
        const customer = await Customer.findByPk(customerId);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        // Calculate pricing
        const participantCount = travelers.length || 0;
        const totalAmount = trek.base_price * participantCount;
        const finalAmount = totalAmount;

        // Create booking
        const booking = await Booking.create({
            customer_id: customerId,
            trek_id: trekId,
            batch_id: batchId,
            vendor_id: vendorId,
            pickup_point_id: pickupPointId,
            total_travelers: participantCount,
            total_amount: totalAmount,
            discount_amount: 0,
            final_amount: finalAmount,
            status: status,
            payment_status: paymentStatus,
            booking_date: new Date(),
            special_requests: specialRequests,
        });

        // Create or get travelers and link them to booking
        if (travelers && travelers.length > 0) {
            for (const traveler of travelers) {
                // Check if traveler already exists for this customer
                let existingTraveler = await Traveler.findOne({
                    where: {
                        customer_id: customerId,
                        name: traveler.name,
                        age: traveler.age,
                        gender: traveler.gender,
                        is_active: true,
                    },
                });

                if (!existingTraveler) {
                    // Create new traveler
                    existingTraveler = await Traveler.create({
                        customer_id: customerId,
                        name: traveler.name,
                        age: traveler.age,
                        gender: traveler.gender,
                    });
                }

                // Link traveler to booking
                await BookingTraveler.create({
                    booking_id: booking.id,
                    traveler_id: existingTraveler.id,
                    is_primary: false,
                    status: "confirmed",
                });
            }
        }

        // Update batch slots
        try {
            await updateBatchSlotsOnBooking(batchId, travelers.length);
        } catch (slotError) {
            console.error("Error updating batch slots:", slotError);
        }

        // Fetch complete booking data
        const completeBooking = await Booking.findByPk(booking.id, {
            include: [
                { model: Trek, as: "trek" },
                { model: Customer, as: "customer" },
                { model: Vendor, as: "vendor" },
                { model: PickupPoint, as: "pickupPoint" },
                {
                    model: BookingTraveler,
                    as: "travelers",
                    include: [{ model: Traveler, as: "traveler" }],
                },
            ],
        });

        res.status(201).json({
            message: "Booking created successfully",
            booking: completeBooking,
        });
    } catch (error) {
        console.error("Error creating vendor booking:", error);
        res.status(500).json({ message: "Failed to create booking" });
    }
};

// Vendor: Get booking by ID
exports.getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const vendorId = req.user.id;

        if (!vendorId) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Vendor account required.",
            });
        }

        const booking = await Booking.findOne({
            where: { id, vendor_id: vendorId },
            include: [
                { model: Trek, as: "trek" },
                { model: Customer, as: "customer" },
                { model: PickupPoint, as: "pickupPoint" },
                {
                    model: BookingTraveler,
                    as: "travelers",
                    include: [{ model: Traveler, as: "traveler" }],
                },
                { model: PaymentLog, as: "payments" },
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
        console.error("Error fetching booking by ID:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch booking",
        });
    }
};

// Vendor: Update booking status
exports.updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const vendorId = req.user.id;

        const booking = await Booking.findOne({
            where: { id, vendor_id: vendorId },
        });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        await booking.update({ status });

        res.json({
            success: true,
            message: "Booking status updated successfully",
            booking: booking,
        });
    } catch (error) {
        console.error("Error updating booking status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update booking status",
        });
    }
};

// Vendor: Get booking analytics
exports.getVendorBookingAnalytics = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { startDate, endDate } = req.query;

        if (!vendorId) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Vendor account required.",
            });
        }

        const whereClause = { vendor_id: vendorId };
        if (startDate && endDate) {
            whereClause.created_at = {
                [Op.between]: [new Date(startDate), new Date(endDate)],
            };
        }

        // Get total bookings
        const totalBookings = await Booking.count({ where: whereClause });

        // Get status breakdown
        const statusBreakdown = await Booking.findAll({
            where: whereClause,
            attributes: [
                "status",
                [sequelize.fn("COUNT", sequelize.col("id")), "count"],
            ],
            group: ["status"],
        });

        // Get revenue data
        const revenueData = await Booking.findAll({
            where: {
                ...whereClause,
                payment_status: "completed",
            },
            attributes: [
                [
                    sequelize.fn("SUM", sequelize.col("final_amount")),
                    "totalRevenue",
                ],
                [sequelize.fn("COUNT", sequelize.col("id")), "paidBookings"],
            ],
        });

        // Get trek performance
        const trekPerformance = await Booking.findAll({
            where: whereClause,
            include: [{ model: Trek, as: "trek" }],
            attributes: [
                "trek_id",
                [
                    sequelize.fn("COUNT", sequelize.col("Booking.id")),
                    "bookingCount",
                ],
                [sequelize.fn("SUM", sequelize.col("final_amount")), "revenue"],
            ],
            group: ["trek_id"],
            order: [
                [sequelize.fn("COUNT", sequelize.col("Booking.id")), "DESC"],
            ],
            limit: 10,
        });

        res.json({
            success: true,
            data: {
                totalBookings,
                statusBreakdown,
                revenue: revenueData[0] || { totalRevenue: 0, paidBookings: 0 },
                trekPerformance,
            },
        });
    } catch (error) {
        console.error("Error fetching vendor booking analytics:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch booking analytics",
        });
    }
};

// Vendor: Create Razorpay order
exports.createTrekOrder = async (req, res) => {
    try {
        const {
            trekId,
            batchId,
            customerId,
            travelers,
            finalAmount,
            pickupPointId,
            couponCode,
        } = req.body;
        const vendorId = req.user.id;

        // Validate required fields
        if (
            !trekId ||
            !batchId ||
            !customerId ||
            !travelers ||
            travelers.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Trek ID, batch ID, customer ID, and travelers are required",
            });
        }

        // Validate trek belongs to vendor
        const trek = await Trek.findOne({
            where: { id: trekId, vendor_id: vendorId },
        });

        if (!trek) {
            return res.status(404).json({
                success: false,
                message: "Trek not found",
            });
        }

        // Validate batch
        const batch = await Batch.findOne({
            where: { id: batchId, trek_id: trekId },
        });

        if (!batch) {
            return res.status(404).json({
                success: false,
                message: "Batch not found",
            });
        }

        // Check available slots
        const availableSlots =
            batch.available_slots || batch.capacity - (batch.booked_slots || 0);
        if (availableSlots < travelers.length) {
            return res.status(400).json({
                success: false,
                message: `Not enough slots available. Available: ${availableSlots}, Requested: ${travelers.length}`,
            });
        }

        // Create Razorpay order
        const orderResponse = await createRazorpayOrder(
            finalAmount,
            "INR",
            `trek_${trekId}_${Date.now()}`
        );

        if (!orderResponse.success) {
            return res.status(500).json({
                success: false,
                message: "Failed to create payment order",
            });
        }

        res.json({
            success: true,
            message: "Order created successfully",
            order: orderResponse.order,
        });
    } catch (error) {
        console.error("Error creating trek order:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create order",
        });
    }
};

// Vendor: Verify payment and create booking
exports.verifyPaymentAndCreateBooking = async (req, res) => {
    try {
        const {
            orderId,
            paymentId,
            signature,
            trekId,
            batchId,
            customerId,
            travelers,
            finalAmount,
            pickupPointId,
            couponCode,
        } = req.body;
        const vendorId = req.user.id;

        // Validate required fields
        if (!orderId || !paymentId || !signature) {
            return res.status(400).json({
                success: false,
                message: "Order ID, payment ID, and signature are required",
            });
        }

        // Verify Razorpay signature
        const isSignatureValid = verifyRazorpaySignature(
            orderId,
            paymentId,
            signature
        );
        if (!isSignatureValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature",
            });
        }

        // Get payment details from Razorpay
        const paymentResult = await getPaymentDetails(paymentId);
        if (!paymentResult.success) {
            return res.status(400).json({
                success: false,
                message: "Failed to verify payment",
            });
        }

        const payment = paymentResult.payment;

        // Verify payment status
        if (payment.status !== "captured") {
            return res.status(400).json({
                success: false,
                message: "Payment not completed",
            });
        }

        // Verify payment amount
        const expectedAmount = Math.round(finalAmount * 100);
        if (payment.amount !== expectedAmount) {
            return res.status(400).json({
                success: false,
                message: "Payment amount mismatch",
            });
        }

        // Validate batch exists and has enough slots
        if (!batchId) {
            return res.status(400).json({
                success: false,
                message: "Batch ID is required",
            });
        }

        const batch = await Batch.findOne({
            where: { id: batchId, trek_id: trekId },
        });

        if (!batch) {
            return res.status(404).json({
                success: false,
                message: "Batch not found or does not belong to this trek",
            });
        }

        // Check if batch has enough available slots
        const availableSlots =
            batch.available_slots || batch.capacity - (batch.booked_slots || 0);
        if (availableSlots < travelers.length) {
            return res.status(400).json({
                success: false,
                message: `Not enough slots available in this batch. Available: ${availableSlots}, Requested: ${travelers.length}`,
            });
        }

        // Create the booking
        const bookingData = {
            trek_id: trekId,
            batch_id: batchId,
            customer_id: customerId,
            vendor_id: vendorId,
            total_travelers: travelers.length,
            total_amount: finalAmount,
            final_amount: finalAmount,
            discount_amount: 0,
            status: "confirmed",
            payment_status: "completed",
            booking_date: new Date(),
            pickup_point_id: pickupPointId,
        };

        // Apply coupon if provided
        if (couponCode) {
            const coupon = await Coupon.findOne({
                where: { code: couponCode, status: "active" },
            });

            if (coupon) {
                const discountAmount =
                    (finalAmount * coupon.discount_percentage) / 100;
                bookingData.discount_amount = discountAmount;
                bookingData.final_amount = finalAmount - discountAmount;
            }
        }

        // Create booking
        const booking = await Booking.create(bookingData);

        // Create travelers
        const travelerPromises = travelers.map(async (travelerData, index) => {
            // Create or find traveler
            let traveler = await Traveler.findOne({
                where: {
                    name: travelerData.name,
                    age: travelerData.age,
                    gender: travelerData.gender,
                    customer_id: customerId,
                },
            });

            if (!traveler) {
                traveler = await Traveler.create({
                    customer_id: customerId,
                    name: travelerData.name,
                    age: travelerData.age,
                    gender: travelerData.gender,
                });
            }

            // Create booking traveler relationship
            return BookingTraveler.create({
                booking_id: booking.id,
                traveler_id: traveler.id,
                is_primary: index === 0,
                status: "confirmed",
            });
        });

        await Promise.all(travelerPromises);

        // Update batch slots
        try {
            await updateBatchSlotsOnBooking(batchId, travelers.length);
        } catch (slotError) {
            console.error("Error updating batch slots:", slotError);
        }

        // Create payment log
        await PaymentLog.create({
            booking_id: booking.id,
            amount: booking.final_amount,
            payment_method: "razorpay",
            transaction_id: paymentId,
            status: "success",
            payment_details: JSON.stringify(payment),
        });

        // Fetch complete booking with associations
        const completeBooking = await Booking.findOne({
            where: { id: booking.id },
            include: [
                { model: Trek, as: "trek" },
                { model: Customer, as: "customer" },
                {
                    model: BookingTraveler,
                    as: "travelers",
                    include: [{ model: Traveler, as: "traveler" }],
                },
                { model: PaymentLog, as: "payments" },
            ],
        });

        res.json({
            success: true,
            message: "Booking created successfully with payment",
            booking: completeBooking,
            payment: {
                orderId,
                paymentId,
                amount: payment.amount,
                status: payment.status,
            },
        });
    } catch (error) {
        console.error("Error verifying payment and creating booking:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create booking",
        });
    }
};
