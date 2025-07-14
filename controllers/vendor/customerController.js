const {
    User,
    Customer,
    Booking,
    Trek,
    PaymentLog,
    BookingParticipant,
    Vendor,
} = require("../../models");
const { Op } = require("sequelize");
const sequelize = require("sequelize");

// Get all customers for a vendor (users who have booked vendor's treks)
exports.getVendorCustomers = async (req, res) => {
    try {
        let vendorId = req.user.id;

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
                    model: require("../../models").City,
                    as: "city",
                    attributes: ["id", "cityName"],
                },
                {
                    model: require("../../models").State,
                    as: "state",
                    attributes: ["id", "name"],
                },
            ],
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
exports.getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;
        const vendorId = req.user.id;

        if (!vendorId) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Vendor account required.",
            });
        }

        const customer = await Customer.findByPk(id, {
            include: [
                {
                    model: Booking,
                    as: "bookings",
                    where: { vendor_id: vendorId },
                    required: false,
                    include: [
                        {
                            model: Trek,
                            as: "trek",
                            attributes: ["id", "title", "base_price"],
                        },
                        {
                            model: PaymentLog,
                            as: "payments",
                            attributes: ["amount", "status", "created_at"],
                        },
                    ],
                    order: [["createdAt", "DESC"]],
                },
                {
                    model: require("../../models").City,
                    as: "city",
                    attributes: ["id", "cityName"],
                },
                {
                    model: require("../../models").State,
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

        // Calculate customer statistics
        const totalBookings = customer.bookings?.length || 0;
        const totalSpent =
            customer.bookings?.reduce(
                (sum, booking) => sum + parseFloat(booking.final_amount || 0),
                0
            ) || 0;
        const lastBooking = customer.bookings?.[0]?.createdAt || null;

        const customerData = {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            city: customer.city,
            state: customer.state,
            location:
                customer.city && customer.state
                    ? `${customer.city.cityName}, ${customer.state.name}`
                    : customer.city
                    ? customer.city.cityName
                    : customer.state
                    ? customer.state.name
                    : "N/A",
            totalBookings,
            totalSpent: `₹${totalSpent.toLocaleString()}`,
            lastBooking: lastBooking
                ? new Date(lastBooking).toLocaleDateString("en-US")
                : "N/A",
            joinedDate: customer.createdAt
                ? new Date(customer.createdAt).toLocaleDateString("en-US")
                : "N/A",
            bookings: customer.bookings || [],
        };

        res.json({
            success: true,
            data: customerData,
        });
    } catch (error) {
        console.error("Error fetching customer details:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch customer details",
        });
    }
};

// Update customer information
exports.updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone } = req.body; // Only allow updating name and phone
        const vendorId = req.user.id;

        if (!vendorId) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Vendor account required.",
            });
        }

        const customer = await Customer.findByPk(id);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found",
            });
        }

        // Verify customer has bookings with this vendor
        const hasBookings = await Booking.findOne({
            where: { customer_id: id, vendor_id: vendorId },
        });

        if (!hasBookings) {
            return res.status(403).json({
                success: false,
                message:
                    "Access denied. Customer not associated with this vendor.",
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

// Create a new customer
exports.createCustomer = async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        const vendorId = req.user.id;

        if (!vendorId) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Vendor account required.",
            });
        }

        // Validation
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

        if (existing) {
            return res.status(400).json({
                success: false,
                message: "A customer with this email or phone already exists",
                existingCustomer: {
                    id: existing.id,
                    name: existing.name,
                    email: existing.email,
                    phone: existing.phone,
                },
            });
        }

        // Create new customer
        const customer = await Customer.create({
            name,
            email,
            phone,
        });

        res.status(201).json({
            success: true,
            message: "Customer created successfully",
            data: {
                id: customer.id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
            },
        });
    } catch (error) {
        console.error("Error creating customer:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create customer",
        });
    }
};

// Get customer analytics
exports.getCustomerAnalytics = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { startDate, endDate } = req.query;

        if (!vendorId) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Vendor account required.",
            });
        }

        const whereClause = { vendor_id: vendorId };
        if (startDate && endDate) {
            whereClause.created_at = {
                [Op.between]: [new Date(startDate), new Date(endDate)],
            };
        }

        // Get customer statistics
        const totalCustomers = await Customer.count({
            include: [
                {
                    model: Booking,
                    as: "bookings",
                    where: whereClause,
                    required: true,
                },
            ],
        });

        const newCustomers = await Customer.count({
            include: [
                {
                    model: Booking,
                    as: "bookings",
                    where: whereClause,
                    required: true,
                },
            ],
            where: {
                createdAt: {
                    [Op.between]: [
                        startDate
                            ? new Date(startDate)
                            : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                        endDate ? new Date(endDate) : new Date(),
                    ],
                },
            },
        });

        const activeCustomers = await Customer.count({
            include: [
                {
                    model: Booking,
                    as: "bookings",
                    where: {
                        ...whereClause,
                        createdAt: {
                            [Op.gte]: new Date(
                                Date.now() - 90 * 24 * 60 * 60 * 1000
                            ),
                        },
                    },
                    required: true,
                },
            ],
        });

        res.json({
            success: true,
            data: {
                totalCustomers,
                newCustomers,
                activeCustomers,
                inactiveCustomers: totalCustomers - activeCustomers,
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
