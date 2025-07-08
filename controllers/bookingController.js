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
} = require("../models");
const { Op } = require("sequelize");
const logger = require("../utils/logger");
const {
    createRazorpayOrder,
    verifyRazorpaySignature,
    getPaymentDetails,
} = require("../utils/razorpayUtils");

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

        if (trek.status !== "active") {
            return res.status(400).json({
                success: false,
                message: "Cannot book inactive trek",
            });
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

        // Create or get travelers and link them to booking
        const travelerIds = [];

        for (const participant of participants) {
            // Check if traveler already exists for this customer
            let traveler = await Traveler.findOne({
                where: {
                    customer_id: userId,
                    name: participant.name,
                    phone: participant.phone,
                    is_active: true,
                },
            });

            if (!traveler) {
                // Create new traveler
                traveler = await Traveler.create({
                    customer_id: userId,
                    name: participant.name,
                    age: participant.age,
                    gender: participant.gender,
                    phone: participant.phone,
                    emergency_contact_name: participant.name, // Default to same name
                    emergency_contact_phone: participant.emergencyContact,
                    emergency_contact_relation: "Self",
                    medical_conditions: participant.medicalConditions || null,
                });
            }

            // Link traveler to booking
            await BookingTraveler.create({
                booking_id: booking.id,
                traveler_id: traveler.id,
                is_primary: travelerIds.length === 0, // First traveler is primary
                status: "confirmed",
            });

            travelerIds.push(traveler.id);
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
                {
                    model: BookingTraveler,
                    as: "travelers",
                    include: [{ model: Traveler, as: "traveler" }],
                },
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
                {
                    model: BookingTraveler,
                    as: "travelers",
                    include: [{ model: Traveler, as: "traveler" }],
                },
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
            travelers,
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

        if (trek.status !== "active") {
            return res.status(400).json({
                success: false,
                message: "Cannot book inactive trek",
            });
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

        if (currentBookings + travelers.length > trek.max_participants) {
            return res.status(400).json({
                message: "Not enough slots available",
                availableSlots: trek.max_participants - currentBookings,
            });
        }

        // Calculate pricing
        const participantCount = travelers.length || 0;
        const totalAmount = trek.base_price * participantCount;
        const finalAmount = totalAmount; // No discount for vendor-created bookings

        console.log("Creating booking with:", {
            customerId,
            trekId,
            vendorId,
            participantCount,
            totalAmount,
            finalAmount,
            travelers,
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

        // Create or get travelers and link them to booking
        if (travelers && travelers.length > 0) {
            for (const traveler of travelers) {
                // Check if traveler already exists for this customer
                let existingTraveler = await Traveler.findOne({
                    where: {
                        customer_id: customerId,
                        name: traveler.name,
                        phone: traveler.phone,
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
                        phone: traveler.phone,
                        email: traveler.email || null,
                        emergency_contact_name:
                            traveler.emergency_contact_name || traveler.name,
                        emergency_contact_phone:
                            traveler.emergency_contact_phone,
                        emergency_contact_relation:
                            traveler.emergency_contact_relation || "Self",
                        medical_conditions: traveler.medical_conditions || null,
                        dietary_restrictions:
                            traveler.dietary_restrictions || null,
                    });
                }

                // Link traveler to booking
                await BookingTraveler.create({
                    booking_id: booking.id,
                    traveler_id: existingTraveler.id,
                    is_primary: false, // Vendor bookings don't have primary traveler concept
                    status: "confirmed",
                });
            }
            console.log("Travelers linked to booking successfully");
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
        console.error("Error details:", {
            message: error.message,
            stack: error.stack,
            name: error.name,
        });
        res.status(500).json({ message: "Failed to create booking" });
    }
};

// Vendor: Get booking travelers
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
                {
                    model: BookingTraveler,
                    as: "travelers",
                    include: [{ model: Traveler, as: "traveler" }],
                },
            ],
        });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Transform travelers data to match expected format
        const travelers = booking.travelers.map((bt) => ({
            id: bt.traveler.id,
            name: bt.traveler.name,
            age: bt.traveler.age,
            gender: bt.traveler.gender,
            phone: bt.traveler.phone,
            emergency_contact: bt.traveler.emergency_contact_phone,
            medical_conditions: bt.traveler.medical_conditions,
            is_primary: bt.is_primary,
            status: bt.status,
        }));

        res.json({
            bookingId: booking.id,
            trek: booking.trek,
            participants: travelers, // Keep backward compatibility
            travelers: travelers, // New format
        });
    } catch (error) {
        console.error("Error fetching booking travelers:", error);
        res.status(500).json({ message: "Failed to fetch travelers" });
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
                {
                    model: BookingTraveler,
                    as: "travelers",
                    include: [{ model: Traveler, as: "traveler" }],
                },
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

// Vendor: Get booking analytics (vendor-specific)
const getVendorBookingAnalytics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const vendorId = req.user.vendorId; // Get vendor ID from JWT token

        const whereClause = { vendor_id: vendorId };
        if (startDate && endDate) {
            whereClause.created_at = {
                [Op.between]: [new Date(startDate), new Date(endDate)],
            };
        }

        const analytics = await Promise.all([
            // Total bookings by status for this vendor
            Booking.findAll({
                where: whereClause,
                attributes: [
                    "status",
                    [sequelize.fn("COUNT", sequelize.col("id")), "count"],
                ],
                group: ["status"],
            }),

            // Revenue analytics for this vendor
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

            // Top treks for this vendor
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
        console.error("Error fetching vendor booking analytics:", error);
        res.status(500).json({ message: "Failed to fetch analytics" });
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

// Mobile App: Get booking by ID (optimized for mobile)
const getMobileBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const booking = await Booking.findOne({
            where: {
                id: id,
                user_id: userId,
            },
            include: [
                {
                    model: Trek,
                    as: "trek",
                    attributes: [
                        "id",
                        "title",
                        "destination",
                        "start_date",
                        "end_date",
                        "base_price",
                        "images",
                        "description",
                    ],
                },
                {
                    model: BookingTraveler,
                    as: "travelers",
                    include: [{ model: Traveler, as: "traveler" }],
                },
                {
                    model: PaymentLog,
                    as: "payments",
                    attributes: [
                        "id",
                        "amount",
                        "status",
                        "payment_method",
                        "created_at",
                    ],
                },
            ],
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        // Transform data for mobile consumption
        const mobileBooking = {
            id: booking.id,
            booking_date: booking.booking_date,
            trek_date: booking.trek?.start_date,
            status: booking.status,
            payment_status: booking.payment_status,
            total_amount: booking.total_amount,
            final_amount: booking.final_amount,
            discount_amount: booking.discount_amount,
            trek: {
                id: booking.trek?.id,
                title: booking.trek?.title,
                destination: booking.trek?.destination,
                start_date: booking.trek?.start_date,
                end_date: booking.trek?.end_date,
                base_price: booking.trek?.base_price,
                images: booking.trek?.images,
                description: booking.trek?.description,
            },
            travelers:
                booking.travelers?.map((bt) => ({
                    id: bt.traveler.id,
                    name: bt.traveler.name,
                    age: bt.traveler.age,
                    gender: bt.traveler.gender,
                    phone: bt.traveler.phone,
                    emergency_contact: bt.traveler.emergency_contact_phone,
                    is_primary: bt.is_primary,
                    status: bt.status,
                })) || [],
            payments:
                booking.payments?.map((payment) => ({
                    id: payment.id,
                    amount: payment.amount,
                    status: payment.status,
                    payment_method: payment.payment_method,
                    created_at: payment.created_at,
                })) || [],
        };

        res.json({
            success: true,
            booking: mobileBooking,
        });
    } catch (error) {
        console.error("Error fetching mobile booking:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch booking",
        });
    }
};

// Mobile App: Get booking participants (optimized for mobile)
const getMobileBookingParticipants = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const booking = await Booking.findOne({
            where: {
                id: id,
                user_id: userId,
            },
            include: [
                {
                    model: Trek,
                    as: "trek",
                    attributes: ["id", "title", "destination", "start_date"],
                },
                {
                    model: BookingTraveler,
                    as: "travelers",
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

        // Transform travelers data for mobile
        const travelers = booking.travelers.map((bt) => ({
            id: bt.traveler.id,
            name: bt.traveler.name,
            age: bt.traveler.age,
            gender: bt.traveler.gender,
            phone: bt.traveler.phone,
            emergency_contact: bt.traveler.emergency_contact_phone,
            medical_conditions: bt.traveler.medical_conditions,
            is_primary: bt.is_primary,
            status: bt.status,
        }));

        res.json({
            success: true,
            bookingId: booking.id,
            trek: {
                id: booking.trek?.id,
                title: booking.trek?.title,
                destination: booking.trek?.destination,
                start_date: booking.trek?.start_date,
            },
            travelers: travelers,
        });
    } catch (error) {
        console.error("Error fetching mobile booking participants:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch travelers",
        });
    }
};

// Mobile App: Update booking status (customer can only cancel)
const updateMobileBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.id;

        // Only allow customers to cancel their own bookings
        if (status !== "cancelled") {
            return res.status(403).json({
                success: false,
                message: "Customers can only cancel bookings",
            });
        }

        const booking = await Booking.findOne({
            where: {
                id: id,
                user_id: userId,
            },
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        // Check if booking can be cancelled
        if (booking.status === "cancelled") {
            return res.status(400).json({
                success: false,
                message: "Booking is already cancelled",
            });
        }

        if (booking.status === "completed") {
            return res.status(400).json({
                success: false,
                message: "Cannot cancel completed booking",
            });
        }

        // Update booking status
        await booking.update({
            status: status,
            cancelled_at: new Date(),
        });

        res.json({
            success: true,
            message: "Booking cancelled successfully",
            booking: {
                id: booking.id,
                status: booking.status,
                cancelled_at: booking.cancelled_at,
            },
        });
    } catch (error) {
        console.error("Error updating mobile booking status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update booking status",
        });
    }
};

// Mobile App: Get booking analytics (customer-specific)
const getMobileBookingAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        const { startDate, endDate } = req.query;

        const whereClause = { user_id: userId };
        if (startDate && endDate) {
            whereClause.created_at = {
                [Op.between]: [new Date(startDate), new Date(endDate)],
            };
        }

        const analytics = await Promise.all([
            // Booking status breakdown for this customer
            Booking.findAll({
                where: whereClause,
                attributes: [
                    "status",
                    [sequelize.fn("COUNT", sequelize.col("id")), "count"],
                ],
                group: ["status"],
            }),

            // Total spent by this customer
            Booking.findAll({
                where: { ...whereClause, status: "confirmed" },
                attributes: [
                    [
                        sequelize.fn("SUM", sequelize.col("final_amount")),
                        "totalSpent",
                    ],
                    [
                        sequelize.fn("COUNT", sequelize.col("id")),
                        "confirmedBookings",
                    ],
                ],
            }),

            // Favorite destinations for this customer
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
                limit: 5,
            }),
        ]);

        res.json({
            success: true,
            analytics: {
                statusBreakdown: analytics[0],
                spending: analytics[1][0] || {
                    totalSpent: 0,
                    confirmedBookings: 0,
                },
                favoriteDestinations: analytics[2],
            },
        });
    } catch (error) {
        console.error("Error fetching mobile booking analytics:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch analytics",
        });
    }
};

