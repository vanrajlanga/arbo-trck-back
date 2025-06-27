module.exports = (sequelize, DataTypes) => {
    const BookingParticipant = sequelize.define(
        "BookingParticipant",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            booking_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: "bookings", key: "id" },
            },
            name: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            age: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: { min: 1, max: 120 },
            },
            gender: {
                type: DataTypes.ENUM("male", "female", "other"),
                allowNull: false,
            },
            phone: {
                type: DataTypes.STRING(20),
                allowNull: false,
            },
            emergency_contact: {
                type: DataTypes.STRING(20),
                allowNull: false,
            },
            medical_conditions: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        },
        {
            tableName: "booking_participants",
            underscored: true,
        }
    );

    BookingParticipant.associate = (models) => {
        BookingParticipant.belongsTo(models.Booking, {
            foreignKey: "booking_id",
            as: "booking",
        });
    };

    return BookingParticipant;
};
