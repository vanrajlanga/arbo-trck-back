"use strict";

const { RatingCategory } = require("../models");

const seedRatingCategories = async () => {
    try {
        // Check if rating categories already exist
        const existingCategories = await RatingCategory.findAll();
        if (existingCategories.length > 0) {
            console.log("Rating categories already exist, skipping seed.");
            return;
        }

        const categories = [
            {
                name: "Safety and Security",
                description:
                    "Rating for overall safety measures, security arrangements, and risk management during the trek",
                sort_order: 1,
                is_active: true,
            },
            {
                name: "Organizer Manner",
                description:
                    "Rating for the behavior, professionalism, and communication skills of the trek organizers and guides",
                sort_order: 2,
                is_active: true,
            },
            {
                name: "Trek Planning",
                description:
                    "Rating for the quality of trek planning, itinerary execution, and overall organization",
                sort_order: 3,
                is_active: true,
            },
            {
                name: "Women Safety",
                description:
                    "Rating specifically for women's safety measures, accommodations, and comfort during the trek",
                sort_order: 4,
                is_active: true,
            },
        ];

        await RatingCategory.bulkCreate(categories);
        console.log("Rating categories seeded successfully!");
        console.log(`Created ${categories.length} rating categories`);
    } catch (error) {
        console.error("Error seeding rating categories:", error);
    }
};

module.exports = seedRatingCategories;

// Run if called directly
if (require.main === module) {
    const sequelize = require("../config/config");

    seedRatingCategories()
        .then(() => {
            process.exit(0);
        })
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
}
