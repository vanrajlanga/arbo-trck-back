const {
    User,
    Customer,
    Booking,
    Trek,
    PaymentLog,
    BookingParticipant,
    Vendor,
} = require("../models");
const { Op } = require("sequelize");
const sequelize = require("sequelize");

// Get all customers for a vendor (users who have booked vendor's treks)
const getVendorCustomers = async (req, res) => {
    try {
        // Get vendor ID from user's vendor association
        let vendorId = req.user.vendorId;

        if (!vendorId) {
            // If vendorId is not directly available, get it from the vendor association
            const userWithVendor = await User.findByPk(req.user.id, {
                include: [{ model: Vendor, as: "vendor" }],
            });

            if (!userWithVendor?.vendor) {
                return res.status(403).json({
                    success: false,
                    message: "User is not associated with any vendor",
                });
            }

            vendorId = userWithVendor.vendor.id;
        }

        const { search, status, page = 1, limit = 10 } = req.query;

        // Build where clause for search
        const userWhereClause = {};
        if (search && search !== "undefined" && search.trim() !== "") {
            userWhereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } },
            ];
        }

        // Get customers with their booking statistics
        const customers = await Customer.findAndCountAll({
            where: userWhereClause,
            include: [
                {
                    model: Booking,
                    as: "bookings",
                    where: { vendor_id: vendorId },
                    required: false, // Show all customers, not just those with bookings
                    include: [
                        {
                            model: Trek,
                            as: "trek",
                            attributes: ["id", "title"],
                        },
                        {
                            model: PaymentLog,
                            as: "payments",
                            attributes: ["amount", "status"],
                        },
                    ],
                },
                {
                    model: require("../models").City,
                    as: "city",
                    attributes: ["id", "cityName"],
                },
                {
                    model: require("../models").State,
                    as: "state",
                    attributes: ["id", "name"],
                },
            ],
            // attributes: ["id", "name", "email", "phone", "created_at"],
            distinct: true, // Use distinct instead of group
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [["createdAt", "DESC"]],
        });

        // Transform data to include booking statistics
        const transformedCustomers = await Promise.all(
            customers.rows.map(async (customer) => {
                const customerBookings = await Booking.findAll({
                    where: {
                        customer_id: customer.id,
                        vendor_id: vendorId,
                    },
                    include: [
                        {
                            model: PaymentLog,
                            as: "payments",
                            attributes: ["amount", "status"],
                        },
                    ],
                    order: [["createdAt", "DESC"]],
                });

                // Calculate statistics
                const totalBookings = customerBookings.length;
                const totalSpent = customerBookings.reduce(
                    (sum, booking) =>
                        sum + parseFloat(booking.final_amount || 0),
                    0
                );
                const lastBooking =
                    customerBookings.length > 0
                        ? customerBookings[0].createdAt
                        : null;

                // Determine status based on recent activity
                const isActive =
                    lastBooking &&
                    new Date(lastBooking) >
                        new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // Active if booked in last 90 days

                return {
                    id: customer.id,
                    name: customer.name,
                    email: customer.email,
                    phone: customer.phone,
                    city_id: customer.city_id,
                    state_id: customer.state_id,
                    city: customer.city
                        ? {
                              id: customer.city.id,
                              name: customer.city.cityName,
                          }
                        : null,
                    state: customer.state
                        ? {
                              id: customer.state.id,
                              name: customer.state.name,
                          }
                        : null,
                    location:
                        customer.city && customer.state
                            ? `${customer.city.cityName}, ${customer.state.name}`
                            : customer.city
                            ? customer.city.cityName
                            : customer.state
                            ? customer.state.name
                            : "N/A",
                    tripsBooked: totalBookings,
                    lastBooking: lastBooking
                        ? new Date(lastBooking).toLocaleDateString("en-US")
                        : "N/A",
                    totalSpent:
                        totalBookings > 0
                            ? `₹${totalSpent.toLocaleString()}`
                            : "₹0",
                    status: isActive ? "Active" : "Inactive",
                    joinedDate: customer.createdAt
                        ? new Date(customer.createdAt).toLocaleDateString(
                              "en-US"
                          )
                        : "N/A",
                };
            })
        );

        // Filter by status if specified
        const filteredCustomers =
            status && status !== "all" && status !== "undefined"
                ? transformedCustomers.filter(
                      (customer) =>
                          customer.status.toLowerCase() === status.toLowerCase()
                  )
                : transformedCustomers;

        res.json({
            success: true,
            data: filteredCustomers,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(customers.count / parseInt(limit)),
                totalCount: customers.count,
                itemsPerPage: parseInt(limit),
            },
        });
    } catch (error) {
        console.error("Error fetching vendor customers:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch customers",
        });
    }
};

