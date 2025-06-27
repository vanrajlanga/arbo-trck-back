"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            // 1. Create customers table
            await queryInterface.createTable(
                "customers",
                {
                    id: {
                        type: Sequelize.INTEGER,
                        primaryKey: true,
                        autoIncrement: true,
                    },
                    phone: {
                        type: Sequelize.STRING(20),
                        allowNull: false,
                        unique: true,
                    },
                    name: {
                        type: Sequelize.STRING,
                        allowNull: true,
                    },
                    email: {
                        type: Sequelize.STRING,
                        allowNull: true,
                    },
                    status: {
                        type: Sequelize.ENUM("active", "inactive", "blocked"),
                        defaultValue: "active",
                    },
                    verification_status: {
                        type: Sequelize.ENUM("pending", "verified"),
                        defaultValue: "pending",
                    },
                    last_login: {
                        type: Sequelize.DATE,
                        allowNull: true,
                    },
                    profile_completed: {
                        type: Sequelize.BOOLEAN,
                        defaultValue: false,
                    },
                    created_at: {
                        type: Sequelize.DATE,
                        allowNull: false,
                    },
                    updated_at: {
                        type: Sequelize.DATE,
                        allowNull: false,
                    },
                },
                { transaction }
            );

            // 2. Create travelers table
            await queryInterface.createTable(
                "travelers",
                {
                    id: {
                        type: Sequelize.INTEGER,
                        primaryKey: true,
                        autoIncrement: true,
                    },
                    customer_id: {
                        type: Sequelize.INTEGER,
                        allowNull: false,
                        references: { model: "customers", key: "id" },
                        onDelete: "CASCADE",
                    },
                    name: {
                        type: Sequelize.STRING(100),
                        allowNull: false,
                    },
                    age: {
                        type: Sequelize.INTEGER,
                        allowNull: false,
                    },
                    gender: {
                        type: Sequelize.ENUM("male", "female", "other"),
                        allowNull: false,
                    },
                    phone: {
                        type: Sequelize.STRING(20),
                        allowNull: true,
                    },
                    email: {
                        type: Sequelize.STRING,
                        allowNull: true,
                    },
                    emergency_contact_name: {
                        type: Sequelize.STRING(100),
                        allowNull: false,
                    },
                    emergency_contact_phone: {
                        type: Sequelize.STRING(20),
                        allowNull: false,
                    },
                    emergency_contact_relation: {
                        type: Sequelize.STRING(50),
                        allowNull: true,
                    },
                    medical_conditions: {
                        type: Sequelize.TEXT,
                        allowNull: true,
                    },
                    dietary_restrictions: {
                        type: Sequelize.TEXT,
                        allowNull: true,
                    },
                    id_proof_type: {
                        type: Sequelize.ENUM(
                            "passport",
                            "driving_license",
                            "aadhar",
                            "voter_id",
                            "other"
                        ),
                        allowNull: true,
                    },
                    id_proof_number: {
                        type: Sequelize.STRING(50),
                        allowNull: true,
                    },
                    is_active: {
                        type: Sequelize.BOOLEAN,
                        defaultValue: true,
                    },
                    created_at: {
                        type: Sequelize.DATE,
                        allowNull: false,
                    },
                    updated_at: {
                        type: Sequelize.DATE,
                        allowNull: false,
                    },
                },
                { transaction }
            );

            // 3. Create booking_travelers table
            await queryInterface.createTable(
                "booking_travelers",
                {
                    id: {
                        type: Sequelize.INTEGER,
                        primaryKey: true,
                        autoIncrement: true,
                    },
                    booking_id: {
                        type: Sequelize.INTEGER,
                        allowNull: false,
                        references: { model: "bookings", key: "id" },
                        onDelete: "CASCADE",
                    },
                    traveler_id: {
                        type: Sequelize.INTEGER,
                        allowNull: false,
                        references: { model: "travelers", key: "id" },
                        onDelete: "CASCADE",
                    },
                    is_primary: {
                        type: Sequelize.BOOLEAN,
                        defaultValue: false,
                    },
                    special_requirements: {
                        type: Sequelize.TEXT,
                        allowNull: true,
                    },
                    accommodation_preference: {
                        type: Sequelize.ENUM(
                            "single",
                            "shared",
                            "family",
                            "any"
                        ),
                        defaultValue: "any",
                    },
                    meal_preference: {
                        type: Sequelize.ENUM("veg", "non_veg", "vegan", "jain"),
                        defaultValue: "veg",
                    },
                    status: {
                        type: Sequelize.ENUM(
                            "confirmed",
                            "cancelled",
                            "no_show"
                        ),
                        defaultValue: "confirmed",
                    },
                    created_at: {
                        type: Sequelize.DATE,
                        allowNull: false,
                    },
                    updated_at: {
                        type: Sequelize.DATE,
                        allowNull: false,
                    },
                },
                { transaction }
            );

            // 4. Add unique constraint for booking_travelers
            await queryInterface.addIndex(
                "booking_travelers",
                ["booking_id", "traveler_id"],
                {
                    unique: true,
                    name: "unique_booking_traveler",
                    transaction,
                }
            );

            // 5. Add customer_id to bookings table
            await queryInterface.addColumn(
                "bookings",
                "customer_id",
                {
                    type: Sequelize.INTEGER,
                    allowNull: true, // Initially nullable for migration
                    references: { model: "customers", key: "id" },
                },
                { transaction }
            );

            // 6. Rename total_participants to total_travelers in bookings
            await queryInterface.renameColumn(
                "bookings",
                "total_participants",
                "total_travelers",
                { transaction }
            );

            // 7. Add new columns to bookings
            await queryInterface.addColumn(
                "bookings",
                "booking_source",
                {
                    type: Sequelize.ENUM("web", "mobile", "phone", "walk_in"),
                    defaultValue: "web",
                },
                { transaction }
            );

            await queryInterface.addColumn(
                "bookings",
                "primary_contact_traveler_id",
                {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                    references: { model: "travelers", key: "id" },
                },
                { transaction }
            );

            // 8. Update payment_status enum to include 'partial'
            await queryInterface.changeColumn(
                "bookings",
                "payment_status",
                {
                    type: Sequelize.ENUM(
                        "pending",
                        "partial",
                        "completed",
                        "failed",
                        "refunded"
                    ),
                    defaultValue: "pending",
                },
                { transaction }
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    async down(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            // Reverse all changes
            await queryInterface.removeColumn(
                "bookings",
                "primary_contact_traveler_id",
                { transaction }
            );
            await queryInterface.removeColumn("bookings", "booking_source", {
                transaction,
            });
            await queryInterface.renameColumn(
                "bookings",
                "total_travelers",
                "total_participants",
                { transaction }
            );
            await queryInterface.removeColumn("bookings", "customer_id", {
                transaction,
            });

            await queryInterface.dropTable("booking_travelers", {
                transaction,
            });
            await queryInterface.dropTable("travelers", { transaction });
            await queryInterface.dropTable("customers", { transaction });

            // Restore original payment_status enum
            await queryInterface.changeColumn(
                "bookings",
                "payment_status",
                {
                    type: Sequelize.ENUM(
                        "pending",
                        "completed",
                        "failed",
                        "refunded"
                    ),
                    defaultValue: "pending",
                },
                { transaction }
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },
};
