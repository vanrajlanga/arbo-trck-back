const {
    Booking,
    BookingParticipant,
    Trek,
    User,
    Vendor,
    PickupPoint,
    Coupon,
    PaymentLog,
    Adjustment,
    Cancellation,
} = require("../models");
const { Op } = require("sequelize");

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
        let totalAmount = trek.price * participants.length;
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
            user_id: userId,
            trek_id: trekId,
            vendor_id: trek.vendor_id,
            pickup_point_id: pickupPointId,
            coupon_id: couponId,
            total_participants: participants.length,
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
                { model: User, as: "user" },
                { model: Vendor, as: "vendor" },
                { model: PickupPoint, as: "pickupPoint" },
                { model: BookingParticipant, as: "participants" },
                { model: Coupon, as: "coupon" },
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

        const whereClause = { user_id: userId };
        if (status) {
            whereClause.status = status;
        }

        const bookings = await Booking.findAndCountAll({
            where: whereClause,
            include: [
                { model: Trek, as: "trek" },
                { model: Vendor, as: "vendor" },
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
                user_id: userId, // Ensure user can only access their own bookings
            },
            include: [
                { model: Trek, as: "trek" },
                { model: User, as: "user" },
                { model: Vendor, as: "vendor" },
                { model: PickupPoint, as: "pickupPoint" },
                { model: BookingParticipant, as: "participants" },
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
                user_id: userId,
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
            user_id: userId,
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
                user_id: userId,
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
                { model: BookingParticipant, as: "participants" },
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
                user_id: userId,
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
            user_id: userId,
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
                user_id: userId,
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
                user_id: userId,
                status: "confirmed",
            },
            include: [
                { model: Trek, as: "trek" },
                { model: Vendor, as: "vendor" },
                { model: PickupPoint, as: "pickupPoint" },
                { model: BookingParticipant, as: "participants" },
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
                participants: booking.participants,
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
                user_id: userId,
            },
            include: [
                { model: Trek, as: "trek" },
                { model: User, as: "user" },
                { model: Vendor, as: "vendor" },
                { model: BookingParticipant, as: "participants" },
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
            customer: booking.user,
            trek: booking.trek,
            vendor: booking.vendor,
            participants: booking.participants,
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
        const vendorId = req.user.vendor_id || req.user.id; // Adjust based on your user model
        const { status, page = 1, limit = 10, trekId } = req.query;

        const whereClause = { vendor_id: vendorId };
        if (status) whereClause.status = status;
        if (trekId) whereClause.trek_id = trekId;

        const bookings = await Booking.findAndCountAll({
            where: whereClause,
            include: [
                { model: Trek, as: "trek" },
                { model: User, as: "user" },
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
        console.error("Error fetching vendor bookings:", error);
        res.status(500).json({ message: "Failed to fetch vendor bookings" });
    }
};

// Vendor: Update booking status
const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const vendorId = req.user.vendor_id || req.user.id;

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
                    { model: User, as: "user" },
                ],
            }),
        });
    } catch (error) {
        console.error("Error updating booking status:", error);
        res.status(500).json({ message: "Failed to update booking status" });
    }
};

// Vendor: Get booking participants
const getBookingParticipants = async (req, res) => {
    try {
        const { id } = req.params;
        const vendorId = req.user.vendor_id || req.user.id;

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
                { model: User, as: "user" },
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