// Get detailed customer information
const getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;

        // Get vendor ID from user's vendor association
        let vendorId = req.user.vendorId;

        if (!vendorId) {
            // If vendorId is not directly available, get it from the vendor association
            const userWithVendor = await User.findByPk(req.user.id, {
                include: [{ model: Vendor, as: "vendor" }],
            });

            if (!userWithVendor?.vendor) {
                return res.status(403).json({
                    success: false,
                    message: "User is not associated with any vendor",
                });
            }

            vendorId = userWithVendor.vendor.id;
        }

        const customer = await Customer.findByPk(id, {
            include: [
                {
                    model: Booking,
                    as: "bookings",
                    where: { vendor_id: vendorId },
                    include: [
                        {
                            model: Trek,
                            as: "trek",
                            attributes: [
                                "id",
                                "title",
                                "destination",
                                "base_price",
                            ],
                        },
                        {
                            model: PaymentLog,
                            as: "payments",
                        },
                        {
                            model: BookingParticipant,
                            as: "participants",
                        },
                    ],
                    order: [["createdAt", "DESC"]],
                },
                {
                    model: require("../models").City,
                    as: "city",
                    attributes: ["id", "cityName"],
                },
                {
                    model: require("../models").State,
                    as: "state",
                    attributes: ["id", "name"],
                },
            ],
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found",
            });
        }

        // Calculate detailed statistics
        const bookings = customer.bookings || [];
        const totalBookings = bookings.length;
        const totalParticipants = bookings.reduce(
            (sum, booking) => sum + (booking.participants?.length || 0),
            0
        );
        const totalSpent = bookings.reduce(
            (sum, booking) => sum + parseFloat(booking.final_amount || 0),
            0
        );

        const customerDetails = {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            city_id: customer.city_id,
            state_id: customer.state_id,
            city: customer.city
                ? {
                      id: customer.city.id,
                      name: customer.city.cityName,
                  }
                : null,
            state: customer.state
                ? {
                      id: customer.state.id,
                      name: customer.state.name,
                  }
                : null,
            joinedDate: customer.createdAt
                ? new Date(customer.createdAt).toLocaleDateString("en-US")
                : "N/A",
            statistics: {
                totalBookings,
                totalParticipants,
                totalSpent,
                averageBookingValue:
                    totalBookings > 0 ? totalSpent / totalBookings : 0,
            },
            bookings: bookings.map((booking) => ({
                id: booking.id,
                trek: booking.trek,
                bookingDate: booking.createdAt
                    ? new Date(booking.createdAt).toLocaleDateString("en-US")
                    : "N/A",
                participants: booking.participants?.length || 0,
                amount: booking.final_amount,
                status: booking.status,
                paymentStatus: booking.payment_status,
            })),
        };

        res.json({
            success: true,
            data: customerDetails,
        });
    } catch (error) {
        console.error("Error fetching customer details:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch customer details",
        });
    }
};

