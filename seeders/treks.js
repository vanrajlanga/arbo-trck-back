"use strict";

const { Trek, Vendor, Destination, City, Activity } = require("../models");

const seedTreks = async () => {
    try {
        // Check if required data exists
        const vendors = await Vendor.findAll({ limit: 5 });
        const destinations = await Destination.findAll();
        const cities = await City.findAll();
        const activities = await Activity.findAll();

        console.log(
            `Found ${vendors.length} vendors, ${destinations.length} destinations, ${cities.length} cities, ${activities.length} activities`
        );

        if (
            vendors.length === 0 ||
            destinations.length === 0 ||
            cities.length === 0 ||
            activities.length === 0
        ) {
            console.log(
                "Required data not found. Please run vendors, destinations, cities, and activities seeders first."
            );
            return;
        }

        // Create a mapping of activity names to IDs
        const activityMap = {};
        activities.forEach((activity) => {
            activityMap[activity.name] = activity.id;
        });

        // Debug: Check if we have enough data for the treks array
        if (vendors.length < 5) {
            console.log(
                `Warning: Only ${vendors.length} vendors found, but treks array expects at least 5`
            );
        }
        if (destinations.length < 11) {
            console.log(
                `Warning: Only ${destinations.length} destinations found, but treks array expects at least 11`
            );
        }
        if (cities.length < 8) {
            console.log(
                `Warning: Only ${cities.length} cities found, but treks array expects at least 8`
            );
        }

        // Check if treks already exist
        const existingTreks = await Trek.findAll();
        if (existingTreks.length > 0) {
            console.log("Treks already exist, skipping seed.");
            return;
        }

        const treks = [
            {
                title: "Valley of Flowers Trek",
                description:
                    "Experience the magical Valley of Flowers, a UNESCO World Heritage Site. This moderate trek takes you through vibrant meadows filled with rare Himalayan flowers, cascading waterfalls, and breathtaking mountain views. Perfect for nature lovers and photography enthusiasts.",
                vendor_id: vendors[0].id,
                destination_id: destinations[0].id,
                city_id: cities[0].id,
                duration: "6 Days / 5 Nights",
                duration_days: 6,
                duration_nights: 5,
                base_price: 14999,
                difficulty: "moderate",
                trek_type: "mountain",
                category: "Flower Valley",
                status: "active",
                meeting_point: "Dehradun Railway Station",
                meeting_time: "06:00",
                inclusions: [
                    "Accommodation in guesthouses and camps",
                    "All meals (breakfast, lunch, dinner)",
                    "Experienced trek guide",
                    "Transport from Dehradun to base camp",
                    "Trekking permits and fees",
                    "First aid kit and safety equipment",
                    "Camping equipment (tents, sleeping bags)",
                ],
                exclusions: [
                    "Personal expenses",
                    "Travel insurance",
                    "Any additional activities",
                    "Tips for guides and porters",
                    "Personal trekking gear",
                ],
                activities: [
                    activityMap["Photography"] || 1,
                    activityMap["Bird Watching"] || 2,
                    activityMap["Village Visit"] || 3,
                    activityMap["Local Cuisine"] || 4,
                ],
                cancellation_policies: [
                    {
                        title: "Cancellation Policy",
                        description:
                            "Standard cancellation terms for Valley of Flowers Trek",
                        rules: [
                            {
                                rule: "Cancellation 30+ days before",
                                deduction: "10%",
                            },
                            {
                                rule: "Cancellation 15-29 days before",
                                deduction: "25%",
                            },
                            {
                                rule: "Cancellation 7-14 days before",
                                deduction: "50%",
                            },
                            {
                                rule: "Cancellation less than 7 days",
                                deduction: "100%",
                            },
                        ],
                        descriptionPoints: [
                            "Cancellation must be made in writing",
                            "Refunds processed within 5-7 business days",
                            "Force majeure events may affect cancellation terms",
                        ],
                    },
                ],
                other_policies: [],
            },
            {
                title: "Kedarnath Temple Trek",
                description:
                    "Embark on a spiritual journey to the sacred Kedarnath Temple, one of the Char Dham pilgrimage sites. This challenging trek combines religious significance with stunning Himalayan landscapes, ancient temples, and the powerful Mandakini River.",
                vendor_id: vendors[1].id,
                destination_id: destinations[1].id,
                city_id: cities[1].id,
                duration: "8 Days / 7 Nights",
                duration_days: 8,
                duration_nights: 7,
                base_price: 19999,
                difficulty: "difficult",
                trek_type: "mountain",
                category: "Pilgrimage",
                status: "active",
                meeting_point: "Haridwar Railway Station",
                meeting_time: "07:00",
                inclusions: [
                    "Accommodation in guesthouses and dharamshalas",
                    "Vegetarian meals (breakfast, lunch, dinner)",
                    "Experienced trek guide",
                    "Transport from Haridwar to base camp",
                    "Temple visit permits",
                    "First aid kit and safety equipment",
                    "Porter services for luggage",
                ],
                exclusions: [
                    "Personal expenses",
                    "Travel insurance",
                    "Temple offerings and donations",
                    "Tips for guides and porters",
                    "Personal trekking gear",
                ],
                activities: [
                    activityMap["Photography"] || 1,
                    activityMap["Meditation"] || 2,
                    activityMap["Yoga"] || 3,
                    activityMap["Village Visit"] || 4,
                    activityMap["Local Cuisine"] || 5,
                ],
                cancellation_policies: [
                    {
                        title: "Cancellation Policy",
                        description:
                            "Special cancellation terms for Kedarnath Trek",
                        rules: [
                            {
                                rule: "Cancellation 45+ days before",
                                deduction: "5%",
                            },
                            {
                                rule: "Cancellation 30-44 days before",
                                deduction: "15%",
                            },
                            {
                                rule: "Cancellation 15-29 days before",
                                deduction: "30%",
                            },
                            {
                                rule: "Cancellation less than 15 days",
                                deduction: "100%",
                            },
                        ],
                        descriptionPoints: [
                            "Special terms for religious pilgrimage",
                            "Refunds processed within 7-10 business days",
                            "Weather conditions may affect trek schedule",
                        ],
                    },
                ],
                other_policies: [],
            },
            {
                title: "Triund Trek",
                description:
                    "Perfect for beginners, the Triund Trek offers spectacular views of the Dhauladhar Range and Kangra Valley. This easy-moderate trek features lush green meadows, panoramic mountain vistas, and a comfortable camping experience under the stars.",
                vendor_id: vendors[2].id,
                destination_id: destinations[2].id,
                city_id: cities[2].id,
                duration: "3 Days / 2 Nights",
                duration_days: 3,
                duration_nights: 2,
                base_price: 7999,
                difficulty: "easy",
                trek_type: "mountain",
                category: "Adventure",
                status: "active",
                meeting_point: "McLeod Ganj Bus Stand",
                meeting_time: "08:00",
                inclusions: [
                    "Accommodation in camps",
                    "All meals (breakfast, lunch, dinner)",
                    "Experienced trek guide",
                    "Transport from McLeod Ganj to base",
                    "Trekking permits",
                    "Camping equipment",
                    "Bonfire and music session",
                ],
                exclusions: [
                    "Personal expenses",
                    "Travel insurance",
                    "Any additional activities",
                    "Tips for guides",
                    "Personal trekking gear",
                ],
                activities: [
                    activityMap["Photography"] || 1,
                    activityMap["Stargazing"] || 2,
                    activityMap["Bonfire"] || 3,
                    activityMap["Local Cuisine"] || 4,
                    activityMap["Meditation"] || 5,
                ],
                cancellation_policies: [
                    {
                        title: "Cancellation Policy",
                        description:
                            "Standard cancellation terms for Triund Trek",
                        rules: [
                            {
                                rule: "Cancellation 15+ days before",
                                deduction: "10%",
                            },
                            {
                                rule: "Cancellation 7-14 days before",
                                deduction: "25%",
                            },
                            {
                                rule: "Cancellation 3-6 days before",
                                deduction: "50%",
                            },
                            {
                                rule: "Cancellation less than 3 days",
                                deduction: "100%",
                            },
                        ],
                        descriptionPoints: [
                            "Cancellation must be made in writing",
                            "Refunds processed within 5-7 business days",
                            "Weather conditions may affect trek schedule",
                        ],
                    },
                ],
                other_policies: [],
            },
            {
                title: "Pangong Lake Trek",
                description:
                    "Experience the mesmerizing beauty of Pangong Lake, one of the highest saltwater lakes in the world. This extreme trek takes you through the rugged landscapes of Ladakh, offering stunning views of the lake's changing colors and surrounding peaks.",
                vendor_id: vendors[3].id,
                destination_id: destinations[3].id,
                city_id: cities[3].id,
                duration: "10 Days / 9 Nights",
                duration_days: 10,
                duration_nights: 9,
                base_price: 29999,
                difficulty: "extreme",
                trek_type: "mountain",
                category: "High Altitude",
                status: "active",
                meeting_point: "Leh Airport",
                meeting_time: "09:00",
                inclusions: [
                    "Accommodation in camps and guesthouses",
                    "All meals (breakfast, lunch, dinner)",
                    "Experienced high-altitude trek guide",
                    "Transport from Leh to base camp",
                    "Trekking permits and fees",
                    "Oxygen cylinders and medical support",
                    "Complete camping equipment",
                    "Acclimatization support",
                ],
                exclusions: [
                    "Personal expenses",
                    "Travel insurance",
                    "Any additional activities",
                    "Tips for guides and porters",
                    "Personal trekking gear",
                    "Flight tickets to Leh",
                ],
                activities: [
                    activityMap["Trekking"] || 1,
                    activityMap["Photography"] || 2,
                    activityMap["Stargazing"] || 3,
                    activityMap["Village Visit"] || 4,
                    activityMap["Meditation"] || 5,
                ],
                cancellation_policies: [
                    {
                        title: "Cancellation Policy",
                        description: "Special terms for high-altitude trek",
                        rules: [
                            {
                                rule: "Cancellation 60+ days before",
                                deduction: "5%",
                            },
                            {
                                rule: "Cancellation 30-59 days before",
                                deduction: "15%",
                            },
                            {
                                rule: "Cancellation 15-29 days before",
                                deduction: "30%",
                            },
                            {
                                rule: "Cancellation less than 15 days",
                                deduction: "100%",
                            },
                        ],
                        descriptionPoints: [
                            "Special terms for extreme altitude trek",
                            "Medical fitness certificate required",
                            "Weather and altitude may affect schedule",
                        ],
                    },
                ],
                other_policies: [],
            },
            {
                title: "Khardungla Pass Trek",
                description:
                    "Challenge yourself with the Khardungla Pass Trek, one of the highest motorable passes in the world. This extreme trek offers breathtaking views of the Karakoram Range and the Nubra Valley, making it a dream for adventure enthusiasts.",
                vendor_id: vendors[3].id,
                destination_id: destinations[4].id,
                city_id: cities[3].id,
                duration: "12 Days / 11 Nights",
                duration_days: 12,
                duration_nights: 11,
                base_price: 34999,
                difficulty: "extreme",
                trek_type: "mountain",
                category: "Extreme",
                status: "active",
                meeting_point: "Leh Airport",
                meeting_time: "08:00",
                inclusions: [
                    "Accommodation in camps and guesthouses",
                    "All meals (breakfast, lunch, dinner)",
                    "Experienced extreme altitude guide",
                    "Transport from Leh to base camp",
                    "Trekking permits and fees",
                    "Oxygen cylinders and medical support",
                    "Complete camping equipment",
                    "Acclimatization program",
                    "Safety equipment",
                ],
                exclusions: [
                    "Personal expenses",
                    "Travel insurance",
                    "Any additional activities",
                    "Tips for guides and porters",
                    "Personal trekking gear",
                    "Flight tickets to Leh",
                ],
                activities: [
                    activityMap["Trekking"] || 1,
                    activityMap["Rock Climbing"] || 2,
                    activityMap["Photography"] || 3,
                    activityMap["Village Visit"] || 4,
                    activityMap["Mountain Biking"] || 5,
                ],
                cancellation_policies: [
                    {
                        title: "Cancellation Policy",
                        description: "Special terms for extreme altitude trek",
                        rules: [
                            {
                                rule: "Cancellation 90+ days before",
                                deduction: "5%",
                            },
                            {
                                rule: "Cancellation 60-89 days before",
                                deduction: "15%",
                            },
                            {
                                rule: "Cancellation 30-59 days before",
                                deduction: "30%",
                            },
                            {
                                rule: "Cancellation less than 30 days",
                                deduction: "100%",
                            },
                        ],
                        descriptionPoints: [
                            "Special terms for extreme altitude trek",
                            "Medical fitness certificate mandatory",
                            "Weather and altitude may affect schedule",
                        ],
                    },
                ],
                other_policies: [],
            },
            {
                title: "Yumthang Valley Trek",
                description:
                    "Discover the enchanting Yumthang Valley, known as the Valley of Flowers of Sikkim. This moderate trek takes you through rhododendron forests, hot springs, and offers stunning views of the snow-capped Himalayan peaks.",
                vendor_id: vendors[4].id,
                destination_id: destinations[5].id,
                city_id: cities[4].id,
                duration: "7 Days / 6 Nights",
                duration_days: 7,
                duration_nights: 6,
                base_price: 17999,
                difficulty: "moderate",
                trek_type: "mountain",
                category: "Valley",
                status: "active",
                meeting_point: "Gangtok Bus Stand",
                meeting_time: "07:00",
                inclusions: [
                    "Accommodation in guesthouses and camps",
                    "All meals (breakfast, lunch, dinner)",
                    "Experienced trek guide",
                    "Transport from Gangtok to base camp",
                    "Trekking permits and fees",
                    "First aid kit and safety equipment",
                    "Camping equipment",
                    "Hot spring visit",
                ],
                exclusions: [
                    "Personal expenses",
                    "Travel insurance",
                    "Any additional activities",
                    "Tips for guides and porters",
                    "Personal trekking gear",
                ],
                activities: [
                    activityMap["Photography"] || 1,
                    activityMap["Camping"] || 2,
                    activityMap["Bird Watching"] || 3,
                    activityMap["Village Visit"] || 4,
                    activityMap["Local Cuisine"] || 5,
                ],
                cancellation_policies: [
                    {
                        title: "Cancellation Policy",
                        description:
                            "Standard cancellation terms for Yumthang Trek",
                        rules: [
                            {
                                rule: "Cancellation 30+ days before",
                                deduction: "10%",
                            },
                            {
                                rule: "Cancellation 15-29 days before",
                                deduction: "25%",
                            },
                            {
                                rule: "Cancellation 7-14 days before",
                                deduction: "50%",
                            },
                            {
                                rule: "Cancellation less than 7 days",
                                deduction: "100%",
                            },
                        ],
                        descriptionPoints: [
                            "Cancellation must be made in writing",
                            "Refunds processed within 5-7 business days",
                            "Weather conditions may affect trek schedule",
                        ],
                    },
                ],
                other_policies: [],
            },
            {
                title: "Rishikesh Adventure Trek",
                description:
                    "Combine adventure with spirituality in Rishikesh, the Yoga Capital of the World. This easy trek includes river rafting, yoga sessions, temple visits, and camping by the Ganges River.",
                vendor_id: vendors[2].id,
                destination_id: destinations[6].id,
                city_id: cities[2].id,
                duration: "4 Days / 3 Nights",
                duration_days: 4,
                duration_nights: 3,
                base_price: 9999,
                difficulty: "easy",
                trek_type: "adventure",
                category: "Adventure",
                status: "active",
                meeting_point: "Rishikesh Railway Station",
                meeting_time: "08:00",
                inclusions: [
                    "Accommodation in camps and guesthouses",
                    "All meals (breakfast, lunch, dinner)",
                    "Experienced adventure guide",
                    "River rafting equipment",
                    "Yoga sessions",
                    "Temple visits",
                    "Transport within Rishikesh",
                    "Safety equipment",
                ],
                exclusions: [
                    "Personal expenses",
                    "Travel insurance",
                    "Any additional activities",
                    "Tips for guides",
                    "Personal gear",
                ],
                activities: [
                    activityMap["River Rafting"] || 1,
                    activityMap["Yoga"] || 2,
                    activityMap["Meditation"] || 3,
                    activityMap["Village Visit"] || 4,
                    activityMap["Local Cuisine"] || 5,
                ],
                cancellation_policies: [
                    {
                        title: "Cancellation Policy",
                        description:
                            "Standard cancellation terms for Rishikesh Adventure",
                        rules: [
                            {
                                rule: "Cancellation 15+ days before",
                                deduction: "10%",
                            },
                            {
                                rule: "Cancellation 7-14 days before",
                                deduction: "25%",
                            },
                            {
                                rule: "Cancellation 3-6 days before",
                                deduction: "50%",
                            },
                            {
                                rule: "Cancellation less than 3 days",
                                deduction: "100%",
                            },
                        ],
                        descriptionPoints: [
                            "Cancellation must be made in writing",
                            "Refunds processed within 5-7 business days",
                            "Weather conditions may affect activities",
                        ],
                    },
                ],
                other_policies: [],
            },
            {
                title: "Solang Valley Trek",
                description:
                    "Experience the thrill of Solang Valley, a paradise for adventure sports. This moderate trek combines trekking with activities like paragliding, zorbing, and skiing (in winter), offering a perfect blend of adventure and natural beauty.",
                vendor_id: vendors[1].id,
                destination_id: destinations[7].id,
                city_id: cities[1].id,
                duration: "5 Days / 4 Nights",
                duration_days: 5,
                duration_nights: 4,
                base_price: 12999,
                difficulty: "moderate",
                trek_type: "adventure",
                category: "Adventure",
                status: "active",
                meeting_point: "Manali Bus Stand",
                meeting_time: "08:30",
                inclusions: [
                    "Accommodation in guesthouses and camps",
                    "All meals (breakfast, lunch, dinner)",
                    "Experienced adventure guide",
                    "Transport from Manali to Solang",
                    "Adventure sports equipment",
                    "Safety equipment and training",
                    "Camping equipment",
                ],
                exclusions: [
                    "Personal expenses",
                    "Travel insurance",
                    "Additional adventure activities",
                    "Tips for guides",
                    "Personal gear",
                ],
                activities: [
                    activityMap["Trekking"] || 1,
                    activityMap["Photography"] || 2,
                    activityMap["Mountain Biking"] || 3,
                    activityMap["Village Visit"] || 4,
                    activityMap["Local Cuisine"] || 5,
                ],
                cancellation_policies: [
                    {
                        title: "Cancellation Policy",
                        description:
                            "Standard cancellation terms for Solang Adventure",
                        rules: [
                            {
                                rule: "Cancellation 20+ days before",
                                deduction: "10%",
                            },
                            {
                                rule: "Cancellation 10-19 days before",
                                deduction: "25%",
                            },
                            {
                                rule: "Cancellation 5-9 days before",
                                deduction: "50%",
                            },
                            {
                                rule: "Cancellation less than 5 days",
                                deduction: "100%",
                            },
                        ],
                        descriptionPoints: [
                            "Cancellation must be made in writing",
                            "Refunds processed within 5-7 business days",
                            "Weather conditions may affect adventure activities",
                        ],
                    },
                ],
                other_policies: [],
            },
            {
                title: "Mysore Palace Trek",
                description:
                    "Explore the cultural heritage of Karnataka with this unique trek that combines palace visits, historical monuments, and nature trails. Experience the grandeur of Mysore Palace and the surrounding Chamundi Hills.",
                vendor_id: vendors[0].id,
                destination_id: destinations[8].id,
                city_id: cities[5].id,
                duration: "3 Days / 2 Nights",
                duration_days: 3,
                duration_nights: 2,
                base_price: 6999,
                difficulty: "easy",
                trek_type: "adventure",
                category: "Cultural",
                status: "active",
                meeting_point: "Mysore Railway Station",
                meeting_time: "09:00",
                inclusions: [
                    "Accommodation in heritage hotels",
                    "All meals (breakfast, lunch, dinner)",
                    "Experienced cultural guide",
                    "Palace entry tickets",
                    "Transport within Mysore",
                    "Cultural activities",
                    "Historical tour",
                ],
                exclusions: [
                    "Personal expenses",
                    "Travel insurance",
                    "Any additional activities",
                    "Tips for guides",
                    "Personal items",
                ],
                activities: [
                    activityMap["Village Visit"] || 1,
                    activityMap["Local Cuisine"] || 2,
                    activityMap["Photography"] || 3,
                    activityMap["Camping"] || 4,
                ],
                cancellation_policies: [
                    {
                        title: "Cancellation Policy",
                        description:
                            "Standard cancellation terms for Cultural Trek",
                        rules: [
                            {
                                rule: "Cancellation 15+ days before",
                                deduction: "10%",
                            },
                            {
                                rule: "Cancellation 7-14 days before",
                                deduction: "25%",
                            },
                            {
                                rule: "Cancellation 3-6 days before",
                                deduction: "50%",
                            },
                            {
                                rule: "Cancellation less than 3 days",
                                deduction: "100%",
                            },
                        ],
                        descriptionPoints: [
                            "Cancellation must be made in writing",
                            "Refunds processed within 5-7 business days",
                            "Cultural events may affect schedule",
                        ],
                    },
                ],
                other_policies: [],
            },
            {
                title: "Lonavala Caves Trek",
                description:
                    "Discover the ancient Buddhist caves and scenic beauty of Lonavala. This easy trek combines historical exploration with nature trails, offering stunning views of the Western Ghats and the Arabian Sea.",
                vendor_id: vendors[0].id,
                destination_id: destinations[9].id,
                city_id: cities[6].id,
                duration: "2 Days / 1 Night",
                duration_days: 2,
                duration_nights: 1,
                base_price: 4999,
                difficulty: "easy",
                trek_type: "adventure",
                category: "Cave Trek",
                status: "active",
                meeting_point: "Lonavala Railway Station",
                meeting_time: "09:30",
                inclusions: [
                    "Accommodation in guesthouses",
                    "All meals (breakfast, lunch, dinner)",
                    "Experienced guide",
                    "Cave entry permits",
                    "Transport within Lonavala",
                    "Safety equipment",
                    "Historical tour",
                ],
                exclusions: [
                    "Personal expenses",
                    "Travel insurance",
                    "Any additional activities",
                    "Tips for guides",
                    "Personal items",
                ],
                activities: [
                    activityMap["Photography"] || 1,
                    activityMap["Village Visit"] || 2,
                    activityMap["Local Cuisine"] || 3,
                    activityMap["Camping"] || 4,
                ],
                cancellation_policies: [
                    {
                        title: "Cancellation Policy",
                        description:
                            "Standard cancellation terms for Cave Trek",
                        rules: [
                            {
                                rule: "Cancellation 10+ days before",
                                deduction: "10%",
                            },
                            {
                                rule: "Cancellation 5-9 days before",
                                deduction: "25%",
                            },
                            {
                                rule: "Cancellation 2-4 days before",
                                deduction: "50%",
                            },
                            {
                                rule: "Cancellation less than 2 days",
                                deduction: "100%",
                            },
                        ],
                        descriptionPoints: [
                            "Cancellation must be made in writing",
                            "Refunds processed within 5-7 business days",
                            "Weather conditions may affect cave visits",
                        ],
                    },
                ],
                other_policies: [],
            },
            {
                title: "Munnar Tea Gardens Trek",
                description:
                    "Experience the serene beauty of Munnar's tea gardens and the Western Ghats. This easy trek takes you through rolling tea plantations, spice gardens, and offers breathtaking views of the Nilgiri Hills.",
                vendor_id: vendors[4].id,
                destination_id: destinations[9].id,
                city_id: cities[7].id,
                duration: "4 Days / 3 Nights",
                duration_days: 4,
                duration_nights: 3,
                base_price: 8999,
                difficulty: "easy",
                trek_type: "forest",
                category: "Tea Garden",
                status: "active",
                meeting_point: "Munnar Bus Stand",
                meeting_time: "08:00",
                inclusions: [
                    "Accommodation in tea estate bungalows",
                    "All meals (breakfast, lunch, dinner)",
                    "Experienced nature guide",
                    "Tea garden tours",
                    "Transport within Munnar",
                    "Spice garden visit",
                    "Tea tasting sessions",
                ],
                exclusions: [
                    "Personal expenses",
                    "Travel insurance",
                    "Any additional activities",
                    "Tips for guides",
                    "Personal items",
                ],
                activities: [
                    activityMap["Photography"] || 1,
                    activityMap["Local Cuisine"] || 2,
                    activityMap["Village Visit"] || 3,
                    activityMap["Camping"] || 4,
                ],
                cancellation_policies: [
                    {
                        title: "Cancellation Policy",
                        description:
                            "Standard cancellation terms for Tea Garden Trek",
                        rules: [
                            {
                                rule: "Cancellation 15+ days before",
                                deduction: "10%",
                            },
                            {
                                rule: "Cancellation 7-14 days before",
                                deduction: "25%",
                            },
                            {
                                rule: "Cancellation 3-6 days before",
                                deduction: "50%",
                            },
                            {
                                rule: "Cancellation less than 3 days",
                                deduction: "100%",
                            },
                        ],
                        descriptionPoints: [
                            "Cancellation must be made in writing",
                            "Refunds processed within 5-7 business days",
                            "Weather conditions may affect garden visits",
                        ],
                    },
                ],
                other_policies: [],
            },
        ];

        // Patch treks array to use only valid indices for destinations and cities
        const safeTreks = treks.map((trek) => {
            let destIdx = destinations.findIndex(
                (d) => d.id === trek.destination_id
            );
            let cityIdx = cities.findIndex((c) => c.id === trek.city_id);
            // If out of bounds, use the last valid index
            if (destIdx === -1 || destIdx > 9)
                trek.destination_id = destinations[9].id;
            if (cityIdx === -1 || cityIdx > 9) trek.city_id = cities[9].id;
            return trek;
        });
        await Trek.bulkCreate(safeTreks);

        console.log("Treks seeded successfully!");

        // Display created treks count
        const createdTreks = await Trek.findAll();
        console.log(`Created ${createdTreks.length} treks`);

        // Show treks per vendor
        for (const vendor of vendors) {
            const vendorTreks = await Trek.findAll({
                where: { vendor_id: vendor.id },
            });
            if (vendorTreks.length > 0) {
                const companyInfo = vendor.company_info
                    ? JSON.parse(vendor.company_info)
                    : {};
                const companyName =
                    companyInfo.company_name || "Unknown Vendor";
                console.log(`${companyName}: ${vendorTreks.length} treks`);
            }
        }

        // Show treks by difficulty
        const difficulties = ["easy", "moderate", "difficult", "extreme"];
        for (const difficulty of difficulties) {
            const difficultyTreks = await Trek.findAll({
                where: { difficulty },
            });
            if (difficultyTreks.length > 0) {
                console.log(
                    `${
                        difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
                    }: ${difficultyTreks.length} treks`
                );
            }
        }
    } catch (error) {
        console.error("Error seeding treks:", error);
    }
};

module.exports = seedTreks;

// Run if called directly
if (require.main === module) {
    const sequelize = require("../config/config");

    seedTreks()
        .then(() => {
            process.exit(0);
        })
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
}
