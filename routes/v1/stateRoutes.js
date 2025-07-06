const express = require("express");
const router = express.Router();
const {
    getAllStates,
    getStateById,
    getPopularStates,
    getStatesByRegion,
} = require("../../controllers/stateController");

// Public state routes (no authentication required)
router.get("/", getAllStates);
router.get("/popular", getPopularStates);
router.get("/region/:region", getStatesByRegion);
router.get("/:id", getStateById);

module.exports = router;
