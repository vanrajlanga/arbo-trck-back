const {
    Booking,
    Trek,
    Customer,
    Vendor,
    Review,
    Rating,
    Batch,
    BookingTraveler,
    sequelize,
} = require("../../models");
const { Op } = require("sequelize");
const logger = require("../../utils/logger");

// Get vendor dashboard analytics
exports.getVendorDashboard = async (req, res) => {
    try {
        const vendorId = req.user.id;

        if (!vendorId) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Vendor account required.",
            });
        }

        // Get current date and calculate date ranges
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            1
        );
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        // 1. Active Treks Count
        const activeTreksCount = await Trek.count({
            where: {
                vendor_id: vendorId,
                status: "active",
            },
        });

        // 2. Total Bookings (current month)
        const currentMonthBookings = await Booking.count({
            where: {
                vendor_id: vendorId,
                created_at: {
                    [Op.gte]: startOfMonth,
                },
            },
        });

        // 3. Monthly Revenue
        const currentMonthRevenue = await Booking.sum("total_amount", {
            where: {
                vendor_id: vendorId,
                payment_status: "completed",
                created_at: {
                    [Op.gte]: startOfMonth,
                },
            },
        });

        const lastMonthRevenue = await Booking.sum("total_amount", {
            where: {
                vendor_id: vendorId,
                payment_status: "completed",
                created_at: {
                    [Op.between]: [startOfLastMonth, endOfLastMonth],
                },
            },
        });

        // 4. Average Rating - Simplified query
        const averageRating = await Rating.findOne({
            attributes: [
                [
                    sequelize.fn("AVG", sequelize.col("rating_value")),
                    "averageRating",
                ],
                [
                    sequelize.fn("COUNT", sequelize.col("Rating.id")),
                    "totalReviews",
                ],
            ],
            include: [
                {
                    model: Trek,
                    as: "trek",
                    where: { vendor_id: vendorId },
                    attributes: [],
                },
            ],
        });

        // 5. Upcoming Treks (simplified)
        const upcomingTreks = await Trek.findAll({
            where: {
                vendor_id: vendorId,
                status: "active",
            },
            include: [
                {
                    model: Batch,
                    as: "batches",
                    where: {
                        start_date: {
                            [Op.gte]: now,
                        },
                    },
                    required: false,
                },
            ],
            order: [["created_at", "DESC"]],
            limit: 5,
        });

        // 6. Recent Bookings (simplified)
        const recentBookings = await Booking.findAll({
            where: {
                vendor_id: vendorId,
            },
            include: [
                { model: Trek, as: "trek" },
                { model: Customer, as: "customer" },
            ],
            order: [["created_at", "DESC"]],
            limit: 5,
        });

        // 7. Recent Reviews (simplified)
        const recentReviews = await Review.findAll({
            include: [
                {
                    model: Trek,
                    as: "trek",
                    where: { vendor_id: vendorId },
                },
                {
                    model: Customer,
                    as: "customer",
                },
            ],
            order: [["created_at", "DESC"]],
            limit: 5,
        });

        // 8. Booking Status Distribution
        const bookingStatusDistribution = await Booking.findAll({
            where: { vendor_id: vendorId },
            attributes: [
                "status",
                [sequelize.fn("COUNT", sequelize.col("id")), "count"],
            ],
            group: ["status"],
        });

        // Format the response
        const dashboardData = {
            stats: {
                activeTreks: activeTreksCount,
                totalBookings: currentMonthBookings,
                monthlyRevenue: currentMonthRevenue || 0,
                revenueChange: lastMonthRevenue
                    ? (currentMonthRevenue || 0) - lastMonthRevenue
                    : 0,
                averageRating: parseFloat(
                    averageRating?.dataValues?.averageRating || 0
                ).toFixed(1),
                totalReviews: parseInt(
                    averageRating?.dataValues?.totalReviews || 0
                ),
            },
            upcomingTreks: upcomingTreks.map((trek) => ({
                id: trek.id,
                name: trek.title,
                date: trek.batches?.[0]?.start_date
                    ? new Date(trek.batches[0].start_date).toLocaleDateString()
                    : "TBD",
                slots: {
                    total: trek.batches?.[0]?.max_participants || 0,
                    booked:
                        trek.batches?.[0]?.max_participants -
                            (trek.batches?.[0]?.available_slots || 0) || 0,
                },
                revenue: `₹${(
                    (trek.batches?.[0]?.max_participants -
                        (trek.batches?.[0]?.available_slots || 0)) *
                    (trek.price || 0)
                ).toLocaleString()}`,
                status: trek.status,
            })),
            recentBookings: recentBookings.map((booking) => ({
                id: booking.booking_id || booking.id,
                customerName: booking.customer?.name || "Unknown",
                trek: booking.trek?.title || "Unknown Trek",
                date: new Date(booking.created_at).toLocaleDateString(),
                amount: `₹${booking.total_amount?.toLocaleString() || 0}`,
                participants: 1, // Simplified for now
                status: booking.status,
            })),
            recentReviews: recentReviews.map((review) => ({
                id: review.id,
                customerName: review.customer?.name || "Unknown",
                trek: review.trek?.title || "Unknown Trek",
                date: new Date(review.created_at).toLocaleDateString(),
                rating: 5, // Default rating since we don't have direct rating association
                comment: review.content || "No comment",
            })),
            bookingStatusDistribution,
            revenueTrend: [], // Simplified for now
        };

        res.json({
            success: true,
            data: dashboardData,
        });
    } catch (error) {
        logger.error("general", "Error fetching vendor dashboard:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard data",
        });
    }
};