// Vendor: Create Razorpay order for booking
const createTrekOrder = async (req, res) => {
    try {
        const { trekId, customerId, travelers, finalAmount } = req.body;
        const vendorId = req.user.vendorId;

        // Validate required fields
        if (!trekId || !customerId || !travelers || !finalAmount) {
            return res.status(400).json({
                success: false,
                message:
                    "Trek ID, customer ID, travelers, and final amount are required",
            });
        }

        // Verify trek exists and belongs to vendor
        const trek = await Trek.findOne({
            where: {
                id: trekId,
                vendor_id: vendorId,
            },
        });

        if (!trek) {
            return res.status(404).json({
                success: false,
                message: "Trek not found or not authorized",
            });
        }

        // Verify customer exists
        const customer = await Customer.findByPk(customerId);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found",
            });
        }

        // Create Razorpay order
        const orderResult = await createRazorpayOrder(
            finalAmount,
            "INR",
            `booking_${trekId}_${customerId}_${Date.now()}`
        );

        if (!orderResult.success) {
            return res.status(500).json({
                success: false,
                message: "Failed to create payment order",
                error: orderResult.error,
            });
        }

        // Store order details in session or temporary storage
        // For now, we'll return the order details
        res.json({
            success: true,
            message: "Payment order created successfully",
            order: {
                id: orderResult.order.id,
                amount: orderResult.order.amount,
                currency: orderResult.order.currency,
                receipt: orderResult.order.receipt,
            },
            bookingDetails: {
                trekId,
                customerId,
                travelers,
                finalAmount,
            },
        });
    } catch (error) {
        console.error("Error creating trek order:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create payment order",
        });
    }
};

