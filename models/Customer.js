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
            otp: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            otp_expires_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            otp_attempts: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
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
    };

    return Customer;
}; 