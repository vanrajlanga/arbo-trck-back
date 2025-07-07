"use strict";

const { RatingCategory, Review, Rating, Customer, Trek } = require("../models");

const seedRatingReviewData = async () => {
    try {
        console.log(
            "Starting to seed rating categories and sample reviews/ratings..."
        );

        // Check if rating categories already exist
        const existingCategories = await RatingCategory.findAll();
        if (existingCategories.length > 0) {
            console.log("Rating categories already exist, skipping...");
        } else {
            // Create rating categories
            const ratingCategories = [
                {
                    name: "Safety and Security",
                    description: "How safe and secure the trek experience was",
                    is_active: true,
                    sort_order: 1,
                },
                {
                    name: "Organizer Manner",
                    description:
                        "Professionalism and behavior of trek organizers",
                    is_active: true,
                    sort_order: 2,
                },
                {
                    name: "Trek Planning",
                    description: "Quality of trek planning and organization",
                    is_active: true,
                    sort_order: 3,
                },
                {
                    name: "Women Safety",
                    description:
                        "Safety measures specifically for women trekkers",
                    is_active: true,
                    sort_order: 4,
                },
            ];

            await RatingCategory.bulkCreate(ratingCategories);
            console.log(`Created ${ratingCategories.length} rating categories`);
        }

        // Get existing data
        const customers = await Customer.findAll();
        const treks = await Trek.findAll();
        const createdRatingCategories = await RatingCategory.findAll();

        if (customers.length === 0) {
            console.log(
                "No customers found. Please run customer seeder first."
            );
            return;
        }

        if (treks.length === 0) {
            console.log("No treks found. Please run trek seeder first.");
            return;
        }

        if (createdRatingCategories.length === 0) {
            console.log(
                "No rating categories found. Please run rating category seeder first."
            );
            return;
        }

        // Check if reviews already exist
        const existingReviews = await Review.findAll();
        if (existingReviews.length > 0) {
            console.log("Reviews already exist, skipping...");
            return;
        }

        // Create sample reviews and ratings for some treks
        const sampleReviews = [];
        const sampleRatings = [];

        // Create sample reviews and ratings for Valley of Flowers Trek
        const valleyTrek = treks.find(
            (t) => t.title === "Valley of Flowers Trek"
        );
        if (valleyTrek && customers.length > 0) {
            // Sample review
            sampleReviews.push({
                trek_id: valleyTrek.id,
                customer_id: customers[0].id,
                title: "Amazing Flower Valley Experience!",
                content:
                    "The Valley of Flowers trek was absolutely breathtaking. The colorful flowers, stunning landscapes, and professional guides made this an unforgettable experience. Highly recommended for nature lovers!",
                is_verified: true,
                status: "approved",
            });

            // Sample ratings for the same trek and customer
            createdRatingCategories.forEach((category, index) => {
                sampleRatings.push({
                    trek_id: valleyTrek.id,
                    customer_id: customers[0].id,
                    category_id: category.id,
                    rating_value: 4.5 + index * 0.1, // Varying ratings
                    comment: `Great ${category.name.toLowerCase()} experience`,
                    is_verified: true,
                });
            });
        }

        // Create sample reviews and ratings for Kedarnath Temple Trek
        const kedarnathTrek = treks.find(
            (t) => t.title === "Kedarnath Temple Trek"
        );
        if (kedarnathTrek && customers.length > 1) {
            // Sample review
            sampleReviews.push({
                trek_id: kedarnathTrek.id,
                customer_id: customers[1].id,
                title: "Spiritual Journey to Remember",
                content:
                    "The Kedarnath trek was a perfect blend of spirituality and adventure. The temple visit was divine, and the trek through the mountains was challenging yet rewarding. The organizers took great care of all participants.",
                is_verified: true,
                status: "approved",
            });

            // Sample ratings
            createdRatingCategories.forEach((category, index) => {
                sampleRatings.push({
                    trek_id: kedarnathTrek.id,
                    customer_id: customers[1].id,
                    category_id: category.id,
                    rating_value: 4.0 + index * 0.2, // Varying ratings
                    comment: `Excellent ${category.name.toLowerCase()} standards`,
                    is_verified: true,
                });
            });
        }

        // Create sample reviews and ratings for Rishikesh Adventure Trek
        const rishikeshTrek = treks.find(
            (t) => t.title === "Rishikesh Adventure Trek"
        );
        if (rishikeshTrek && customers.length > 2) {
            // Sample review
            sampleReviews.push({
                trek_id: rishikeshTrek.id,
                customer_id: customers[2].id,
                title: "Thrilling Adventure Experience",
                content:
                    "The Rishikesh adventure trek exceeded all expectations! River rafting was exhilarating, rock climbing was challenging, and the overall experience was perfectly organized. Great for adventure enthusiasts!",
                is_verified: true,
                status: "approved",
            });

            // Sample ratings
            createdRatingCategories.forEach((category, index) => {
                sampleRatings.push({
                    trek_id: rishikeshTrek.id,
                    customer_id: customers[2].id,
                    category_id: category.id,
                    rating_value: 4.8 - index * 0.1, // Varying ratings
                    comment: `Outstanding ${category.name.toLowerCase()} experience`,
                    is_verified: true,
                });
            });
        }

        // Create sample reviews and ratings for Solang Valley Trek
        const solangTrek = treks.find((t) => t.title === "Solang Valley Trek");
        if (solangTrek && customers.length > 0) {
            // Sample review
            sampleReviews.push({
                trek_id: solangTrek.id,
                customer_id: customers[0].id,
                title: "Beautiful Valley Trek",
                content:
                    "Solang Valley offered stunning views and perfect weather. The trek was well-organized with comfortable accommodation and delicious food. The adventure activities were the highlight!",
                is_verified: true,
                status: "approved",
            });

            // Sample ratings
            createdRatingCategories.forEach((category, index) => {
                sampleRatings.push({
                    trek_id: solangTrek.id,
                    customer_id: customers[0].id,
                    category_id: category.id,
                    rating_value: 4.2 + index * 0.15, // Varying ratings
                    comment: `Good ${category.name.toLowerCase()} experience`,
                    is_verified: true,
                });
            });
        }

        // Create sample reviews and ratings for Triund Trek
        const triundTrek = treks.find((t) => t.title === "Triund Trek");
        if (triundTrek && customers.length > 1) {
            // Sample review
            sampleReviews.push({
                trek_id: triundTrek.id,
                customer_id: customers[1].id,
                title: "Perfect Beginner Trek",
                content:
                    "Triund trek was perfect for beginners like me. The sunset views were spectacular, and the camping experience was amazing. The guides were knowledgeable and friendly.",
                is_verified: true,
                status: "approved",
            });

            // Sample ratings
            createdRatingCategories.forEach((category, index) => {
                sampleRatings.push({
                    trek_id: triundTrek.id,
                    customer_id: customers[1].id,
                    category_id: category.id,
                    rating_value: 4.3 + index * 0.1, // Varying ratings
                    comment: `Satisfactory ${category.name.toLowerCase()} experience`,
                    is_verified: true,
                });
            });
        }

        // Create reviews and ratings
        if (sampleReviews.length > 0) {
            await Review.bulkCreate(sampleReviews);
            console.log(`Created ${sampleReviews.length} sample reviews`);
        }

        if (sampleRatings.length > 0) {
            await Rating.bulkCreate(sampleRatings);
            console.log(`Created ${sampleRatings.length} sample ratings`);
        }

        console.log("Rating and review data seeding completed successfully!");
    } catch (error) {
        console.error("Error seeding rating and review data:", error);
    }
};

module.exports = seedRatingReviewData;

// Run if called directly
if (require.main === module) {
    const sequelize = require("../config/config");

    seedRatingReviewData()
        .then(() => {
            process.exit(0);
        })
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
}
