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
    BookingParticipant,
} = require("../models");
const { Op } = require("sequelize");
const logger = require("../utils/logger");

// Create a new booking
const createBooking = async (req, res) => {
    try {
        const {
            trekId,
            participants,
            pickupPointId,
            couponCode,
            specialRequests,
        } = req.body;
        const userId = req.user.id;

        // Validate trek exists and is available
        const trek = await Trek.findByPk(trekId, {
            include: [{ model: Vendor, as: "vendor" }],
        });

        if (!trek) {
            return res.status(404).json({ message: "Trek not found" });
        }

        if (trek.status !== "published") {
            return res
                .status(400)
                .json({ message: "Trek is not available for booking" });
        }

        // Check available slots
        const currentBookings = await Booking.count({
            where: {
                trek_id: trekId,
                status: { [Op.in]: ["confirmed", "pending"] },
            },
        });

        if (currentBookings + participants.length > trek.max_participants) {
            return res.status(400).json({
                message: "Not enough slots available",
                availableSlots: trek.max_participants - currentBookings,
            });
        }

        // Calculate pricing
        let totalAmount = trek.base_price * participants.length;
        let discountAmount = 0;
        let couponId = null;

        // Apply coupon if provided
        if (couponCode) {
            const coupon = await Coupon.findOne({
                where: {
                    code: couponCode,
                    status: "active",
                    valid_from: { [Op.lte]: new Date() },
                    valid_until: { [Op.gte]: new Date() },
                },
            });

            if (coupon) {
                if (coupon.discount_type === "percentage") {
                    discountAmount =
                        (totalAmount * coupon.discount_value) / 100;
                } else {
                    discountAmount = coupon.discount_value;
                }
                couponId = coupon.id;
            }
        }

        const finalAmount = totalAmount - discountAmount;

        // Create booking
        const booking = await Booking.create({
            customer_id: userId,
            trek_id: trekId,
            vendor_id: trek.vendor_id,
            pickup_point_id: pickupPointId,
            coupon_id: couponId,
            total_travelers: participants.length,
            total_amount: totalAmount,
            discount_amount: discountAmount,
            final_amount: finalAmount,
            status: "pending",
            booking_date: new Date(),
            special_requests: specialRequests,
        });

        // Create participant records
        const participantData = participants.map((participant) => ({
            booking_id: booking.id,
            name: participant.name,
            age: participant.age,
            gender: participant.gender,
            phone: participant.phone,
            emergency_contact: participant.emergencyContact,
            medical_conditions: participant.medicalConditions || null,
        }));

        await BookingParticipant.bulkCreate(participantData);

        // Fetch complete booking data
        const completeBooking = await Booking.findByPk(booking.id, {
            include: [
                { model: Trek, as: "trek" },
                { model: Customer, as: "customer" },
                { model: Vendor, as: "vendor" },
                { model: PickupPoint, as: "pickupPoint" },
                { model: BookingParticipant, as: "participants" },
            ],
        });

        res.status(201).json({
            message: "Booking created successfully",
            booking: completeBooking,
        });
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({ message: "Failed to create booking" });
    }
};

// Get user's bookings
const getUserBookings = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, page = 1, limit = 10 } = req.query;

        const whereClause = { customer_id: userId };
        if (status) {
            whereClause.status = status;
        }

        const bookings = await Booking.findAndCountAll({
            where: whereClause,
            include: [
                { model: Trek, as: "trek" },
                { model: Customer, as: "customer" },
                { model: PickupPoint, as: "pickupPoint" },
                { model: BookingParticipant, as: "participants" },
            ],
            order: [["created_at", "DESC"]],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
        });

        res.json({
            bookings: bookings.rows,
            totalCount: bookings.count,
            currentPage: parseInt(page),
            totalPages: Math.ceil(bookings.count / parseInt(limit)),
        });
    } catch (error) {
        console.error("Error fetching user bookings:", error);
        res.status(500).json({ message: "Failed to fetch bookings" });
    }
};

