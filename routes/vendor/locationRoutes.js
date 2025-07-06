const express = require("express");
const router = express.Router();
const {
    getCities,
    getCityById,
    createCity,
    updateCity,
    deleteCity,
    getPickupPoints,
    createPickupPoint,
    updatePickupPoint,
    deletePickupPoint,
    getStates,
} = require("../../controllers/locationController");

// Vendor location routes (full city management, pickup points)
router.get("/states", getStates);
router.get("/cities", getCities);
router.get("/cities/:id", getCityById);
router.post("/cities", createCity);
router.put("/cities/:id", updateCity);
router.delete("/cities/:id", deleteCity);
router.get("/cities/:id/pickup-points", getPickupPoints);
router.get("/pickup-points", getPickupPoints);
router.post("/pickup-points", createPickupPoint);
router.put("/pickup-points/:id", updatePickupPoint);
router.delete("/pickup-points/:id", deletePickupPoint);

module.exports = router;
