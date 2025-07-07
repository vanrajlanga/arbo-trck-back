module.exports = (sequelize, DataTypes) => {
    const Rating = sequelize.define(
        "Rating",
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
                comment: "Reference to the trek being rated",
            },
            customer_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: "customers", key: "id" },
                comment: "Reference to the customer who gave the rating",
            },
            booking_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: { model: "bookings", key: "id" },
                comment:
                    "Reference to the booking this rating is for (optional)",
            },
            category_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: "rating_categories", key: "id" },
                comment: "Reference to the rating category",
            },
            rating_value: {
                type: DataTypes.DECIMAL(3, 2),
                allowNull: false,
                validate: {
                    min: 0,
                    max: 5,
                },
                comment: "Rating value for this category (0.00 to 5.00)",
            },
            comment: {
                type: DataTypes.TEXT,
                allowNull: true,
                comment: "Optional comment for this specific rating category",
            },
            is_verified: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                comment: "Whether this rating is from a verified booking",
            },
        },
        {
            tableName: "ratings",
            underscored: true,
        }
    );

    Rating.associate = (models) => {
        Rating.belongsTo(models.Trek, {
            foreignKey: "trek_id",
            as: "trek",
        });
        Rating.belongsTo(models.Customer, {
            foreignKey: "customer_id",
            as: "customer",
        });
        Rating.belongsTo(models.Booking, {
            foreignKey: "booking_id",
            as: "booking",
        });
        Rating.belongsTo(models.RatingCategory, {
            foreignKey: "category_id",
            as: "category",
        });
    };

    return Rating;
};
