const express = require("express");
const router = express.Router();
const customerController = require("../../controllers/customerController");
const authMiddleware = require("../../middleware/authMiddleware");

// All routes require authentication
router.use(authMiddleware);

// Vendor customer management routes
router.get("/", customerController.getVendorCustomers);
router.get("/analytics", customerController.getCustomerAnalytics);
router.get("/:id", customerController.getCustomerById);
router.put("/:id", customerController.updateCustomer);

module.exports = router;
