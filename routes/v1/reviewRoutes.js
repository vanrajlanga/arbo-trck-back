const express = require("express");
const router = express.Router();
const reviewController = require("../../controllers/reviewController");
const { body } = require("express-validator");

// Validation middleware for reviews
const validateReview = [
    body("trek_id")
        .isInt({ min: 1 })
        .withMessage("Trek ID must be a positive integer"),
    body("title")
        .optional()
        .isLength({ min: 1, max: 200 })
        .withMessage("Title must be between 1 and 200 characters"),
    body("content")
        .isLength({ min: 10, max: 2000 })
        .withMessage("Review content must be between 10 and 2000 characters"),
];

// Validation middleware for ratings
const validateRatings = [
    body("trek_id")
        .isInt({ min: 1 })
        .withMessage("Trek ID must be a positive integer"),
    body("ratings")
        .isArray({ min: 1 })
        .withMessage("At least one category rating is required"),
    body("ratings.*.category_id")
        .isInt({ min: 1 })
        .withMessage("Category ID must be a positive integer"),
    body("ratings.*.rating_value")
        .isFloat({ min: 0, max: 5 })
        .withMessage("Rating value must be between 0 and 5"),
    body("ratings.*.comment")
        .optional()
        .isLength({ max: 500 })
        .withMessage("Category comment must be less than 500 characters"),
];

const validateReviewUpdate = [
    body("title")
        .optional()
        .isLength({ min: 1, max: 200 })
        .withMessage("Title must be between 1 and 200 characters"),
    body("content")
        .isLength({ min: 10, max: 2000 })
        .withMessage("Review content must be between 10 and 2000 characters"),
];

const validateStatusUpdate = [
    body("status")
        .isIn(["pending", "approved", "rejected", "spam"])
        .withMessage(
            "Status must be one of: pending, approved, rejected, spam"
        ),
];

// Public routes
router.get("/categories", reviewController.getRatingCategories);
router.get("/trek/:trek_id", reviewController.getTrekReviews);
router.get("/trek/:trek_id/ratings", reviewController.getTrekRatings);
router.get("/:id", reviewController.getReview);

// Customer routes (require authentication)
router.post("/", validateReview, reviewController.createReview);
router.post("/ratings", validateRatings, reviewController.createRatings);
router.put("/:id", validateReviewUpdate, reviewController.updateReview);
router.delete("/:id", reviewController.deleteReview);
router.post("/:id/helpful", reviewController.markReviewHelpful);

// Admin routes (require admin authentication)
router.put(
    "/:id/status",
    validateStatusUpdate,
    reviewController.updateReviewStatus
);

module.exports = router;
