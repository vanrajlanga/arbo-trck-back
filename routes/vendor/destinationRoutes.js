const express = require("express");
const router = express.Router();
const {
    getAllDestinations,
    getDestinationById,
    createDestination,
    updateDestination,
    deleteDestination,
    togglePopularity,
    getPopularDestinations,
} = require("../../controllers/destinationController");
const authMiddleware = require("../../middleware/authMiddleware");

// All routes require authentication
router.use(authMiddleware);

// Get all destinations (for dropdowns)
router.get("/", getAllDestinations);

// Get popular destinations
router.get("/popular", getPopularDestinations);

// Get destination by ID
router.get("/:id", getDestinationById);

// Create new destination
router.post("/", createDestination);

// Update destination
router.put("/:id", updateDestination);

// Delete destination
router.delete("/:id", deleteDestination);

// Toggle destination popularity
router.patch("/:id/toggle-popularity", togglePopularity);

module.exports = router;