// Get customer analytics for vendor dashboard
const getCustomerAnalytics = async (req, res) => {
    try {
        // Get vendor ID from user's vendor association
        let vendorId = req.user.vendorId;

        if (!vendorId) {
            // If vendorId is not directly available, get it from the vendor association
            const userWithVendor = await User.findByPk(req.user.id, {
                include: [{ model: Vendor, as: "vendor" }],
            });

            if (!userWithVendor?.vendor) {
                return res.status(403).json({
                    success: false,
                    message: "User is not associated with any vendor",
                });
            }

            vendorId = userWithVendor.vendor.id;
        }

        const { startDate, endDate } = req.query;

        const whereClause = { vendor_id: vendorId };
        if (startDate && endDate) {
            whereClause.created_at = {
                [Op.between]: [new Date(startDate), new Date(endDate)],
            };
        }

        // Get customer analytics
        const analytics = await Promise.all([
            // Total unique customers (all customers, not just those with bookings)
            Customer.count(),

            // New customers this month
            Customer.count({
                where: {
                    created_at: {
                        [Op.gte]: new Date(
                            new Date().getFullYear(),
                            new Date().getMonth(),
                            1
                        ),
                    },
                },
            }),

            // Customer retention (customers with multiple bookings)
            Booking.findAll({
                where: whereClause,
                attributes: [
                    "customer_id",
                    [
                        sequelize.fn("COUNT", sequelize.col("id")),
                        "bookingCount",
                    ],
                ],
                group: ["customer_id"],
                having: sequelize.literal("COUNT(id) > 1"),
            }),

            // Average customer value
            Booking.findAll({
                where: whereClause,
                attributes: [
                    [
                        sequelize.fn("AVG", sequelize.col("final_amount")),
                        "avgCustomerValue",
                    ],
                ],
            }),
        ]);

        const totalCustomers = analytics[0] || 0;
        const newCustomers = analytics[1] || 0;
        const returningCustomers = analytics[2]?.length || 0;
        const avgCustomerValue = parseFloat(
            analytics[3][0]?.dataValues?.avgCustomerValue || 0
        );

        res.json({
            success: true,
            data: {
                totalCustomers: parseInt(totalCustomers),
                newCustomers: parseInt(newCustomers),
                returningCustomers,
                retentionRate:
                    totalCustomers > 0
                        ? ((returningCustomers / totalCustomers) * 100).toFixed(
                              1
                          )
                        : 0,
                avgCustomerValue: avgCustomerValue.toFixed(2),
            },
        });
    } catch (error) {
        console.error("Error fetching customer analytics:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch customer analytics",
        });
    }
};

// Update customer information (limited fields)
const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone } = req.body; // Only allow updating name and phone

        const customer = await Customer.findByPk(id);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found",
            });
        }

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (phone !== undefined) updateData.phone = phone;

        await customer.update(updateData);

        res.json({
            success: true,
            message: "Customer updated successfully",
            data: {
                id: customer.id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
            },
        });
    } catch (error) {
        console.error("Error updating customer:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update customer",
        });
    }
};

// Create a new customer for a vendor
const createCustomer = async (req, res) => {
    try {
        let vendorId = req.user.vendorId;
        if (!vendorId) {
            const userWithVendor = await User.findByPk(req.user.id, {
                include: [{ model: Vendor, as: "vendor" }],
            });
            if (!userWithVendor?.vendor) {
                return res.status(403).json({
                    success: false,
                    message: "User is not associated with any vendor",
                });
            }
            vendorId = userWithVendor.vendor.id;
        }

        const { name, email, phone } = req.body;
        console.log("Creating customer with:", {
            name,
            email,
            phone,
            vendorId,
        });

        if (!name || !email || !phone) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and phone are required",
            });
        }

        // Check if user already exists by email or phone
        const existing = await Customer.findOne({
            where: { [Op.or]: [{ email }, { phone }] },
        });

        console.log(
            "Existing user check result:",
            existing
                ? {
                      id: existing.id,
                      name: existing.name,
                      email: existing.email,
                      phone: existing.phone,
                  }
                : "No existing user found"
        );

        if (existing) {
            return res.status(409).json({
                success: false,
                message: "A customer with this email or phone already exists",
                debug: {
                    existingUser: {
                        id: existing.id,
                        name: existing.name,
                        email: existing.email,
                        phone: existing.phone,
                    },
                },
            });
        }

        // Create the user (customer)
        const customer = await Customer.create({
            name,
            email,
            phone,
            // Optionally, set a flag or role to indicate this is a customer
        });

        console.log("Customer created successfully:", {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
        });

        res.json({
            success: true,
            message: "Customer created successfully",
            data: {
                id: customer.id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                createdAt: customer.createdAt,
            },
        });
    } catch (error) {
        console.error("Error creating customer:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create customer",
            error: error.message,
        });
    }
};

