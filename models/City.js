module.exports = (sequelize, DataTypes) => {
    const City = sequelize.define(
        "City",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            cityName: {
                type: DataTypes.STRING,
                allowNull: false,
                field: "city_name",
            },
            stateName: {
                type: DataTypes.STRING,
                allowNull: false,
                field: "state_name",
            },
            region: {
                type: DataTypes.ENUM(
                    "North",
                    "South",
                    "East",
                    "West",
                    "Central",
                    "North-East"
                ),
                allowNull: false,
                defaultValue: "North",
            },
            status: {
                type: DataTypes.ENUM("active", "planning", "suspended"),
                allowNull: false,
                defaultValue: "planning",
            },
            isPopular: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: "is_popular",
            },
            launchDate: {
                type: DataTypes.DATEONLY,
                field: "launch_date",
            },
            totalCustomers: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                field: "total_customers",
            },
            totalVendors: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                field: "total_vendors",
            },
            totalBookings: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                field: "total_bookings",
            },
            avgRating: {
                type: DataTypes.DECIMAL(3, 2),
                defaultValue: 0.0,
                field: "avg_rating",
            },
            popularTreks: {
                type: DataTypes.JSON,
                defaultValue: [],
                field: "popular_treks",
            },
        },
        {
            tableName: "cities",
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
            underscored: true,
        }
    );

    City.associate = (models) => {
        City.hasMany(models.PickupPoint, {
            foreignKey: "cityId",
            as: "pickupPoints",
        });
        City.hasMany(models.Mapping, {
            foreignKey: "cityId",
            as: "mappings",
        });
        City.hasMany(models.WeatherLog, {
            foreignKey: "cityId",
            as: "weatherLogs",
        });
    };

    return City;
};
