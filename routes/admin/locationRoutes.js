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
    getMappings,
    createMapping,
    updateMapping,
    deleteMapping,
    getWeatherLogs,
    createWeatherLog,
} = require("../../controllers/locationController");

// City Management Routes
router.get("/cities", getCities);
router.get("/cities/:id", getCityById);
router.post("/cities", createCity);
router.put("/cities/:id", updateCity);
router.delete("/cities/:id", deleteCity);

// Pickup Points Management
router.get("/pickup-points", getPickupPoints);
router.post("/pickup-points", createPickupPoint);
router.put("/pickup-points/:id", updatePickupPoint);
router.delete("/pickup-points/:id", deletePickupPoint);

// Trek-Location Mapping
router.get("/mappings", getMappings);
router.post("/mappings", createMapping);
router.put("/mappings/:id", updateMapping);
router.delete("/mappings/:id", deleteMapping);

// Weather Management
router.get("/weather-logs", getWeatherLogs);
router.post("/weather-logs", createWeatherLog);

module.exports = router;
