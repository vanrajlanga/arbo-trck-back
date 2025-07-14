const express = require("express");
const router = express.Router();
const stateController = require("../../controllers/vendor/stateController");
const authMiddleware = require("../../middleware/authMiddleware");

// All routes require authentication
router.use(authMiddleware);

// Vendor state routes (read-only)
router.get("/", stateController.getAllStates);
router.get("/popular", stateController.getPopularStates);
router.get("/region/:region", stateController.getStatesByRegion);
router.get("/:id", stateController.getStateById);

module.exports = router;
