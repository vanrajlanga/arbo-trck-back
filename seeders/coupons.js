"use strict";

const { Coupon, CouponAssignment } = require("../models");

const seedCoupons = async () => {
    try {
        // Check if coupons already exist
        const existingCoupons = await Coupon.findAll();
        if (existingCoupons.length > 0) {
            console.log("Coupons already exist, skipping seed.");
            return;
        }

        const coupons = [
            {
                title: "Welcome Discount",
                color: "#10B981",
                code: "WELCOME10",
                description: "Get 10% off on your first booking",
                discount_type: "percentage",
                discount_value: 10.0,
                min_amount: 5000,
                max_discount_amount: 2000,
                valid_from: "2024-01-01",
                valid_until: "2024-12-31",
                max_uses: 1000,
                current_uses: 150,
                status: "active",
            },
            {
                title: "Summer Special",
                color: "#F59E0B",
                code: "SUMMER20",
                description: "20% off on summer treks",
                discount_type: "percentage",
                discount_value: 20.0,
                min_amount: 8000,
                max_discount_amount: 5000,
                valid_from: "2024-05-01",
                valid_until: "2024-08-31",
                max_uses: 500,
                current_uses: 75,
                status: "active",
            },
            {
                title: "Flat Discount",
                color: "#EF4444",
                code: "FLAT1000",
                description: "Flat ₹1000 off on bookings above ₹8000",
                discount_type: "fixed",
                discount_value: 1000.0,
                min_amount: 8000,
                max_discount_amount: 1000,
                valid_from: "2024-01-01",
                valid_until: "2024-06-30",
                max_uses: 200,
                current_uses: 45,
                status: "active",
            },
            {
                title: "Family Package",
                color: "#8B5CF6",
                code: "FAMILY15",
                description: "15% off for family bookings (4+ travelers)",
                discount_type: "percentage",
                discount_value: 15.0,
                min_amount: 15000,
                max_discount_amount: 3000,
                valid_from: "2024-01-01",
                valid_until: "2024-12-31",
                max_uses: 300,
                current_uses: 25,
                status: "active",
            },
            {
                title: "Weekend Special",
                color: "#06B6D4",
                code: "WEEKEND25",
                description: "25% off on weekend treks",
                discount_type: "percentage",
                discount_value: 25.0,
                min_amount: 6000,
                max_discount_amount: 4000,
                valid_from: "2024-02-01",
                valid_until: "2024-11-30",
                max_uses: 400,
                current_uses: 60,
                status: "active",
            },
            {
                title: "Loyalty Reward",
                color: "#84CC16",
                code: "LOYALTY500",
                description: "₹500 off for returning customers",
                discount_type: "fixed",
                discount_value: 500.0,
                min_amount: 3000,
                max_discount_amount: 500,
                valid_from: "2024-01-01",
                valid_until: "2024-12-31",
                max_uses: 1000,
                current_uses: 200,
                status: "active",
            },
            {
                title: "Mountain Adventure",
                color: "#6366F1",
                code: "MOUNTAIN30",
                description: "30% off on mountain treks",
                discount_type: "percentage",
                discount_value: 30.0,
                min_amount: 10000,
                max_discount_amount: 6000,
                valid_from: "2024-03-01",
                valid_until: "2024-10-31",
                max_uses: 200,
                current_uses: 30,
                status: "active",
            },
            {
                title: "First Time User",
                color: "#EC4899",
                code: "FIRST50",
                description: "50% off for first-time users (max ₹2000)",
                discount_type: "percentage",
                discount_value: 50.0,
                min_amount: 4000,
                max_discount_amount: 2000,
                valid_from: "2024-01-01",
                valid_until: "2024-12-31",
                max_uses: 500,
                current_uses: 120,
                status: "active",
            },
        ];

        await Coupon.bulkCreate(coupons);

        console.log("Coupons seeded successfully!");

        // Display created coupons count
        const createdCoupons = await Coupon.findAll();
        console.log(`Created ${createdCoupons.length} coupons`);

        // Show coupon details
        console.log("\nCoupon Codes:");
        for (const coupon of createdCoupons) {
            console.log(
                `${coupon.title} (${coupon.code}): ${coupon.description} - ${
                    coupon.discount_value
                }${coupon.discount_type === "percentage" ? "%" : "₹"} off`
            );
        }
    } catch (error) {
        console.error("Error seeding coupons:", error);
    }
};

module.exports = seedCoupons;

// Run if called directly
if (require.main === module) {
    const sequelize = require("../config/config");

    seedCoupons()
        .then(() => {
            process.exit(0);
        })
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
}
