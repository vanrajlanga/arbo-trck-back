module.exports = (sequelize, DataTypes) => {
    const PickupPoint = sequelize.define(
        "PickupPoint",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            cityId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: "city_id",
                references: {
                    model: "cities",
                    key: "id",
                },
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            address: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            landmark: {
                type: DataTypes.STRING,
            },
            coordinates: {
                type: DataTypes.JSON, // {lat: number, lng: number}
                defaultValue: null,
            },
            contactPerson: {
                type: DataTypes.STRING,
                field: "contact_person",
            },
            contactPhone: {
                type: DataTypes.STRING,
                field: "contact_phone",
            },
            operatingHours: {
                type: DataTypes.STRING,
                field: "operating_hours",
                defaultValue: "24/7",
            },
            status: {
                type: DataTypes.ENUM("active", "inactive", "maintenance"),
                allowNull: false,
                defaultValue: "active",
            },
            isDefault: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                field: "is_default",
            },
            capacity: {
                type: DataTypes.INTEGER,
                defaultValue: 50,
            },
            facilities: {
                type: DataTypes.JSON, // ['parking', 'restroom', 'food', 'waiting_area']
                defaultValue: [],
            },
        },
        {
            tableName: "pickup_points",
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
            underscored: true,
        }
    );

    PickupPoint.associate = (models) => {
        PickupPoint.belongsTo(models.City, {
            foreignKey: "cityId",
            as: "city",
        });
    };

    return PickupPoint;
};
