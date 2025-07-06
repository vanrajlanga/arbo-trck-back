module.exports = (sequelize, DataTypes) => {
    const Trek = sequelize.define(
        "Trek",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            vendor_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: "vendors", key: "id" },
            },
            destination_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: { model: "destinations", key: "id" },
            },
            city_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: { model: "cities", key: "id" },
            },
            duration: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            duration_days: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            duration_nights: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            difficulty: {
                type: DataTypes.ENUM(
                    "easy",
                    "moderate",
                    "difficult",
                    "extreme"
                ),
                defaultValue: "moderate",
            },
            trek_type: {
                type: DataTypes.ENUM(
                    "mountain",
                    "forest",
                    "desert",
                    "coastal",
                    "hill-station",
                    "adventure"
                ),
                allowNull: true,
            },
            category: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            base_price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true,
            },
            max_participants: {
                type: DataTypes.INTEGER,
                defaultValue: 20,
            },
            booked_slots: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            start_date: {
                type: DataTypes.DATEONLY,
                allowNull: true,
            },
            end_date: {
                type: DataTypes.DATEONLY,
                allowNull: true,
            },
            meeting_point: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            meeting_time: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            inclusions: {
                type: DataTypes.JSON,
                allowNull: true,
                get() {
                    const rawValue = this.getDataValue("inclusions");
                    if (!rawValue) return [];
                    if (Array.isArray(rawValue)) return rawValue;
                    if (typeof rawValue === "string") {
                        try {
                            const parsed = JSON.parse(rawValue);
                            return Array.isArray(parsed) ? parsed : [];
                        } catch (e) {
                            return [];
                        }
                    }
                    return [];
                },
            },
            exclusions: {
                type: DataTypes.JSON,
                allowNull: true,
                get() {
                    const rawValue = this.getDataValue("exclusions");
                    if (!rawValue) return [];
                    if (Array.isArray(rawValue)) return rawValue;
                    if (typeof rawValue === "string") {
                        try {
                            const parsed = JSON.parse(rawValue);
                            return Array.isArray(parsed) ? parsed : [];
                        } catch (e) {
                            return [];
                        }
                    }
                    return [];
                },
            },
            status: {
                type: DataTypes.ENUM("draft", "published", "archived"),
                defaultValue: "draft",
            },
            rating: {
                type: DataTypes.DECIMAL(3, 2),
                allowNull: true,
                defaultValue: 0.0,
                comment: "Average rating of the trek (0.00 to 5.00)",
            },
            discount_value: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 0.0,
                comment: "Discount amount or percentage value",
            },
            discount_type: {
                type: DataTypes.ENUM("percentage", "fixed"),
                allowNull: true,
                defaultValue: "percentage",
                comment: "Type of discount: percentage or fixed amount",
            },
            has_discount: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                comment: "Whether the trek has an active discount",
            },
            cancellation_policies: {
                type: DataTypes.JSON,
                allowNull: true,
                get() {
                    const rawValue = this.getDataValue("cancellation_policies");
                    if (!rawValue) return [];
                    if (Array.isArray(rawValue)) return rawValue;
                    if (typeof rawValue === "string") {
                        try {
                            const parsed = JSON.parse(rawValue);
                            return Array.isArray(parsed) ? parsed : [];
                        } catch (e) {
                            return [];
                        }
                    }
                    return [];
                },
                comment: "JSON array of cancellation policies - mandatory",
            },
            other_policies: {
                type: DataTypes.JSON,
                allowNull: true,
                get() {
                    const rawValue = this.getDataValue("other_policies");
                    if (!rawValue) return [];
                    if (Array.isArray(rawValue)) return rawValue;
                    if (typeof rawValue === "string") {
                        try {
                            const parsed = JSON.parse(rawValue);
                            return Array.isArray(parsed) ? parsed : [];
                        } catch (e) {
                            return [];
                        }
                    }
                    return [];
                },
                comment: "JSON array of other policies - optional",
            },
        },
        {
            tableName: "treks",
            underscored: true,
        }
    );

    Trek.associate = (models) => {
        Trek.belongsTo(models.Vendor, {
            foreignKey: "vendor_id",
            as: "vendor",
        });
        Trek.belongsTo(models.Destination, {
            foreignKey: "destination_id",
            as: "destinationData",
        });
        Trek.belongsTo(models.City, {
            foreignKey: "city_id",
            as: "city",
        });
        Trek.hasMany(models.Category, {
            foreignKey: "trek_id",
            as: "categories",
        });
        Trek.hasMany(models.Batch, { foreignKey: "trek_id", as: "batches" });
        Trek.hasMany(models.SafetyGuideline, {
            foreignKey: "trek_id",
            as: "safety_guidelines",
        });
        Trek.hasMany(models.ItineraryItem, {
            foreignKey: "trek_id",
            as: "itinerary_items",
        });
        Trek.hasMany(models.Accommodation, {
            foreignKey: "trek_id",
            as: "accommodations",
        });
        Trek.hasMany(models.TrekImage, { foreignKey: "trek_id", as: "images" });
        Trek.hasMany(models.TrekStage, {
            foreignKey: "trek_id",
            as: "trek_stages",
        });
        Trek.hasMany(models.Booking, { foreignKey: "trek_id", as: "bookings" });

        // Location-related associations
        Trek.hasMany(models.Mapping, {
            foreignKey: "trek_id",
            as: "mappings",
        });
        Trek.hasMany(models.WeatherLog, {
            foreignKey: "trek_id",
            as: "weather_logs",
        });
    };

    return Trek;
};