// Get specific booking details
const getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const booking = await Booking.findOne({
            where: {
                id: id,
                customer_id: userId, // Ensure user can only access their own bookings
            },
            include: [
                { model: Trek, as: "trek" },
                { model: Customer, as: "customer" },
                { model: Vendor, as: "vendor" },
                { model: PickupPoint, as: "pickupPoint" },
                { model: BookingTraveler, as: "travelers" },
                { model: Coupon, as: "coupon" },
                { model: PaymentLog, as: "payments" },
            ],
        });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.json({ booking });
    } catch (error) {
        console.error("Error fetching booking:", error);
        res.status(500).json({ message: "Failed to fetch booking" });
    }
};

// Cancel a booking
const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { reason } = req.body;

        const booking = await Booking.findOne({
            where: {
                id: id,
                customer_id: userId,
                status: { [Op.in]: ["pending", "confirmed"] },
            },
        });

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found or cannot be cancelled",
            });
        }

        // Create cancellation record
        await Cancellation.create({
            booking_id: booking.id,
            customer_id: userId,
            reason: reason || "User requested cancellation",
            cancelled_at: new Date(),
            refund_amount: booking.final_amount, // Calculate based on cancellation policy
            refund_status: "pending",
        });

        // Update booking status
        await booking.update({ status: "cancelled" });

        res.json({
            message: "Booking cancelled successfully",
            booking: await Booking.findByPk(booking.id, {
                include: [
                    { model: Trek, as: "trek" },
                    { model: Cancellation, as: "cancellation" },
                ],
            }),
        });
    } catch (error) {
        console.error("Error cancelling booking:", error);
        res.status(500).json({ message: "Failed to cancel booking" });
    }
};

// Update booking (limited fields)
const updateBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { pickupPointId, specialRequests } = req.body;

        const booking = await Booking.findOne({
            where: {
                id: id,
                customer_id: userId,
                status: { [Op.in]: ["pending", "confirmed"] },
            },
        });

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found or cannot be updated",
            });
        }

        const updateData = {};
        if (pickupPointId !== undefined)
            updateData.pickup_point_id = pickupPointId;
        if (specialRequests !== undefined)
            updateData.special_requests = specialRequests;

        await booking.update(updateData);

        const updatedBooking = await Booking.findByPk(booking.id, {
            include: [
                { model: Trek, as: "trek" },
                { model: PickupPoint, as: "pickupPoint" },
                { model: BookingTraveler, as: "travelers" },
            ],
        });

        res.json({
            message: "Booking updated successfully",
            booking: updatedBooking,
        });
    } catch (error) {
        console.error("Error updating booking:", error);
        res.status(500).json({ message: "Failed to update booking" });
    }
};

// Process payment
const processPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentMethod, transactionId, amount } = req.body;
        const userId = req.user.id;

        const booking = await Booking.findOne({
            where: {
                id: id,
                customer_id: userId,
                status: "pending",
            },
        });

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found or payment already processed",
            });
        }

        // Create payment log
        const payment = await PaymentLog.create({
            booking_id: booking.id,
            customer_id: userId,
            amount: amount,
            payment_method: paymentMethod,
            transaction_id: transactionId,
            status: "completed", // In real app, this would be 'pending' until verified
            payment_date: new Date(),
        });

        // Update booking status
        await booking.update({
            status: "confirmed",
            payment_status: "completed",
        });

        res.json({
            message: "Payment processed successfully",
            payment: payment,
            booking: await Booking.findByPk(booking.id),
        });
    } catch (error) {
        console.error("Error processing payment:", error);
        res.status(500).json({ message: "Failed to process payment" });
    }
};

// Get payment status
const getPaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const booking = await Booking.findOne({
            where: {
                id: id,
                customer_id: userId,
            },
            include: [{ model: PaymentLog, as: "payments" }],
        });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.json({
            bookingId: booking.id,
            paymentStatus: booking.payment_status,
            payments: booking.payments,
        });
    } catch (error) {
        console.error("Error fetching payment status:", error);
        res.status(500).json({ message: "Failed to fetch payment status" });
    }
};

