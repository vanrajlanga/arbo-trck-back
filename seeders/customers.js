"use strict";

const { User, Customer, Role, City, State } = require("../models");
const bcrypt = require("bcrypt");

const seedCustomers = async () => {
    try {
        // Check if customer role exists
        const customerRole = await Role.findOne({ where: { name: "user" } });
        if (!customerRole) {
            console.log(
                "Customer role not found. Please run roles seeder first."
            );
            return;
        }

        // Check if customers already exist
        const existingCustomers = await Customer.findAll();
        if (existingCustomers.length > 0) {
            console.log("Customers already exist, skipping seed.");
            return;
        }

        // Get some cities for reference
        const cities = await City.findAll({ limit: 10 });
        if (cities.length === 0) {
            console.log("Cities not found. Please run cities seeder first.");
            return;
        }

        const customers = [
            {
                user: {
                    name: "Rahul Sharma",
                    email: "rahul@example.com",
                    phone: "+91 9876543201",
                    passwordHash: await bcrypt.hash("customer123", 10),
                    roleId: customerRole.id,
                },
                customer: {
                    name: "Rahul Sharma",
                    email: "rahul@example.com",
                    phone: "+91 9876543201",
                    city_id: cities[0].id,
                    state_id: cities[0].stateId,
                    date_of_birth: "1990-05-15",
                    emergency_contact: {
                        name: "Priya Sharma",
                        phone: "+91 9876543202",
                        relation: "Spouse",
                    },
                    status: "active",
                },
            },
            {
                user: {
                    name: "Priya Patel",
                    email: "priya@example.com",
                    phone: "+91 9876543203",
                    passwordHash: await bcrypt.hash("customer123", 10),
                    roleId: customerRole.id,
                },
                customer: {
                    name: "Priya Patel",
                    email: "priya@example.com",
                    phone: "+91 9876543203",
                    city_id: cities[1].id,
                    state_id: cities[1].stateId,
                    date_of_birth: "1992-08-22",
                    emergency_contact: {
                        name: "Amit Patel",
                        phone: "+91 9876543204",
                        relation: "Brother",
                    },
                    status: "active",
                },
            },
            {
                user: {
                    name: "Amit Kumar",
                    email: "amit@example.com",
                    phone: "+91 9876543205",
                    passwordHash: await bcrypt.hash("customer123", 10),
                    roleId: customerRole.id,
                },
                customer: {
                    name: "Amit Kumar",
                    email: "amit@example.com",
                    phone: "+91 9876543205",
                    city_id: cities[2].id,
                    state_id: cities[2].stateId,
                    date_of_birth: "1988-12-10",
                    emergency_contact: {
                        name: "Sunita Kumar",
                        phone: "+91 9876543206",
                        relation: "Mother",
                    },
                    status: "active",
                },
            },
            {
                user: {
                    name: "Neha Singh",
                    email: "neha@example.com",
                    phone: "+91 9876543207",
                    passwordHash: await bcrypt.hash("customer123", 10),
                    roleId: customerRole.id,
                },
                customer: {
                    name: "Neha Singh",
                    email: "neha@example.com",
                    phone: "+91 9876543207",
                    city_id: cities[3].id,
                    state_id: cities[3].stateId,
                    date_of_birth: "1995-03-18",
                    emergency_contact: {
                        name: "Rajesh Singh",
                        phone: "+91 9876543208",
                        relation: "Father",
                    },
                    status: "active",
                },
            },
            {
                user: {
                    name: "Vikram Malhotra",
                    email: "vikram@example.com",
                    phone: "+91 9876543209",
                    passwordHash: await bcrypt.hash("customer123", 10),
                    roleId: customerRole.id,
                },
                customer: {
                    name: "Vikram Malhotra",
                    email: "vikram@example.com",
                    phone: "+91 9876543209",
                    city_id: cities[4].id,
                    state_id: cities[4].stateId,
                    date_of_birth: "1985-07-25",
                    emergency_contact: {
                        name: "Anjali Malhotra",
                        phone: "+91 9876543210",
                        relation: "Wife",
                    },
                    status: "active",
                },
            },
            {
                user: {
                    name: "Sneha Reddy",
                    email: "sneha@example.com",
                    phone: "+91 9876543211",
                    passwordHash: await bcrypt.hash("customer123", 10),
                    roleId: customerRole.id,
                },
                customer: {
                    name: "Sneha Reddy",
                    email: "sneha@example.com",
                    phone: "+91 9876543211",
                    city_id: cities[5].id,
                    state_id: cities[5].stateId,
                    date_of_birth: "1993-11-08",
                    emergency_contact: {
                        name: "Krishna Reddy",
                        phone: "+91 9876543212",
                        relation: "Husband",
                    },
                    status: "active",
                },
            },
            {
                user: {
                    name: "Arjun Mehta",
                    email: "arjun@example.com",
                    phone: "+91 9876543213",
                    passwordHash: await bcrypt.hash("customer123", 10),
                    roleId: customerRole.id,
                },
                customer: {
                    name: "Arjun Mehta",
                    email: "arjun@example.com",
                    phone: "+91 9876543213",
                    city_id: cities[6].id,
                    state_id: cities[6].stateId,
                    date_of_birth: "1991-04-12",
                    emergency_contact: {
                        name: "Pooja Mehta",
                        phone: "+91 9876543214",
                        relation: "Sister",
                    },
                    status: "active",
                },
            },
            {
                user: {
                    name: "Kavya Iyer",
                    email: "kavya@example.com",
                    phone: "+91 9876543215",
                    passwordHash: await bcrypt.hash("customer123", 10),
                    roleId: customerRole.id,
                },
                customer: {
                    name: "Kavya Iyer",
                    email: "kavya@example.com",
                    phone: "+91 9876543215",
                    city_id: cities[7].id,
                    state_id: cities[7].stateId,
                    date_of_birth: "1994-09-30",
                    emergency_contact: {
                        name: "Ramesh Iyer",
                        phone: "+91 9876543216",
                        relation: "Father",
                    },
                    status: "active",
                },
            },
            {
                user: {
                    name: "Riya Gupta",
                    email: "riya@example.com",
                    phone: "+91 9876543217",
                    passwordHash: await bcrypt.hash("customer123", 10),
                    roleId: customerRole.id,
                },
                customer: {
                    name: "Riya Gupta",
                    email: "riya@example.com",
                    phone: "+91 9876543217",
                    city_id: cities[8].id,
                    state_id: cities[8].stateId,
                    date_of_birth: "1996-01-15",
                    emergency_contact: {
                        name: "Suresh Gupta",
                        phone: "+91 9876543218",
                        relation: "Brother",
                    },
                    status: "active",
                },
            },
            {
                user: {
                    name: "Aditya Verma",
                    email: "aditya@example.com",
                    phone: "+91 9876543219",
                    passwordHash: await bcrypt.hash("customer123", 10),
                    roleId: customerRole.id,
                },
                customer: {
                    name: "Aditya Verma",
                    email: "aditya@example.com",
                    phone: "+91 9876543219",
                    city_id: cities[9].id,
                    state_id: cities[9].stateId,
                    date_of_birth: "1989-06-20",
                    emergency_contact: {
                        name: "Meera Verma",
                        phone: "+91 9876543220",
                        relation: "Mother",
                    },
                    status: "active",
                },
            },
        ];

        for (const customerData of customers) {
            // Create user first
            const user = await User.create(customerData.user);

            // Create customer with user association
            await Customer.create({
                ...customerData.customer,
                firebase_uid: `firebase_${user.id}`, // Mock Firebase UID
            });
        }

        console.log("Customers seeded successfully!");
        console.log("Customer login credentials:");
        console.log("Email: rahul@example.com, Password: customer123");
        console.log("Email: priya@example.com, Password: customer123");
        console.log("Email: amit@example.com, Password: customer123");
        console.log("Email: neha@example.com, Password: customer123");
        console.log("Email: vikram@example.com, Password: customer123");

        // Display created customers count
        const createdCustomers = await Customer.findAll();
        console.log(`Created ${createdCustomers.length} customers`);
    } catch (error) {
        console.error("Error seeding customers:", error);
    }
};

module.exports = seedCustomers;

// Run if called directly
if (require.main === module) {
    const sequelize = require("../config/config");

    seedCustomers()
        .then(() => {
            process.exit(0);
        })
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
}
