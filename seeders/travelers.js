"use strict";

const { Traveler, Customer } = require("../models");

const seedTravelers = async () => {
    try {
        // Check if customers exist
        const customers = await Customer.findAll({ limit: 5 });
        if (customers.length === 0) {
            console.log(
                "Customers not found. Please run customers seeder first."
            );
            return;
        }

        // Check if travelers already exist
        const existingTravelers = await Traveler.findAll();
        if (existingTravelers.length > 0) {
            console.log("Travelers already exist, skipping seed.");
            return;
        }

        const travelers = [
            // Travelers for first customer (Rahul Sharma)
            {
                customer_id: customers[0].id,
                name: "Rahul Sharma",
                age: 33,
                gender: "male",
                is_active: true,
            },
            {
                customer_id: customers[0].id,
                name: "Priya Sharma",
                age: 30,
                gender: "female",
                is_active: true,
            },
            {
                customer_id: customers[0].id,
                name: "Arjun Sharma",
                age: 8,
                gender: "male",
                is_active: true,
            },

            // Travelers for second customer (Priya Patel)
            {
                customer_id: customers[1].id,
                name: "Priya Patel",
                age: 31,
                gender: "female",
                is_active: true,
            },
            {
                customer_id: customers[1].id,
                name: "Amit Patel",
                age: 35,
                gender: "male",
                is_active: true,
            },
            {
                customer_id: customers[1].id,
                name: "Kavya Patel",
                age: 12,
                gender: "female",
                is_active: true,
            },

            // Travelers for third customer (Amit Kumar)
            {
                customer_id: customers[2].id,
                name: "Amit Kumar",
                age: 35,
                gender: "male",
                is_active: true,
            },
            {
                customer_id: customers[2].id,
                name: "Sunita Kumar",
                age: 32,
                gender: "female",
                is_active: true,
            },
            {
                customer_id: customers[2].id,
                name: "Rohan Kumar",
                age: 15,
                gender: "male",
                is_active: true,
            },

            // Travelers for fourth customer (Neha Singh)
            {
                customer_id: customers[3].id,
                name: "Neha Singh",
                age: 28,
                gender: "female",
                is_active: true,
            },
            {
                customer_id: customers[3].id,
                name: "Rajesh Singh",
                age: 30,
                gender: "male",
                is_active: true,
            },
            {
                customer_id: customers[3].id,
                name: "Ananya Singh",
                age: 6,
                gender: "female",
                is_active: true,
            },

            // Travelers for fifth customer (Vikram Malhotra)
            {
                customer_id: customers[4].id,
                name: "Vikram Malhotra",
                age: 38,
                gender: "male",
                is_active: true,
            },
            {
                customer_id: customers[4].id,
                name: "Anjali Malhotra",
                age: 35,
                gender: "female",
                is_active: true,
            },
            {
                customer_id: customers[4].id,
                name: "Vivaan Malhotra",
                age: 10,
                gender: "male",
                is_active: true,
            },
        ];

        await Traveler.bulkCreate(travelers);

        console.log("Travelers seeded successfully!");

        // Display created travelers count
        const createdTravelers = await Traveler.findAll();
        console.log(`Created ${createdTravelers.length} travelers`);

        // Show travelers per customer
        for (const customer of customers) {
            const customerTravelers = await Traveler.findAll({
                where: { customer_id: customer.id },
            });
            console.log(
                `${customer.name}: ${customerTravelers.length} travelers`
            );
        }
    } catch (error) {
        console.error("Error seeding travelers:", error);
    }
};

module.exports = seedTravelers;

// Run if called directly
if (require.main === module) {
    const sequelize = require("../config/config");

    seedTravelers()
        .then(() => {
            process.exit(0);
        })
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
}
