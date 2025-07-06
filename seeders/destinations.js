"use strict";

const { Destination } = require("../models");

const seedDestinations = async () => {
    try {
        // Check if destinations already exist
        const existingDestinations = await Destination.findAll();
        if (existingDestinations.length > 0) {
            console.log("Destinations already exist, skipping seed.");
            return;
        }

        const destinations = [
            // Uttarakhand Destinations
            {
                name: "Valley of Flowers",
                state: "Uttarakhand",
                is_popular: true,
                status: "active",
            },
            {
                name: "Kedarnath Temple",
                state: "Uttarakhand",
                is_popular: true,
                status: "active",
            },
            {
                name: "Badrinath Temple",
                state: "Uttarakhand",
                is_popular: true,
                status: "active",
            },
            {
                name: "Gangotri Glacier",
                state: "Uttarakhand",
                is_popular: false,
                status: "active",
            },
            {
                name: "Yamunotri",
                state: "Uttarakhand",
                is_popular: false,
                status: "active",
            },
            {
                name: "Rishikesh Adventure Hub",
                state: "Uttarakhand",
                is_popular: true,
                status: "active",
            },
            {
                name: "Lakshman Jhula",
                state: "Uttarakhand",
                is_popular: false,
                status: "active",
            },
            {
                name: "Har Ki Pauri",
                state: "Uttarakhand",
                is_popular: true,
                status: "active",
            },
            {
                name: "Mussoorie Hills",
                state: "Uttarakhand",
                is_popular: true,
                status: "active",
            },
            {
                name: "Naini Lake",
                state: "Uttarakhand",
                is_popular: true,
                status: "active",
            },

            // Himachal Pradesh Destinations
            {
                name: "Solang Valley",
                state: "Himachal Pradesh",
                is_popular: true,
                status: "active",
            },
            {
                name: "Rohtang Pass",
                state: "Himachal Pradesh",
                is_popular: true,
                status: "active",
            },
            {
                name: "Hadimba Temple",
                state: "Himachal Pradesh",
                is_popular: false,
                status: "active",
            },
            {
                name: "Mall Road",
                state: "Himachal Pradesh",
                is_popular: true,
                status: "active",
            },
            {
                name: "Kufri",
                state: "Himachal Pradesh",
                is_popular: true,
                status: "active",
            },
            {
                name: "Dalai Lama Temple",
                state: "Himachal Pradesh",
                is_popular: true,
                status: "active",
            },
            {
                name: "Triund Trek",
                state: "Himachal Pradesh",
                is_popular: false,
                status: "active",
            },

            // Jammu and Kashmir Destinations
            {
                name: "Dal Lake",
                state: "Jammu and Kashmir",
                is_popular: true,
                status: "active",
            },
            {
                name: "Gulmarg",
                state: "Jammu and Kashmir",
                is_popular: true,
                status: "active",
            },
            {
                name: "Pahalgam",
                state: "Jammu and Kashmir",
                is_popular: false,
                status: "active",
            },

            // Ladakh Destinations
            {
                name: "Pangong Lake",
                state: "Ladakh",
                is_popular: true,
                status: "active",
            },
            {
                name: "Nubra Valley",
                state: "Ladakh",
                is_popular: true,
                status: "active",
            },
            {
                name: "Khardungla Pass",
                state: "Ladakh",
                is_popular: true,
                status: "active",
            },

            // Sikkim Destinations
            {
                name: "Tsomgo Lake",
                state: "Sikkim",
                is_popular: true,
                status: "active",
            },
            {
                name: "Nathula Pass",
                state: "Sikkim",
                is_popular: true,
                status: "active",
            },
            {
                name: "Yumthang Valley",
                state: "Sikkim",
                is_popular: false,
                status: "active",
            },

            // Maharashtra Destinations
            {
                name: "Gateway of India",
                state: "Maharashtra",
                is_popular: true,
                status: "active",
            },
            {
                name: "Marine Drive",
                state: "Maharashtra",
                is_popular: true,
                status: "active",
            },
            {
                name: "Lonavala Caves",
                state: "Maharashtra",
                is_popular: false,
                status: "active",
            },
            {
                name: "Mahabaleshwar Hills",
                state: "Maharashtra",
                is_popular: false,
                status: "active",
            },

            // Karnataka Destinations
            {
                name: "Lalbagh Botanical Garden",
                state: "Karnataka",
                is_popular: true,
                status: "active",
            },
            {
                name: "Mysore Palace",
                state: "Karnataka",
                is_popular: true,
                status: "active",
            },

            // Kerala Destinations
            {
                name: "Chinese Fishing Nets",
                state: "Kerala",
                is_popular: true,
                status: "active",
            },
            {
                name: "Munnar Tea Gardens",
                state: "Kerala",
                is_popular: false,
                status: "active",
            },

            // Tamil Nadu Destinations
            {
                name: "Marina Beach",
                state: "Tamil Nadu",
                is_popular: true,
                status: "active",
            },
            {
                name: "Ooty Botanical Gardens",
                state: "Tamil Nadu",
                is_popular: false,
                status: "active",
            },

            // Rajasthan Destinations
            {
                name: "Amber Fort",
                state: "Rajasthan",
                is_popular: true,
                status: "active",
            },
            {
                name: "Lake Palace",
                state: "Rajasthan",
                is_popular: true,
                status: "active",
            },

            // Delhi Destinations
            {
                name: "Red Fort",
                state: "Delhi",
                is_popular: true,
                status: "active",
            },
            {
                name: "Qutub Minar",
                state: "Delhi",
                is_popular: true,
                status: "active",
            },

            // Goa Destinations
            {
                name: "Calangute Beach",
                state: "Goa",
                is_popular: true,
                status: "active",
            },
            {
                name: "Basilica of Bom Jesus",
                state: "Goa",
                is_popular: true,
                status: "active",
            },
        ];

        await Destination.bulkCreate(destinations);
        console.log("Destinations seeded successfully!");

        // Display created destinations count
        const createdDestinations = await Destination.findAll();
        console.log(`Created ${createdDestinations.length} destinations`);
    } catch (error) {
        console.error("Error seeding destinations:", error);
    }
};

module.exports = seedDestinations;

// Run if called directly
if (require.main === module) {
    const sequelize = require("../config/config");

    seedDestinations()
        .then(() => {
            process.exit(0);
        })
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
}
