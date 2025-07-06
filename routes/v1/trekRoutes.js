const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const trekController = require("../../controllers/trekController");
const authMiddleware = require("../../middleware/authMiddleware");

// Validation middleware for trek creation/update
const validateTrek = [
    body("name")
        .notEmpty()
        .withMessage("Trek name is required")
        .isLength({ min: 3, max: 100 })
        .withMessage("Trek name must be between 3 and 100 characters"),
    body("description")
        .optional()
        .isLength({ max: 1000 })
        .withMessage("Description must not exceed 1000 characters"),
    body("destination_id")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Destination ID must be a valid integer"),
    body("city_id")
        .optional()
        .isInt({ min: 1 })
        .withMessage("City ID must be a valid integer"),
    body("duration")
        .optional()
        .isLength({ max: 50 })
        .withMessage("Duration must not exceed 50 characters"),
    body("price")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Price must be a positive number"),
    body("difficulty")
        .optional()
        .isIn(["easy", "moderate", "difficult", "extreme"])
        .withMessage(
            "Difficulty must be easy, moderate, difficult, or extreme"
        ),
    body("maxParticipants")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Max participants must be between 1 and 100"),
    body("startDate")
        .optional()
        .isISO8601()
        .withMessage("Start date must be a valid date"),
    body("endDate")
        .optional()
        .isISO8601()
        .withMessage("End date must be a valid date"),
    body("meetingPoint")
        .optional()
        .isLength({ max: 200 })
        .withMessage("Meeting point must not exceed 200 characters"),
    body("meetingTime")
        .optional()
        .isLength({ max: 50 })
        .withMessage("Meeting time must not exceed 50 characters"),
];

// Public routes (for mobile app - no auth required)
router.get("/", trekController.getAllPublicTreks); // Get all published treks
router.get("/search", trekController.searchTreks); // Search treks
router.get("/category/:categoryId", trekController.getTreksByCategory); // Get treks by category
router.get("/:id", trekController.getPublicTrekById); // Get single trek details

// Vendor routes (require authentication)
router.get("/vendor/my-treks", authMiddleware, trekController.getVendorTreks);
router.get("/vendor/:id", authMiddleware, trekController.getTrekById);
router.post("/vendor", authMiddleware, validateTrek, trekController.createTrek);
router.put(
    "/vendor/:id",
    authMiddleware,
    validateTrek,
    trekController.updateTrek
);
router.delete("/vendor/:id", authMiddleware, trekController.deleteTrek);
router.patch(
    "/vendor/:id/status",
    authMiddleware,
    trekController.toggleTrekStatus
);

// Admin routes (require authentication and admin role)
router.get("/admin/all", authMiddleware, trekController.getAllTreks);

module.exports = router;