// Get booking confirmation
const getBookingConfirmation = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const booking = await Booking.findOne({
            where: {
                id: id,
                customer_id: userId,
                status: "confirmed",
            },
            include: [
                { model: Trek, as: "trek" },
                { model: Vendor, as: "vendor" },
                { model: PickupPoint, as: "pickupPoint" },
                { model: BookingTraveler, as: "travelers" },
            ],
        });

        if (!booking) {
            return res.status(404).json({
                message: "Confirmed booking not found",
            });
        }

        res.json({
            confirmation: {
                bookingId: booking.id,
                confirmationNumber: `ARB${booking.id
                    .toString()
                    .padStart(6, "0")}`,
                trek: booking.trek,
                travelers: booking.travelers,
                pickupPoint: booking.pickupPoint,
                totalAmount: booking.final_amount,
                bookingDate: booking.booking_date,
                status: booking.status,
            },
        });
    } catch (error) {
        console.error("Error fetching booking confirmation:", error);
        res.status(500).json({ message: "Failed to fetch confirmation" });
    }
};

// Get booking invoice
const getBookingInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const booking = await Booking.findOne({
            where: {
                id: id,
                customer_id: userId,
            },
            include: [
                { model: Trek, as: "trek" },
                { model: Customer, as: "customer" },
                { model: Vendor, as: "vendor" },
                { model: BookingTraveler, as: "travelers" },
                { model: Coupon, as: "coupon" },
                { model: PaymentLog, as: "payments" },
            ],
        });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        const invoice = {
            invoiceNumber: `INV-${booking.id.toString().padStart(6, "0")}`,
            bookingId: booking.id,
            customer: booking.customer,
            trek: booking.trek,
            vendor: booking.vendor,
            travelers: booking.travelers,
            pricing: {
                baseAmount: booking.total_amount,
                discountAmount: booking.discount_amount,
                finalAmount: booking.final_amount,
                coupon: booking.coupon,
            },
            payments: booking.payments,
            issueDate: booking.created_at,
        };

        res.json({ invoice });
    } catch (error) {
        console.error("Error generating invoice:", error);
        res.status(500).json({ message: "Failed to generate invoice" });
    }
};

// Vendor: Get vendor bookings
const getVendorBookings = async (req, res) => {
    try {
        logger.info("booking", "=== VENDOR BOOKINGS API CALL STARTED ===");
        logger.info("booking", "Request details:", {
            method: req.method,
            url: req.url,
            headers: {
                authorization: req.headers.authorization
                    ? "Bearer [HIDDEN]"
                    : "No auth header",
                "user-agent": req.headers["user-agent"],
            },
            query: req.query,
            user: req.user,
        });

        const vendorId = req.user.vendorId; // Fixed: use vendorId from JWT token
        const { status, page = 1, limit = 10, trekId, search } = req.query;

        logger.info("booking", "Extracted parameters:", {
            vendorId,
            status,
            page,
            limit,
            trekId,
            search,
        });

        // Check if vendorId exists
        if (!vendorId) {
            logger.error("booking", "Vendor ID is missing from JWT token", {
                user: req.user,
                vendorId,
            });
            return res.status(403).json({
                message: "Access denied. Vendor ID not found in token.",
                debug: { user: req.user },
            });
        }

        const whereClause = { vendor_id: vendorId };

        // Handle status filter - only add if it's a valid status and not "undefined"
        if (status && status !== "undefined" && status !== undefined) {
            whereClause.status = status;
            logger.info("booking", "Added status filter:", { status });
        } else {
            logger.info(
                "booking",
                "No status filter applied (status was undefined or invalid)"
            );
        }

        if (trekId && trekId !== "undefined") {
            whereClause.trek_id = trekId;
            logger.info("booking", "Added trek filter:", { trekId });
        }

        logger.info("booking", "Final where clause:", whereClause);

        // First, let's check if there are any bookings for this vendor at all
        const totalBookingsForVendor = await Booking.count({
            where: { vendor_id: vendorId },
        });

        logger.info("booking", "Total bookings for vendor (before filters):", {
            vendorId,
            totalBookingsForVendor,
        });

        // Check what statuses exist for this vendor
        const statusCounts = await Booking.findAll({
            where: { vendor_id: vendorId },
            attributes: [
                "status",
                [sequelize.fn("COUNT", sequelize.col("id")), "count"],
            ],
            group: ["status"],
        });

        logger.info("booking", "Status distribution for vendor:", statusCounts);

        const bookings = await Booking.findAndCountAll({
            where: whereClause,
            include: [
                { model: Trek, as: "trek" },
                { model: Customer, as: "customer" },
                { model: PickupPoint, as: "pickupPoint" },
                { model: BookingParticipant, as: "participants" },
            ],
            order: [["created_at", "DESC"]],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
        });

        logger.info("booking", "Query results:", {
            totalCount: bookings.count,
            returnedRows: bookings.rows.length,
            currentPage: parseInt(page),
            totalPages: Math.ceil(bookings.count / parseInt(limit)),
        });

        // Log sample booking data if any found
        if (bookings.rows.length > 0) {
            logger.info("booking", "Sample booking data:", {
                firstBooking: {
                    id: bookings.rows[0].id,
                    vendor_id: bookings.rows[0].vendor_id,
                    status: bookings.rows[0].status,
                    customer_id: bookings.rows[0].customer_id,
                    trek_id: bookings.rows[0].trek_id,
                },
            });
        }

        const response = {
            bookings: bookings.rows,
            totalCount: bookings.count,
            currentPage: parseInt(page),
            totalPages: Math.ceil(bookings.count / parseInt(limit)),
        };

        logger.info("booking", "=== VENDOR BOOKINGS API CALL COMPLETED ===");
        res.json(response);
    } catch (error) {
        logger.error("booking", "Error fetching vendor bookings:", {
            error: error.message,
            stack: error.stack,
            vendorId: req.user?.vendorId,
            query: req.query,
        });
        res.status(500).json({ message: "Failed to fetch vendor bookings" });
    }
};

