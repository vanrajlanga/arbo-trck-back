const express = require("express");
const router = express.Router();
const {
    getAllStates,
    getStateById,
    getPopularStates,
    getStatesByRegion,
} = require("../../controllers/stateController");
const authMiddleware = require("../../middleware/authMiddleware");

// All routes require authentication
router.use(authMiddleware);

// Vendor state routes (read-only)
router.get("/", getAllStates);
router.get("/popular", getPopularStates);
router.get("/region/:region", getStatesByRegion);
router.get("/:id", getStateById);

module.exports = router;
