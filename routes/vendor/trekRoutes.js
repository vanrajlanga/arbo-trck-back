const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const trekController = require("../../controllers/vendor/trekController");
const {
    validateRequest,
    sanitizeInput,
} = require("../../middleware/validationMiddleware");

// Enhanced validation middleware for trek creation/update
const validateTrek = [
    sanitizeInput,
    // Basic Info - Required fields
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Trek title is required")
        .isLength({ min: 1, max: 200 })
        .withMessage("Trek title must be between 1 and 200 characters"),

    body("description")
        .optional()
        .trim()
        .isLength({ max: 2000 })
        .withMessage("Description must be less than 2000 characters"),

    body("destination_id")
        .notEmpty()
        .withMessage("Destination is required")
        .isInt({ min: 1 })
        .withMessage("Destination ID must be a positive integer"),

    body("city_id")
        .optional()
        .custom((value) => {
            if (value === null || value === undefined) return true;
            return Number.isInteger(value) && value > 0;
        })
        .withMessage("City ID must be null or a positive integer"),

    // Duration and Pricing
    body("duration")
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage("Duration must be less than 100 characters"),

    body("duration_days")
        .notEmpty()
        .withMessage("Duration days is required")
        .isInt({ min: 1 })
        .withMessage("Duration days must be a positive integer"),

    body("duration_nights")
        .notEmpty()
        .withMessage("Duration nights is required")
        .isInt({ min: 0 })
        .withMessage("Duration nights must be a non-negative integer"),

    body("base_price")
        .notEmpty()
        .withMessage("Base price is required")
        .isFloat({ min: 0 })
        .withMessage("Base price must be a positive number"),

    body("maxParticipants")
        .notEmpty()
        .withMessage("Maximum participants is required")
        .isInt({ min: 1 })
        .withMessage("Maximum participants must be a positive integer"),

    // Trek Details
    body("difficulty")
        .notEmpty()
        .withMessage("Difficulty is required")
        .isIn(["easy", "moderate", "difficult", "extreme"])
        .withMessage(
            "Difficulty must be one of: easy, moderate, difficult, extreme"
        ),

    body("trek_type")
        .notEmpty()
        .withMessage("Trek type is required")
        .isIn([
            "mountain",
            "forest",
            "desert",
            "coastal",
            "hill-station",
            "adventure",
        ])
        .withMessage(
            "Trek type must be one of: mountain, forest, desert, coastal, hill-station, adventure"
        ),

    body("category")
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage("Category must be less than 100 characters"),

    // Meeting Information
    body("meeting_point")
        .notEmpty()
        .withMessage("Meeting point is required")
        .trim()
        .isLength({ max: 200 })
        .withMessage("Meeting point must be less than 200 characters"),

    body("meeting_time")
        .notEmpty()
        .withMessage("Meeting time is required")
        .trim()
        .isLength({ max: 50 })
        .withMessage("Meeting time must be less than 50 characters"),

    // Arrays and JSON fields
    body("inclusions")
        .notEmpty()
        .withMessage("Inclusions are required")
        .isArray({ min: 1 })
        .withMessage("At least one inclusion is required"),

    body("inclusions.*")
        .trim()
        .notEmpty()
        .withMessage("Inclusion items cannot be empty")
        .isLength({ max: 200 })
        .withMessage("Inclusion items must be less than 200 characters"),

    body("exclusions")
        .optional()
        .isArray()
        .withMessage("Exclusions must be an array"),

    body("exclusions.*")
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage("Exclusion items must be less than 200 characters"),

    // Cancellation Policies - Required
    body("cancellation_policies")
        .notEmpty()
        .withMessage("Cancellation policies are required")
        .isArray({ min: 1 })
        .withMessage("At least one cancellation policy is required"),

    body("cancellation_policies.*.title")
        .notEmpty()
        .withMessage("Cancellation policy title is required")
        .trim()
        .isLength({ max: 100 })
        .withMessage(
            "Cancellation policy title must be less than 100 characters"
        ),

    body("cancellation_policies.*.description")
        .notEmpty()
        .withMessage("Cancellation policy description is required")
        .trim()
        .isLength({ max: 500 })
        .withMessage(
            "Cancellation policy description must be less than 500 characters"
        ),

    body("cancellation_policies.*.descriptionPoints")
        .optional()
        .isArray()
        .withMessage("Cancellation policy description points must be an array"),

    body("cancellation_policies.*.descriptionPoints.*")
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage(
            "Cancellation policy description points must be less than 200 characters"
        ),

    body("cancellation_policies.*.rules")
        .optional()
        .isArray()
        .withMessage("Cancellation policy rules must be an array"),

    body("cancellation_policies.*.rules.*")
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage(
            "Cancellation policy rules must be less than 200 characters"
        ),

    // Other Policies - Optional
    body("other_policies")
        .optional()
        .isArray()
        .withMessage("Other policies must be an array"),

    body("other_policies.*.title")
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage("Other policy title must be less than 100 characters"),

    body("other_policies.*.description")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage(
            "Other policy description must be less than 500 characters"
        ),

    body("other_policies.*.descriptionPoints")
        .optional()
        .isArray()
        .withMessage("Other policy description points must be an array"),

    body("other_policies.*.descriptionPoints.*")
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage(
            "Other policy description points must be less than 200 characters"
        ),

    body("other_policies.*.rules")
        .optional()
        .isArray()
        .withMessage("Other policy rules must be an array"),

    body("other_policies.*.rules.*")
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage("Other policy rules must be less than 200 characters"),

    // Activities - Optional
    body("activities")
        .optional()
        .isArray()
        .withMessage("Activities must be an array"),

    body("activities.*")
        .optional()
        .isInt({ min: 1 })
        .withMessage(
            "Each activity must be a valid activity ID (positive integer)"
        ),

    // Status and Discount
    body("status")
        .optional()
        .isIn(["active", "deactive"])
        .withMessage("Status must be active or deactive"),

    body("discount_value")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Discount value must be a positive number"),

    body("discount_type")
        .optional()
        .isIn(["percentage", "fixed"])
        .withMessage("Discount type must be percentage or fixed"),

    body("has_discount")
        .optional()
        .isBoolean()
        .withMessage("Has discount must be a boolean value"),

    validateRequest,
];

// Vendor trek routes
router.get("/", trekController.getVendorTreks);
router.get("/:id", trekController.getTrekById);
router.post("/", validateTrek, trekController.createTrek);
router.put("/:id", validateTrek, trekController.updateTrek);
router.delete("/:id", trekController.deleteTrek);
router.patch("/:id/status", trekController.toggleTrekStatus);
router.get("/:id/batches", trekController.getTrekBatches);

// Placeholder routes for future implementation
router.get("/:id/bookings", (req, res) => {
    res.json({ message: "Get trek bookings endpoint - to be implemented" });
});

router.get("/:id/analytics", (req, res) => {
    res.json({ message: "Get trek analytics endpoint - to be implemented" });
});

module.exports = router;
