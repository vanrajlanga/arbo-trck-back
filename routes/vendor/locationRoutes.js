const express = require("express");
const router = express.Router();
const locationController = require("../../controllers/vendor/locationController");

// Vendor location routes (full city management, pickup points)
router.get("/states", locationController.getStates);
router.get("/cities", locationController.getCities);
router.get("/cities/:id", locationController.getCityById);
router.post("/cities", locationController.createCity);
router.put("/cities/:id", locationController.updateCity);
router.delete("/cities/:id", locationController.deleteCity);
router.get("/cities/:id/pickup-points", locationController.getPickupPoints);
router.get("/pickup-points", locationController.getPickupPoints);
router.post("/pickup-points", locationController.createPickupPoint);
router.put("/pickup-points/:id", locationController.updatePickupPoint);
router.delete("/pickup-points/:id", locationController.deletePickupPoint);

module.exports = router;
