"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("treks", "trek_type", {
            type: Sequelize.ENUM(
                "mountain",
                "forest",
                "desert",
                "coastal",
                "hill-station",
                "adventure"
            ),
            allowNull: true,
        });

        await queryInterface.addColumn("treks", "category", {
            type: Sequelize.STRING,
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn("treks", "trek_type");
        await queryInterface.removeColumn("treks", "category");
    },
};
