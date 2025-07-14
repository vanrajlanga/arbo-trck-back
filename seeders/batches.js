"use strict";

const { Batch, Trek } = require("../models");

const seedBatches = async () => {
    try {
        // Check if treks exist
        const treks = await Trek.findAll({ limit: 5 });
        if (treks.length === 0) {
            console.log("Treks not found. Please run treks seeder first.");
            return;
        }

        // Check if batches already exist
        const existingBatches = await Batch.findAll();
        if (existingBatches.length > 0) {
            console.log("Batches already exist, skipping seed.");
            return;
        }

        const batches = [
            // Batches for first trek
            {
                trek_id: treks[0].id,
                start_date: "2024-02-15",
                end_date: "2024-02-17",
                capacity: 20,
                booked_slots: 8,
                available_slots: 12,
            },
            {
                trek_id: treks[0].id,
                start_date: "2024-03-01",
                end_date: "2024-03-03",
                capacity: 20,
                booked_slots: 15,
                available_slots: 5,
            },
            {
                trek_id: treks[0].id,
                start_date: "2024-03-15",
                end_date: "2024-03-17",
                capacity: 20,
                booked_slots: 3,
                available_slots: 17,
            },

            // Batches for second trek
            {
                trek_id: treks[1].id,
                start_date: "2024-02-20",
                end_date: "2024-02-22",
                capacity: 15,
                booked_slots: 12,
                available_slots: 3,
            },
            {
                trek_id: treks[1].id,
                start_date: "2024-03-10",
                end_date: "2024-03-12",
                capacity: 15,
                booked_slots: 7,
                available_slots: 8,
            },

            // Batches for third trek
            {
                trek_id: treks[2].id,
                start_date: "2024-02-25",
                end_date: "2024-02-27",
                capacity: 25,
                booked_slots: 18,
                available_slots: 7,
            },
            {
                trek_id: treks[2].id,
                start_date: "2024-03-20",
                end_date: "2024-03-22",
                capacity: 25,
                booked_slots: 5,
                available_slots: 20,
            },

            // Batches for fourth trek
            {
                trek_id: treks[3].id,
                start_date: "2024-03-05",
                end_date: "2024-03-08",
                capacity: 12,
                booked_slots: 10,
                available_slots: 2,
            },
            {
                trek_id: treks[3].id,
                start_date: "2024-04-01",
                end_date: "2024-04-04",
                capacity: 12,
                booked_slots: 4,
                available_slots: 8,
            },

            // Batches for fifth trek
            {
                trek_id: treks[4].id,
                start_date: "2024-03-12",
                end_date: "2024-03-15",
                capacity: 18,
                booked_slots: 14,
                available_slots: 4,
            },
            {
                trek_id: treks[4].id,
                start_date: "2024-04-15",
                end_date: "2024-04-18",
                capacity: 18,
                booked_slots: 6,
                available_slots: 12,
            },

            // Future batches for all treks
            {
                trek_id: treks[0].id,
                start_date: "2024-05-01",
                end_date: "2024-05-03",
                capacity: 20,
                booked_slots: 0,
                available_slots: 20,
            },
            {
                trek_id: treks[1].id,
                start_date: "2024-05-10",
                end_date: "2024-05-12",
                capacity: 15,
                booked_slots: 0,
                available_slots: 15,
            },
            {
                trek_id: treks[2].id,
                start_date: "2024-05-20",
                end_date: "2024-05-22",
                capacity: 25,
                booked_slots: 0,
                available_slots: 25,
            },
            {
                trek_id: treks[3].id,
                start_date: "2024-06-01",
                end_date: "2024-06-04",
                capacity: 12,
                booked_slots: 0,
                available_slots: 12,
            },
            {
                trek_id: treks[4].id,
                start_date: "2024-06-15",
                end_date: "2024-06-18",
                capacity: 18,
                booked_slots: 0,
                available_slots: 18,
            },
        ];

        await Batch.bulkCreate(batches);

        console.log("Batches seeded successfully!");

        // Display created batches count
        const createdBatches = await Batch.findAll();
        console.log(`Created ${createdBatches.length} batches`);

        // Show batches per trek
        for (const trek of treks) {
            const trekBatches = await Batch.findAll({
                where: { trek_id: trek.id },
            });
            console.log(`${trek.title}: ${trekBatches.length} batches`);
        }

        // Show capacity distribution
        const totalCapacity = batches.reduce(
            (sum, batch) => sum + batch.capacity,
            0
        );
        const totalBooked = batches.reduce(
            (sum, batch) => sum + batch.booked_slots,
            0
        );
        const totalAvailable = batches.reduce(
            (sum, batch) => sum + batch.available_slots,
            0
        );

        console.log(`Total capacity: ${totalCapacity}`);
        console.log(`Total booked: ${totalBooked}`);
        console.log(`Total available: ${totalAvailable}`);
    } catch (error) {
        console.error("Error seeding batches:", error);
    }
};

module.exports = seedBatches;

// Run if called directly
if (require.main === module) {
    const sequelize = require("../config/config");

    seedBatches()
        .then(() => {
            process.exit(0);
        })
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
}
