const express = require("express");
const {
    getVendors,
    createVendor,
    updateVendorStatus,
} = require("../controllers/vendorController");
const {
    getVendorCustomers,
    getCustomerById,
    getCustomerAnalytics,
} = require("../controllers/customerController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

// Vendor management routes
router.get("/", getVendors);
router.post("/", createVendor);
router.patch("/:id/status", updateVendorStatus);

// Customer management routes for vendors
router.get("/customers", getVendorCustomers);
router.get("/customers/analytics", getCustomerAnalytics);
router.get("/customers/:id", getCustomerById);

module.exports = router;
