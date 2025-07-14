const express = require("express");
const router = express.Router();
const activityController = require("../../controllers/vendor/activityController");

// Vendor activity routes
router.get("/", activityController.getAllActivities);
router.get("/categories", activityController.getCategories);

module.exports = router;