// Vendor: Verify Razorpay payment and create booking
const verifyPaymentAndCreateBooking = async (req, res) => {
    try {
        const {
            orderId,
            paymentId,
            signature,
            trekId,
            customerId,
            travelers,
            finalAmount,
            pickupPointId,
            couponCode,
        } = req.body;
        const vendorId = req.user.vendorId;

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
        const expectedAmount = Math.round(finalAmount * 100); // Convert to paise
        if (payment.amount !== expectedAmount) {
            return res.status(400).json({
                success: false,
                message: "Payment amount mismatch",
            });
        }

        // Create the booking
        const bookingData = {
            trek_id: trekId,
            customer_id: customerId,
            vendor_id: vendorId,
            total_travelers: travelers.length,
            total_amount: finalAmount,
            final_amount: finalAmount,
            discount_amount: 0, // Will be calculated if coupon is applied
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
                    phone: travelerData.phone,
                    customer_id: customerId,
                },
            });

            if (!traveler) {
                traveler = await Traveler.create({
                    customer_id: customerId,
                    name: travelerData.name,
                    age: travelerData.age,
                    gender: travelerData.gender,
                    phone: travelerData.phone,
                    emergency_contact_name: travelerData.emergency_contact_name,
                    emergency_contact_phone:
                        travelerData.emergency_contact_phone,
                    emergency_contact_relation:
                        travelerData.emergency_contact_relation || null,
                    medical_conditions: travelerData.medical_conditions || null,
                    dietary_restrictions:
                        travelerData.dietary_restrictions || null,
                });
            }

            // Create booking traveler relationship
            return BookingTraveler.create({
                booking_id: booking.id,
                traveler_id: traveler.id,
                is_primary: index === 0, // First traveler is primary
                status: "confirmed",
            });
        });

        await Promise.all(travelerPromises);

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

