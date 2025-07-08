const express = require("express");
const router = express.Router();
const customerController = require("../../controllers/customerController");
const authMiddleware = require("../../middleware/authMiddleware");

// All routes require authentication
router.use(authMiddleware);

// Mobile app customer routes (customer-specific)
router.get("/profile", customerController.getMobileCustomerProfile);
router.put("/profile", customerController.updateMobileCustomerProfile);
router.get("/analytics", customerController.getMobileCustomerAnalytics);

module.exports = router;
