"use strict";

const {
    Booking,
    Customer,
    Trek,
    Batch,
    Traveler,
    BookingTraveler,
} = require("../models");

const seedBookings = async () => {
    try {
        // Check if required data exists
        const customers = await Customer.findAll({ limit: 3 });
        const treks = await Trek.findAll({ limit: 3 });
        const batches = await Batch.findAll({ limit: 5 });
        const travelers = await Traveler.findAll({ limit: 10 });

        if (
            customers.length === 0 ||
            treks.length === 0 ||
            batches.length === 0 ||
            travelers.length === 0
        ) {
            console.log(
                "Required data not found. Please run customers, treks, batches, and travelers seeders first."
            );
            return;
        }

        // Check if bookings already exist
        const existingBookings = await Booking.findAll();
        if (existingBookings.length > 0) {
            console.log("Bookings already exist, skipping seed.");
            return;
        }

        const bookings = [
            {
                customer_id: customers[0].id,
                trek_id: treks[0].id,
                batch_id: batches[0].id,
                vendor_id: treks[0].vendor_id,
                booking_date: "2024-01-15",
                total_travelers: 2,
                total_amount: 9998,
                discount_amount: 999,
                final_amount: 8999,
                status: "confirmed",
                payment_status: "completed",
                booking_source: "web",
                special_requests: "Vegetarian meals preferred",
                primary_contact_traveler_id: travelers[0].id,
                travelers: [travelers[0].id, travelers[1].id],
            },
            {
                customer_id: customers[1].id,
                trek_id: treks[1].id,
                batch_id: batches[1].id,
                vendor_id: treks[1].vendor_id,
                booking_date: "2024-01-20",
                total_travelers: 3,
                total_amount: 23997,
                discount_amount: 0,
                final_amount: 23997,
                status: "confirmed",
                payment_status: "completed",
                booking_source: "mobile",
                special_requests: "Early morning pickup requested",
                primary_contact_traveler_id: travelers[3].id,
                travelers: [travelers[3].id, travelers[4].id, travelers[5].id],
            },
            {
                customer_id: customers[2].id,
                trek_id: treks[2].id,
                batch_id: batches[2].id,
                vendor_id: treks[2].vendor_id,
                booking_date: "2024-01-25",
                total_travelers: 1,
                total_amount: 5999,
                discount_amount: 599,
                final_amount: 5400,
                status: "pending",
                payment_status: "pending",
                booking_source: "web",
                special_requests: null,
                primary_contact_traveler_id: travelers[6].id,
                travelers: [travelers[6].id],
            },
            {
                customer_id: customers[0].id,
                trek_id: treks[1].id,
                batch_id: batches[3].id,
                vendor_id: treks[1].vendor_id,
                booking_date: "2024-02-01",
                total_travelers: 2,
                total_amount: 15998,
                discount_amount: 1599,
                final_amount: 14399,
                status: "confirmed",
                payment_status: "completed",
                booking_source: "web",
                special_requests: "Room with mountain view if possible",
                primary_contact_traveler_id: travelers[0].id,
                travelers: [travelers[0].id, travelers[2].id],
            },
            {
                customer_id: customers[1].id,
                trek_id: treks[0].id,
                batch_id: batches[4].id,
                vendor_id: treks[0].vendor_id,
                booking_date: "2024-02-05",
                total_travelers: 4,
                total_amount: 19996,
                discount_amount: 1999,
                final_amount: 17997,
                status: "cancelled",
                payment_status: "refunded",
                booking_source: "mobile",
                special_requests: "Family booking with children",
                primary_contact_traveler_id: travelers[3].id,
                travelers: [
                    travelers[3].id,
                    travelers[4].id,
                    travelers[5].id,
                    travelers[7].id,
                ],
            },
        ];

        for (const bookingData of bookings) {
            // Extract travelers before creating booking
            const travelerIds = bookingData.travelers;
            delete bookingData.travelers;

            // Create booking
            const booking = await Booking.create(bookingData);

            // Create booking-traveler associations
            const bookingTravelers = travelerIds.map((travelerId, index) => ({
                booking_id: booking.id,
                traveler_id: travelerId,
                is_primary: index === 0, // First traveler is primary
                status: "confirmed",
            }));

            await BookingTraveler.bulkCreate(bookingTravelers);
        }

        console.log("Bookings seeded successfully!");

        // Display created bookings count
        const createdBookings = await Booking.findAll();
        console.log(`Created ${createdBookings.length} bookings`);

        // Show bookings per customer
        for (const customer of customers) {
            const customerBookings = await Booking.findAll({
                where: { customer_id: customer.id },
            });
            console.log(
                `${customer.name}: ${customerBookings.length} bookings`
            );
        }
    } catch (error) {
        console.error("Error seeding bookings:", error);
    }
};

module.exports = seedBookings;

// Run if called directly
if (require.main === module) {
    const sequelize = require("../config/config");

    seedBookings()
        .then(() => {
            process.exit(0);
        })
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
}
