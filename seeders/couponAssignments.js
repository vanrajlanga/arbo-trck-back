"use strict";

const { Coupon, CouponAssignment, Customer } = require("../models");

const seedCouponAssignments = async () => {
    try {
        // Check if coupon assignments already exist
        const existingAssignments = await CouponAssignment.findAll();
        if (existingAssignments.length > 0) {
            console.log("Coupon assignments already exist, skipping seed.");
            return;
        }

        // Get some customers and coupons for assignment
        const customers = await Customer.findAll({ limit: 5 });
        const coupons = await Coupon.findAll({ limit: 3 });

        if (customers.length === 0 || coupons.length === 0) {
            console.log(
                "Required data not found. Please run customers and coupons seeders first."
            );
            return;
        }

        const assignments = [
            {
                customer_id: customers[0].id,
                coupon_id: coupons[0].id, // WELCOME10
                assigned_date: "2024-01-15",
                expiry_date: "2024-12-31",
                status: "active",
                used_date: null,
                booking_id: null,
            },
            {
                customer_id: customers[1].id,
                coupon_id: coupons[1].id, // SUMMER20
                assigned_date: "2024-01-20",
                expiry_date: "2024-08-31",
                status: "active",
                used_date: null,
                booking_id: null,
            },
            {
                customer_id: customers[2].id,
                coupon_id: coupons[2].id, // FLAT1000
                assigned_date: "2024-01-25",
                expiry_date: "2024-06-30",
                status: "used",
                used_date: "2024-02-15",
                booking_id: 1, // Assuming booking ID 1 exists
            },
            {
                customer_id: customers[0].id,
                coupon_id: coupons[1].id, // SUMMER20
                assigned_date: "2024-02-01",
                expiry_date: "2024-08-31",
                status: "expired",
                used_date: null,
                booking_id: null,
            },
            {
                customer_id: customers[3].id,
                coupon_id: coupons[0].id, // WELCOME10
                assigned_date: "2024-02-05",
                expiry_date: "2024-12-31",
                status: "active",
                used_date: null,
                booking_id: null,
            },
        ];

        await CouponAssignment.bulkCreate(assignments);

        console.log("Coupon assignments seeded successfully!");

        // Display created assignments count
        const createdAssignments = await CouponAssignment.findAll();
        console.log(`Created ${createdAssignments.length} coupon assignments`);

        // Show assignment details
        console.log("\nCoupon Assignment Details:");
        for (const assignment of createdAssignments) {
            const customer = await Customer.findByPk(assignment.customer_id);
            const coupon = await Coupon.findByPk(assignment.coupon_id);
            console.log(
                `${customer.name} - ${coupon.title} (${coupon.code}): ${assignment.status}`
            );
        }
    } catch (error) {
        console.error("Error seeding coupon assignments:", error);
    }
};

module.exports = seedCouponAssignments;

// Run if called directly
if (require.main === module) {
    const sequelize = require("../config/config");

    seedCouponAssignments()
        .then(() => {
            process.exit(0);
        })
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
}
