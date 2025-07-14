"use strict";

const { PickupPoint, City, State } = require("../models");

const seedPickupPoints = async () => {
    try {
        // Check if cities exist
        const cities = await City.findAll({ limit: 10 });
        if (cities.length === 0) {
            console.log("Cities not found. Please run cities seeder first.");
            return;
        }

        // Check if pickup points already exist
        const existingPickupPoints = await PickupPoint.findAll();
        if (existingPickupPoints.length > 0) {
            console.log("Pickup points already exist, skipping seed.");
            return;
        }

        const pickupPoints = [
            // Dehradun pickup points
            {
                cityId: cities[0].id,
                name: "Dehradun Railway Station",
                address: "Railway Colony, Dehradun, Uttarakhand",
                landmark: "Near Railway Station",
                contactPerson: "Rajesh Kumar",
                contactPhone: "+91 9876543210",
                status: "active",
                coordinates: { lat: 30.3165, lng: 78.0322 },
                operatingHours: "06:00 - 22:00",
                isDefault: true,
                capacity: 100,
                facilities: ["parking", "restroom", "food", "waiting_area"],
            },
            {
                cityId: cities[0].id,
                name: "ISBT Dehradun",
                address: "Mussoorie Diversion Road, Dehradun",
                landmark: "Near ISBT",
                contactPerson: "Priya Sharma",
                contactPhone: "+91 9876543211",
                status: "active",
                coordinates: { lat: 30.3255, lng: 78.0411 },
                operatingHours: "24/7",
                isDefault: false,
                capacity: 150,
                facilities: [
                    "parking",
                    "restroom",
                    "food",
                    "waiting_area",
                    "atm",
                ],
            },
            {
                cityId: cities[0].id,
                name: "Clock Tower",
                address: "Paltan Bazaar, Dehradun",
                landmark: "Clock Tower Circle",
                contactPerson: "Amit Patel",
                contactPhone: "+91 9876543212",
                status: "active",
                coordinates: { lat: 30.3165, lng: 78.0322 },
                operatingHours: "07:00 - 21:00",
                isDefault: false,
                capacity: 50,
                facilities: ["parking", "restroom"],
            },

            // Manali pickup points
            {
                cityId: cities[1].id,
                name: "Manali Bus Stand",
                address: "Mall Road, Manali, Himachal Pradesh",
                landmark: "Near Bus Stand",
                contactPerson: "Sonam Dorje",
                contactPhone: "+91 9876543213",
                status: "active",
                coordinates: { lat: 32.2432, lng: 77.1892 },
                operatingHours: "08:00 - 20:00",
                isDefault: true,
                capacity: 80,
                facilities: ["parking", "restroom", "food", "waiting_area"],
            },
            {
                cityId: cities[1].id,
                name: "Hadimba Temple",
                address: "Hadimba Temple Road, Manali",
                landmark: "Near Hadimba Temple",
                contactPerson: "Tenzin Wangchuk",
                contactPhone: "+91 9876543214",
                status: "active",
                coordinates: { lat: 32.2432, lng: 77.1892 },
                operatingHours: "08:30 - 18:00",
                isDefault: false,
                capacity: 40,
                facilities: ["parking", "restroom"],
            },

            // Rishikesh pickup points
            {
                cityId: cities[2].id,
                name: "Rishikesh Railway Station",
                address: "Railway Colony, Rishikesh, Uttarakhand",
                landmark: "Near Railway Station",
                contactPerson: "Yogi Raj",
                contactPhone: "+91 9876543215",
                status: "active",
                coordinates: { lat: 30.0869, lng: 78.2676 },
                operatingHours: "07:00 - 23:00",
                isDefault: true,
                capacity: 120,
                facilities: [
                    "parking",
                    "restroom",
                    "food",
                    "waiting_area",
                    "atm",
                ],
            },
            {
                cityId: cities[2].id,
                name: "Laxman Jhula",
                address: "Laxman Jhula Road, Rishikesh",
                landmark: "Near Laxman Jhula",
                contactPerson: "Ganga Devi",
                contactPhone: "+91 9876543216",
                status: "active",
                coordinates: { lat: 30.0869, lng: 78.2676 },
                operatingHours: "07:30 - 19:00",
                isDefault: false,
                capacity: 60,
                facilities: ["parking", "restroom", "food"],
            },

            // Gangtok pickup points
            {
                cityId: cities[3].id,
                name: "MG Marg",
                address: "MG Marg, Gangtok, Sikkim",
                landmark: "MG Marg Circle",
                contactPerson: "Pema Dorje",
                contactPhone: "+91 9876543217",
                status: "active",
                coordinates: { lat: 27.3389, lng: 88.6065 },
                operatingHours: "08:00 - 22:00",
                isDefault: true,
                capacity: 90,
                facilities: ["parking", "restroom", "food", "waiting_area"],
            },
            {
                cityId: cities[3].id,
                name: "Gangtok Bus Stand",
                address: "NH10, Gangtok",
                landmark: "Near Bus Stand",
                contactPerson: "Karma Sherpa",
                contactPhone: "+91 9876543218",
                status: "active",
                coordinates: { lat: 27.3389, lng: 88.6065 },
                operatingHours: "24/7",
                isDefault: false,
                capacity: 100,
                facilities: [
                    "parking",
                    "restroom",
                    "food",
                    "waiting_area",
                    "atm",
                ],
            },

            // Leh pickup points
            {
                cityId: cities[4].id,
                name: "Leh Airport",
                address: "Leh Airport, Leh, Ladakh",
                landmark: "Airport Terminal",
                contactPerson: "Stanzin Dorje",
                contactPhone: "+91 9876543219",
                status: "active",
                coordinates: { lat: 34.1356, lng: 77.5609 },
                operatingHours: "09:00 - 18:00",
                isDefault: true,
                capacity: 70,
                facilities: ["parking", "restroom", "food", "waiting_area"],
            },
            {
                cityId: cities[4].id,
                name: "Leh Market",
                address: "Main Market, Leh",
                landmark: "Near Market Square",
                contactPerson: "Tashi Namgyal",
                contactPhone: "+91 9876543220",
                status: "active",
                coordinates: { lat: 34.1356, lng: 77.5609 },
                operatingHours: "09:30 - 19:00",
                isDefault: false,
                capacity: 50,
                facilities: ["parking", "restroom", "food"],
            },

            // Shimla pickup points
            {
                cityId: cities[5].id,
                name: "Shimla Railway Station",
                address: "Kalka-Shimla Railway, Shimla",
                landmark: "Near Railway Station",
                contactPerson: "Himanshu Sharma",
                contactPhone: "+91 9876543221",
                status: "active",
                coordinates: { lat: 31.1048, lng: 77.1734 },
                operatingHours: "08:00 - 20:00",
                isDefault: true,
                capacity: 80,
                facilities: ["parking", "restroom", "food", "waiting_area"],
            },
            {
                cityId: cities[5].id,
                name: "Ridge",
                address: "The Ridge, Shimla",
                landmark: "Near Ridge",
                contactPerson: "Neha Thakur",
                contactPhone: "+91 9876543222",
                status: "active",
                coordinates: { lat: 31.1048, lng: 77.1734 },
                operatingHours: "08:30 - 19:00",
                isDefault: false,
                capacity: 40,
                facilities: ["parking", "restroom"],
            },

            // Mussoorie pickup points
            {
                cityId: cities[6].id,
                name: "Mussoorie Bus Stand",
                address: "Library Chowk, Mussoorie",
                landmark: "Near Bus Stand",
                contactPerson: "Vikram Singh",
                contactPhone: "+91 9876543223",
                status: "active",
                coordinates: { lat: 30.4598, lng: 78.062 },
                operatingHours: "07:00 - 21:00",
                isDefault: true,
                capacity: 60,
                facilities: ["parking", "restroom", "food", "waiting_area"],
            },
            {
                cityId: cities[6].id,
                name: "Gun Hill",
                address: "Gun Hill Road, Mussoorie",
                landmark: "Near Gun Hill",
                contactPerson: "Anjali Rawat",
                contactPhone: "+91 9876543224",
                status: "active",
                coordinates: { lat: 30.4598, lng: 78.062 },
                operatingHours: "08:00 - 18:00",
                isDefault: false,
                capacity: 30,
                facilities: ["parking", "restroom"],
            },

            // McLeod Ganj pickup points
            {
                cityId: cities[7].id,
                name: "McLeod Ganj Bus Stand",
                address: "Jogiwara Road, McLeod Ganj",
                landmark: "Near Bus Stand",
                contactPerson: "Tenzin Lhamo",
                contactPhone: "+91 9876543225",
                status: "active",
                coordinates: { lat: 32.2432, lng: 76.3232 },
                operatingHours: "08:00 - 20:00",
                isDefault: true,
                capacity: 50,
                facilities: ["parking", "restroom", "food", "waiting_area"],
            },
            {
                cityId: cities[7].id,
                name: "Temple Road",
                address: "Temple Road, McLeod Ganj",
                landmark: "Near Main Temple",
                contactPerson: "Dorje Tsering",
                contactPhone: "+91 9876543226",
                status: "active",
                coordinates: { lat: 32.2432, lng: 76.3232 },
                operatingHours: "08:30 - 18:30",
                isDefault: false,
                capacity: 25,
                facilities: ["parking", "restroom"],
            },

            // Haridwar pickup points
            {
                cityId: cities[8].id,
                name: "Haridwar Railway Station",
                address: "Railway Colony, Haridwar, Uttarakhand",
                landmark: "Near Railway Station",
                contactPerson: "Ganga Prasad",
                contactPhone: "+91 9876543227",
                status: "active",
                coordinates: { lat: 29.9457, lng: 78.1642 },
                operatingHours: "06:00 - 22:00",
                isDefault: true,
                capacity: 100,
                facilities: [
                    "parking",
                    "restroom",
                    "food",
                    "waiting_area",
                    "atm",
                ],
            },
            {
                cityId: cities[8].id,
                name: "Har Ki Pauri",
                address: "Har Ki Pauri Ghat, Haridwar",
                landmark: "Near Har Ki Pauri",
                contactPerson: "Shiva Kumar",
                contactPhone: "+91 9876543228",
                status: "active",
                coordinates: { lat: 29.9457, lng: 78.1642 },
                operatingHours: "06:30 - 21:00",
                isDefault: false,
                capacity: 60,
                facilities: ["parking", "restroom", "food"],
            },

            // Mysore pickup points
            {
                cityId: cities[9].id,
                name: "Mysore Railway Station",
                address: "Railway Colony, Mysore, Karnataka",
                landmark: "Near Railway Station",
                contactPerson: "Krishna Kumar",
                contactPhone: "+91 9876543229",
                status: "active",
                coordinates: { lat: 12.2958, lng: 76.6394 },
                operatingHours: "06:00 - 22:00",
                isDefault: true,
                capacity: 80,
                facilities: ["parking", "restroom", "food", "waiting_area"],
            },
            {
                cityId: cities[9].id,
                name: "Mysore Palace",
                address: "Palace Road, Mysore",
                landmark: "Near Mysore Palace",
                contactPerson: "Lakshmi Devi",
                contactPhone: "+91 9876543230",
                status: "active",
                coordinates: { lat: 12.2958, lng: 76.6394 },
                operatingHours: "08:00 - 18:00",
                isDefault: false,
                capacity: 40,
                facilities: ["parking", "restroom"],
            },
        ];

        await PickupPoint.bulkCreate(pickupPoints);

        console.log("Pickup points seeded successfully!");

        // Display created pickup points count
        const createdPickupPoints = await PickupPoint.findAll();
        console.log(`Created ${createdPickupPoints.length} pickup points`);

        // Show pickup points per city
        for (const city of cities) {
            const cityPickupPoints = await PickupPoint.findAll({
                where: { cityId: city.id },
            });
            console.log(
                `${city.cityName}: ${cityPickupPoints.length} pickup points`
            );
        }

        // Show default pickup points
        const defaultPickupPoints = await PickupPoint.findAll({
            where: { isDefault: true },
        });
        console.log(`Default pickup points: ${defaultPickupPoints.length}`);
    } catch (error) {
        console.error("Error seeding pickup points:", error);
    }
};

module.exports = seedPickupPoints;

// Run if called directly
if (require.main === module) {
    const sequelize = require("../config/config");

    seedPickupPoints()
        .then(() => {
            process.exit(0);
        })
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
}