// Debug function to list all customers (for troubleshooting)
const debugListCustomers = async (req, res) => {
    try {
        const customers = await Customer.findAll({
            attributes: ["id", "name", "email", "phone", "createdAt", "status"],
            order: [["createdAt", "DESC"]],
        });

        res.json({
            success: true,
            message: "All customers in database",
            data: customers,
            count: customers.length,
        });
    } catch (error) {
        console.error("Error listing customers:", error);
        res.status(500).json({
            success: false,
            message: "Failed to list customers",
            error: error.message,
        });
    }
};

// Mobile App: Get customer profile (optimized for mobile)
const getMobileCustomerProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const customer = await Customer.findOne({
            where: { user_id: userId },
            include: [
                {
                    model: require("../models").City,
                    as: "city",
                    attributes: ["id", "cityName"],
                },
                {
                    model: require("../models").State,
                    as: "state",
                    attributes: ["id", "name"],
                },
            ],
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer profile not found",
            });
        }

        // Transform data for mobile consumption
        const mobileProfile = {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            date_of_birth: customer.date_of_birth,
            gender: customer.gender,
            address: customer.address,
            city: customer.city
                ? {
                      id: customer.city.id,
                      name: customer.city.cityName,
                  }
                : null,
            state: customer.state
                ? {
                      id: customer.state.id,
                      name: customer.state.name,
                  }
                : null,
            emergency_contact_name: customer.emergency_contact_name,
            emergency_contact_phone: customer.emergency_contact_phone,
            medical_conditions: customer.medical_conditions,
            dietary_restrictions: customer.dietary_restrictions,
            created_at: customer.created_at,
            updated_at: customer.updated_at,
        };

        res.json({
            success: true,
            profile: mobileProfile,
        });
    } catch (error) {
        console.error("Error fetching mobile customer profile:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch profile",
        });
    }
};

// Mobile App: Update customer profile (optimized for mobile)
const updateMobileCustomerProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const updateData = req.body;

        // Only allow updating specific fields for mobile
        const allowedFields = [
            "name",
            "date_of_birth",
            "gender",
            "address",
            "city_id",
            "state_id",
            "emergency_contact_name",
            "emergency_contact_phone",
            "medical_conditions",
            "dietary_restrictions",
        ];

        const filteredData = {};
        allowedFields.forEach((field) => {
            if (updateData[field] !== undefined) {
                filteredData[field] = updateData[field];
            }
        });

        const customer = await Customer.findOne({
            where: { user_id: userId },
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer profile not found",
            });
        }

        // Update customer profile
        await customer.update(filteredData);

        // Fetch updated profile with associations
        const updatedCustomer = await Customer.findOne({
            where: { user_id: userId },
            include: [
                {
                    model: require("../models").City,
                    as: "city",
                    attributes: ["id", "cityName"],
                },
                {
                    model: require("../models").State,
                    as: "state",
                    attributes: ["id", "name"],
                },
            ],
        });

        // Transform data for mobile consumption
        const mobileProfile = {
            id: updatedCustomer.id,
            name: updatedCustomer.name,
            email: updatedCustomer.email,
            phone: updatedCustomer.phone,
            date_of_birth: updatedCustomer.date_of_birth,
            gender: updatedCustomer.gender,
            address: updatedCustomer.address,
            city: updatedCustomer.city
                ? {
                      id: updatedCustomer.city.id,
                      name: updatedCustomer.city.cityName,
                  }
                : null,
            state: updatedCustomer.state
                ? {
                      id: updatedCustomer.state.id,
                      name: updatedCustomer.state.name,
                  }
                : null,
            emergency_contact_name: updatedCustomer.emergency_contact_name,
            emergency_contact_phone: updatedCustomer.emergency_contact_phone,
            medical_conditions: updatedCustomer.medical_conditions,
            dietary_restrictions: updatedCustomer.dietary_restrictions,
            created_at: updatedCustomer.created_at,
            updated_at: updatedCustomer.updated_at,
        };

        res.json({
            success: true,
            message: "Profile updated successfully",
            profile: mobileProfile,
        });
    } catch (error) {
        console.error("Error updating mobile customer profile:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update profile",
        });
    }
};

