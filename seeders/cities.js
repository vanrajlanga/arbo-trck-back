const { City } = require("../models");

const seedCities = async () => {
    try {
        console.log("🌆 Seeding cities...");

        const cities = [
            // Telangana
            {
                cityName: "Hyderabad",
                stateName: "Telangana",
                region: "South",
                status: "active",
                launchDate: new Date(),
                totalCustomers: 0,
                totalVendors: 0,
                totalBookings: 0,
                avgRating: 4.5,
                popularTreks: [],
            },
            {
                cityName: "Warangal",
                stateName: "Telangana",
                region: "South",
                status: "active",
                launchDate: new Date(),
                totalCustomers: 0,
                totalVendors: 0,
                totalBookings: 0,
                avgRating: 4.2,
                popularTreks: [],
            },
            {
                cityName: "Khammam",
                stateName: "Telangana",
                region: "South",
                status: "active",
                launchDate: new Date(),
                totalCustomers: 0,
                totalVendors: 0,
                totalBookings: 0,
                avgRating: 4.0,
                popularTreks: [],
            },

            // Andhra Pradesh
            {
                cityName: "Vijayawada",
                stateName: "Andhra Pradesh",
                region: "South",
                status: "active",
                launchDate: new Date(),
                totalCustomers: 0,
                totalVendors: 0,
                totalBookings: 0,
                avgRating: 4.3,
                popularTreks: [],
            },
            {
                cityName: "Visakhapatnam",
                stateName: "Andhra Pradesh",
                region: "South",
                status: "active",
                launchDate: new Date(),
                totalCustomers: 0,
                totalVendors: 0,
                totalBookings: 0,
                avgRating: 4.4,
                popularTreks: [],
            },
            {
                cityName: "Guntur",
                stateName: "Andhra Pradesh",
                region: "South",
                status: "active",
                launchDate: new Date(),
                totalCustomers: 0,
                totalVendors: 0,
                totalBookings: 0,
                avgRating: 4.1,
                popularTreks: [],
            },

            // Tamil Nadu
            {
                cityName: "Chennai",
                stateName: "Tamil Nadu",
                region: "South",
                status: "active",
                launchDate: new Date(),
                totalCustomers: 0,
                totalVendors: 0,
                totalBookings: 0,
                avgRating: 4.6,
                popularTreks: [],
            },
            {
                cityName: "Coimbatore",
                stateName: "Tamil Nadu",
                region: "South",
                status: "active",
                launchDate: new Date(),
                totalCustomers: 0,
                totalVendors: 0,
                totalBookings: 0,
                avgRating: 4.2,
                popularTreks: [],
            },
            {
                cityName: "Madurai",
                stateName: "Tamil Nadu",
                region: "South",
                status: "active",
                launchDate: new Date(),
                totalCustomers: 0,
                totalVendors: 0,
                totalBookings: 0,
                avgRating: 4.0,
                popularTreks: [],
            },

            // Karnataka
            {
                cityName: "Bangalore",
                stateName: "Karnataka",
                region: "South",
                status: "active",
                launchDate: new Date(),
                totalCustomers: 0,
                totalVendors: 0,
                totalBookings: 0,
                avgRating: 4.7,
                popularTreks: [],
            },
            {
                cityName: "Mysore",
                stateName: "Karnataka",
                region: "South",
                status: "active",
                launchDate: new Date(),
                totalCustomers: 0,
                totalVendors: 0,
                totalBookings: 0,
                avgRating: 4.3,
                popularTreks: [],
            },

            // Maharashtra
            {
                cityName: "Mumbai",
                stateName: "Maharashtra",
                region: "West",
                status: "active",
                launchDate: new Date(),
                totalCustomers: 0,
                totalVendors: 0,
                totalBookings: 0,
                avgRating: 4.8,
                popularTreks: [],
            },
            {
                cityName: "Pune",
                stateName: "Maharashtra",
                region: "West",
                status: "active",
                launchDate: new Date(),
                totalCustomers: 0,
                totalVendors: 0,
                totalBookings: 0,
                avgRating: 4.5,
                popularTreks: [],
            },
            {
                cityName: "Nagpur",
                stateName: "Maharashtra",
                region: "West",
                status: "active",
                launchDate: new Date(),
                totalCustomers: 0,
                totalVendors: 0,
                totalBookings: 0,
                avgRating: 4.1,
                popularTreks: [],
            },

            // Delhi
            {
                cityName: "New Delhi",
                stateName: "Delhi",
                region: "North",
                status: "active",
                launchDate: new Date(),
                totalCustomers: 0,
                totalVendors: 0,
                totalBookings: 0,
                avgRating: 4.6,
                popularTreks: [],
            },
            {
                cityName: "Gurgaon",
                stateName: "Haryana",
                region: "North",
                status: "active",
                launchDate: new Date(),
                totalCustomers: 0,
                totalVendors: 0,
                totalBookings: 0,
                avgRating: 4.4,
                popularTreks: [],
            },
        ];

        // Check if cities already exist
        const existingCities = await City.findAll();
        if (existingCities.length > 0) {
            console.log("✅ Cities already exist, skipping seeding");
            return;
        }

        // Create cities
        for (const cityData of cities) {
            await City.create(cityData);
        }

        console.log(`✅ Successfully seeded ${cities.length} cities`);
        console.log("📋 Sample cities created:");
        cities.forEach((city) => {
            console.log(`   - ${city.cityName}, ${city.stateName}`);
        });
    } catch (error) {
        console.error("❌ Error seeding cities:", error);
    }
};

module.exports = seedCities;

// Run if called directly
if (require.main === module) {
    seedCities()
        .then(() => {
            process.exit(0);
        })
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
}
