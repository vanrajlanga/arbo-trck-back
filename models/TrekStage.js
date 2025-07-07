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
            stage_name: {
                type: DataTypes.STRING,
                allowNull: false,
                comment: "Name of the trek stage",
            },
            means_of_transport: {
                type: DataTypes.STRING,
                allowNull: true,
                comment:
                    "Means of transport for this trek stage (e.g., walking, bus, train, flight, etc.)",
            },
            date_time: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: "Date and time for the stage",
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
