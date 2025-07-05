module.exports = (sequelize, DataTypes) => {
    const Destination = sequelize.define(
        "Destination",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
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
            state: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            altitude: {
                type: DataTypes.INTEGER,
                allowNull: true,
                comment: "Altitude in meters",
            },
            bestTimeToVisit: {
                type: DataTypes.JSON,
                allowNull: true,
                field: "best_time_to_visit",
                comment: "Array of months when it's best to visit",
            },
            difficulty: {
                type: DataTypes.ENUM(
                    "easy",
                    "moderate",
                    "difficult",
                    "extreme"
                ),
                allowNull: true,
                defaultValue: "moderate",
            },
            trekType: {
                type: DataTypes.ENUM(
                    "mountain",
                    "forest",
                    "desert",
                    "coastal",
                    "hill-station",
                    "adventure"
                ),
                allowNull: true,
                field: "trek_type",
            },
            isPopular: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: "is_popular",
            },
            status: {
                type: DataTypes.ENUM("active", "inactive", "planning"),
                allowNull: false,
                defaultValue: "active",
            },
            totalTreks: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                field: "total_treks",
            },
            avgRating: {
                type: DataTypes.DECIMAL(3, 2),
                defaultValue: 0.0,
                field: "avg_rating",
            },
            imageUrl: {
                type: DataTypes.STRING,
                allowNull: true,
                field: "image_url",
            },
            coordinates: {
                type: DataTypes.JSON,
                allowNull: true,
                comment: "Latitude and longitude coordinates",
            },
        },
        {
            tableName: "destinations",
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
            underscored: true,
        }
    );

    Destination.associate = (models) => {
        Destination.hasMany(models.Trek, {
            foreignKey: "destination_id",
            as: "treks",
        });
    };

    return Destination;
};
