const express = require("express");
const router = express.Router();
const customerController = require("../../controllers/customerController");

// Vendor customer routes
router.get("/", customerController.getVendorCustomers);
router.get("/analytics", customerController.getCustomerAnalytics);
router.get("/:id", customerController.getCustomerById);
router.post("/", customerController.createCustomer);
router.put("/:id", customerController.updateCustomer);

// Placeholder routes for future implementation
router.get("/:id/bookings", (req, res) => {
    res.json({
        message: "Get vendor customer bookings endpoint - to be implemented",
    });
});

router.get("/:id/travelers", (req, res) => {
    res.json({
        message: "Get vendor customer travelers endpoint - to be implemented",
    });
});

module.exports = router;
