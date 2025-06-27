module.exports = (sequelize, DataTypes) => {
    const CouponAssignment = sequelize.define(
        "CouponAssignment",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            coupon_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: "coupons", key: "id" },
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: "users", key: "id" },
            },
            assigned_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            used_at: { type: DataTypes.DATE, allowNull: true },
        },
        {
            tableName: "coupon_assignments",
            underscored: true,
        }
    );

    CouponAssignment.associate = (models) => {
        CouponAssignment.belongsTo(models.Coupon, {
            foreignKey: "coupon_id",
            as: "coupon",
        });
        CouponAssignment.belongsTo(models.User, {
            foreignKey: "user_id",
            as: "user",
        });
        CouponAssignment.hasMany(models.Tracking, {
            foreignKey: "assignment_id",
            as: "tracking",
        });
    };

    return CouponAssignment;
};
