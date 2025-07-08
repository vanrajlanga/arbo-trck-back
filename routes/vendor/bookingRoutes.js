const express = require("express");
const router = express.Router();
const bookingController = require("../../controllers/bookingController");

// Vendor booking routes
router.get("/", bookingController.getVendorBookings);
router.get("/analytics", bookingController.getVendorBookingAnalytics);
router.get("/:id", bookingController.getBookingById);
router.post("/", bookingController.createVendorBooking);
router.patch("/:id/status", bookingController.updateBookingStatus);
router.get("/:id/participants", bookingController.getBookingParticipants);

// Razorpay payment routes
router.post("/create-trek-order", bookingController.createTrekOrder);
router.post("/verify-payment", bookingController.verifyPaymentAndCreateBooking);

// Placeholder routes for future implementation
router.put("/:id", (req, res) => {
    res.json({ message: "Update vendor booking endpoint - to be implemented" });
});

router.post("/:id/cancel", (req, res) => {
    res.json({ message: "Cancel vendor booking endpoint - to be implemented" });
});

module.exports = router;