// Mobile: Create Razorpay order for trek booking
const createMobileTrekOrder = async (req, res) => {
    try {
        const {
            trekId,
            travelers,
            pickupPointId,
            couponCode,
            specialRequests,
        } = req.body;
        const customerId = req.user.id;

        // Validate required fields
        if (!trekId || !travelers || travelers.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Trek ID and travelers are required",
            });
        }

        // Validate travelers
        for (let i = 0; i < travelers.length; i++) {
            const traveler = travelers[i];
            if (
                !traveler.name ||
                !traveler.age ||
                !traveler.phone ||
                !traveler.emergency_contact_phone
            ) {
                return res.status(400).json({
                    success: false,
                    message: `Please fill all required fields for traveler ${
                        i + 1
                    }`,
                });
            }
        }

        // Get trek details
        const trek = await Trek.findByPk(trekId, {
            include: [{ model: Vendor, as: "vendor" }],
        });

        if (!trek) {
            return res.status(404).json({
                success: false,
                message: "Trek not found",
            });
        }

        if (trek.status !== "active") {
            return res.status(400).json({
                success: false,
                message: "Cannot book inactive trek",
            });
        }

        // Calculate amount
        const baseAmount = trek.base_price || trek.price || 0;
        let totalAmount = baseAmount * travelers.length;
        let discountAmount = 0;

        // Apply coupon if provided
        if (couponCode) {
            const coupon = await Coupon.findOne({
                where: { code: couponCode, status: "active" },
            });

            if (coupon) {
                if (coupon.discount_type === "percentage") {
                    discountAmount =
                        (totalAmount * coupon.discount_value) / 100;
                } else {
                    discountAmount = coupon.discount_value;
                }
            }
        }

        const finalAmount = totalAmount - discountAmount;

        // Create Razorpay order
        const orderData = {
            amount: Math.round(finalAmount * 100), // Convert to paise
            currency: "INR",
            receipt: `trek_${trekId}_${Date.now()}`,
            notes: {
                trekId: trekId.toString(),
                customerId: customerId.toString(),
                travelers: travelers.length.toString(),
            },
        };

        const orderResponse = await createRazorpayOrder(orderData);

        if (!orderResponse.success) {
            return res.status(500).json({
                success: false,
                message: "Failed to create payment order",
            });
        }

        // Store order details temporarily (you might want to store this in a separate table)
        // For now, we'll include the booking data in the response

        res.json({
            success: true,
            message: "Order created successfully",
            order: orderResponse.order,
            bookingData: {
                trekId,
                customerId,
                travelers,
                pickupPointId,
                couponCode,
                specialRequests,
                totalAmount,
                discountAmount,
                finalAmount,
            },
        });
    } catch (error) {
        console.error("Error creating mobile trek order:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create order",
        });
    }
};

