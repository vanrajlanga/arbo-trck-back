module.exports = (sequelize, DataTypes) => {
    const Booking = sequelize.define(
        "Booking",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: "users", key: "id" },
            },
            trek_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: "treks", key: "id" },
            },
            vendor_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: "vendors", key: "id" },
            },
            batch_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: { model: "batches", key: "id" },
            },
            pickup_point_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: { model: "pickup_points", key: "id" },
            },
            coupon_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: { model: "coupons", key: "id" },
            },
            total_participants: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1,
            },
            total_amount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            discount_amount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0.0,
            },
            final_amount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            payment_status: {
                type: DataTypes.ENUM(
                    "pending",
                    "completed",
                    "failed",
                    "refunded"
                ),
                defaultValue: "pending",
            },
            status: {
                type: DataTypes.ENUM(
                    "pending",
                    "confirmed",
                    "cancelled",
                    "completed"
                ),
                defaultValue: "pending",
            },
            booking_date: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
            special_requests: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        },
        {
            tableName: "bookings",
            underscored: true,
        }
    );

    Booking.associate = (models) => {
        Booking.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
        Booking.belongsTo(models.Trek, { foreignKey: "trek_id", as: "trek" });
        Booking.belongsTo(models.Vendor, {
            foreignKey: "vendor_id",
            as: "vendor",
        });
        Booking.belongsTo(models.Batch, {
            foreignKey: "batch_id",
            as: "batch",
        });
        Booking.belongsTo(models.PickupPoint, {
            foreignKey: "pickup_point_id",
            as: "pickupPoint",
        });
        Booking.belongsTo(models.Coupon, {
            foreignKey: "coupon_id",
            as: "coupon",
        });
        Booking.hasMany(models.BookingParticipant, {
            foreignKey: "booking_id",
            as: "participants",
        });
        Booking.hasMany(models.PaymentLog, {
            foreignKey: "booking_id",
            as: "payments",
        });
        Booking.hasMany(models.Adjustment, {
            foreignKey: "booking_id",
            as: "adjustments",
        });
        Booking.hasOne(models.Cancellation, {
            foreignKey: "booking_id",
            as: "cancellation",
        });
    };

    return Booking;
};
