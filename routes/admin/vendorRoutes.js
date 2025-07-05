const express = require("express");
const router = express.Router();
const vendorController = require("../../controllers/vendorController");

// Admin vendor management routes
router.get("/", vendorController.getAllVendors);
router.get("/:id", vendorController.getVendorById);
router.post("/", vendorController.createVendor);
router.put("/:id", vendorController.updateVendor);
router.delete("/:id", vendorController.deleteVendor);
router.patch("/:id/status", vendorController.updateVendorStatus);

// Placeholder routes for future implementation
router.get("/:id/treks", (req, res) => {
    res.json({ message: "Get vendor treks endpoint - to be implemented" });
});

router.get("/:id/bookings", (req, res) => {
    res.json({ message: "Get vendor bookings endpoint - to be implemented" });
});

router.get("/:id/analytics", (req, res) => {
    res.json({ message: "Get vendor analytics endpoint - to be implemented" });
});

module.exports = router;