// Mobile: Verify payment and create booking
const verifyMobilePayment = async (req, res) => {
    try {
        const {
            orderId,
            paymentId,
            signature,
            trekId,
            travelers,
            pickupPointId,
            couponCode,
            specialRequests,
        } = req.body;
        const customerId = req.user.id;

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

        // Get trek details
        const trek = await Trek.findByPk(trekId, {
            include: [{ model: Vendor, as: "vendor" }],
        });

        if (!trek) {
            return res.status(404).json({
                success: false,
                message: "Trek not found",
            });
        }

        // Calculate amount
        const baseAmount = trek.base_price || trek.price || 0;
        let totalAmount = baseAmount * travelers.length;
        let discountAmount = 0;
        let couponId = null;

        // Apply coupon if provided
        if (couponCode) {
            const coupon = await Coupon.findOne({
                where: { code: couponCode, status: "active" },
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

        // Verify payment amount
        const expectedAmount = Math.round(finalAmount * 100); // Convert to paise
        if (payment.amount !== expectedAmount) {
            return res.status(400).json({
                success: false,
                message: "Payment amount mismatch",
            });
        }

        // Create the booking
        const bookingData = {
            customer_id: customerId,
            trek_id: trekId,
            vendor_id: trek.vendor_id,
            pickup_point_id: pickupPointId,
            coupon_id: couponId,
            total_travelers: travelers.length,
            total_amount: totalAmount,
            discount_amount: discountAmount,
            final_amount: finalAmount,
            status: "confirmed",
            payment_status: "completed",
            booking_date: new Date(),
            special_requests: specialRequests,
            booking_source: "mobile",
        };

        // Create booking
        const booking = await Booking.create(bookingData);

        // Create travelers
        const travelerPromises = travelers.map(async (travelerData, index) => {
            // Create or find traveler
            let traveler = await Traveler.findOne({
                where: {
                    phone: travelerData.phone,
                    customer_id: customerId,
                },
            });

            if (!traveler) {
                traveler = await Traveler.create({
                    customer_id: customerId,
                    name: travelerData.name,
                    age: travelerData.age,
                    gender: travelerData.gender,
                    phone: travelerData.phone,
                    emergency_contact_name: travelerData.emergency_contact_name,
                    emergency_contact_phone:
                        travelerData.emergency_contact_phone,
                    emergency_contact_relation:
                        travelerData.emergency_contact_relation || null,
                    medical_conditions: travelerData.medical_conditions || null,
                    dietary_restrictions:
                        travelerData.dietary_restrictions || null,
                });
            }

            // Create booking traveler relationship
            return BookingTraveler.create({
                booking_id: booking.id,
                traveler_id: traveler.id,
                is_primary: index === 0, // First traveler is primary
                status: "confirmed",
            });
        });

        await Promise.all(travelerPromises);

        // Create payment log
        await PaymentLog.create({
            booking_id: booking.id,
            amount: booking.final_amount,
            payment_method: "razorpay",
            transaction_id: paymentId,
            status: "success",
            payment_details: JSON.stringify(payment),
        });

        // Fetch complete booking with associations (mobile optimized)
        const completeBooking = await Booking.findOne({
            where: { id: booking.id },
            include: [
                {
                    model: Trek,
                    as: "trek",
                    attributes: [
                        "id",
                        "title",
                        "description",
                        "base_price",
                        "duration",
                        "difficulty",
                        "meeting_point",
                        "meeting_time",
                    ],
                },
                {
                    model: Customer,
                    as: "customer",
                    attributes: ["id", "name", "email", "phone"],
                },
                {
                    model: BookingTraveler,
                    as: "travelers",
                    include: [
                        {
                            model: Traveler,
                            as: "traveler",
                            attributes: [
                                "id",
                                "name",
                                "age",
                                "gender",
                                "phone",
                                "emergency_contact_name",
                                "emergency_contact_phone",
                            ],
                        },
                    ],
                },
                {
                    model: PaymentLog,
                    as: "payments",
                    attributes: [
                        "amount",
                        "payment_method",
                        "transaction_id",
                        "status",
                    ],
                },
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
        console.error("Error verifying mobile payment:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create booking",
        });
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
    getVendorBookingAnalytics,
    getMobileBookingById,
    getMobileBookingParticipants,
    updateMobileBookingStatus,
    getMobileBookingAnalytics,
    createTrekOrder,
    verifyPaymentAndCreateBooking,
    createMobileTrekOrder,
    verifyMobilePayment,
};
