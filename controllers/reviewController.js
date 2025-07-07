const {
    Review,
    Rating,
    RatingCategory,
    Trek,
    Customer,
    Booking,
} = require("../models");
const { validationResult } = require("express-validator");
const { Op } = require("sequelize");

// Helper function to calculate trek's overall rating from ratings
const calculateTrekRating = async (trekId) => {
    try {
        const ratings = await Rating.findAll({
            where: {
                trek_id: trekId,
            },
            include: [
                {
                    model: RatingCategory,
                    as: "category",
                },
            ],
        });

        if (ratings.length === 0)
            return { overall: 0, categories: {}, ratingCount: 0 };

        const categoryRatings = {};
        const categoryCounts = {};

        // Initialize category ratings
        const categories = await RatingCategory.findAll({
            where: { is_active: true },
        });
        categories.forEach((cat) => {
            categoryRatings[cat.name] = 0;
            categoryCounts[cat.name] = 0;
        });

        // Calculate category averages
        ratings.forEach((rating) => {
            const categoryName = rating.category.name;
            categoryRatings[categoryName] += parseFloat(rating.rating_value);
            categoryCounts[categoryName]++;
        });

        // Calculate averages
        Object.keys(categoryRatings).forEach((category) => {
            if (categoryCounts[category] > 0) {
                categoryRatings[category] = parseFloat(
                    (
                        categoryRatings[category] / categoryCounts[category]
                    ).toFixed(2)
                );
            }
        });

        // Calculate overall average
        const overallSum = Object.values(categoryRatings).reduce(
            (sum, rating) => sum + rating,
            0
        );
        const overall = parseFloat(
            (overallSum / Object.keys(categoryRatings).length).toFixed(2)
        );

        return {
            overall,
            categories: categoryRatings,
            ratingCount: ratings.length,
        };
    } catch (error) {
        console.error("Error calculating trek rating:", error);
        return { overall: 0, categories: {}, ratingCount: 0 };
    }
};

// Get all rating categories
exports.getRatingCategories = async (req, res) => {
    try {
        const categories = await RatingCategory.findAll({
            where: { is_active: true },
            order: [["sort_order", "ASC"]],
        });

        res.json({
            success: true,
            data: categories,
        });
    } catch (error) {
        console.error("Error fetching rating categories:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch rating categories",
            error: error.message,
        });
    }
};

// Create a new review (text only)
exports.createReview = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation errors",
                errors: errors.array(),
            });
        }

        const { trek_id, booking_id, title, content } = req.body;

        const customer_id = req.user.id; // Assuming customer is authenticated

        // Verify trek exists
        const trek = await Trek.findByPk(trek_id);
        if (!trek) {
            return res.status(404).json({
                success: false,
                message: "Trek not found",
            });
        }

        // Check if customer has already reviewed this trek
        const existingReview = await Review.findOne({
            where: {
                trek_id,
                customer_id,
            },
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: "You have already reviewed this trek",
            });
        }

        // Verify booking if provided
        if (booking_id) {
            const booking = await Booking.findOne({
                where: {
                    id: booking_id,
                    customer_id,
                    trek_id,
                },
            });

            if (!booking) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid booking reference",
                });
            }
        }

        // Create review
        const review = await Review.create({
            trek_id,
            customer_id,
            booking_id,
            title,
            content,
            is_verified: !!booking_id,
        });

        // Fetch the created review
        const createdReview = await Review.findByPk(review.id, {
            include: [
                {
                    model: Customer,
                    as: "customer",
                    attributes: ["id", "name", "email"],
                },
            ],
        });

        res.status(201).json({
            success: true,
            message: "Review created successfully",
            data: createdReview,
        });
    } catch (error) {
        console.error("Error creating review:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create review",
            error: error.message,
        });
    }
};

// Create ratings for a trek
exports.createRatings = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation errors",
                errors: errors.array(),
            });
        }

        const { trek_id, booking_id, ratings } = req.body;

        const customer_id = req.user.id;

        // Verify trek exists
        const trek = await Trek.findByPk(trek_id);
        if (!trek) {
            return res.status(404).json({
                success: false,
                message: "Trek not found",
            });
        }

        // Verify booking if provided
        if (booking_id) {
            const booking = await Booking.findOne({
                where: {
                    id: booking_id,
                    customer_id,
                    trek_id,
                },
            });

            if (!booking) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid booking reference",
                });
            }
        }

        // Check if customer has already rated this trek
        const existingRating = await Rating.findOne({
            where: {
                trek_id,
                customer_id,
            },
        });

        if (existingRating) {
            return res.status(400).json({
                success: false,
                message: "You have already rated this trek",
            });
        }

        // Create ratings for each category
        if (ratings && Array.isArray(ratings)) {
            const ratingData = ratings.map((rating) => ({
                trek_id,
                customer_id,
                booking_id,
                category_id: rating.category_id,
                rating_value: rating.rating_value,
                comment: rating.comment,
                is_verified: !!booking_id,
            }));

            await Rating.bulkCreate(ratingData);
        }

        // Calculate updated trek rating
        const trekRating = await calculateTrekRating(trek_id);

        res.status(201).json({
            success: true,
            message: "Ratings submitted successfully",
            data: {
                trekRating,
            },
        });
    } catch (error) {
        console.error("Error creating ratings:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create ratings",
            error: error.message,
        });
    }
};

