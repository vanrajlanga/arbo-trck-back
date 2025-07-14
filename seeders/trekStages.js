"use strict";

const { TrekStage, Trek } = require("../models");

const seedTrekStages = async () => {
    try {
        // Check if trek stages already exist
        const existingStages = await TrekStage.findAll();
        if (existingStages.length > 0) {
            console.log("Trek stages already exist, skipping seed.");
            return;
        }

        // Get all treks
        const treks = await Trek.findAll();
        if (treks.length === 0) {
            console.log("No treks found. Please run treks seeder first.");
            return;
        }

        console.log(`Found ${treks.length} treks to create stages for`);

        const trekStages = [];

        // Create stages for each trek
        treks.forEach((trek) => {
            const trekId = trek.id;
            const trekTitle = trek.title;

            // Create different stages based on trek type and duration
            if (trekTitle.includes("Valley of Flowers")) {
                trekStages.push(
                    {
                        trek_id: trekId,
                        stage_name: "Arrival at Dehradun",
                        means_of_transport: "Train/Flight",
                        date_time: "Day 1 - 06:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Transfer to Base Camp",
                        means_of_transport: "Bus",
                        date_time: "Day 1 - 08:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Acclimatization Walk",
                        means_of_transport: "Walking",
                        date_time: "Day 1 - 02:00 PM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Trek to Ghangaria",
                        means_of_transport: "Walking",
                        date_time: "Day 2 - 07:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Valley of Flowers Exploration",
                        means_of_transport: "Walking",
                        date_time: "Day 3 - 06:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Hemkund Sahib Visit",
                        means_of_transport: "Walking",
                        date_time: "Day 4 - 05:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Return to Base Camp",
                        means_of_transport: "Walking",
                        date_time: "Day 5 - 07:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Return to Dehradun",
                        means_of_transport: "Bus",
                        date_time: "Day 6 - 08:00 AM",
                    }
                );
            } else if (trekTitle.includes("Kedarnath")) {
                trekStages.push(
                    {
                        trek_id: trekId,
                        stage_name: "Arrival at Haridwar",
                        means_of_transport: "Train",
                        date_time: "Day 1 - 07:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Transfer to Rishikesh",
                        means_of_transport: "Bus",
                        date_time: "Day 1 - 09:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Drive to Guptkashi",
                        means_of_transport: "Bus",
                        date_time: "Day 2 - 06:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Trek to Kedarnath Base",
                        means_of_transport: "Walking",
                        date_time: "Day 3 - 05:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Kedarnath Temple Darshan",
                        means_of_transport: "Walking",
                        date_time: "Day 4 - 04:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Exploration Day",
                        means_of_transport: "Walking",
                        date_time: "Day 5 - 06:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Return Trek",
                        means_of_transport: "Walking",
                        date_time: "Day 6 - 07:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Return to Haridwar",
                        means_of_transport: "Bus",
                        date_time: "Day 7 - 08:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Departure",
                        means_of_transport: "Train",
                        date_time: "Day 8 - 10:00 AM",
                    }
                );
            } else if (trekTitle.includes("Triund")) {
                trekStages.push(
                    {
                        trek_id: trekId,
                        stage_name: "Arrival at McLeod Ganj",
                        means_of_transport: "Bus",
                        date_time: "Day 1 - 08:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Trek to Triund",
                        means_of_transport: "Walking",
                        date_time: "Day 1 - 10:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Camping at Triund",
                        means_of_transport: "Walking",
                        date_time: "Day 1 - 04:00 PM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Sunrise View",
                        means_of_transport: "Walking",
                        date_time: "Day 2 - 05:30 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Return to McLeod Ganj",
                        means_of_transport: "Walking",
                        date_time: "Day 2 - 09:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Local Exploration",
                        means_of_transport: "Walking",
                        date_time: "Day 3 - 10:00 AM",
                    }
                );
            } else if (trekTitle.includes("Pangong Lake")) {
                trekStages.push(
                    {
                        trek_id: trekId,
                        stage_name: "Arrival at Leh",
                        means_of_transport: "Flight",
                        date_time: "Day 1 - 09:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Acclimatization",
                        means_of_transport: "Walking",
                        date_time: "Day 1 - 02:00 PM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Drive to Pangong Base",
                        means_of_transport: "Jeep",
                        date_time: "Day 2 - 07:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Lake Exploration",
                        means_of_transport: "Walking",
                        date_time: "Day 3 - 06:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Camping by Lake",
                        means_of_transport: "Walking",
                        date_time: "Day 3 - 04:00 PM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "High Altitude Trek",
                        means_of_transport: "Walking",
                        date_time: "Day 4 - 05:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Return to Leh",
                        means_of_transport: "Jeep",
                        date_time: "Day 5 - 08:00 AM",
                    }
                );
            } else if (trekTitle.includes("Khardungla Pass")) {
                trekStages.push(
                    {
                        trek_id: trekId,
                        stage_name: "Arrival at Leh",
                        means_of_transport: "Flight",
                        date_time: "Day 1 - 09:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Acclimatization Period",
                        means_of_transport: "Walking",
                        date_time: "Day 1-2 - Rest",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Drive to Khardungla Base",
                        means_of_transport: "Jeep",
                        date_time: "Day 3 - 06:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Pass Crossing",
                        means_of_transport: "Walking",
                        date_time: "Day 4 - 05:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Nubra Valley Exploration",
                        means_of_transport: "Walking",
                        date_time: "Day 5 - 07:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Return Journey",
                        means_of_transport: "Jeep",
                        date_time: "Day 6 - 08:00 AM",
                    }
                );
            } else if (trekTitle.includes("Yumthang Valley")) {
                trekStages.push(
                    {
                        trek_id: trekId,
                        stage_name: "Arrival at Gangtok",
                        means_of_transport: "Flight/Bus",
                        date_time: "Day 1 - 07:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Drive to Lachen",
                        means_of_transport: "Bus",
                        date_time: "Day 1 - 09:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Acclimatization",
                        means_of_transport: "Walking",
                        date_time: "Day 2 - 10:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Trek to Yumthang",
                        means_of_transport: "Walking",
                        date_time: "Day 3 - 06:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Valley Exploration",
                        means_of_transport: "Walking",
                        date_time: "Day 4 - 07:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Hot Spring Visit",
                        means_of_transport: "Walking",
                        date_time: "Day 5 - 08:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Return to Gangtok",
                        means_of_transport: "Bus",
                        date_time: "Day 6 - 09:00 AM",
                    }
                );
            } else if (trekTitle.includes("Rishikesh Adventure")) {
                trekStages.push(
                    {
                        trek_id: trekId,
                        stage_name: "Arrival at Rishikesh",
                        means_of_transport: "Train",
                        date_time: "Day 1 - 08:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "River Rafting",
                        means_of_transport: "Raft",
                        date_time: "Day 1 - 10:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Yoga Session",
                        means_of_transport: "Walking",
                        date_time: "Day 1 - 04:00 PM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Temple Visit",
                        means_of_transport: "Walking",
                        date_time: "Day 2 - 07:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Ganga Aarti",
                        means_of_transport: "Walking",
                        date_time: "Day 2 - 06:00 PM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Adventure Activities",
                        means_of_transport: "Various",
                        date_time: "Day 3 - 09:00 AM",
                    }
                );
            } else if (trekTitle.includes("Solang Valley")) {
                trekStages.push(
                    {
                        trek_id: trekId,
                        stage_name: "Arrival at Manali",
                        means_of_transport: "Bus",
                        date_time: "Day 1 - 08:30 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Transfer to Solang",
                        means_of_transport: "Bus",
                        date_time: "Day 1 - 10:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Paragliding",
                        means_of_transport: "Paraglider",
                        date_time: "Day 2 - 09:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Zorbing",
                        means_of_transport: "Zorb Ball",
                        date_time: "Day 2 - 02:00 PM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Trekking",
                        means_of_transport: "Walking",
                        date_time: "Day 3 - 07:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Local Culture",
                        means_of_transport: "Walking",
                        date_time: "Day 4 - 10:00 AM",
                    }
                );
            } else if (trekTitle.includes("Mysore Palace")) {
                trekStages.push(
                    {
                        trek_id: trekId,
                        stage_name: "Arrival at Mysore",
                        means_of_transport: "Train",
                        date_time: "Day 1 - 09:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Palace Visit",
                        means_of_transport: "Walking",
                        date_time: "Day 1 - 11:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Cultural Performance",
                        means_of_transport: "Walking",
                        date_time: "Day 1 - 07:00 PM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Chamundi Hills",
                        means_of_transport: "Bus",
                        date_time: "Day 2 - 08:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Local Cuisine",
                        means_of_transport: "Walking",
                        date_time: "Day 2 - 02:00 PM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Historical Tour",
                        means_of_transport: "Walking",
                        date_time: "Day 3 - 10:00 AM",
                    }
                );
            } else if (trekTitle.includes("Lonavala Caves")) {
                trekStages.push(
                    {
                        trek_id: trekId,
                        stage_name: "Arrival at Lonavala",
                        means_of_transport: "Train",
                        date_time: "Day 1 - 09:30 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Cave Exploration",
                        means_of_transport: "Walking",
                        date_time: "Day 1 - 11:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Historical Tour",
                        means_of_transport: "Walking",
                        date_time: "Day 1 - 03:00 PM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Nature Trails",
                        means_of_transport: "Walking",
                        date_time: "Day 2 - 07:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Local Food Tasting",
                        means_of_transport: "Walking",
                        date_time: "Day 2 - 12:00 PM",
                    }
                );
            } else if (trekTitle.includes("Munnar Tea Gardens")) {
                trekStages.push(
                    {
                        trek_id: trekId,
                        stage_name: "Arrival at Munnar",
                        means_of_transport: "Bus",
                        date_time: "Day 1 - 08:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Tea Garden Tour",
                        means_of_transport: "Walking",
                        date_time: "Day 1 - 10:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Tea Tasting",
                        means_of_transport: "Walking",
                        date_time: "Day 1 - 02:00 PM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Spice Garden Visit",
                        means_of_transport: "Walking",
                        date_time: "Day 2 - 09:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Nature Photography",
                        means_of_transport: "Walking",
                        date_time: "Day 2 - 04:00 PM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Local Culture",
                        means_of_transport: "Walking",
                        date_time: "Day 3 - 10:00 AM",
                    },
                    {
                        trek_id: trekId,
                        stage_name: "Western Ghats View",
                        means_of_transport: "Walking",
                        date_time: "Day 4 - 06:00 AM",
                    }
                );
            }
        });

        // Create trek stages
        await TrekStage.bulkCreate(trekStages);
        console.log("Trek stages seeded successfully!");

        // Display created stages count
        const createdStages = await TrekStage.findAll();
        console.log(`Created ${createdStages.length} trek stages`);

        // Show stages per trek
        for (const trek of treks) {
            const trekStagesCount = await TrekStage.count({
                where: { trek_id: trek.id },
            });
            console.log(`${trek.title}: ${trekStagesCount} stages`);
        }
    } catch (error) {
        console.error("Error seeding trek stages:", error);
    }
};

module.exports = seedTrekStages;

// Run if called directly
if (require.main === module) {
    const sequelize = require("../config/config");

    seedTrekStages()
        .then(() => {
            process.exit(0);
        })
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
}
