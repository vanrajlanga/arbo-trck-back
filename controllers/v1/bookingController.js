const {
    Booking,
    BookingTraveler,
    Trek,
    Customer,
    Vendor,
    PickupPoint,
    Coupon,
    PaymentLog,
    Batch,
    sequelize,
    Traveler,
} = require("../../models");
const { Op } = require("sequelize");
const {
    createRazorpayOrder,
    verifyRazorpaySignature,
    getPaymentDetails,
} = require("../../utils/razorpayUtils");
const {
    updateBatchSlotsOnBooking,
    updateBatchSlotsOnCancellation,
} = require("../../utils/batchSlotManager");

// Mobile: Get customer bookings
exports.getCustomerBookings = async (req, res) => {
    try {
        const customerId = req.user.customerId;
        const { page = 1, limit = 10, status = "" } = req.query;
        const offset = (page - 1) * limit;

        if (!customerId) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Customer account required.",
            });
        }

        const whereClause = { customer_id: customerId };
        if (status && status !== "all") {
            whereClause.status = status;
        }

        const { count, rows: bookings } = await Booking.findAndCountAll({
            where: whereClause,
            include: [
                { model: Trek, as: "trek" },
                { model: Vendor, as: "vendor" },
                { model: PickupPoint, as: "pickupPoint" },
                {
                    model: BookingTraveler,
                    as: "travelers",
                    include: [{ model: Traveler, as: "traveler" }],
                },
                { model: PaymentLog, as: "payments" },
            ],
            order: [["created_at", "DESC"]],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        res.json({
            success: true,
            data: bookings,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalCount: count,
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

// Mobile: Get booking by ID
exports.getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const customerId = req.user.customerId;

        if (!customerId) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Customer account required.",
            });
        }

        const booking = await Booking.findOne({
            where: { id, customer_id: customerId },
            include: [
                { model: Trek, as: "trek" },
                { model: Vendor, as: "vendor" },
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

// Mobile: Create booking
exports.createBooking = async (req, res) => {
    try {
        const {
            trekId,
            batchId,
            travelers,
            pickupPointId,
            specialRequests,
            couponCode,
        } = req.body;
        const customerId = req.user.customerId;

        if (!customerId) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Customer account required.",
            });
        }

        // Validate trek exists and is active
        const trek = await Trek.findOne({
            where: { id: trekId, status: "active" },
            include: [{ model: Vendor, as: "vendor" }],
        });

        if (!trek) {
            return res.status(404).json({
                success: false,
                message: "Trek not found or inactive",
            });
        }

        // Validate batch exists and belongs to the trek
        const batch = await Batch.findOne({
            where: { id: batchId, trek_id: trekId },
        });

        if (!batch) {
            return res.status(404).json({
                success: false,
                message: "Batch not found",
            });
        }

        // Check if batch has enough available slots
        const availableSlots =
            batch.available_slots || batch.capacity - (batch.booked_slots || 0);
        if (availableSlots < travelers.length) {
            return res.status(400).json({
                success: false,
                message: `Not enough slots available. Available: ${availableSlots}, Requested: ${travelers.length}`,
            });
        }

        // Calculate pricing
        const participantCount = travelers.length;
        const totalAmount = trek.base_price * participantCount;
        let finalAmount = totalAmount;
        let discountAmount = 0;

        // Apply coupon if provided
        if (couponCode) {
            const coupon = await Coupon.findOne({
                where: { code: couponCode, status: "active" },
            });

            if (coupon) {
                discountAmount =
                    (totalAmount * coupon.discount_percentage) / 100;
                finalAmount = totalAmount - discountAmount;
            }
        }

        // Create booking
        const booking = await Booking.create({
            customer_id: customerId,
            trek_id: trekId,
            batch_id: batchId,
            vendor_id: trek.vendor_id,
            pickup_point_id: pickupPointId,
            total_travelers: participantCount,
            total_amount: totalAmount,
            discount_amount: discountAmount,
            final_amount: finalAmount,
            status: "pending",
            payment_status: "pending",
            booking_date: new Date(),
            special_requests: specialRequests,
        });

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

        // Fetch complete booking data
        const completeBooking = await Booking.findByPk(booking.id, {
            include: [
                { model: Trek, as: "trek" },
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
            success: true,
            message: "Booking created successfully",
            data: completeBooking,
        });
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create booking",
        });
    }
};