// Vendor: Update booking status
const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const vendorId = req.user.vendorId; // Fixed: use vendorId from JWT token

        const booking = await Booking.findOne({
            where: {
                id: id,
                vendor_id: vendorId,
            },
        });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        await booking.update({ status });

        res.json({
            message: "Booking status updated successfully",
            booking: await Booking.findByPk(booking.id, {
                include: [
                    { model: Trek, as: "trek" },
                    { model: Customer, as: "customer" },
                ],
            }),
        });
    } catch (error) {
        console.error("Error updating booking status:", error);
        res.status(500).json({ message: "Failed to update booking status" });
    }
};

// Vendor: Create booking for customer
const createVendorBooking = async (req, res) => {
    try {
        const {
            customerId,
            trekId,
            participants,
            pickupPointId,
            specialRequests,
            status = "confirmed",
            paymentStatus = "completed",
        } = req.body;
        const vendorId = req.user.vendorId; // Fixed: use vendorId from JWT token

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

        if (trek.status !== "published") {
            return res
                .status(400)
                .json({ message: "Trek is not available for booking" });
        }

        // Validate customer exists
        const customer = await Customer.findByPk(customerId);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        // Check available slots
        const currentBookings = await Booking.count({
            where: {
                trek_id: trekId,
                status: { [Op.in]: ["confirmed", "pending"] },
            },
        });

        if (currentBookings + participants.length > trek.max_participants) {
            return res.status(400).json({
                message: "Not enough slots available",
                availableSlots: trek.max_participants - currentBookings,
            });
        }

        // Calculate pricing
        const participantCount = participants.length || 0;
        const totalAmount = trek.base_price * participantCount;
        const finalAmount = totalAmount; // No discount for vendor-created bookings

        console.log("Creating booking with:", {
            customerId,
            trekId,
            vendorId,
            participantCount,
            totalAmount,
            finalAmount,
            participants,
        });

        // Create booking
        const booking = await Booking.create({
            customer_id: customerId,
            trek_id: trekId,
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

        console.log("Booking created successfully:", booking.id);

        // Create participant records only if there are participants
        if (participants && participants.length > 0) {
            const participantData = participants.map((participant) => ({
                booking_id: booking.id,
                name: participant.name,
                age: participant.age,
                gender: participant.gender,
                phone: participant.phone,
                emergency_contact: participant.emergencyContact,
                medical_conditions: participant.medicalConditions || null,
            }));

            console.log("Creating participants:", participantData);
            await BookingParticipant.bulkCreate(participantData);
            console.log("Participants created successfully");
        }

        // Fetch complete booking data
        const completeBooking = await Booking.findByPk(booking.id, {
            include: [
                { model: Trek, as: "trek" },
                { model: Customer, as: "customer" },
                { model: Vendor, as: "vendor" },
                { model: PickupPoint, as: "pickupPoint" },
                { model: BookingParticipant, as: "participants" },
            ],
        });

        res.status(201).json({
            message: "Booking created successfully",
            booking: completeBooking,
        });
    } catch (error) {
        console.error("Error creating vendor booking:", error);
        console.error("Error details:", {
            message: error.message,
            stack: error.stack,
            name: error.name,
        });
        res.status(500).json({ message: "Failed to create booking" });
    }
};

// Vendor: Get booking participants
const getBookingParticipants = async (req, res) => {
    try {
        const { id } = req.params;
        const vendorId = req.user.vendorId; // Fixed: use vendorId from JWT token

        const booking = await Booking.findOne({
            where: {
                id: id,
                vendor_id: vendorId,
            },
            include: [
                { model: Trek, as: "trek" },
                { model: BookingParticipant, as: "participants" },
            ],
        });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.json({
            bookingId: booking.id,
            trek: booking.trek,
            participants: booking.participants,
        });
    } catch (error) {
        console.error("Error fetching booking participants:", error);
        res.status(500).json({ message: "Failed to fetch participants" });
    }
};

// Admin: Get all bookings
const getAllBookings = async (req, res) => {
    try {
        const { status, page = 1, limit = 10, vendorId, trekId } = req.query;

        const whereClause = {};
        if (status) whereClause.status = status;
        if (vendorId) whereClause.vendor_id = vendorId;
        if (trekId) whereClause.trek_id = trekId;

        const bookings = await Booking.findAndCountAll({
            where: whereClause,
            include: [
                { model: Trek, as: "trek" },
                { model: Customer, as: "customer" },
                { model: Vendor, as: "vendor" },
                { model: BookingParticipant, as: "participants" },
            ],
            order: [["created_at", "DESC"]],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
        });

        res.json({
            bookings: bookings.rows,
            totalCount: bookings.count,
            currentPage: parseInt(page),
            totalPages: Math.ceil(bookings.count / parseInt(limit)),
        });
    } catch (error) {
        console.error("Error fetching all bookings:", error);
        res.status(500).json({ message: "Failed to fetch bookings" });
    }
};

// Admin: Get booking analytics
const getBookingAnalytics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const whereClause = {};
        if (startDate && endDate) {
            whereClause.created_at = {
                [Op.between]: [new Date(startDate), new Date(endDate)],
            };
        }

        const analytics = await Promise.all([
            // Total bookings by status
            Booking.findAll({
                where: whereClause,
                attributes: [
                    "status",
                    [sequelize.fn("COUNT", sequelize.col("id")), "count"],
                ],
                group: ["status"],
            }),

            // Revenue analytics
            Booking.findAll({
                where: { ...whereClause, status: "confirmed" },
                attributes: [
                    [
                        sequelize.fn("SUM", sequelize.col("final_amount")),
                        "totalRevenue",
                    ],
                    [
                        sequelize.fn("COUNT", sequelize.col("id")),
                        "confirmedBookings",
                    ],
                ],
            }),

            // Top treks
            Booking.findAll({
                where: whereClause,
                include: [{ model: Trek, as: "trek" }],
                attributes: [
                    "trek_id",
                    [
                        sequelize.fn("COUNT", sequelize.col("Booking.id")),
                        "bookingCount",
                    ],
                ],
                group: ["trek_id", "trek.id"],
                order: [
                    [
                        sequelize.fn("COUNT", sequelize.col("Booking.id")),
                        "DESC",
                    ],
                ],
                limit: 10,
            }),
        ]);

        res.json({
            statusBreakdown: analytics[0],
            revenue: analytics[1][0] || {
                totalRevenue: 0,
                confirmedBookings: 0,
            },
            topTreks: analytics[2],
        });
    } catch (error) {
        console.error("Error fetching booking analytics:", error);
        res.status(500).json({ message: "Failed to fetch analytics" });
    }
};

module.exports = {
    createBooking,
    createVendorBooking,
    getUserBookings,
    getBookingById,
    cancelBooking,
    updateBooking,
    processPayment,
    getPaymentStatus,
    getBookingConfirmation,
    getBookingInvoice,
    getVendorBookings,
    updateBookingStatus,
    getBookingParticipants,
    getAllBookings,
    getBookingAnalytics,
};
