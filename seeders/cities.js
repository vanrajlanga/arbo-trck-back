"use strict";

const { City, State } = require("../models");

const seedCities = async () => {
    try {
        // Check if cities already exist
        const existingCities = await City.findAll();
        if (existingCities.length > 0) {
            console.log("Cities already exist, skipping seed.");
            return;
        }

        // Get all states to reference them properly
        const states = await State.findAll();
        const stateMap = {};
        states.forEach((state) => {
            stateMap[state.name] = state.id;
        });

        const cities = [
            // Uttarakhand - Major Trekking Hub
            {
                cityName: "Dehradun",
                isPopular: true,
                stateId: stateMap["Uttarakhand"],
            },
            {
                cityName: "Rishikesh",
                isPopular: true,
                stateId: stateMap["Uttarakhand"],
            },
            {
                cityName: "Haridwar",
                isPopular: true,
                stateId: stateMap["Uttarakhand"],
            },
            {
                cityName: "Mussoorie",
                isPopular: true,
                stateId: stateMap["Uttarakhand"],
            },
            {
                cityName: "Nainital",
                isPopular: true,
                stateId: stateMap["Uttarakhand"],
            },
            {
                cityName: "Almora",
                isPopular: false,
                stateId: stateMap["Uttarakhand"],
            },
            {
                cityName: "Ranikhet",
                isPopular: false,
                stateId: stateMap["Uttarakhand"],
            },

            // Himachal Pradesh
            {
                cityName: "Manali",
                isPopular: true,
                stateId: stateMap["Himachal Pradesh"],
            },
            {
                cityName: "Shimla",
                isPopular: true,
                stateId: stateMap["Himachal Pradesh"],
            },
            {
                cityName: "Dharamshala",
                isPopular: true,
                stateId: stateMap["Himachal Pradesh"],
            },
            {
                cityName: "Kullu",
                isPopular: false,
                stateId: stateMap["Himachal Pradesh"],
            },
            {
                cityName: "McLeod Ganj",
                isPopular: false,
                stateId: stateMap["Himachal Pradesh"],
            },

            // Jammu and Kashmir
            {
                cityName: "Srinagar",
                isPopular: true,
                stateId: stateMap["Jammu and Kashmir"],
            },
            {
                cityName: "Leh",
                isPopular: true,
                stateId: stateMap["Ladakh"],
            },
            {
                cityName: "Kargil",
                isPopular: false,
                stateId: stateMap["Ladakh"],
            },

            // Sikkim
            {
                cityName: "Gangtok",
                isPopular: true,
                stateId: stateMap["Sikkim"],
            },
            {
                cityName: "Lachung",
                isPopular: false,
                stateId: stateMap["Sikkim"],
            },

            // Maharashtra
            {
                cityName: "Mumbai",
                isPopular: true,
                stateId: stateMap["Maharashtra"],
            },
            {
                cityName: "Pune",
                isPopular: true,
                stateId: stateMap["Maharashtra"],
            },
            {
                cityName: "Lonavala",
                isPopular: false,
                stateId: stateMap["Maharashtra"],
            },
            {
                cityName: "Mahabaleshwar",
                isPopular: false,
                stateId: stateMap["Maharashtra"],
            },

            // Karnataka
            {
                cityName: "Bangalore",
                isPopular: true,
                stateId: stateMap["Karnataka"],
            },
            {
                cityName: "Mysore",
                isPopular: false,
                stateId: stateMap["Karnataka"],
            },

            // Kerala
            {
                cityName: "Kochi",
                isPopular: true,
                stateId: stateMap["Kerala"],
            },
            {
                cityName: "Munnar",
                isPopular: false,
                stateId: stateMap["Kerala"],
            },

            // Tamil Nadu
            {
                cityName: "Chennai",
                isPopular: true,
                stateId: stateMap["Tamil Nadu"],
            },
            {
                cityName: "Ooty",
                isPopular: false,
                stateId: stateMap["Tamil Nadu"],
            },

            // Rajasthan
            {
                cityName: "Jaipur",
                isPopular: true,
                stateId: stateMap["Rajasthan"],
            },
            {
                cityName: "Udaipur",
                isPopular: false,
                stateId: stateMap["Rajasthan"],
            },

            // Delhi
            {
                cityName: "New Delhi",
                isPopular: true,
                stateId: stateMap["Delhi"],
            },

            // Goa
            {
                cityName: "Panaji",
                isPopular: true,
                stateId: stateMap["Goa"],
            },
        ];

        await City.bulkCreate(cities);
        console.log("Cities seeded successfully!");

        // Display created cities count
        const createdCities = await City.findAll();
        console.log(`Created ${createdCities.length} cities`);
    } catch (error) {
        console.error("Error seeding cities:", error);
    }
};

module.exports = seedCities;

// Run if called directly
if (require.main === module) {
    const sequelize = require("../config/config");

    seedCities()
        .then(() => {
            process.exit(0);
        })
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
}
