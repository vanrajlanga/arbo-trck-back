const express = require("express");
const {
    getAllVendors,
    getVendorById,
    updateVendor,
    deleteVendor,
} = require("../../controllers/vendorController");
const authMiddleware = require("../../middleware/authMiddleware");

const router = express.Router();

// All routes protected
router.use(authMiddleware);

router.get("/", getAllVendors);
router.get("/:id", getVendorById);
router.put("/:id", updateVendor);
router.delete("/:id", deleteVendor);

module.exports = router;
