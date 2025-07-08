const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const bookingController = require("../../controllers/bookingController");
const authMiddleware = require("../../middleware/authMiddleware");
const validationMiddleware = require("../../middleware/validationMiddleware");

// Validation middleware for booking creation
const validateBooking = [
    body("trekId")
        .notEmpty()
        .withMessage("Trek ID is required")
        .isInt()
        .withMessage("Trek ID must be a valid number"),
    body("participants")
        .isArray({ min: 1 })
        .withMessage("At least one participant is required"),
    body("participants.*.name")
        .notEmpty()
        .withMessage("Participant name is required"),
    body("participants.*.age")
        .isInt({ min: 1, max: 120 })
        .withMessage("Participant age must be between 1 and 120"),
    body("participants.*.gender")
        .isIn(["male", "female", "other"])
        .withMessage("Gender must be male, female, or other"),
    body("participants.*.phone")
        .isMobilePhone()
        .withMessage("Valid phone number is required"),
    body("participants.*.emergencyContact")
        .isMobilePhone()
        .withMessage("Valid emergency contact is required"),
    body("pickupPointId")
        .optional()
        .isInt()
        .withMessage("Pickup point ID must be a valid number"),
    body("couponCode")
        .optional()
        .isLength({ min: 3, max: 20 })
        .withMessage("Coupon code must be between 3 and 20 characters"),
];

// User booking routes (require authentication)
router.use(authMiddleware);

// Create a new booking
router.post(
    "/",
    validateBooking,
    validationMiddleware,
    bookingController.createBooking
);

// Get user's bookings
router.get("/my-bookings", bookingController.getUserBookings);

// Get specific booking details (mobile optimized)
router.get("/:id", bookingController.getMobileBookingById);

// Cancel a booking (mobile optimized)
router.patch("/:id/cancel", bookingController.updateMobileBookingStatus);

// Update booking (limited fields)
router.put("/:id", bookingController.updateBooking);

// Payment related routes
router.post("/:id/payment", bookingController.processPayment);
router.get("/:id/payment-status", bookingController.getPaymentStatus);

// Mobile payment flow routes
router.post("/create-trek-order", bookingController.createMobileTrekOrder);
router.post("/verify-payment", bookingController.verifyMobilePayment);

// Booking confirmation and documents
router.get("/:id/confirmation", bookingController.getBookingConfirmation);
router.get("/:id/invoice", bookingController.getBookingInvoice);

// Get booking participants (mobile optimized)
router.get("/:id/participants", bookingController.getMobileBookingParticipants);

// Get customer analytics (mobile optimized)
router.get("/analytics", bookingController.getMobileBookingAnalytics);

module.exports = router;
