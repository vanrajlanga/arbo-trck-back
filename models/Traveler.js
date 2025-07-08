module.exports = (sequelize, DataTypes) => {
    const Traveler = sequelize.define(
        "Traveler",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            customer_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: "customers", key: "id" },
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
                allowNull: true, // Optional, traveler might not have own phone
            },
            email: {
                type: DataTypes.STRING,
                allowNull: true,
                validate: {
                    isEmail: true,
                },
            },
            emergency_contact_name: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            emergency_contact_phone: {
                type: DataTypes.STRING(20),
                allowNull: false,
            },
            emergency_contact_relation: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            medical_conditions: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            dietary_restrictions: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            id_proof_type: {
                type: DataTypes.ENUM(
                    "passport",
                    "driving_license",
                    "aadhar",
                    "voter_id",
                    "other"
                ),
                allowNull: true,
            },
            id_proof_number: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
        },
        {
            tableName: "travelers",
            underscored: true,
        }
    );

    Traveler.associate = (models) => {
        Traveler.belongsTo(models.Customer, {
            foreignKey: "customer_id",
            as: "customer",
        });
        Traveler.hasMany(models.BookingTraveler, {
            foreignKey: "traveler_id",
            as: "bookingTravelers",
        });
    };

    return Traveler;
};