// Mobile App: Get customer analytics (customer-specific)
const getMobileCustomerAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        const { startDate, endDate } = req.query;

        const whereClause = { user_id: userId };
        if (startDate && endDate) {
            whereClause.created_at = {
                [Op.between]: [new Date(startDate), new Date(endDate)],
            };
        }

        const analytics = await Promise.all([
            // Total bookings by status
            Booking.findAll({
                where: whereClause,
                attributes: [
                    "status",
                    [sequelize.fn("COUNT", sequelize.col("id")), "count"],
                ],
                group: ["status"],
            }),

            // Total spent
            Booking.findAll({
                where: { ...whereClause, status: "confirmed" },
                attributes: [
                    [
                        sequelize.fn("SUM", sequelize.col("final_amount")),
                        "totalSpent",
                    ],
                    [
                        sequelize.fn("COUNT", sequelize.col("id")),
                        "totalBookings",
                    ],
                ],
            }),

            // Average booking value
            Booking.findAll({
                where: { ...whereClause, status: "confirmed" },
                attributes: [
                    [
                        sequelize.fn("AVG", sequelize.col("final_amount")),
                        "averageBookingValue",
                    ],
                ],
            }),
        ]);

        res.json({
            success: true,
            analytics: {
                statusBreakdown: analytics[0],
                spending: analytics[1][0] || {
                    totalSpent: 0,
                    totalBookings: 0,
                },
                averageBookingValue: analytics[2][0]?.averageBookingValue || 0,
            },
        });
    } catch (error) {
        console.error("Error fetching mobile customer analytics:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch analytics",
        });
    }
};

// Get travelers for a specific customer
const getCustomerTravelers = async (req, res) => {
    try {
        const { id } = req.params;
        const vendorId = req.user.vendorId;

        // Verify the customer exists and has bookings with this vendor
        const customer = await Customer.findByPk(id);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found",
            });
        }

        // Check if customer has any bookings with this vendor
        const hasBookings = await Booking.findOne({
            where: {
                customer_id: id,
                vendor_id: vendorId,
            },
        });

        if (!hasBookings) {
            return res.status(403).json({
                success: false,
                message: "Customer has no bookings with this vendor",
            });
        }

        // Get all travelers for this customer
        const travelers = await require("../models").Traveler.findAll({
            where: {
                customer_id: id,
                is_active: true,
            },
            order: [["createdAt", "DESC"]],
        });

        res.json({
            success: true,
            data: travelers,
        });
    } catch (error) {
        console.error("Error fetching customer travelers:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch travelers",
        });
    }
};

module.exports = {
    getVendorCustomers,
    getCustomerById,
    getCustomerAnalytics,
    updateCustomer,
    createCustomer,
    debugListCustomers,
    getMobileCustomerProfile,
    updateMobileCustomerProfile,
    getMobileCustomerAnalytics,
    getCustomerTravelers,
};
