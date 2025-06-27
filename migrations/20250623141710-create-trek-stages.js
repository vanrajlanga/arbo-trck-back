"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("trek_stages", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            trek_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "treks",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            stage_number: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            distance: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            duration: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("trek_stages");
    },
};
