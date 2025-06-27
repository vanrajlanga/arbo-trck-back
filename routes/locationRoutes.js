const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
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
} = require("../controllers/locationController");

// City Management Routes (Admin only)
router.get("/admin/cities", authMiddleware, getCities);
router.get("/admin/cities/:id", authMiddleware, getCityById);
router.post("/admin/cities", authMiddleware, createCity);
router.put("/admin/cities/:id", authMiddleware, updateCity);
router.delete("/admin/cities/:id", authMiddleware, deleteCity);

// Pickup Points Management (Admin only)
router.get("/admin/pickup-points", authMiddleware, getPickupPoints);
router.post("/admin/pickup-points", authMiddleware, createPickupPoint);
router.put("/admin/pickup-points/:id", authMiddleware, updatePickupPoint);
router.delete("/admin/pickup-points/:id", authMiddleware, deletePickupPoint);

// Trek-Location Mapping (Admin only)
router.get("/admin/mappings", authMiddleware, getMappings);
router.post("/admin/mappings", authMiddleware, createMapping);
router.put("/admin/mappings/:id", authMiddleware, updateMapping);
router.delete("/admin/mappings/:id", authMiddleware, deleteMapping);

// Weather Management (Admin only)
router.get("/admin/weather-logs", authMiddleware, getWeatherLogs);
router.post("/admin/weather-logs", authMiddleware, createWeatherLog);

// Public Routes (for vendors and users)
router.get("/cities", getCities); // Public access for dropdown lists
router.get("/cities/:id/pickup-points", getPickupPoints); // Public access for pickup points by city

module.exports = router;
