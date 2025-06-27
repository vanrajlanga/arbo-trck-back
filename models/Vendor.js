module.exports = (sequelize, DataTypes) => {
    const Vendor = sequelize.define(
        "Vendor",
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
            company_info: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            status: {
                type: DataTypes.ENUM("active", "inactive", "suspended"),
                defaultValue: "inactive",
            },
        },
        {
            tableName: "vendors",
            underscored: true,
        }
    );

    Vendor.associate = (models) => {
        Vendor.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
        Vendor.hasMany(models.Trek, { foreignKey: "vendor_id", as: "treks" });
    };

    return Vendor;
};
