const express = require("express");
const router = express.Router();
const {
    getAllStates,
    getStateById,
    createState,
    updateState,
    deleteState,
    toggleStatePopularity,
    getPopularStates,
    getStatesByRegion,
} = require("../../controllers/stateController");
const authMiddleware = require("../../middleware/authMiddleware");

// All routes require authentication
router.use(authMiddleware);

// State management routes
router.get("/", getAllStates);
router.get("/popular", getPopularStates);
router.get("/region/:region", getStatesByRegion);
router.get("/:id", getStateById);
router.post("/", createState);
router.put("/:id", updateState);
router.delete("/:id", deleteState);
router.patch("/:id/popularity", toggleStatePopularity);

module.exports = router;
