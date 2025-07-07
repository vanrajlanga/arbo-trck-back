const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const trekController = require("../../controllers/trekController");

// Validation middleware for trek creation/update
const validateTrek = [
    body("name")
        .isLength({ min: 1, max: 200 })
        .withMessage("Trek name must be between 1 and 200 characters"),
    body("description")
        .isLength({ min: 10, max: 2000 })
        .withMessage("Description must be between 10 and 2000 characters"),
    body("destination_id")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Destination ID must be a positive integer"),
    body("city_id")
        .optional()
        .isInt({ min: 1 })
        .withMessage("City ID must be a positive integer"),
    body("duration")
        .optional()
        .isLength({ max: 100 })
        .withMessage("Duration must be less than 100 characters"),
    body("durationDays")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Duration days must be a positive integer"),
    body("durationNights")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Duration nights must be a non-negative integer"),
    body("price")
        .isFloat({ min: 0 })
        .withMessage("Price must be a positive number"),
    body("difficulty")
        .optional()
        .isIn(["easy", "moderate", "difficult", "extreme"])
        .withMessage(
            "Difficulty must be one of: easy, moderate, difficult, extreme"
        ),
    body("trekType")
        .optional()
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
        .isLength({ max: 100 })
        .withMessage("Category must be less than 100 characters"),
    body("maxParticipants")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Max participants must be a positive integer"),
    body("inclusions")
        .optional()
        .isArray()
        .withMessage("Inclusions must be an array"),
    body("exclusions")
        .optional()
        .isArray()
        .withMessage("Exclusions must be an array"),
    body("meetingPoint")
        .optional()
        .isLength({ max: 200 })
        .withMessage("Meeting point must be less than 200 characters"),
    body("meetingTime")
        .optional()
        .isLength({ max: 50 })
        .withMessage("Meeting time must be less than 50 characters"),
    body("status")
        .optional()
        .isIn(["active", "inactive"])
        .withMessage("Status must be active or inactive"),
    body("discountValue")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Discount value must be a positive number"),
    body("discountType")
        .optional()
        .isIn(["percentage", "fixed"])
        .withMessage("Discount type must be percentage or fixed"),
    body("hasDiscount")
        .optional()
        .isBoolean()
        .withMessage("Has discount must be a boolean value"),
];

// Vendor trek routes
router.get("/", trekController.getVendorTreks);
router.get("/:id", trekController.getTrekById);
router.post("/", validateTrek, trekController.createTrek);
router.put("/:id", validateTrek, trekController.updateTrek);
router.delete("/:id", trekController.deleteTrek);
router.patch("/:id/status", trekController.toggleTrekStatus);

// Placeholder routes for future implementation
router.get("/:id/bookings", (req, res) => {
    res.json({ message: "Get trek bookings endpoint - to be implemented" });
});

router.get("/:id/analytics", (req, res) => {
    res.json({ message: "Get trek analytics endpoint - to be implemented" });
});

module.exports = router;
