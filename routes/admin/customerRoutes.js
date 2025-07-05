const express = require("express");
const router = express.Router();
const customerController = require("../../controllers/customerController");

// Admin customer management routes
router.get("/", customerController.getVendorCustomers);
router.get("/analytics", customerController.getCustomerAnalytics);
router.get("/:id", customerController.getCustomerById);
router.post("/", customerController.createCustomer);
router.put("/:id", customerController.updateCustomer);

// Placeholder routes for future implementation
router.delete("/:id", (req, res) => {
    res.json({ message: "Delete customer endpoint - to be implemented" });
});

router.patch("/:id/status", (req, res) => {
    res.json({
        message: "Update customer status endpoint - to be implemented",
    });
});

router.get("/:id/bookings", (req, res) => {
    res.json({ message: "Get customer bookings endpoint - to be implemented" });
});

router.get("/:id/travelers", (req, res) => {
    res.json({
        message: "Get customer travelers endpoint - to be implemented",
    });
});

module.exports = router;
