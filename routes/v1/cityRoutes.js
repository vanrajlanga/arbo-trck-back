const express = require("express");
const router = express.Router();
const locationController = require("../../controllers/locationController");

// Public city routes (no authentication required)
router.get("/", locationController.getCities);
router.get("/:id", locationController.getCityById);

module.exports = router;
