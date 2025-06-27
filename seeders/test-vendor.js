const { User, Role, Vendor, Trek, Booking, PaymentLog } = require("../models");
const bcrypt = require("bcrypt");

const seedTestVendor = async () => {
    try {
        // Get vendor role
        const vendorRole = await Role.findOne({ where: { name: "vendor" } });
        const userRole = await Role.findOne({ where: { name: "user" } });

        if (!vendorRole || !userRole) {
            console.log(
                "Required roles not found. Please run roles seeder first."
            );
            return;
        }

        // Create test vendor user
        const existingVendor = await User.findOne({
            where: { email: "vendor@test.com" },
        });

        let vendorUser;
        if (!existingVendor) {
            const passwordHash = await bcrypt.hash("vendor123", 10);
            vendorUser = await User.create({
                name: "Test Vendor",
                email: "vendor@test.com",
                phone: "+91 8888888888",
                passwordHash,
                roleId: vendorRole.id,
            });
            console.log("Test vendor user created!");
        } else {
            vendorUser = existingVendor;
            console.log("Test vendor user already exists.");
        }

        // Create vendor profile
        const existingVendorProfile = await Vendor.findOne({
            where: { user_id: vendorUser.id },
        });

        let vendor;
        if (!existingVendorProfile) {
            vendor = await Vendor.create({
                user_id: vendorUser.id,
                company_info: {
                    company_name: "Test Trek Company",
                    address: "123 Trek Street, Mumbai",
                    registration_number: "TEST123456",
                },
                status: "active",
            });
            console.log("Test vendor profile created!");
        } else {
            vendor = existingVendorProfile;
            console.log("Test vendor profile already exists.");
        }

        // Create test customers
        const customers = [
            {
                name: "John Doe",
                email: "john@test.com",
                phone: "+91 9876543210",
            },
            {
                name: "Jane Smith",
                email: "jane@test.com",
                phone: "+91 9876543211",
            },
            {
                name: "Bob Wilson",
                email: "bob@test.com",
                phone: "+91 9876543212",
            },
        ];

        const customerUsers = [];
        for (const customerData of customers) {
            const existingCustomer = await User.findOne({
                where: { email: customerData.email },
            });

            if (!existingCustomer) {
                const passwordHash = await bcrypt.hash("customer123", 10);
                const customer = await User.create({
                    name: customerData.name,
                    email: customerData.email,
                    phone: customerData.phone,
                    passwordHash,
                    roleId: userRole.id,
                });
                customerUsers.push(customer);
                console.log(`Customer ${customerData.name} created!`);
            } else {
                customerUsers.push(existingCustomer);
                console.log(`Customer ${customerData.name} already exists.`);
            }
        }

        // Create a test trek
        const existingTrek = await Trek.findOne({
            where: { vendor_id: vendor.id },
        });

        let trek;
        if (!existingTrek) {
            trek = await Trek.create({
                vendor_id: vendor.id,
                title: "Test Himalayan Trek",
                destination: "Himachal Pradesh",
                base_price: 5000.0,
                max_participants: 20,
                duration_days: 5,
                duration_nights: 4,
                difficulty_level: "moderate",
                trek_type: "mountain",
                category_id: 1, // Assuming category exists
                description: "A beautiful test trek in the Himalayas",
                status: "published",
            });
            console.log("Test trek created!");
        } else {
            trek = existingTrek;
            console.log("Test trek already exists.");
        }

        // Create test bookings
        for (let i = 0; i < customerUsers.length; i++) {
            const customer = customerUsers[i];
            const existingBooking = await Booking.findOne({
                where: {
                    user_id: customer.id,
                    vendor_id: vendor.id,
                    trek_id: trek.id,
                },
            });

            if (!existingBooking) {
                const booking = await Booking.create({
                    user_id: customer.id,
                    trek_id: trek.id,
                    vendor_id: vendor.id,
                    total_participants: 2,
                    total_amount: 10000.0,
                    discount_amount: 0.0,
                    final_amount: 10000.0,
                    payment_status: "completed",
                    status: "confirmed",
                });

                // Create payment log
                await PaymentLog.create({
                    booking_id: booking.id,
                    amount: 10000.0,
                    status: "success",
                    payment_method: "card",
                    transaction_id: `TEST_${Date.now()}_${i}`,
                });

                console.log(`Booking created for ${customer.name}!`);
            } else {
                console.log(`Booking already exists for ${customer.name}.`);
            }
        }

        console.log("\nTest data created successfully!");
        console.log("Vendor login: vendor@test.com / vendor123");
        console.log(
            "Customer logins: john@test.com, jane@test.com, bob@test.com / customer123"
        );
    } catch (error) {
        console.error("Error seeding test vendor:", error);
    }
};

module.exports = seedTestVendor;

// Run if called directly
if (require.main === module) {
    seedTestVendor()
        .then(() => {
            process.exit(0);
        })
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
}
