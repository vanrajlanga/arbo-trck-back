module.exports = (sequelize, DataTypes) => {
    const Batch = sequelize.define(
        "Batch",
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
            start_date: { type: DataTypes.DATEONLY, allowNull: false },
            end_date: { type: DataTypes.DATEONLY, allowNull: false },
            capacity: { type: DataTypes.INTEGER, allowNull: false },
            booked_slots: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "Number of slots already booked for this batch",
            },
            available_slots: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "Number of slots available for booking in this batch",
            },
        },
        {
            tableName: "batches",
            underscored: true,
        }
    );

    Batch.associate = (models) => {
        Batch.belongsTo(models.Trek, { foreignKey: "trek_id", as: "trek" });
    };

    return Batch;
};
