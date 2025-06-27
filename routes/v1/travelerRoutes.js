const express = require("express");
const router = express.Router();
const {
    getTravelers,
    createTraveler,
    getTravelerDetails,
    updateTraveler,
    deleteTraveler,
    getTravelerBookings,
} = require("../../controllers/travelerController");
const {
    authenticateCustomer,
} = require("../../middleware/customerAuthMiddleware");

// All routes require customer authentication
router.use(authenticateCustomer);

router.get("/", getTravelers);
router.post("/", createTraveler);
router.get("/:id", getTravelerDetails);
router.put("/:id", updateTraveler);
router.delete("/:id", deleteTraveler);
router.get("/:id/bookings", getTravelerBookings);

module.exports = router;
