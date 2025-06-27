module.exports = (sequelize, DataTypes) => {
    const Coupon = sequelize.define(
        "Coupon",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            code: { type: DataTypes.STRING, allowNull: false },
            discount_type: {
                type: DataTypes.ENUM("percentage", "fixed"),
                allowNull: false,
            },
            discount_value: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            min_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
            max_uses: { type: DataTypes.INTEGER, allowNull: true },
            current_uses: { type: DataTypes.INTEGER, defaultValue: 0 },
            valid_from: { type: DataTypes.DATE, allowNull: false },
            valid_until: { type: DataTypes.DATE, allowNull: false },
            status: {
                type: DataTypes.ENUM("active", "inactive", "expired"),
                defaultValue: "active",
            },
        },
        {
            tableName: "coupons",
            underscored: true,
        }
    );

    Coupon.associate = (models) => {
        Coupon.belongsToMany(models.User, {
            through: models.CouponAssignment,
            foreignKey: "coupon_id",
            otherKey: "user_id",
            as: "users",
        });
    };

    return Coupon;
};
