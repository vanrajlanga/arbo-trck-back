const express = require("express");
const router = express.Router();
const bookingController = require("../../controllers/bookingController");

// Admin booking management routes
router.get("/", bookingController.getAllBookings);
router.get("/analytics", bookingController.getBookingAnalytics);
router.get("/:id", bookingController.getBookingById);
router.put("/:id", bookingController.updateBooking);
router.patch("/:id/status", bookingController.updateBookingStatus);
router.get("/:id/participants", bookingController.getBookingParticipants);
router.post("/:id/cancel", bookingController.cancelBooking);

// Placeholder routes for future implementation
router.post("/", (req, res) => {
    res.json({ message: "Create booking endpoint - to be implemented" });
});

router.delete("/:id", (req, res) => {
    res.json({ message: "Delete booking endpoint - to be implemented" });
});

module.exports = router;
