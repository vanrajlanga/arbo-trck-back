const express = require("express");
const router = express.Router();
const {
    createBooking,
    getCustomerBookings,
    getBookingDetails,
    cancelBooking,
} = require("../../controllers/newBookingController");
const {
    authenticateCustomer,
} = require("../../middleware/customerAuthMiddleware");

// All routes require customer authentication
router.use(authenticateCustomer);

router.post("/", createBooking);
router.get("/", getCustomerBookings);
router.get("/:id", getBookingDetails);
router.put("/:id/cancel", cancelBooking);

module.exports = router;
