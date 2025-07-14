"use strict";

const { Review, Rating, Customer, Trek, RatingCategory } = require("../models");

const seedReviews = async () => {
    try {
        // Check if required data exists
        const customers = await Customer.findAll({ limit: 5 });
        const treks = await Trek.findAll({ limit: 3 });
        const ratingCategories = await RatingCategory.findAll();

        if (
            customers.length === 0 ||
            treks.length === 0 ||
            ratingCategories.length === 0
        ) {
            console.log(
                "Required data not found. Please run customers, treks, and ratingCategories seeders first."
            );
            return;
        }

        // Check if reviews already exist
        const existingReviews = await Review.findAll();
        const existingRatings = await Rating.findAll();

        if (existingReviews.length > 0 && existingRatings.length > 0) {
            console.log("Reviews and ratings already exist, skipping seed.");
            return;
        }

        if (existingReviews.length > 0) {
            console.log(
                "Reviews exist, but ratings are missing. Creating ratings only..."
            );
        } else {
            console.log("Creating reviews and ratings...");
        }

        const reviews = [
            {
                customer_id: customers[0].id,
                trek_id: treks[0].id,
                title: "Amazing Valley of Flowers Experience!",
                content:
                    "The Valley of Flowers trek was absolutely breathtaking. The guide was knowledgeable and the accommodations were comfortable. Highly recommended for nature lovers!",
                status: "approved",
                is_helpful: 12,
                is_verified: true,
                is_approved: true,
            },
            {
                customer_id: customers[1].id,
                trek_id: treks[0].id,
                title: "Great trek with minor issues",
                content:
                    "Overall a wonderful experience. The scenery was beautiful and the trek was well-organized. The only issue was that the food could have been better.",
                status: "approved",
                is_helpful: 8,
                is_verified: true,
                is_approved: true,
            },
            {
                customer_id: customers[2].id,
                trek_id: treks[1].id,
                title: "Kedarnath trek exceeded expectations",
                content:
                    "The spiritual journey to Kedarnath was incredible. The trek was challenging but the guide ensured our safety throughout. The accommodation at the base camp was excellent.",
                status: "approved",
                is_helpful: 15,
                is_verified: true,
                is_approved: true,
            },
            {
                customer_id: customers[3].id,
                trek_id: treks[1].id,
                title: "Spiritual and adventurous",
                content:
                    "A perfect blend of adventure and spirituality. The trek was well-planned and the guide was very helpful. Would definitely recommend to others.",
                status: "approved",
                is_helpful: 6,
                is_verified: true,
                is_approved: true,
            },
            {
                customer_id: customers[4].id,
                trek_id: treks[2].id,
                title: "Average experience",
                content:
                    "The trek was okay but there were some issues with the accommodation. The guide was good but the overall experience could have been better for the price paid.",
                status: "approved",
                is_helpful: 4,
                is_verified: false,
                is_approved: true,
            },
            {
                customer_id: customers[0].id,
                trek_id: treks[2].id,
                title: "Good adventure trek",
                content:
                    "The Triund trek was a good adventure experience. The views were spectacular and the camping experience was memorable. The guide was knowledgeable about the local area.",
                status: "approved",
                is_helpful: 9,
                is_verified: true,
                is_approved: true,
            },
        ];

        // Create reviews only if they don't exist
        if (existingReviews.length === 0) {
            for (const reviewData of reviews) {
                await Review.create(reviewData);
            }
        }

        // Create ratings for each customer-trek combination
        const ratings = [
            // Customer 0 - Trek 0 ratings
            {
                trek_id: treks[0].id,
                customer_id: customers[0].id,
                category_id: ratingCategories.find(
                    (cat) => cat.name === "Overall Experience"
                )?.id,
                rating_value: 5.0,
                comment: "Exceptional overall experience",
                is_verified: true,
            },
            {
                trek_id: treks[0].id,
                customer_id: customers[0].id,
                category_id: ratingCategories.find(
                    (cat) => cat.name === "Guide Quality"
                )?.id,
                rating_value: 5.0,
                comment: "Very knowledgeable and friendly guide",
                is_verified: true,
            },
            {
                trek_id: treks[0].id,
                customer_id: customers[0].id,
                category_id: ratingCategories.find(
                    (cat) => cat.name === "Accommodation"
                )?.id,
                rating_value: 4.0,
                comment: "Comfortable accommodations",
                is_verified: true,
            },
            {
                trek_id: treks[0].id,
                customer_id: customers[0].id,
                category_id: ratingCategories.find(
                    (cat) => cat.name === "Food Quality"
                )?.id,
                rating_value: 4.0,
                comment: "Good food quality",
                is_verified: true,
            },
            {
                trek_id: treks[0].id,
                customer_id: customers[0].id,
                category_id: ratingCategories.find(
                    (cat) => cat.name === "Safety"
                )?.id,
                rating_value: 5.0,
                comment: "Excellent safety measures",
                is_verified: true,
            },
            {
                trek_id: treks[0].id,
                customer_id: customers[0].id,
                category_id: ratingCategories.find(
                    (cat) => cat.name === "Value for Money"
                )?.id,
                rating_value: 5.0,
                comment: "Great value for the price",
                is_verified: true,
            },

            // Customer 1 - Trek 0 ratings
            {
                trek_id: treks[0].id,
                customer_id: customers[1].id,
                category_id: ratingCategories.find(
                    (cat) => cat.name === "Overall Experience"
                )?.id,
                rating_value: 4.0,
                comment: "Good overall experience",
                is_verified: true,
            },
            {
                trek_id: treks[0].id,
                customer_id: customers[1].id,
                category_id: ratingCategories.find(
                    (cat) => cat.name === "Guide Quality"
                )?.id,
                rating_value: 5.0,
                comment: "Excellent guide",
                is_verified: true,
            },
            {
                trek_id: treks[0].id,
                customer_id: customers[1].id,
                category_id: ratingCategories.find(
                    (cat) => cat.name === "Accommodation"
                )?.id,
                rating_value: 4.0,
                comment: "Decent accommodations",
                is_verified: true,
            },
            {
                trek_id: treks[0].id,
                customer_id: customers[1].id,
                category_id: ratingCategories.find(
                    (cat) => cat.name === "Food Quality"
                )?.id,
                rating_value: 3.0,
                comment: "Food could be better",
                is_verified: true,
            },
            {
                trek_id: treks[0].id,
                customer_id: customers[1].id,
                category_id: ratingCategories.find(
                    (cat) => cat.name === "Safety"
                )?.id,
                rating_value: 5.0,
                comment: "Very safe",
                is_verified: true,
            },
            {
                trek_id: treks[0].id,
                customer_id: customers[1].id,
                category_id: ratingCategories.find(
                    (cat) => cat.name === "Value for Money"
                )?.id,
                rating_value: 4.0,
                comment: "Reasonable value",
                is_verified: true,
            },

            // Customer 2 - Trek 1 ratings
            {
                trek_id: treks[1].id,
                customer_id: customers[2].id,
                category_id: ratingCategories.find(
                    (cat) => cat.name === "Overall Experience"
                )?.id,
                rating_value: 5.0,
                comment: "Exceeded expectations",
                is_verified: true,
            },
            {
                trek_id: treks[1].id,
                customer_id: customers[2].id,
                category_id: ratingCategories.find(
                    (cat) => cat.name === "Guide Quality"
                )?.id,
                rating_value: 5.0,
                comment: "Outstanding guide",
                is_verified: true,
            },
            {
                trek_id: treks[1].id,
                customer_id: customers[2].id,
                category_id: ratingCategories.find(
                    (cat) => cat.name === "Accommodation"
                )?.id,
                rating_value: 5.0,
                comment: "Excellent accommodation",
                is_verified: true,
            },
            {
                trek_id: treks[1].id,
                customer_id: customers[2].id,
                category_id: ratingCategories.find(
                    (cat) => cat.name === "Food Quality"
                )?.id,
                rating_value: 4.0,
                comment: "Good food",
                is_verified: true,
            },
            {
                trek_id: treks[1].id,
                customer_id: customers[2].id,
                category_id: ratingCategories.find(
                    (cat) => cat.name === "Safety"
                )?.id,
                rating_value: 5.0,
                comment: "Very safe throughout",
                is_verified: true,
            },
            {
                trek_id: treks[1].id,
                customer_id: customers[2].id,
                category_id: ratingCategories.find(
                    (cat) => cat.name === "Value for Money"
                )?.id,
                rating_value: 5.0,
                comment: "Worth every penny",
                is_verified: true,
            },

            // Customer 3 - Trek 1 ratings
            {
                trek_id: treks[1].id,
                customer_id: customers[3].id,
                category_id: ratingCategories.find(
                    (cat) => cat.name === "Overall Experience"
                )?.id,
                rating_value: 4.0,
                comment: "Good spiritual experience",
                is_verified: true,
            },
            {
                trek_id: treks[1].id,
                customer_id: customers[3].id,
                category_id: ratingCategories.find(
                    (cat) => cat.name === "Guide Quality"
                )?.id,
                rating_value: 5.0,
                comment: "Helpful guide",
                is_verified: true,
            },
            {
                trek_id: treks[1].id,
                customer_id: customers[3].id,
                category_id: ratingCategories.find(
                    (cat) => cat.name === "Accommodation"
                )?.id,
                rating_value: 4.0,
                comment: "Comfortable stay",
                is_verified: true,
            },
            {
                trek_id: treks[1].id,
                customer_id: customers[3].id,
                category_id: ratingCategories.find(
                    (cat) => cat.name === "Food Quality"
                )?.id,
                rating_value: 4.0,
                comment: "Decent food",
                is_verified: true,
            },
            {
                trek_id: treks[1].id,
                customer_id: customers[3].id,
                category_id: ratingCategories.find(
                    (cat) => cat.name === "Safety"
                )?.id,
                rating_value: 5.0,
                comment: "Safe journey",
                is_verified: true,
            },
            {
                trek_id: treks[1].id,
                customer_id: customers[3].id,
                category_id: ratingCategories.find(
                    (cat) => cat.name === "Value for Money"
                )?.id,
                rating_value: 4.0,
                comment: "Good value",
                is_verified: true,
            },

            // Customer 4 - Trek 2 ratings
            {
                trek_id: treks[2].id,
                customer_id: customers[4].id,
                category_id: ratingCategories.find(
                    (cat) => cat.name === "Overall Experience"
                )?.id,
                rating_value: 3.0,
                comment: "Average experience",
                is_verified: false,
            },
            {
                trek_id: treks[2].id,
                customer_id: customers[4].id,
                category_id: ratingCategories.find(
                    (cat) => cat.name === "Guide Quality"
                )?.id,
                rating_value: 4.0,
                comment: "Good guide",
                is_verified: false,
            },
            {
                trek_id: treks[2].id,
                customer_id: customers[4].id,
                category_id: ratingCategories.find(
                    (cat) => cat.name === "Accommodation"
                )?.id,
                rating_value: 2.0,
                comment: "Issues with accommodation",
                is_verified: false,
            },
            {
                trek_id: treks[2].id,
                customer_id: customers[4].id,
                category_id: ratingCategories.find(
                    (cat) => cat.name === "Food Quality"
                )?.id,
                rating_value: 3.0,
                comment: "Average food",
                is_verified: false,
            },
            {
                trek_id: treks[2].id,
                customer_id: customers[4].id,
                category_id: ratingCategories.find(
                    (cat) => cat.name === "Safety"
                )?.id,
                rating_value: 4.0,
                comment: "Safe enough",
                is_verified: false,
            },
            {
                trek_id: treks[2].id,
                customer_id: customers[4].id,
                category_id: ratingCategories.find(
                    (cat) => cat.name === "Value for Money"
                )?.id,
                rating_value: 3.0,
                comment: "Could be better value",
                is_verified: false,
            },

            // Customer 0 - Trek 2 ratings
            {
                trek_id: treks[2].id,
                customer_id: customers[0].id,
                category_id: ratingCategories.find(
                    (cat) => cat.name === "Overall Experience"
                )?.id,
                rating_value: 4.0,
                comment: "Good adventure",
                is_verified: true,
            },
            {
                trek_id: treks[2].id,
                customer_id: customers[0].id,
                category_id: ratingCategories.find(
                    (cat) => cat.name === "Guide Quality"
                )?.id,
                rating_value: 4.0,
                comment: "Knowledgeable guide",
                is_verified: true,
            },
            {
                trek_id: treks[2].id,
                customer_id: customers[0].id,
                category_id: ratingCategories.find(
                    (cat) => cat.name === "Accommodation"
                )?.id,
                rating_value: 3.0,
                comment: "Basic but adequate",
                is_verified: true,
            },
            {
                trek_id: treks[2].id,
                customer_id: customers[0].id,
                category_id: ratingCategories.find(
                    (cat) => cat.name === "Food Quality"
                )?.id,
                rating_value: 4.0,
                comment: "Good food",
                is_verified: true,
            },
            {
                trek_id: treks[2].id,
                customer_id: customers[0].id,
                category_id: ratingCategories.find(
                    (cat) => cat.name === "Safety"
                )?.id,
                rating_value: 5.0,
                comment: "Very safe",
                is_verified: true,
            },
            {
                trek_id: treks[2].id,
                customer_id: customers[0].id,
                category_id: ratingCategories.find(
                    (cat) => cat.name === "Value for Money"
                )?.id,
                rating_value: 4.0,
                comment: "Good value",
                is_verified: true,
            },
        ];

        // Filter out ratings where category_id is undefined (category not found)
        const validRatings = ratings.filter(
            (rating) => rating.category_id !== undefined
        );

        // Create ratings
        await Rating.bulkCreate(validRatings);

        console.log("Reviews and ratings seeded successfully!");

        // Display created reviews count
        const createdReviews = await Review.findAll();
        console.log(`Created ${createdReviews.length} reviews`);

        // Display created ratings count
        const createdRatings = await Rating.findAll();
        console.log(`Created ${createdRatings.length} ratings`);

        // Show reviews per trek
        for (const trek of treks) {
            const trekReviews = await Review.findAll({
                where: { trek_id: trek.id },
            });
            console.log(`${trek.title}: ${trekReviews.length} reviews`);
        }

        // Show ratings per trek
        for (const trek of treks) {
            const trekRatings = await Rating.findAll({
                where: { trek_id: trek.id },
            });
            console.log(`${trek.title}: ${trekRatings.length} ratings`);
        }
    } catch (error) {
        console.error("Error seeding reviews:", error);
    }
};

module.exports = seedReviews;

// Run if called directly
if (require.main === module) {
    const sequelize = require("../config/config");

    seedReviews()
        .then(() => {
            process.exit(0);
        })
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
}
