module.exports = (sequelize, DataTypes) => {
    const Customer = sequelize.define(
        "Customer",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: true,
                unique: true,
                validate: {
                    isEmail: true,
                },
            },
            phone: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            firebase_uid: {
                type: DataTypes.STRING,
                allowNull: true,
                unique: true,
            },
            date_of_birth: {
                type: DataTypes.DATEONLY,
                allowNull: true,
            },
            emergency_contact: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            verification_status: {
                type: DataTypes.ENUM("pending", "verified"),
                defaultValue: "pending",
            },
            profile_completed: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            last_login: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            status: {
                type: DataTypes.ENUM("active", "inactive"),
                defaultValue: "active",
            },
            city_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: "cities",
                    key: "id",
                },
            },
            state_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: "states",
                    key: "id",
                },
            },
        },
        {
            tableName: "customers",
            underscored: true,
        }
    );

    Customer.associate = (models) => {
        Customer.hasMany(models.Booking, {
            foreignKey: "customer_id",
            as: "bookings",
        });
        Customer.hasMany(models.Traveler, {
            foreignKey: "customer_id",
            as: "travelers",
        });
        Customer.belongsTo(models.City, {
            foreignKey: "city_id",
            as: "city",
        });
        Customer.belongsTo(models.State, {
            foreignKey: "state_id",
            as: "state",
        });
    };

    return Customer;
};
