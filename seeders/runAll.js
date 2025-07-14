"use strict";

const seedRoles = require("./roles");
const seedAdmin = require("./admin");
const seedStates = require("./states");
const seedCities = require("./cities");
const seedDestinations = require("./destinations");
const seedVendors = require("./vendors");
const seedCustomers = require("./customers");
const seedTravelers = require("./travelers");
const seedTreks = require("./treks");
const seedTrekStages = require("./trekStages");
const seedBatches = require("./batches");
const seedBookings = require("./bookings");
const seedRatingCategories = require("./ratingCategories");
const seedReviews = require("./reviews");
const seedRatings = require("./ratings");
const seedCoupons = require("./coupons");
const seedCouponAssignments = require("./couponAssignments");
const seedPickupPoints = require("./pickupPoints");
const seedActivities = require("./activities");
const { seedBadges } = require("./badges");
const seedCancellationPolicies = require("./cancellationPolicies");

const runAllSeeders = async () => {
    try {
        console.log("🚀 Starting database seeding process...\n");

        // Step 1: Basic setup
        console.log("📋 Step 1: Setting up basic data...");
        await seedRoles();
        await seedAdmin();
        console.log("✅ Basic setup completed\n");

        // Step 2: Location data
        console.log("🗺️ Step 2: Setting up location data...");
        await seedStates();
        await seedCities();
        await seedDestinations();
        console.log("✅ Location data completed\n");

        // Step 3: User data
        console.log("👥 Step 3: Setting up user data...");
        await seedVendors();
        await seedCustomers();
        await seedTravelers();
        console.log("✅ User data completed\n");

        // Step 4: Trek data
        console.log("🏔️ Step 4: Setting up trek data...");
        await seedTreks();
        await seedTrekStages();
        await seedBatches();
        console.log("✅ Trek data completed\n");

        // Step 5: Booking and review data
        console.log("📚 Step 5: Setting up booking and review data...");
        await seedBookings();
        await seedRatingCategories();
        await seedReviews();
        await seedRatings();
        console.log("✅ Booking and review data completed\n");

        // Step 6: Additional data
        console.log("🎫 Step 6: Setting up additional data...");
        await seedCoupons();
        await seedCouponAssignments();
        await seedPickupPoints();
        await seedActivities();
        await seedBadges();
        await seedCancellationPolicies();
        console.log("✅ Additional data completed\n");

        console.log("🎉 All seeders completed successfully!");
        console.log("\n📊 Database Summary:");
        console.log("• Roles: admin, vendor, user");
        console.log("• Admin: admin@aorbo.com (admin123)");
        console.log("• Vendors: 5 vendors with login credentials");
        console.log("• Customers: 10 customers with login credentials");
        console.log("• States: 32 Indian states");
        console.log("• Cities: 31 major trekking cities");
        console.log("• Destinations: 42 trekking destinations");
        console.log("• Treks: 11 diverse trekking packages");
        console.log("• Trek Stages: 73 detailed trek stages");
        console.log("• Batches: Multiple batches per trek");
        console.log("• Bookings: Sample booking data");
        console.log("• Reviews: Sample review data");
        console.log(
            "• Ratings: Comprehensive ratings for all treks and customers"
        );
        console.log("• Coupons: 8 different discount coupons");
        console.log(
            "• Coupon Assignments: Sample coupon assignments to customers"
        );
        console.log("• Pickup Points: Multiple pickup points per city");
        console.log("• Activities: 15 different activity types");
        console.log("• Badges: 10 different badge types");
        console.log("• Cancellation Policies: 3 default policies");

        console.log("\n🔑 Login Credentials:");
        console.log("Admin: admin@aorbo.com / admin123");
        console.log("Vendors: himalayan@aorbo.com / vendor123");
        console.log("Customers: rahul@example.com / customer123");
    } catch (error) {
        console.error("❌ Error running seeders:", error);
        process.exit(1);
    }
};

// Run if called directly
if (require.main === module) {
    const sequelize = require("../config/config");

    runAllSeeders()
        .then(() => {
            console.log("\n✨ Database seeding completed!");
            process.exit(0);
        })
        .catch((err) => {
            console.error("❌ Seeding failed:", err);
            process.exit(1);
        });
}

module.exports = runAllSeeders;