// Get vendor booking analytics
exports.getVendorBookingAnalytics = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { period = "month" } = req.query;

        if (!vendorId) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Vendor account required.",
            });
        }

        const now = new Date();
        let startDate, endDate;

        switch (period) {
            case "week":
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                endDate = now;
                break;
            case "month":
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = now;
                break;
            case "year":
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = now;
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = now;
        }

        const bookings = await Booking.findAll({
            where: {
                vendor_id: vendorId,
                created_at: {
                    [Op.between]: [startDate, endDate],
                },
            },
            include: [
                { model: Trek, as: "trek" },
                { model: Customer, as: "customer" },
            ],
        });

        const analytics = {
            totalBookings: bookings.length,
            totalRevenue: bookings.reduce(
                (sum, booking) => sum + (booking.total_amount || 0),
                0
            ),
            averageBookingValue:
                bookings.length > 0
                    ? bookings.reduce(
                          (sum, booking) => sum + (booking.total_amount || 0),
                          0
                      ) / bookings.length
                    : 0,
            statusDistribution: {},
            topTreks: {},
            topCustomers: {},
        };

        // Calculate status distribution
        bookings.forEach((booking) => {
            analytics.statusDistribution[booking.status] =
                (analytics.statusDistribution[booking.status] || 0) + 1;
        });

        // Calculate top treks
        bookings.forEach((booking) => {
            const trekName = booking.trek?.title || "Unknown";
            if (!analytics.topTreks[trekName]) {
                analytics.topTreks[trekName] = { count: 0, revenue: 0 };
            }
            analytics.topTreks[trekName].count++;
            analytics.topTreks[trekName].revenue += booking.total_amount || 0;
        });

        // Calculate top customers
        bookings.forEach((booking) => {
            const customerName = booking.customer?.name || "Unknown";
            if (!analytics.topCustomers[customerName]) {
                analytics.topCustomers[customerName] = { count: 0, revenue: 0 };
            }
            analytics.topCustomers[customerName].count++;
            analytics.topCustomers[customerName].revenue +=
                booking.total_amount || 0;
        });

        res.json({
            success: true,
            data: analytics,
        });
    } catch (error) {
        logger.error("general", "Error fetching booking analytics:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch booking analytics",
        });
    }
};
