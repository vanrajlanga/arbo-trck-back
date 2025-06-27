module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define(
        "User",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    isEmail: true,
                },
            },
            phone: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            passwordHash: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            roleId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM("active", "inactive", "locked"),
                defaultValue: "active",
            },
        },
        {
            tableName: "users",
            underscored: true,
        }
    );

    User.associate = (models) => {
        User.belongsTo(models.Role, { foreignKey: "roleId", as: "role" });
        User.hasMany(models.Booking, { foreignKey: "user_id", as: "bookings" });
        User.hasOne(models.Vendor, { foreignKey: "user_id", as: "vendor" });
    };

    return User;
};
