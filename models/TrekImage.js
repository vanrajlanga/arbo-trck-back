module.exports = (sequelize, DataTypes) => {
    const TrekImage = sequelize.define(
        "TrekImage",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            trek_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: "treks", key: "id" },
            },
            url: { type: DataTypes.STRING, allowNull: false },
            caption: { type: DataTypes.STRING, allowNull: true },
        },
        {
            tableName: "trek_images",
            underscored: true,
        }
    );

    TrekImage.associate = (models) => {
        TrekImage.belongsTo(models.Trek, { foreignKey: "trek_id", as: "trek" });
    };

    return TrekImage;
};
