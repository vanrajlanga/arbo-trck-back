const express = require("express");
const router = express.Router();
const locationController = require("../../controllers/locationController");
const authMiddleware = require("../../middleware/authMiddleware");

// Public routes (for mobile app) - simplified for now
router.get("/cities", locationController.getCities);

// Protected routes
router.use(authMiddleware);

// Admin routes for managing locations
router.post("/cities", locationController.createCity);
router.put("/cities/:id", locationController.updateCity);
router.delete("/cities/:id", locationController.deleteCity);

router.post("/pickup-points", locationController.createPickupPoint);
router.put("/pickup-points/:id", locationController.updatePickupPoint);
router.delete("/pickup-points/:id", locationController.deletePickupPoint);

module.exports = router;
