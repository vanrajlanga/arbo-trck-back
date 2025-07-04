"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const destinations = [
            {
                name: "Kedarnath",
                description:
                    "Sacred Hindu temple dedicated to Lord Shiva, located in the Garhwal Himalayas",
                region: "North",
                state: "Uttarakhand",
                altitude: 3584,
                best_time_to_visit: JSON.stringify([
                    "May",
                    "June",
                    "September",
                    "October",
                ]),
                difficulty: "moderate",
                trek_type: "mountain",
                is_popular: true,
                status: "active",
                image_url: null,
                coordinates: JSON.stringify({ lat: 30.7346, lng: 79.0669 }),
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                name: "Valley of Flowers",
                description:
                    "UNESCO World Heritage Site known for its meadows of endemic alpine flowers",
                region: "North",
                state: "Uttarakhand",
                altitude: 3658,
                best_time_to_visit: JSON.stringify([
                    "July",
                    "August",
                    "September",
                ]),
                difficulty: "moderate",
                trek_type: "mountain",
                is_popular: true,
                status: "active",
                image_url: null,
                coordinates: JSON.stringify({ lat: 30.7281, lng: 79.6049 }),
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                name: "Roopkund",
                description:
                    "Mysterious glacial lake known for human skeletons found at its bottom",
                region: "North",
                state: "Uttarakhand",
                altitude: 5029,
                best_time_to_visit: JSON.stringify([
                    "May",
                    "June",
                    "September",
                    "October",
                ]),
                difficulty: "difficult",
                trek_type: "mountain",
                is_popular: true,
                status: "active",
                image_url: null,
                coordinates: JSON.stringify({ lat: 30.2578, lng: 79.7307 }),
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                name: "Hampta Pass",
                description:
                    "High altitude mountain pass connecting Kullu Valley to Lahaul Valley",
                region: "North",
                state: "Himachal Pradesh",
                altitude: 4270,
                best_time_to_visit: JSON.stringify([
                    "June",
                    "July",
                    "August",
                    "September",
                ]),
                difficulty: "moderate",
                trek_type: "mountain",
                is_popular: true,
                status: "active",
                image_url: null,
                coordinates: JSON.stringify({ lat: 32.2432, lng: 77.1892 }),
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                name: "Triund",
                description:
                    "Popular trekking destination offering panoramic views of Dhauladhar range",
                region: "North",
                state: "Himachal Pradesh",
                altitude: 2847,
                best_time_to_visit: JSON.stringify([
                    "March",
                    "April",
                    "May",
                    "June",
                    "September",
                    "October",
                ]),
                difficulty: "easy",
                trek_type: "mountain",
                is_popular: true,
                status: "active",
                image_url: null,
                coordinates: JSON.stringify({ lat: 32.2432, lng: 76.3232 }),
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                name: "Sandakphu",
                description:
                    "Highest peak in West Bengal offering views of four of the five highest peaks in the world",
                region: "North-East",
                state: "West Bengal",
                altitude: 3636,
                best_time_to_visit: JSON.stringify([
                    "March",
                    "April",
                    "May",
                    "October",
                    "November",
                ]),
                difficulty: "moderate",
                trek_type: "mountain",
                is_popular: true,
                status: "active",
                image_url: null,
                coordinates: JSON.stringify({ lat: 27.1067, lng: 88.0083 }),
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                name: "Kumara Parvatha",
                description:
                    "One of the most challenging treks in Karnataka with steep ascents",
                region: "South",
                state: "Karnataka",
                altitude: 1712,
                best_time_to_visit: JSON.stringify([
                    "October",
                    "November",
                    "December",
                    "January",
                    "February",
                ]),
                difficulty: "difficult",
                trek_type: "mountain",
                is_popular: true,
                status: "active",
                image_url: null,
                coordinates: JSON.stringify({ lat: 12.9716, lng: 75.7507 }),
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                name: "Kodachadri",
                description:
                    "Mountain peak in the Western Ghats with dense forests and waterfalls",
                region: "South",
                state: "Karnataka",
                altitude: 1343,
                best_time_to_visit: JSON.stringify([
                    "October",
                    "November",
                    "December",
                    "January",
                    "February",
                ]),
                difficulty: "moderate",
                trek_type: "mountain",
                is_popular: false,
                status: "active",
                image_url: null,
                coordinates: JSON.stringify({ lat: 13.8667, lng: 74.8667 }),
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                name: "Tadiandamol",
                description:
                    "Highest peak in Coorg with coffee plantations and scenic views",
                region: "South",
                state: "Karnataka",
                altitude: 1748,
                best_time_to_visit: JSON.stringify([
                    "October",
                    "November",
                    "December",
                    "January",
                    "February",
                ]),
                difficulty: "moderate",
                trek_type: "mountain",
                is_popular: false,
                status: "active",
                image_url: null,
                coordinates: JSON.stringify({ lat: 12.9716, lng: 75.7507 }),
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                name: "Mullayanagiri",
                description:
                    "Highest peak in Karnataka with panoramic views of Western Ghats",
                region: "South",
                state: "Karnataka",
                altitude: 1930,
                best_time_to_visit: JSON.stringify([
                    "October",
                    "November",
                    "December",
                    "January",
                    "February",
                ]),
                difficulty: "easy",
                trek_type: "mountain",
                is_popular: true,
                status: "active",
                image_url: null,
                coordinates: JSON.stringify({ lat: 13.3889, lng: 75.7222 }),
                created_at: new Date(),
                updated_at: new Date(),
            },
        ];

        await queryInterface.bulkInsert("destinations", destinations, {});
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete("destinations", null, {});
    },
};
