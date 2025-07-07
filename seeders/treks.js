"use strict";

const {
    Trek,
    Vendor,
    Destination,
    City,
    Batch,
    RatingCategory,
    Review,
    Rating,
    Customer,
} = require("../models");

const seedTreks = async () => {
    try {
        // Check if treks already exist
        const existingTreks = await Trek.findAll();
        if (existingTreks.length > 0) {
            console.log("Treks already exist, skipping seed.");
            return;
        }

        // Get all vendors, destinations, and cities to reference them properly
        const vendors = await Vendor.findAll();
        const destinations = await Destination.findAll();
        const cities = await City.findAll();
        const customers = await Customer.findAll();

        if (vendors.length === 0) {
            console.log("No vendors found. Please run vendor seeder first.");
            return;
        }

        if (customers.length === 0) {
            console.log(
                "No customers found. Please run customer seeder first."
            );
            return;
        }

        const vendorMap = {};
        vendors.forEach((vendor) => {
            vendorMap[vendor.id] = vendor.id;
        });

        const destinationMap = {};
        destinations.forEach((dest) => {
            destinationMap[dest.name] = dest.id;
        });

        const cityMap = {};
        cities.forEach((city) => {
            cityMap[city.cityName] = city.id;
        });

        const customerMap = {};
        customers.forEach((customer) => {
            customerMap[customer.id] = customer.id;
        });

        const treks = [
            // Uttarakhand Treks
            {
                title: "Valley of Flowers Trek",
                description:
                    "Experience the magical Valley of Flowers, a UNESCO World Heritage site with vibrant alpine flowers and stunning Himalayan views. This moderate trek takes you through beautiful meadows and offers breathtaking views of the surrounding peaks.",
                vendor_id: vendors[0].id,
                destination_id: destinationMap["Valley of Flowers"],
                city_id: cityMap["Dehradun"],
                duration: "6 Days / 5 Nights",
                duration_days: 6,
                duration_nights: 5,
                difficulty: "moderate",
                trek_type: "mountain",
                category: "Flower Valley Trek",
                base_price: 15999.0,
                meeting_point: "Dehradun Railway Station",
                meeting_time: "08:00 AM",
                inclusions: JSON.stringify([
                    "Accommodation in tents and guesthouses",
                    "All meals (breakfast, lunch, dinner)",
                    "Transport from Dehradun to base camp",
                    "Experienced trek guide",
                    "First aid kit",
                    "Permits and entry fees",
                ]),
                exclusions: JSON.stringify([
                    "Personal expenses",
                    "Travel insurance",
                    "Any additional food items",
                    "Tips for guides and porters",
                ]),
                status: "active",
                discount_value: 10.0,
                discount_type: "percentage",
                has_discount: true,
                cancellation_policies: JSON.stringify([
                    {
                        title: "Cancellation Policy",
                        description:
                            "Standard cancellation terms and conditions",
                        rules: [
                            { rule: "Full refund", deduction: "0%" },
                            { rule: "Partial refund", deduction: "50%" },
                            { rule: "No refund", deduction: "100%" },
                        ],
                        descriptionPoints: [
                            "Cancellation must be made in writing",
                            "Refunds processed within 5-7 business days",
                            "Force majeure events may affect cancellation terms",
                        ],
                    },
                ]),
                other_policies: JSON.stringify([]),
                activities: JSON.stringify([
                    {
                        day: 1,
                        activities: [
                            "Arrival at Dehradun",
                            "Briefing session",
                            "Equipment check",
                            "Acclimatization walk",
                        ],
                    },
                    {
                        day: 2,
                        activities: [
                            "Drive to Govindghat",
                            "Trek to Ghangaria",
                            "Camp setup",
                            "Evening briefing",
                        ],
                    },
                    {
                        day: 3,
                        activities: [
                            "Trek to Valley of Flowers",
                            "Flower photography",
                            "Nature walk",
                            "Return to camp",
                        ],
                    },
                ]),
            },
            {
                title: "Kedarnath Temple Trek",
                description:
                    "Embark on a spiritual journey to the sacred Kedarnath Temple, one of the Char Dham pilgrimage sites. This trek combines religious significance with natural beauty as you traverse through the Garhwal Himalayas.",
                vendor_id: vendors[0].id,
                destination_id: destinationMap["Kedarnath Temple"],
                city_id: cityMap["Dehradun"],
                duration: "5 Days / 4 Nights",
                duration_days: 5,
                duration_nights: 4,
                difficulty: "moderate",
                trek_type: "mountain",
                category: "Pilgrimage Trek",
                base_price: 12999.0,
                meeting_point: "Haridwar Bus Stand",
                meeting_time: "07:00 AM",
                inclusions: JSON.stringify([
                    "Accommodation in guesthouses",
                    "Vegetarian meals",
                    "Transport from Haridwar",
                    "Temple darshan arrangements",
                    "Experienced guide",
                    "Basic medical support",
                ]),
                exclusions: JSON.stringify([
                    "Personal expenses",
                    "Travel insurance",
                    "Additional food items",
                    "Donations at temple",
                ]),
                status: "active",
                discount_value: 0.0,
                discount_type: "percentage",
                has_discount: false,
                cancellation_policies: JSON.stringify([
                    {
                        title: "Cancellation Policy",
                        description:
                            "Standard cancellation terms and conditions",
                        rules: [
                            { rule: "Full refund", deduction: "0%" },
                            { rule: "Partial refund", deduction: "50%" },
                            { rule: "No refund", deduction: "100%" },
                        ],
                        descriptionPoints: [
                            "Cancellation must be made in writing",
                            "Refunds processed within 5-7 business days",
                            "Force majeure events may affect cancellation terms",
                        ],
                    },
                ]),
                other_policies: JSON.stringify([]),
                activities: JSON.stringify([
                    {
                        day: 1,
                        activities: [
                            "Arrival at Haridwar",
                            "Ganga Aarti",
                            "Briefing session",
                            "Equipment check",
                        ],
                    },
                    {
                        day: 2,
                        activities: [
                            "Drive to Gaurikund",
                            "Trek to Kedarnath",
                            "Temple visit",
                            "Evening prayers",
                        ],
                    },
                ]),
            },
            {
                title: "Rishikesh Adventure Trek",
                description:
                    "Combine trekking with adventure sports in the adventure capital of India. This trek includes river rafting, rock climbing, and jungle trekking along the banks of the holy Ganges.",
                vendor_id: vendors[0].id,
                destination_id: destinationMap["Rishikesh Adventure Hub"],
                city_id: cityMap["Rishikesh"],
                duration: "4 Days / 3 Nights",
                duration_days: 4,
                duration_nights: 3,
                difficulty: "easy",
                trek_type: "adventure",
                category: "Adventure Trek",
                base_price: 8999.0,
                meeting_point: "Rishikesh Railway Station",
                meeting_time: "09:00 AM",
                inclusions: JSON.stringify([
                    "River rafting experience",
                    "Rock climbing session",
                    "Jungle trekking",
                    "Accommodation in camps",
                    "All adventure equipment",
                    "Experienced instructors",
                ]),
                exclusions: JSON.stringify([
                    "Personal expenses",
                    "Travel insurance",
                    "Additional adventure activities",
                    "Tips for instructors",
                ]),
                status: "active",
                discount_value: 500.0,
                discount_type: "fixed",
                has_discount: true,
                cancellation_policies: JSON.stringify([
                    {
                        title: "Cancellation Policy",
                        description:
                            "Standard cancellation terms and conditions",
                        rules: [
                            { rule: "Full refund", deduction: "0%" },
                            { rule: "Partial refund", deduction: "50%" },
                            { rule: "No refund", deduction: "100%" },
                        ],
                        descriptionPoints: [
                            "Cancellation must be made in writing",
                            "Refunds processed within 5-7 business days",
                            "Force majeure events may affect cancellation terms",
                        ],
                    },
                ]),
                other_policies: JSON.stringify([]),
                activities: JSON.stringify([
                    {
                        day: 1,
                        activities: [
                            "Arrival at Rishikesh",
                            "Safety briefing",
                            "Equipment fitting",
                            "Evening meditation",
                        ],
                    },
                    {
                        day: 2,
                        activities: [
                            "River rafting",
                            "Rock climbing",
                            "Adventure training",
                            "Campfire dinner",
                        ],
                    },
                ]),
            },

            // Himachal Pradesh Treks
            {
                title: "Solang Valley Trek",
                description:
                    "Explore the beautiful Solang Valley with its stunning landscapes and adventure activities. This trek offers a perfect blend of natural beauty and adventure sports in the heart of Himachal Pradesh.",
                vendor_id: vendors[0].id,
                destination_id: destinationMap["Solang Valley"],
                city_id: cityMap["Manali"],
                duration: "5 Days / 4 Nights",
                duration_days: 5,
                duration_nights: 4,
                difficulty: "easy",
                trek_type: "hill-station",
                category: "Valley Trek",
                base_price: 11999.0,
                meeting_point: "Manali Bus Stand",
                meeting_time: "08:30 AM",
                inclusions: JSON.stringify([
                    "Accommodation in hotels and camps",
                    "All meals",
                    "Transport from Manali",
                    "Adventure activities",
                    "Experienced guide",
                    "Safety equipment",
                ]),
                exclusions: JSON.stringify([
                    "Personal expenses",
                    "Travel insurance",
                    "Additional activities",
                    "Tips for guides",
                ]),
                status: "active",
                discount_value: 15.0,
                discount_type: "percentage",
                has_discount: true,
                cancellation_policies: JSON.stringify([
                    {
                        title: "Cancellation Policy",
                        description:
                            "Standard cancellation terms and conditions",
                        rules: [
                            { rule: "Full refund", deduction: "0%" },
                            { rule: "Partial refund", deduction: "50%" },
                            { rule: "No refund", deduction: "100%" },
                        ],
                        descriptionPoints: [
                            "Cancellation must be made in writing",
                            "Refunds processed within 5-7 business days",
                            "Force majeure events may affect cancellation terms",
                        ],
                    },
                ]),
                other_policies: JSON.stringify([]),
                activities: JSON.stringify([
                    {
                        day: 1,
                        activities: [
                            "Arrival at Manali",
                            "Local sightseeing",
                            "Equipment briefing",
                            "Acclimatization",
                        ],
                    },
                    {
                        day: 2,
                        activities: [
                            "Drive to Solang Valley",
                            "Adventure activities",
                            "Mountain biking",
                            "Camp setup",
                        ],
                    },
                ]),
            },
            {
                title: "Triund Trek",
                description:
                    "A popular trek near Dharamshala offering panoramic views of the Dhauladhar range. This moderate trek is perfect for beginners and offers stunning sunset views from the top.",
                vendor_id: vendors[0].id,
                destination_id: destinationMap["Triund Trek"],
                city_id: cityMap["Dharamshala"],
                duration: "3 Days / 2 Nights",
                duration_days: 3,
                duration_nights: 2,
                difficulty: "moderate",
                trek_type: "mountain",
                category: "Mountain Trek",
                base_price: 6999.0,
                meeting_point: "McLeod Ganj Bus Stand",
                meeting_time: "09:00 AM",
                inclusions: JSON.stringify([
                    "Accommodation in tents",
                    "All meals",
                    "Transport from Dharamshala",
                    "Experienced guide",
                    "Camping equipment",
                    "First aid support",
                ]),
                exclusions: JSON.stringify([
                    "Personal expenses",
                    "Travel insurance",
                    "Additional food items",
                    "Tips for guides",
                ]),
                status: "active",
                discount_value: 0.0,
                discount_type: "percentage",
                has_discount: false,
                cancellation_policies: JSON.stringify([
                    {
                        title: "Cancellation Policy",
                        description:
                            "Standard cancellation terms and conditions",
                        rules: [
                            { rule: "Full refund", deduction: "0%" },
                            { rule: "Partial refund", deduction: "50%" },
                            { rule: "No refund", deduction: "100%" },
                        ],
                        descriptionPoints: [
                            "Cancellation must be made in writing",
                            "Refunds processed within 5-7 business days",
                            "Force majeure events may affect cancellation terms",
                        ],
                    },
                ]),
                other_policies: JSON.stringify([]),
                activities: JSON.stringify([
                    {
                        day: 1,
                        activities: [
                            "Arrival at McLeod Ganj",
                            "Briefing session",
                            "Equipment check",
                            "Local exploration",
                        ],
                    },
                    {
                        day: 2,
                        activities: [
                            "Trek to Triund",
                            "Sunset viewing",
                            "Camping experience",
                            "Stargazing",
                        ],
                    },
                ]),
            },

            // Ladakh Treks
            {
                title: "Pangong Lake Trek",
                description:
                    "Experience the magical Pangong Lake with its changing colors and stunning mountain backdrop. This high-altitude trek offers breathtaking views of the Ladakh landscape.",
                vendor_id: vendors[0].id,
                destination_id: destinationMap["Pangong Lake"],
                city_id: cityMap["Leh"],
                duration: "7 Days / 6 Nights",
                duration_days: 7,
                duration_nights: 6,
                difficulty: "difficult",
                trek_type: "mountain",
                category: "High Altitude Trek",
                base_price: 24999.0,
                meeting_point: "Leh Airport",
                meeting_time: "10:00 AM",
                inclusions: JSON.stringify([
                    "Accommodation in camps and guesthouses",
                    "All meals",
                    "Transport from Leh",
                    "Oxygen support",
                    "Experienced high-altitude guide",
                    "Medical support",
                ]),
                exclusions: JSON.stringify([
                    "Flight tickets",
                    "Personal expenses",
                    "Travel insurance",
                    "Additional medical expenses",
                ]),
                status: "active",
                discount_value: 0.0,
                discount_type: "percentage",
                has_discount: false,
                cancellation_policies: JSON.stringify([
                    {
                        title: "Cancellation Policy",
                        description:
                            "Standard cancellation terms and conditions",
                        rules: [
                            { rule: "Full refund", deduction: "0%" },
                            { rule: "Partial refund", deduction: "50%" },
                            { rule: "No refund", deduction: "100%" },
                        ],
                        descriptionPoints: [
                            "Cancellation must be made in writing",
                            "Refunds processed within 5-7 business days",
                            "Force majeure events may affect cancellation terms",
                        ],
                    },
                ]),
                other_policies: JSON.stringify([]),
                activities: JSON.stringify([
                    {
                        day: 1,
                        activities: [
                            "Arrival at Leh",
                            "Acclimatization",
                            "Medical checkup",
                            "Briefing session",
                        ],
                    },
                    {
                        day: 2,
                        activities: [
                            "Drive to Pangong",
                            "Lake exploration",
                            "Photography session",
                            "Camp setup",
                        ],
                    },
                ]),
            },
            {
                title: "Khardungla Pass Trek",
                description:
                    "Trek to the world's highest motorable pass at 18,380 feet. This extreme trek offers unparalleled views of the Karakoram and Ladakh ranges.",
                vendor_id: vendors[0].id,
                destination_id: destinationMap["Khardungla Pass"],
                city_id: cityMap["Leh"],
                duration: "8 Days / 7 Nights",
                duration_days: 8,
                duration_nights: 7,
                difficulty: "extreme",
                trek_type: "mountain",
                category: "Extreme Trek",
                base_price: 29999.0,
                meeting_point: "Leh Airport",
                meeting_time: "09:00 AM",
                inclusions: JSON.stringify([
                    "Accommodation in camps",
                    "All meals",
                    "Transport from Leh",
                    "Oxygen cylinders",
                    "Experienced extreme trek guide",
                    "Full medical support",
                ]),
                exclusions: JSON.stringify([
                    "Flight tickets",
                    "Personal expenses",
                    "Travel insurance",
                    "Additional medical expenses",
                ]),
                status: "active",
                discount_value: 0.0,
                discount_type: "percentage",
                has_discount: false,
                cancellation_policies: JSON.stringify([
                    {
                        title: "Cancellation Policy",
                        description:
                            "Standard cancellation terms and conditions",
                        rules: [
                            { rule: "Full refund", deduction: "0%" },
                            { rule: "Partial refund", deduction: "50%" },
                            { rule: "No refund", deduction: "100%" },
                        ],
                        descriptionPoints: [
                            "Cancellation must be made in writing",
                            "Refunds processed within 5-7 business days",
                            "Force majeure events may affect cancellation terms",
                        ],
                    },
                ]),
                other_policies: JSON.stringify([]),
                activities: JSON.stringify([
                    {
                        day: 1,
                        activities: [
                            "Arrival at Leh",
                            "Medical assessment",
                            "Equipment check",
                            "Acclimatization",
                        ],
                    },
                    {
                        day: 2,
                        activities: [
                            "Drive to Khardungla",
                            "Altitude training",
                            "Safety briefing",
                            "Camp preparation",
                        ],
                    },
                ]),
            },

            // Sikkim Treks
            {
                title: "Yumthang Valley Trek",
                description:
                    "Explore the Valley of Flowers in North Sikkim with its rhododendron forests and hot springs. This trek offers a unique blend of natural beauty and cultural experiences.",
                vendor_id: vendors[0].id,
                destination_id: destinationMap["Yumthang Valley"],
                city_id: cityMap["Lachung"],
                duration: "6 Days / 5 Nights",
                duration_days: 6,
                duration_nights: 5,
                difficulty: "moderate",
                trek_type: "mountain",
                category: "Valley Trek",
                base_price: 18999.0,
                meeting_point: "Gangtok Bus Stand",
                meeting_time: "08:00 AM",
                inclusions: JSON.stringify([
                    "Accommodation in guesthouses",
                    "All meals",
                    "Transport from Gangtok",
                    "Permits for North Sikkim",
                    "Experienced guide",
                    "Medical support",
                ]),
                exclusions: JSON.stringify([
                    "Personal expenses",
                    "Travel insurance",
                    "Additional food items",
                    "Tips for guides",
                ]),
                status: "active",
                discount_value: 0.0,
                discount_type: "percentage",
                has_discount: false,
                cancellation_policies: JSON.stringify([
                    {
                        title: "Cancellation Policy",
                        description:
                            "Standard cancellation terms and conditions",
                        rules: [
                            { rule: "Full refund", deduction: "0%" },
                            { rule: "Partial refund", deduction: "50%" },
                            { rule: "No refund", deduction: "100%" },
                        ],
                        descriptionPoints: [
                            "Cancellation must be made in writing",
                            "Refunds processed within 5-7 business days",
                            "Force majeure events may affect cancellation terms",
                        ],
                    },
                ]),
                other_policies: JSON.stringify([]),
                activities: JSON.stringify([
                    {
                        day: 1,
                        activities: [
                            "Arrival at Gangtok",
                            "Permit processing",
                            "Briefing session",
                            "Local exploration",
                        ],
                    },
                    {
                        day: 2,
                        activities: [
                            "Drive to Lachung",
                            "Valley exploration",
                            "Hot spring visit",
                            "Cultural experience",
                        ],
                    },
                ]),
            },

            // Maharashtra Treks
            {
                title: "Lonavala Caves Trek",
                description:
                    "Explore the ancient Buddhist caves of Lonavala while trekking through the Western Ghats. This easy trek combines history, culture, and natural beauty.",
                vendor_id: vendors[0].id,
                destination_id: destinationMap["Lonavala Caves"],
                city_id: cityMap["Lonavala"],
                duration: "2 Days / 1 Night",
                duration_days: 2,
                duration_nights: 1,
                difficulty: "easy",
                trek_type: "forest",
                category: "Cave Trek",
                base_price: 4999.0,
                meeting_point: "Lonavala Railway Station",
                meeting_time: "10:00 AM",
                inclusions: JSON.stringify([
                    "Accommodation in guesthouse",
                    "All meals",
                    "Transport from station",
                    "Cave exploration guide",
                    "Safety equipment",
                    "Historical information",
                ]),
                exclusions: JSON.stringify([
                    "Personal expenses",
                    "Travel insurance",
                    "Additional food items",
                    "Tips for guides",
                ]),
                status: "active",
                discount_value: 0.0,
                discount_type: "percentage",
                has_discount: false,
                cancellation_policies: JSON.stringify([
                    {
                        title: "Cancellation Policy",
                        description:
                            "Standard cancellation terms and conditions",
                        rules: [
                            { rule: "Full refund", deduction: "0%" },
                            { rule: "Partial refund", deduction: "50%" },
                            { rule: "No refund", deduction: "100%" },
                        ],
                        descriptionPoints: [
                            "Cancellation must be made in writing",
                            "Refunds processed within 5-7 business days",
                            "Force majeure events may affect cancellation terms",
                        ],
                    },
                ]),
                other_policies: JSON.stringify([]),
                activities: JSON.stringify([
                    {
                        day: 1,
                        activities: [
                            "Arrival at Lonavala",
                            "Cave exploration",
                            "Historical tour",
                            "Local cuisine",
                        ],
                    },
                ]),
            },

            // Karnataka Treks
            {
                title: "Mysore Palace Trek",
                description:
                    "A cultural trek exploring the magnificent Mysore Palace and surrounding heritage sites. This easy trek focuses on history and architecture rather than physical challenge.",
                vendor_id: vendors[0].id,
                destination_id: destinationMap["Mysore Palace"],
                city_id: cityMap["Mysore"],
                duration: "3 Days / 2 Nights",
                duration_days: 3,
                duration_nights: 2,
                difficulty: "easy",
                trek_type: "hill-station",
                category: "Cultural Trek",
                base_price: 7999.0,
                meeting_point: "Mysore Railway Station",
                meeting_time: "09:00 AM",
                inclusions: JSON.stringify([
                    "Accommodation in heritage hotel",
                    "All meals",
                    "Palace entry fees",
                    "Cultural guide",
                    "Transport within city",
                    "Historical information",
                ]),
                exclusions: JSON.stringify([
                    "Personal expenses",
                    "Travel insurance",
                    "Additional food items",
                    "Tips for guides",
                ]),
                status: "active",
                discount_value: 0.0,
                discount_type: "percentage",
                has_discount: false,
                cancellation_policies: JSON.stringify([
                    {
                        title: "Cancellation Policy",
                        description:
                            "Standard cancellation terms and conditions",
                        rules: [
                            { rule: "Full refund", deduction: "0%" },
                            { rule: "Partial refund", deduction: "50%" },
                            { rule: "No refund", deduction: "100%" },
                        ],
                        descriptionPoints: [
                            "Cancellation must be made in writing",
                            "Refunds processed within 5-7 business days",
                            "Force majeure events may affect cancellation terms",
                        ],
                    },
                ]),
                other_policies: JSON.stringify([]),
                activities: JSON.stringify([
                    {
                        day: 1,
                        activities: [
                            "Arrival at Mysore",
                            "Palace visit",
                            "Cultural tour",
                            "Evening light show",
                        ],
                    },
                    {
                        day: 2,
                        activities: [
                            "Heritage walk",
                            "Local market visit",
                            "Traditional dance",
                            "Cultural workshop",
                        ],
                    },
                ]),
            },

            // Kerala Treks
            {
                title: "Munnar Tea Gardens Trek",
                description:
                    "Trek through the rolling tea plantations of Munnar with their emerald green landscapes. This easy trek offers stunning views and insights into tea cultivation.",
                vendor_id: vendors[0].id,
                destination_id: destinationMap["Munnar Tea Gardens"],
                city_id: cityMap["Munnar"],
                duration: "4 Days / 3 Nights",
                duration_days: 4,
                duration_nights: 3,
                difficulty: "easy",
                trek_type: "hill-station",
                category: "Tea Garden Trek",
                base_price: 9999.0,
                meeting_point: "Munnar Bus Stand",
                meeting_time: "08:30 AM",
                inclusions: JSON.stringify([
                    "Accommodation in tea estate",
                    "All meals",
                    "Tea plantation tour",
                    "Experienced guide",
                    "Transport within Munnar",
                    "Tea tasting session",
                ]),
                exclusions: JSON.stringify([
                    "Personal expenses",
                    "Travel insurance",
                    "Additional food items",
                    "Tips for guides",
                ]),
                status: "active",
                discount_value: 0.0,
                discount_type: "percentage",
                has_discount: false,
                cancellation_policies: JSON.stringify([
                    {
                        title: "Cancellation Policy",
                        description:
                            "Standard cancellation terms and conditions",
                        rules: [
                            { rule: "Full refund", deduction: "0%" },
                            { rule: "Partial refund", deduction: "50%" },
                            { rule: "No refund", deduction: "100%" },
                        ],
                        descriptionPoints: [
                            "Cancellation must be made in writing",
                            "Refunds processed within 5-7 business days",
                            "Force majeure events may affect cancellation terms",
                        ],
                    },
                ]),
                other_policies: JSON.stringify([]),
                activities: JSON.stringify([
                    {
                        day: 1,
                        activities: [
                            "Arrival at Munnar",
                            "Tea estate tour",
                            "Plantation walk",
                            "Tea tasting",
                        ],
                    },
                    {
                        day: 2,
                        activities: [
                            "Tea processing visit",
                            "Garden trekking",
                            "Local culture",
                            "Sunset viewing",
                        ],
                    },
                ]),
            },
        ];

        await Trek.bulkCreate(treks);
        console.log("Treks seeded successfully!");

        // Create batches for each trek
        const createdTreks = await Trek.findAll();
        const batchData = [];

        // Valley of Flowers Trek batches
        const valleyTrek = createdTreks.find(
            (t) => t.title === "Valley of Flowers Trek"
        );
        if (valleyTrek) {
            batchData.push(
                {
                    trek_id: valleyTrek.id,
                    start_date: "2025-08-15",
                    end_date: "2025-08-20",
                    capacity: 15,
                },
                {
                    trek_id: valleyTrek.id,
                    start_date: "2025-09-10",
                    end_date: "2025-09-15",
                    capacity: 15,
                },
                {
                    trek_id: valleyTrek.id,
                    start_date: "2025-10-05",
                    end_date: "2025-10-10",
                    capacity: 15,
                }
            );
        }

        // Kedarnath Temple Trek batches
        const kedarnathTrek = createdTreks.find(
            (t) => t.title === "Kedarnath Temple Trek"
        );
        if (kedarnathTrek) {
            batchData.push(
                {
                    trek_id: kedarnathTrek.id,
                    start_date: "2025-09-10",
                    end_date: "2025-09-14",
                    capacity: 20,
                },
                {
                    trek_id: kedarnathTrek.id,
                    start_date: "2025-10-15",
                    end_date: "2025-10-19",
                    capacity: 20,
                }
            );
        }

        // Rishikesh Adventure Trek batches
        const rishikeshTrek = createdTreks.find(
            (t) => t.title === "Rishikesh Adventure Trek"
        );
        if (rishikeshTrek) {
            batchData.push(
                {
                    trek_id: rishikeshTrek.id,
                    start_date: "2025-07-20",
                    end_date: "2025-07-23",
                    capacity: 12,
                },
                {
                    trek_id: rishikeshTrek.id,
                    start_date: "2025-08-15",
                    end_date: "2025-08-18",
                    capacity: 12,
                },
                {
                    trek_id: rishikeshTrek.id,
                    start_date: "2025-09-10",
                    end_date: "2025-09-13",
                    capacity: 12,
                }
            );
        }

        // Solang Valley Trek batches
        const solangTrek = createdTreks.find(
            (t) => t.title === "Solang Valley Trek"
        );
        if (solangTrek) {
            batchData.push(
                {
                    trek_id: solangTrek.id,
                    start_date: "2025-08-05",
                    end_date: "2025-08-09",
                    capacity: 18,
                },
                {
                    trek_id: solangTrek.id,
                    start_date: "2025-09-20",
                    end_date: "2025-09-24",
                    capacity: 18,
                }
            );
        }

        // Triund Trek batches
        const triundTrek = createdTreks.find((t) => t.title === "Triund Trek");
        if (triundTrek) {
            batchData.push(
                {
                    trek_id: triundTrek.id,
                    start_date: "2025-09-15",
                    end_date: "2025-09-17",
                    capacity: 15,
                },
                {
                    trek_id: triundTrek.id,
                    start_date: "2025-10-10",
                    end_date: "2025-10-12",
                    capacity: 15,
                }
            );
        }

        // Pangong Lake Trek batches
        const pangongTrek = createdTreks.find(
            (t) => t.title === "Pangong Lake Trek"
        );
        if (pangongTrek) {
            batchData.push(
                {
                    trek_id: pangongTrek.id,
                    start_date: "2025-07-25",
                    end_date: "2025-07-31",
                    capacity: 10,
                },
                {
                    trek_id: pangongTrek.id,
                    start_date: "2025-08-20",
                    end_date: "2025-08-26",
                    capacity: 10,
                }
            );
        }

        // Khardungla Pass Trek batches
        const khardunglaTrek = createdTreks.find(
            (t) => t.title === "Khardungla Pass Trek"
        );
        if (khardunglaTrek) {
            batchData.push(
                {
                    trek_id: khardunglaTrek.id,
                    start_date: "2025-08-10",
                    end_date: "2025-08-17",
                    capacity: 8,
                },
                {
                    trek_id: khardunglaTrek.id,
                    start_date: "2025-09-05",
                    end_date: "2025-09-12",
                    capacity: 8,
                }
            );
        }

        // Yumthang Valley Trek batches
        const yumthangTrek = createdTreks.find(
            (t) => t.title === "Yumthang Valley Trek"
        );
        if (yumthangTrek) {
            batchData.push(
                {
                    trek_id: yumthangTrek.id,
                    start_date: "2025-05-20",
                    end_date: "2025-05-25",
                    capacity: 12,
                },
                {
                    trek_id: yumthangTrek.id,
                    start_date: "2025-06-15",
                    end_date: "2025-06-20",
                    capacity: 12,
                }
            );
        }

        // Lonavala Caves Trek batches
        const lonavalaTrek = createdTreks.find(
            (t) => t.title === "Lonavala Caves Trek"
        );
        if (lonavalaTrek) {
            batchData.push(
                {
                    trek_id: lonavalaTrek.id,
                    start_date: "2025-10-15",
                    end_date: "2025-10-16",
                    capacity: 25,
                },
                {
                    trek_id: lonavalaTrek.id,
                    start_date: "2025-11-20",
                    end_date: "2025-11-21",
                    capacity: 25,
                }
            );
        }

        // Mysore Palace Trek batches
        const mysoreTrek = createdTreks.find(
            (t) => t.title === "Mysore Palace Trek"
        );
        if (mysoreTrek) {
            batchData.push(
                {
                    trek_id: mysoreTrek.id,
                    start_date: "2025-11-10",
                    end_date: "2025-11-12",
                    capacity: 20,
                },
                {
                    trek_id: mysoreTrek.id,
                    start_date: "2025-12-15",
                    end_date: "2025-12-17",
                    capacity: 20,
                }
            );
        }

        // Munnar Tea Gardens Trek batches
        const munnarTrek = createdTreks.find(
            (t) => t.title === "Munnar Tea Gardens Trek"
        );
        if (munnarTrek) {
            batchData.push(
                {
                    trek_id: munnarTrek.id,
                    start_date: "2025-12-05",
                    end_date: "2025-12-08",
                    capacity: 18,
                },
                {
                    trek_id: munnarTrek.id,
                    start_date: "2026-01-10",
                    end_date: "2026-01-13",
                    capacity: 18,
                }
            );
        }

        // Create batches
        if (batchData.length > 0) {
            await Batch.bulkCreate(batchData);
            console.log(`Created ${batchData.length} batches`);
        }

        // Get or create rating categories
        const ratingCategories = [
            {
                name: "Safety and Security",
                description: "How safe and secure the trek experience was",
                is_active: true,
                sort_order: 1,
            },
            {
                name: "Organizer Manner",
                description: "Professionalism and behavior of trek organizers",
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
                description: "Safety measures specifically for women trekkers",
                is_active: true,
                sort_order: 4,
            },
        ];

        // Use findOrCreate to avoid duplicate entries
        for (const category of ratingCategories) {
            await RatingCategory.findOrCreate({
                where: { name: category.name },
                defaults: category,
            });
        }
        console.log(
            `Ensured ${ratingCategories.length} rating categories exist`
        );

        // Create sample reviews and ratings for some treks
        const sampleReviews = [];
        const sampleRatings = [];

        // Get rating categories for creating sample ratings
        const createdRatingCategories = await RatingCategory.findAll();

        // Create sample reviews and ratings for Valley of Flowers Trek
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

        // Display created treks count
        console.log(`Created ${createdTreks.length} treks`);
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