// Mobile: Create Razorpay order
exports.createOrder = async (req, res) => {
    try {
        const {
            trekId,
            batchId,
            travelers,
            finalAmount,
            pickupPointId,
            couponCode,
        } = req.body;
        const customerId = req.user.customerId;

        if (!customerId) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Customer account required.",
            });
        }

        // Validate required fields
        if (!trekId || !batchId || !travelers || travelers.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Trek ID, batch ID, and travelers are required",
            });
        }

        // Validate trek exists and is active
        const trek = await Trek.findOne({
            where: { id: trekId, status: "active" },
        });

        if (!trek) {
            return res.status(404).json({
                success: false,
                message: "Trek not found or inactive",
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
        console.error("Error creating order:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create order",
        });
    }
};

// Mobile: Verify payment and create booking
exports.verifyPayment = async (req, res) => {
    try {
        const {
            orderId,
            paymentId,
            signature,
            trekId,
            batchId,
            travelers,
            finalAmount,
            pickupPointId,
            couponCode,
            specialRequests,
        } = req.body;
        const customerId = req.user.customerId;

        if (!customerId) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Customer account required.",
            });
        }

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

        // Get trek details
        const trek = await Trek.findOne({
            where: { id: trekId, status: "active" },
        });

        if (!trek) {
            return res.status(404).json({
                success: false,
                message: "Trek not found or inactive",
            });
        }

        // Validate batch exists and has enough slots
        const batch = await Batch.findOne({
            where: { id: batchId, trek_id: trekId },
        });

        if (!batch) {
            return res.status(404).json({
                success: false,
                message: "Batch not found",
            });
        }

        // Check if batch has enough available slots
        const availableSlots =
            batch.available_slots || batch.capacity - (batch.booked_slots || 0);
        if (availableSlots < travelers.length) {
            return res.status(400).json({
                success: false,
                message: `Not enough slots available. Available: ${availableSlots}, Requested: ${travelers.length}`,
            });
        }

        // Calculate pricing
        const participantCount = travelers.length;
        const totalAmount = trek.base_price * participantCount;
        let calculatedFinalAmount = totalAmount;
        let discountAmount = 0;

        // Apply coupon if provided
        if (couponCode) {
            const coupon = await Coupon.findOne({
                where: { code: couponCode, status: "active" },
            });

            if (coupon) {
                discountAmount =
                    (totalAmount * coupon.discount_percentage) / 100;
                calculatedFinalAmount = totalAmount - discountAmount;
            }
        }

        // Create the booking
        const bookingData = {
            customer_id: customerId,
            trek_id: trekId,
            batch_id: batchId,
            vendor_id: trek.vendor_id,
            pickup_point_id: pickupPointId,
            total_travelers: participantCount,
            total_amount: totalAmount,
            discount_amount: discountAmount,
            final_amount: calculatedFinalAmount,
            status: "confirmed",
            payment_status: "completed",
            booking_date: new Date(),
            special_requests: specialRequests,
        };

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
                { model: Vendor, as: "vendor" },
                { model: PickupPoint, as: "pickupPoint" },
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
            data: completeBooking,
            payment: {
                orderId,
                paymentId,
                amount: payment.amount,
                status: payment.status,
            },
        });
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({
            success: false,
            message: "Failed to verify payment",
        });
    }
};

// Mobile: Cancel booking
exports.cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const customerId = req.user.customerId;

        if (!customerId) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Customer account required.",
            });
        }

        const booking = await Booking.findOne({
            where: { id, customer_id: customerId },
            include: [{ model: Batch, as: "batch" }],
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        if (booking.status === "cancelled") {
            return res.status(400).json({
                success: false,
                message: "Booking is already cancelled",
            });
        }

        // Update booking status
        await booking.update({ status: "cancelled" });

        // Update batch slots
        if (booking.batch) {
            try {
                await updateBatchSlotsOnCancellation(
                    booking.batch_id,
                    booking.total_travelers
                );
            } catch (slotError) {
                console.error("Error updating batch slots:", slotError);
            }
        }

        res.json({
            success: true,
            message: "Booking cancelled successfully",
            data: booking,
        });
    } catch (error) {
        console.error("Error cancelling booking:", error);
        res.status(500).json({
            success: false,
            message: "Failed to cancel booking",
        });
    }
};
