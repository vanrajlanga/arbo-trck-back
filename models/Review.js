module.exports = (sequelize, DataTypes) => {
    const Review = sequelize.define(
        "Review",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            trek_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: "treks", key: "id" },
                comment: "Reference to the trek being reviewed",
            },
            customer_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: "customers", key: "id" },
                comment: "Reference to the customer who wrote the review",
            },
            booking_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: { model: "bookings", key: "id" },
                comment:
                    "Reference to the booking this review is for (optional)",
            },
            title: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: "Title of the review",
            },
            content: {
                type: DataTypes.TEXT,
                allowNull: false,
                comment: "The review content/text",
            },
            is_verified: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                comment: "Whether this review is from a verified booking",
            },
            is_approved: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                comment: "Whether this review has been approved by admin",
            },
            is_helpful: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "Number of people who found this review helpful",
            },
            status: {
                type: DataTypes.ENUM("pending", "approved", "rejected", "spam"),
                allowNull: false,
                defaultValue: "pending",
                comment: "Status of the review",
            },
        },
        {
            tableName: "reviews",
            underscored: true,
        }
    );

    Review.associate = (models) => {
        Review.belongsTo(models.Trek, {
            foreignKey: "trek_id",
            as: "trek",
        });
        Review.belongsTo(models.Customer, {
            foreignKey: "customer_id",
            as: "customer",
        });
        Review.belongsTo(models.Booking, {
            foreignKey: "booking_id",
            as: "booking",
        });
        Review.hasMany(models.Rating, {
            foreignKey: "review_id",
            as: "ratings",
        });
    };

    return Review;
};