// Get reviews for a trek
exports.getTrekReviews = async (req, res) => {
    try {
        const { trek_id } = req.params;
        const { page = 1, limit = 10, status = "approved" } = req.query;

        const offset = (page - 1) * limit;

        const reviews = await Review.findAndCountAll({
            where: {
                trek_id,
                status,
            },
            include: [
                {
                    model: Customer,
                    as: "customer",
                    attributes: ["id", "name"],
                },
            ],
            order: [["created_at", "DESC"]],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        // Calculate trek's overall rating
        const trekRating = await calculateTrekRating(trek_id);

        res.json({
            success: true,
            data: {
                reviews: reviews.rows,
                trekRating,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(reviews.count / parseInt(limit)),
                    totalCount: reviews.count,
                },
            },
        });
    } catch (error) {
        console.error("Error fetching trek reviews:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch reviews",
            error: error.message,
        });
    }
};

// Get ratings for a trek
exports.getTrekRatings = async (req, res) => {
    try {
        const { trek_id } = req.params;

        const ratings = await Rating.findAll({
            where: {
                trek_id,
            },
            include: [
                {
                    model: RatingCategory,
                    as: "category",
                },
                {
                    model: Customer,
                    as: "customer",
                    attributes: ["id", "name"],
                },
            ],
            order: [["created_at", "DESC"]],
        });

        // Calculate trek's overall rating
        const trekRating = await calculateTrekRating(trek_id);

        res.json({
            success: true,
            data: {
                ratings,
                trekRating,
            },
        });
    } catch (error) {
        console.error("Error fetching trek ratings:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch ratings",
            error: error.message,
        });
    }
};

// Get a single review
exports.getReview = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findByPk(id, {
            include: [
                {
                    model: Customer,
                    as: "customer",
                    attributes: ["id", "name"],
                },
                {
                    model: Trek,
                    as: "trek",
                    attributes: ["id", "title"],
                },
            ],
        });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found",
            });
        }

        res.json({
            success: true,
            data: review,
        });
    } catch (error) {
        console.error("Error fetching review:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch review",
            error: error.message,
        });
    }
};

// Update a review (only by the author)
exports.updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const customer_id = req.user.id;

        const review = await Review.findOne({
            where: {
                id,
                customer_id,
            },
        });

        if (!review) {
            return res.status(404).json({
                success: false,
                message:
                    "Review not found or you don't have permission to edit it",
            });
        }

        // Update review
        await review.update({
            title,
            content,
        });

        // Fetch updated review
        const updatedReview = await Review.findByPk(review.id, {
            include: [
                {
                    model: Customer,
                    as: "customer",
                    attributes: ["id", "name"],
                },
            ],
        });

        res.json({
            success: true,
            message: "Review updated successfully",
            data: updatedReview,
        });
    } catch (error) {
        console.error("Error updating review:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update review",
            error: error.message,
        });
    }
};

// Delete a review (only by the author)
exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const customer_id = req.user.id;

        const review = await Review.findOne({
            where: {
                id,
                customer_id,
            },
        });

        if (!review) {
            return res.status(404).json({
                success: false,
                message:
                    "Review not found or you don't have permission to delete it",
            });
        }

        // Delete review
        await review.destroy();

        res.json({
            success: true,
            message: "Review deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting review:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete review",
            error: error.message,
        });
    }
};

// Mark review as helpful
exports.markReviewHelpful = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findByPk(id);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found",
            });
        }

        await review.update({
            is_helpful: review.is_helpful + 1,
        });

        res.json({
            success: true,
            message: "Review marked as helpful",
            data: { is_helpful: review.is_helpful },
        });
    } catch (error) {
        console.error("Error marking review helpful:", error);
        res.status(500).json({
            success: false,
            message: "Failed to mark review as helpful",
            error: error.message,
        });
    }
};

// Admin: Approve/Reject review
exports.updateReviewStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const review = await Review.findByPk(id);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found",
            });
        }

        await review.update({ status });

        res.json({
            success: true,
            message: `Review ${status} successfully`,
            data: review,
        });
    } catch (error) {
        console.error("Error updating review status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update review status",
            error: error.message,
        });
    }
};
