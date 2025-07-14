"use strict";

const { Rating, Customer, Trek, RatingCategory } = require("../models");

const seedRatings = async () => {
    try {
        // Check if required data exists
        const customers = await Customer.findAll();
        const treks = await Trek.findAll();
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

        console.log(
            `Found ${customers.length} customers, ${treks.length} treks, ${ratingCategories.length} rating categories`
        );

        // Check if ratings already exist
        const existingRatings = await Rating.findAll();
        if (existingRatings.length > 0) {
            console.log("Ratings already exist, skipping seed.");
            return;
        }

        const ratings = [];

        // Create ratings for each customer-trek combination
        customers.forEach((customer, customerIndex) => {
            treks.forEach((trek, trekIndex) => {
                // Create ratings for each category
                ratingCategories.forEach((category) => {
                    // Generate realistic rating values based on trek type and customer
                    let ratingValue;
                    let comment;

                    // Base rating on trek difficulty and customer index
                    const baseRating = 3.5 + (Math.random() - 0.5) * 2; // 2.5 to 4.5 base

                    // Adjust based on category
                    switch (category.name) {
                        case "Safety and Security":
                            ratingValue = Math.min(5, baseRating + 0.3);
                            comment =
                                "Good safety measures and security arrangements";
                            break;
                        case "Organizer Manner":
                            ratingValue = Math.min(5, baseRating + 0.2);
                            comment = "Professional and friendly organizers";
                            break;
                        case "Trek Planning":
                            ratingValue = Math.min(5, baseRating + 0.1);
                            comment = "Well-planned and organized trek";
                            break;
                        case "Women Safety":
                            ratingValue = Math.min(5, baseRating + 0.4);
                            comment =
                                "Comfortable and safe for women travelers";
                            break;
                        default:
                            ratingValue = Math.min(5, baseRating);
                            comment = "Good overall experience";
                    }

                    // Add some variation based on customer and trek
                    if (customerIndex % 3 === 0) {
                        ratingValue = Math.min(5, ratingValue + 0.2); // Some customers are more generous
                    }
                    if (trekIndex % 2 === 0) {
                        ratingValue = Math.min(5, ratingValue + 0.1); // Some treks get slightly better ratings
                    }

                    // Round to 1 decimal place
                    ratingValue = Math.round(ratingValue * 10) / 10;

                    // Ensure rating is between 1 and 5
                    ratingValue = Math.max(1, Math.min(5, ratingValue));

                    // Add some negative ratings occasionally
                    if (Math.random() < 0.1) {
                        // 10% chance of lower rating
                        ratingValue = Math.max(1, ratingValue - 1.5);
                        comment = "Some areas could be improved";
                    }

                    ratings.push({
                        trek_id: trek.id,
                        customer_id: customer.id,
                        category_id: category.id,
                        rating_value: ratingValue,
                        comment: comment,
                        is_verified: Math.random() > 0.2, // 80% verified
                    });
                });
            });
        });

        // Create ratings
        await Rating.bulkCreate(ratings);

        console.log("Ratings seeded successfully!");

        // Display created ratings count
        const createdRatings = await Rating.findAll();
        console.log(`Created ${createdRatings.length} ratings`);

        // Show ratings per trek
        for (const trek of treks) {
            const trekRatings = await Rating.findAll({
                where: { trek_id: trek.id },
            });
            console.log(`${trek.title}: ${trekRatings.length} ratings`);
        }

        // Show average ratings per category
        for (const category of ratingCategories) {
            const categoryRatings = await Rating.findAll({
                where: { category_id: category.id },
            });
            const avgRating =
                categoryRatings.reduce((sum, r) => sum + r.rating_value, 0) /
                categoryRatings.length;
            console.log(
                `${category.name}: ${
                    categoryRatings.length
                } ratings, Avg: ${avgRating.toFixed(1)}`
            );
        }

        // Show ratings per customer
        for (const customer of customers.slice(0, 5)) {
            // Show first 5 customers
            const customerRatings = await Rating.findAll({
                where: { customer_id: customer.id },
            });
            console.log(`${customer.name}: ${customerRatings.length} ratings`);
        }
    } catch (error) {
        console.error("Error seeding ratings:", error);
    }
};

module.exports = seedRatings;

// Run if called directly
if (require.main === module) {
    const sequelize = require("../config/config");

    seedRatings()
        .then(() => {
            process.exit(0);
        })
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
}
