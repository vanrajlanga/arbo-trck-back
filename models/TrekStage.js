module.exports = (sequelize, DataTypes) => {
    const TrekStage = sequelize.define(
        "TrekStage",
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
            stage_number: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            distance: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            duration: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            tableName: "trek_stages",
            underscored: true,
        }
    );

    TrekStage.associate = (models) => {
        TrekStage.belongsTo(models.Trek, {
            foreignKey: "trek_id",
            as: "trek",
        });
    };

    return TrekStage;
};
